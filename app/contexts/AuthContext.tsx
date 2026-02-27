'use client'

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { apiClient } from '@/app/lib/api'
import api from '@/app/lib/api/client'
import type { User, UserProfile } from '@/app/types'

interface LoginCredentials {
  username: string
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
  profile?: {
    id: number
    role: string
    phone?: string
    user?: number
    [key: string]: any
  }
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

  const DASHBOARD_ROUTES = {
    admin: '/admin',
    practitioner: '/practitioner/dashboard',
    client: '/client/dashboard'
  }

  const redirectToDashboard = useCallback((userData: User) => {
    setTimeout(() => {
      if (userData.is_staff) {
        router.push(DASHBOARD_ROUTES.admin)
      } else if (userData.role === 'practitioner') {
        router.push(DASHBOARD_ROUTES.practitioner)
      } else {
        router.push(DASHBOARD_ROUTES.client)
      }
    }, 0)
  }, [router])

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('authToken')
        
        if (token) {
          api.defaults.headers.common['Authorization'] = `Token ${token}`

          const storedUser = localStorage.getItem('user')
          if (storedUser) {
            const parsedUser = JSON.parse(storedUser) as User
            setUser(parsedUser)
          }

          refreshUserProfile().catch(console.error)
        }
      } catch (error) {
        console.error('Auth check error:', error)
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [])

  const createUserFromResponse = (response: AuthResponse, userId?: number): User => {
    let profile: UserProfile | undefined = undefined
    
    if (response.profile) {
      profile = {
        id: response.profile.id,
        role: response.profile.role as 'client' | 'practitioner',
        phone: response.profile.phone || undefined,
        user: response.user_id || userId || 0
      }
    }
    
    return {
      id: response.user_id,
      email: response.email,
      first_name: response.first_name,
      last_name: response.last_name,
      role: response.role as 'client' | 'practitioner',
      is_verified: response.is_verified,
      is_staff: response.is_staff,
      profile
    }
  }

  const login = async (credentials: LoginCredentials) => {
    try {
      const response = await apiClient.auth.login({
        email: credentials.username,
        password: credentials.password
      }) as AuthResponse
      
      if (!response.token) {
        throw new Error('No token received')
      }

      localStorage.setItem('authToken', response.token)
      api.defaults.headers.common['Authorization'] = `Token ${response.token}`

      const userData = createUserFromResponse(response)
      
      setUser(userData)
      localStorage.setItem('user', JSON.stringify(userData))
      redirectToDashboard(userData)
      
    } catch (error) {
      console.error('Login failed:', error)
      throw error
    }
  }

  const register = async (data: RegisterData) => {
    try {
      const registerPayload: any = {
        email: data.email,
        password: data.password,
        first_name: data.first_name,
        last_name: data.last_name,
        role: data.role,
      }

      if (data.phone) registerPayload.phone = data.phone
      if (data.role === 'practitioner') {
        if (data.bio) registerPayload.bio = data.bio
        if (data.city) registerPayload.city = data.city
        if (data.hourly_rate) registerPayload.hourly_rate = data.hourly_rate
        if (data.years_of_experience) registerPayload.years_of_experience = data.years_of_experience
        registerPayload.currency = 'KES'
      }
      
      const response = await apiClient.auth.register(registerPayload) as AuthResponse
      
      if (response.token) {
        localStorage.setItem('authToken', response.token)
        api.defaults.headers.common['Authorization'] = `Token ${response.token}`
        
        const userData = createUserFromResponse(response)
        
        setUser(userData)
        localStorage.setItem('user', JSON.stringify(userData))
        redirectToDashboard(userData)
      }
      
    } catch (error) {
      console.error('Registration failed:', error)
      throw error
    }
  }

  const refreshUserProfile = useCallback(async (): Promise<User | null> => {
    try {
      const response = await apiClient.auth.getProfile()
      
      let userRole = response.role
      if (!userRole && response.profile?.role) {
        userRole = response.profile.role
      }

      let profile: UserProfile | undefined = undefined
      
      if (response.profile) {
        profile = {
          id: response.profile.id,
          role: response.profile.role as 'client' | 'practitioner',
          phone: response.profile.phone || undefined,
          user: response.id
        }
      }

      const userData: User = {
        id: response.id,
        email: response.email,
        first_name: response.first_name || '',
        last_name: response.last_name || '',
        role: userRole as 'client' | 'practitioner' | undefined,
        is_verified: response.is_verified,
        is_staff: response.is_staff,
        profile
      }
      
      setUser(userData)
      localStorage.setItem('user', JSON.stringify(userData))
      
      return userData
    } catch (error) {
      console.error('Failed to refresh profile:', error)
      return null
    }
  }, [])

  const updateUserRole = useCallback(async (newRole: 'client' | 'practitioner') => {
    if (!user) return
    
    const updatedUser = { 
      ...user, 
      role: newRole,
      profile: user.profile ? {
        ...user.profile,
        role: newRole
      } : undefined
    }
    
    setUser(updatedUser)
    localStorage.setItem('user', JSON.stringify(updatedUser))
    redirectToDashboard(updatedUser)
    refreshUserProfile().catch(console.error)
  }, [user, redirectToDashboard, refreshUserProfile])

  const logout = useCallback(() => {
    localStorage.removeItem('authToken')
    localStorage.removeItem('user')
    delete api.defaults.headers.common['Authorization']
    setUser(null)
    router.push('/login')
  }, [router])

  const value = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    refreshUserProfile,
    updateUserRole,
  }

  return (
    <AuthContext.Provider value={value}>
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