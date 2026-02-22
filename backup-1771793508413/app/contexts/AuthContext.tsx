'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { apiClient } from '@/app/lib/api'
import api from '@/app/lib/api/client'
import type { User, UserProfile } from '@/app/types'

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
  redirectToRoleDashboard: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  // Helper function to redirect based on user role
  const redirectToRoleDashboard = () => {
    if (!user) {
      console.log('⚠️ No user found, redirecting to login')
      router.push('/login')
      return
    }

    const role = user.role || 'client'
    console.log('🚀 Redirecting based on role:', { role, isVerified: user.is_verified, isStaff: user.is_staff })

    // Admin users go to admin dashboard
    if (user.is_staff) {
      console.log('👑 Admin user redirecting to /admin')
      router.push('/admin')
      return
    }

    // Practitioners go to practitioner dashboard (even if unverified)
    if (role === 'practitioner') {
      console.log('👨‍⚕️ Practitioner redirecting to /practitioner/dashboard')
      router.push('/practitioner/dashboard')
      return
    }

    // Clients go to client dashboard
    console.log('👤 Client redirecting to /client/dashboard')
    router.push('/client/dashboard')
  }

  // Check for existing session on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('authToken')
        console.log('🔍 Check auth - token:', token ? 'Present' : 'Missing', new Date().toISOString())

        if (token) {
          api.defaults.headers.common['Authorization'] = `Token ${token}`
          console.log('✅ Default Authorization header set from stored token')

          // Try to get stored user data first
          const storedUser = localStorage.getItem('user')
          if (storedUser) {
            try {
              const parsedUser = JSON.parse(storedUser) as User
              setUser(parsedUser)
              console.log('📦 Loaded user from localStorage:', parsedUser)
            } catch (e) {
              console.error('❌ Failed to parse stored user:', e)
            }
          }

          // Then verify with server and get fresh data
          try {
            await refreshUserProfile()
          } catch (error) {
            console.log('❌ Profile fetch failed, clearing token at:', new Date().toISOString())
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

  // Refresh user profile from server
  const refreshUserProfile = async (): Promise<User | null> => {
    try {
      console.log('🔄 Refreshing user profile...')
      const response = await apiClient.auth.getProfile()
      console.log('✅ Profile refreshed:', response)
      
      // Extract role from profile if available
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
          phone: response.profile.phone || undefined // Convert null to undefined
        } : undefined
      }
      
      setUser(userData)
      localStorage.setItem('user', JSON.stringify(userData))
      console.log('💾 User data saved to localStorage:', userData)
      
      return userData
    } catch (error) {
      console.error('❌ Failed to refresh profile:', error)
      return null
    }
  }

  // Update user role (useful after admin changes role)
  const updateUserRole = async (newRole: 'client' | 'practitioner') => {
    if (!user) return
    
    const updatedUser = { ...user, role: newRole }
    setUser(updatedUser)
    localStorage.setItem('user', JSON.stringify(updatedUser))
    console.log(`🔄 User role updated to: ${newRole}`)
    
    // Optionally refresh from server to confirm
    await refreshUserProfile()
  }

  const login = async (credentials: LoginCredentials) => {
    try {
      console.log('🔐 Login attempt with:', credentials.username)
      
      const response = await apiClient.auth.login({
        email: credentials.username,
        password: credentials.password
      }) as AuthResponse
      
      console.log('✅ Login response:', response)
      
      if (!response.token) {
        throw new Error('No token received')
      }

      localStorage.setItem('authToken', response.token)
      console.log('💾 Token saved to localStorage:', response.token.substring(0, 10) + '...')

      api.defaults.headers.common['Authorization'] = `Token ${response.token}`
      console.log('✅ Default Authorization header set globally')

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
      console.log('💾 User data saved:', userData)

      // 🎯 Redirect to role-specific dashboard
      setTimeout(() => {
        if (userData.is_staff) {
          console.log('👑 Admin user redirecting to /admin')
          router.push('/admin')
        } else if (userData.role === 'practitioner') {
          console.log('👨‍⚕️ Practitioner redirecting to /practitioner/dashboard')
          router.push('/practitioner/dashboard')
        } else {
          console.log('👤 Client redirecting to /client/dashboard')
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
      }) as AuthResponse
      
      console.log('✅ Register response:', response)
      
      if (response.token) {
        localStorage.setItem('authToken', response.token)
        
        api.defaults.headers.common['Authorization'] = `Token ${response.token}`
        console.log('✅ Default Authorization header set from registration')
        
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
        console.log('💾 User data saved:', userData)
        
        // 🎯 Redirect to role-specific dashboard
        setTimeout(() => {
          if (data.role === 'practitioner') {
            console.log('👨‍⚕️ New practitioner redirecting to /practitioner/dashboard')
            router.push('/practitioner/dashboard')
          } else {
            console.log('👤 New client redirecting to /client/dashboard')
            router.push('/client/dashboard')
          }
        }, 100)
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
        refreshUserProfile,
        updateUserRole,
        redirectToRoleDashboard,
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