import axios from "axios";

const axiosUpload = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    timeout: 10000,
    headers: {
        // Let browser set correct Content-Type + boundary
        "Content-Type": undefined,
    },
});

// Attach token manually
axiosUpload.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default axiosUpload;
