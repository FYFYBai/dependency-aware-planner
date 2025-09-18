import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8081/api", // backend base URL
});

// Add JWT token automatically if present
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
