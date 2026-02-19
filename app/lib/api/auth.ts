import api from './client'
import { LoginCredentials, RegisterData, AuthResponse, ChangePasswordData } from '@/app/types'

export const authApi = {
  // Login
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await api.post('/login/', credentials)
    return response.data
  },

  // Register
  register: async (data: RegisterData): Promise<{ user: any; token: string }> => {
    const response = await api.post('/register/', data)
    return response.data
  },

  // Logout
  logout: async (): Promise<void> => {
    try {
      await api.post('/logout/')
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      localStorage.removeItem('authToken')
      localStorage.removeItem('user')
    }
  },

  // Get current user profile
  getCurrentUser: async () => {
    const response = await api.get('/profile/')
    return response.data
  },

   // CHANGE PASSWORD - Add this method
  changePassword: async (data: ChangePasswordData) => {
    const response = await api.post('/change-password/', data)
    return response.data
  },
} 