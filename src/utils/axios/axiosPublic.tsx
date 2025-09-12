import axios from 'axios'

const axiosPublic = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
    timeout: 60000, // Timeout 60 giây cho AI processing
    headers: {
        'Content-Type': 'application/json',
    },
})

export default axiosPublic
