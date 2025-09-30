import axios from "axios";

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 60000, // Tăng từ 10s lên 60s để phù hợp với AI processing
  headers: {
    "Content-Type": "application/json", //Dữ liệu gửi đi dạng JSON
  },
});

axiosInstance.interceptors.request.use(
  (config) => {
    const accessToken = localStorage.getItem("token");
    console.log("accessToken", accessToken);
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }

    // Debug request data
    if (config.url?.includes("/batch")) {
      console.log("Axios interceptor - Request config:", {
        url: config.url,
        method: config.method,
        data: config.data,
        dataType: typeof config.data,
        dataStringified: JSON.stringify(config.data),
      });
    }

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
      console.log("🔑 Token expired/invalid, auto logout");
      
      // Clear token and user data
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      sessionStorage.removeItem("token");
      sessionStorage.removeItem("user");

      // Redirect to auth page for re-login
      window.location.href = "/auth";
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;


