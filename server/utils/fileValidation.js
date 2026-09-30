// ==========================================
// IMAGE FILE VALIDATION
// ==========================================
// The browser is not trusted. A 5 MB check in React says nothing about what
// actually reaches Cloudinary, and the multipart MIME type is just a string the
// client chose. Every upload is therefore checked twice:
//   1. by declared type and extension (cheap, in the multer filter), and
//   2. by the file's real magic bytes (authoritative, before any upload).
//
// SVG is deliberately not allowed: it is an XML document that can carry
// <script>, so accepting it would re-open the XSS hole this phase closes.

import { BadRequestError, PayloadTooLargeError } from '../errors/customErrors.js';

export const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB
export const MAX_IMAGE_FILES_PER_REQUEST = 1;

export const ALLOWED_IMAGE_MIME_TYPES = Object.freeze([
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/avif',
]);

const EXTENSION_ALLOWLIST = Object.freeze({
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
});

const ascii = (buffer, start, end) => buffer.subarray(start, end).toString('latin1');

const startsWith = (buffer, bytes) =>
  bytes.every((byte, index) => buffer[index] === byte);

const readContainerBrand = (buffer) => {
  // ISO-BMFF (AVIF/HEIF): bytes 4-8 are "ftyp", the brand follows.
  if (ascii(buffer, 4, 8) !== 'ftyp') return null;
  return ascii(buffer, 8, 12).toLowerCase();
};

// Identifies an image from its first bytes. Returns null for anything that is
// not one of the allowed raster formats.
export const detectImageMimeType = (buffer) => {
  if (!Buffer.isBuffer(buffer) || buffer.length < 12) return null;

  if (startsWith(buffer, [0xff, 0xd8, 0xff])) return 'image/jpeg';
  if (startsWith(buffer, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) return 'image/png';
  if (ascii(buffer, 0, 6) === 'GIF87a' || ascii(buffer, 0, 6) === 'GIF89a') return 'image/gif';

  if (ascii(buffer, 0, 4) === 'RIFF' && ascii(buffer, 8, 12) === 'WEBP') return 'image/webp';

  const brand = readContainerBrand(buffer);
  if (brand && ['avif', 'avis'].includes(brand)) return 'image/avif';

  return null;
};

export const getFileExtension = (filename = '') => {
  const dot = filename.lastIndexOf('.');
  return dot === -1 ? '' : filename.slice(dot).toLowerCase();
};

// Cheap pre-check used by the multer filter, before the file is buffered.
export const isDeclaredImageType = (file = {}) => {
  const mimeType = (file.mimetype || '').toLowerCase();
  const extension = getFileExtension(file.originalname);

  if (!ALLOWED_IMAGE_MIME_TYPES.includes(mimeType)) return false;
  if (!Object.prototype.hasOwnProperty.call(EXTENSION_ALLOWLIST, extension)) return false;

  // The extension must agree with the declared type, so a .php or .svg renamed
  // to .png with a matching content type still gets caught.
  return EXTENSION_ALLOWLIST[extension] === mimeType;
};

// Authoritative check, run on the buffered file before it is streamed anywhere.
export const assertValidImageFile = (file) => {
  if (!file) return null;

  if (typeof file.size === 'number' && file.size > MAX_IMAGE_SIZE_BYTES) {
    throw new PayloadTooLargeError('Image is larger than the 5 MB limit');
  }

  if (!isDeclaredImageType(file)) {
    throw new BadRequestError('Only JPEG, PNG, GIF, WebP or AVIF images are allowed');
  }

  const detected = detectImageMimeType(file.buffer);
  if (!detected) {
    throw new BadRequestError('File content is not a recognised image');
  }

  if (detected !== file.mimetype.toLowerCase()) {
    throw new BadRequestError('File content does not match its declared type');
  }

  return detected;
};
