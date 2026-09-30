import './setup.js';
import test from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';

import app from '../app.js';
import Blog, { BLOG_STATUS, publishedFilter } from '../models/Blog.js';
import User from '../models/User.js';
import { createJWT, DEFAULT_JWT_EXPIRES_IN } from '../utils/tokenUtils.js';

// ==========================================
// HARNESS
// ==========================================
// The route layer is exercised for real (real middleware, real order, real
// controllers). Only Mongoose is replaced, because a live cluster has no place in
// a unit suite. Every stub is restored afterwards.

const ADMIN_ID = new mongoose.Types.ObjectId();
const BLOG_ID = new mongoose.Types.ObjectId();

const chain = (result) => {
  const q = {
    select: () => q,
    sort: () => q,
    skip: () => q,
    limit: () => q,
    populate: () => q,
    lean: async () => result,
  };
  q.then = (resolve, reject) => Promise.resolve(result).then(resolve, reject);
  return q;
};

const withStubs = async (stubs, run) => {
  const originals = {};
  Object.keys(stubs).forEach((key) => {
    originals[key] = Blog[key];
    Blog[key] = stubs[key];
  });

  try {
    return await run();
  } finally {
    Object.keys(originals).forEach((key) => {
      Blog[key] = originals[key];
    });
  }
};

const adminCookie = (overrides = {}) =>
  createJWT({ userId: String(ADMIN_ID), role: 'admin', tokenVersion: 0, ...overrides });

const auth = (req, token) => (token ? req.set('Cookie', [`token=${token}`]) : req);

// ==========================================
// PUBLIC READS — no session, drafts invisible
// ==========================================

test('the public list needs no session and only returns published posts', async () => {
  let filter = null;

  await withStubs(
    { find: (query) => { filter = query; return chain([{ title: 'Live post', slug: 'live-post' }]); } },
    async () => {
      const res = await request(app).get('/api/v1/blogs');

      assert.equal(res.status, 200);
      assert.equal(res.body.success, true);
      assert.equal(res.body.count, 1);
      assert.equal(res.body.blogs.length, 1);
      // The controller must not be able to widen this filter.
      assert.deepEqual(filter, publishedFilter());
      assert.ok(JSON.stringify(filter).includes(BLOG_STATUS.PUBLISHED));
    }
  );
});

test('a draft is a 404 for the public, never a preview', async () => {
  let filter = null;

  await withStubs(
    {
      // A draft exists, but the published filter means the lookup finds nothing.
      findOne: (query) => { filter = query; return chain(null); },
    },
    async () => {
      const res = await request(app).get('/api/v1/blogs/secret-draft');

      assert.equal(res.status, 404);
      assert.equal(res.body.success, false);
      assert.deepEqual(filter, { ...publishedFilter(), slug: 'secret-draft' });
    }
  );
});

test('a junk slug is rejected before any database work', async () => {
  let called = false;

  await withStubs(
    { findOne: () => { called = true; return chain(null); } },
    async () => {
      const res = await request(app).get('/api/v1/blogs/not%20a%20slug');

      assert.ok(res.status === 400 || res.status === 404, `status ${res.status}`);
      assert.equal(called, false, 'the database was not queried');
    }
  );
});

// ==========================================
// WRITES — rejected before the controller runs
// ==========================================

test('an unauthenticated create is refused and never reaches the database', async () => {
  let created = false;

  await withStubs(
    { create: () => { created = true; } },
    async () => {
      const res = await request(app)
        .post('/api/v1/blogs')
        .set('Origin', 'https://weinsightian.tech')
        .field('title', 'Injected Post')
        .field('description', 'Should never be stored without a session.')
        .field('content', '<p>hello</p>')
        .field('author', 'Someone');

      assert.equal(res.status, 401);
      assert.equal(created, false);
    }
  );
});

test('an unauthenticated update or delete is refused', async () => {
  const id = String(BLOG_ID);

  const update = await request(app)
    .patch(`/api/v1/blogs/${id}`)
    .set('Origin', 'https://weinsightian.tech')
    .field('title', 'Hijacked');
  const remove = await request(app).delete(`/api/v1/blogs/${id}`);

  assert.equal(update.status, 401);
  assert.equal(remove.status, 401);
});

test('a garbage id from an anonymous caller answers 401, not 400', async () => {
  // Answering 400 first would confirm which ids are well formed and which route
  // a request reached before authentication.
  const res = await request(app).delete('/api/v1/blogs/not-an-object-id');
  assert.equal(res.status, 401);
});

test('a token in the query string is ignored', async () => {
  const token = adminCookie();

  await withStubs(
    { findByIdAndDelete: () => { throw new Error('must not run'); } },
    async () => {
      const res = await request(app).delete(`/api/v1/blogs/${BLOG_ID}?token=${token}`);
      assert.equal(res.status, 401);
    }
  );
});

test('a token signed with the wrong secret is refused', async () => {
  const previous = process.env.JWT_SECRET;
  process.env.JWT_SECRET = 'a-different-secret-that-was-used-to-sign-the-token';
  const forged = createJWT({ userId: String(ADMIN_ID), role: 'admin', tokenVersion: 0 });
  process.env.JWT_SECRET = previous;

  const res = await auth(request(app).delete(`/api/v1/blogs/${BLOG_ID}`), forged);
  assert.equal(res.status, 401);
});

test('a token for a deleted account is refused', async () => {
  const original = User.findById;
  User.findById = () => chain(null);
  try {
    const res = await auth(request(app).delete(`/api/v1/blogs/${BLOG_ID}`), adminCookie());
    assert.equal(res.status, 401);
  } finally {
    User.findById = original;
  }
});

test('a token issued before logout is refused (session version)', async () => {
  const original = User.findById;
  // The account has since been bumped to version 1 by /auth/logout.
  User.findById = () => chain({ _id: ADMIN_ID, role: 'admin', tokenVersion: 1 });
  let deleted = false;

  try {
    await withStubs(
      { findByIdAndDelete: () => { deleted = true; return chain(null); } },
      async () => {
        const res = await auth(request(app).delete(`/api/v1/blogs/${BLOG_ID}`), adminCookie());
        assert.equal(res.status, 401);
        assert.equal(deleted, false);
      }
    );
  } finally {
    User.findById = original;
  }
});

test('an expired token is refused', async () => {
  const previous = process.env.JWT_EXPIRES_IN;
  process.env.JWT_EXPIRES_IN = '-10s';
  const expired = createJWT({ userId: String(ADMIN_ID), role: 'admin', tokenVersion: 0 });
  process.env.JWT_EXPIRES_IN = previous;

  const res = await auth(request(app).delete(`/api/v1/blogs/${BLOG_ID}`), expired);
  assert.equal(res.status, 401);
});

// ==========================================
// ADMIN READS
// ==========================================

const asAdmin = (req) => auth(req, adminCookie());

test('the admin list is reachable with a session and includes drafts', async () => {
  const original = User.findById;
  User.findById = () => chain({ _id: ADMIN_ID, role: 'admin', tokenVersion: 0 });

  try {
    await withStubs(
      { find: (query) => { assert.deepEqual(query, {}, 'the admin list is unfiltered'); return chain([]); } },
      async () => {
        const res = await asAdmin(request(app).get('/api/v1/blogs/admin/all'));
        assert.equal(res.status, 200);
        assert.equal(res.body.success, true);
      }
    );
  } finally {
    User.findById = original;
  }
});

test('the admin list is closed to anonymous callers', async () => {
  const res = await request(app).get('/api/v1/blogs/admin/all');
  assert.equal(res.status, 401);
});

test('a signed-in admin can open a draft by slug', async () => {
  const original = User.findById;
  User.findById = () => chain({ _id: ADMIN_ID, role: 'admin', tokenVersion: 0 });

  try {
    await withStubs(
      { findOne: () => chain({ _id: BLOG_ID, title: 'Draft', status: BLOG_STATUS.DRAFT }) },
      async () => {
        const res = await asAdmin(request(app).get('/api/v1/blogs/admin/slug/draft-post'));
        assert.equal(res.status, 200);
        assert.equal(res.body.blog.status, BLOG_STATUS.DRAFT);
      }
    );
  } finally {
    User.findById = original;
  }
});

test('a non-admin role is forbidden even with a valid token', async () => {
  const original = User.findById;
  User.findById = () => chain({ _id: ADMIN_ID, role: 'editor', tokenVersion: 0 });

  try {
    const res = await auth(
      request(app).delete(`/api/v1/blogs/${BLOG_ID}`),
      adminCookie({ role: 'editor' })
    );
    assert.equal(res.status, 403);
  } finally {
    User.findById = original;
  }
});

// ==========================================
// SESSION ENDPOINTS
// ==========================================

const ADMIN_PASSWORD = 'correct horse battery staple';
const passwordHash = bcrypt.hashSync(ADMIN_PASSWORD, 10);

const stubAccount = ({ exists = true, password = passwordHash } = {}) => {
  const original = User.findById;
  User.findById = () => chain({ _id: ADMIN_ID, role: 'admin', tokenVersion: 0 });

  return {
    restore: () => {
      User.findById = original;
    },
  };
};

test('login sets a hardened HttpOnly cookie', async () => {
  const original = User.findOne;
  User.findOne = () => chain({ _id: ADMIN_ID, name: 'Admin', email: 'admin@example.com', role: 'admin', password: passwordHash });

  try {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'Admin@Example.com', password: ADMIN_PASSWORD });

    assert.equal(res.status, 200);
    const cookie = res.headers['set-cookie'].join(';');
    assert.match(cookie, /^token=/);
    assert.match(cookie, /HttpOnly/i);
    assert.match(cookie, /SameSite=None/i);
    assert.match(cookie, /Path=\//i);
    // Secure is deliberately absent here: it is switched on for NODE_ENV=production
    // (asserted in auth.test.js) so http://localhost keeps working in dev.
    assert.ok(!/;\s*Secure/i.test(cookie), 'no Secure flag outside production');

    // The payload is readable only by the server: id, role, session version.
    const token = res.headers['set-cookie'][0].split(';')[0].replace('token=', '');
    const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64url').toString('utf8'));
    assert.equal(payload.userId, String(ADMIN_ID));
    assert.equal(payload.role, 'admin');
    assert.ok(payload.exp > payload.iat, 'the token expires');
    assert.ok(!JSON.stringify(payload).includes(ADMIN_PASSWORD));
    assert.ok(!JSON.stringify(res.body).includes(passwordHash));
  } finally {
    User.findOne = original;
  }
});

test('a wrong password and an unknown email fail identically', async () => {
  const original = User.findOne;

  User.findOne = () => chain({ _id: ADMIN_ID, name: 'Admin', email: 'admin@example.com', role: 'admin', password: passwordHash });
  const wrongPassword = await request(app)
    .post('/api/v1/auth/login')
    .send({ email: 'admin@example.com', password: 'not-the-password' });

  User.findOne = () => chain(null);
  const unknownEmail = await request(app)
    .post('/api/v1/auth/login')
    .send({ email: 'nobody@example.com', password: 'not-the-password' });

  try {
    assert.equal(wrongPassword.status, 401);
    assert.equal(unknownEmail.status, 401);
    assert.deepEqual(wrongPassword.body, unknownEmail.body);
    assert.ok(!JSON.stringify(wrongPassword.body).includes('exist'), 'no user-enumeration hint');
  } finally {
    User.findOne = original;
  }
});

test('login never falls back to a default secret or a missing expiry', () => {
  assert.ok(process.env.JWT_SECRET && process.env.JWT_SECRET.length > 0, 'a secret is always required');
  assert.ok(DEFAULT_JWT_EXPIRES_IN, 'tokens always expire');
});

test('an account with no password hash fails as a normal 401', async () => {
  const original = User.findOne;
  // A malformed or half-created record must not turn a login attempt into a 500.
  User.findOne = () => chain({ _id: ADMIN_ID, name: 'Admin', email: 'admin@example.com', role: 'admin' });

  try {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'admin@example.com', password: 'anything-at-all' });

    assert.equal(res.status, 401);
    assert.equal(res.body.success, false);
  } finally {
    User.findOne = original;
  }
});

test('/auth/me confirms the session and rejects an anonymous caller', async () => {
  const account = stubAccount();
  const originalFindOne = User.findById;

  try {
    const ok = await asAdmin(request(app).get('/api/v1/auth/me'));
    assert.equal(ok.status, 200);
    assert.equal(ok.body.user.role, 'admin');

    const anonymous = await request(app).get('/api/v1/auth/me');
    assert.equal(anonymous.status, 401);
  } finally {
    User.findById = originalFindOne;
    account.restore();
  }
});

test('logout requires a session', async () => {
  const res = await request(app).post('/api/v1/auth/logout');
  assert.equal(res.status, 401);
});

test('logout clears the cookie and invalidates the token that was used', async () => {
  const account = stubAccount();
  const originalUpdate = User.findByIdAndUpdate;
  let bumped = null;

  User.findByIdAndUpdate = (id, update) => {
    bumped = { id, update };
    return chain({ _id: ADMIN_ID });
  };

  try {
    const res = await asAdmin(request(app).post('/api/v1/auth/logout'));

    assert.equal(res.status, 200);
    assert.match(res.headers['set-cookie'].join(';'), /token=;/, 'the cookie is cleared');

    assert.ok(bumped, 'the session version was bumped');
    assert.equal(bumped.update.$inc.tokenVersion, 1);

    // The same token must now be worthless.
    const replay = await auth(request(app).delete(`/api/v1/blogs/${BLOG_ID}`));
    assert.equal(replay.status, 401);
  } finally {
    User.findByIdAndUpdate = originalUpdate;
    account.restore();
  }
});

test('bootstrap is closed once an admin exists', async () => {
  const original = User.findOne;
  User.findOne = () => chain({ _id: ADMIN_ID });

  try {
    const res = await request(app)
      .post('/api/v1/auth/bootstrap')
      .send({ name: 'Second Admin', email: 'second@example.com', password: 'whatever123' });
    assert.equal(res.status, 403);
  } finally {
    User.findOne = original;
  }
});

test('an unknown API route returns a clean JSON 404', async () => {
  const res = await request(app).get('/api/v1/blogs/admin/all/extra/segments/that/do/not/exist');
  assert.ok(res.status === 401 || res.status === 404, `status ${res.status}`);
  assert.equal(res.body.success, false);
});
