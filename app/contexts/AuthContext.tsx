'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { api } from '@/app/lib/api'

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
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (credentials: LoginCredentials) => Promise<void>
  register: (data: RegisterData) => Promise<void>  // Add this
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
        console.log('🔍 Check auth - token:', token ? 'Present' : 'Missing')

        if (token) {
          try {
            // Try to fetch profile
            const response = await api.get('/profile/')
            console.log('✅ Profile fetched:', response.data)
            
            setUser({
              id: response.data.id || response.data.user_id,
              email: response.data.email,
              username: response.data.username,
              first_name: response.data.first_name || '',
              last_name: response.data.last_name || '',
            })
          } catch (error) {
            console.log('❌ Profile fetch failed, clearing token')
            localStorage.removeItem('authToken')
            localStorage.removeItem('user')
          }
        }
      } catch (error) {
        console.error('Auth check error:', error)
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, []) // No router dependency here to prevent redirect loops

  const login = async (credentials: LoginCredentials) => {
    try {
      console.log('🔐 Login attempt with:', credentials.username)
      
      const response = await api.post('/login/', credentials)
      const data = response.data
      
      console.log('✅ Login response:', data)
      
      if (!data.token) {
        throw new Error('No token received')
      }

      // Save to localStorage
      localStorage.setItem('authToken', data.token)
      console.log('💾 Token saved')

      // Set user
      const userData = {
        id: data.user_id,
        email: data.email,
        username: data.username || credentials.username,
        first_name: data.first_name || '',
        last_name: data.last_name || '',
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

  // Add register function
  const register = async (data: RegisterData) => {
    try {
      console.log('📝 Register attempt for:', data.username)
      
      const response = await api.post('/register/', data)
      const responseData = response.data
      
      console.log('✅ Register response:', responseData)
      
      // If registration returns token (auto-login)
      if (responseData.token) {
        localStorage.setItem('authToken', responseData.token)
        
        if (responseData.user) {
          setUser({
            id: responseData.user.id,
            email: responseData.user.email,
            username: responseData.user.username || data.username,
            first_name: responseData.user.first_name || '',
            last_name: responseData.user.last_name || '',
          })
        }
        
        router.push('/dashboard')
      }
      // If no token, just return success - the page will redirect to login
      
    } catch (error) {
      console.error('❌ Registration failed:', error)
      throw error
    }
  }

  const logout = () => {
    console.log('👋 Logging out')
    localStorage.removeItem('authToken')
    localStorage.removeItem('user')
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
        register,  // Add register to provider
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