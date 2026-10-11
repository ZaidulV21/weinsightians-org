// src/api/authApi.js
import axiosInstance from "./axiosInstance";
import { isAuthenticatedSession } from "../utils/session";

export const adminLogin = (data) => {
  return axiosInstance.post("/auth/login", data);
};

export const adminLogout = () => {
  return axiosInstance.post("/auth/logout");
};

// Asks the server whether the session cookie is still valid. This is the only
// trustworthy answer: a flag in browser storage can be set by hand, an expired
// cookie cannot.
//
// A 2xx status alone is not accepted as proof of a session — a host that is not
// really the API can return its own page (HTML, 200) for every path, and this
// request would resolve with that markup. The body must carry the API's
// authenticated shape ({ user: {...} }) or the session is treated as missing.
export const getCurrentAdmin = async () => {
  const response = await axiosInstance.get("/auth/me");
  if (!isAuthenticatedSession(response?.data)) {
    throw new Error("Session could not be confirmed by the API");
  }
  return response;
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
