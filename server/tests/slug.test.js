import './setup.js';
import test from 'node:test';
import assert from 'node:assert/strict';

import { ensureUniqueSlug, slugifyTitle, isValidSlugParam, MAX_SLUG_LENGTH } from '../utils/slugUtils.js';

// ==========================================
// SLUG GENERATION
// ==========================================

test('titles become lowercase, URL-safe slugs', () => {
  assert.equal(slugifyTitle('My First Blog Post'), 'my-first-blog-post');
  assert.equal(slugifyTitle('UPPER CASE'), 'upper-case');
  assert.equal(slugifyTitle('Trailing spaces   '), 'trailing-spaces');
});

test('slugs have no duplicate, leading or trailing separators', () => {
  assert.equal(slugifyTitle('a   b'), 'a-b');
  assert.equal(slugifyTitle('a---b'), 'a-b');
  assert.equal(slugifyTitle('  --Hello--World--  '), 'hello-world');
  assert.equal(slugifyTitle('Multiple___separators'), 'multiple-separators');
  assert.ok(!slugifyTitle('  --Hello--World--  ').startsWith('-'));
  assert.ok(!slugifyTitle('  --Hello--World--  ').endsWith('-'));
});

test('slugs are deterministic', () => {
  const title = 'Repeatable: Slug Generation — Every Time';
  assert.equal(slugifyTitle(title), slugifyTitle(title));
});

test('punctuation and symbols are removed', () => {
  assert.equal(slugifyTitle('10 Ways to Grow Your Startup in 2024!'), '10-ways-to-grow-your-startup-in-2024');
  assert.equal(slugifyTitle('!!!'), '');
  // slugify expands "&" to "and", which is what a human would have typed.
  assert.equal(slugifyTitle('a & b'), 'a-and-b');
});

test('a title with no usable characters still yields a usable slug', async () => {
  const neverTaken = async () => false;
  assert.equal(await ensureUniqueSlug(slugifyTitle('!!!'), neverTaken), 'post');
});

test('long titles are truncated to a safe length', () => {
  const slug = slugifyTitle('word '.repeat(200));
  assert.ok(slug.length <= MAX_SLUG_LENGTH, slug.length);
  assert.ok(!slug.endsWith('-'));
});

// ==========================================
// UNIQUENESS
// ==========================================

test('a taken slug gets a numeric suffix', async () => {
  const taken = new Set(['my-post', 'my-post-2']);
  const exists = async (candidate) => taken.has(candidate);

  assert.equal(await ensureUniqueSlug('My Post', exists), 'my-post-3');
});

test('an unused slug is returned unchanged', async () => {
  const exists = async () => false;
  assert.equal(await ensureUniqueSlug('Brand New Post', exists), 'brand-new-post');
});

test('the same input always resolves to the same free slug', async () => {
  const taken = new Set(['my-post']);
  const exists = async (candidate) => taken.has(candidate);
  const first = await ensureUniqueSlug('My Post', exists);
  const second = await ensureUniqueSlug('My Post', exists);
  assert.equal(first, second);
});

test('the collision check can exclude the document being updated', async () => {
  const seen = [];
  const exists = async (candidate, excludeId) => {
    seen.push({ candidate, excludeId });
    return false;
  };

  await ensureUniqueSlug('Existing Post', exists, 'doc-123');
  assert.deepEqual(seen, [{ candidate: 'existing-post', excludeId: 'doc-123' }]);
});

// ==========================================
// SLUG PARAMETER (public URLs)
// ==========================================

test('real published slugs are accepted as URL params', () => {
  ['my-first-blog-post', '2024-in-review', 'a1', 'ai-for-everyone'].forEach((slug) => {
    assert.equal(isValidSlugParam(slug), true, slug);
  });
});

test('junk slug params are rejected', () => {
  ['', 'has space', 'a'.repeat(201), 'has/slash', 'has?query', 'has#hash', null, undefined, 42].forEach(
    (value) => {
      assert.equal(isValidSlugParam(value), false, String(value));
    }
  );
});
