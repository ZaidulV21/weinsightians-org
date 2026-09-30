import './setup.js';
import test from 'node:test';
import assert from 'node:assert/strict';

import {
  assertValidImageFile,
  detectImageMimeType,
  isDeclaredImageType,
  getFileExtension,
  MAX_IMAGE_SIZE_BYTES,
} from '../utils/fileValidation.js';
import { BadRequestError, PayloadTooLargeError } from '../errors/customErrors.js';

const latin1 = (text) => Buffer.from(text, 'latin1');
const bytes = (...values) => Buffer.from(values);

// Real file signatures for every format we accept, built from byte values so the
// test file itself contains no control characters.
const HEADERS = {
  jpeg: bytes(0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46, 0x00, 0x01),
  png: bytes(0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d),
  gif: Buffer.concat([latin1('GIF89a'), Buffer.alloc(6, 0x2a)]),
  webp: Buffer.concat([latin1('RIFF'), bytes(0x1a, 0x00, 0x00, 0x00), latin1('WEBP')]),
  avif: Buffer.concat([bytes(0x00, 0x00, 0x00, 0x20), latin1('ftyp'), latin1('avif')]),
};

const EXTENSIONS = { jpeg: '.jpg', png: '.png', gif: '.gif', webp: '.webp', avif: '.avif' };
const MIMES = {
  jpeg: 'image/jpeg',
  png: 'image/png',
  gif: 'image/gif',
  webp: 'image/webp',
  avif: 'image/avif',
};

const file = (name, mimetype, buffer, size) => ({
  originalname: name,
  mimetype,
  buffer,
  size: size ?? buffer.length,
});

// ==========================================
// ACCEPTED FORMATS
// ==========================================

test('every allowed image format is accepted', () => {
  Object.keys(HEADERS).forEach((format) => {
    const f = file(`photo${EXTENSIONS[format]}`, MIMES[format], HEADERS[format]);
    assert.equal(isDeclaredImageType(f), true, `${format}: declared type`);
    assert.equal(detectImageMimeType(HEADERS[format]), MIMES[format], `${format}: magic bytes`);
    assert.equal(assertValidImageFile(f), MIMES[format], `${format}: full check`);
  });
});

// ==========================================
// NON-IMAGES
// ==========================================

test('non-image uploads are rejected', () => {
  const vectors = [
    ['payload.exe', 'application/octet-stream', bytes(0x4d, 0x5a, 0x90, 0x00)],
    ['script.html', 'text/html', latin1('<script>alert(1)</script>')],
    ['page.php', 'application/x-httpd-php', latin1('<?php echo 1;')],
    ['doc.pdf', 'application/pdf', latin1('%PDF-1.7')],
    ['sheet.xlsx', 'application/vnd.ms-excel', bytes(0x50, 0x4b, 0x03, 0x04)],
    ['clip.mp4', 'video/mp4', Buffer.concat([bytes(0, 0, 0, 24), latin1('ftypmp42')])],
  ];

  vectors.forEach(([name, mimetype, buffer]) => {
    const f = file(name, mimetype, buffer);
    assert.equal(isDeclaredImageType(f), false, name);
    assert.equal(detectImageMimeType(buffer), null, name);
    assert.throws(() => assertValidImageFile(f), BadRequestError, name);
  });
});

test('SVG is rejected even though the browser calls it an image', () => {
  const svg = latin1('<svg xmlns="http://www.w3.org/2000/svg"><script>alert(1)</script></svg>');
  const f = file('logo.svg', 'image/svg+xml', svg);
  assert.equal(isDeclaredImageType(f), false);
  assert.equal(detectImageMimeType(svg), null);
  assert.throws(() => assertValidImageFile(f), BadRequestError);
});

// ==========================================
// CONTENT / DECLARED TYPE MISMATCH
// ==========================================

test('a renamed file is caught by its real content', () => {
  // A PHP script claiming to be a JPEG with a .jpg name.
  const disguised = file('shell.jpg', 'image/jpeg', latin1('<?php system($_GET[0]);'));
  assert.equal(isDeclaredImageType(disguised), true, 'declared type alone looks fine');
  assert.throws(() => assertValidImageFile(disguised), BadRequestError, 'magic bytes must reject it');
});

test('an image with a lying extension is rejected', () => {
  const f = file('photo.svg', 'image/jpeg', HEADERS.jpeg);
  assert.equal(isDeclaredImageType(f), false);
});

test('an image with a lying MIME type is rejected', () => {
  const f = file('photo.png', 'image/jpeg', HEADERS.png);
  assert.equal(isDeclaredImageType(f), false, 'extension and MIME must agree');
});

test('a polyglot file that starts with a valid image header is still stored as an image', () => {
  const polyglot = Buffer.concat([HEADERS.png, latin1('<?php system($_GET[0]);')]);
  const f = file('polyglot.png', 'image/png', polyglot);
  // Accepted, because the declared type matched and the bytes start with a real
  // PNG signature. It is only ever stored in Cloudinary and served back as an
  // image, so the trailing payload is never executed.
  assert.equal(assertValidImageFile(f), 'image/png');
});

test('a truncated or empty file is rejected', () => {
  assert.equal(detectImageMimeType(Buffer.alloc(0)), null);
  assert.equal(detectImageMimeType(bytes(0xff, 0xd8)), null, 'too short to be a JPEG');
  assert.throws(() => assertValidImageFile(file('a.png', 'image/png', Buffer.alloc(4))), BadRequestError);
});

test('a missing file is not an error', () => {
  assert.equal(assertValidImageFile(undefined), null);
  assert.equal(assertValidImageFile(null), null);
});

// ==========================================
// SIZE
// ==========================================

test('an oversized image is rejected with 413', () => {
  const oversized = file('big.jpg', 'image/jpeg', HEADERS.jpeg, MAX_IMAGE_SIZE_BYTES + 1);
  assert.throws(() => assertValidImageFile(oversized), PayloadTooLargeError);
});

test('an image exactly at the limit is accepted', () => {
  const atLimit = file('big.jpg', 'image/jpeg', HEADERS.jpeg, MAX_IMAGE_SIZE_BYTES);
  assert.equal(assertValidImageFile(atLimit), 'image/jpeg');
});

// ==========================================
// EXTENSION PARSING
// ==========================================

test('extensions are compared case-insensitively', () => {
  assert.equal(getFileExtension('PHOTO.JPG'), '.jpg');
  assert.equal(getFileExtension('photo'), '');
  assert.equal(isDeclaredImageType(file('PHOTO.JPG', 'image/jpeg', HEADERS.jpeg)), true);
});
