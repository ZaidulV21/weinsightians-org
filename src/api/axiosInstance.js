// src/api/axiosInstance.js
import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "http://localhost:6200/api/v1",
  withCredentials: true, // 🔥 REQUIRED for cookies
});

export default axiosInstance;
