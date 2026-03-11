// app/lib/api/client.ts
import axios from 'axios'

// ==============================================================================
// API CONFIGURATION
// ==============================================================================

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://osozi.pythonanywhere.com'

// Common configuration for both instances
const defaultConfig = {
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 seconds
}

// Create authenticated API instance (with token)
const api = axios.create(defaultConfig)

// Create public API instance (no token - for login, register, etc.)
export const publicApi = axios.create(defaultConfig)

// ==============================================================================
// HELPER FUNCTIONS
//==============================================================================

const isBrowser = typeof window !== 'undefined'

const logRequest = (method?: string, url?: string, hasToken?: boolean) => {
  if (process.env.NODE_ENV === 'development') {
    const emoji = hasToken ? '🔑' : '🔍'
    console.log(`${emoji} ${method?.toUpperCase()} ${url}${hasToken ? ' (authenticated)' : ''}`)
  }
}

const logResponse = (method?: string, url?: string, status?: number, isPublic = false) => {
  if (process.env.NODE_ENV === 'development') {
    const prefix = isPublic ? 'PUBLIC ' : ''
    console.log(`✅ ${prefix}${method?.toUpperCase()} ${url}: ${status}`)
  }
}

// ==============================================================================
// ERROR HANDLER
// ==============================================================================

/**
 * Safely extract error details from any error object
 */
const extractErrorDetails = (error: any): Record<string, any> => {
  // If error is null or undefined
  if (!error) {
    return {
      type: 'unknown',
      message: 'Unknown error occurred',
      timestamp: new Date().toISOString(),
    }
  }

  // Start with basic info
  const details: Record<string, any> = {
    timestamp: new Date().toISOString(),
    type: 'unknown',
  }

  try {
    // Add error constructor name if available
    if (error.constructor?.name) {
      details.errorType = error.constructor.name
    }

    // Add stack trace if available (truncated)
    if (error.stack) {
      details.stack = error.stack.split('\n').slice(0, 3).join('\n')
    }

    // Handle Axios error with response
    if (error.response) {
      details.type = 'response'
      details.status = error.response.status
      details.statusText = error.response.statusText
      details.data = error.response.data
      details.url = error.config?.url
      details.method = error.config?.method?.toUpperCase()
      
      // Extract message from response
      if (error.response.data) {
        if (typeof error.response.data === 'string') {
          details.message = error.response.data
        } else {
          details.message = error.response.data.detail || 
                           error.response.data.error || 
                           error.response.data.message ||
                           error.response.statusText ||
                           `HTTP ${error.response.status}`
        }
      }
    }
    // Handle Axios error with request (no response)
    else if (error.request) {
      details.type = 'request'
      details.url = error.config?.url
      details.method = error.config?.method?.toUpperCase()
      details.code = error.code
      details.message = error.code === 'ECONNABORTED' 
        ? 'Request timeout' 
        : 'No response received from server'
    }
    // Handle standard Error object
    else if (error.message) {
      details.type = 'standard'
      details.message = error.message
      details.code = error.code
    }
    // Handle string error
    else if (typeof error === 'string') {
      details.type = 'string'
      details.message = error
    }
    // Handle any other type
    else {
      details.type = 'unknown'
      details.message = 'An unexpected error occurred'
      details.rawValue = String(error)
    }

    // Add config info if available (safely)
    if (error.config) {
      details.config = {
        url: error.config.url,
        method: error.config.method,
        baseURL: error.config.baseURL,
        timeout: error.config.timeout,
      }
    }

  } catch (extractError) {
    // If we fail to extract details, return a fallback
    console.error('Error extracting error details:', extractError)
    return {
      type: 'extraction_failed',
      message: 'Failed to parse error details',
      originalError: String(error),
    }
  }

  return details
}

/**
 * Global error handler for API responses
 */
const handleResponseError = (error: any) => {
  // Extract detailed error information
  const errorDetails = extractErrorDetails(error)
  
  // Log error in development
  if (process.env.NODE_ENV === 'development') {
    console.error('❌ API Error:', errorDetails)
    if (error.response?.data) {
      console.error('🔴 Server response:', error.response.data)
    }
  }

  // Handle timeout errors
  if (error.code === 'ECONNABORTED') {
    return Promise.reject(new Error('Request timeout. Please try again.'))
  }

  // Handle network errors
  if (!error.response && error.code !== 'ECONNABORTED') {
    return Promise.reject(new Error('Network error. Please check your connection.'))
  }

  // Handle 401 Unauthorized - clear session and redirect to login
  if (error.response?.status === 401 && isBrowser) {
    localStorage.removeItem('authToken')
    localStorage.removeItem('user')
    
    if (!window.location.pathname.includes('/login')) {
      window.location.href = '/login'
    }
    return Promise.reject(new Error('Session expired. Please log in again.'))
  }

  // Handle 403 Forbidden
  if (error.response?.status === 403) {
    return Promise.reject(new Error('You do not have permission to perform this action.'))
  }

  // Handle 404 Not Found
  if (error.response?.status === 404) {
    return Promise.reject(new Error('Resource not found.'))
  }

  // Handle 500 Internal Server Error
  if (error.response?.status && error.response.status >= 500) {
    return Promise.reject(new Error('Server error. Please try again later.'))
  }

  // Extract meaningful error message from response
  if (error.response?.data) {
    const data = error.response.data
    
    // Handle different response formats
    if (typeof data === 'string') {
      return Promise.reject(new Error(data))
    }
    
    if (data.detail) {
      return Promise.reject(new Error(data.detail))
    }
    
    if (data.error) {
      return Promise.reject(new Error(data.error))
    }
    
    if (data.message) {
      return Promise.reject(new Error(data.message))
    }
    
    // Handle field validation errors
    if (typeof data === 'object') {
      // Get first error message from any field
      const firstField = Object.keys(data)[0]
      if (firstField) {
        const fieldError = data[firstField]
        if (Array.isArray(fieldError) && fieldError.length > 0) {
          return Promise.reject(new Error(`${firstField}: ${fieldError[0]}`))
        }
        if (typeof fieldError === 'string') {
          return Promise.reject(new Error(`${firstField}: ${fieldError}`))
        }
      }
    }
  }

  // Use extracted message or fallback
  const message = errorDetails.message || error.message || 'An unexpected error occurred'
  return Promise.reject(new Error(message))
}

// ==============================================================================
// REQUEST INTERCEPTORS
// ==============================================================================

// Add auth token to every request (authenticated API only)
api.interceptors.request.use(
  (config) => {
    if (isBrowser) {
      const token = localStorage.getItem('authToken')
      if (token) {
        config.headers.Authorization = `Token ${token}`
        logRequest(config.method, config.url, true)
      } else {
        logRequest(config.method, config.url, false)
      }
    }
    return config
  },
  (error) => Promise.reject(error)
)

// ==============================================================================
// RESPONSE INTERCEPTORS
// ==============================================================================

// Add response interceptors to both instances
api.interceptors.response.use(
  (response) => {
    logResponse(response.config.method, response.config.url, response.status)
    return response
  },
  handleResponseError
)

publicApi.interceptors.response.use(
  (response) => {
    logResponse(response.config.method, response.config.url, response.status, true)
    return response
  },
  handleResponseError
)

// ==============================================================================
// INITIALIZATION
// ==============================================================================

// Set default auth header if token exists on page load
if (isBrowser) {
  const token = localStorage.getItem('authToken')
  if (token) {
    api.defaults.headers.common['Authorization'] = `Token ${token}`
    if (process.env.NODE_ENV === 'development') {
      console.log('✅ Auth token initialized from localStorage')
    }
  }
}

export default api