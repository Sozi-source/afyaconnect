'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { apiClient } from '@/app/lib/api'
import api from '@/app/lib/api/client'
import type { User, UserProfile } from '@/app/types'

interface LoginCredentials {
  username: string  // This stays for login (maps to email)
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

interface AuthResponse {
  token: string
  user_id: number
  email: string
  first_name: string
  last_name: string
  role: string
  is_practitioner: boolean
  is_verified: boolean
  is_staff: boolean
  profile?: UserProfile
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (credentials: LoginCredentials) => Promise<void>
  register: (data: RegisterData) => Promise<void>
  logout: () => void
  refreshUserProfile: () => Promise<User | null>
  updateUserRole: (newRole: 'client' | 'practitioner') => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  // Define dashboard routes
  const DASHBOARD_ROUTES = {
    admin: '/admin',
    practitioner: '/practitioner/dashboard',
    client: '/client/dashboard'
  }

  // Redirect based on user role
  const redirectToDashboard = (userData: User) => {
    if (userData.is_staff) {
      router.push(DASHBOARD_ROUTES.admin)
    } else if (userData.role === 'practitioner') {
      router.push(DASHBOARD_ROUTES.practitioner)
    } else {
      router.push(DASHBOARD_ROUTES.client)
    }
  }

  // Check for existing session on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('authToken')
        
        if (token) {
          api.defaults.headers.common['Authorization'] = `Token ${token}`

          // Get stored user data
          const storedUser = localStorage.getItem('user')
          if (storedUser) {
            const parsedUser = JSON.parse(storedUser) as User
            setUser(parsedUser)
          }

          // Verify with server
          try {
            await refreshUserProfile()
          } catch (error) {
            localStorage.removeItem('authToken')
            localStorage.removeItem('user')
            delete api.defaults.headers.common['Authorization']
            setUser(null)
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

  // LOGIN FUNCTION - keeps username field (maps to email)
  const login = async (credentials: LoginCredentials) => {
    try {
      const response = await apiClient.auth.login({
        email: credentials.username, // Map username to email
        password: credentials.password
      }) as AuthResponse
      
      if (!response.token) {
        throw new Error('No token received')
      }

      // Store token
      localStorage.setItem('authToken', response.token)
      api.defaults.headers.common['Authorization'] = `Token ${response.token}`

      // Create user data
      const userData: User = {
        id: response.user_id,
        email: response.email,
        first_name: response.first_name,
        last_name: response.last_name,
        role: response.role as 'client' | 'practitioner',
        is_verified: response.is_verified,
        is_staff: response.is_staff,
        profile: response.profile ? {
          ...response.profile,
          phone: response.profile.phone || undefined
        } : undefined
      }
      
      // Save user and redirect
      setUser(userData)
      localStorage.setItem('user', JSON.stringify(userData))
      
      // Redirect based on role
      redirectToDashboard(userData)
      
    } catch (error) {
      console.error('❌ Login failed:', error)
      throw error
    }
  }

  // FIXED REGISTER FUNCTION - NO USERNAME FIELD
  const register = async (data: RegisterData) => {
    try {
      // Prepare registration payload - NO USERNAME FIELD
      const registerPayload: any = {
        email: data.email,
        password: data.password,
        first_name: data.first_name,
        last_name: data.last_name,
        role: data.role,
      }

      // Add phone if provided
      if (data.phone) {
        registerPayload.phone = data.phone
      }

      // Add practitioner fields if applicable
      if (data.role === 'practitioner') {
        if (data.bio) registerPayload.bio = data.bio
        if (data.city) registerPayload.city = data.city
        if (data.hourly_rate) registerPayload.hourly_rate = data.hourly_rate
        if (data.years_of_experience) registerPayload.years_of_experience = data.years_of_experience
        // Add default currency for practitioners
        registerPayload.currency = 'KES'
      }

      console.log('📤 Register payload:', registerPayload)
      
      const response = await apiClient.auth.register(registerPayload) as AuthResponse
      
      if (response.token) {
        localStorage.setItem('authToken', response.token)
        api.defaults.headers.common['Authorization'] = `Token ${response.token}`
        
        const userData: User = {
          id: response.user_id,
          email: response.email,
          first_name: response.first_name,
          last_name: response.last_name,
          role: response.role as 'client' | 'practitioner',
          is_verified: response.is_verified,
          is_staff: response.is_staff,
          profile: response.profile ? {
            ...response.profile,
            phone: response.profile.phone || undefined
          } : undefined
        }
        
        setUser(userData)
        localStorage.setItem('user', JSON.stringify(userData))
        
        // Redirect based on role
        redirectToDashboard(userData)
      }
      
    } catch (error) {
      console.error('❌ Registration failed:', error)
      throw error
    }
  }

  const refreshUserProfile = async (): Promise<User | null> => {
    try {
      const response = await apiClient.auth.getProfile()
      
      let userRole = response.role
      if (!userRole && response.profile?.role) {
        userRole = response.profile.role
      }

      const userData: User = {
        id: response.id,
        email: response.email,
        first_name: response.first_name || '',
        last_name: response.last_name || '',
        role: userRole as 'client' | 'practitioner' | undefined,
        is_verified: response.is_verified,
        is_staff: response.is_staff,
        profile: response.profile ? {
          ...response.profile,
          phone: response.profile.phone || undefined
        } : undefined
      }
      
      setUser(userData)
      localStorage.setItem('user', JSON.stringify(userData))
      
      return userData
    } catch (error) {
      console.error('❌ Failed to refresh profile:', error)
      return null
    }
  }

  const updateUserRole = async (newRole: 'client' | 'practitioner') => {
    if (!user) return
    
    const updatedUser = { ...user, role: newRole }
    setUser(updatedUser)
    localStorage.setItem('user', JSON.stringify(updatedUser))
    redirectToDashboard(updatedUser)
    await refreshUserProfile()
  }

  const logout = () => {
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
        refreshUserProfile,
        updateUserRole,
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