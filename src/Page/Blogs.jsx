import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axiosInstance from "../api/axiosInstance";
import Navbar from "../components/Navbar";
import { FiSearch } from "react-icons/fi";
import { motion } from "framer-motion";
import Footer from "../components/Footer";


const Blogs = () => {
  const [blogs, setBlogs] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const { data } = await axiosInstance.get("/blogs");
        setBlogs(data.blogs); // ✅ FIXED HERE
      } catch (error) {
        console.log("Error fetching blogs:", error);
      }
    };

    fetchBlogs();
  }, []);

  const filteredBlogs = blogs.filter((blog) =>
    blog.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    blog.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    blog.author.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
    <div className="h-full bg-[#ffffff] w-full text-black px-4 md:px-16 p-5">

    <Navbar />  
    <div className="max-w-6xl mx-auto px-6 py-12">
      
      <div className="flex w-full flex-col sm:flex-row justify-between items-center border-b-2 mb-12">
      <h1 className="text-4xl font-[Larken] font-bold mb-10 text-center ">
        Our Latest Insights & Articles
      </h1>


      {/* Search button */}
      
      <div className=" flex w-96 justify-center">
<div className="mb-10 flex justify-center">
  <div className="relative w-full md:w-1/2">
    
    {/* Search Icon */}
    <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg" />
    
    <input
      type="text"
      placeholder="Search articles..."
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
      className="w-full border pl-12 pr-4 py-3 rounded-full shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-transparent"
    />
  </div>
</div>
</div>


<Link to="/admin/login" className="block w-max  mb-10 px-6 py-3 bg-transparent text-gray-700 border border-gray-300 rounded-full hover:bg-indigo-200 hover:text-black transition">
  Create New Blog
</Link>


      </div>


      {/* Search button  */}

<div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
  {filteredBlogs.length === 0 && (
  <p className="text-center text-gray-500 mt-10">
    No articles found.
  </p>
)}

  {filteredBlogs.map((blog) => (
    <div
      key={blog.slug}
      className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition duration-300"
    >
      {blog.image && (
        <img
          // src={`https://weinsightians-backend-repo.onrender.com${blog.image}`}
          src={blog.image}
          alt={blog.title}
          className="w-full h-56 object-cover"
        />
      )}

      <div className="p-6">
        <p className="text-sm text-gray-400 mb-2">
          {new Date(blog.createdAt).toLocaleDateString()}
        </p>

        <h2 className="text-xl font-bold mb-3 hover:text-indigo-600 transition">
          {blog.title}
        </h2>

        <p className="text-gray-600 mb-4 line-clamp-3">
          {blog.description}
        </p>

        <p className="text-sm text-gray-500 mb-4">
          By {blog.author}
        </p>

        <Link
          to={`/blog/${blog.slug}`}
          className="text-indigo-600 font-semibold hover:underline"
        >
          Read Full Article →
        </Link>
      </div>
    </div>
  ))}
</div>

    </div>
    <Footer/>
      </div>
    </>
  );
};

export default Blogs;
