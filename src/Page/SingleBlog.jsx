import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import axiosInstance from "../api/axiosInstance";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
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

const SingleBlog = () => {
  const { slug } = useParams();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [relatedBlogs, setRelatedBlogs] = useState([]);

  useEffect(() => {
    const fetchBlog = async () => {
      try {
        const { data } = await axiosInstance.get(`/blogs/${slug}`);
        setBlog(data.blog);

        // Fetch related blogs (all except current)
        const allBlogs = await axiosInstance.get("/blogs");
        const filtered = allBlogs.data.blogs
          .filter((b) => b.slug !== slug)
          .slice(0, 3);
        setRelatedBlogs(filtered);
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    };

    fetchBlog();
  }, [slug]);

  // Calculate read time — strip HTML tags first for accurate word count
  const calculateReadTime = (text) => {
    if (!text) return 1;
    const plainText = text.replace(/<[^>]*>/g, "");
    const words = plainText.split(" ").length;
    return Math.ceil(words / 200);
  };

  // ==========================================
  // LOADING STATE
  // ==========================================
  if (loading)
    return (
      <>
        <Helmet><title>Loading... | Weinsightians</title></Helmet>
        <Navbar />
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
  // NOT FOUND STATE
  // ==========================================
  if (!blog)
    return (
      <>
        <Helmet>
          <title>Blog Not Found | Weinsightians</title>
          <meta name="robots" content="noindex" />
        </Helmet>
        <Navbar />
        <div className="text-center py-20 text-xl font-semibold">
          Blog not found.
        </div>
      </>
    );

  return (
    <>
      {/* SEO META TAGS */}
      <Helmet>
        <title>{blog.title} | Weinsightians</title>
        <meta name="description" content={blog.description?.replace(/<[^>]*>/g, "")} />
        <meta name="robots" content="index, follow" />
        <meta name="author" content={blog.author} />
        <link rel="canonical" href={`https://weinsightian.tech/blog/${blog.slug}`} />
        <meta property="og:type" content="article" />
        <meta property="og:title" content={blog.title} />
        <meta property="og:description" content={blog.description?.replace(/<[^>]*>/g, "")} />
        <meta property="og:image" content={optimizeImage(blog.image, 1200)} />
        <meta property="og:url" content={`https://weinsightian.tech/blog/${blog.slug}`} />
        <meta property="og:site_name" content="Weinsightians" />
        <meta property="article:published_time" content={blog.createdAt} />
        <meta property="article:author" content={blog.author} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={blog.title} />
        <meta name="twitter:description" content={blog.description?.replace(/<[^>]*>/g, "")} />
        <meta name="twitter:image" content={optimizeImage(blog.image, 1200)} />
      </Helmet>

      <div className="h-full bg-[#ffffff] w-full text-black px-4 md:px-16 p-5">
        <Navbar />

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
                href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(blog.title)}&url=${encodeURIComponent(`https://weinsightian.tech/blog/${blog.slug}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition"
              >
                Twitter
              </a>
              <a
                href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(`https://weinsightian.tech/blog/${blog.slug}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
              >
                Facebook
              </a>
              <a
                href={`https://wa.me/?text=${encodeURIComponent(`${blog.title} - https://weinsightian.tech/blog/${blog.slug}`)}`}
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