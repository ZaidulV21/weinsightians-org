import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { clearAuthentication, getCurrentAdmin, markAuthenticated } from "../api/authApi";

// ==========================================
// SESSION CHECK
// ==========================================
// The server is the only authority on whether someone is signed in. The
// sessionStorage marker is a hint that can go stale in either direction: it can
// outlive a cookie that expired, and it is missing in a brand-new tab even when
// the cookie is perfectly valid. So this route always asks the server who is
// signed in, and treats the marker as nothing more than a hint it refreshes.
//
// The check is a usability gate. The real protection is on the server: every
// authenticated route there re-checks the cookie, so a hand-set marker in
// localStorage buys nothing.

const ProtectedRoute = ({ children }) => {
  const [state, setState] = useState("checking");

  useEffect(() => {
    let active = true;

    getCurrentAdmin()
      .then((response) => {
        if (!active) return;
        markAuthenticated();
        setState("allowed");
      })
      .catch(() => {
        if (!active) return;
        clearAuthentication();
        setState("redirecting");
      });

    return () => {
      active = false;
    };
  }, []);

  if (state === "redirecting") {
    return <Navigate to="/admin/login" replace />;
  }

  if (state === "checking") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return children;
};

export default ProtectedRoute;
