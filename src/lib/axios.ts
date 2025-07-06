import axios from "axios";

const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000", // or your backend
  withCredentials: true, // 🔥 IMPORTANT: sends cookies automatically
});

export default axiosInstance;
