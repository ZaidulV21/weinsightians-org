import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";

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

// Auth

// Protected Route
import ProtectedRoute from "./components/ProtectedRoute";

const PublicLayout = ({ children }) => (
  <>
    <Navbar />
    <main>{children}</main>
  </>
);

export default function App() {
  return (
    <div className="bg-white min-h-screen">
      <Routes>
        {/* ================= PUBLIC ROUTES ================= */}
        <Route path="/" element={<PublicLayout><Home /></PublicLayout>} />
        <Route path="/home" element={<PublicLayout><Home /></PublicLayout>} />
        <Route path="/services" element={<PublicLayout><Services /></PublicLayout>} />
        <Route path="/about" element={<PublicLayout><About /></PublicLayout>} />
        <Route path="/contact" element={<PublicLayout><Contact /></PublicLayout>} />
        <Route path="/privacy" element={<PublicLayout><Privacy /></PublicLayout>} />
        <Route path="/sitemap" element={<PublicLayout><Sitemap /></PublicLayout>} />
        <Route path="/blogs" element={<PublicLayout><Blogs /></PublicLayout>} />
        <Route path="/blog/:slug" element={<PublicLayout><SingleBlog /></PublicLayout>} />

        {/* ================= ADMIN ROUTES ================= */}

        {/* Login (public) */}
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
          path="/admin/create"
          element={
            <ProtectedRoute>
              <CreateBlog />
            </ProtectedRoute>
          }
        />

        {/* Edit Blog */}
        <Route
          path="/admin/edit/:slug"
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
