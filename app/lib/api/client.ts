import axios from 'axios'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://osozi.pythonanywhere.com'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
})

// Request interceptor - adds token to EVERY request
api.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('authToken')
      if (token) {
        config.headers.Authorization = `Token ${token}`
      }
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor - handles errors globally
api.interceptors.response.use(
  (response) => {
    console.log(`✅ Response ${response.config.url}:`, response.status)
    return response
  },
  (error) => {
    const errorResponse = {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      headers: error.response?.headers,
      message: error.message
    }
    
    console.error('❌ Response error DETAILS:', errorResponse)
    
    if (error.response?.data) {
      console.log('🔴 SERVER ERROR RESPONSE:', JSON.stringify(error.response.data, null, 2))
    }
    
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      console.log('🔒 401 Unauthorized - clearing token')
      localStorage.removeItem('authToken')
      localStorage.removeItem('user')
      
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login'
      }
    }
    
    const message = error.response?.data?.detail || 
                    error.response?.data?.error || 
                    error.response?.data?.message ||
                    error.message
    return Promise.reject(new Error(message))
  }
)

if (typeof window !== 'undefined') {
  const token = localStorage.getItem('authToken')
  if (token) {
    api.defaults.headers.common['Authorization'] = `Token ${token}`
    console.log('✅ Default Authorization header set on init')
  }
}

export default api