import axios from "axios";

const axiosUpload = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    timeout: 10000,
    withCredentials: true,
    headers: {
        // Let browser set correct Content-Type + boundary
        "Content-Type": undefined,
    },
});

export default axiosUpload;
