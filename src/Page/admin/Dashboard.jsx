import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axiosInstance from "../../api/axiosInstance";
import {
  FiEdit,
  FiTrash2,
  FiPlus,
  FiFileText,
  FiHome,
  FiLogOut,
} from "react-icons/fi";

const Dashboard = () => {
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

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this blog?")) return;

    try {
      await axiosInstance.delete(`/blogs/${id}`);
      setBlogs(blogs.filter((blog) => blog._id !== id));
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-10">Admin Panel</h2>

        <nav className="flex flex-col gap-4 text-gray-600">
          <Link className="flex items-center gap-3 hover:text-indigo-600">
            <FiHome /> Dashboard
          </Link>

          <Link
            to="/admin/create"
            className="flex items-center gap-3 hover:text-indigo-600"
          >
            <FiPlus /> Create Blog
          </Link>

          <Link to="/blogs" className="flex items-center gap-3 text-red-500 hover:text-red-600 mt-10">
            <FiLogOut /> Logout
          </Link>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-10">
        {/* Top Header */}
        <div className="flex justify-between items-center mb-10">
          <h1 className="text-3xl font-bold">Dashboard Overview</h1>
        </div>

        {/* Stats Section */}
        <div className="grid md:grid-cols-3 gap-6 mb-10">
          <div className="bg-white p-6 rounded-xl shadow">
            <p className="text-gray-500">Total Blogs</p>
            <h2 className="text-3xl font-bold">{blogs.length}</h2>
          </div>

          <div className="bg-white p-6 rounded-xl shadow">
            <p className="text-gray-500">Published</p>
            <h2 className="text-3xl font-bold">{blogs.length}</h2>
          </div>

          <div className="bg-white p-6 rounded-xl shadow">
            <p className="text-gray-500">Drafts</p>
            <h2 className="text-3xl font-bold">0</h2>
          </div>
        </div>

        {/* Blog Table */}
        <div className="bg-white rounded-xl shadow overflow-hidden">
          <div className="p-6 border-b">
            <h2 className="text-xl font-semibold">All Blogs</h2>
          </div>

          <table className="w-full text-left">
            <thead className="bg-gray-50 text-gray-600 text-sm uppercase">
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
                <tr
                  key={blog._id}
                  className="border-b hover:bg-gray-50 transition"
                >
                  <td className="p-4 font-medium">{blog.title}</td>

                  <td className="p-4 text-gray-600">{blog.author}</td>

                  <td className="p-4 text-gray-500">
                    {new Date(blog.createdAt).toLocaleDateString()}
                  </td>

                  <td className="p-4 text-center">
                    <span className="bg-green-100 text-green-600 px-3 py-1 rounded-full text-xs font-medium">
                      Published
                    </span>
                  </td>

                  <td className="p-4 flex justify-center gap-3">
                    <Link
                      to={`/admin/edit/${blog._id}`}
                      className="flex items-center gap-1 bg-indigo-600 text-white px-3 py-1 rounded-md hover:bg-indigo-700 transition text-sm"
                    >
                      <FiEdit size={14} />
                      Edit
                    </Link>

                    <button
                      onClick={() => handleDelete(blog._id)}
                      className="flex items-center gap-1 bg-red-500 text-white px-3 py-1 rounded-md hover:bg-red-600 transition text-sm"
                    >
                      <FiTrash2 size={14} />
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {blogs.length === 0 && (
            <p className="text-center py-10 text-gray-500">
              No blogs created yet.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
