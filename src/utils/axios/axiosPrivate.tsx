import axios from "axios";

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 60000, // Tăng từ 10s lên 60s để phù hợp với AI processing
  withCredentials: true, // Gửi kèm cookie tới server cho các request
  headers: {
    "Content-Type": "application/json",
  },
});

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
  (error) => {
    if (
      error.response &&
      (error.response.status === 401 || error.response.status === 403)
    ) {
      // Với cookie HttpOnly, không thể xóa cookie từ client; chỉ cần điều hướng để re-auth
      window.location.href = "/auth";
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;


