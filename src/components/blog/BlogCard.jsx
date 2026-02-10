// BlogCard.jsx
import { Link } from "react-router-dom";

const BlogCard = ({ blog }) => {
  return (
    <article className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all">
      <div className="p-6">
        <h3 className="text-xl font-semibold text-[#231746] line-clamp-2">
          {blog.title}
        </h3>

        <p className="mt-3 text-gray-600 line-clamp-3">
          {blog.description}
        </p>

        <div className="mt-4 flex items-center justify-between text-sm">
          <span className="text-gray-500">
            By {blog.author} ·{" "}
            {new Date(blog.createdAt).toDateString()}
          </span>

          <Link
            to={`/blog/${blog._id}`}
            className="text-[#534277] font-semibold hover:underline"
          >
            Read More →
          </Link>
        </div>
      </div>
    </article>
  );
};

export default BlogCard;
