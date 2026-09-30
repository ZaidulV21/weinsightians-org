// src/pages/admin/AdminLogin.jsx
//
// The admin sign-in screen.
//
// It uses the B1 session exactly as it was built: the browser holds an HttpOnly
// cookie, JavaScript never sees the token, and the only question this page asks
// is "does the server still consider me signed in?" via /auth/me. There is no
// client-side imitation of an authenticated state here - if this page says you
// are signed in, the server said so first.
import { useEffect, useRef, useState } from "react";
import { Helmet } from "react-helmet-async";
import { useNavigate } from "react-router-dom";
import { FiEye, FiEyeOff, FiArrowRight, FiAlertCircle, FiShield } from "react-icons/fi";
import { adminLogin, getCurrentAdmin, markAuthenticated } from "../../api/authApi";

// Anything the server says about a failure stays in the server. The only text
// this page ever shows is the fixed string below, so an error response can never
// leak internals through the UI.
const INVALID_CREDENTIALS = "Invalid email or password. Please try again.";
const TOO_MANY_ATTEMPTS = "Too many attempts. Please wait a few minutes and try again.";

const messageFor = (error) =>
  error?.response?.status === 429 ? TOO_MANY_ATTEMPTS : INVALID_CREDENTIALS;

const AdminLogin = () => {
  const navigate = useNavigate();
  const emailRef = useRef(null);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [checking, setChecking] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Someone who is already signed in has no business on this page. This runs on
  // every visit, including a reload or a bookmark, and the server is the only
  // authority: a stale marker in sessionStorage proves nothing.
  useEffect(() => {
    let active = true;

    getCurrentAdmin()
      .then(() => {
        if (active) navigate("/admin/dashboard", { replace: true });
      })
      .catch(() => {
        if (active) setChecking(false);
      });

    return () => {
      active = false;
    };
  }, [navigate]);

  // The fields are disabled while the session is being checked, so a disabled
  // input cannot take focus. Once the check settles, focus moves into the form -
  // which is where a keyboard user expects to start on a page like this.
  useEffect(() => {
    if (!checking) emailRef.current?.focus();
  }, [checking]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    // The disabled button covers the keyboard case, but a held-down Enter key
    // fires submit again before React re-renders. This is the real guard.
    if (submitting) return;

    setError("");
    setSubmitting(true);

    try {
      await adminLogin({ email: email.trim(), password });

      // The marker only avoids a flash of the login page. The cookie is the
      // session; this is a hint about it, and the server still decides.
      markAuthenticated();

      setPassword("");
      navigate("/admin/dashboard", { replace: true });
    } catch (err) {
      setError(messageFor(err));

      // The email is kept so a typo does not have to be retyped. The password is
      // dropped: it is not useful to keep, and a stale one sitting in the DOM is
      // one more thing visible to anyone walking past the screen.
      setPassword("");
      emailRef.current?.focus();
      emailRef.current?.select();
    } finally {
      setSubmitting(false);
    }
  };

  const busy = submitting;

  return (
    <div className="min-h-screen bg-[#f7f6fb] font-[gilroy] text-[#231746]">
      <Helmet>
        <title>Admin Workspace | We Insightians</title>
      </Helmet>

      {/* ================= BRAND COLUMN (desktop only) =================
          Hidden below lg, so a phone gets the form and nothing decorative. */}
      <div className="min-h-screen lg:grid lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <aside className="hidden lg:flex flex-col justify-between bg-white border-r border-[#e8e6f1] px-14 py-14">
          <div>
            {/* The mark is a dark wordmark on a transparent background, so it
                only ever sits on a light surface. */}
            <img
              src="/img/we-logo.png"
              alt="We Insightians"
              className="h-11 w-auto"
            />

            <p className="mt-12 text-[11px] font-semibold uppercase tracking-[0.22em] text-[#534277]">
              We Insightians
            </p>
            <h2 className="mt-4 font-[larken] text-[2.1rem] leading-[1.2] text-[#231746]">
              The workspace behind the work we publish.
            </h2>
            <p className="mt-5 max-w-sm text-[15px] leading-relaxed text-[#5d5675]">
              Write, review and publish the articles that go out under the We
              Insightians name. Everything here is private to the team.
            </p>
          </div>

          <div className="border-t border-[#eceaf4] pt-7">
            <div className="flex items-start gap-3">
              <FiShield className="mt-0.5 h-4 w-4 shrink-0 text-[#534277]" aria-hidden="true" />
              <p className="max-w-sm text-[13px] leading-relaxed text-[#6b6483]">
                Access is limited to administrators. Sessions use a secure,
                HTTP-only cookie and end as soon as you sign out.
              </p>
            </div>
          </div>
        </aside>

        {/* ================= FORM COLUMN ================= */}
        <main className="flex items-center justify-center px-5 py-10 sm:px-8 sm:py-14">
          <div className="w-full max-w-[27rem]">
            {/* Compact brand row for phones: identity only, no decoration. */}
            <div className="mb-8 flex items-center gap-3 lg:hidden">
              <img src="/img/we-logo.png" alt="" aria-hidden="true" className="h-7 w-auto" />
              <span className="h-5 w-px bg-[#ddd9ea]" aria-hidden="true" />
              <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#6b6483]">
                Admin Workspace
              </span>
            </div>

            <div
              className="rounded-2xl border border-[#e8e6f1] bg-white p-7 shadow-[0_1px_2px_rgba(35,23,70,0.04),0_18px_40px_-24px_rgba(35,23,70,0.25)] sm:p-9"
              aria-busy={busy || checking}
            >
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#534277]">
                Admin Workspace
              </p>
              <h1 className="mt-3 font-[larken] text-[1.75rem] leading-tight text-[#231746]">
                Sign in
              </h1>
              <p className="mt-2 text-[14px] leading-relaxed text-[#6b6483]">
                Use the administrator account for We Insightians.
              </p>

              {/* One live region, referenced by both fields. Announced the
                  moment it appears, without moving focus. */}
              <div id="admin-login-error" role="alert" aria-live="assertive">
                {error ? (
                  <p className="mt-6 flex items-start gap-2.5 rounded-lg border border-[#f0d5d8] bg-[#fdf4f5] px-3.5 py-3 text-[13.5px] leading-relaxed text-[#a32b3b]">
                    <FiAlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                    <span>{error}</span>
                  </p>
                ) : null}
              </div>

              <form onSubmit={handleSubmit} className="mt-6">
                <div>
                  <label
                    htmlFor="admin-email"
                    className="block text-[13px] font-semibold text-[#3a3355]"
                  >
                    Email
                  </label>
                  <input
                    ref={emailRef}
                    id="admin-email"
                    name="email"
                    type="email"
                    inputMode="email"
                    autoComplete="email"
                    autoCapitalize="none"
                    autoCorrect="off"
                    spellCheck={false}
                    required
                    value={email}
                    disabled={checking || submitting}
                    aria-invalid={error ? "true" : undefined}
                    aria-describedby={error ? "admin-login-error" : undefined}
                    onChange={(event) => setEmail(event.target.value.trim())}
                    placeholder="you@weinsightian.tech"
                    className="mt-2 w-full rounded-lg border border-[#ddd9ea] bg-white px-3.5 py-3 text-[15px] text-[#231746] placeholder:text-[#a9a3bd] transition-colors focus:border-[#231746] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#231746] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:bg-[#faf9fd] disabled:text-[#8c86a1]"
                  />
                </div>

                <div className="mt-5">
                  <label
                    htmlFor="admin-password"
                    className="block text-[13px] font-semibold text-[#3a3355]"
                  >
                    Password
                  </label>
                  <div className="relative mt-2">
                    <input
                      id="admin-password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="current-password"
                      required
                      value={password}
                      disabled={checking || submitting}
                      aria-invalid={error ? "true" : undefined}
                      aria-describedby={error ? "admin-login-error" : undefined}
                      onChange={(event) => setPassword(event.target.value)}
                      placeholder="Enter your password"
                      className="w-full rounded-lg border border-[#ddd9ea] bg-white py-3 pl-3.5 pr-12 text-[15px] text-[#231746] placeholder:text-[#a9a3bd] transition-colors focus:border-[#231746] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#231746] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:bg-[#faf9fd] disabled:text-[#8c86a1]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((visible) => !visible)}
                      disabled={checking || submitting}
                      aria-pressed={showPassword}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                      className="absolute right-1.5 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-md text-[#6b6483] transition-colors hover:text-[#231746] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#231746] focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      {showPassword ? (
                        <FiEyeOff className="h-[18px] w-[18px]" aria-hidden="true" />
                      ) : (
                        <FiEye className="h-[18px] w-[18px]" aria-hidden="true" />
                      )}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={busy || checking}
                  className="mt-7 flex w-full items-center justify-center gap-2 rounded-lg bg-[#231746] px-4 py-3.5 text-[15px] font-semibold text-white transition-colors hover:bg-[#2f2160] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#231746] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:bg-[#cfc9e2]"
                >
                  {busy ? (
                    <>
                      <span
                        className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white"
                        aria-hidden="true"
                      />
                      Signing in…
                    </>
                  ) : (
                    <>
                      Sign in
                      <FiArrowRight className="h-4 w-4" aria-hidden="true" />
                    </>
                  )}
                </button>
              </form>

              <p className="mt-6 text-center text-[12.5px] text-[#8c86a1]">
                Your session is kept in a secure cookie, never in browser storage.
              </p>
            </div>

            {checking ? (
              <p className="mt-4 text-center text-[12.5px] text-[#8c86a1]">
                Checking your session…
              </p>
            ) : null}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLogin;
