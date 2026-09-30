// ==========================================
// UPLOAD MIDDLEWARE
// ==========================================
// Files are held in memory and streamed straight to Cloudinary — nothing touches
// the local filesystem, which is what makes this work on Render.
//
// Three layers of checking, cheapest first:
//   1. multer limits       — refuse anything oversized or multi-file (413/400)
//   2. multer fileFilter  — declared MIME type + extension must both be allowed
//   3. assertValidImageFile— the real magic bytes must match what was declared
//
// Layer 3 is the only one the client cannot influence, so a renamed executable,
// a polyglot file, or a hand-crafted multipart body all fail before a single byte
// reaches Cloudinary.

import multer from 'multer';
import { BadRequestError, PayloadTooLargeError } from '../errors/customErrors.js';
import {
  assertValidImageFile,
  isDeclaredImageType,
  MAX_IMAGE_FILES_PER_REQUEST,
  MAX_IMAGE_SIZE_BYTES,
} from '../utils/fileValidation.js';

const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: {
    // busboy treats the limit as inclusive: it aborts a file whose size is exactly
    // equal to it. One extra byte is allowed through to the byte-level check so
    // that a 5 MB file is accepted and a 5 MB + 1 byte file is refused.
    fileSize: MAX_IMAGE_SIZE_BYTES + 1,
    files: MAX_IMAGE_FILES_PER_REQUEST,
    fields: 20,
    parts: MAX_IMAGE_FILES_PER_REQUEST + 20,
  },
  fileFilter: (_req, file, callback) => {
    if (!isDeclaredImageType(file)) {
      return callback(
        new BadRequestError('Only JPEG, PNG, GIF, WebP or AVIF images are allowed')
      );
    }
    return callback(null, true);
  },
});

// Multer's callback is not an Express error handler: it is called as
// callback(error) or callback(null, file). Anything thrown or passed by multer has
// to be translated here and handed to next() explicitly, otherwise an oversized
// upload surfaces as a crash instead of a 413.
const toUploadError = (error) => {
  if (!(error instanceof multer.MulterError)) return error;

  if (error.code === 'LIMIT_FILE_SIZE') {
    return new PayloadTooLargeError('Image is larger than the 5 MB limit');
  }
  if (error.code === 'LIMIT_FILE_COUNT' || error.code === 'LIMIT_UNEXPECTED_FILE') {
    return new BadRequestError('Only one image file is allowed');
  }
  if (error.code === 'LIMIT_FIELD_COUNT' || error.code === 'LIMIT_PART_COUNT' || error.code === 'LIMIT_FIELD_VALUE') {
    return new BadRequestError('Too many fields in the upload');
  }
  return new BadRequestError('Invalid file upload');
};

// `upload.single('image')` plus the byte-level check, as one middleware so a
// route cannot accidentally mount the upload without it.
export const uploadSingleImage = [
  (req, res, next) => {
    upload.single('image')(req, res, (error) => {
      if (error) return next(toUploadError(error));
      return next();
    });
  },
  (req, res, next) => {
    try {
      if (req.file) {
        req.file.detectedMimeType = assertValidImageFile(req.file);
      }
      return next();
    } catch (error) {
      return next(error);
    }
  },
];

export default upload;
