import axios from "axios";

// The admin session lives in an HttpOnly cookie the browser attaches on its own.
// The token is never read or stored by JavaScript, so there is nothing here to
// steal and no Authorization header to leak.
const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
});

// ==========================================
// SESSION EXPIRY
// ==========================================
// A 401 from the API means the cookie is gone, expired, or was invalidated by a
// logout elsewhere. The admin screens stop trusting their local marker and send
// the visitor back to the login page instead of failing silently on the next
// click.
//
// Only /admin pages react to this: a public page must never be redirected because
// of an unrelated 401.
const AUTH_KEY = "wi_admin_auth";

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    const onAdminPage = window.location.pathname.startsWith("/admin");
    const isLoginCall = error?.config?.url?.includes("/auth/login");

    if (status === 401 && onAdminPage && !isLoginCall) {
      sessionStorage.removeItem(AUTH_KEY);
      if (!window.location.pathname.startsWith("/admin/login")) {
        window.location.assign("/admin/login");
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
