import { body, param, validationResult } from 'express-validator';
import mongoose from 'mongoose';
import { BadRequestError, NotFoundError, CustomAPIError } from '../errors/customErrors.js';
import Blog from '../models/Blog.js';
import { BLOG_STATUS } from '../models/Blog.js';
import { isValidSlugParam } from '../utils/slugUtils.js';
import { hasVisibleText, toPlainText } from '../utils/sanitizeUtils.js';

// ==========================================
// LIMITS
// ==========================================
// Mirrors the model constraints so a client gets a readable message instead of a
// driver error, and caps the request body well below anything that could be used
// to exhaust memory.
export const LIMITS = {
  title: { min: 3, max: 200 },
  description: { min: 10, max: 500 },
  author: { min: 2, max: 100 },
  content: { min: 20, max: 200000 },
  slug: { max: 200 },
};

const notEmptyAfterTrim = (field, label) =>
  body(field)
    .custom((value) => {
      if (typeof value !== 'string' || toPlainText(value).length === 0) {
        throw new Error(`${label} is required`);
      }
      return true;
    });

const plainTextField = (field, label, { min, max }) =>
  body(field)
    .custom((value) => {
      if (typeof value !== 'string') {
        throw new Error(`${label} must be text`);
      }
      const cleaned = toPlainText(value);
      if (cleaned.length === 0) {
        throw new Error(`${label} is required`);
      }
      if (cleaned.length < min) {
        throw new Error(`${label} must be at least ${min} characters`);
      }
      if (cleaned.length > max) {
        throw new Error(`${label} cannot exceed ${max} characters`);
      }
      return true;
    })
    .customSanitizer((value) => toPlainText(value));

const contentField = () =>
  body('content')
    .custom((value) => {
      if (typeof value !== 'string') {
        throw new Error('Content must be HTML text');
      }
      if (value.length > LIMITS.content.max) {
        throw new Error(`Content cannot exceed ${LIMITS.content.max} characters`);
      }
      // "<p><br></p>" is what an empty editor submits. Rejecting it here stops a
      // whitespace-only post from ever being stored.
      if (!hasVisibleText(value)) {
        throw new Error('Content cannot be empty');
      }
      return true;
    });

const imageUrlField = () =>
  body('image')
    .optional({ nullable: true })
    .custom((value) => {
      if (value === null || value === undefined || value === '') return true;
      if (typeof value !== 'string' || value.length > 2048) {
        throw new Error('Image must be a URL');
      }
      // Only http(s) image URLs are accepted. javascript:, data: and anything
      // else executable is rejected before it can reach an <img src>.
      let parsed;
      try {
        parsed = new URL(value);
      } catch {
        throw new Error('Image must be a valid URL');
      }
      if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') {
        throw new Error('Image must be an http or https URL');
      }
      return true;
    });

const statusField = () =>
  body('status')
    .optional()
    .isIn(Object.values(BLOG_STATUS))
    .withMessage('status must be either draft or published')
    .customSanitizer((value) => toPlainText(value));

// ==========================================
// RUNNER
// ==========================================
// Runs an express-validator chain and converts failures into our error classes,
// so a client always gets a real status code and a flat, predictable message.
const validate = (chains) => [
  ...chains,
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const message = errors
        .array()
        .map((error) => error.msg)
        .join(', ');

      // A missing resource is a 404, not a 400.
      if (/^no blog/.test(message)) {
        return next(new NotFoundError(message));
      }
      return next(new BadRequestError(message));
    }
    return next();
  },
];

// POST /blogs/admin/import-image
//
// Presence and shape only. The URL is not checked here beyond being a plausible
// http(s) string: parseRemoteImageUrl does the real protocol, port, hostname and
// address work, and duplicating those rules here would risk the validator and the
// fetcher disagreeing about what is allowed. Defined here rather than beside the
// field helpers above because it uses the `validate` runner.
const MAX_IMAGE_URL_LENGTH = 2048;

export const validateImageUrlImport = validate([
  body('url')
    .isString()
    .withMessage('An image URL is required')
    .bail()
    .custom((value) => {
      if (value.trim().length === 0) {
        throw new Error('An image URL is required');
      }
      if (value.length > MAX_IMAGE_URL_LENGTH) {
        throw new Error('That URL is too long');
      }
      let parsed;
      try {
        parsed = new URL(value.trim());
      } catch {
        throw new Error('That does not look like a valid URL');
      }
      if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') {
        throw new Error('The image URL must start with http:// or https://');
      }
      return true;
    }),
]);

// Create: every field the CMS supports is required.
export const validateBlogCreate = validate([
  plainTextField('title', 'Title', LIMITS.title),
  plainTextField('description', 'Description', LIMITS.description),
  plainTextField('author', 'Author', LIMITS.author),
  contentField(),
  imageUrlField(),
  statusField(),
]);

// Update: same rules, but every field is optional so a status toggle or a
// content-only edit is a valid PATCH. The controller then copies only the fields
// that were actually sent.
export const validateBlogUpdate = validate([
  plainTextField('title', 'Title', LIMITS.title).optional(),
  plainTextField('description', 'Description', LIMITS.description).optional(),
  plainTextField('author', 'Author', LIMITS.author).optional(),
  body('content')
    .optional()
    .isString()
    .withMessage('Content must be HTML text')
    .bail()
    .custom((value) => {
      if (value.length > LIMITS.content.max) {
        throw new Error(`Content cannot exceed ${LIMITS.content.max} characters`);
      }
      if (!hasVisibleText(value)) {
        throw new Error('Content cannot be empty');
      }
      return true;
    }),
  imageUrlField(),
  statusField(),
  // A PATCH with nothing in it is a client mistake, not a silent no-op. An
  // image-only update is legitimate, so an uploaded file counts as a change.
  (req, res, next) => {
    const editable = ['title', 'description', 'content', 'author', 'image', 'status'];
    const hasField = editable.some((field) => req.body?.[field] !== undefined);

    if (!hasField && !req.file) {
      return next(new BadRequestError('No fields to update'));
    }
    return next();
  },
]);

// GET /blogs/:slug — a slug is only ever used for an exact match, never in a
// regex, so this check rejects junk without touching stored slugs.
export const validateSlugParam = validate([
  param('slug').custom((value) => {
    if (!isValidSlugParam(value)) {
      throw new BadRequestError('invalid blog slug');
    }
    return true;
  }),
]);

// A validator that touches Mongoose must never let a driver or programming error
// escape: express-validator turns anything thrown in here into a 400 whose message
// is echoed to the client. Only messages written in this file may leave the server.
const safeCustom = (validator) =>
  async (value, { req }) => {
    try {
      return await validator(value, { req });
    } catch (error) {
      if (error instanceof CustomAPIError) throw error;
      throw new Error('Request could not be validated');
    }
  };

// PATCH/DELETE /blogs/:id — a real ObjectId, and the post must exist. Using
// isValidObjectId (not isValid) is what stops a 12-character string from reaching
// the driver and coming back as an internal CastError.
export const validateIdParam = validate([
  param('id').custom(
    safeCustom(async (value) => {
      if (!mongoose.isValidObjectId(value)) {
        throw new BadRequestError('invalid blog id');
      }

      const blog = await Blog.findById(value).select('_id').lean();
      if (!blog) {
        throw new NotFoundError('no blog with that id');
      }

      return true;
    })
  ),
]);

// Login: presence and shape only. Validity is decided in the controller so a
// wrong email and a wrong password produce exactly the same response.
export const validateLoginInput = validate([
  body('email')
    .custom((value) => {
      if (typeof value !== 'string' || value.trim().length === 0) {
        throw new Error('Email is required');
      }
      if (value.length > 254) {
        throw new Error('Email is too long');
      }
      return true;
    })
    // bail() has to sit above the sanitizer: express-validator runs sanitizers
    // even after an earlier check failed, so a missing email would reach
    // value.trim() as undefined and throw a TypeError that surfaces as a 500.
    .bail()
    .customSanitizer((value) => value.trim().toLowerCase())
    .isEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .custom((value) => {
      if (typeof value !== 'string' || value.length === 0) {
        throw new Error('Password is required');
      }
      if (value.length > 200) {
        throw new Error('Password is too long');
      }
      return true;
    }),
]);

// One-time admin creation.
export const validateBootstrapInput = validate([
  notEmptyAfterTrim('name', 'Name'),
  body('name').isLength({ min: 3, max: 50 }).withMessage('Name must be between 3 and 50 characters'),
  body('email')
    .custom((value) => (typeof value === 'string' ? value.trim().toLowerCase() : value))
    .bail()
    .isEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .custom((value) => (typeof value === 'string' ? value : ''))
    .bail()
    .isLength({ min: 8, max: 200 })
    .withMessage('Password must be at least 8 characters'),
]);
