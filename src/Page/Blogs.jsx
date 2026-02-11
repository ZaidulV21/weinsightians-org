import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axiosInstance from "../api/axiosInstance";
import Navbar from "../components/Navbar";

const Blogs = () => {
  const [blogs, setBlogs] = useState([]);

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const { data } = await axiosInstance.get("/blogs");
        setBlogs(data.blogs);
      } catch (error) {
        console.log(error);
      }
    };

    fetchBlogs();
  }, []);

  return (
    <>
    <Navbar />    <div className="max-w-6xl mx-auto px-6 py-12">
      <h1 className="text-4xl font-bold mb-10 text-center">
        Latest Articles
      </h1>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
{blogs.map((blog) => (
  <div
    key={blog.slug}
    className="bg-white shadow-md rounded-xl p-6 hover:shadow-xl transition duration-300"
  >
    <h2 className="text-xl font-semibold mb-2">
      {blog.title}
    </h2>

    {blog.image && (
      <img
        src={`http://localhost:6200${blog.image}`}
        alt={blog.title}
        className="w-full h-48 object-cover rounded-lg mb-4"
      />
    )}

    <p className="text-gray-600 mb-4 line-clamp-3">
      {blog.description}
    </p>

    <p className="text-sm text-gray-400 mb-4">
      By {blog.author}
    </p>

    <Link
      to={`/blog/${blog.slug}`}
      className="text-indigo-600 font-semibold hover:underline"
    >
      Read More →
    </Link>
  </div>
))}


      </div>
    </div>
    </>
  );
};

export default Blogs;
