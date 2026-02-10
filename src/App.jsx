import React from "react";
import { Routes, Route } from "react-router-dom";

import Home from "./Page/Home";
import Services from "./Page/Services";
import About from "./Page/About";
import Contact from "./Page/Contact";
import Privacy from "./Page/privacy";
import Sitemap from "./Page/Sitemap";

import ProtectedRoute from "./components/ProtectedRoute";
import AdminLogin from "./Page/admin/AdminLogin";
import Dashboard from "./Page/admin/Dashboard";

export default function App() {
  return (
    <div className="bg-white">
      <Routes>
        {/* Public Pages */}
        <Route path="/" element={<Home />} />
        <Route path="/home" element={<Home />} />
        <Route path="/services" element={<Services />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/sitemap" element={<Sitemap />} />

        {/* Admin Routes */}
        <Route path="/admin/login" element={<AdminLogin />} />

        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
      </Routes>
    </div>
  );
}
