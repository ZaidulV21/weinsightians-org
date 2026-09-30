import './setup.js';
import test from 'node:test';
import assert from 'node:assert/strict';
import jwt from 'jsonwebtoken';

import {
  createJWT,
  verifyJWT,
  getAuthTokenFromCookies,
  attachCookiesToResponse,
  clearAuthCookie,
  AUTH_COOKIE_MAX_AGE_MS,
} from '../utils/tokenUtils.js';
import { hashPassword, comparePassword } from '../utils/passwordUtils.js';

const captureRes = () => {
  const calls = { cookie: [], clearCookie: [] };
  return {
    calls,
    cookie: (name, value, options) => calls.cookie.push({ name, value, options }),
    clearCookie: (name, options) => calls.clearCookie.push({ name, options }),
  };
};

// ==========================================
// JWT
// ==========================================

test('a token round-trips its payload', () => {
  const token = createJWT({ userId: 'abc', role: 'admin', tokenVersion: 0 });
  const payload = verifyJWT(token);
  assert.equal(payload.userId, 'abc');
  assert.equal(payload.role, 'admin');
});

test('a token signed with another secret is rejected', () => {
  const forged = jwt.sign({ userId: 'abc', role: 'admin' }, 'some-other-secret');
  assert.throws(() => verifyJWT(forged));
});

test('an expired token is rejected', () => {
  const expired = jwt.sign({ userId: 'abc' }, process.env.JWT_SECRET, { expiresIn: '-1s' });
  assert.throws(() => verifyJWT(expired));
});

test('the auth token is only read from the cookie', () => {
  assert.equal(getAuthTokenFromCookies({ cookies: { token: 'abc' } }), 'abc');
  assert.equal(getAuthTokenFromCookies({ cookies: {} }), null);
  assert.equal(getAuthTokenFromCookies({ cookies: { token: '' } }), null);
  assert.equal(getAuthTokenFromCookies({}), null);
  // A token supplied in a header or the body is not honoured.
  assert.equal(getAuthTokenFromCookies({ cookies: {}, headers: { authorization: 'Bearer abc' } }), null);
});

// ==========================================
// COOKIE FLAGS
// ==========================================

test('the session cookie is HttpOnly, path-scoped and SameSite=None', () => {
  const res = captureRes();
  attachCookiesToResponse(res, { _id: 'abc', role: 'admin', tokenVersion: 0 });

  const [call] = res.calls.cookie;
  assert.equal(call.name, 'token');
  assert.equal(call.options.httpOnly, true, 'must be HttpOnly so JS cannot read it');
  assert.equal(call.options.sameSite, 'none', 'required: the panel and API are different sites');
  assert.equal(call.options.path, '/', 'required alongside SameSite=None');
  assert.ok(call.options.secure !== undefined);
  assert.ok(call.options.expires.getTime() > Date.now(), 'cookie must expire in the future');
  assert.ok(call.value.split('.').length === 3, 'cookie must hold a JWT');
});

test('Secure is only off outside production', () => {
  const original = process.env.NODE_ENV;

  process.env.NODE_ENV = 'production';
  const prodRes = captureRes();
  attachCookiesToResponse(prodRes, { _id: 'abc', role: 'admin' });
  assert.equal(prodRes.calls.cookie[0].options.secure, true);

  process.env.NODE_ENV = 'development';
  const devRes = captureRes();
  attachCookiesToResponse(devRes, { _id: 'abc', role: 'admin' });
  assert.equal(devRes.calls.cookie[0].options.secure, false);

  process.env.NODE_ENV = original;
});

test('clearing the cookie uses the same attributes it was set with', () => {
  const set = captureRes();
  attachCookiesToResponse(set, { _id: 'abc', role: 'admin' });
  const setOptions = set.calls.cookie[0].options;

  const cleared = captureRes();
  clearAuthCookie(cleared);

  const expireOptions = cleared.calls.clearCookie[0].options;
  assert.equal(expireOptions.httpOnly, setOptions.httpOnly);
  assert.equal(expireOptions.sameSite, setOptions.sameSite);
  assert.equal(expireOptions.path, setOptions.path);
  assert.equal(expireOptions.secure, setOptions.secure);
  assert.ok(expireOptions.expires.getTime() <= Date.now(), 'cleared cookie must already be expired');
});

test('the session cookie lifetime matches the token lifetime', () => {
  const res = captureRes();
  attachCookiesToResponse(res, { _id: 'abc', role: 'admin' });
  const expiresIn = res.calls.cookie[0].options.expires.getTime() - Date.now();
  assert.ok(Math.abs(expiresIn - AUTH_COOKIE_MAX_AGE_MS) < 2000);
});

// ==========================================
// PASSWORDS
// ==========================================

test('passwords are hashed and compared, never stored in the clear', async () => {
  const hash = await hashPassword('correct horse battery staple');
  assert.notEqual(hash, 'correct horse battery staple');
  assert.equal(await comparePassword('correct horse battery staple', hash), true);
  assert.equal(await comparePassword('wrong password', hash), false);
});

test('the same password hashes differently every time', async () => {
  const a = await hashPassword('same-password');
  const b = await hashPassword('same-password');
  assert.notEqual(a, b, 'each hash must use its own salt');
});
