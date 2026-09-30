import { Router } from 'express';
import { login, logout, bootstrap, getMe } from '../controllers/authController.js';
import {
  validateLoginInput,
  validateBootstrapInput,
} from '../middlewares/validationMiddleware.js';
import { authenticateUser } from '../middlewares/authenticationMiddleware.js';
import { bootstrapRateLimiter, loginRateLimiter } from '../middlewares/rateLimitMiddleware.js';

const router = Router();

// POST /api/v1/auth/bootstrap — one-time admin creation. Permanently closed once
// any user exists, and rate limited so it cannot be raced or probed.
router.post('/bootstrap', bootstrapRateLimiter, validateBootstrapInput, bootstrap);

// POST /api/v1/auth/login — validates input, rate limits attempts, sets the
// HttpOnly session cookie. No token is ever returned in the body.
router.post('/login', loginRateLimiter, validateLoginInput, login);

// GET /api/v1/auth/me — protected. Tells the admin UI whether the cookie is
// still a valid session, so it does not have to guess from browser storage.
router.get('/me', authenticateUser, getMe);

// POST /api/v1/auth/logout — protected. Requires a live session, clears the
// cookie and invalidates the token server-side.
router.post('/logout', authenticateUser, logout);

export default router;
