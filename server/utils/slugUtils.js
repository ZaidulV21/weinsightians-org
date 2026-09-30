// ==========================================
// SLUG HELPERS
// ==========================================
// Slugs are the public URL of a post (/blog/:slug), so they are treated as
// permanent once published. Two rules follow from that:
//
//   1. Generation is deterministic. The same title always produces the same
//      slug, so a rebuild or a retry can never invent a different URL.
//   2. A slug is only ever assigned on create. Editing a title never moves an
//      existing post.
//
// Collisions are resolved with a numeric suffix rather than failing, so
// publishing two posts with the same title cannot produce a 500 or an
// unreachable post.

import slugify from 'slugify';

export const MAX_SLUG_LENGTH = 180;
const MAX_UNIQUE_ATTEMPTS = 50;

// Lowercase, URL-safe, no duplicate or leading/trailing separators.
export const slugifyTitle = (title) => {
  // slugify drops underscores and transliterates accented characters; the
  // pre-pass makes separator handling explicit and deterministic.
  const prepared = String(title || '').replace(/[_\s]+/g, '-');

  return slugify(prepared, { lower: true, strict: true, trim: true })
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, MAX_SLUG_LENGTH)
    .replace(/-+$/g, '');
};

// Finds a slug that is not already taken. `exists` is an async predicate so this
// module stays free of a model import (the model already imports this file, and
// a cycle would leave slugifyTitle undefined at load time).
// `excludeId` lets an update keep its own slug without colliding with itself.
export const ensureUniqueSlug = async (baseSlug, exists, excludeId = null) => {
  const base = slugifyTitle(baseSlug) || 'post';

  let candidate = base;
  let suffix = 1;

  // Sequential on purpose: a deterministic, human-readable URL is worth more here
  // than the handful of extra queries it costs at publish time.
  /* eslint-disable no-await-in-loop */
  while (suffix <= MAX_UNIQUE_ATTEMPTS) {
    const taken = await exists(candidate, excludeId);
    if (!taken) return candidate;

    suffix += 1;
    candidate = `${base.slice(0, MAX_SLUG_LENGTH - 6)}-${suffix}`;
  }
  /* eslint-enable no-await-in-loop */

  throw new Error('Unable to generate a unique slug for this post');
};

// The character set slugify can emit. Legacy slugs were produced by the same
// library with the same options, so every URL that resolves today still matches.
export const SLUG_PATTERN = /^[a-z0-9-]+$/;

// A slug arriving from a URL is only used for an exact match lookup, never in a
// regex, so this check exists to reject junk early: slashes, query strings,
// whitespace and control characters never reach the database.
export const isValidSlugParam = (value) =>
  typeof value === 'string' && value.length > 0 && value.length <= 200 && SLUG_PATTERN.test(value);
