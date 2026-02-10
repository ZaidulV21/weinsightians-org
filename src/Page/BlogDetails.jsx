// BlogDetails.jsx
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { getSingleBlog, getAllBlogs } from "../api/blogApi";

const BlogDetails = () => {
  const { id } = useParams();
  const [blog, setBlog] = useState(null);
  const [related, setRelated] = useState([]);

  useEffect(() => {
    getSingleBlog(id).then((res) => setBlog(res.data.blog));
    getAllBlogs().then((res) =>
      setRelated(res.data.blogs.filter((b) => b._id !== id).slice(0, 5))
    );
  }, [id]);

  if (!blog) return null;

  return (
    <section className="pt-32 pb-20">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-4xl font-bold text-[#231746]">
          {blog.title}
        </h1>

        <p className="text-gray-500 mt-2">
          By {blog.author} · {new Date(blog.createdAt).toDateString()}
        </p>

        <article
          className="prose prose-lg max-w-none mt-8"
          dangerouslySetInnerHTML={{ __html: blog.content }}
        />
      </div>
    </section>
  );
};

export default BlogDetails;
