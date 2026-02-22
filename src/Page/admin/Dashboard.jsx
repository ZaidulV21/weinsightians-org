import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axiosInstance from "../../api/axiosInstance";
import {
  FiEdit,
  FiTrash2,
  FiPlus,
  FiHome,
  FiLogOut,
  FiMenu,
  FiX,
} from "react-icons/fi";

const Dashboard = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null); // track which blog is being deleted
  const [sidebarOpen, setSidebarOpen] = useState(false); // mobile sidebar toggle
  const navigate = useNavigate();

  // ==========================================
  // Fetch all blogs on mount
  // ==========================================
  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const { data } = await axiosInstance.get("/blogs");
        setBlogs(data.blogs);
      } catch (error) {
        console.error("Failed to fetch blogs:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBlogs();
  }, []);

  // ==========================================
  // Handle blog deletion
  // Uses blog._id for the DELETE /:id route
  // ==========================================
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this blog?")) return;

    setDeletingId(id);
    try {
      await axiosInstance.delete(`/blogs/${id}`);
      // Remove deleted blog from local state without refetching
      setBlogs((prev) => prev.filter((blog) => blog._id !== id));
    } catch (error) {
      console.error("Failed to delete blog:", error);
      alert("Failed to delete blog. Please try again.");
    } finally {
      setDeletingId(null);
    }
  };

  // ==========================================
  // Handle logout
  // ==========================================
  const handleLogout = async () => {
    try {
      await axiosInstance.post("/auth/logout");
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      navigate("/blogs");
    }
  };

  // ==========================================
  // SIDEBAR — shared between mobile and desktop
  // ==========================================
  const Sidebar = () => (
    <div className="flex flex-col h-full p-6">
      <h2 className="text-2xl font-bold mb-10 text-gray-800">Admin Panel</h2>

      <nav className="flex flex-col gap-3 text-gray-600 flex-1">
        <Link
          to="/admin/dashboard"
          onClick={() => setSidebarOpen(false)}
          className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-indigo-50 hover:text-indigo-600 transition"
        >
          <FiHome /> Dashboard
        </Link>

        <Link
          to="/admin/create"
          onClick={() => setSidebarOpen(false)}
          className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-indigo-50 hover:text-indigo-600 transition"
        >
          <FiPlus /> Create Blog
        </Link>
      </nav>

      {/* Logout at bottom */}
      <button
        onClick={handleLogout}
        className="flex items-center gap-3 px-3 py-2 rounded-lg text-red-500 hover:bg-red-50 hover:text-red-600 transition mt-auto"
      >
        <FiLogOut /> Logout
      </button>
    </div>
  );

  // ==========================================
  // MAIN RENDER
  // ==========================================
  return (
    <div className="min-h-screen bg-gray-100 flex">

      {/* ── DESKTOP SIDEBAR ── */}
      <div className="hidden md:flex w-64 bg-white shadow-lg flex-col flex-shrink-0">
        <Sidebar />
      </div>

      {/* ── MOBILE SIDEBAR OVERLAY ── */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black bg-opacity-40"
            onClick={() => setSidebarOpen(false)}
          />
          {/* Drawer */}
          <div className="relative w-64 bg-white shadow-xl z-10 flex flex-col">
            <button
              onClick={() => setSidebarOpen(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-800"
            >
              <FiX size={22} />
            </button>
            <Sidebar />
          </div>
        </div>
      )}

      {/* ── MAIN CONTENT ── */}
      <div className="flex-1 p-4 md:p-10 overflow-auto">

        {/* Mobile top bar */}
        <div className="flex md:hidden items-center justify-between mb-6">
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-gray-700 hover:text-indigo-600"
          >
            <FiMenu size={24} />
          </button>
          <h1 className="text-xl font-bold">Dashboard</h1>
          <Link
            to="/admin/create"
            className="flex items-center gap-1 bg-indigo-600 text-white px-3 py-2 rounded-lg text-sm"
          >
            <FiPlus size={14} /> New
          </Link>
        </div>

        {/* Desktop header */}
        <div className="hidden md:flex justify-between items-center mb-10">
          <h1 className="text-3xl font-bold">Dashboard Overview</h1>
          <Link
            to="/admin/create"
            className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition"
          >
            <FiPlus /> Create New Blog
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white p-5 rounded-xl shadow">
            <p className="text-gray-500 text-sm">Total Blogs</p>
            <h2 className="text-3xl font-bold mt-1">{blogs.length}</h2>
          </div>

          <div className="bg-white p-5 rounded-xl shadow">
            <p className="text-gray-500 text-sm">Published</p>
            <h2 className="text-3xl font-bold mt-1 text-green-600">{blogs.length}</h2>
          </div>

          <div className="bg-white p-5 rounded-xl shadow col-span-2 md:col-span-1">
            <p className="text-gray-500 text-sm">Drafts</p>
            <h2 className="text-3xl font-bold mt-1 text-gray-400">0</h2>
          </div>
        </div>

        {/* Blog Table — Desktop */}
        <div className="bg-white rounded-xl shadow overflow-hidden hidden md:block">
          <div className="p-6 border-b">
            <h2 className="text-xl font-semibold">All Blogs</h2>
          </div>

          {loading ? (
            <div className="flex justify-center py-16">
              <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : blogs.length === 0 ? (
            <p className="text-center py-16 text-gray-500">
              No blogs created yet.{" "}
              <Link to="/admin/create" className="text-indigo-600 hover:underline">
                Create your first blog →
              </Link>
            </p>
          ) : (
            <table className="w-full text-left">
              <thead className="bg-gray-50 text-gray-500 text-sm uppercase">
                <tr>
                  <th className="p-4">Title</th>
                  <th className="p-4">Author</th>
                  <th className="p-4">Date</th>
                  <th className="p-4 text-center">Status</th>
                  <th className="p-4 text-center">Actions</th>
                </tr>
              </thead>

              <tbody>
                {blogs.map((blog) => (
                  <tr key={blog._id} className="border-b hover:bg-gray-50 transition">
                    <td className="p-4 font-medium max-w-xs truncate">{blog.title}</td>
                    <td className="p-4 text-gray-600">{blog.author}</td>
                    <td className="p-4 text-gray-500">
                      {new Date(blog.createdAt).toLocaleDateString()}
                    </td>
                    <td className="p-4 text-center">
                      <span className="bg-green-100 text-green-600 px-3 py-1 rounded-full text-xs font-medium">
                        Published
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex justify-center gap-2">
                        {/* ✅ Uses blog.slug — matches EditBlog useParams slug */}
                        <Link
                          to={`/admin/edit/${blog.slug}`}
                          className="flex items-center gap-1 bg-indigo-600 text-white px-3 py-1 rounded-md hover:bg-indigo-700 transition text-sm"
                        >
                          <FiEdit size={14} /> Edit
                        </Link>

                        <button
                          onClick={() => handleDelete(blog._id)}
                          disabled={deletingId === blog._id}
                          className="flex items-center gap-1 bg-red-500 text-white px-3 py-1 rounded-md hover:bg-red-600 transition text-sm disabled:bg-red-300"
                        >
                          <FiTrash2 size={14} />
                          {deletingId === blog._id ? "Deleting..." : "Delete"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Blog Cards — Mobile */}
        <div className="md:hidden space-y-4">
          <h2 className="text-lg font-semibold">All Blogs</h2>

          {loading ? (
            <div className="flex justify-center py-10">
              <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : blogs.length === 0 ? (
            <div className="bg-white rounded-xl p-6 text-center text-gray-500">
              No blogs yet.{" "}
              <Link to="/admin/create" className="text-indigo-600 hover:underline">
                Create one →
              </Link>
            </div>
          ) : (
            blogs.map((blog) => (
              <div key={blog._id} className="bg-white rounded-xl shadow p-4">
                {/* Blog image thumbnail */}
                {blog.image && (
                  <img
                    src={blog.image}
                    alt={blog.title}
                    className="w-full h-36 object-cover rounded-lg mb-3"
                  />
                )}

                <h3 className="font-semibold text-gray-800 mb-1 line-clamp-2">
                  {blog.title}
                </h3>

                <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
                  <span>By {blog.author}</span>
                  <span>•</span>
                  <span>{new Date(blog.createdAt).toLocaleDateString()}</span>
                  <span className="ml-auto bg-green-100 text-green-600 px-2 py-0.5 rounded-full text-xs">
                    Published
                  </span>
                </div>

                <div className="flex gap-2">
                  {/* ✅ Uses blog.slug — matches EditBlog useParams slug */}
                  <Link
                    to={`/admin/edit/${blog.slug}`}
                    className="flex-1 flex items-center justify-center gap-1 bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition text-sm"
                  >
                    <FiEdit size={14} /> Edit
                  </Link>

                  <button
                    onClick={() => handleDelete(blog._id)}
                    disabled={deletingId === blog._id}
                    className="flex-1 flex items-center justify-center gap-1 bg-red-500 text-white py-2 rounded-lg hover:bg-red-600 transition text-sm disabled:bg-red-300"
                  >
                    <FiTrash2 size={14} />
                    {deletingId === blog._id ? "Deleting..." : "Delete"}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

      </div>
    </div>
  );
};

export default Dashboard;