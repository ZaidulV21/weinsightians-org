import './setup.js';
import test from 'node:test';
import assert from 'node:assert/strict';
import express from 'express';
import request from 'supertest';

import corsOptions, { allowedOrigins, isAllowedOrigin } from '../utils/corsUtils.js';
import verifyRequestOrigin from '../middlewares/csrfProtection.js';
import errorHandlerMiddleware from '../middlewares/errorHandlerMiddleware.js';
import notFoundMiddleware from '../middlewares/notFoundMiddleware.js';
import cors from 'cors';
import { ForbiddenError } from '../errors/customErrors.js';

const buildApp = () => {
  const app = express();
  app.use(express.json());
  app.use(cors(corsOptions));
  app.use(verifyRequestOrigin);
  app.post('/write', (req, res) => res.json({ ok: true }));
  app.get('/read', (req, res) => res.json({ ok: true }));
  app.use(notFoundMiddleware);
  app.use(errorHandlerMiddleware);
  return app;
};

// ==========================================
// CORS ALLOWLIST
// ==========================================

test('the production frontend and localhost dev are allowed', () => {
  assert.ok(isAllowedOrigin('https://weinsightian.tech'));
  assert.ok(isAllowedOrigin('http://localhost:5173'));
  assert.ok(isAllowedOrigin('http://127.0.0.1:5173'));
});

test('unknown origins are refused', () => {
  [
    'https://evil.example',
    'http://weinsightian.tech.evil.example',
    'https://weinsightian.tech.evil.com',
    'http://localhost:3000',
    'https://www.weinsightian.tech',
    'null',
  ].forEach((origin) => {
    assert.equal(isAllowedOrigin(origin), false, origin);
  });
});

test('a trailing slash does not change the verdict', () => {
  assert.equal(isAllowedOrigin('https://weinsightian.tech/'), true);
});

test('the wildcard is never used with credentials', () => {
  assert.equal(corsOptions.credentials, true);
  assert.notEqual(corsOptions.origin, '*');
  assert.ok(!allowedOrigins.includes('*'));
  assert.ok(!allowedOrigins.includes(undefined));
  assert.ok(!allowedOrigins.includes(''));
});

// ==========================================
// CORS HEADERS
// ==========================================

test('an allowed origin gets credentialed CORS headers', async () => {
  const res = await request(buildApp()).get('/read').set('Origin', 'https://weinsightian.tech');
  assert.equal(res.status, 200);
  assert.equal(res.headers['access-control-allow-origin'], 'https://weinsightian.tech');
  assert.equal(res.headers['access-control-allow-credentials'], 'true');
  assert.ok(!res.headers['access-control-allow-origin'].includes('*'));
});

test('a foreign origin gets no CORS headers', async () => {
  const res = await request(buildApp()).get('/read').set('Origin', 'https://evil.example');
  assert.ok(!res.headers['access-control-allow-origin']);
});

test('preflight from the admin panel is answered', async () => {
  const res = await request(buildApp())
    .options('/write')
    .set('Origin', 'https://weinsightian.tech')
    .set('Access-Control-Request-Method', 'POST');

  assert.ok(res.status < 300, `preflight status ${res.status}`);
  assert.equal(res.headers['access-control-allow-origin'], 'https://weinsightian.tech');
  assert.equal(res.headers['access-control-allow-credentials'], 'true');
});

// ==========================================
// CSRF: ORIGIN VERIFICATION
// ==========================================

const write = (origin) => {
  const req = request(buildApp()).post('/write');
  return origin === null ? req : req.set('Origin', origin);
};

test('a state-changing request from the admin panel is allowed', async () => {
  const res = await write('https://weinsightian.tech');
  assert.equal(res.status, 200);
});

test('a cross-site write is rejected', async () => {
  const res = await write('https://evil.example');
  assert.equal(res.status, 403);
  assert.equal(res.body.success, false);
  assert.ok(!res.body.msg.includes('evil.example'), 'the rejected origin is not echoed back');
});

test('a forged referer is rejected when there is no origin', async () => {
  const res = await request(buildApp())
    .post('/write')
    .set('Referer', 'https://evil.example/attack.html');
  assert.equal(res.status, 403);
});

test('an allowed referer passes', async () => {
  const res = await request(buildApp())
    .post('/write')
    .set('Referer', 'https://weinsightian.tech/admin/dashboard');
  assert.equal(res.status, 200);
});

test('non-browser clients without origin or referer are allowed', async () => {
  const res = await request(buildApp()).post('/write');
  assert.equal(res.status, 200);
});

test('reads are never blocked by the origin check', async () => {
  const res = await request(buildApp()).get('/read').set('Origin', 'https://evil.example');
  assert.equal(res.status, 200);
});

test('cross-site fetch metadata is rejected', async () => {
  const res = await request(buildApp()).post('/write').set('Sec-Fetch-Site', 'cross-site');
  assert.equal(res.status, 403);
});

test('same-origin fetch metadata is allowed', async () => {
  const res = await request(buildApp())
    .post('/write')
    .set('Origin', 'https://weinsightian.tech')
    .set('Sec-Fetch-Site', 'same-site');
  assert.equal(res.status, 200);
});

test('the CSRF failure is a clean API error, not a crash', async () => {
  const res = await write('https://evil.example');
  assert.equal(res.status, 403);
  assert.ok(res.body.msg);
  assert.ok(!res.body.stack, 'no stack trace is exposed');
  assert.equal(new ForbiddenError('x').statusCode, 403);
});
