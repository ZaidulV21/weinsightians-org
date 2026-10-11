import { getBlogs } from "./blogApi";
import { createBlogListCache } from "../utils/blogListCache";

// One cache for the whole SPA session, shared by the listing and every article
// page. It lives in module scope on purpose: it survives route changes (so going
// back to /blogs reuses the payload) and is discarded on a full reload, when the
// page is expected to fetch the latest anyway.
//
// The fetcher resolves to the payload the API puts in response.data, matching the
// shape callers previously read as `({ data }) => data`.
export const publicBlogList = createBlogListCache({
  fetcher: () => getBlogs().then((response) => response.data),
});
