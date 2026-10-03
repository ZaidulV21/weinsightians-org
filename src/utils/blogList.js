/* ==========================================
   PUBLIC BLOG LIST — DATA LOGIC
   ==========================================
   Everything here is pure and free of JSX, deliberately.

   The listing has a handful of rules that are easy to get subtly wrong and
   impossible to eyeball in a browser: which post leads, which date is the real
   publication date, what happens when a post has no image, and what a search
   actually matches. Keeping them out of the component means they can be tested
   directly, and means the markup file only has to worry about markup.

   The API contract, as returned by GET /api/v1/blogs:
     { success, count, blogs: [ { _id, title, slug, description, content,
       author, image, status, publishedAt, createdAt, updatedAt, __v } ] }
   ========================================== */

export const SITE_ORIGIN = "https://weinsightian.tech";
export const PAGE_PATH = "/blogs";
export const CANONICAL = `${SITE_ORIGIN}${PAGE_PATH}`;

// Used only when a post has no image at all, and as the social card fallback. It
// is a real file in public/img, not a placeholder invented for this page.
export const BRAND_IMAGE = `${SITE_ORIGIN}/img/web-app-manifest-512x512.png`;

export const PUBLISHED = "published";

/* ---------- images ---------- */

// Adds Cloudinary's on-the-fly resize/format/quality transform. Applied only when
// the URL actually points at Cloudinary, so an image stored anywhere else is still
// rendered rather than silently mangled.
export const optimizeImage = (url, width) => {
  if (!url || typeof url !== "string") return null;
  if (!url.includes("/upload/")) return url;
  return url.replace("/upload/", `/upload/w_${width},f_auto,q_auto/`);
};

/* ---------- dates ---------- */

// A post's publication date. The API sets publishedAt to createdAt for posts that
// predate the field, but for a post published long after it was written the two
// genuinely differ, and createdAt would misreport when it went live.
export const publishDate = (blog) => blog?.publishedAt || blog?.createdAt || null;

// "October 3, 2026". Returns null when there is no trustworthy date, so the
// caller can omit the date rather than print today's, which would be a fabrication.
export const formatDate = (value) => {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
};

// Milliseconds, or null when unusable. Posts with no usable date sort last rather
// than jumping to the top.
const publishTime = (blog) => {
  const value = publishDate(blog);
  if (!value) return null;
  const time = new Date(value).getTime();
  return Number.isNaN(time) ? null : time;
};

/* ---------- text ---------- */

// Never renders an empty byline. The team name is used because it is what the
// site already calls itself, not as an invented person.
export const authorName = (blog) => {
  const author = typeof blog?.author === "string" ? blog.author.trim() : "";
  return author || "We Insightians";
};

// The API stores description as text. Tags are stripped defensively so markup can
// never reach the page as visible characters.
export const excerpt = (blog) => {
  const raw = typeof blog?.description === "string" ? blog.description : "";
  const text = raw.replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();
  return text || "Read the full article.";
};

// The alt text for an article image: the article's own title, which is what the
// image depicts in context. Never blank, so a decorative-looking <img> with no
// label can never appear.
export const imageAlt = (blog) =>
  typeof blog?.title === "string" && blog.title.trim() ? blog.title.trim() : "Article";

/* ---------- selection ---------- */

// The public endpoint returns published posts only, and that is the real access
// control. This guard exists so a response carrying an unusable record cannot
// break the grid. `status` is absent on posts written before the field existed and
// those are public, so they are kept — the same rule the API's publishedFilter()
// applies. It must never be used as a substitute for the server-side filter.
export const selectPublicBlogs = (payload) => {
  if (!Array.isArray(payload?.blogs)) return [];
  return payload.blogs.filter(
    (blog) => blog && typeof blog.slug === "string" && blog.slug && (blog.status == null || blog.status === PUBLISHED)
  );
};

// Most recently published first. There is no `featured` flag in the schema, so
// recency is the only defensible rule for choosing the lead article.
export const sortByPublishDate = (blogs) =>
  [...blogs].sort((a, b) => (publishTime(b) ?? -Infinity) - (publishTime(a) ?? -Infinity));

// Searches the fields the listing actually shows: title, description and author.
// It does not search article bodies, and the UI does not claim to.
export const matchesQuery = (blogs, query) => {
  const needle = typeof query === "string" ? query.trim().toLowerCase() : "";
  if (!needle) return blogs;
  return blogs.filter((blog) => {
    const haystack = [blog?.title, blog?.description, blog?.author]
      .filter((value) => typeof value === "string")
      .join(" ")
      .toLowerCase();
    return haystack.includes(needle);
  });
};

// While searching, no post is promoted: every result renders in one uniform grid.
export const splitLeadAndGrid = (matches, searching) =>
  searching
    ? { lead: null, grid: matches }
    : { lead: matches[0] || null, grid: matches.slice(1) };

export const isSearching = (query) => typeof query === "string" && query.trim().length > 0;