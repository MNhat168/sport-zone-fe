import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'

export const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // Important: để gửi cookies trong mỗi request
  headers: {
    'Content-Type': 'application/json',
    'X-Client-Type': 'admin', // Phân biệt FE admin với FE user
  },
})

// Request interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    // Log request để debug
    if (import.meta.env.DEV) {
      console.log('🚀 Request:', config.method?.toUpperCase(), config.url)
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor
axiosInstance.interceptors.response.use(
  (response) => {
    return response
  },
  async (error) => {
    const originalRequest = error.config

    // Nếu lỗi 401 và chưa retry, thử refresh token
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      try {
        // Gọi endpoint refresh token
        await axiosInstance.post('/auth/refresh')
        
        // Retry request ban đầu
        return axiosInstance(originalRequest)
      } catch (refreshError) {
        // Refresh token cũng fail, redirect về login
        window.location.href = '/sign-in'
        return Promise.reject(refreshError)
      }
    }

    return Promise.reject(error)
  }
)

export default axiosInstance
