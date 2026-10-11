import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { parseAdminList } from "./adminBlogs.js";

// The shape the admin endpoint returns, drafts included. Modeled on the real
// GET /api/v1/blogs/admin/all response so the parsing contract matches what the
// server actually sends.
const production = {
  success: true,
  count: 3,
  publishedCount: 2,
  draftCount: 1,
  blogs: [
    {
      _id: "6ac143363dcba4b477bf5db0",
      title: "How Google Business Profile and Your Website Work Together for Local SEO",
      slug: "how-google-business-profile-and-your-website-work-together-for-local-seo",
      description: "Local SEO the practical way.",
      author: "Team Weinsightians",
      status: "published",
    },
    {
      _id: "6ac1428b3dcba4b477bf5da9",
      title: "7 Reasons Your Business Website Is Not Generating Leads",
      slug: "7-reasons-your-business-website-is-not-generating-leads",
      description: "Lead gen problems, fixed.",
      author: "Team Weinsghitans",
      status: "published",
    },
    {
      _id: "6ac5fb2e4b477bf5db0a2c1",
      title: "Unpublished draft",
      slug: "unpublished-draft",
      description: "Still being written.",
      author: "Team Weinsightians",
      status: "draft",
    },
  ],
};

describe("parseAdminList", () => {
  it("loads the existing posts with the server's own counts", () => {
    const parsed = parseAdminList(production);

    assert.equal(parsed.ok, true);
    assert.equal(parsed.blogs.length, 3);
    assert.deepEqual(parsed.counts, { total: 3, published: 2, drafts: 1 });
  });

  it("keeps drafts in the list so an admin can see and edit them", () => {
    const parsed = parseAdminList(production);
    assert.ok(parsed.blogs.some((blog) => blog.status === "draft"));
  });

  it("treats an empty workspace as empty, not as a failure", () => {
    const parsed = parseAdminList({
      success: true,
      count: 0,
      publishedCount: 0,
      draftCount: 0,
      blogs: [],
    });

    assert.equal(parsed.ok, true);
    assert.deepEqual(parsed.blogs, []);
    assert.deepEqual(parsed.counts, { total: 0, published: 0, drafts: 0 });
  });

  it("falls back to the array length when the server omits count", () => {
    const parsed = parseAdminList({ blogs: [production.blogs[0], production.blogs[1]] });
    assert.equal(parsed.counts.total, 2);
  });

  it("never reads a blog count from a non-JSON body", () => {
    for (const bad of [
      "<!doctype html><html><body>0 posts</body></html>",
      null,
      undefined,
      {},
      { blogs: "no" },
      { blogs: null },
      [production.blogs[0]],
      42,
    ]) {
      const parsed = parseAdminList(bad);
      assert.equal(parsed.ok, false, JSON.stringify(bad)?.slice(0, 80));
      assert.equal(parsed.counts, null);
      assert.deepEqual(parsed.blogs, []);
    }
  });

  it("does not mutate the response it is given", () => {
    const input = JSON.parse(JSON.stringify(production));
    parseAdminList(input);
    assert.deepEqual(input, production);
  });
});