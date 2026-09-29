import React from "react";
import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import ScrollToTop from "./components/ScrollToTop";
import StructuredData from "./components/StructuredData";

// Public Pages
import Home from "./Page/Home";
import Services from "./Page/Services";
import About from "./Page/About";
import Contact from "./Page/Contact";
import Privacy from "./Page/privacy";
import Sitemap from "./Page/Sitemap";
import Blogs from "./Page/Blogs";
import SingleBlog from "./Page/SingleBlog";
import NotFound from "./Page/NotFound";

// Admin Pages
import AdminLogin from "./Page/admin/AdminLogin";
import Dashboard from "./Page/admin/Dashboard";
import CreateBlog from "./Page/admin/CreateBlog";
import EditBlog from "./Page/admin/EditBlog";

// Protected Route
import ProtectedRoute from "./components/ProtectedRoute";
import NoIndex from "./components/NoIndex";

const PublicLayout = ({ children }) => (
  <>
    <Navbar />
    <main>{children}</main>
  </>
);

/* "/home" is a legacy duplicate of "/". It stays reachable for old inbound
 * links, but it is not indexed, and it canonicalises to the real homepage.
 * The robots directive comes from Home's own `noindex` prop rather than a
 * wrapping <Helmet>, so the two tags can never race. */
const LegacyHome = () => <Home noindex />;

export default function App() {
  return (
    <div className="bg-white min-h-screen">
      <ScrollToTop />
      <StructuredData />
      <Routes>
        {/* ================= PUBLIC ROUTES =================
            Indexable and listed in public/sitemap.xml. Canonical URLs live in
            each page's own <Helmet> and use the real current pathname. */}
        <Route path="/" element={<PublicLayout><Home /></PublicLayout>} />
        <Route path="/home" element={<PublicLayout><LegacyHome /></PublicLayout>} />
        <Route path="/services" element={<PublicLayout><Services /></PublicLayout>} />
        <Route path="/about" element={<PublicLayout><About /></PublicLayout>} />
        <Route path="/contact" element={<PublicLayout><Contact /></PublicLayout>} />
        <Route path="/privacy" element={<PublicLayout><Privacy /></PublicLayout>} />
        <Route path="/sitemap" element={<PublicLayout><Sitemap /></PublicLayout>} />
        <Route path="/blogs" element={<PublicLayout><Blogs /></PublicLayout>} />
        <Route path="/blog/:slug" element={<PublicLayout><SingleBlog /></PublicLayout>} />

        {/* ================= ADMIN ROUTES =================
            /admin/ is Disallowed in robots.txt, every screen below is wrapped
            in <NoIndex>, and none of these URLs appear in sitemap.xml. The
            JWT session enforced by the API is the real access control; the
            meta robots tag is crawl hygiene only. */}
        <Route path="/admin/login" element={<NoIndex><AdminLogin /></NoIndex>} />

        <Route
          path="/admin/dashboard"
          element={
            <NoIndex>
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            </NoIndex>
          }
        />

        <Route
          path="/admin/create"
          element={
            <NoIndex>
              <ProtectedRoute>
                <CreateBlog />
              </ProtectedRoute>
            </NoIndex>
          }
        />

        <Route
          path="/admin/edit/:slug"
          element={
            <NoIndex>
              <ProtectedRoute>
                <EditBlog />
              </ProtectedRoute>
            </NoIndex>
          }
        />

        {/* ================= FALLBACK =================
            Unknown URLs render a real 404 page instead of being silently
            redirected to "/", so an invalid address can no longer masquerade
            as the homepage. Apache still serves index.html for these paths —
            the React app, not the server, decides whether a route exists. */}
        <Route path="*" element={<PublicLayout><NotFound /></PublicLayout>} />
      </Routes>
    </div>
  );
}
