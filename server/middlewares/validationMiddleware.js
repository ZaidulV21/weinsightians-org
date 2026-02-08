import { body, param, validationResult } from 'express-validator';
import mongoose from 'mongoose';
import { BadRequestError, NotFoundError } from '../errors/customErrors.js';
import Blog from '../models/Blog.js';

// Higher-order function that wraps express-validator chains.
// It collects errors, maps them, and throws a custom error if any exist.
const withValidationErrors = (validateValues) => {
    return [
        validateValues,
        (req, res, next) => {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                const errorMessages = errors.array().map((err) => err.msg);

                // If any error message mentions "no blog" — it's a NotFoundError
                if (errorMessages[0].startsWith('no blog')) {
                    throw new NotFoundError(errorMessages[0]);
                }

                throw new BadRequestError(errorMessages.join(', '));
            }
            next();
        },
    ];
};

// Validates blog input fields for create/update operations
export const validateBlogInput = withValidationErrors([
    body('title')
        .notEmpty()
        .withMessage('title is required')
        .isLength({ max: 200 })
        .withMessage('title cannot exceed 200 characters'),
    body('description')
        .notEmpty()
        .withMessage('description is required')
        .isLength({ max: 500 })
        .withMessage('description cannot exceed 500 characters'),
    body('content').notEmpty().withMessage('content is required'),
    body('author').notEmpty().withMessage('author is required'),
]);

// Validates that the id param is a valid MongoDB ObjectId and that the blog exists
export const validateIdParam = withValidationErrors([
    param('id').custom(async (value, { req }) => {
        // First check if it's a valid ObjectId format
        const isValidId = mongoose.Types.ObjectId.isValid(value);
        if (!isValidId) {
            throw new BadRequestError('invalid MongoDB id');
        }

        // Then check if the blog actually exists
        const blog = await Blog.findById(value);
        if (!blog) {
            throw new NotFoundError(`no blog with id ${value}`);
        }
    }),
]);

// Validates login input
export const validateLoginInput = withValidationErrors([
    body('email')
        .notEmpty()
        .withMessage('email is required')
        .isEmail()
        .withMessage('please provide a valid email'),
    body('password').notEmpty().withMessage('password is required'),
]);

// Validates bootstrap admin input — used only for the one-time admin creation
export const validateBootstrapInput = withValidationErrors([
    body('name')
        .notEmpty()
        .withMessage('name is required')
        .isLength({ min: 3, max: 50 })
        .withMessage('name must be between 3 and 50 characters'),
    body('email')
        .notEmpty()
        .withMessage('email is required')
        .isEmail()
        .withMessage('please provide a valid email'),
    body('password')
        .notEmpty()
        .withMessage('password is required')
        .isLength({ min: 6 })
        .withMessage('password must be at least 6 characters'),
]);
