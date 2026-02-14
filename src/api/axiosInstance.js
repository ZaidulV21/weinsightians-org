// src/api/axiosInstance.js
import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "https://weinsightians-backend-repo.onrender.com/api/v1",
  withCredentials: true, // 🔥 REQUIRED for cookies
});

export default axiosInstance;
