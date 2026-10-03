#!/usr/bin/env node
// ==========================================
// REGENERATE public/sitemap.xml
// ==========================================
// Why this exists
//
// The sitemap is generated on the server, from MongoDB, at
//   GET https://weinsightians-backend-repo.onrender.com/api/v1/sitemap.xml
// and is therefore always current.
//
// The canonical URL that robots.txt advertises is
//   https://weinsightian.tech/sitemap.xml
// which is served by Apache as a static file from the deployed Vite `dist/`
// output. Making that URL dynamic needs a host-level proxy (mod_proxy or
// ProxyPass in .htaccess) on Hostinger. No .htaccess is tracked in this
// repository — the Apache config for this site lives in the Hostinger control
// panel — so that proxy cannot be added or verified from here. Guessing at it
// would risk replacing whatever rewrite rules are already making the SPA work.
//
// So the static file is a *generated artifact*: this script fetches the live
// document from the API and writes it verbatim. It is never hand-edited, and it
// cannot drift from the backend because it is a byte-for-byte copy of what the
// endpoint returns.
//
// Usage
//   node scripts/generate-sitemap.mjs
//   SITEMAP_API_URL=https://staging-host node scripts/generate-sitemap.mjs
//
// Run it after publishing, unpublishing, editing or deleting a blog, and before
// a frontend deploy. Once the Hostinger proxy is in place this file can be
// deleted outright; see the B6 report for the snippet and the caveats.

import { writeFileSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const API_URL = (
  process.env.SITEMAP_API_URL || 'https://weinsightians-backend-repo.onrender.com'
).replace(/\/+$/, '');

const SITEMAP_ENDPOINT = `${API_URL}/api/v1/sitemap.xml`;
const OUTPUT = resolve(dirname(fileURLToPath(import.meta.url)), '..', 'public', 'sitemap.xml');

const URLSET_OPEN = '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">';

// A sitemap with no <loc> at all would silently remove the whole site from
// search results, so refuse to write anything that does not look like a sitemap
// carrying at least the homepage.
const assertLooksLikeASitemap = (xml) => {
  if (!xml.trimStart().startsWith('<?xml version="1.0" encoding="UTF-8"?>')) {
    throw new Error('response is not an XML document');
  }
  if (!xml.includes(URLSET_OPEN)) {
    throw new Error('response has no sitemap urlset');
  }
  if (!xml.includes('<loc>https://weinsightian.tech/</loc>')) {
    throw new Error('response does not contain the homepage');
  }
  if (!xml.trimEnd().endsWith('</urlset>')) {
    throw new Error('response is truncated');
  }
  return xml;
};

const main = async () => {
  process.stdout.write(`Fetching ${SITEMAP_ENDPOINT}\n`);

  const response = await fetch(SITEMAP_ENDPOINT, {
    headers: { Accept: 'application/xml' },
  });

  if (!response.ok) {
    throw new Error(`endpoint returned ${response.status} ${response.statusText}`);
  }

  const contentType = response.headers.get('content-type') || '';
  if (!/xml/i.test(contentType)) {
    throw new Error(`expected XML, received "${contentType}"`);
  }

  const xml = assertLooksLikeASitemap(await response.text());

  let previous = null;
  try {
    previous = readFileSync(OUTPUT, 'utf8');
  } catch {
    // No existing file: first run.
  }

  if (previous === xml) {
    process.stdout.write('Already up to date. No change written.\n');
  } else {
    writeFileSync(OUTPUT, xml, 'utf8');
    process.stdout.write(`Wrote ${OUTPUT}\n`);
  }

  const locs = [...xml.matchAll(/<loc>([^<]*)<\/loc>/g)].map((match) => match[1]);
  const blogs = locs.filter((loc) => loc.includes('/blog/'));
  process.stdout.write(`Static routes: ${locs.length - blogs.length}\n`);
  process.stdout.write(`Published blogs: ${blogs.length}\n`);
  blogs.forEach((loc) => process.stdout.write(`  ${loc}\n`));
};

main().catch((error) => {
  process.stderr.write(`Failed: ${error.message}\n`);
  process.stderr.write('The existing public/sitemap.xml was left untouched.\n');
  process.exitCode = 1;
});