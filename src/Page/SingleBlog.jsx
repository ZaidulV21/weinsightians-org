import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import axiosInstance from "../api/axiosInstance";
import Footer from "../components/Footer";
import NotFound from "./NotFound";
import { FiArrowLeft } from "react-icons/fi";

// ==========================================
// HELPER: Optimize Cloudinary image URL
// Adds auto format, auto quality, and width
// to reduce image size by 60-80%
// ==========================================
const optimizeImage = (url, width = 1200) => {
  if (!url) return null;
  return url.replace("/upload/", `/upload/w_${width},f_auto,q_auto/`);
};

/* Blog bodies are authored in React-Quill, so a description can be missing or
 * be an empty HTML fragment. Search engines skip a meta description that is
 * blank or too long, so normalise it once and reuse it everywhere. */
const toPlainText = (html) => (html || "").replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();

const truncate = (text, max = 158) => {
  if (!text) return "";
  if (text.length <= max) return text;
  return `${text.slice(0, text.lastIndexOf(" ", max)).trim()}…`;
};

const SingleBlog = () => {
  const { slug } = useParams();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [relatedBlogs, setRelatedBlogs] = useState([]);

  useEffect(() => {
    let cancelled = false;

    const fetchBlog = async () => {
      try {
        const { data } = await axiosInstance.get(`/blogs/${slug}`);
        if (cancelled) return;
        setBlog(data.blog);
        setNotFound(false);
      } catch (error) {
        if (cancelled) return;
        // A 404 from the API means this slug does not exist. Render the real
        // Not Found page instead of an empty article shell, so a dead URL
        // can never look like a live, indexable post.
        if (error?.response?.status === 404) {
          setNotFound(true);
        } else {
          console.error("Failed to load blog:", error);
        }
        setBlog(null);
      } finally {
        if (!cancelled) setLoading(false);
      }

      // Related posts are an enhancement, not the article itself. A failure
      // here must never discard an article that loaded fine, so it is fetched
      // separately and simply left empty on error.
      try {
        const { data: all } = await axiosInstance.get("/blogs");
        if (cancelled) return;
        setRelatedBlogs((all.blogs || []).filter((b) => b.slug !== slug).slice(0, 3));
      } catch (error) {
        console.error("Failed to load related blogs:", error);
      }
    };

    fetchBlog();

    return () => {
      cancelled = true;
    };
  }, [slug]);

  // Calculate read time — strip HTML tags first for accurate word count
  const calculateReadTime = (text) => {
    if (!text) return 1;
    const plainText = text.replace(/<[^>]*>/g, "");
    const words = plainText.split(" ").length;
    return Math.ceil(words / 200);
  };

  // ==========================================
  // NOT FOUND STATE
  // A real 404 page, no redirect back to the blog list or the homepage.
  // ==========================================
  if (notFound) return <NotFound />;

  // ==========================================
  // LOADING STATE
  // ==========================================
  if (loading)
    return (
      <>
        <Helmet>
          <meta name="robots" content="noindex, follow" />
        </Helmet>
        <div className="max-w-4xl mx-auto px-6 py-12 animate-pulse space-y-6">
          <div className="h-6 bg-gray-200 rounded w-1/4" />
          <div className="w-full h-72 bg-gray-200 rounded-2xl" />
          <div className="h-8 bg-gray-200 rounded w-3/4" />
          <div className="h-4 bg-gray-200 rounded w-1/3" />
          <div className="space-y-3 mt-6">
            <div className="h-4 bg-gray-200 rounded w-full" />
            <div className="h-4 bg-gray-200 rounded w-full" />
            <div className="h-4 bg-gray-200 rounded w-5/6" />
          </div>
        </div>
      </>
    );

  // ==========================================
  // ERROR STATE
  // The API is reachable but the post is missing (or the request failed for a
  // reason other than 404). Noindex, and never a bare "Blog not found." line.
  // ==========================================
  if (!blog)
    return (
      <>
        <Helmet>
          <title>Article unavailable | We Insightians</title>
          <meta name="description" content="This article could not be loaded right now. Browse all articles on the We Insightians blog instead." />
          <meta name="robots" content="noindex, follow" />
          <meta property="og:title" content="Article unavailable | We Insightians" />
          <meta property="og:type" content="website" />
        </Helmet>
        <div className="h-full bg-[#ffffff] w-full text-black px-4 md:px-16 p-5">
          <div className="max-w-4xl mx-auto py-20 text-center font-[gilroy]">
            <h1 className="text-4xl md:text-5xl font-[Larken] font-bold">Article unavailable</h1>
            <p className="mt-4 text-gray-600">
              We could not load this article. It may have been moved or renamed.
            </p>
            <Link
              to="/blogs"
              className="mt-8 inline-block font-semibold text-indigo-600 hover:underline"
            >
              Back to all articles
            </Link>
          </div>
        </div>
        <Footer />
      </>
    );

  // The canonical must be the URL actually being served, so it is built from
  // the route param rather than the slug stored on the document.
  const canonical = `https://weinsightian.tech/blog/${slug}`;
  const description = truncate(toPlainText(blog.description)) ||
    truncate(toPlainText(blog.content)) ||
    `${blog.title} — an article from the We Insightians team.`;

  return (
    <>
      {/* SEO META TAGS */}
      <Helmet>
        <title>{blog.title} | We Insightians</title>
        <meta name="description" content={description} />
        <meta name="robots" content="index, follow" />
        {blog.author ? <meta name="author" content={blog.author} /> : null}
        <link rel="canonical" href={canonical} />
        <meta property="og:type" content="article" />
        <meta property="og:title" content={blog.title} />
        <meta property="og:description" content={description} />
        {blog.image ? <meta property="og:image" content={optimizeImage(blog.image, 1200)} /> : null}
        <meta property="og:url" content={canonical} />
        <meta property="og:site_name" content="We Insightians" />
        {blog.createdAt ? <meta property="article:published_time" content={blog.createdAt} /> : null}
        {blog.author ? <meta property="article:author" content={blog.author} /> : null}
        <meta name="twitter:card" content={blog.image ? 'summary_large_image' : 'summary'} />
        <meta name="twitter:title" content={blog.title} />
        <meta name="twitter:description" content={description} />
        {blog.image ? <meta name="twitter:image" content={optimizeImage(blog.image, 1200)} /> : null}
      </Helmet>

      <div className="h-full bg-[#ffffff] w-full text-black px-4 md:px-16 p-5">
        <div className="max-w-6xl mx-auto py-12">

          {/* Back Button */}
          <Link
            to="/blogs"
            className="text-gray-600 font-semibold hover:underline mb-6 inline-block"
          >
            <FiArrowLeft className="inline-block text-gray-600 mr-1" />
            Back to Blogs
          </Link>

          {/* Featured Image — optimized at 1200px, loads eagerly as it's above the fold */}
          {blog.image && (
            <div className="mb-8">
              <img
                src={optimizeImage(blog.image, 1200)}
                alt={blog.title}
                className="w-full h-full object-cover rounded-2xl shadow-lg"
                loading="eager"
              />
            </div>
          )}

          {/* Title */}
          <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">
            {blog.title}
          </h1>

          {/* Meta Info */}
          <div className="flex flex-wrap items-center gap-4 text-gray-500 mb-8">
            <span>By {blog.author}</span>
            <span>•</span>
            <span>{new Date(blog.createdAt).toLocaleDateString()}</span>
            <span>•</span>
            <span>{calculateReadTime(blog.content)} min read</span>
          </div>

          {/* Blog Content — renders Quill HTML properly */}
          <div
            className="prose max-w-none text-lg leading-8"
            dangerouslySetInnerHTML={{ __html: blog.content }}
          />

          {/* Tags */}
          {blog.tags && blog.tags.length > 0 && (
            <div className="mt-10 flex flex-wrap gap-3">
              {blog.tags.map((tag, index) => (
                <span
                  key={index}
                  className="bg-indigo-100 text-indigo-600 px-4 py-1 rounded-full text-sm font-medium"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* Share Section */}
          <div className="mt-12 border-t pt-8">
            <h3 className="text-xl font-semibold mb-4">Share this article</h3>
            <div className="flex gap-4">
              <a
                href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(blog.title)}&url=${encodeURIComponent(`https://weinsightian.tech/blog/${slug}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition"
              >
                Twitter
              </a>
              <a
                href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(`https://weinsightian.tech/blog/${slug}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
              >
                Facebook
              </a>
              <a
                href={`https://wa.me/?text=${encodeURIComponent(`${blog.title} - https://weinsightian.tech/blog/${slug}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition"
              >
                WhatsApp
              </a>
            </div>
          </div>

          {/* Comment Section */}
          <div className="mt-16 border-t pt-10">
            <h3 className="text-2xl font-semibold mb-6">Leave a Comment</h3>
            <form className="space-y-4">
              <input
                type="text"
                placeholder="Your Name"
                className="w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <textarea
                rows="4"
                placeholder="Write your comment..."
                className="w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              ></textarea>
              <button
                type="submit"
                className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition"
              >
                Post Comment
              </button>
            </form>
          </div>

          {/* Related Posts — images optimized at 400px */}
          {relatedBlogs.length > 0 && (
            <div className="mt-20 border-t pt-12">
              <h2 className="text-2xl font-bold mb-8">Related Articles</h2>
              <div className="grid md:grid-cols-3 gap-8">
                {relatedBlogs.map((post) => (
                  <div
                    key={post.slug}
                    className="bg-white rounded-xl shadow-md hover:shadow-lg transition overflow-hidden"
                  >
                    {post.image && (
                      <img
                        src={optimizeImage(post.image, 400)}
                        alt={post.title}
                        className="w-full h-40 object-cover"
                        loading="lazy"
                      />
                    )}
                    <div className="p-4">
                      <h3 className="font-semibold mb-2 line-clamp-2">
                        {post.title}
                      </h3>
                      <p className="text-sm text-gray-500 mb-3">
                        {new Date(post.createdAt).toLocaleDateString()}
                      </p>
                      <Link
                        to={`/blog/${post.slug}`}
                        className="text-indigo-600 text-sm font-semibold hover:underline"
                      >
                        Read More →
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>
      <Footer />
    </>
  );
};

export default SingleBlog;