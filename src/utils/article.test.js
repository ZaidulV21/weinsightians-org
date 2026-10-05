import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  ORGANIZATION_ID,
  articleCanonical,
  articleDescription,
  articleImage,
  articleStructuredData,
  articleTitle,
  articleUrl,
  modifiedIso,
  publishedIso,
  relatedArticles,
  toPlainText,
  toSafeJson,
  truncate,
} from "./article.js";

const ORIGIN = "https://weinsightian.tech";

const post = {
  _id: "68e8a1b2c3d4e5f6a7b8c9d0",
  title: "5 Proven Digital Marketing Strategies to Explode Your Brand's Online Growth",
  slug: "5-proven-digital-marketing-strategies-to-explode-your-brands-online-growth",
  description: "Five strategies that reliably move the needle for growing brands online.",
  content: "<p>Digital presence is <strong>critical</strong> for business growth.</p><h2>Why it matters</h2>",
  author: "Sam wills",
  image: "https://res.cloudinary.com/demo/image/upload/v1/sample.jpg",
  status: "published",
  publishedAt: "2026-10-02T18:12:14.721Z",
  createdAt: "2026-02-20T10:00:00.000Z",
  updatedAt: "2026-10-03T12:06:49.048Z",
  __v: 0,
};

describe("toPlainText", () => {
  it("strips markup and collapses whitespace", () => {
    assert.equal(toPlainText("<p>Hello   <b>world</b></p>"), "Hello world");
  });

  it("drops script and style bodies instead of exposing them as text", () => {
    assert.equal(toPlainText("<p>Hi</p><script>alert(1)</script>"), "Hi");
  });

  it("returns an empty string for non-strings", () => {
    for (const value of [null, undefined, 42, {}]) {
      assert.equal(toPlainText(value), "");
    }
  });
});

describe("truncate", () => {
  it("leaves short text alone", () => {
    assert.equal(truncate("Short enough."), "Short enough.");
  });

  it("cuts on a word boundary near the limit", () => {
    const out = truncate("alpha beta gamma delta epsilon zeta", 20);
    assert.ok(out.endsWith("…"));
    assert.ok(out.length <= 21);
    assert.equal(out, "alpha beta gamma…");
  });

  it("still cuts a single word that is longer than the limit", () => {
    // lastIndexOf(" ") would be -1 here; slicing to it would silently drop the
    // final character and return a corrupted string.
    const out = truncate("supercalifragilisticexpialidocious", 10);
    assert.equal(out, "supercalif…");
  });

  it("never returns a truncated string for empty input", () => {
    assert.equal(truncate(""), "");
    assert.equal(truncate(null), "");
  });
});

describe("addresses", () => {
  it("builds the canonical from the article's own slug", () => {
    assert.equal(articleCanonical(post), `${ORIGIN}/blog/${post.slug}`);
    assert.equal(articleUrl("some-slug"), `${ORIGIN}/blog/some-slug`);
  });

  it("never canonicalises to /blogs or to a slugless /blog", () => {
    const canonical = articleCanonical(post);
    assert.ok(!canonical.endsWith("/blogs"));
    assert.ok(!canonical.endsWith("/blog"));
    assert.ok(!canonical.includes("Some%20Title"));
  });

  it("returns null without a usable slug rather than guessing one", () => {
    assert.equal(articleCanonical({}), null);
    assert.equal(articleCanonical({ slug: "" }), null);
  });
});

describe("articleTitle and articleDescription", () => {
  it("produces a unique title per article with the brand appended", () => {
    assert.equal(articleTitle(post), `${post.title} | We Insightians`);
  });

  it("uses the stored summary so each article's description is unique", () => {
    assert.equal(articleDescription(post), "Five strategies that reliably move the needle for growing brands online.");
  });

  it("falls back to the body when the summary is an empty fragment", () => {
    const blank = { ...post, description: "<p><br></p>" };
    assert.equal(articleDescription(blank), "Digital presence is critical for business growth. Why it matters");
  });

  it("falls back to the real title, never to a date or the slug", () => {
    const noCopy = { ...post, description: "", content: "" };
    const out = articleDescription(noCopy);
    assert.ok(out.includes(post.title));
    assert.ok(!/\d{4}/.test(out));
    assert.ok(!out.includes(post.slug));
  });

  it("is never empty, even for an empty document", () => {
    assert.ok(articleDescription({}).length > 0);
  });

  it("keeps the description inside the length search engines will show", () => {
    const long = { ...post, description: "word ".repeat(300) };
    assert.ok(articleDescription(long).length <= 159);
  });
});

describe("dates", () => {
  it("uses publishedAt, not createdAt", () => {
    assert.equal(publishedIso(post), "2026-10-02T18:12:14.721Z");
  });

  it("falls back to createdAt only when publishedAt is missing", () => {
    assert.equal(publishedIso({ createdAt: "2026-02-20T10:00:00.000Z" }), "2026-02-20T10:00:00.000Z");
  });

  it("reports dateModified from the real updatedAt field", () => {
    assert.equal(modifiedIso(post), "2026-10-03T12:06:49.048Z");
  });

  it("omits a date entirely rather than inventing one", () => {
    assert.equal(publishedIso({}), null);
    assert.equal(modifiedIso({}), null);
    assert.equal(publishedIso({ publishedAt: "nonsense" }), null);
  });

  it("never returns today's date for a document with no dates", () => {
    const out = publishedIso({});
    assert.ok(out === null || !out.startsWith(new Date().getFullYear().toString().slice(0, 2)));
  });
});

describe("articleImage", () => {
  it("transforms the stored image", () => {
    assert.equal(articleImage(post), "https://res.cloudinary.com/demo/image/upload/w_1200,f_auto,q_auto/v1/sample.jpg");
  });

  it("returns null when there is no image — JSON-LD must not carry a fake URL", () => {
    assert.equal(articleImage({ ...post, image: null }), null);
    assert.equal(articleImage({}), null);
  });
});

describe("relatedArticles", () => {
  const payload = {
    blogs: [
      { ...post, slug: "current" },
      { ...post, slug: "older", publishedAt: "2026-01-01T00:00:00.000Z" },
      { ...post, slug: "newer", publishedAt: "2026-11-01T00:00:00.000Z" },
      { ...post, slug: "a-draft", status: "draft" },
    ],
  };

  it("never recommends the current article", () => {
    assert.equal(relatedArticles(payload, "current").some((p) => p.slug === "current"), false);
  });

  it("never recommends a draft", () => {
    assert.equal(relatedArticles(payload, "current").some((p) => p.slug === "a-draft"), false);
  });

  it("orders by publication date, newest first", () => {
    const out = relatedArticles(payload, "current");
    assert.deepEqual(out.map((p) => p.slug), ["newer", "older"]);
  });

  it("respects the limit", () => {
    assert.equal(relatedArticles(payload, "current", 1).length, 1);
  });

  it("returns an empty list for a malformed response", () => {
    assert.deepEqual(relatedArticles(null, "current"), []);
    assert.deepEqual(relatedArticles({ blogs: "no" }, "current"), []);
  });

  it("returns nothing when the article is the only published post", () => {
    assert.deepEqual(relatedArticles({ blogs: [{ ...post, slug: "only" }] }, "only"), []);
  });
});

describe("articleStructuredData", () => {
  it("is valid JSON once serialised", () => {
    const json = toSafeJson(articleStructuredData(post));
    assert.doesNotThrow(() => JSON.parse(json));
  });

  it("uses BlogPosting with a self-referencing canonical", () => {
    const node = articleStructuredData(post);
    assert.equal(node["@type"], "BlogPosting");
    assert.equal(node.headline, post.title);
    assert.equal(node.url, `${ORIGIN}/blog/${post.slug}`);
    assert.equal(node.mainEntityOfPage["@id"], `${ORIGIN}/blog/${post.slug}`);
    assert.equal(node["@id"], `${ORIGIN}/blog/${post.slug}#article`);
  });

  it("references the existing Organization and WebSite instead of redeclaring them", () => {
    const node = articleStructuredData(post);
    assert.deepEqual(node.publisher, { "@id": ORGANIZATION_ID });
    assert.deepEqual(node.isPartOf, { "@id": `${ORIGIN}/#website` });
    assert.equal(node.publisher.name, undefined);
    assert.equal(node["@type"] === "Organization", false);
  });

  it("carries the real dates", () => {
    const node = articleStructuredData(post);
    assert.equal(node.datePublished, "2026-10-02T18:12:14.721Z");
    assert.equal(node.dateModified, "2026-10-03T12:06:49.048Z");
  });

  it("carries the author name but invents no author URL, job title or image", () => {
    const node = articleStructuredData(post);
    assert.equal(node.author.name, "Sam wills");
    assert.equal(node.author.url, undefined);
    assert.equal(node.author.jobTitle, undefined);
    assert.equal(node.author.image, undefined);
  });

  it("omits image entirely when the article has none", () => {
    const node = articleStructuredData({ ...post, image: null });
    assert.equal("image" in node, false);
  });

  it("omits dateModified when the document has no updatedAt", () => {
    const noUpdated = { ...post };
    delete noUpdated.updatedAt;
    assert.equal("dateModified" in articleStructuredData(noUpdated), false);
  });

  it("never invents founding data, keywords or word counts", () => {
    const node = articleStructuredData(post);
    for (const key of ["keywords", "wordCount", "articleSection", "inLanguage", "commentCount", "thumbnailUrl"]) {
      assert.equal(key in node, false, `${key} must not be fabricated`);
    }
  });

  it("returns null for a document with no title or slug", () => {
    assert.equal(articleStructuredData({}), null);
    assert.equal(articleStructuredData({ title: post.title }), null);
    assert.equal(articleStructuredData({ slug: post.slug }), null);
  });
});

describe("toSafeJson", () => {
  it("neutralises a closing script tag coming from stored text", () => {
    const hostile = { ...post, title: 'Evil</script><script>alert(1)</script>' };
    const json = toSafeJson(articleStructuredData(hostile));
    assert.equal(json.includes("</script>"), false);
    assert.equal(json.includes("<script"), false);
    // Still valid, and still the same data.
    assert.equal(JSON.parse(json).headline, hostile.title);
  });

  it("escapes < > and & everywhere in the payload", () => {
    const json = toSafeJson({ a: "<b>&</b>" });
    assert.equal(json.includes("<"), false);
    assert.equal(json.includes(">"), false);
    assert.equal(JSON.parse(json).a, "<b>&</b>");
  });
});