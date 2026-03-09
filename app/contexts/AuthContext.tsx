'use client'

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react'
import { apiClient } from '@/app/lib/api'
import api from '@/app/lib/api/client'
import type { User, UserProfile, AuthResponse } from '@/app/types/index'

// ==================== Type Definitions ====================

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

interface AuthContextType {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (credentials: LoginCredentials) => Promise<void>
  register: (data: RegisterData) => Promise<void>
  logout: () => void
  refreshUserProfile: () => Promise<User | null>
  updateUserRole: (newRole: 'client' | 'practitioner') => Promise<void>
  refreshUser: () => Promise<User | null>
}

// ==================== Constants ====================

const DASHBOARD_ROUTES = {
  admin: '/admin',
  practitioner: '/practitioner/dashboard',
  client: '/client/dashboard',
} as const

// ==================== Contexts ====================

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// ==================== AuthProvider ====================

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const initialLoadRef = useRef<boolean>(true)
  const redirectTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const mountedRef = useRef<boolean>(true)

  // ==================== Utilities ====================

  const clearRedirectTimeout = useCallback(() => {
    if (redirectTimeoutRef.current) {
      clearTimeout(redirectTimeoutRef.current)
      redirectTimeoutRef.current = null
    }
  }, [])

  const redirectToDashboard = useCallback(
    (userData: User) => {
      clearRedirectTimeout()

      const route = userData.is_staff
        ? DASHBOARD_ROUTES.admin
        : userData.role === 'practitioner'
        ? DASHBOARD_ROUTES.practitioner
        : DASHBOARD_ROUTES.client

      redirectTimeoutRef.current = setTimeout(() => {
        if (mountedRef.current) {
          window.location.href = route
        }
      }, 200)
    },
    [clearRedirectTimeout]
  )

  const extractUserFromResponse = useCallback(
    (response: AuthResponse): User | null => {
      try {
        if (response.user && response.user_id) {
          return {
            id: response.user_id,
            email: response.user.email,
            first_name: response.user.first_name || '',
            last_name: response.user.last_name || '',
            role: (response.user.role || 'client') as 'client' | 'practitioner',
            is_verified: response.user.is_verified || false,
            is_staff: response.user.is_staff || false,
            practitioner: response.user.practitioner,
            profile: response.user.profile
              ? {
                  id: response.user.profile.id,
                  role: response.user.profile.role,
                  phone: response.user.profile.phone || undefined,
                  user: response.user_id,
                }
              : undefined,
          }
        }

        if (response.user_id && response.email) {
          return {
            id: response.user_id,
            email: response.email,
            first_name: response.first_name || '',
            last_name: response.last_name || '',
            role: (response.role || 'client') as 'client' | 'practitioner',
            is_verified: response.is_verified || false,
            is_staff: response.is_staff || false,
            practitioner: response.practitioner,
            profile: response.profile
              ? {
                  id: response.profile.id,
                  role: response.profile.role,
                  phone: response.profile.phone || undefined,
                  user: response.user_id,
                }
              : undefined,
          }
        }

        if (response.token) return null

        return null
      } catch (error) {
        console.error('🔧 Error extracting user:', error)
        return null
      }
    },
    []
  )

  // ==================== Auth Actions ====================

  const refreshUserProfile = useCallback(async (): Promise<User | null> => {
    try {
      const response = await apiClient.auth.getProfile()

      const userRole = response.role || response.profile?.role || 'client'

      const profile: UserProfile | undefined = response.profile
        ? {
            id: response.profile.id,
            role: response.profile.role as 'client' | 'practitioner',
            phone: response.profile.phone || undefined,
            user: response.id,
          }
        : undefined

      let practitionerData = response.practitioner

      if (userRole === 'practitioner' && !practitionerData?.id) {
        try {
          const practitionerResponse = await api.get('/practitioners/me/')
          practitionerData = practitionerResponse.data?.id
            ? { id: practitionerResponse.data.id }
            : undefined
        } catch {
          practitionerData = undefined
        }
      }

      const userData: User = {
        id: response.id,
        email: response.email,
        first_name: response.first_name || '',
        last_name: response.last_name || '',
        role: userRole as 'client' | 'practitioner',
        is_verified: response.is_verified || false,
        is_staff: response.is_staff || false,
        practitioner: practitionerData,
        profile,
      }

      setUser(userData)
      localStorage.setItem('user', JSON.stringify(userData))
      return userData
    } catch (error) {
      console.error('❌ Failed to refresh profile:', error)
      return null
    }
  }, [])

  const refreshUser = useCallback(async (): Promise<User | null> => {
    const userData = await refreshUserProfile()
    if (userData && typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('user-refreshed', { detail: { user: userData } })
      )
    }
    return userData
  }, [refreshUserProfile])

  const login = useCallback(
    async (credentials: LoginCredentials) => {
      try {
        setIsLoading(true)

        const maxAttempts = 2
        let lastError: Error | null = null

        for (let attempt = 1; attempt <= maxAttempts; attempt++) {
          try {
            const response = (await apiClient.auth.login({
              email: credentials.username,
              password: credentials.password,
            })) as AuthResponse

            if (!response.token) throw new Error('No token received from server')

            localStorage.setItem('authToken', response.token)
            api.defaults.headers.common['Authorization'] = `Token ${response.token}`

            let userData = extractUserFromResponse(response)

            if (userData) {
              setUser(userData)
              localStorage.setItem('user', JSON.stringify(userData))
              await new Promise((r) => setTimeout(r, 200))
              redirectToDashboard(userData)
            } else {
              userData = await refreshUserProfile()
              if (userData) {
                redirectToDashboard(userData)
              } else {
                throw new Error('Failed to fetch user profile')
              }
            }

            return
          } catch (error) {
            lastError = error as Error
            if (attempt < maxAttempts) {
              await new Promise((r) => setTimeout(r, 1000))
            }
          }
        }

        throw lastError || new Error('Login failed after multiple attempts')
      } catch (error) {
        localStorage.removeItem('authToken')
        localStorage.removeItem('user')
        delete api.defaults.headers.common['Authorization']
        setUser(null)
        throw error
      } finally {
        setIsLoading(false)
      }
    },
    [extractUserFromResponse, refreshUserProfile, redirectToDashboard]
  )

  const register = useCallback(
    async (data: RegisterData) => {
      try {
        setIsLoading(true)

        const cleanPayload = Object.fromEntries(
          Object.entries(data).filter(([_, v]) => v !== undefined)
        ) as RegisterData

        const response = (await apiClient.auth.register(cleanPayload)) as AuthResponse

        if (!response.token) throw new Error('No token received from server')

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
          practitioner: response.practitioner,
          profile: response.profile
            ? {
                id: response.profile.id,
                role: response.profile.role,
                phone: response.profile.phone || undefined,
                user: response.user_id,
              }
            : undefined,
        }

        setUser(userData)
        localStorage.setItem('user', JSON.stringify(userData))
        await new Promise((r) => setTimeout(r, 200))
        redirectToDashboard(userData)
      } catch (error) {
        localStorage.removeItem('authToken')
        localStorage.removeItem('user')
        delete api.defaults.headers.common['Authorization']
        setUser(null)
        throw error
      } finally {
        setIsLoading(false)
      }
    },
    [redirectToDashboard]
  )

  const updateUserRole = useCallback(
    async (newRole: 'client' | 'practitioner') => {
      if (!user) return

      const updatedUser: User = {
        ...user,
        role: newRole,
        practitioner: user.practitioner,
        profile: user.profile ? { ...user.profile, role: newRole } : undefined,
      }

      setUser(updatedUser)
      localStorage.setItem('user', JSON.stringify(updatedUser))
      redirectToDashboard(updatedUser)
      refreshUserProfile().catch(console.error)
    },
    [user, redirectToDashboard, refreshUserProfile]
  )

  const logout = useCallback(() => {
    clearRedirectTimeout()
    localStorage.removeItem('authToken')
    localStorage.removeItem('user')
    delete api.defaults.headers.common['Authorization']
    setUser(null)
    window.location.href = '/login'
  }, [clearRedirectTimeout])

  // ==================== Initialization ====================

  useEffect(() => {
    mountedRef.current = true

    const initializeAuth = async () => {
      try {
        const token = localStorage.getItem('authToken')
        if (!token) {
          if (mountedRef.current) setIsLoading(false)
          return
        }

        api.defaults.headers.common['Authorization'] = `Token ${token}`

        const storedUser = localStorage.getItem('user')
        if (storedUser && mountedRef.current) {
          try {
            setUser(JSON.parse(storedUser) as User)
          } catch {
            localStorage.removeItem('user')
          }
        }

        await refreshUserProfile()
      } catch {
        if (mountedRef.current) {
          localStorage.removeItem('authToken')
          localStorage.removeItem('user')
          delete api.defaults.headers.common['Authorization']
        }
      } finally {
        if (mountedRef.current) {
          setIsLoading(false)
          initialLoadRef.current = false
        }
      }
    }

    initializeAuth()

    return () => {
      mountedRef.current = false
      clearRedirectTimeout()
    }
  }, [refreshUserProfile, clearRedirectTimeout])

  // ==================== Render ====================

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
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

// ==================== useAuth ====================

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}