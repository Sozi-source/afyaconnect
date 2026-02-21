'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { apiClient } from '@/app/lib/api'
import api from '@/app/lib/api/client' // Import axios instance to set default header

interface User {
  id: number
  email: string
  username?: string
  first_name?: string
  last_name?: string
}

interface LoginCredentials {
  username: string
  password: string
}

interface RegisterData {
  username: string
  email: string
  password: string
  first_name?: string
  last_name?: string
  role?: 'client' | 'practitioner'
  phone?: string
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (credentials: LoginCredentials) => Promise<void>
  register: (data: RegisterData) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  // Check for existing session on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('authToken')
        console.log('🔍 Check auth - token:', token ? 'Present' : 'Missing', new Date().toISOString())

        if (token) {
          // Set default header for all future requests
          api.defaults.headers.common['Authorization'] = `Token ${token}`
          console.log('✅ Default Authorization header set from stored token')

          try {
            // Try to fetch profile
            const response = await apiClient.auth.getProfile()
            console.log('✅ Profile fetched:', response)
            
            setUser({
              id: response.id,
              email: response.email,
              username: response.email,
              first_name: response.first_name || '',
              last_name: response.last_name || '',
            })
          } catch (error) {
            console.log('❌ Profile fetch failed, clearing token at:', new Date().toISOString())
            localStorage.removeItem('authToken')
            localStorage.removeItem('user')
            delete api.defaults.headers.common['Authorization'] // Clear default header
          }
        }
      } catch (error) {
        console.error('Auth check error:', error)
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [])

  const login = async (credentials: LoginCredentials) => {
    try {
      console.log('🔐 Login attempt with:', credentials.username)
      
      const response = await apiClient.auth.login({
        email: credentials.username,
        password: credentials.password
      })
      
      console.log('✅ Login response:', response)
      
      if (!response.token) {
        throw new Error('No token received')
      }

      // Save to localStorage
      localStorage.setItem('authToken', response.token)
      console.log('💾 Token saved to localStorage:', response.token.substring(0, 10) + '...')

      // CRITICAL: Set default header for ALL future axios requests
      api.defaults.headers.common['Authorization'] = `Token ${response.token}`
      console.log('✅ Default Authorization header set globally:', api.defaults.headers.common['Authorization'])

      // Verify token was saved
      const savedToken = localStorage.getItem('authToken')
      console.log('✅ Verification - token in localStorage:', savedToken ? 'Present' : 'Missing')

      // Set user
      const userData = {
        id: response.user_id,
        email: response.email,
        username: response.email || credentials.username,
        first_name: '',
        last_name: '',
      }
      
      setUser(userData)
      localStorage.setItem('user', JSON.stringify(userData))

      // Small delay to ensure state updates before redirect
      setTimeout(() => {
        console.log('🚀 Redirecting to dashboard')
        router.push('/dashboard')
      }, 100)
      
    } catch (error) {
      console.error('❌ Login failed:', error)
      throw error
    }
  }

  const register = async (data: RegisterData) => {
    try {
      console.log('📝 Register attempt for:', data.username)
      
      // Prepare data - only send defined fields
      const registerData = {
        username: data.username,
        email: data.email,
        password: data.password,
        ...(data.first_name && { first_name: data.first_name }),
        ...(data.last_name && { last_name: data.last_name }),
        ...(data.role && { role: data.role }),
        ...(data.phone && { phone: data.phone })
      }
      
      const response = await apiClient.auth.register(registerData)
      console.log('✅ Register response:', response)
      
      if (response.token) {
        localStorage.setItem('authToken', response.token)
        
        // Set default header for all future requests
        api.defaults.headers.common['Authorization'] = `Token ${response.token}`
        console.log('✅ Default Authorization header set from registration')
        
        setUser({
          id: response.user_id,
          email: response.email,
          username: response.email || data.username,
          first_name: data.first_name || '',
          last_name: data.last_name || '',
        })
        
        router.push('/dashboard')
      }
      
    } catch (error) {
      console.error('❌ Registration failed:', error)
      throw error
    }
  }

  const logout = () => {
    console.log('👋 Logging out')
    localStorage.removeItem('authToken')
    localStorage.removeItem('user')
    delete api.defaults.headers.common['Authorization'] // Clear default header
    setUser(null)
    router.push('/login')
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}