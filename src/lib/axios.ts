import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

// Track if we're currently refreshing to avoid multiple refresh calls
let isRefreshing = false
let failedQueue: Array<{
  resolve: (value?: any) => void
  reject: (reason?: any) => void
}> = []

const processQueue = (error: any) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error)
    } else {
      prom.resolve()
    }
  })
  failedQueue = []
}

export const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000, // 60 seconds timeout - quan trọng cho production
  headers: {
    'Content-Type': 'application/json',
    'X-Client-Type': 'admin', // Phân biệt FE admin với FE user
  },
})

// Request interceptor: Always attach Bearer token from sessionStorage
axiosInstance.interceptors.request.use(
  (config) => {
    // Log request để debug
    if (import.meta.env.DEV) {
      console.log('🚀 Request:', config.method?.toUpperCase(), config.url)
    }
    
    // Always add Bearer token if available
    const token = sessionStorage.getItem('auth_access_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
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

    // Xử lý network errors (timeout, connection refused, etc.)
    if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT' || !error.response) {
      console.error('🚨 Network error:', error.message)
      return Promise.reject(error)
    }

    // Nếu lỗi 401 và chưa retry, thử refresh token
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // If already refreshing, queue this request
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        })
          .then(() => {
            return axiosInstance(originalRequest)
          })
          .catch((err) => {
            return Promise.reject(err)
          })
      }

      originalRequest._retry = true
      isRefreshing = true

      try {
        // Get refresh token from sessionStorage
        const refreshToken = sessionStorage.getItem('auth_refresh_token')
        if (!refreshToken) {
          throw new Error('No refresh token available')
        }

        // Call refresh endpoint with Bearer token
        const response = await axios.post(
          `${API_BASE_URL}/auth/refresh`,
          {},
          {
            headers: {
              Authorization: `Bearer ${refreshToken}`,
              'X-Client-Type': 'admin',
            },
          }
        )

        // Update tokens in sessionStorage from response body
        if (response.data?.accessToken) {
          sessionStorage.setItem('auth_access_token', response.data.accessToken)
        }
        if (response.data?.refreshToken) {
          sessionStorage.setItem('auth_refresh_token', response.data.refreshToken)
        }

        processQueue(null)
        isRefreshing = false

        // Retry the original request
        return axiosInstance(originalRequest)
      } catch (refreshError) {
        processQueue(refreshError)
        isRefreshing = false

        // Clear sessionStorage auth state
        sessionStorage.removeItem('auth_access_token')
        sessionStorage.removeItem('auth_refresh_token')
        sessionStorage.removeItem('user')

        // Redirect to login
        window.location.href = '/sign-in'
        return Promise.reject(refreshError)
      }
    }

    return Promise.reject(error)
  }
)

export default axiosInstance
