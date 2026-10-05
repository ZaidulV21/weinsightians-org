import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { FiGrid, FiFileText, FiPlus, FiLogOut, FiMenu, FiX } from "react-icons/fi";
import { adminLogout, clearAuthentication } from "../../api/authApi";
import { lockScroll, unlockScroll } from "../../utils/scrollLock";
import ConfirmDialog from "./ConfirmDialog";
import { ADMIN_LOGIN_ROUTE } from "../../routes";

/**
 * The admin workspace shell.
 *
 * One place for the sidebar, the mobile drawer, the page header and sign-out, so
 * every admin screen gets the same frame instead of each one rebuilding it. B4 and
 * B5 adopt this for the create and edit screens.
 *
 * The logo is a dark wordmark on a transparent background, so both the sidebar
 * and the mobile bar keep it on a light surface.
 *
 * `guardNavigation` is optional. An editor holding unsaved content sets it, and
 * the nav links ask before throwing that work away instead of following straight
 * out of the page. The dashboard leaves it unset and is unaffected.
 */

const NAV_ITEMS = [
  { label: "Dashboard", to: "/admin/dashboard", icon: FiGrid },
  // The blog list lives on the dashboard, so this jumps to that section rather
  // than inventing a route that does not exist.
  { label: "Blogs", to: "/admin/dashboard#blogs", icon: FiFileText },
  { label: "Create Blog", to: "/admin/create", icon: FiPlus },
];

const navClasses = (active) =>
  active
    ? "bg-[#f1effa] text-[#231746] font-semibold"
    : "text-[#5d5675] hover:bg-[#f7f6fb] hover:text-[#231746]";

const AdminShell = ({ title, subtitle, action, guardNavigation, children }) => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const [pendingNav, setPendingNav] = useState(null); // asked to confirm leaving
  const location = useLocation();
  const navigate = useNavigate();
  const drawerRef = useRef(null);
  const toggleRef = useRef(null);

  const closeDrawer = useCallback(() => setDrawerOpen(false), []);

  // Confirm-then-go for a nav link. Without `guardNavigation` this is just
  // navigate, so the dashboard behaves exactly as it did before this prop existed.
  const handleNavClick = (event, to) => {
    if (!guardNavigation) return;

    event.preventDefault();
    closeDrawer();
    setPendingNav(to);
  };

  // A viewport change from phone to desktop leaves the drawer mounted but hidden,
  // which would keep the page scroll-locked.
  useEffect(() => {
    const query = window.matchMedia("(min-width: 1024px)");
    const handleChange = (event) => {
      if (event.matches) setDrawerOpen(false);
    };
    query.addEventListener("change", handleChange);
    return () => query.removeEventListener("change", handleChange);
  }, []);

  // ==========================================
  // MOBILE DRAWER
  // ==========================================
  useEffect(() => {
    if (!drawerOpen) return undefined;

    lockScroll();
    drawerRef.current?.querySelector("a, button")?.focus();

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setDrawerOpen(false);
        toggleRef.current?.focus();
        return;
      }

      if (event.key !== "Tab") return;

      // Keep Tab inside the drawer while it covers the screen.
      const nodes = drawerRef.current?.querySelectorAll(
        'a[href], button:not([disabled])'
      );
      if (!nodes || nodes.length === 0) return;

      const first = nodes[0];
      const last = nodes[nodes.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      unlockScroll();
    };
  }, [drawerOpen]);

  // Any route change closes the drawer, so a link inside it does not leave it
  // hanging over the page it just navigated to.
  useEffect(() => {
    setDrawerOpen(false);
  }, [location.pathname, location.hash]);

  // ==========================================
  // SIGN OUT
  // Uses the B1 logout endpoint. The cookie is cleared by the server, and
  // tokenVersion makes the old session worthless; the local marker is only
  // cleared afterwards so this screen stops trusting it.
  //
  // Signing out discards an unsaved post like any other exit, so it asks first
  // when the screen has something to lose.
  // ==========================================
  const performLogout = async () => {
    setSigningOut(true);
    try {
      await adminLogout();
    } catch {
      // A failed sign-out must still take the person off this screen, because
      // the server is what decides whether the session is alive.
    } finally {
      clearAuthentication();
      setSigningOut(false);
      navigate(ADMIN_LOGIN_ROUTE, { replace: true });
    }
  };

  const handleLogout = () => {
    if (guardNavigation) {
      setPendingNav(ADMIN_LOGIN_ROUTE);
      return;
    }
    performLogout();
  };

  // Finishes an exit the screen asked about first.
  const confirmNav = () => {
    if (!pendingNav) return;
    const target = pendingNav;
    setPendingNav(null);

    // Signing out still has to reach the logout endpoint; every other target is
    // just a page.
    if (target === ADMIN_LOGIN_ROUTE) performLogout();
    else navigate(target);
  };

  const isActive = (item) => {
    if (item.to.split("#")[0] !== location.pathname) return false;
    return item.to.includes("#")
      ? location.hash === `#${item.to.split("#")[1]}`
      : !location.hash;
  };

  const navList = (
    <nav aria-label="Admin sections" className="flex flex-col gap-1">
      {NAV_ITEMS.map((item) => {
        const Icon = item.icon;
        const active = isActive(item);

        return (
          <Link
            key={item.label}
            to={item.to}
            onClick={(event) => handleNavClick(event, item.to)}
            aria-current={active ? "page" : undefined}
            className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-[14px] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#231746] focus-visible:ring-offset-2 ${navClasses(active)}`}
          >
            <Icon className="h-[18px] w-[18px] shrink-0" aria-hidden="true" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );

  const signOutButton = (
    <button
      type="button"
      onClick={handleLogout}
      disabled={signingOut}
      className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-[14px] text-[#8a3a3a] transition-colors hover:bg-[#fdf4f5] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#231746] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
    >
      <FiLogOut className="h-[18px] w-[18px] shrink-0" aria-hidden="true" />
      {signingOut ? "Signing out…" : "Logout"}
    </button>
  );

  return (
    <div className="min-h-screen bg-[#f7f6fb] font-[gilroy] text-[#231746]">
      <a
        href="#admin-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[70] focus:rounded-lg focus:bg-white focus:px-4 focus:py-2.5 focus:text-[14px] focus:font-semibold focus:shadow-lg"
      >
        Skip to content
      </a>

      <div className="min-h-screen lg:grid lg:grid-cols-[16.5rem_minmax(0,1fr)]">
        {/* ================= DESKTOP SIDEBAR ================= */}
        <aside className="hidden lg:flex lg:flex-col border-r border-[#e8e6f1] bg-white">
          <div className="px-6 py-7">
            <Link
              to="/admin/dashboard"
              className="inline-block rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#231746] focus-visible:ring-offset-2"
            >
              <img src="/img/we-logo.png" alt="We Insightians" className="h-9 w-auto" />
            </Link>
            <p className="mt-3.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#8c86a1]">
              Admin Workspace
            </p>
          </div>

          <div className="flex-1 overflow-y-auto px-4">{navList}</div>

          <div className="border-t border-[#eceaf4] p-4">{signOutButton}</div>
        </aside>

        {/* ================= MOBILE TOP BAR ================= */}
        <div className="sticky top-0 z-40 flex items-center gap-3 border-b border-[#e8e6f1] bg-white px-4 py-3 lg:hidden">
          <button
            ref={toggleRef}
            type="button"
            onClick={() => setDrawerOpen(true)}
            aria-label="Open admin menu"
            aria-expanded={drawerOpen}
            aria-controls="admin-drawer"
            className="flex h-9 w-9 items-center justify-center rounded-lg text-[#231746] transition-colors hover:bg-[#f4f2fa] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#231746] focus-visible:ring-offset-2"
          >
            <FiMenu className="h-5 w-5" aria-hidden="true" />
          </button>

          <img src="/img/we-logo.png" alt="" aria-hidden="true" className="h-6 w-auto" />
          <span className="h-4 w-px bg-[#ddd9ea]" aria-hidden="true" />
          <span className="truncate text-[11px] font-semibold uppercase tracking-[0.16em] text-[#8c86a1]">
            Admin Workspace
          </span>
        </div>

        {/* ================= MOBILE SLIDE-OVER ================= */}
        {drawerOpen ? (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div
              className="absolute inset-0 bg-[#04020b]/45"
              onClick={closeDrawer}
              aria-hidden="true"
            />

            <div
              ref={drawerRef}
              id="admin-drawer"
              role="dialog"
              aria-modal="true"
              aria-label="Admin menu"
              className="relative flex h-full w-[17rem] max-w-[85vw] flex-col border-r border-[#e8e6f1] bg-white"
            >
              <div className="flex items-start justify-between px-5 py-5">
                <div>
                  <img src="/img/we-logo.png" alt="We Insightians" className="h-8 w-auto" />
                  <p className="mt-2.5 text-[10.5px] font-semibold uppercase tracking-[0.18em] text-[#8c86a1]">
                    Admin Workspace
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    closeDrawer();
                    toggleRef.current?.focus();
                  }}
                  aria-label="Close admin menu"
                  className="flex h-9 w-9 items-center justify-center rounded-lg text-[#5d5675] transition-colors hover:bg-[#f4f2fa] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#231746] focus-visible:ring-offset-2"
                >
                  <FiX className="h-5 w-5" aria-hidden="true" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto px-4 pb-4">{navList}</div>

              <div className="border-t border-[#eceaf4] p-4">{signOutButton}</div>
            </div>
          </div>
        ) : null}

        {/* ================= MAIN ================= */}
        <div className="flex min-w-0 flex-col">
          <header className="border-b border-[#e8e6f1] bg-white">
            <div className="flex flex-wrap items-center justify-between gap-4 px-5 py-6 sm:px-8 lg:py-8">
              <div className="min-w-0">
                <h1 className="font-[larken] text-[1.6rem] leading-tight text-[#231746] sm:text-[1.75rem]">
                  {title}
                </h1>
                {subtitle ? (
                  <p className="mt-1.5 text-[14px] leading-relaxed text-[#6b6483]">
                    {subtitle}
                  </p>
                ) : null}
              </div>

              {action ? <div className="flex shrink-0 items-center gap-2">{action}</div> : null}
            </div>
          </header>

          <main id="admin-content" className="min-w-0 flex-1 px-5 py-6 sm:px-8 sm:py-8">
            {children}
          </main>
        </div>
      </div>

      {/* Leaving with unsaved work: only rendered when the screen asked to be
          consulted, so the dashboard never sees this. */}
      {guardNavigation ? (
        <ConfirmDialog
          open={Boolean(pendingNav)}
          title="Leave without saving?"
          description="This post has not been saved yet. Leaving now discards everything you have typed."
          confirmLabel="Discard and leave"
          cancelLabel="Keep editing"
          destructive
          onConfirm={confirmNav}
          onCancel={() => setPendingNav(null)}
        />
      ) : null}
    </div>
  );
};

export default AdminShell;
