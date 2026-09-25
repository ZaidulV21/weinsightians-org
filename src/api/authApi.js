// src/api/authApi.js
import axios from "./axiosInstance";

export const adminLogin = (data) => {
  return axios.post("/auth/login", data);
};

export const adminLogout = () => {
  return axios.post("/auth/logout");
};

// ==========================================
// Client-side session marker
// The backend (JWT httpOnly cookie) remains the real security boundary.
// This flag is only used to gate the admin UI routes.
// ==========================================
const AUTH_KEY = "wi_admin_auth";

export const markAuthenticated = () =>
  sessionStorage.setItem(AUTH_KEY, "1");

export const clearAuthentication = () =>
  sessionStorage.removeItem(AUTH_KEY);

export const isAuthenticated = () =>
  sessionStorage.getItem(AUTH_KEY) === "1";
