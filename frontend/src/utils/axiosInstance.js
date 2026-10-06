import axios from "axios";
import { BASE_URL } from "./apiPaths";

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 80000,
  withCredentials: true, // Send cookies with every request
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// Response Interceptor — handle errors globally
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      if (error.response.status === 401) {
        const requestUrl = error.config?.url || "";
        const currentPath = window.location.pathname;

        // Skip redirection for auth-check endpoints (regular user or admin)
        const isAuthCheck =
          requestUrl.includes("/api/auth/me") ||
          requestUrl.includes("/api/admin/me") ||
          requestUrl.includes("/api/auth/login") ||
          requestUrl.includes("/api/admin/login");

        // Skip redirection on public pages where guests are expected
        const isPublicPage =
          currentPath === "/" ||
          currentPath === "/login" ||
          currentPath === "/signin" ||
          currentPath === "/admin-login" ||
          currentPath === "/find-jobs" ||
          currentPath === "/ats-scanner" ||
          currentPath === "/ats-score" ||
          currentPath.startsWith("/job/");

        // Only redirect if this is an unauthorized request on a protected page
        if (!isPublicPage && !isAuthCheck) {
          window.location.href = "/login";
        }
      } else if (error.response.status === 500) {
        console.error("Server error. Please try again later.");
      }
    } else if (error.code === "ECONNABORTED") {
      console.error("Request timeout. Please try again.");
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;