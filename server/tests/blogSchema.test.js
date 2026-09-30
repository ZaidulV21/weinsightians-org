import './setup.js';
import test from 'node:test';
import assert from 'node:assert/strict';

import Blog, { BLOG_STATUS, publishedFilter } from '../models/Blog.js';

// Schema-level rules, checked without a database: Mongoose validates documents
// in memory, so these run offline.
//
// The distinction that matters here: the *quality* minimums (how long a title or
// description must be) are enforced where requests arrive, in
// middlewares/validationMiddleware.js. The schema only guarantees a document is
// structurally sound. An update calls doc.save(), and save() validates every
// field - so a minimum length in the schema would lock the owner out of renaming
// or publishing any older post that happens to have a short description, unless
// they also rewrote that untouched field first.

const valid = (overrides = {}) => ({
  title: 'A perfectly reasonable title',
  description: 'A description that comfortably clears the minimum.',
  content: '<p>Body copy that is long enough to be a real post.</p>',
  author: 'Admin',
  ...overrides,
});

test('a new post with good fields validates and gains a slug', async () => {
  const blog = new Blog(valid());
  assert.equal(blog.slug, undefined, 'no slug until validation runs');

  await blog.validate();
  assert.equal(blog.slug, 'a-perfectly-reasonable-title');
});

test('a missing title is still a hard failure', async () => {
  const blog = new Blog(valid({ title: undefined }));
  await assert.rejects(() => blog.validate(), /title/i);
});

test('a legacy post with a short description can still be saved', async () => {
  // A post written before the minimums existed. Renaming it or publishing it must
  // not be blocked by a field the editor never touched.
  const blog = new Blog(valid({ description: 'Short' }));
  blog.markModified('description');
  await blog.validate();
});

test('an oversized title is still rejected', async () => {
  const blog = new Blog(valid({ title: 'a'.repeat(201) }));
  await assert.rejects(() => blog.validate(), /title/i);
});

test('status is limited to draft or published', async () => {
  const blog = new Blog(valid({ status: 'pending' }));
  await assert.rejects(() => blog.validate(), /status/i);
});

test('a missing slug is generated from the title', async () => {
  const blog = new Blog(valid({ title: 'Why Web SEO Matters' }));
  await blog.validate();
  assert.equal(blog.slug, 'why-web-seo-matters');
});

test('a slug with unsafe characters is rejected', async () => {
  const blog = new Blog(valid({ slug: '../../etc/passwd' }));
  await assert.rejects(() => blog.validate(), /slug/i);
});

test('published posts report a usable publish date even when the field is empty', async () => {
  const blog = new Blog(valid({ status: BLOG_STATUS.PUBLISHED, publishedAt: null }));
  blog.createdAt = new Date('2023-06-01T00:00:00.000Z');
  blog.$__.createdAt = blog.createdAt;

  const json = blog.toJSON();
  assert.equal(new Date(json.publishedAt).toISOString(), '2023-06-01T00:00:00.000Z');
});

test('a draft never reports a publish date', async () => {
  const blog = new Blog(valid({ status: BLOG_STATUS.DRAFT, publishedAt: null }));
  blog.createdAt = new Date('2023-06-01T00:00:00.000Z');
  blog.$__.createdAt = blog.createdAt;

  assert.equal(blog.toJSON().publishedAt, null);
});

test('the public filter never shows drafts, and still shows legacy posts', () => {
  // `{ status: null }` is deliberate. In MongoDB a null comparison also matches
  // documents where the field is absent, so a post written before `status`
  // existed stays public. Filtering on `status: 'published'` alone would hide
  // every one of those posts and silently empty the public blog.
  const filter = publishedFilter();

  assert.deepEqual(filter, {
    $or: [{ status: BLOG_STATUS.PUBLISHED }, { status: null }],
  });

  // Simulating the query in plain JavaScript is misleading for the missing-field
  // case, so only the two unambiguous outcomes are asserted here.
  const matchesInMongo = (doc) =>
    filter.$or.some((clause) =>
      Object.entries(clause).every(([key, value]) => (value === null ? doc[key] == null : doc[key] === value))
    );

  assert.equal(matchesInMongo({ status: 'published' }), true);
  assert.equal(matchesInMongo({ status: null }), true, 'a post written before status existed');
  assert.equal(matchesInMongo({}), true, 'field absent entirely');
  assert.equal(matchesInMongo({ status: 'draft' }), false);
});
