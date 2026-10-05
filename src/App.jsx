import React, { Suspense, lazy } from "react";
import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import ScrollToTop from "./components/ScrollToTop";
import StructuredData from "./components/StructuredData";
import { ADMIN_LOGIN_ROUTE } from "./routes";

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
/* Split out of the initial bundle. The editor pulls in react-quill, which is by
 * far the heaviest dependency in the project and is needed on exactly one screen
 * behind a login. Loading it up front made every public visitor download and parse
 * it before the homepage could finish rendering. Routes, guards and the login
 * itself are unchanged — the chunk is simply fetched when an admin URL is opened. */
const AdminLogin = lazy(() => import("./Page/admin/AdminLogin"));
const Dashboard = lazy(() => import("./Page/admin/Dashboard"));
const CreateBlog = lazy(() => import("./Page/admin/CreateBlog"));
const EditBlog = lazy(() => import("./Page/admin/EditBlog"));

// Protected Route
import ProtectedRoute from "./components/ProtectedRoute";
import NoIndex from "./components/NoIndex";

const PublicLayout = ({ children }) => (
  <>
    <Navbar />
    <main>{children}</main>
  </>
);

/* Keeps the admin chunk swap from flashing an empty screen. Deliberately plain:
 * a centred ring, the same thing ProtectedRoute already shows while it waits. */
const RouteFallback = () => (
  <div className="flex min-h-screen items-center justify-center" role="status" aria-label="Loading">
    <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent motion-reduce:animate-none" />
  </div>
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
            meta robots tag is crawl hygiene only.

            These four screens are lazily loaded, so <Suspense> sits around the
            route table rather than inside it: a public page never suspends,
            and the admin URLs still resolve to exactly the same components. */}
        <Route
          path={ADMIN_LOGIN_ROUTE}
          element={
            <Suspense fallback={<RouteFallback />}>
              <NoIndex>
                <AdminLogin />
              </NoIndex>
            </Suspense>
          }
        />

        <Route
          path="/admin/dashboard"
          element={
            <Suspense fallback={<RouteFallback />}>
              <NoIndex>
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              </NoIndex>
            </Suspense>
          }
        />

        <Route
          path="/admin/create"
          element={
            <Suspense fallback={<RouteFallback />}>
              <NoIndex>
                <ProtectedRoute>
                  <CreateBlog />
                </ProtectedRoute>
              </NoIndex>
            </Suspense>
          }
        />

        <Route
          path="/admin/edit/:slug"
          element={
            <Suspense fallback={<RouteFallback />}>
              <NoIndex>
                <ProtectedRoute>
                  <EditBlog />
                </ProtectedRoute>
              </NoIndex>
            </Suspense>
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
