import axios from 'axios'

const axiosPublic = axios.create({
    baseURL: import.meta.env.VITE_SERVER_URL || 'http://localhost:3000',
    timeout: 60000,
    headers: {
        'Content-Type': 'application/json',
    },
})

axiosPublic.interceptors.request.use((config) => {
    try {
        const token = localStorage.getItem('access_token')
        if (token) {
            config.headers = config.headers || {}
            config.headers['Authorization'] = `Bearer ${token}`
        }
    } catch (_) { }
    return config
})

export default axiosPublic