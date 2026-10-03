import './setup.js';
import test from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';

import app from '../app.js';
import Blog, { BLOG_STATUS, publishedFilter } from '../models/Blog.js';
import {
  SITEMAP_ORIGIN,
  STATIC_SITEMAP_ROUTES,
  blogLastmod,
  isSitemapSafeSlug,
  renderSitemap,
  toW3cDateTime,
} from '../utils/sitemapUtils.js';

// ==========================================
// HARNESS
// ==========================================
// The real route, middleware and controller are exercised. Only Mongoose is
// replaced, so the filter the controller actually sends is asserted rather than
// assumed.

const chain = (result) => {
  const q = {
    select: () => q,
    sort: () => q,
    skip: () => q,
    limit: () => q,
    lean: async () => result,
  };
  q.then = (resolve, reject) => Promise.resolve(result).then(resolve, reject);
  return q;
};

const withStubs = async (stubs, run) => {
  const originals = {};
  Object.keys(stubs).forEach((key) => {
    originals[key] = Blog[key];
    Blog[key] = stubs[key];
  });
  try {
    return await run();
  } finally {
    Object.keys(originals).forEach((key) => {
      Blog[key] = originals[key];
    });
  }
};

// Returns whatever the stubbed query resolves with, and the filter it was given.
const serveBlogs = async (blogs) => {
  let filter = null;
  let projected = null;

  const res = await withStubs(
    {
      find: (query) => {
        filter = query;
        const q = chain(blogs);
        const originalSelect = q.select;
        q.select = (fields) => {
          projected = fields;
          return originalSelect(fields);
        };
        return q;
      },
    },
    () => request(app).get('/api/v1/sitemap.xml')
  );

  return { res, filter, projected };
};

const blog = (overrides = {}) => ({
  slug: 'a-published-post',
  createdAt: new Date('2026-01-01T00:00:00.000Z'),
  updatedAt: new Date('2026-02-02T00:00:00.000Z'),
  publishedAt: new Date('2026-01-15T00:00:00.000Z'),
  ...overrides,
});

const locs = (xml) => [...xml.matchAll(/<loc>([^<]*)<\/loc>/g)].map((m) => m[1]);
const lastmodOf = (xml, loc) => {
  const block = xml.match(new RegExp(`<loc>${loc.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}</loc>\\s*(<lastmod>([^<]*)</lastmod>)?`));
  return block?.[2] ?? null;
};

// ==========================================
// 1-2. STATUS AND CONTENT TYPE
// ==========================================

test('the sitemap endpoint returns 200 and XML', async () => {
  const { res } = await serveBlogs([blog()]);

  assert.equal(res.status, 200);
  assert.match(res.headers['content-type'], /application\/xml/i);
  assert.match(res.headers['content-type'], /charset=utf-8/i);
  // It must not be the JSON envelope the rest of the API uses.
  assert.doesNotMatch(res.headers['content-type'], /application\/json/i);
  assert.match(res.text, /^<\?xml version="1\.0" encoding="UTF-8"\?>/);
});

test('the response is served with a short, sane cache policy', async () => {
  const { res } = await serveBlogs([]);
  const cacheControl = res.headers['cache-control'] || '';
  assert.match(cacheControl, /public/);
  const maxAge = Number(cacheControl.match(/max-age=(\d+)/)?.[1]);
  assert.ok(Number.isFinite(maxAge), 'a max-age must be stated');
  // Long enough to spare the database, short enough that a new post is not
  // hidden from crawlers for an unreasonable period.
  assert.ok(maxAge > 0 && maxAge <= 3600, `max-age must be between 1s and 1h, got ${maxAge}`);
});

// ==========================================
// 3. STATIC ROUTES
// ==========================================

test('the static indexable routes are all present', async () => {
  const { res } = await serveBlogs([]);
  const found = locs(res.text);

  for (const route of STATIC_SITEMAP_ROUTES) {
    assert.ok(
      found.includes(`${SITEMAP_ORIGIN}${route.path}`),
      `missing static route ${route.path}`
    );
  }

  // The seven routes the previous hand-written sitemap declared.
  assert.deepEqual(found, [
    'https://weinsightian.tech/',
    'https://weinsightian.tech/services',
    'https://weinsightian.tech/about',
    'https://weinsightian.tech/contact',
    'https://weinsightian.tech/privacy',
    'https://weinsightian.tech/sitemap',
    'https://weinsightian.tech/blogs',
  ]);
});

test('admin, non-canonical and unknown routes are never listed', async () => {
  const { res } = await serveBlogs([blog()]);

  assert.doesNotMatch(res.text, /\/admin/i);
  assert.doesNotMatch(res.text, /weinsightians-backend-repo/i);
  assert.doesNotMatch(res.text, /localhost/i);
  assert.doesNotMatch(res.text, /onrender\.com/i);
  // /home is the canonicalised duplicate of /, and /blog has no such route.
  assert.doesNotMatch(res.text, /<loc>https:\/\/weinsightian\.tech\/home<\/loc>/);
  assert.doesNotMatch(res.text, /<loc>https:\/\/weinsightian\.tech\/blog<\/loc>/);
});

test('static lastmod values are preserved exactly as previously published', async () => {
  // public/sitemap.xml shipped /privacy with a date-only lastmod. Converting it
  // to a full timestamp would change the live document for no benefit, so the
  // static half of the sitemap must stay byte-identical.
  const { res } = await serveBlogs([]);
  assert.equal(lastmodOf(res.text, `${SITEMAP_ORIGIN}/privacy`), '2026-09-26');
  assert.equal(lastmodOf(res.text, `${SITEMAP_ORIGIN}/services`), null);
});

// ==========================================
// 4-6, 17. PUBLICATION STATE
// ==========================================

test('a published post is listed and a draft is not', async () => {
  const { res, filter } = await serveBlogs([
    blog({ slug: 'live-post', status: BLOG_STATUS.PUBLISHED }),
    blog({ slug: 'secret-draft', status: BLOG_STATUS.DRAFT }),
  ]);

  assert.ok(locs(res.text).includes('https://weinsightian.tech/blog/live-post'));
  assert.ok(!locs(res.text).some((loc) => loc.includes('secret-draft')), 'a draft must never leak');
  assert.doesNotMatch(res.text, /secret-draft/);

  // The endpoint must ask for published posts, using the shared filter so legacy
  // documents that predate the status field stay public.
  assert.deepEqual(filter, publishedFilter());
  assert.ok(JSON.stringify(filter).includes(BLOG_STATUS.PUBLISHED));
});

test('a post whose status field is absent stays in the sitemap', async () => {
  // Matches `{ status: null }` in Mongo: legacy documents were written before the
  // field existed and are public at /blog/<slug>, so hiding them from the sitemap
  // while they remain reachable would be a real inconsistency.
  const { res } = await serveBlogs([blog({ slug: 'legacy-post', status: undefined })]);
  assert.ok(locs(res.text).includes('https://weinsightian.tech/blog/legacy-post'));
});

test('unpublishing removes a post and republishing restores it', async () => {
  const published = await serveBlogs([blog({ slug: 'toggle-post', status: BLOG_STATUS.PUBLISHED })]);
  assert.ok(locs(published.res.text).includes('https://weinsightian.tech/blog/toggle-post'));

  const draft = await serveBlogs([blog({ slug: 'toggle-post', status: BLOG_STATUS.DRAFT })]);
  assert.ok(!locs(draft.res.text).some((loc) => loc.includes('toggle-post')));

  const republished = await serveBlogs([blog({ slug: 'toggle-post', status: BLOG_STATUS.PUBLISHED })]);
  assert.ok(locs(republished.res.text).includes('https://weinsightian.tech/blog/toggle-post'));
});

test('a deleted post disappears', async () => {
  const before = await serveBlogs([blog({ slug: 'removed-post' })]);
  assert.ok(locs(before.res.text).includes('https://weinsightian.tech/blog/removed-post'));

  const after = await serveBlogs([]);
  assert.ok(!locs(after.res.text).some((loc) => loc.includes('removed-post')));
});

// ==========================================
// 10-12. URL AND LASTMOD
// ==========================================

test('every URL uses the canonical production origin', async () => {
  const { res } = await serveBlogs([blog()]);
  const found = locs(res.text);

  assert.ok(found.length > 0);
  found.forEach((loc) => {
    assert.ok(loc.startsWith(`${SITEMAP_ORIGIN}/`), `not canonical: ${loc}`);
    // No query strings, no fragments, no localhost, no backend host.
    assert.doesNotMatch(loc, /\?/, `query string in ${loc}`);
    assert.doesNotMatch(loc, /#/, `fragment in ${loc}`);
  });
});

test('a slug becomes a /blog/<slug> URL', async () => {
  const { res } = await serveBlogs([
    blog({ slug: 'why-digital-presence-is-critical-for-business-growth' }),
  ]);
  assert.ok(
    locs(res.text).includes(
      'https://weinsightian.tech/blog/why-digital-presence-is-critical-for-business-growth'
    )
  );
});

test('lastmod prefers updatedAt, then publishedAt, then createdAt', () => {
  const all = blog({});
  assert.equal(blogLastmod(all), '2026-02-02T00:00:00Z');

  assert.equal(
    blogLastmod({ publishedAt: new Date('2026-01-15T00:00:00Z'), createdAt: new Date('2026-01-01T00:00:00Z') }),
    '2026-01-15T00:00:00Z'
  );

  assert.equal(
    blogLastmod({ createdAt: new Date('2026-01-01T00:00:00Z') }),
    '2026-01-01T00:00:00Z'
  );

  // No trustworthy timestamp: omit the element rather than print today.
  assert.equal(blogLastmod({}), null);
  assert.equal(blogLastmod({ updatedAt: 'not-a-date', createdAt: null }), null);
});

test('an edited post reports its new updatedAt', async () => {
  const first = await serveBlogs([blog({ slug: 'edited-post', updatedAt: new Date('2026-03-01T00:00:00Z') })]);
  assert.equal(
    lastmodOf(first.res.text, 'https://weinsightian.tech/blog/edited-post'),
    '2026-03-01T00:00:00Z'
  );

  const second = await serveBlogs([blog({ slug: 'edited-post', updatedAt: new Date('2026-06-09T10:30:00Z') })]);
  assert.equal(
    lastmodOf(second.res.text, 'https://weinsightian.tech/blog/edited-post'),
    '2026-06-09T10:30:00Z'
  );
});

test('a post with no usable date has no lastmod element at all', async () => {
  const { res } = await serveBlogs([blog({ slug: 'undated-post', updatedAt: null, publishedAt: null, createdAt: null })]);
  const loc = 'https://weinsightian.tech/blog/undated-post';
  assert.ok(locs(res.text).includes(loc));
  assert.equal(lastmodOf(res.text, loc), null);
  assert.doesNotMatch(res.text, /<lastmod>(\s*)<\/lastmod>/);
});

test('dates are formatted as W3C Datetime', () => {
  assert.equal(toW3cDateTime(new Date('2026-09-26T19:12:41.123Z')), '2026-09-26T19:12:41Z');
  assert.match(toW3cDateTime(new Date()), /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/);
  assert.equal(toW3cDateTime(null), null);
});

// ==========================================
// 11. XML SAFETY
// ==========================================

test('XML metacharacters in a slug cannot break the document', () => {
  const hostile = 'a&b<c>d"e\'f';
  const xml = renderSitemap([blog({ slug: hostile })]);

  // The hostile slug is rejected outright, so nothing from it reaches the output.
  assert.doesNotMatch(xml, /a&b<c>/);
  assert.ok(locs(xml).length === STATIC_SITEMAP_ROUTES.length, 'only static routes survive');
});

test('a slug that is unsafe is skipped rather than escaped into a URL', () => {
  const dangerous = [
    '../../etc/passwd',
    'post?x=1',
    'post#frag',
    'post/child',
    'Post Uppercase',
    'has space',
    '',
    'amp&ersand',
  ];

  dangerous.forEach((slug) => {
    assert.equal(isSitemapSafeSlug(slug), false, `must reject ${JSON.stringify(slug)}`);
    const xml = renderSitemap([blog({ slug })]);
    assert.equal(locs(xml).length, STATIC_SITEMAP_ROUTES.length, `${slug} must not be emitted`);
  });
});

test('a duplicate slug is listed only once', () => {
  const xml = renderSitemap([
    blog({ slug: 'same-slug' }),
    blog({ slug: 'same-slug' }),
    blog({ slug: 'other-slug' }),
  ]);

  const blogLocs = locs(xml).filter((loc) => loc.includes('/blog/'));
  assert.deepEqual(blogLocs, [
    'https://weinsightian.tech/blog/same-slug',
    'https://weinsightian.tech/blog/other-slug',
  ]);
  assert.equal(new Set(locs(xml)).size, locs(xml).length, 'no duplicate <loc> anywhere');
});

test('a blog path can never collide with a static route', () => {
  const xml = renderSitemap([blog({ slug: 'services' })]);
  const found = locs(xml);
  assert.equal(found.filter((loc) => loc === `${SITEMAP_ORIGIN}/services`).length, 1);
  // 'services' as a blog slug produces a different URL, and it is not a static route.
  assert.ok(found.includes(`${SITEMAP_ORIGIN}/blog/services`));
});

// ==========================================
// 12, 14. EDGE STATES
// ==========================================

test('an empty published set still yields a valid sitemap', () => {
  const xml = renderSitemap([]);
  assert.match(xml, /^<\?xml version="1\.0" encoding="UTF-8"\?>/);
  assert.match(xml, /<urlset xmlns="http:\/\/www\.sitemaps\.org\/schemas\/sitemap\/0\.9">/);
  assert.equal(locs(xml).length, STATIC_SITEMAP_ROUTES.length);
  assert.ok(xml.trimEnd().endsWith('</urlset>'));
});

test('the document is well-formed: one urlset, balanced url blocks', () => {
  const xml = renderSitemap([blog(), blog({ slug: 'second-post' })]);
  const count = (needle) => (xml.match(needle) || []).length;

  assert.equal(count(/<urlset/g), 1);
  assert.equal(count(/<\/urlset>/g), 1);
  assert.equal(count(/<url>/g), count(/<\/url>/g));
  assert.equal(count(/<loc>/g), STATIC_SITEMAP_ROUTES.length + 2);
});

// ==========================================
// 13. DATABASE FAILURE
// ==========================================

test('a database failure returns a safe error, not a sitemap', async () => {
  const res = await withStubs(
    {
      find: () => {
        throw Object.assign(new Error('connection string mongodb://user:hunter2@10.0.0.5:27017/prod refused'), {
          name: 'MongoNetworkError',
        });
      },
    },
    () => request(app).get('/api/v1/sitemap.xml')
  );

  assert.equal(res.status, 503);
  assert.doesNotMatch(res.text, /<urlset/);
  // No infrastructure detail of any kind.
  const body = res.text || JSON.stringify(res.body || {});
  assert.doesNotMatch(body, /mongodb:\/\//i);
  assert.doesNotMatch(body, /hunter2/i);
  assert.doesNotMatch(body, /10\.0\.0\.5/);
  assert.doesNotMatch(body, /at .*\.js:\d+/, 'no stack trace');
  assert.doesNotMatch(body, /weinsightian/i, 'must not pass through the origin constant');
});

// ==========================================
// 16, 18. SECURITY
// ==========================================

test('the sitemap needs no authentication', async () => {
  const res = await serveBlogs([blog()]);
  assert.equal(res.res.status, 200);
  // The request carried no cookie at all.
  assert.equal(res.res.request.getHeader('cookie'), undefined);
});

test('the endpoint is read-only', async () => {
  const methods = ['post', 'put', 'patch', 'delete'];
  for (const method of methods) {
    const res = await withStubs({ find: () => chain([]) }, () => request(app)[method]('/api/v1/sitemap.xml'));
    assert.ok(res.status >= 400, `${method.toUpperCase()} must not be accepted`);
    assert.notEqual(res.status, 200);
  }
});

test('the sitemap exposes no private fields', async () => {
  const spy = [];
  const { res } = await withStubs(
    {
      find: () => {
        const q = chain([
          blog({
            slug: 'public-post',
            _id: '65f0000000000000000000aa',
            title: 'Internal title',
            description: 'Internal description',
            content: '<p>Full article body</p>',
            author: 'Internal Author',
            image: 'https://res.cloudinary.com/private/image.jpg',
            status: BLOG_STATUS.PUBLISHED,
          }),
        ]);
        const originalSelect = q.select;
        q.select = (fields) => {
          spy.push(fields);
          return originalSelect(fields);
        };
        return q;
      },
    },
    () => request(app).get('/api/v1/sitemap.xml')
  );

  // Only the four fields the document needs are read from the database.
  assert.ok(spy.length > 0, 'a projection must be applied');
  const projected = spy[0];
  ['content', 'description', 'author', 'image', 'title', '_id'].forEach((field) => {
    assert.ok(!projected.includes(field), `must not select ${field}`);
  });

  // And none of it appears in the response.
  [
    'Full article body',
    'Internal description',
    'Internal Author',
    'private/image.jpg',
    'Internal title',
    '65f0000000000000000000aa',
  ].forEach((secret) => {
    assert.ok(!res.text.includes(secret), `must not emit ${secret}`);
  });
});

// ==========================================
// 10. QUERY COST
// ==========================================

test('the query is lean, projected and un-sorted', async () => {
  let usedLean = false;
  let filter = null;
  let projection = null;

  await withStubs(
    {
      find: (query) => {
        filter = query;
        const q = chain([]);
        const originalSelect = q.select;
        q.select = (fields) => {
          projection = fields;
          return originalSelect(fields);
        };
        const originalLean = q.lean;
        q.lean = async () => {
          usedLean = true;
          return originalLean();
        };
        q.sort = () => {
          throw new Error('the sitemap must not sort');
        };
        return q;
      },
    },
    () => request(app).get('/api/v1/sitemap.xml')
  );

  assert.deepEqual(filter, publishedFilter());
  assert.ok(usedLean, 'a lean query avoids hydrating documents');
  assert.ok(projection, 'only needed fields are read');
  assert.equal(projection, 'slug status updatedAt publishedAt createdAt');
});