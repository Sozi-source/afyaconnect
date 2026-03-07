import axios from 'axios'

// ==============================================================================
// API CONFIGURATION
// ==============================================================================

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://osozi.pythonanywhere.com'

// Create authenticated API instance (with token)
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 seconds
})

// Create public API instance (no token - for login, register, etc.)
export const publicApi = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
})

// ==============================================================================
// REQUEST INTERCEPTORS
// ==============================================================================

// Add auth token to every request (authenticated API only)
api.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('authToken')
      if (token) {
        config.headers.Authorization = `Token ${token}`
        console.log(`🔑 Token added: ${config.method?.toUpperCase()} ${config.url}`)
      } else {
        console.log(`🔍 No token: ${config.method?.toUpperCase()} ${config.url}`)
      }
    }
    return config
  },
  (error) => Promise.reject(error)
)

// ==============================================================================
// RESPONSE INTERCEPTORS
// ==============================================================================

/**
 * Global error handler for API responses
 */
const handleResponseError = (error: any) => {
  // Log detailed error information
  const errorDetails = {
    url: error.config?.url,
    method: error.config?.method,
    status: error.response?.status,
    statusText: error.response?.statusText,
    data: error.response?.data,
    message: error.message,
    code: error.code
  }
  
  console.error('❌ API Error:', errorDetails)

  // Handle timeout errors
  if (error.code === 'ECONNABORTED') {
    console.error('⏱️ Request timeout - server took too long to respond')
    return Promise.reject(new Error('Request timeout. Please try again.'))
  }

  // Log server error response if available
  if (error.response?.data) {
    console.log('🔴 Server response:', JSON.stringify(error.response.data, null, 2))
  }

  // Handle 401 Unauthorized - clear session and redirect to login
  if (error.response?.status === 401 && typeof window !== 'undefined') {
    console.log('🔒 401 Unauthorized - clearing session')
    localStorage.removeItem('authToken')
    localStorage.removeItem('user')
    
    if (!window.location.pathname.includes('/login')) {
      window.location.href = '/login'
    }
  }

  // Extract meaningful error message
  const message = error.response?.data?.detail || 
                  error.response?.data?.error || 
                  error.response?.data?.message ||
                  error.message

  return Promise.reject(new Error(message))
}

// Add response interceptors to both instances
api.interceptors.response.use(
  (response) => {
    console.log(`✅ ${response.config.method?.toUpperCase()} ${response.config.url}: ${response.status}`)
    return response
  },
  handleResponseError
)

publicApi.interceptors.response.use(
  (response) => {
    console.log(`✅ PUBLIC ${response.config.method?.toUpperCase()} ${response.config.url}: ${response.status}`)
    return response
  },
  handleResponseError
)

// ==============================================================================
// INITIALIZATION
// ==============================================================================

// Set default auth header if token exists on page load
if (typeof window !== 'undefined') {
  const token = localStorage.getItem('authToken')
  if (token) {
    api.defaults.headers.common['Authorization'] = `Token ${token}`
    console.log('✅ Auth token initialized from localStorage')
  }
}

export default api