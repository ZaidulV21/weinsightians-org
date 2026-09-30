import { Router } from 'express';
import { uploadSingleImage } from '../middlewares/upload.js';
import {
  getAllBlogs,
  getBlog,
  getAdminBlogs,
  getAdminBlogBySlug,
  createBlog,
  updateBlog,
  deleteBlog,
} from '../controllers/blogController.js';
import {
  validateBlogCreate,
  validateBlogUpdate,
  validateIdParam,
  validateSlugParam,
} from '../middlewares/validationMiddleware.js';
import { authenticateUser } from '../middlewares/authenticationMiddleware.js';
import adminRouteMiddleware from '../middlewares/adminRouteMiddleware.js';
import { mutationRateLimiter } from '../middlewares/rateLimitMiddleware.js';

const router = Router();

// ==========================================
// PUBLIC — no authentication
// ==========================================
// Reading the blog must never require a session. Drafts are filtered out inside
// the controller, so these two routes cannot be used to discover unpublished work.
router.get('/', getAllBlogs);

router.get('/:slug', validateSlugParam, getBlog);

// ==========================================
// ADMIN — authenticate -> role check -> rate limit -> validate -> controller
// ==========================================
// The chain order matters: the request is rejected before any file is buffered,
// any input is parsed, or any database query runs.
router.get(
  '/admin/all',
  authenticateUser,
  adminRouteMiddleware,
  getAdminBlogs
);

router.get(
  '/admin/slug/:slug',
  authenticateUser,
  adminRouteMiddleware,
  validateSlugParam,
  getAdminBlogBySlug
);

router.post(
  '/',
  authenticateUser,
  adminRouteMiddleware,
  mutationRateLimiter,
  uploadSingleImage,
  validateBlogCreate,
  createBlog
);

router.patch(
  '/:id',
  authenticateUser,
  adminRouteMiddleware,
  mutationRateLimiter,
  uploadSingleImage,
  validateIdParam,
  validateBlogUpdate,
  updateBlog
);

router.delete(
  '/:id',
  authenticateUser,
  adminRouteMiddleware,
  validateIdParam,
  deleteBlog
);

export default router;
