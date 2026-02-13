import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axiosInstance from "../api/axiosInstance";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { FiArrowLeft } from "react-icons/fi";

const SingleBlog = () => {
  const { slug } = useParams();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [relatedBlogs, setRelatedBlogs] = useState([]);
  
  // Related blogs fetching logic 
  useEffect(() => {
  const fetchBlog = async () => {
    try {
      const { data } = await axiosInstance.get(`/blogs/${slug}`);
      setBlog(data.blog);

      // Fetch all blogs for related section
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
 
  // Related blogs fetching logic  

  useEffect(() => {
    const fetchBlog = async () => {
      try {
        const { data } = await axiosInstance.get(`/blogs/${slug}`);
        setBlog(data.blog);
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    };

    fetchBlog();
  }, [slug]);

  // Calculate read time
  const calculateReadTime = (text) => {
    const wordsPerMinute = 200;
    const words = text?.split(" ").length;
    return Math.ceil(words / wordsPerMinute);
  };

  if (loading)
    return (
      <>
        <Navbar />
        <div className="text-center py-20 text-xl font-semibold">
          Loading article...
        </div>
      </>
    );

  if (!blog)
    return (
      <>
        <Navbar />
        <div className="text-center py-20 text-xl font-semibold">
          Blog not found.
        </div>
      </>
    );

  return (
    <>
      <Navbar />

      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Back Button */}
        <Link
          to="/blogs"
          className="text-gray-600 font-semibold hover:underline mb-6 inline-block"
        >
          <FiArrowLeft className="inline-block text-gray-600 mr-1" />
          Back to Blogs
        </Link>

        {/* Featured Image */}
        {blog.image && (
          <div className="mb-8">
<img
  src={`http://localhost:6200${blog.image.startsWith("/") ? blog.image : `/${blog.image}`}`}
  alt={blog.title}
  className="w-full h-full object-cover rounded-2xl shadow-lg"
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
          <span>
            {new Date(blog.createdAt).toLocaleDateString()}
          </span>
          <span>•</span>
          <span>{calculateReadTime(blog.content)} min read</span>
        </div>

        {/* Blog Content */}
        <div className="prose max-w-none text-lg leading-8">
          {blog.content}
        </div>

        {/* Tags Section */}
        {blog.tags && (
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
              href={`https://twitter.com/intent/tweet?text=${blog.title}`}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-black text-white px-4 py-2 rounded-lg"
            >
              Twitter
            </a>
            <a
              href={`https://www.facebook.com/sharer/sharer.php?u=${window.location.href}`}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-blue-600 text-white px-4 py-2 rounded-lg"
            >
              Facebook
            </a>
          </div>
        </div>

        {/* Comment Section UI */}
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

{/* Related Posts Section */}
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
            src={`http://localhost:6200${post.image}`}
            alt={post.title}
            className="w-full h-40 object-cover"
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

      </div>
    </>
  );
};

export default SingleBlog;
