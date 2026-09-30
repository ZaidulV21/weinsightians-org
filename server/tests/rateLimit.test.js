import './setup.js';
import test from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';

import app from '../app.js';
import Blog from '../models/Blog.js';
import User from '../models/User.js';
import { createJWT } from '../utils/tokenUtils.js';

// The login limiter is only skipped when RATE_LIMIT_DISABLED is set, so these
// tests exercise the real limiters rather than a mock.

const ADMIN_ID = new mongoose.Types.ObjectId();
const BLOG_ID = String(new mongoose.Types.ObjectId());
const PASSWORD = 'correct horse battery staple';
const PASSWORD_HASH = bcrypt.hashSync(PASSWORD, 10);
const ADMIN_TOKEN = createJWT({ userId: String(ADMIN_ID), role: 'admin', tokenVersion: 0 });

const chain = (result) => {
  const q = { select: () => q, sort: () => q, skip: () => q, limit: () => q, lean: async () => result };
  q.then = (resolve, reject) => Promise.resolve(result).then(resolve, reject);
  return q;
};

const asAdmin = (req, ip) =>
  req
    .set('X-Forwarded-For', ip)
    .set('Cookie', [`token=${ADMIN_TOKEN}`]);

// A valid admin session, with a database that reports the post as missing: the
// limiter runs before the controller, so a throttled request is refused no matter
// what the database would have said.
const session = () => {
  const originalFindById = User.findById;
  const originalBlogFind = Blog.findById;
  User.findById = () => chain({ _id: ADMIN_ID, role: 'admin', tokenVersion: 0 });
  Blog.findById = () => chain(null);

  return {
    restore: () => {
      User.findById = originalFindById;
      Blog.findById = originalBlogFind;
    },
  };
};

const login = (ip, email = 'admin@example.com', password = 'wrong-password') =>
  request(app).post('/api/v1/auth/login').set('X-Forwarded-For', ip).send({ email, password });

const stubLoginAccount = (found) => {
  const original = User.findOne;
  User.findOne = () =>
    chain(found ? { _id: ADMIN_ID, name: 'Admin', email: 'admin@example.com', role: 'admin', password: PASSWORD_HASH } : null);
  return {
    restore: () => {
      User.findOne = original;
    },
  };
};

// ==========================================
// LOGIN BRUTE FORCE
// ==========================================

test('failed logins are throttled after 20 attempts from one IP', async () => {
  const account = stubLoginAccount(false);
  try {
    const statuses = [];
    for (let attempt = 1; attempt <= 21; attempt += 1) {
      const res = await login('10.0.0.1');
      statuses.push(res.status);
      if (attempt === 21) {
        assert.equal(res.status, 429, 'the 21st attempt is refused');
        assert.equal(res.body.success, false);
        assert.ok(res.body.msg, 'a readable message is returned');
        assert.ok(res.headers['ratelimit'] || res.headers['ratelimit-remaining'] || res.headers['retry-after']);
      }
    }

    assert.deepEqual(statuses.slice(0, 20), Array(20).fill(401), 'the first twenty are normal failures');
    assert.equal(statuses[20], 429);
  } finally {
    account.restore();
  }
});

test('the limit is keyed on the account as well as the IP', async () => {
  const account = stubLoginAccount(false);
  try {
    for (let attempt = 1; attempt <= 20; attempt += 1) {
      await login('10.0.0.2', 'first@example.com');
    }
    const throttled = await login('10.0.0.2', 'first@example.com');
    assert.equal(throttled.status, 429);

    // A different account from the same IP is a different key and stays usable.
    const other = await login('10.0.0.2', 'second@example.com');
    assert.equal(other.status, 401);

    // A different IP hammering the same account is a different key too, so one
    // attacker cannot lock the real admin out of their own panel.
    const elsewhere = await login('10.0.0.3', 'first@example.com');
    assert.equal(elsewhere.status, 401);
  } finally {
    account.restore();
  }
});

test('a successful login does not count against the limit', async () => {
  const account = stubLoginAccount(true);
  try {
    // Nineteen typos, then a correct password: the admin is still let in.
    for (let attempt = 1; attempt <= 19; attempt += 1) {
      await login('10.0.0.4', 'admin@example.com', 'wrong-password');
    }

    const success = await login('10.0.0.4', 'admin@example.com', PASSWORD);
    assert.equal(success.status, 200, 'a real admin is not locked out by earlier typos');
    assert.ok(success.headers['set-cookie']);

    // The success was not counted, so one more typo is still allowed...
    const stillFine = await login('10.0.0.4', 'admin@example.com', 'wrong-password');
    assert.equal(stillFine.status, 401);

    // ...and the twenty-first failure is where it stops.
    await login('10.0.0.4', 'admin@example.com', 'wrong-password');
    const throttled = await login('10.0.0.4', 'admin@example.com', 'wrong-password');
    assert.equal(throttled.status, 429);
  } finally {
    account.restore();
  }
});

// ==========================================
// BOOTSTRAP
// ==========================================

test('the one-time admin bootstrap is rate limited', async () => {
  const original = User.findOne;
  User.findOne = () => chain({ _id: ADMIN_ID });
  try {
    const statuses = [];
    for (let attempt = 1; attempt <= 6; attempt += 1) {
      const res = await request(app)
        .post('/api/v1/auth/bootstrap')
        .set('X-Forwarded-For', '10.0.1.1')
        .send({ name: 'Admin', email: 'admin@example.com', password: 'whatever12345' });
      statuses.push(res.status);
    }

    assert.deepEqual(statuses.slice(0, 5), Array(5).fill(403), 'closed after the first admin');
    assert.equal(statuses[5], 429, 'and then throttled so it cannot be probed');
  } finally {
    User.findOne = original;
  }
});

// ==========================================
// CONTENT WRITES
// ==========================================

test('a runaway client cannot hammer the write endpoints forever', async () => {
  const account = session();

  try {
    const statuses = [];
    for (let attempt = 1; attempt <= 61; attempt += 1) {
      const res = await asAdmin(
        request(app).patch(`/api/v1/blogs/${BLOG_ID}`).field('title', 'Still Editing'),
        '10.0.2.1'
      );
      statuses.push(res.status);
      if (attempt === 61) {
        assert.equal(res.status, 429);
        assert.equal(res.body.success, false);
      }
    }

    assert.deepEqual(statuses.slice(0, 60), Array(60).fill(404), 'writes proceed normally');
  } finally {
    account.restore();
  }
});
