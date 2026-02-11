import { Router } from 'express';
import upload from "../middlewares/upload.js";
import {
    getAllBlogs,
    getBlog,
    createBlog,
    updateBlog,
    deleteBlog,
} from '../controllers/blogController.js';
import {
    validateBlogInput,
    validateIdParam,
} from '../middlewares/validationMiddleware.js';
import { authenticateUser } from '../middlewares/authenticationMiddleware.js';
import adminRouteMiddleware from '../middlewares/adminRouteMiddleware.js';

const router = Router();

// Public routes — no authentication required
router.get('/', getAllBlogs);
// router.get('/:id', validateIdParam, getBlog);
router.get("/:slug", getBlog);

router.post("/", upload.single("image"), createBlog);

// Protected routes — require authentication AND admin role
// The middleware chain: authenticate -> check admin -> validate input -> controller
router.post(
    '/',
    authenticateUser,
    adminRouteMiddleware,
    validateBlogInput,
    createBlog
);

router.patch(
    '/:id',
    authenticateUser,
    adminRouteMiddleware,
    validateIdParam,
    validateBlogInput,
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
