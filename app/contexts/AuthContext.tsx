'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { apiClient } from '@/app/lib/api'
import api from '@/app/lib/api/client'

interface User {
  id: number
  email: string
  first_name?: string
  last_name?: string
  role?: string
  is_verified?: boolean
  is_staff?: boolean
}

interface LoginCredentials {
  username: string  // This will be the email
  password: string
}

interface RegisterData {
  email: string
  password: string
  first_name: string
  last_name: string
  role: 'client' | 'practitioner'
  phone?: string
  bio?: string
  city?: string
  hourly_rate?: number
  years_of_experience?: number
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
          api.defaults.headers.common['Authorization'] = `Token ${token}`
          console.log('✅ Default Authorization header set from stored token')

          try {
            const response = await apiClient.auth.getProfile()
            console.log('✅ Profile fetched:', response)
            
            setUser({
              id: response.id,
              email: response.email,
              first_name: response.first_name || '',
              last_name: response.last_name || '',
              role: response.role,
              is_verified: response.is_verified,
              is_staff: response.is_staff
            })
          } catch (error) {
            console.log('❌ Profile fetch failed, clearing token at:', new Date().toISOString())
            localStorage.removeItem('authToken')
            localStorage.removeItem('user')
            delete api.defaults.headers.common['Authorization']
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
        email: credentials.username,  // Map username to email
        password: credentials.password
      })
      
      console.log('✅ Login response:', response)
      
      if (!response.token) {
        throw new Error('No token received')
      }

      localStorage.setItem('authToken', response.token)
      console.log('💾 Token saved to localStorage:', response.token.substring(0, 10) + '...')

      api.defaults.headers.common['Authorization'] = `Token ${response.token}`
      console.log('✅ Default Authorization header set globally')

      const savedToken = localStorage.getItem('authToken')
      console.log('✅ Verification - token in localStorage:', savedToken ? 'Present' : 'Missing')

      const userData = {
        id: response.user_id,
        email: response.email,
        first_name: response.first_name,
        last_name: response.last_name,
        role: response.role,
        is_verified: response.is_verified,
        is_staff: response.is_staff
      }
      
      setUser(userData)
      localStorage.setItem('user', JSON.stringify(userData))

      // Redirect based on role
      setTimeout(() => {
        console.log('🚀 Redirecting based on role:', response.role)
        if (response.role === 'practitioner') {
          router.push('/practitioner/dashboard')
        } else {
          router.push('/client/dashboard')
        }
      }, 100)
      
    } catch (error) {
      console.error('❌ Login failed:', error)
      throw error
    }
  }

  const register = async (data: RegisterData) => {
    try {
      console.log('📝 Register attempt for:', data.email)
      
      // FIX: Send data directly - no username field needed
      const response = await apiClient.auth.register({
        email: data.email,
        password: data.password,
        first_name: data.first_name,
        last_name: data.last_name,
        role: data.role,
        phone: data.phone,
        ...(data.role === 'practitioner' && {
          bio: data.bio,
          city: data.city,
          hourly_rate: data.hourly_rate,
          years_of_experience: data.years_of_experience
        })
      })
      
      console.log('✅ Register response:', response)
      
      if (response.token) {
        localStorage.setItem('authToken', response.token)
        
        api.defaults.headers.common['Authorization'] = `Token ${response.token}`
        console.log('✅ Default Authorization header set from registration')
        
        const userData = {
          id: response.user_id,
          email: response.email,
          first_name: response.first_name,
          last_name: response.last_name,
          role: response.role,
          is_verified: response.is_verified,
          is_staff: response.is_staff
        }
        
        setUser(userData)
        localStorage.setItem('user', JSON.stringify(userData))
        
        // Redirect based on role
        if (response.role === 'practitioner') {
          router.push('/practitioner/dashboard')
        } else {
          router.push('/client/dashboard')
        }
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
    delete api.defaults.headers.common['Authorization']
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