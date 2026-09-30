import './setup.js';
import test from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import mongoose from 'mongoose';

import app from '../app.js';
import Blog from '../models/Blog.js';
import User from '../models/User.js';
import { createJWT } from '../utils/tokenUtils.js';
import { MAX_IMAGE_SIZE_BYTES } from '../utils/fileValidation.js';

// The multipart path through the real route: real multer limits, real fileFilter,
// real magic-byte check. Only the database is replaced.

const ADMIN_ID = new mongoose.Types.ObjectId();
const ADMIN_TOKEN = createJWT({ userId: String(ADMIN_ID), role: 'admin', tokenVersion: 0 });
const BLOG_ID = new mongoose.Types.ObjectId();

const chain = (result) => {
  const q = { select: () => q, sort: () => q, skip: () => q, limit: () => q, lean: async () => result };
  q.then = (resolve, reject) => Promise.resolve(result).then(resolve, reject);
  return q;
};

const withSession = async (run) => {
  const restore = [];
  const swap = (target, key, value) => {
    restore.push([target, key, target[key]]);
    target[key] = value;
  };

  swap(User, 'findById', () => chain({ _id: ADMIN_ID, role: 'admin', tokenVersion: 0 }));
  swap(Blog, 'findOne', () => chain(null));
  swap(Blog, 'create', async (doc) => ({ ...doc, _id: BLOG_ID }));

  try {
    return await run();
  } finally {
    restore.reverse().forEach(([target, key, value]) => {
      target[key] = value;
    });
  }
};

// Real signatures, built from byte values so this file has no control characters.
const png = Buffer.concat([
  Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d]),
  Buffer.alloc(32, 0x11),
]);

const jpegHeader = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46, 0x00, 0x01]);

// A complete, valid create request, optionally carrying one file in `image`.
const post = ({ file = null, title, description, author, content } = {}) => {
  const req = request(app)
    .post('/api/v1/blogs')
    .set('Cookie', [`token=${ADMIN_TOKEN}`])
    .field('title', title || 'A Post With An Image')
    .field('description', description || 'A description long enough to satisfy the rules.')
    .field('author', author || 'Admin')
    .field('content', content || '<p>Body copy that is long enough to pass validation.</p>');

  if (file) {
    req.attach('image', file.content, { filename: file.filename, contentType: file.contentType });
  }

  return req;
};

test('a real PNG passes the upload layer and reaches the controller', async () => {
  await withSession(async () => {
    const res = await post({
      file: { filename: 'cover.png', contentType: 'image/png', content: png },
    });

    // Cloudinary is not configured under test, so the controller stops there with a
    // clear message. A rejection inside the upload layer would be a different 400.
    assert.ok([201, 400].includes(res.status), `unexpected status ${res.status}`);
    if (res.status === 400) {
      assert.match(res.body.msg, /Image uploads are not available/i);
    } else {
      assert.match(res.body.blog.image, /^https:\/\/res\.cloudinary\.com\//);
    }
  });
});

test('a disguised executable is refused with 400', async () => {
  await withSession(async () => {
    const res = await post({
      file: {
        filename: 'shell.png',
        contentType: 'image/png',
        content: Buffer.from('<?php system($_GET[0]);', 'latin1'),
      },
    });

    assert.equal(res.status, 400);
    assert.equal(res.body.success, false);
  });
});

test('a declared type the CMS does not allow is refused', async () => {
  await withSession(async () => {
    const res = await post({
      file: {
        filename: 'payload.exe',
        contentType: 'application/octet-stream',
        content: Buffer.from([0x4d, 0x5a, 0x90, 0x00]),
      },
    });

    assert.equal(res.status, 400);
    assert.ok(res.body.msg);
  });
});

test('an SVG is refused', async () => {
  await withSession(async () => {
    const res = await post({
      file: {
        filename: 'logo.svg',
        contentType: 'image/svg+xml',
        content: Buffer.from('<svg xmlns="http://www.w3.org/2000/svg"><script>alert(1)</script></svg>', 'latin1'),
      },
    });

    assert.equal(res.status, 400);
  });
});

test('an oversized image is refused with 413', async () => {
  await withSession(async () => {
    const res = await post({
      file: {
        filename: 'huge.jpg',
        contentType: 'image/jpeg',
        // 5 MB plus one byte, behind a valid JPEG header so size is what fails.
        content: Buffer.concat([jpegHeader, Buffer.alloc(MAX_IMAGE_SIZE_BYTES)]),
      },
    });

    assert.equal(res.status, 413);
    assert.match(res.body.msg, /5 MB/i);
  });
});

test('an image at exactly the limit is not refused for size', async () => {
  await withSession(async () => {
    const res = await post({
      file: {
        filename: 'edge.jpg',
        contentType: 'image/jpeg',
        content: Buffer.concat([jpegHeader, Buffer.alloc(MAX_IMAGE_SIZE_BYTES - jpegHeader.length)]),
      },
    });

    assert.notEqual(res.status, 413, 'the size limit is not off by one');
  });
});

test('an anonymous upload never reaches the upload layer', async () => {
  const res = await request(app)
    .post('/api/v1/blogs')
    .field('title', 'A Post With An Image')
    .attach('image', png, { filename: 'cover.png', contentType: 'image/png' });

  assert.equal(res.status, 401);
});
