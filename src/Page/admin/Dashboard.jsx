// src/pages/admin/Dashboard.jsx
import { adminLogout } from "../../api/authApi";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await adminLogout();
    navigate("/admin/login");
  };

  return (
    <section className="pt-32 px-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-10">
        <h1 className="text-3xl font-bold text-[#231746]">
          Admin Dashboard
        </h1>

        <button
          onClick={handleLogout}
          className="px-5 py-2 bg-red-500 text-white rounded-lg"
        >
          Logout
        </button>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="bg-white p-6 rounded-xl shadow">
          <h3 className="text-lg font-semibold">Total Blogs</h3>
          <p className="text-3xl mt-2">—</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow">
          <h3 className="text-lg font-semibold">Create Blog</h3>
          <p className="mt-2 text-gray-500">
            Add new blog posts
          </p>
        </div>
      </div>
    </section>
  );
};

export default Dashboard;
