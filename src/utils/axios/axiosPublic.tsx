import axios from 'axios'

const axiosPublic = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    timeout: 60000, // Timeout 60 giây cho AI processing
    withCredentials: true,
})

export default axiosPublic
