import axios from "axios";

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
});

console.log("BASE URL:", import.meta.env.VITE_API_URL); // 👈 add this

export default axiosInstance;