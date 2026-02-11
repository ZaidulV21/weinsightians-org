import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

// Public Pages
import Home from "./Page/Home";
import Services from "./Page/Services";
import About from "./Page/About";
import Contact from "./Page/Contact";
import Privacy from "./Page/privacy";
import Sitemap from "./Page/Sitemap";
import Blogs from "./Page/Blogs";
import SingleBlog from "./Page/SingleBlog";

// Admin Pages
import AdminLogin from "./Page/admin/AdminLogin";
import Dashboard from "./Page/admin/Dashboard";
import CreateBlog from "./Page/admin/CreateBlog";
import EditBlog from "./Page/admin/EditBlog";

// Protected Route
import ProtectedRoute from "./components/ProtectedRoute";

export default function App() {
  return (
    <div className="bg-white min-h-screen">
      <Routes>
        {/* ================= PUBLIC ROUTES ================= */}
        <Route path="/" element={<Home />} />
        <Route path="/home" element={<Home />} />
        <Route path="/services" element={<Services />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/sitemap" element={<Sitemap />} />
        <Route path="/blogs" element={<Blogs />} />
        <Route path="/blog/:slug" element={<SingleBlog />} />

        {/* ================= ADMIN ROUTES ================= */}

        {/* Login */}
        <Route path="/admin/login" element={<AdminLogin />} />

        {/* Dashboard */}
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        {/* Create Blog */}
        <Route
          path="/admin/create-blog"
          element={
            <ProtectedRoute>
              <CreateBlog />
            </ProtectedRoute>
          }
        />

        {/* Edit Blog */}
        <Route
          path="/admin/edit-blog/:slug"
          element={
            <ProtectedRoute>
              <EditBlog />
            </ProtectedRoute>
          }
        />

        {/* ================= FALLBACK ================= */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </div>
  );
}
