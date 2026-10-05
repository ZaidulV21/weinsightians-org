import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { FiArrowUpRight, FiSearch, FiX } from "react-icons/fi";
import Footer from "../components/Footer";
import { getBlogs } from "../api/blogApi";
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
} from "../utils/blogList";

/* ==========================================
   BRAND PALETTE
   Pulled from the colours already used across
   the site, so this page cannot drift away from
   the brand: #231746 ink, #a380ed lavender,
   #8c86a1 muted text, #e8e6f1 rules, #f7f6fb
   soft fills. Nothing here is a new colour.
   ========================================== */

/* ==========================================
   ARTICLE IMAGE
   Renders the real stored image. Two failure modes
   are handled explicitly: no image stored, and an
   image URL that no longer resolves. Neither is
   allowed to produce a broken <img>, because the
   alt text would then be shown as the article's
   entire visual.
   ========================================== */

const ImageFallback = ({ className = "" }) => (
  <div
    className={`flex items-center justify-center bg-[#f0eef8] ${className}`}
    role="img"
    aria-label="We Insightians"
  >
    <span className="font-[larken] text-sm tracking-[0.25em] text-[#8c86a1] uppercase">
      We Insightians
    </span>
  </div>
);

const ArticleImage = ({ blog, width, eager = false, className = "" }) => {
  const [failed, setFailed] = useState(false);
  const source = optimizeImage(blog?.image, width);

  // A new post reusing this component must be allowed to try its own image again.
  useEffect(() => {
    setFailed(false);
  }, [source]);

  if (!source || failed) {
    return <ImageFallback className={className} />;
  }

  return (
    <img
      src={source}
      alt={imageAlt(blog)}
      width={width}
      height={Math.round((width * 9) / 16)}
      loading={eager ? "eager" : "lazy"}
      decoding={eager ? "sync" : "async"}
      onError={() => setFailed(true)}
      className={`h-full w-full object-cover ${className}`}
    />
  );
};

/* ==========================================
   LOADING SKELETONS
   Mirror the real layout — one wide featured block
   above a three-up grid — so nothing reflows when
   the data lands. animate-pulse is disabled under
   prefers-reduced-motion.
   ========================================== */

const Bar = ({ className = "" }) => (
  <div className={`animate-pulse rounded-sm bg-[#e8e6f1] motion-reduce:animate-none ${className}`} />
);

const FeaturedSkeleton = () => (
  <div className="grid gap-8 lg:grid-cols-12 lg:gap-12">
    <div className="lg:col-span-7">
      <Bar className="aspect-[16/9] w-full" />
    </div>
    <div className="flex flex-col justify-center gap-4 lg:col-span-5">
      <Bar className="h-3 w-24" />
      <Bar className="h-8 w-full" />
      <Bar className="h-8 w-4/5" />
      <Bar className="h-4 w-full" />
      <Bar className="h-4 w-3/4" />
      <Bar className="h-4 w-32" />
    </div>
  </div>
);

const CardSkeleton = () => (
  <div className="flex flex-col gap-4">
    <Bar className="aspect-[16/9] w-full" />
    <Bar className="h-3 w-28" />
    <Bar className="h-5 w-full" />
    <Bar className="h-5 w-3/4" />
    <Bar className="h-4 w-full" />
    <Bar className="h-4 w-2/3" />
  </div>
);

/* ==========================================
   ARTICLE META
   ========================================== */

const ArticleMeta = ({ blog, className = "" }) => (
  <p className={`flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-[#6b6483] ${className}`}>
    <span>{authorName(blog)}</span>
    <span aria-hidden="true" className="text-[#c9c4dc]">
      /
    </span>
    {formatDate(publishDate(blog)) ? (
      <time dateTime={publishDate(blog)}>{formatDate(publishDate(blog))}</time>
    ) : (
      <span>Insights</span>
    )}
  </p>
);

/* ==========================================
   FEATURED ARTICLE
   ========================================== */

const FeaturedArticle = ({ blog }) => (
  <article className="group relative">
    <div className="grid gap-8 lg:grid-cols-12 lg:items-center lg:gap-12">
      <div className="overflow-hidden bg-[#f0eef8] lg:col-span-7">
        <div className="aspect-[16/9]">
          <ArticleImage
            blog={blog}
            width={1200}
            eager
            className="transition-transform duration-700 ease-out motion-reduce:transition-none motion-reduce:group-hover:scale-100 group-hover:scale-[1.03]"
          />
        </div>
      </div>

      <div className="lg:col-span-5">
        <p className="font-[gilroy] text-xs uppercase tracking-[0.28em] text-[#5a3dbd]">
          Featured
        </p>

        <h3 className="mt-4 font-[larken] text-3xl leading-[1.15] text-[#231746] sm:text-4xl">
          <Link
            to={`/blog/${blog.slug}`}
            className="transition-colors duration-300 after:absolute after:inset-0 hover:text-[#5a3dbd] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#5a3dbd] motion-reduce:transition-none"
          >
            {blog.title}
          </Link>
        </h3>

        <p className="mt-5 max-w-xl text-base leading-relaxed text-[#6b6483]">
          {excerpt(blog)}
        </p>

        <ArticleMeta blog={blog} className="mt-6" />

        <span className="mt-7 inline-flex items-center gap-2 font-[gilroy] text-sm font-medium uppercase tracking-[0.14em] text-[#231746]">
          Read article
          <FiArrowUpRight
            aria-hidden="true"
            className="h-4 w-4 transition-transform duration-300 motion-reduce:transition-none motion-reduce:group-hover:translate-x-0 group-hover:translate-x-1"
          />
        </span>
      </div>
    </div>
  </article>
);

/* ==========================================
   GRID CARD
   ========================================== */

const ArticleCard = ({ blog }) => (
  <article className="group relative flex flex-col border-t-2 border-[#e8e6f1] pt-6 transition-colors duration-300 hover:border-[#a380ed] focus-within:border-[#a380ed]">
    <div className="overflow-hidden bg-[#f0eef8]">
      <div className="aspect-[16/9]">
        <ArticleImage
          blog={blog}
          width={800}
          className="transition-transform duration-700 ease-out motion-reduce:transition-none motion-reduce:group-hover:scale-100 group-hover:scale-[1.04]"
        />
      </div>
    </div>

    <ArticleMeta blog={blog} className="mt-5" />

    <h3 className="mt-3 font-[larken] text-xl leading-snug text-[#231746] sm:text-[1.375rem]">
      <Link
        to={`/blog/${blog.slug}`}
        className="transition-colors duration-300 after:absolute after:inset-0 hover:text-[#5a3dbd] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#5a3dbd] motion-reduce:transition-none"
      >
        {blog.title}
      </Link>
    </h3>

    <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-[#6b6483]">{excerpt(blog)}</p>

    <span className="mt-6 inline-flex items-center gap-2 pt-2 font-[gilroy] text-xs font-medium uppercase tracking-[0.18em] text-[#534277]">
      Read article
      <FiArrowUpRight
        aria-hidden="true"
        className="h-3.5 w-3.5 transition-transform duration-300 motion-reduce:transition-none motion-reduce:group-hover:translate-x-0 group-hover:translate-x-1"
      />
    </span>
  </article>
);

/* ==========================================
   EMPTY / ERROR STATES
   ========================================== */

const EmptyState = ({ searching }) => (
  <div className="border-t-2 border-[#e8e6f1] py-20 text-center">
    <p className="font-[larken] text-2xl text-[#231746] sm:text-3xl">
      {searching ? "No articles match that search." : "Insights are on the way."}
    </p>
    <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-[#6b6483]">
      {searching
        ? "Try a different word, or clear the search to see everything."
        : "We are writing our first pieces now. Check back soon."}
    </p>
  </div>
);

// Deliberately says nothing about why the request failed. No status code, no API
// host, no error text: none of that belongs in a public page.
const ErrorState = ({ onRetry }) => (
  <div className="border-t-2 border-[#e8e6f1] py-20 text-center">
    <p className="font-[larken] text-2xl text-[#231746] sm:text-3xl">
      Unable to load insights right now.
    </p>
    <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-[#6b6483]">
      Something went wrong on our side. Please try again in a moment.
    </p>
    <button
      type="button"
      onClick={onRetry}
      className="mt-8 inline-flex items-center gap-2 border border-[#231746] px-7 py-3 font-[gilroy] text-xs font-medium uppercase tracking-[0.18em] text-[#231746] transition-colors duration-300 hover:bg-[#231746] hover:text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#5a3dbd] motion-reduce:transition-none"
    >
      Try again
    </button>
  </div>
);

/* ==========================================
   PAGE
   ========================================== */

const Blogs = () => {
  const [status, setStatus] = useState("loading");
  const [blogs, setBlogs] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let active = true;

    setStatus("loading");

    getBlogs()
      .then(({ data }) => {
        if (!active) return;
        // The public endpoint returns published posts only. This is not a security
        // boundary — the API filters drafts — it is a guard so a response that
        // somehow carried an unusable record cannot break the grid.
        setBlogs(selectPublicBlogs(data));
        setStatus("ready");
      })
      .catch((error) => {
        if (!active) return;
        console.error("Public blog list failed to load:", error?.message || "unknown error");
        setBlogs([]);
        setStatus("error");
      });

    return () => {
      active = false;
    };
  }, [attempt]);

  const retry = useCallback(() => setAttempt((n) => n + 1), []);

  // Most recently published first. There is no `featured` flag in the schema, so
  // recency is the only defensible way to choose the lead article.
  const ordered = useMemo(() => sortByPublishDate(blogs), [blogs]);

  // Searches the fields the listing actually shows. It does not claim to search
  // article bodies, and the placeholder does not either.
  const matches = useMemo(() => matchesQuery(ordered, searchTerm), [ordered, searchTerm]);

  const searching = isSearching(searchTerm);
  // With an active search the lead article is hidden and every result is shown in
  // one uniform grid, rather than one of them being arbitrarily promoted.
  const { lead: featured, grid: gridBlogs } = useMemo(
    () => splitLeadAndGrid(matches, searching),
    [matches, searching]
  );
  const hasAnyBlogs = ordered.length > 0;

  // The social card follows the lead article, falling back to the brand mark.
  const socialImage = optimizeImage(featured?.image, 1200) || BRAND_IMAGE;

  const isLoading = status === "loading";

  return (
    <>
      <Helmet>
        <title>{"Insights — Digital Presence, Growth & Brand | We Insightians"}</title>
        <meta
          name="description"
          content="Ideas and practical notes from We Insightians on digital presence, web design and development, branding, SEO and growing a business online."
        />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href={CANONICAL} />

        <meta property="og:type" content="website" />
        <meta property="og:title" content={"Insights — Digital Presence, Growth & Brand | We Insightians"} />
        <meta
          property="og:description"
          content="Ideas and practical notes from We Insightians on digital presence, web design and development, branding, SEO and growing a business online."
        />
        <meta property="og:url" content={CANONICAL} />
        <meta property="og:site_name" content="We Insightians" />
        <meta property="og:image" content={socialImage} />
        <meta property="og:image:alt" content={imageAlt(featured)} />

        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={"Insights — Digital Presence, Growth & Brand | We Insightians"} />
        <meta
          name="twitter:description"
          content="Ideas and practical notes from We Insightians on digital presence, web design and development, branding, SEO and growing a business online."
        />
        <meta name="twitter:image" content={socialImage} />
      </Helmet>

      {/* min-h-screen is deliberately NOT used here. This wrapper already starts
          below the sticky Navbar that PublicLayout renders above it (h-20), so a
          full-viewport minimum made the block one navbar taller than the screen:
          the footer sat ~80px past the fold, and whenever the content was shorter
          than a viewport (loading skeletons, the empty state) flex-1 opened a
          large blank gap above it. Subtracting the bar's height makes the footer
          land flush at the bottom of the screen with no overhang, and svh keeps
          it stable on mobile when the browser chrome hides. 5rem = Navbar h-20. */}
      <div className="flex min-h-[calc(100svh-5rem)] w-full flex-col bg-white font-[gilroy] text-[#231746]">
        {/* PublicLayout in App.jsx already renders the page's single <main>,
            so this stays a div — nesting a second one would break the landmark. */}
        <div className="flex-1">
          {/* ---------- HERO ---------- */}
          <section className="border-b border-[#e8e6f1]" aria-labelledby="insights-heading">
            <div className="mx-auto w-full max-w-[1400px] px-5 py-16 sm:px-8 md:py-20 lg:px-12 lg:py-28">
              <p className="font-[gilroy] text-xs uppercase tracking-[0.3em] text-[#5a3dbd]">
                Blog / Insights
              </p>

              <h1
                id="insights-heading"
                className="mt-6 max-w-4xl font-[larken] text-4xl leading-[1.08] text-[#231746] sm:text-5xl lg:text-6xl"
              >
                Ideas, insights &amp; digital thinking.
              </h1>

              <p className="mt-7 max-w-2xl text-base leading-relaxed text-[#6b6483] sm:text-lg">
                Notes from the We Insightians team on building a stronger presence online — how
                websites, brands and content actually come together, written for people who have
                to make these decisions themselves.
              </p>
            </div>
          </section>

          <div className="mx-auto w-full max-w-[1400px] px-5 sm:px-8 lg:px-12">
            {/* ---------- SEARCH ---------- */}
            {status === "ready" && hasAnyBlogs && (
              <div className="flex flex-col gap-3 border-b border-[#e8e6f1] py-8 sm:flex-row sm:items-center sm:justify-between">
                <div role="search" className="relative w-full sm:max-w-sm">
                  <label htmlFor="insights-search" className="sr-only">
                    Search articles by title, summary or author
                  </label>
                  <FiSearch
                    aria-hidden="true"
                    className="pointer-events-none absolute left-0 top-1/2 h-4 w-4 -translate-y-1/2 text-[#a380ed]"
                  />
                  <input
                    id="insights-search"
                    type="search"
                    value={searchTerm}
                    onChange={(event) => setSearchTerm(event.target.value)}
                    placeholder="Search insights"
                    autoComplete="off"
                    className="w-full border-b border-[#ddd9ea] bg-transparent py-2 pl-7 pr-8 text-sm text-[#231746] placeholder:text-[#a9a4bd] focus:border-[#5a3dbd] focus:outline-none"
                  />
                  {searchTerm && (
                    <button
                      type="button"
                      onClick={() => setSearchTerm("")}
                      aria-label="Clear search"
                      className="absolute right-0 top-1/2 -translate-y-1/2 p-1 text-[#8c86a1] transition-colors duration-200 hover:text-[#231746] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#5a3dbd]"
                    >
                      <FiX aria-hidden="true" className="h-4 w-4" />
                    </button>
                  )}
                </div>

                <p aria-live="polite" className="text-xs uppercase tracking-[0.18em] text-[#8c86a1]">
                  {searching
                    ? `${matches.length} ${matches.length === 1 ? "result" : "results"}`
                    : `${ordered.length} ${ordered.length === 1 ? "article" : "articles"}`}
                </p>
              </div>
            )}

            {/* ---------- CONTENT ---------- */}
            <div className="py-14 lg:py-20" aria-busy={isLoading}>
              {isLoading ? (
                <div className="flex flex-col gap-20">
                  <FeaturedSkeleton />
                  <div className="grid gap-x-8 gap-y-14 sm:grid-cols-2 xl:grid-cols-3">
                    {[0, 1, 2].map((index) => (
                      <CardSkeleton key={index} />
                    ))}
                  </div>
                </div>
              ) : status === "error" ? (
                <ErrorState onRetry={retry} />
              ) : !hasAnyBlogs ? (
                <EmptyState searching={false} />
              ) : matches.length === 0 ? (
                <EmptyState searching />
              ) : (
                <div className="flex flex-col gap-20">
                  {featured && (
                    <section aria-labelledby="featured-heading">
                      <h2
                        id="featured-heading"
                        className="font-[gilroy] text-xs uppercase tracking-[0.28em] text-[#8c86a1]"
                      >
                        Latest article
                      </h2>
                      <div className="mt-8">
                        <FeaturedArticle blog={featured} />
                      </div>
                    </section>
                  )}

                  {gridBlogs.length > 0 && (
                    <section aria-labelledby="all-heading">
                      <h2
                        id="all-heading"
                        className="font-[gilroy] text-xs uppercase tracking-[0.28em] text-[#8c86a1]"
                      >
                        {searching ? "Search results" : "More insights"}
                      </h2>
                      <div className="mt-8 grid gap-x-8 gap-y-14 sm:grid-cols-2 xl:grid-cols-3">
                        {gridBlogs.map((blog) => (
                          <ArticleCard key={blog.slug} blog={blog} />
                        ))}
                      </div>
                    </section>
                  )}
                </div>
              )}
            </div>
              <Footer />
          </div>
        </div>

      </div>
    </>
  );
};

export default Blogs;