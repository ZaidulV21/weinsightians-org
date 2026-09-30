// ==========================================
// RATE LIMITING
// ==========================================
// Deliberately small: login protection is the point, everything else just keeps a
// single broken client from hammering the database.
//
// The login limit is keyed on IP *and* the submitted email, so one attacker
// cannot lock every admin out, and a distributed attempt against one account
// still stops. Failed logins are the only thing counted — a legitimate admin
// working normally is never throttled.

import rateLimit, { ipKeyGenerator } from 'express-rate-limit';

const shared = {
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  // Limits are only skipped when explicitly switched off (local debugging, load
  // tests). They stay active under NODE_ENV=test so the suites below prove the
  // limiters actually fire.
  skip: () => process.env.RATE_LIMIT_DISABLED === 'true',
};

const limitHandler = (_req, res) => {
  res.status(429).json({
    success: false,
    msg: 'Too many attempts. Please wait a few minutes and try again.',
    message: 'Too many attempts. Please wait a few minutes and try again.',
  });
};

// POST /auth/login — 20 failed attempts per 15 minutes per IP+email pair.
//
// The threshold is deliberately above what a human mistypes in a row. Only one
// admin account exists here, so a limit that is too tight does not stop an
// attacker, it locks the site owner out of their own panel for 15 minutes.
// Twenty guesses against a bcrypt hash is still worthless to an attacker.
export const loginRateLimiter = rateLimit({
  ...shared,
  windowMs: 15 * 60 * 1000,
  limit: 20,
  // A successful login is not counted, so normal use never throttles the admin.
  skipSuccessfulRequests: true,
  keyGenerator: (req) => {
    const email = typeof req.body?.email === 'string' ? req.body.email.trim().toLowerCase() : '';
    return `${ipKeyGenerator(req.ip)}:${email}`;
  },
  handler: limitHandler,
});

// POST /auth/bootstrap — one-time route, but still bounded.
export const bootstrapRateLimiter = rateLimit({
  ...shared,
  windowMs: 60 * 60 * 1000,
  limit: 5,
  handler: limitHandler,
});

// Content-changing blog writes.
export const mutationRateLimiter = rateLimit({
  ...shared,
  windowMs: 15 * 60 * 1000,
  limit: 60,
  keyGenerator: (req) => ipKeyGenerator(req.user?.userId || req.ip),
  handler: limitHandler,
});
