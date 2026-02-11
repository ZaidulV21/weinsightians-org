import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axiosInstance from "../api/axiosInstance";

const SingleBlog = () => {
  const { slug } = useParams();
  const [blog, setBlog] = useState(null);

  useEffect(() => {
    const fetchBlog = async () => {
      try {
        const { data } = await axiosInstance.get(`/blogs/${slug}`);
        setBlog(data.blog);
      } catch (error) {
        console.log(error);
      }
    };

    fetchBlog();
  }, [slug]);

  if (!blog) return <p className="text-center mt-10">Loading...</p>;

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <h1 className="text-4xl font-bold mb-4">
        {blog.title}
      </h1>

      <p className="text-gray-500 mb-6">
        By {blog.author}
      </p>

      <p className="text-gray-700 leading-relaxed whitespace-pre-line">
        {blog.content}
      </p>
    </div>
  );
};

export default SingleBlog;
