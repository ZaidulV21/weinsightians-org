// ==========================================
// XML SITEMAP
// ==========================================
// The sitemap is generated here, on the server, from the database. Nothing in
// this file is hand-maintained per blog: a post appears because it is published,
// and disappears the moment it is not.
//
// Two rules govern everything below.
//
// 1. The origin is a constant, never a request. Building URLs from the incoming
//    Host, the Render hostname or VITE_API_URL would emit whatever domain the
//    generator happened to run against — including localhost — and a sitemap is
//    exactly the file that must never contain a staging or preview origin. Every
//    URL is built from SITEMAP_ORIGIN and nothing else.
//
// 2. Only public, canonical, already-validated data is emitted. Slugs are
//    re-checked against the model's own rule before use, and everything is XML
//    escaped, so a legacy document that predates the current validation cannot
// break the document or inject markup.

import { BLOG_STATUS } from '../models/Blog.js';

// The canonical production origin. https, non-www, no trailing slash.
export const SITEMAP_ORIGIN = 'https://weinsightian.tech';

const BLOG_PATH_PREFIX = '/blog/';

// The public, indexable routes that exist in the frontend router (src/App.jsx).
// Deliberately excluded, and unchanged from the previous hand-written sitemap:
//   /home          duplicate of /, already canonicalised
//   /admin/*       private, NoIndex, disallowed in robots.txt
//   /blog/<slug>   generated below from published posts only
//   /*             the catch-all 404 route
export const STATIC_SITEMAP_ROUTES = Object.freeze([
  { path: '/', lastmod: null },
  { path: '/services', lastmod: null },
  { path: '/about', lastmod: null },
  { path: '/contact', lastmod: null },
  { path: '/privacy', lastmod: '2026-09-26' },
  { path: '/sitemap', lastmod: null },
  { path: '/blogs', lastmod: null },
]);

// Same rule the model enforces on save (models/Blog.js). Re-checked here because
// a document inserted before that validator existed, or by a script, must still
// not be able to inject a path separator, a query string or an entity.
const SAFE_SLUG = /^[a-z0-9-]+$/;

export const isSitemapSafeSlug = (slug) =>
  typeof slug === 'string' && slug.length > 0 && slug.length <= 200 && SAFE_SLUG.test(slug);

// Second, independent check on the way out. The query already filters with
// publishedFilter(), but this is a public endpoint and an unpublished slug is a
// disclosure, so the document that is about to be written is re-checked here as
// well. A missing status means a legacy post written before the field existed,
// which is public — the same rule publishedFilter() applies.
export const isPubliclyVisible = (blog) =>
  blog?.status == null || blog.status === BLOG_STATUS.PUBLISHED;

// Escapes the five XML predefined entities. Applied to every interpolated value
// regardless of what validation already guaranteed.
const escapeXml = (value) =>
  String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');

// W3C Datetime, which is what the sitemap protocol expects. Returns null for a
// missing or unparseable value so the caller can omit <lastmod> entirely rather
// than print a fabricated or "now" date.
export const toW3cDateTime = (value) => {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString().replace(/\.\d{3}Z$/, 'Z');
};

// updatedAt first: it is the real "this page changed" signal. publishedAt is the
// fallback for older posts, createdAt the last resort.
export const blogLastmod = (blog) =>
  toW3cDateTime(blog?.updatedAt) || toW3cDateTime(blog?.publishedAt) || toW3cDateTime(blog?.createdAt);

// `lastmod` is expected already formatted, or null to omit the element. Static
// values are emitted exactly as declared so the static part of the document
// stays byte-identical to the sitemap that is already deployed; blog values are
// formatted by blogLastmod().
const urlEntry = (loc, lastmod) => {
  const escapedLoc = escapeXml(loc);
  if (!lastmod) {
    return `  <url>\n    <loc>${escapedLoc}</loc>\n  </url>`;
  }
  return `  <url>\n    <loc>${escapedLoc}</loc>\n    <lastmod>${lastmod}</lastmod>\n  </url>`;
};

// Builds the whole document. `blogs` must already be filtered to published
// posts by the caller (publishedFilter), and may be empty: an empty blog list
// still produces a valid sitemap containing the static routes.
export const renderSitemap = (blogs = []) => {
  const entries = STATIC_SITEMAP_ROUTES.map((route) =>
    urlEntry(`${SITEMAP_ORIGIN}${route.path}`, route.lastmod)
  );

  // A Set keyed on the final URL: one page can never be listed twice, whatever
  // the database happens to contain.
  const seen = new Set(STATIC_SITEMAP_ROUTES.map((route) => `${SITEMAP_ORIGIN}${route.path}`));

  for (const blog of blogs) {
    if (!isPubliclyVisible(blog)) continue;
    if (!isSitemapSafeSlug(blog?.slug)) continue;

    const loc = `${SITEMAP_ORIGIN}${BLOG_PATH_PREFIX}${blog.slug}`;
    if (seen.has(loc)) continue;
    seen.add(loc);

    entries.push(urlEntry(loc, blogLastmod(blog)));
  }

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<!-- Generated by the We Insightians API from published blog records. Do not edit by hand. -->',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...entries,
    '</urlset>',
    '',
  ].join('\n');
};

export { escapeXml };