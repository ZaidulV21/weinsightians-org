// src/components/blog/BlogGrid.jsx
import BlogCard from "../components/BlogCard";

const BlogGrid = ({ blogs }) => {
  return (
    <section className="py-20">
      <div className="max-w-7xl mx-auto px-4 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {blogs.map((blog) => (
          <BlogCard key={blog._id} blog={blog} />
        ))}
      </div>
    </section>
  );
};

export default BlogGrid;
