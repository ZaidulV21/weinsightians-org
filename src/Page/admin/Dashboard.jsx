import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getBlogs, deleteBlog } from "../../api/blogApi";
import axiosInstance from "../../api/axiosInstance";




const Dashboard = () => {
  const navigate = useNavigate();
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchBlogs = async () => {
    try {
      const { data } = await getBlogs();
      setBlogs(data.blogs);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlogs();
  }, []);

  const handleLogout = async () => {
    await axiosInstance.get("/auth/logout");
    navigate("/admin/login");
  };
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this blog?")) return;

    await deleteBlog(id);
    fetchBlogs();
  };

  if (loading) return <p className="p-6">Loading...</p>;

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>

        <button
          onClick={() => navigate("/admin/create-blog")}
          className="bg-[#231746] text-white px-4 py-2 rounded"
        >
          Create Blog
        </button>
      </div>

      <h2 className="text-lg mb-4">
        Total Blogs: <strong>{blogs.length}</strong>
      </h2>

      <div className="space-y-4">
        {blogs.map((blog) => (
          <div
            key={blog._id}
            className="border p-4 rounded flex justify-between items-center"
          >
            <div>
              <h3 className="font-semibold">{blog.title}</h3>
              <p className="text-sm text-gray-500">
                {blog.author}
              </p>
            </div>

            <div className="space-x-3">
              <button
                onClick={() =>
                  navigate(`/admin/edit-blog/${blog._id}`)
                }
                className="bg-blue-500 text-white px-3 py-1 rounded"
              >
                Edit
              </button>

              <button
                onClick={() => handleDelete(blog._id)}
                className="bg-red-500 text-white px-3 py-1 rounded"
              >
                Delete
              </button>
            </div>
<button
  onClick={handleLogout}
  className="bg-red-500 text-white px-4 py-2 rounded"
>
  Logout
</button>

          </div>
          
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
