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
import { validateLoginInput } from '../middlewares/validationMiddleware.js';

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

test('the session cookie is HttpOnly and path-scoped', () => {
  const res = captureRes();
  attachCookiesToResponse(res, { _id: 'abc', role: 'admin', tokenVersion: 0 });

  const [call] = res.calls.cookie;
  assert.equal(call.name, 'token');
  assert.equal(call.options.httpOnly, true, 'must be HttpOnly so JS cannot read it');
  assert.equal(call.options.path, '/', 'required alongside SameSite=None');
  assert.ok(call.options.secure !== undefined);
  assert.ok(call.options.expires.getTime() > Date.now(), 'cookie must expire in the future');
  assert.ok(call.value.split('.').length === 3, 'cookie must hold a JWT');
});

test('a SameSite=None cookie is never emitted without Secure', () => {
  const original = process.env.NODE_ENV;

  // A browser discards SameSite=None + no-Secure with no console error, which
  // looks like "login worked, then /auth/me is 401". The pairing must hold for
  // every environment and for a request object that carries no protocol info.
  for (const env of ['production', 'development', 'test', undefined]) {
    for (const req of [undefined, {}, { secure: false }, { secure: true }]) {
      process.env.NODE_ENV = env;
      if (env === undefined) delete process.env.NODE_ENV;
      else process.env.NODE_ENV = env;

      const res = captureRes();
      attachCookiesToResponse(res, { _id: 'abc', role: 'admin' }, req);

      const { secure, sameSite } = res.calls.cookie[0].options;
      const label = `env=${env} req=${JSON.stringify(req)}`;

      // The only invalid state is SameSite=None without Secure.
      if (sameSite === 'none') {
        assert.equal(secure, true, `SameSite=None without Secure for ${label}`);
      } else {
        assert.equal(sameSite, 'lax', `unexpected SameSite for ${label}`);
        assert.equal(secure, false, `Lax must accompany a plain-http cookie for ${label}`);
      }
    }
  }

  process.env.NODE_ENV = original;
});

test('Secure follows the connection, so a deployed service without NODE_ENV still works', () => {
  const original = process.env.NODE_ENV;
  delete process.env.NODE_ENV;

  // Render terminates TLS and forwards X-Forwarded-Proto, which express turns
  // into req.secure once trust proxy is set. This is the production case that
  // previously emitted an unusable cookie whenever NODE_ENV was absent.
  const httpsRes = captureRes();
  attachCookiesToResponse(httpsRes, { _id: 'abc', role: 'admin' }, { secure: true });
  assert.equal(httpsRes.calls.cookie[0].options.secure, true);
  assert.equal(httpsRes.calls.cookie[0].options.sameSite, 'none');

  const httpRes = captureRes();
  attachCookiesToResponse(httpRes, { _id: 'abc', role: 'admin' }, { secure: false });
  assert.equal(httpRes.calls.cookie[0].options.secure, false);

  process.env.NODE_ENV = original;
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
  const original = process.env.NODE_ENV;
  delete process.env.NODE_ENV;

  for (const req of [{ secure: true }, { secure: false }, undefined]) {
    const set = captureRes();
    attachCookiesToResponse(set, { _id: 'abc', role: 'admin' }, req);
    const setOptions = set.calls.cookie[0].options;

    const cleared = captureRes();
    clearAuthCookie(cleared, req);

    const expireOptions = cleared.calls.clearCookie[0].options;
    assert.equal(expireOptions.httpOnly, setOptions.httpOnly);
    assert.equal(expireOptions.sameSite, setOptions.sameSite);
    assert.equal(expireOptions.path, setOptions.path);
    assert.equal(expireOptions.secure, setOptions.secure);
    assert.ok(
      expireOptions.expires.getTime() <= Date.now(),
      'cleared cookie must already be expired'
    );
  }

  process.env.NODE_ENV = original;
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

// ==========================================
// LOGIN VALIDATION
// ==========================================

// validate() returns a middleware array, so it is driven step by step. It
// resolves with the error the stack produced, or null once it runs out.
const runMiddlewareStack = (req, stack) =>
  new Promise((resolve, reject) => {
    let step = 0;
    const next = (err) => {
      if (err) return resolve(err);
      const fn = stack[step++];
      if (!fn) return resolve(null);
      try {
        const result = fn(req, {}, next);
        if (result && typeof result.catch === 'function') result.catch(reject);
      } catch (error) {
        reject(error);
      }
    };
    next();
  });

const makeLoginRequest = (body) => ({ body, query: {}, params: {}, headers: {}, method: 'POST' });

test('a missing email is rejected as a validation error, not a crash', async () => {
  // The sanitizer used to run before bail() and call .trim() on undefined,
  // which threw a TypeError that the error handler reported as a 500 and that
  // said nothing about what was actually wrong with the request.
  const cases = [
    {},
    { email: '', password: 'x' },
    { email: 123, password: 'x' },
    { email: null, password: 'x' },
    { email: '   ', password: 'x' },
  ];

  for (const body of cases) {
    const error = await runMiddlewareStack(makeLoginRequest(body), validateLoginInput);
    assert.ok(error, `must reject ${JSON.stringify(body)}`);
    assert.equal(error.statusCode, 400, `must be a 400 for ${JSON.stringify(body)}`);
    assert.ok(error.message, `must report a reason for ${JSON.stringify(body)}`);
  }
});

test('a missing password is rejected as a validation error', async () => {
  for (const body of [{ email: 'admin@example.com' }, { email: 'admin@example.com', password: '' }]) {
    const error = await runMiddlewareStack(makeLoginRequest(body), validateLoginInput);
    assert.ok(error, `must reject ${JSON.stringify(body)}`);
    assert.equal(error.statusCode, 400);
  }
});

test('a well-formed login body passes and the email is normalised', async () => {
  const req = makeLoginRequest({ email: '  Admin@Example.COM ', password: 'correct horse' });
  const error = await runMiddlewareStack(req, validateLoginInput);
  assert.equal(error, null, 'a valid body must not be rejected');
  assert.equal(req.body.email, 'admin@example.com');
});
