import axios from 'axios'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
})

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken')
    if (token) {
      config.headers.Authorization = `Token ${token}`  // Note: 'Token' not 'Bearer'
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor - DON'T logout on 401, just log
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.warn('🔴 401 Unauthorized:', error.config?.url)
      // Don't auto logout - let components handle this
    }
    return Promise.reject(error)
  }
)

export default api