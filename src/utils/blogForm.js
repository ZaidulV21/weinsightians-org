import slugify from "slugify";

// ==========================================
// BLOG FORM RULES
// ==========================================
// Everything the create/edit form needs to know about a post, in one place.
//
// The numbers in LIMITS are a mirror of the server's own LIMITS
// (server/middlewares/validationMiddleware.js) and the image rules mirror
// server/utils/fileValidation.js. They exist so the editor can explain a problem
// before a request is sent. The server remains the only authority: it re-checks
// every one of these on the way in and its answer always wins.

export const LIMITS = {
  title: { min: 3, max: 200 },
  description: { min: 10, max: 500 },
  author: { min: 2, max: 100 },
  // The server measures content as *visible text*, not HTML, so a post made of
  // markup and no words is still empty.
  content: { min: 20, max: 200000 },
};

export const IMAGE_RULES = {
  maxBytes: 5 * 1024 * 1024,
  // Exactly the server's allowlist. Note that `image/*` is deliberately not used:
  // it would also offer SVG, which the server refuses because it can carry script.
  accept: "image/jpeg,image/png,image/gif,image/webp,image/avif",
  mimeTypes: ["image/jpeg", "image/png", "image/gif", "image/webp", "image/avif"],
};

export const BLOG_STATUS = { DRAFT: "draft", PUBLISHED: "published" };

// ==========================================
// TEXT
// ==========================================

/**
 * Trims and collapses runs of whitespace.
 *
 * Applied to the values that are sent, so "  How   AI  " is stored as
 * "How AI" instead of failing a length check on padding the reader cannot see.
 */
export const normaliseText = (value) => String(value ?? "").replace(/\s+/g, " ").trim();

/**
 * The text a reader would actually see in the editor's HTML.
 *
 * Mirrors the server's hasVisibleText/toPlainText closely enough to be useful as
 * a pre-check. It is not a sanitizer and is never used to render anything.
 */
export const visibleText = (html) =>
  String(html ?? "")
    // A script or style body is code, not prose.
    .replace(/<(script|style)\b[^>]*>[\s\S]*?<\/\1>/gi, " ")
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;|&#160;/gi, " ")
    .replace(/[<>]/g, "")
    .replace(/\s+/g, " ")
    .trim();

export const visibleLength = (html) => visibleText(html).length;

// ==========================================
// SLUG
// ==========================================
// A preview only. The server generates the real slug from the title it receives
// and is the only thing that can guarantee it is unique: if the address is taken
// it appends a number rather than failing. Nothing here is sent to the API, and
// no client check can promise the preview is the final address.

const MAX_SLUG_LENGTH = 180; // matches MAX_SLUG_LENGTH in server/utils/slugUtils.js

/**
 * A faithful mirror of the server's slugifyTitle, so the preview matches what
 * will actually be stored rather than being an approximation.
 */
export const slugifyPreview = (title) => {
  const prepared = String(title ?? "").replace(/[_\s]+/g, "-");

  return slugify(prepared, { lower: true, strict: true, trim: true })
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, MAX_SLUG_LENGTH)
    .replace(/-+$/g, "");
};

// ==========================================
// FILES
// ==========================================

export const formatBytes = (bytes) => {
  if (!Number.isFinite(bytes)) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

/**
 * Checks a chosen file against the same rules the server applies.
 *
 * Returns a message safe to show a user, or null when the file looks acceptable.
 * The server still inspects the real bytes: this only saves a doomed upload.
 */
export const validateImageFile = (file) => {
  if (!file) return null;

  const type = (file.type || "").toLowerCase();
  if (!IMAGE_RULES.mimeTypes.includes(type)) {
    return "That file is not a supported image. Use JPEG, PNG, GIF, WebP or AVIF.";
  }

  if (file.size > IMAGE_RULES.maxBytes) {
    return `That image is ${formatBytes(file.size)}. The limit is 5 MB.`;
  }

  return null;
};

// ==========================================
// IMAGE URLS
// ==========================================
// A convenience check for the import box, and nothing more. It mirrors
// parseRemoteImageUrl closely enough to catch a typo before a request is made, and
// deliberately stops where the real check begins: the server resolves the name and
// decides what is reachable. A URL that passes here can still be refused, and one
// refused here would have been refused there anyway.

export const MAX_IMAGE_URL_LENGTH = 2048; // matches the server's own limit

/**
 * Returns a message safe to show an author, or null when the URL looks plausible.
 */
export const validateImageUrl = (value) => {
  const raw = String(value ?? "").trim();

  if (raw === "") return "Enter an image URL";
  if (raw.length > MAX_IMAGE_URL_LENGTH) return "That URL is too long";

  let url;
  try {
    url = new URL(raw);
  } catch {
    return "That does not look like a valid URL";
  }

  if (url.protocol !== "https:" && url.protocol !== "http:") {
    return "The image URL must start with http:// or https://";
  }

  if (url.username || url.password) {
    return "That URL is not a valid image address";
  }

  return null;
};

// ==========================================
// VALIDATION
// ==========================================

const lengthMessage = (label, length, { min, max }) => {
  if (length < min) {
    return `${label} needs at least ${min} characters (currently ${length}).`;
  }
  if (length > max) {
    return `${label} cannot be longer than ${max} characters (currently ${length}).`;
  }
  return null;
};

/**
 * Validates the form and returns a map of field -> message.
 *
 * Only a field that has content can be "too long", and nothing is ever silently
 * truncated: an over-long value gets an error and stays in the box, so the author
 * decides what to cut.
 *
 * Every field is required here for both draft and published, because the model
 * itself requires title, description, author and content on every document. The
 * difference between a draft and a published post is visibility, not completeness.
 */
export const validateBlogForm = ({ title, description, author, content }) => {
  const errors = {};

  const checkText = (field, label, value, rules) => {
    const clean = normaliseText(value);

    if (clean.length === 0) {
      errors[field] = `${label} is required`;
      return;
    }

    const message = lengthMessage(label, clean.length, rules);
    if (message) errors[field] = message;
  };

  checkText("title", "Title", title, LIMITS.title);
  checkText("description", "Description", description, LIMITS.description);
  checkText("author", "Author", author, LIMITS.author);

  // Length is measured on visible text, because that is what the server measures.
  // An editor holding "<p><br></p>" is empty however many characters the markup is.
  const contentLength = visibleLength(content);
  if (contentLength === 0) {
    errors.content = "Content cannot be empty";
  } else {
    const message = lengthMessage("Content", contentLength, LIMITS.content);
    if (message) errors.content = message;
  }

  return errors;
};

/** The first field with a problem, in reading order, for focusing on submit. */
export const FIELD_ORDER = ["title", "description", "author", "content"];

export const firstInvalidField = (errors) =>
  FIELD_ORDER.find((field) => Boolean(errors[field]));
