import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { FiArrowLeft, FiCheck, FiCopy, FiLinkedin, FiFacebook, FiTwitter } from "react-icons/fi";
import { FaWhatsapp } from "react-icons/fa";
import Footer from "../components/Footer";
import NotFound from "./NotFound";
import { getBlogs, getSingleBlog } from "../api/blogApi";
import { BRAND_IMAGE, authorName, formatDate, imageAlt, optimizeImage, publishDate } from "../utils/blogList";
import {
  SITE_NAME,
  articleCanonical,
  articleDescription,
  articleImage,
  articleStructuredData,
  articleTitle,
  modifiedIso,
  publishedIso,
  relatedArticles,
  toSafeJson,
} from "../utils/article";

/* ==========================================
   PUBLIC ARTICLE — /blog/:slug
   ==========================================
   The article body is stored HTML, sanitized server-side on the way into the
   database by sanitizeBlogContent() (server/utils/sanitizeUtils.js). That
   allowlist is the security boundary: it keeps a fixed set of formatting tags,
   allows only http/https/mailto/tel link schemes, strips script/style/iframe
   along with their contents, forces rel="noopener noreferrer nofollow" onto
   links and loading="lazy" onto images.

   The dangerouslySetInnerHTML below therefore renders content that has already
   been through that filter — the same path the page used before this redesign.
   It is not weakened, widened or bypassed here, and no new markup is injected
   through it.

   What this file adds is presentation and per-article SEO: an editorial reading
   layout, real article metadata, BlogPosting structured data, and honest
   loading / not-found / error states.

   Nothing here is invented. There is no category, tag, reading-time or author
   profile in the schema, so none is shown.
   ========================================== */

/* ==========================================
   ARTICLE IMAGE
   ==========================================
   The stored featured image, or nothing at all. When there is no image the header
   simply has no picture and keeps its type hierarchy — an empty grey frame would
   be worse than no frame. A URL that fails to load is dropped the same way, so a
   dead CDN path can never leave a broken image icon in the header.
   ========================================== */

const FeaturedImage = ({ blog }) => {
  const [failed, setFailed] = useState(false);
  const source = optimizeImage(blog.image, 1400);

  // A new article reusing this component gets its own attempt.
  useEffect(() => {
    setFailed(false);
  }, [source]);

  if (!source || failed) return null;

  return (
    <figure className="mt-12 lg:mt-16">
      {/* Fixed 16:9 box plus eager loading: this is the largest paint on the page
          and sits above the fold, so it should not wait for a lazy-load queue.
          animate-pulse is disabled under prefers-reduced-motion. */}
      <div className="aspect-[16/9] w-full overflow-hidden rounded-sm bg-[#f0eef8]">
        <img
          src={source}
          alt={imageAlt(blog)}
          width={1400}
          height={788}
          loading="eager"
          decoding="sync"
          onError={() => setFailed(true)}
          className="h-full w-full object-cover"
        />
      </div>
    </figure>
  );
};

/* ==========================================
   BYLINE
   ==========================================
   Author and publication date only. The old page also printed a "min read"
   figure computed from the body; there is no stored reading time, and a derived
   one that silently contradicts the real article is exactly the kind of invented
   metadata this page should not publish, so it has been removed.
   ========================================== */

const Byline = ({ blog }) => {
  const author = authorName(blog);
  const date = formatDate(publishDate(blog));

  if (!author && !date) return null;

  return (
    <div className="mt-8 flex flex-wrap items-center gap-x-3 gap-y-2 text-sm text-[#6b6483]">
      {author && <span className="font-[larken] text-[#231746]">{author}</span>}
      {author && date && (
        <span aria-hidden="true" className="text-[#c9c4dc]">
          /
        </span>
      )}
      {date && <time dateTime={publishDate(blog)}>{date}</time>}
    </div>
  );
};

/* ==========================================
   SHARE
   ==========================================
   Plain links to each network's own share endpoint, plus a copy-link button. No
   third-party script, no widget, no iframe: those would add weight and read the
   page on every visit for something four URLs already do.

   Each control is a single interactive element — the icon is aria-hidden and the
   label is on the control itself, so there is nothing focusable inside a button
   or a link.
   ========================================== */

const SHARE_TARGETS = [
  {
    key: "x",
    label: "Share on X",
    Icon: FiTwitter,
    href: ({ url, title }) =>
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`,
  },
  {
    key: "linkedin",
    label: "Share on LinkedIn",
    Icon: FiLinkedin,
    href: ({ url }) =>
      `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
  },
  {
    key: "whatsapp",
    label: "Share on WhatsApp",
    Icon: FaWhatsapp,
    href: ({ url, title }) =>
      `https://wa.me/?text=${encodeURIComponent(`${title} — ${url}`)}`,
  },
  {
    key: "facebook",
    label: "Share on Facebook",
    Icon: FiFacebook,
    href: ({ url }) =>
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
  },
];

const ShareSection = ({ url, title }) => {
  const [copied, setCopied] = useState(false);

  const copy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
    } catch {
      // Clipboard access can be refused (insecure context, permissions). The
      // address is in the URL bar either way, so this is not worth an alert.
      setCopied(false);
    }
  }, [url]);

  // Reset the confirmation so the button does not claim success forever.
  useEffect(() => {
    if (!copied) return undefined;
    const timer = setTimeout(() => setCopied(false), 2000);
    return () => clearTimeout(timer);
  }, [copied]);

  const shareButton =
    "inline-flex h-10 w-10 items-center justify-center border border-[#e8e6f1] text-[#534277] transition-colors duration-200 hover:border-[#a380ed] hover:text-[#231746] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#5a3dbd] motion-reduce:transition-none";

  return (
    <section aria-labelledby="share-heading" className="mt-16 border-t border-[#e8e6f1] pt-8">
      <h2 id="share-heading" className="font-[gilroy] text-xs uppercase tracking-[0.28em] text-[#8c86a1]">
        Share this article
      </h2>

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <button type="button" onClick={copy} className={shareButton} aria-label="Copy article link">
          {copied ? (
            <FiCheck aria-hidden="true" className="h-4 w-4 text-[#5a3dbd]" />
          ) : (
            <FiCopy aria-hidden="true" className="h-4 w-4" />
          )}
        </button>

        {SHARE_TARGETS.map(({ key, label, Icon, href }) => (
          <a
            key={key}
            href={href({ url, title })}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={label}
            className={shareButton}
          >
            <Icon aria-hidden="true" className="h-4 w-4" />
          </a>
        ))}
      </div>

      {/* Announced to screen readers, invisible on screen. */}
      <p aria-live="polite" className="sr-only">
        {copied ? "Article link copied to clipboard" : ""}
      </p>
    </section>
  );
};

/* ==========================================
   MORE INSIGHTS
   ==========================================
   Reuses the public blog list. No relevance data exists in the schema — no tags,
   no categories — so the order is publication date and nothing more is claimed.
   The current article and any non-published post are excluded.
   ========================================== */

const MoreInsights = ({ posts }) => {
  if (!posts.length) return null;

  return (
    <section aria-labelledby="more-heading" className="mt-20 border-t border-[#e8e6f1] pt-12 lg:mt-28">
      <h2 id="more-heading" className="font-[gilroy] text-xs uppercase tracking-[0.28em] text-[#8c86a1]">
        More insights
      </h2>

      <ul className="mt-10 grid gap-x-10 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
        {posts.map((post) => {
          const thumbnail = optimizeImage(post.image, 600);

          return (
            <li key={post.slug}>
              <article className="group relative flex h-full flex-col">
                {thumbnail && (
                  <div className="aspect-[16/9] overflow-hidden bg-[#f0eef8]">
                    <img
                      src={thumbnail}
                      alt={imageAlt(post)}
                      width={600}
                      height={338}
                      loading="lazy"
                      decoding="async"
                      className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
                    />
                  </div>
                )}

                <h3 className="mt-5 font-[larken] text-lg leading-snug text-[#231746]">
                  <Link
                    to={`/blog/${post.slug}`}
                    className="after:absolute after:inset-0 transition-colors duration-300 hover:text-[#5a3dbd] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#5a3dbd] motion-reduce:transition-none"
                  >
                    {post.title}
                  </Link>
                </h3>

                {formatDate(publishDate(post)) && (
                  <p className="mt-3 text-xs text-[#6b6483]">
                    <time dateTime={publishDate(post)}>{formatDate(publishDate(post))}</time>
                  </p>
                )}
              </article>
            </li>
          );
        })}
      </ul>
    </section>
  );
};

/* ==========================================
   LOADING
   ==========================================
   Mirrors the real header and body shape so nothing jumps when the data lands.
   ========================================== */

const Bar = ({ className = "" }) => (
  <div
    className={`animate-pulse rounded-sm bg-[#e8e6f1] motion-reduce:animate-none ${className}`}
  />
);

const ArticleSkeleton = () => (
  <div
    className="mx-auto w-full max-w-[1400px] px-5 py-14 sm:px-8 lg:px-12 lg:py-20"
    aria-busy="true"
  >
    <span className="sr-only">Loading article</span>
    <Bar className="h-3 w-28" />
    <div className="mt-8 max-w-4xl">
      <Bar className="h-10 w-full" />
      <Bar className="mt-3 h-10 w-4/5" />
    </div>
    <Bar className="mt-8 h-5 w-full max-w-2xl" />
    <Bar className="mt-3 h-5 w-3/5 max-w-2xl" />
    <Bar className="mt-8 h-4 w-52" />
    <Bar className="mt-12 aspect-[16/9] w-full" />

    <div className="mx-auto mt-14 max-w-[46rem]">
      <Bar className="h-4 w-full" />
      <Bar className="mt-4 h-4 w-full" />
      <Bar className="mt-4 h-4 w-11/12" />
      <Bar className="mt-4 h-4 w-full" />
      <Bar className="mt-4 h-4 w-2/3" />
    </div>
  </div>
);

/* ==========================================
   ERROR
   ==========================================
   Reached when the API is reachable but the request failed for a reason other
   than "no such article". Says nothing about why: no status code, no API host, no
   upstream message. The real reason is written to the console for us, not for the
   visitor.
   ========================================== */

const ArticleError = () => (
  <>
    <Helmet>
      <title>{`Article unavailable | ${SITE_NAME}`}</title>
      <meta
        name="description"
        content="This article could not be loaded right now. Browse all articles from the We Insightians blog instead."
      />
      <meta name="robots" content="noindex, follow" />
      <meta property="og:title" content={`Article unavailable | ${SITE_NAME}`} />
      <meta property="og:type" content="website" />
      <meta property="og:image" content={BRAND_IMAGE} />
    </Helmet>

    {/* Same reasoning as /blogs: this wrapper sits below the sticky Navbar, so
        min-h-screen would overshoot the viewport by the navbar's height and leave
        the footer hanging past the fold. 5rem = Navbar h-20. */}
    <div className="flex min-h-[calc(100svh-5rem)] w-full flex-col bg-white font-[gilroy] text-[#231746]">
      <div className="flex-1">
        <div className="mx-auto w-full max-w-[1400px] px-5 py-24 text-center sm:px-8 lg:px-12 lg:py-32">
          <p className="font-[larken] text-3xl text-[#231746] sm:text-4xl">Article unavailable</p>
          <p className="mx-auto mt-5 max-w-md text-base leading-relaxed text-[#6b6483]">
            We could not load this article just now. Please try again in a moment, or browse
            everything we have written so far.
          </p>
          <Link
            to="/blogs"
            className="mt-9 inline-flex items-center gap-2 border border-[#231746] px-7 py-3 font-[gilroy] text-xs font-medium uppercase tracking-[0.18em] text-[#231746] transition-colors duration-300 hover:bg-[#231746] hover:text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#5a3dbd] motion-reduce:transition-none"
          >
            <FiArrowLeft aria-hidden="true" className="h-4 w-4" />
            Back to insights
          </Link>
        </div>
      </div>

      {/* The old error state ended with a footer, so a failed load still looked
          like a complete page rather than a truncated one. */}
      <Footer />
    </div>
  </>
);

/* ==========================================
   PAGE
   ========================================== */

const SingleBlog = () => {
  const { slug } = useParams();
  const [blog, setBlog] = useState(null);
  const [related, setRelated] = useState([]);
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    let active = true;

    setStatus("loading");
    setBlog(null);
    setRelated([]);

    // Two independent requests, started together rather than one after the other.
    // Related posts are an enhancement: their failure must never discard an
    // article that loaded correctly.
    Promise.allSettled([getSingleBlog(slug), getBlogs()]).then(([article, list]) => {
      if (!active) return;

      if (article.status === "fulfilled") {
        setBlog(article.value.data?.blog || null);
        setStatus(article.value.data?.blog ? "ready" : "missing");
      } else {
        // A 404 is a genuinely absent article and gets the real 404 page. Anything
        // else is a failure worth retrying.
        setStatus(article.reason?.response?.status === 404 ? "missing" : "error");
      }

      if (list.status === "fulfilled") {
        setRelated(relatedArticles(list.value.data, slug));
      }
    });

    return () => {
      active = false;
    };
  }, [slug]);

  /* ---------- not found ---------- */
  // Preserved exactly as before: a real 404 page, never an empty article shell and
  // never a redirect to the listing, so a dead URL cannot look like a live post.
  if (status === "missing") return <NotFound />;

  if (status === "loading") return <ArticleSkeleton />;

  if (status === "error" || !blog) return <ArticleError />;

  /* ---------- article ---------- */

  const canonical = articleCanonical(blog);
  const description = articleDescription(blog);
  const title = articleTitle(blog);
  const socialImage = articleImage(blog) || BRAND_IMAGE;
  const datePublished = publishedIso(blog);
  const dateModified = modifiedIso(blog);
  const structuredData = articleStructuredData(blog);
  const summary = articleDescription(blog, 320);

  return (
    <>
      <Helmet>
        <title>{title}</title>
        <meta name="description" content={description} />
        {/* A published article is meant to be indexed. Drafts never reach this
            component: the API returns 404 for them. */}
        <meta name="robots" content="index, follow" />
        {blog.author ? <meta name="author" content={blog.author} /> : null}
        {/* Built from the article's own slug, so it is never /blogs, never the
            title, and never a slugless /blog. */}
        {canonical && <link rel="canonical" href={canonical} />}

        <meta property="og:type" content="article" />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:url" content={canonical} />
        <meta property="og:site_name" content={SITE_NAME} />
        <meta property="og:image" content={socialImage} />
        <meta property="og:image:alt" content={imageAlt(blog)} />
        {datePublished ? <meta property="article:published_time" content={datePublished} /> : null}
        {dateModified ? <meta property="article:modified_time" content={dateModified} /> : null}
        {blog.author ? <meta property="article:author" content={blog.author} /> : null}

        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={title} />
        <meta name="twitter:description" content={description} />
        <meta name="twitter:image" content={socialImage} />
        <meta name="twitter:image:alt" content={imageAlt(blog)} />

        {/* One BlogPosting node for this page. The site-level Organization and
            WebSite nodes come from StructuredData.jsx and are referenced by @id
            here rather than redeclared, so nothing conflicts. */}
        {structuredData && (
          <script type="application/ld+json">{toSafeJson(structuredData)}</script>
        )}
      </Helmet>

      {/* PublicLayout already renders the page's single <main>, so this is a div. */}
      {/* min-h-[calc(100svh-5rem)] rather than min-h-screen: this wrapper already
          starts below the sticky Navbar (h-20), so a full-viewport minimum left
          the footer ~80px past the fold and let flex-1 open a blank gap above it
          on a short article. 5rem = Navbar h-20. */}
      <div className="flex min-h-[calc(100svh-5rem)] w-full flex-col bg-white font-[gilroy] text-[#231746]">
        <div className="flex-1">
          <article>
            {/* ---------- HEADER ---------- */}
            <header className="border-b border-[#e8e6f1]">
              <div className="mx-auto w-full max-w-[1400px] px-5 pb-12 pt-10 sm:px-8 lg:px-12 lg:pb-16 lg:pt-14">
                <nav aria-label="Breadcrumb">
                  <Link
                    to="/blogs"
                    className="inline-flex items-center gap-2 font-[gilroy] text-xs uppercase tracking-[0.28em] text-[#5a3dbd] transition-colors duration-300 hover:text-[#231746] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#5a3dbd] motion-reduce:transition-none"
                  >
                    <FiArrowLeft aria-hidden="true" className="h-3.5 w-3.5" />
                    Blog / Insights
                  </Link>
                </nav>

                <h1 className="mt-8 max-w-5xl font-[larken] text-[2.125rem] leading-[1.08] text-[#231746] sm:text-5xl lg:text-6xl xl:text-[4.25rem]">
                  {blog.title}
                </h1>

                {summary && (
                  <p className="mt-7 max-w-2xl text-base leading-relaxed text-[#6b6483] sm:text-lg">
                    {summary}
                  </p>
                )}

                <Byline blog={blog} />

                <FeaturedImage blog={blog} />
              </div>
            </header>

            {/* ---------- BODY ---------- */}
            {/* max-w-[46rem] is ~736px: a comfortable measure for reading. Letting
                the text run the full desktop width would put well over 100
                characters on a line, which is where readability falls apart. */}
            <div className="mx-auto w-full max-w-[1400px] px-5 sm:px-8 lg:px-12">
              <div
                className="article-content mx-auto max-w-[46rem] py-14 lg:py-20"
                // Stored HTML, sanitized server-side on write by
                // sanitizeBlogContent(). See the note at the top of this file.
                dangerouslySetInnerHTML={{ __html: blog.content }}
              />

              <div className="mx-auto max-w-[46rem]">
                <ShareSection url={canonical} title={blog.title} />
              </div>

              <MoreInsights posts={related} />
            </div>
          </article>
        </div>

        <Footer />
      </div>
    </>
  );
};

export default SingleBlog;