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
// Secure    — HTTPS only. Derived from the actual connection, not from NODE_ENV
//             alone, so a deployed service that is missing NODE_ENV still gets a
//             valid cookie. See shouldUseSecureCookie below.
// SameSite  — 'none' over HTTPS, which is mandatory when the panel and the API
//             are different sites (not just different ports): SameSite=Lax/Strict
//             would stop the cookie being sent on cross-site XHR at all. On a
//             plain-http local server it falls back to 'lax', which is still
//             sufficient there because localhost is same-site. It is NOT a CSRF
//             control — see middlewares/csrfProtection.js.
// path '/'  — required with SameSite=None so the cookie is sent to every route.

const AUTH_COOKIE_NAME = 'token';

// A SameSite=None cookie without Secure is discarded by the browser with no
// console error, which presents as "the login request succeeded, then /auth/me
// returned 401". So Secure is not left to depend on an environment string alone:
// Render terminates TLS and forwards X-Forwarded-Proto, and the app trusts one
// proxy hop, so req.secure already answers this correctly in production even if
// the service has no NODE_ENV set. NODE_ENV stays as the fallback for callers
// that have no request (the tests) and for a TLS terminator that forwards no
// protocol header.
const shouldUseSecureCookie = (req) => isProduction() || Boolean(req?.secure);

const buildCookieOptions = (expires, req) => {
  const secure = shouldUseSecureCookie(req);
  return {
    httpOnly: true,
    secure,
    // Decided together with secure so the invalid combination is unreachable.
    sameSite: secure ? 'none' : 'lax',
    path: '/',
    expires,
  };
};

export const AUTH_COOKIE_MAX_AGE_MS = 8 * 60 * 60 * 1000; // 8h, matches DEFAULT_JWT_EXPIRES_IN

export const attachCookiesToResponse = (res, user, req) => {
  const token = createJWT({
    userId: String(user._id),
    role: user.role,
    // Bumping this on logout invalidates the old token server-side.
    tokenVersion: user.tokenVersion ?? 0,
  });

  res.cookie(
    AUTH_COOKIE_NAME,
    token,
    buildCookieOptions(new Date(Date.now() + AUTH_COOKIE_MAX_AGE_MS), req)
  );
};

// Overwrites the auth cookie with an already-expired one. The options must match
// the ones used when setting the cookie or the browser keeps the original.
export const clearAuthCookie = (res, req) => {
  res.clearCookie(AUTH_COOKIE_NAME, buildCookieOptions(new Date(0), req));
};
