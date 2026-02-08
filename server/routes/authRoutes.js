import { Router } from 'express';
import { login, logout, bootstrap } from '../controllers/authController.js';
import { validateLoginInput, validateBootstrapInput } from '../middlewares/validationMiddleware.js';

const router = Router();

// POST /api/v1/auth/bootstrap — one-time admin creation (only works if no users exist)
router.post('/bootstrap', validateBootstrapInput, bootstrap);

// POST /api/v1/auth/login — validates input, issues JWT as cookie
router.post('/login', validateLoginInput, login);

// POST /api/v1/auth/logout — clears the cookie
router.post('/logout', logout);

export default router;
