import jwt from 'jsonwebtoken';
import { isProduction } from './envUtils.js';

// ==========================================
// JWT
// ==========================================
// The token payload is deliberately minimal: an id, the role, and a session
// version. Nothing secret, nothing the client needs to read — the browser never
// sees the token at all because it lives in an HttpOnly cookie.

export const DEFAULT_JWT_EXPIRES_IN = '8h';

const getJwtSecret = () => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    // Failing loudly here is better than signing with the string "undefined".
    throw new Error('JWT_SECRET is not configured');
  }
  return secret;
};

export const createJWT = (payload) =>
  jwt.sign(payload, getJwtSecret(), {
    expiresIn: process.env.JWT_EXPIRES_IN || DEFAULT_JWT_EXPIRES_IN,
  });

export const verifyJWT = (token) => jwt.verify(token, getJwtSecret());

// Reads the auth cookie. Kept next to the cookie writer so the read path and the
// write path can never drift apart.
export const getAuthTokenFromCookies = (req) => {
  if (!req || !req.cookies) return null;
  const token = req.cookies.token;
  return typeof token === 'string' && token.length > 0 ? token : null;
};

// ==========================================
// COOKIES
// ==========================================
// HttpOnly  — JavaScript cannot read the token, so an XSS bug in the admin UI
//             cannot exfiltrate the session.
// Secure    — HTTPS only in production. http://localhost dev still works
//             because browsers treat localhost as a secure context.
// SameSite  — 'none' is mandatory here: the panel and the API are different
//             sites (not just different ports), and SameSite=Lax/Strict would
//             stop the cookie from being sent on cross-site XHR at all. It is
//             NOT a CSRF control here — see middlewares/csrfProtection.js.
// path '/'  — required with SameSite=None so the cookie is sent to every route.

const AUTH_COOKIE_NAME = 'token';

const buildCookieOptions = (expires) => ({
  httpOnly: true,
  secure: isProduction(),
  sameSite: 'none',
  path: '/',
  expires,
});

export const AUTH_COOKIE_MAX_AGE_MS = 8 * 60 * 60 * 1000; // 8h, matches DEFAULT_JWT_EXPIRES_IN

export const attachCookiesToResponse = (res, user) => {
  const token = createJWT({
    userId: String(user._id),
    role: user.role,
    // Bumping this on logout invalidates the old token server-side.
    tokenVersion: user.tokenVersion ?? 0,
  });

  res.cookie(AUTH_COOKIE_NAME, token, buildCookieOptions(new Date(Date.now() + AUTH_COOKIE_MAX_AGE_MS)));
};

// Overwrites the auth cookie with an already-expired one. The options must match
// the ones used when setting the cookie or the browser keeps the original.
export const clearAuthCookie = (res) => {
  res.clearCookie(AUTH_COOKIE_NAME, buildCookieOptions(new Date(0)));
};
