// src/api/authApi.js
import axiosInstance from "./axiosInstance";

export const adminLogin = (data) => {
  return axiosInstance.post("/auth/login", data);
};

export const adminLogout = () => {
  return axiosInstance.post("/auth/logout");
};

// Asks the server whether the session cookie is still valid. This is the only
// trustworthy answer: a flag in browser storage can be set by hand, an expired
// cookie cannot.
export const getCurrentAdmin = () => {
  return axiosInstance.get("/auth/me");
};

// ==========================================
// Client-side session marker
// The backend (JWT httpOnly cookie) remains the real security boundary. This
// marker only avoids flashing the login page before /auth/me has answered.
// ==========================================
const AUTH_KEY = "wi_admin_auth";

export const markAuthenticated = () =>
  sessionStorage.setItem(AUTH_KEY, "1");

export const clearAuthentication = () =>
  sessionStorage.removeItem(AUTH_KEY);

export const isAuthenticated = () =>
  sessionStorage.getItem(AUTH_KEY) === "1";
