/* ==========================================
   PUBLIC ARTICLE — DATA + SEO LOGIC
   ==========================================
   Pure, JSX-free helpers for /blog/:slug, so the rules that decide what a search
   engine and a social card actually see can be tested directly rather than
   inferred by reading markup.

   Everything here derives from fields that genuinely exist on a Blog document:
     title, slug, description, content, author, image, status,
     publishedAt, createdAt, updatedAt
   There is no category, no tags, no reading time and no author profile in the
   schema, so none of those are produced. A field that does not exist is omitted
   rather than filled in with something plausible.
   ========================================== */

import { SITE_ORIGIN, optimizeImage, publishDate, selectPublicBlogs, sortByPublishDate } from "./blogList.js";

// Must match ORGANIZATION_ID in src/components/StructuredData.jsx. Referencing
// it by @id links the article to the existing Organization node instead of
// declaring a second, conflicting one.
export const ORGANIZATION_ID = `${SITE_ORIGIN}/#organization`;

export const SITE_NAME = "We Insightians";

/* ---------- addresses ---------- */

export const articleUrl = (slug) => `${SITE_ORIGIN}/blog/${slug}`;

// The canonical is built from the slug on the loaded document rather than from the
// URL bar, so it always names the address this article actually lives at.
export const articleCanonical = (blog) => (blog?.slug ? articleUrl(blog.slug) : null);

/* ---------- text ---------- */

// Article bodies are stored HTML. This turns it into something safe to put in a
// meta tag, a share line or a JSON-LD string.
export const toPlainText = (html) =>
  typeof html === "string"
    ? html
        .replace(/<(script|style)\b[^>]*>[\s\S]*?<\/\1>/gi, " ")
        .replace(/<[^>]*>/g, " ")
        .replace(/\s+/g, " ")
        .trim()
    : "";

// Search engines truncate roughly 160 characters and drop a description that is
// cut mid-word. Word boundaries are preferred, but a single very long word (a URL,
// a product name) must still be cut rather than returning nothing.
export const truncate = (text, max = 158) => {
  if (!text) return "";
  const clean = String(text).replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean;

  const cut = clean.slice(0, max);
  const lastSpace = cut.lastIndexOf(" ");
  const body = lastSpace > max * 0.6 ? cut.slice(0, lastSpace) : cut;
  return `${body.replace(/[\s,;:.!?-]+$/, "")}…`;
};

// One description per article, always non-empty.
//
// The stored `description` is the author's own summary and is preferred because it
// is unique to this post. It is only used when it actually carries text — an empty
// fragment is what an untouched editor submits — in which case the opening of the
// body is used instead. The final fallback is derived from the real title, never
// from the current date or the slug.
export const articleDescription = (blog, max = 158) => {
  const summary = truncate(toPlainText(blog?.description), max);
  if (summary) return summary;

  const opening = truncate(toPlainText(blog?.content), max);
  if (opening) return opening;

  const title = typeof blog?.title === "string" ? blog.title.trim() : "";
  return truncate(title ? `${title} — an article from the ${SITE_NAME} team.` : `An article from the ${SITE_NAME} team.`, max);
};

// <title>: unique per article because the title is, and the brand is appended
// rather than prepended so the article name leads in the SERP.
export const articleTitle = (blog) => {
  const title = typeof blog?.title === "string" ? blog.title.trim() : "";
  return title ? `${title} | ${SITE_NAME}` : `${SITE_NAME}`;
};

/* ---------- dates ---------- */

// ISO 8601, for meta tags and JSON-LD. Null when the document carries no usable
// date, so the tag is omitted instead of emitting an invalid value.
export const toIsoDate = (value) => {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
};

export const publishedIso = (blog) => toIsoDate(publishDate(blog));

// updatedAt is a real field (Mongoose timestamps), so dateModified is factual. It
// is omitted when absent rather than defaulted to the publish date.
export const modifiedIso = (blog) => toIsoDate(blog?.updatedAt);

/* ---------- images ---------- */

// The stored featured image, transformed for social cards. There is deliberately no
// fallback here: JSON-LD `image` must be a real asset, and the brand mark is not
// the article's picture.
export const articleImage = (blog, width = 1200) => optimizeImage(blog?.image, width);

/* ---------- related ---------- */

// Reuses the public blog list. There is no relevance data in the schema and no
// tagging, so inventing a scoring algorithm would be guesswork; recency is the one
// ordering the data actually supports.
//
// `selectPublicBlogs` re-applies the published filter so a draft can never be
// recommended even if the response somehow carried one, and the current article is
// always excluded.
export const relatedArticles = (payload, currentSlug, limit = 3) => {
  const others = selectPublicBlogs(payload).filter((blog) => blog.slug !== currentSlug);
  return sortByPublishDate(others).slice(0, limit);
};

/* ---------- structured data ---------- */

// JSON-LD is injected as a <script> body, where "</script>" would end the element
// early. Escaping the three HTML-significant characters as their unicode escapes
// keeps the JSON byte-for-byte equivalent while making that impossible.
export const toSafeJson = (value) =>
  JSON.stringify(value).replace(/</g, "\\u003c").replace(/>/g, "\\u003e").replace(/&/g, "\\u0026");

// BlogPosting built only from stored data.
//
// Deliberately omitted, because nothing in the schema supports them:
//   author url / jobTitle / image  — the author is a plain byline string
//   publisher foundingDate, logo   — belongs to the Organization node already present
//   keywords, articleSection, wordCount, inLanguage, commentCount
//
// `author` is typed as an Organization rather than a Person: every byline on this
// site is a team or brand name for the same agency, and no author profile exists to
// point at. Typing it as Person would assert an identity the data does not carry.
export const articleStructuredData = (blog) => {
  const canonical = articleCanonical(blog);
  const headline = typeof blog?.title === "string" ? blog.title.trim() : "";
  if (!canonical || !headline) return null;

  const description = articleDescription(blog, 300);
  const image = articleImage(blog);
  const datePublished = publishedIso(blog);
  const dateModified = modifiedIso(blog);

  const node = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "@id": `${canonical}#article`,
    mainEntityOfPage: { "@type": "WebPage", "@id": canonical },
    headline,
    url: canonical,
    isPartOf: { "@id": `${SITE_ORIGIN}/#website` },
    publisher: { "@id": ORGANIZATION_ID },
  };

  if (description) node.description = description;
  if (image) node.image = [image];
  if (datePublished) node.datePublished = datePublished;
  if (dateModified) node.dateModified = dateModified;

  // The byline is a plain string in the schema, so there is no profile to point
  // at. It is still real data, so it is kept as a name.
  const byline = typeof blog?.author === "string" ? blog.author.trim() : "";
  if (byline) node.author = { "@type": "Organization", name: byline };

  return node;
};