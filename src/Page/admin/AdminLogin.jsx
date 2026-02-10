// src/pages/admin/AdminLogin.jsx
import { useState } from "react";
import { adminLogin } from "../../api/authApi";
import { useNavigate } from "react-router-dom";

const AdminLogin = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      await adminLogin(formData);
      navigate("/admin/dashboard");
    } catch (err) {
      setError("Invalid email or password");
    }
  };

  return (
    <section className="min-h-screen flex items-center justify-center bg-[#f7f6fb]">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md"
      >
        <h1 className="text-2xl font-bold text-center text-[#231746]">
          Admin Login
        </h1>

        {error && (
          <p className="text-red-500 text-sm mt-4 text-center">
            {error}
          </p>
        )}

        <div className="mt-6">
          <label className="block text-sm font-medium">Email</label>
          <input
            type="email"
            name="email"
            required
            onChange={handleChange}
            className="w-full mt-1 px-4 py-2 border rounded-lg focus:outline-none"
          />
        </div>

        <div className="mt-4">
          <label className="block text-sm font-medium">Password</label>
          <input
            type="password"
            name="password"
            required
            onChange={handleChange}
            className="w-full mt-1 px-4 py-2 border rounded-lg focus:outline-none"
          />
        </div>

        <button
          type="submit"
          className="w-full mt-6 py-3 bg-[#231746] text-white rounded-lg hover:bg-[#3a2a6a]"
        >
          Login
        </button>
      </form>
    </section>
  );
};

export default AdminLogin;
