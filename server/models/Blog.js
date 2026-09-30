// ==========================================
// BLOG MODEL
// ==========================================
// Publishing model: `status` is a plain enum with default 'published'.
//
// Why a default of 'published' and not a migration: every post that already
// exists is public right now, and a document written before this field existed
// has no value for it. A default of 'published' means those posts stay public
// whether or not a backfill ever runs. `publishedAt` stays nullable for the same
// reason — for older posts, `createdAt` is the real publish date.
//
// Queries for the public blog must therefore not filter on `status: 'published'`
// alone (that would hide every legacy post); use `publishedFilter()` below.

import mongoose from 'mongoose';
import { slugifyTitle } from '../utils/slugUtils.js';

export const BLOG_STATUS = Object.freeze({
  DRAFT: 'draft',
  PUBLISHED: 'published',
});

// Length limits live in `middlewares/validationMiddleware.js` (LIMITS), which is
// the only place a client can reach. The schema deliberately does not repeat the
// minimums: an update calls `doc.save()`, and save() validates the whole
// document. If a post written years ago has a short description, a minimum here
// would make it impossible to rename the post or publish it without also
// rewriting that untouched description. The maximums are kept, because an
// oversized value is a defect regardless of who wrote it.
const BlogSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'A title is required'],
      trim: true,
      maxlength: 200,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      maxlength: 200,
    },
    description: {
      type: String,
      required: [true, 'A description is required'],
      trim: true,
      maxlength: 500,
    },
    content: {
      type: String,
      required: [true, 'Content is required'],
    },
    author: {
      type: String,
      required: [true, 'An author is required'],
      trim: true,
      maxlength: 100,
    },
    image: {
      type: String,
      default: null,
      trim: true,
    },
    status: {
      type: String,
      enum: Object.values(BLOG_STATUS),
      default: BLOG_STATUS.PUBLISHED,
      index: true,
    },
    publishedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    toJSON: {
      // `publishedAt` is null for posts published before this field existed, so
      // a published post always reports a usable date. A draft never does.
      virtuals: false,
      transform: (_doc, ret) => {
        if (ret.status === BLOG_STATUS.PUBLISHED) {
          ret.publishedAt = ret.publishedAt || ret.createdAt || null;
        } else {
          ret.publishedAt = ret.publishedAt || null;
        }
        return ret;
      },
    },
  }
);

// Safety net for legacy documents that somehow have no slug: normalise on save.
// The controller always assigns a unique slug, this only guarantees the field is
// never empty.
// A slug is derived from the title, never accepted from the client, and it is
// only ever set when the document has none. It is never regenerated, so a title
// edit cannot move a post that is already linked to from social previews, search
// results and other sites.
//
// Note the hook style: this must be a plain function or an async function.
// Mongoose 9 removed callback-style middleware, so `function (next) { ... next() }`
// is called with no argument and throws "next is not a function" - which would
// break every create and update.
BlogSchema.pre('validate', function normaliseSlug() {
  if (!this.slug && this.title) {
    this.slug = slugifyTitle(this.title);
  }
});

// A slug must be URL-safe: no whitespace, no query characters, no fragments.
BlogSchema.path('slug').validate(function validateSlug(value) {
  if (!/^[a-z0-9-]+$/.test(value)) {
    return this.invalidate('slug', 'Slug may only contain lowercase letters, numbers and hyphens');
  }
  return true;
}, 'Slug contains unsupported characters');

// Public visibility filter.
//
// `{ status: null }` matches documents where the field is missing OR explicitly
// null, so posts written before `status` existed are still public. Anything else
// (an explicit 'draft') is hidden from the public endpoints.
export const publishedFilter = () => ({
  $or: [{ status: BLOG_STATUS.PUBLISHED }, { status: null }],
});

export default mongoose.model('Blog', BlogSchema);
