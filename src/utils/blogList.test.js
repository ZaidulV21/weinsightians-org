import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  BRAND_IMAGE,
  CANONICAL,
  authorName,
  excerpt,
  formatDate,
  imageAlt,
  isSearching,
  matchesQuery,
  optimizeImage,
  publishDate,
  selectPublicBlogs,
  sortByPublishDate,
  splitLeadAndGrid,
} from "./blogList.js";

/* The two posts currently live on the public endpoint, reduced to the fields the
   listing reads. They are deliberately in the order the API returns them, which is
   not publication order, so ordering is actually exercised. */
const production = {
  success: true,
  count: 2,
  blogs: [
    {
      _id: "68e8a1b2c3d4e5f6a7b8c9d0",
      title: "Why Digital Presence is Critical for Business Growth in 2026",
      slug: "why-digital-presence-is-critical-for-business-growth-in-2026-or-web-seo-and-ai-strategy",
      description: "How web presence, SEO and AI strategy shape growth.",
      author: "WeInsightians Tech Team",
      image:
        "https://res.cloudinary.com/demo/image/upload/v1/sample.jpg",
      status: "published",
      publishedAt: "2026-09-30T08:12:53.840Z",
      createdAt: "2026-02-25T10:00:00.000Z",
      updatedAt: "2026-09-30T08:12:53.840Z",
      __v: 0,
    },
    {
      _id: "68e8a1b2c3d4e5f6a7b8c9d1",
      title: "5 Proven Digital Marketing Strategies to Explode Your Brand's Online Growth",
      slug: "5-proven-digital-marketing-strategies-to-explode-your-brands-online-growth",
      description: "Five strategies that reliably move the needle.",
      author: "Sam wills",
      image:
        "https://res.cloudinary.com/demo/image/upload/v1/sample.jpg",
      status: "published",
      publishedAt: "2026-10-02T18:12:14.721Z",
      createdAt: "2026-02-20T10:00:00.000Z",
      updatedAt: "2026-10-03T12:06:49.048Z",
      __v: 0,
    },
  ],
};

describe("selectPublicBlogs", () => {
  it("reads the top-level blogs array from the API response", () => {
    assert.equal(selectPublicBlogs(production).length, 2);
  });

  it("returns an empty list rather than throwing on a malformed response", () => {
    for (const bad of [null, undefined, {}, { blogs: null }, { blogs: "no" }, "nope", 42]) {
      assert.deepEqual(selectPublicBlogs(bad), []);
    }
  });

  it("never surfaces a draft", () => {
    const withDraft = { blogs: [...production.blogs, { ...production.blogs[0], status: "draft", slug: "draft-post" }] };
    const kept = selectPublicBlogs(withDraft).map((b) => b.slug);
    assert.equal(kept.includes("draft-post"), false);
  });

  it("keeps legacy posts whose status is absent or null, matching publishedFilter()", () => {
    const legacy = { blogs: [{ ...production.blogs[0], status: undefined }, { ...production.blogs[0], status: null, slug: "legacy" }] };
    assert.equal(selectPublicBlogs(legacy).length, 2);
  });

  it("drops records without a usable slug, which cannot be linked to", () => {
    const bad = { blogs: [null, {}, { title: "No slug" }, { slug: "" }, production.blogs[0]] };
    assert.equal(selectPublicBlogs(bad).length, 1);
  });
});

describe("publishDate and formatDate", () => {
  it("prefers publishedAt over createdAt, which differ by months in production", () => {
    const blog = production.blogs[1];
    assert.notEqual(blog.publishedAt, blog.createdAt);
    assert.equal(publishDate(blog), "2026-10-02T18:12:14.721Z");
    assert.equal(formatDate(publishDate(blog)), "October 2, 2026");
  });

  it("falls back to createdAt for posts written before publishedAt existed", () => {
    const legacy = { createdAt: "2026-02-25T10:00:00.000Z" };
    assert.equal(publishDate(legacy), "2026-02-25T10:00:00.000Z");
  });

  it("returns null rather than inventing a date when none is usable", () => {
    assert.equal(publishDate({}), null);
    assert.equal(formatDate(null), null);
    assert.equal(formatDate("not a date"), null);
  });
});

describe("sortByPublishDate", () => {
  it("puts the most recently published post first regardless of input order", () => {
    const ordered = sortByPublishDate(selectPublicBlogs(production));
    assert.match(ordered[0].title, /^5 Proven Digital Marketing/);
    assert.match(ordered[1].title, /^Why Digital Presence/);
  });

  it("sorts posts with no usable date last", () => {
    const list = sortByPublishDate([{ slug: "undated" }, ...production.blogs]);
    assert.equal(list[list.length - 1].slug, "undated");
  });

  it("does not mutate the array it is given", () => {
    const input = [...production.blogs];
    const copy = [...input];
    sortByPublishDate(input);
    assert.deepEqual(input, copy);
  });
});

describe("matchesQuery", () => {
  const blogs = sortByPublishDate(selectPublicBlogs(production));

  it("matches on title, description and author, case-insensitively", () => {
    assert.equal(matchesQuery(blogs, "digital").length, 2);
    assert.equal(matchesQuery(blogs, "PROVEN").length, 1);
    assert.equal(matchesQuery(blogs, "Sam wills").length, 1);
    assert.equal(matchesQuery(blogs, "needle").length, 1);
  });

  it("returns everything for a blank query", () => {
    assert.equal(matchesQuery(blogs, "").length, 2);
    assert.equal(matchesQuery(blogs, "   ").length, 2);
    assert.equal(matchesQuery(blogs, null).length, 2);
  });

  it("returns nothing when there is no match", () => {
    assert.equal(matchesQuery(blogs, "zzzznotpresent").length, 0);
  });
});

describe("isSearching and splitLeadAndGrid", () => {
  const blogs = sortByPublishDate(selectPublicBlogs(production));

  it("treats whitespace as not searching", () => {
    assert.equal(isSearching(""), false);
    assert.equal(isSearching("   "), false);
    assert.equal(isSearching("seo"), true);
  });

  it("promotes one lead post and grids the rest when idle", () => {
    const { lead, grid } = splitLeadAndGrid(blogs, false);
    assert.equal(lead.title, blogs[0].title);
    assert.equal(grid.length, blogs.length - 1);
  });

  it("shows every result in one grid and promotes none while searching", () => {
    const results = matchesQuery(blogs, "digital");
    const { lead, grid } = splitLeadAndGrid(results, true);
    assert.equal(lead, null);
    assert.equal(grid.length, results.length);
  });

  it("handles a single post and an empty list", () => {
    assert.deepEqual(splitLeadAndGrid([blogs[0]], false).grid, []);
    assert.equal(splitLeadAndGrid([], false).lead, null);
    assert.deepEqual(splitLeadAndGrid([], true).grid, []);
  });
});

describe("authorName, excerpt and imageAlt", () => {
  it("shows the author the API returned", () => {
    assert.equal(authorName(production.blogs[0]), "WeInsightians Tech Team");
    assert.equal(authorName(production.blogs[1]), "Sam wills");
  });

  it("never leaves an empty byline", () => {
    assert.equal(authorName({}), "We Insightians");
    assert.equal(authorName({ author: "   " }), "We Insightians");
    assert.equal(authorName({ author: 42 }), "We Insightians");
  });

  it("never leaves an empty summary", () => {
    assert.equal(excerpt({ description: "Real copy." }), "Real copy.");
    assert.equal(excerpt({}), "Read the full article.");
    assert.equal(excerpt({ description: "   " }), "Read the full article.");
  });

  it("strips markup from descriptions so it cannot render as text", () => {
    assert.equal(excerpt({ description: "<p>Hello <b>world</b></p>" }), "Hello world");
  });

  it("never leaves an empty image alt", () => {
    assert.equal(imageAlt(production.blogs[0]), production.blogs[0].title);
    assert.equal(imageAlt({}), "Article");
  });
});

describe("optimizeImage", () => {
  it("adds Cloudinary's transform to a Cloudinary URL", () => {
    const out = optimizeImage("https://res.cloudinary.com/demo/image/upload/v1/sample.jpg", 800);
    assert.equal(out, "https://res.cloudinary.com/demo/image/upload/w_800,f_auto,q_auto/v1/sample.jpg");
  });

  it("leaves an image hosted elsewhere untouched", () => {
    const url = "https://example.com/blog/cover.png";
    assert.equal(optimizeImage(url, 800), url);
  });

  it("returns null for a missing image so the caller can fall back", () => {
    assert.equal(optimizeImage(undefined, 800), null);
    assert.equal(optimizeImage(null, 800), null);
    assert.equal(optimizeImage("", 800), null);
  });
});

describe("SEO constants", () => {
  it("uses the site's real origin and page path", () => {
    assert.equal(CANONICAL, "https://weinsightian.tech/blogs");
    assert.ok(CANONICAL.startsWith("https://"));
    assert.ok(BRAND_IMAGE.startsWith("https://"));
  });
});