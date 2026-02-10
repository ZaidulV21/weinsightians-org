// src/api/authApi.js
import axios from "./axiosInstance";

export const adminLogin = (data) => {
  return axios.post("/auth/login", data);
};

export const adminLogout = () => {
  return axios.post("/auth/logout");
};
