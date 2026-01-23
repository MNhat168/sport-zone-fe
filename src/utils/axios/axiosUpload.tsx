import axios from "axios";

const axiosUpload = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    timeout: 30000, // Increased timeout for large file uploads
    withCredentials: true,
    headers: {
        // Let browser set correct Content-Type + boundary for multipart/form-data
        "Content-Type": undefined,
    },
});

// Add request interceptor to attach auth token
axiosUpload.interceptors.request.use(
    (config) => {
        // Get token from sessionStorage (same as axiosPrivate)
        const token = sessionStorage.getItem('auth_access_token');

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default axiosUpload;
