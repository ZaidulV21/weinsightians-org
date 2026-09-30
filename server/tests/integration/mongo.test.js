// ==========================================
// INTEGRATION TESTS - REAL DATABASE
// ==========================================
// Everything else in tests/ replaces Mongoose so the suite stays fast and needs
// no services. That is the right trade for most bugs, but it has a blind spot:
// anything Mongoose itself does on write - pre-validate hooks, path validators,
// unique indexes, real queries - is never executed. A callback-style
// `pre('validate', fn(next))` hook, for example, passes every stubbed test and
// then throws on the first real save.
//
// This file runs the real app against a real MongoDB, and it is deliberately not
// part of `npm test`: it needs a MongoDB binary downloaded on first use, and the
// quick suite should stay runnable anywhere. It is not a devDependency of the
// project, so install it when you want to run this:
//
//   npm install --no-save mongodb-memory-server
//   node --test --test-timeout=300000 tests/integration/mongo.test.js
//
// Status: written and syntax-checked, but never executed. The machine this was
// written on had no room for the MongoDB binary, so treat the first run as a
// debugging session, not as a green test.
//
// Nothing here touches a real network: no Cloudinary, no external database.

process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'integration-secret-value-that-is-long-enough';
process.env.JWT_EXPIRES_IN = '1h';
delete process.env.CLOUDINARY_CLOUD_NAME;
delete process.env.CLOUDINARY_API_KEY;
delete process.env.CLOUDINARY_API_SECRET;

import test, { after, before } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

import app from '../../app.js';
import Blog, { BLOG_STATUS } from '../../models/Blog.js';
import User from '../../models/User.js';

let mongo;
let admin;

// The agent's cookie jar, for the one test that needs a plain request carrying
// the admin cookie copied out of it.
function adminCookie() {
  return admin.jar
    .getCookies('http://127.0.0.1')
    .map((cookie) => `${cookie.key}=${cookie.value}`);
}

const asAdmin = (req) => admin(req).set('Cookie', adminCookie());

const POST = (overrides = {}) => ({
  title: 'A Post For Testing',
  description: 'A description that comfortably clears the minimum length.',
  content: '<p>Body copy that is long enough to count as a real post.</p>',
  author: 'Admin',
  ...overrides,
});

before(async () => {
  mongo = await MongoMemoryServer.create();
  await mongoose.connect(mongo.getUri());

  admin = request.agent(app);

  // The one real bootstrap call, exactly as the site would do it.
  const res = await admin.post('/api/v1/auth/bootstrap').send({
    name: 'Integration Admin',
    email: 'admin@example.com',
    password: 'integration-pass-123',
  });
  assert.equal(res.status, 201, `bootstrap failed: ${JSON.stringify(res.body)}`);
});

after(async () => {
  await mongoose.disconnect();
  await mongo?.stop();
});

test('a second bootstrap is refused once an admin exists', async () => {
  const res = await request(app)
    .post('/api/v1/auth/bootstrap')
    .send({ name: 'Second', email: 'second@example.com', password: 'another-pass-123' });

  assert.equal(res.status, 403);
  assert.equal(await User.countDocuments(), 1);
});

test('login sets an HttpOnly cookie and the session reads back', async () => {
  const res = await admin.post('/api/v1/auth/login').send({
    email: 'admin@example.com',
    password: 'integration-pass-123',
  });
  assert.equal(res.status, 200);

  const cookie = res.headers['set-cookie'].join(';');
  assert.match(cookie, /HttpOnly/i);
  assert.match(cookie, /SameSite=Strict/i);

  const me = await admin.get('/api/v1/auth/me');
  assert.equal(me.status, 200);
  assert.equal(me.body.user.email, 'admin@example.com');
  assert.equal(me.body.user.role, 'admin');
  assert.equal(me.body.password, undefined, 'the hash must never be returned');
});

test('a saved post gets a slug from its title', async () => {
  const res = await asAdmin(request(app)).post('/api/v1/blogs').send(POST({ title: 'Why Web SEO Matters In 2026' }));

  assert.equal(res.status, 201, JSON.stringify(res.body));
  assert.equal(res.body.blog.slug, 'why-web-seo-matters-in-2026');
  assert.equal(res.body.blog.status, BLOG_STATUS.PUBLISHED);
  assert.ok(res.body.blog.publishedAt, 'a post published on creation is stamped');

  const stored = await Blog.findById(res.body.blog._id);
  assert.equal(stored.title, 'Why Web SEO Matters In 2026');
});

test('two concurrent posts with the same title both survive', async () => {
  const [first, second] = await Promise.all([
    asAdmin(request(app)).post('/api/v1/blogs').send(POST({ title: 'Duplicate Title Here' })),
    asAdmin(request(app)).post('/api/v1/blogs').send(POST({ title: 'Duplicate Title Here' })),
  ]);

  const created = [first, second].filter((res) => res.status === 201);
  assert.equal(created.length, 2, `statuses were ${first.status} and ${second.status}`);

  const slugs = created.map((res) => res.body.blog.slug);
  assert.notEqual(slugs[0], slugs[1], 'the second post needs a different slug');
  assert.equal(await Blog.countDocuments({ slug: { $in: slugs } }), 2, 'the unique index held');
});

test('a draft is invisible publicly and reachable by an admin', async () => {
  const created = await asAdmin(request(app)).post('/api/v1/blogs').send(POST({ title: 'Unfinished Thinking', status: 'draft' }));

  assert.equal(created.status, 201, JSON.stringify(created.body));
  assert.equal(created.body.blog.publishedAt, null, 'a draft has no publish date');

  const { slug } = created.body.blog;

  const publicList = await request(app).get('/api/v1/blogs');
  assert.equal(publicList.status, 200);
  assert.ok(!publicList.body.blogs.some((blog) => blog.slug === slug), 'not in the public list');

  assert.equal((await request(app).get(`/api/v1/blogs/${slug}`)).status, 404, 'not readable by slug');

  const adminOne = await asAdmin(request(app)).get(`/api/v1/blogs/admin/slug/${slug}`);
  assert.equal(adminOne.status, 200);
  assert.equal(adminOne.body.blog.status, 'draft');

  const adminList = await asAdmin(request(app)).get('/api/v1/blogs/admin/all');
  assert.equal(adminList.status, 200);
  assert.ok(adminList.body.blogs.some((blog) => blog.slug === slug));
  assert.equal(adminList.body.draftCount + adminList.body.publishedCount, adminList.body.count);
});

test('publishing stamps the date once and keeps it afterwards', async () => {
  const created = await asAdmin(request(app)).post('/api/v1/blogs').send(POST({ title: 'Draft That Goes Live', status: 'draft' }));
  const { _id } = created.body.blog;

  const published = await asAdmin(request(app)).patch(`/api/v1/blogs/${_id}/status`).send({ status: 'published' });
  assert.equal(published.status, 200);
  const firstStamp = published.body.blog.publishedAt;
  assert.ok(firstStamp);

  assert.ok(
    (await request(app).get('/api/v1/blogs')).body.blogs.some((blog) => blog._id === _id),
    'public as soon as it is published'
  );

  const unpublished = await asAdmin(request(app)).patch(`/api/v1/blogs/${_id}/status`).send({ status: 'draft' });
  assert.equal(unpublished.body.blog.publishedAt, firstStamp, 'unpublishing must not erase the date');

  const republished = await asAdmin(request(app)).patch(`/api/v1/blogs/${_id}/status`).send({ status: 'published' });
  assert.equal(republished.body.blog.publishedAt, firstStamp, 'the original date is kept');
});

test('editing a title never moves the published URL', async () => {
  const created = await asAdmin(request(app)).post('/api/v1/blogs').send(POST({ title: 'Original Title' }));
  const { _id, slug } = created.body.blog;

  const updated = await asAdmin(request(app)).patch(`/api/v1/blogs/${_id}`).send({ title: 'Completely New Title' });
  assert.equal(updated.status, 200, JSON.stringify(updated.body));
  assert.equal(updated.body.blog.title, 'Completely New Title');
  assert.equal(updated.body.blog.slug, slug, 'the slug is a permanent address');

  assert.equal((await request(app).get(`/api/v1/blogs/${slug}`)).status, 200, 'the old link still works');
});

test('stored content is sanitized in the database, not only on the way out', async () => {
  const created = await asAdmin(request(app)).post('/api/v1/blogs').send(
    POST({
      title: 'Sanitisation Check',
      content:
        '<p onclick="steal()">Body copy that is long enough to count as a real post.</p>' +
        '<script>fetch("https://evil.example")</script>' +
        '<a href="javascript:alert(1)">a link</a>',
    })
  );

  assert.equal(created.status, 201, JSON.stringify(created.body));

  const stored = await Blog.findById(created.body.blog._id);
  assert.ok(!stored.content.includes('<script'), 'script tags must not be stored');
  assert.ok(!stored.content.includes('onclick'), 'event handlers must not be stored');
  assert.ok(!stored.content.includes('javascript:'), 'javascript: URLs must not be stored');
  assert.ok(stored.content.includes('<p'), 'the safe markup is kept');
});

test('a post written before status existed stays public and stays editable', async () => {
  // Exactly the shape of a document from before the publishing model: no status,
  // no publish date, and a description shorter than today's minimum.
  const legacy = await Blog.collection.insertOne({
    title: 'An Older Post',
    description: 'Short',
    content: '<p>Written years ago, before any of this existed.</p>',
    author: 'Admin',
    slug: 'an-older-post',
    createdAt: new Date('2021-05-04T00:00:00.000Z'),
    updatedAt: new Date('2021-05-04T00:00:00.000Z'),
  });

  const found = (await request(app).get('/api/v1/blogs')).body.blogs.find(
    (blog) => blog._id === legacy.insertedId.toString()
  );
  assert.ok(found, 'a legacy post must not disappear from the public blog');
  assert.equal(new Date(found.publishedAt).toISOString(), '2021-05-04T00:00:00.000Z', 'falls back to createdAt');

  // The point of the check: a short description must not block an unrelated edit.
  const renamed = await asAdmin(request(app)).patch(`/api/v1/blogs/${legacy.insertedId}`).send({ title: 'An Older Post, Retitled' });

  assert.equal(renamed.status, 200, `editing a legacy post failed: ${JSON.stringify(renamed.body)}`);
  assert.equal(renamed.body.blog.title, 'An Older Post, Retitled');
  assert.equal(renamed.body.blog.slug, 'an-older-post', 'the original address is kept');
});

test('an unauthenticated write is refused and nothing is stored', async () => {
  const before_ = await Blog.countDocuments();

  const res = await request(app).post('/api/v1/blogs').send(POST({ title: 'Should Never Exist' }));

  assert.equal(res.status, 401);
  assert.equal(await Blog.countDocuments(), before_);
  assert.equal(await Blog.countDocuments({ title: 'Should Never Exist' }), 0);
});

test('logging out invalidates the cookie that was used to log out', async () => {
  const session = request.agent(app);

  const login = await session.post('/api/v1/auth/login').send({
    email: 'admin@example.com',
    password: 'integration-pass-123',
  });
  assert.equal(login.status, 200);
  assert.equal((await session.get('/api/v1/auth/me')).status, 200);

  assert.equal((await session.post('/api/v1/auth/logout')).status, 200);

  assert.equal((await session.get('/api/v1/auth/me')).status, 401, 'the old cookie is now worthless');
});

test('a wrong password is refused and sets no cookie', async () => {
  const res = await request(app)
    .post('/api/v1/auth/login')
    .send({ email: 'admin@example.com', password: 'wrong-password' });

  assert.equal(res.status, 401);
  assert.ok(!res.headers['set-cookie'], 'no cookie on a failed login');
});

test('deleting removes the post from the database', async () => {
  const created = await asAdmin(request(app)).post('/api/v1/blogs').send(POST({ title: 'Temporary Post' }));
  const { _id, slug } = created.body.blog;

  assert.equal((await asAdmin(request(app)).delete(`/api/v1/blogs/${_id}`)).status, 200);
  assert.equal(await Blog.findById(_id), null);
  assert.equal((await request(app).get(`/api/v1/blogs/${slug}`)).status, 404);
});
