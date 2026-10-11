import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { isAuthenticatedSession } from "./session.js";

describe("isAuthenticatedSession", () => {
  it("accepts the API's /auth/me success shape", () => {
    const payload = {
      msg: "authenticated",
      message: "authenticated",
      user: { name: "Admin", email: "admin@weinsightian.tech", role: "admin" },
    };
    assert.equal(isAuthenticatedSession(payload), true);
  });

  it("never accepts a success page returned in place of the API", () => {
    // A host that is not the API responds 200 with its own HTML for every path,
    // /auth/me included. Axios passes that markup through as `data`.
    const html = "<!doctype html><html><body>We Insightians</body></html>";
    assert.equal(isAuthenticatedSession(html), false);
  });

  it("rejects null, undefined and plain empty objects", () => {
    for (const bad of [null, undefined, {}, { success: true }, { blogs: [] }]) {
      assert.equal(isAuthenticatedSession(bad), false, JSON.stringify(bad));
    }
  });

  it("rejects a user field that is not an object", () => {
    assert.equal(isAuthenticatedSession({ user: "admin@weinsightian.tech" }), false);
    assert.equal(isAuthenticatedSession({ user: null }), false);
    assert.equal(isAuthenticatedSession({ user: ["admin"] }), false);
  });

  it("rejects a top-level array", () => {
    assert.equal(isAuthenticatedSession([{ user: {} }]), false);
  });

  it("the public blog payload is never a session", () => {
    assert.equal(
      isAuthenticatedSession({ success: true, count: 2, blogs: [{ title: "A post" }] }),
      false
    );
  });
});