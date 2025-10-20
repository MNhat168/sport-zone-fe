import axios from "axios";
import type { AxiosError, InternalAxiosRequestConfig } from "axios";

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 60000, // Tăng từ 10s lên 60s để phù hợp với AI processing
  withCredentials: true, // Gửi kèm cookie tới server cho các request
  headers: {
    "Content-Type": "application/json",
  },
});

// Track if we're currently refreshing to avoid multiple refresh calls
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: any) => void;
  reject: (reason?: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

axiosInstance.interceptors.request.use(
  (config) => {
    // Sử dụng cookie (HttpOnly) thay cho Bearer token, không cần gắn Authorization header
    // Giữ nguyên cấu hình khác
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // If error is 401 and we haven't retried yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // If already refreshing, queue this request
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(() => {
            return axiosInstance(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Try to refresh the token
        const BASE_URL = import.meta.env.VITE_API_URL;
        await axios.post(
          `${BASE_URL}/Auth/refresh`,
          {},
          { withCredentials: true }
        );

        processQueue(null, "refreshed");
        isRefreshing = false;

        // Retry the original request
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        isRefreshing = false;

        // Clear any persisted client-side user state before forcing re-auth
        try {
          localStorage.removeItem("user");
          sessionStorage.removeItem("user");
        } catch {
          // ignore storage errors
        }

        // Refresh failed, redirect to login
        window.location.href = "/auth";
        return Promise.reject(refreshError);
      }
    }

    // For 403 or other errors, just reject
    if (error.response?.status === 403) {
      try {
        localStorage.removeItem("user");
        sessionStorage.removeItem("user");
      } catch {
        // ignore storage errors
      }
      window.location.href = "/auth";
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;


