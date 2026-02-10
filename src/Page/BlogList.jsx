// BlogList.jsx
import { useEffect, useState } from "react";
import { getAllBlogs } from "../api/blogApi";
import BlogHero from "../components/blog/BlogHero";
import BlogCard from "../components/blog/BlogCard";

const BlogList = () => {
  const [blogs, setBlogs] = useState([]);

  useEffect(() => {
    getAllBlogs()
      .then((res) => setBlogs(res.data.blogs))
      .catch(console.error);
  }, []);

  return (
    <>
      <BlogHero />

      <section className="py-20">
        <div className="max-w-6xl mx-auto px-4 grid gap-8 md:grid-cols-2">
          {blogs.map((blog) => (
            <BlogCard key={blog._id} blog={blog} />
          ))}
        </div>
      </section>
    </>
  );
};

export default BlogList;
