// ==========================================
// CSRF PROTECTION (origin verification)
// ==========================================
// Decision, and why it is this and not a token library:
//
// The auth cookie must be SameSite=None + Secure, because the admin panel
// (weinsightian.tech) and the API (*.onrender.com) are different *sites*. With
// SameSite=None the browser attaches the cookie to any cross-site request, so
// SameSite provides no CSRF protection at all here. The alternative — moving the
// API under the same site as the frontend — is a hosting decision, not a code
// change.
//
// With no framework to lean on, the check is the one the Fetch specification
// supports: browsers always send `Origin` on a cross-site state-changing request
// and always send `Sec-Fetch-Site`, and neither can be set by page JavaScript.
// So a forged request from an attacker's page carries an origin we do not allow
// and is rejected before any controller runs.
//
// Requests without an Origin (curl, health checks, server-to-server) are allowed
// through: they carry no ambient browser authority. If that is ever too
// permissive for a deployment, add a double-submit token here — the call site
// does not change.

import { ForbiddenError } from '../errors/customErrors.js';
import { isAllowedOrigin } from '../utils/corsUtils.js';

const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);

const readOrigin = (req) => {
  if (req.headers.origin) return req.headers.origin;

  const referer = req.headers.referer;
  if (!referer) return null;

  try {
    return new URL(referer).origin;
  } catch {
    return null;
  }
};

export const verifyRequestOrigin = (req, res, next) => {
  if (SAFE_METHODS.has(req.method)) {
    return next();
  }

  const origin = readOrigin(req);

  // A browser always sends one of these for a cross-site write. If it is there,
  // it has to be a known origin.
  if (origin && !isAllowedOrigin(origin)) {
    return next(new ForbiddenError('request origin is not allowed'));
  }

  // Defence in depth: Fetch Metadata is present on every modern browser request
  // and cannot be forged from a page, even if Origin is missing.
  const fetchSite = req.headers['sec-fetch-site'];
  if (fetchSite === 'cross-site' && (!origin || !isAllowedOrigin(origin))) {
    return next(new ForbiddenError('cross-site request rejected'));
  }

  return next();
};

export default verifyRequestOrigin;
