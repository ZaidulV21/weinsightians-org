/* ==========================================
   ADMIN BLOG LIST — DATA LOGIC
   ==========================================
   Pure and free of JSX, so the admin list page's contract with the API can be
   tested directly.

   The endpoint is GET /api/v1/blogs/admin/all. It needs an admin session (an
   HttpOnly cookie) and the server returns every post, drafts included, plus its
   own totals:

     { success, count, publishedCount, draftCount, blogs: [ ... ] }

   The important rule here is that a malformed body is an ERROR, not an empty
   workspace. "0 posts" is only a real, useful statement when the API actually
   said it. A success page (HTML), a JSON body with no blogs array, or a missing
   body must never flatten into "0 posts" — the caller treats such a response as
   a load failure instead.
   ========================================== */

export const parseAdminList = (payload) => {
  if (
    !payload ||
    typeof payload !== "object" ||
    Array.isArray(payload) ||
    !Array.isArray(payload.blogs)
  ) {
    return { ok: false, blogs: [], counts: null };
  }

  const numbers = (value, fallback) => {
    const parsed = Number(value);
    return Number.isNaN(parsed) ? fallback : parsed;
  };

  return {
    ok: true,
    blogs: payload.blogs,
    counts: {
      // The server always sends count; fall back to the array when it is
      // absent so the dashboard never shows a number that contradicts its rows.
      total: numbers(payload.count, payload.blogs.length),
      published: numbers(payload.publishedCount, 0),
      drafts: numbers(payload.draftCount, 0),
    },
  };
};