import axios from "axios";
import type { AxiosError, InternalAxiosRequestConfig } from "axios";

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 60000, // Tăng từ 10s lên 60s để phù hợp với AI processing
  headers: {
    'X-Client-Type': 'web', // Phân biệt FE user với FE admin
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

// Request interceptor: Always attach Bearer token from sessionStorage
axiosInstance.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem('auth_access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
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
        // Always use Bearer token refresh
        const BASE_URL = import.meta.env.VITE_API_URL;
        const refreshToken = sessionStorage.getItem('auth_refresh_token');
        
        if (!refreshToken) {
          throw new Error('No refresh token available');
        }

        const response = await axios.post(
          `${BASE_URL}/auth/refresh`,
          {},
          {
            headers: {
              Authorization: `Bearer ${refreshToken}`,
              'X-Client-Type': 'web'
            }
          }
        );

        // Update tokens in sessionStorage from response body
        if (response.data?.accessToken) {
          sessionStorage.setItem('auth_access_token', response.data.accessToken);
        }
        if (response.data?.refreshToken) {
          sessionStorage.setItem('auth_refresh_token', response.data.refreshToken);
        }

        processQueue(null, "refreshed");
        isRefreshing = false;

        // Retry the original request
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        isRefreshing = false;

        // Clear sessionStorage auth state
        sessionStorage.removeItem('auth_access_token');
        sessionStorage.removeItem('auth_refresh_token');
        sessionStorage.removeItem('user');

        // Only redirect to auth if there was actually a stored user session
        // Anonymous users should NOT be redirected to /auth on 401 errors
        const hadStoredUser = sessionStorage.getItem("user");
        if (hadStoredUser) {
          // Clear any persisted client-side user state before forcing re-auth
          try {
            localStorage.removeItem("user");
          } catch {
            // ignore storage errors
          }

          // Refresh failed, redirect to login
          window.location.href = "/auth";
        }
        // For anonymous users, just reject the error without redirect
        return Promise.reject(refreshError);
      }
    }

    // For 403 or other errors, check if it's an auth error
    if (error.response?.status === 403) {
      const errorMessage = error.response?.data?.message || '';
      const isAuthError = errorMessage.includes('token') || 
                          errorMessage.includes('xác thực') ||
                          errorMessage.includes('quyền') ||
                          errorMessage.includes('authorized') ||
                          errorMessage.includes('permission') ||
                          errorMessage.includes('forbidden');
      
      // Only redirect if it's an auth error, not business logic error
      if (isAuthError) {
        // Only redirect to auth if there was actually a stored user session
        // Anonymous users should NOT be redirected to /auth on 403 errors
        const hadStoredUser = localStorage.getItem("user") || sessionStorage.getItem("user");
        if (hadStoredUser) {
          try {
            localStorage.removeItem("user");
            sessionStorage.removeItem("user");
          } catch {
            // ignore storage errors
          }
          window.location.href = "/auth";
        }
      }
      // For business logic 403 (like time window), just reject without redirect
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;


