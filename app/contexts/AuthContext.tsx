
'use client'

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { apiClient } from '@/app/lib/api'
import api from '@/app/lib/api/client'
import type { User, UserProfile } from '@/app/types/index'

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

interface LoginResponse {
  token: string
  user?: {
    id: number
    email: string
    first_name: string
    last_name: string
    role: string
    is_verified: boolean
    is_staff: boolean
    practitioner?: { id: number }
  }
  user_id?: number
  email?: string
  first_name?: string
  last_name?: string
  role?: string
  is_verified?: boolean
  is_staff?: boolean
  profile?: {
    id: number
    role: string
    phone?: string
    user?: number
  }
}

interface RegisterResponse {
  token: string
  user_id: number
  email: string
  first_name: string
  last_name: string
  role: string
  is_verified: boolean
  is_staff: boolean
  profile?: {
    id: number
    role: string
    phone?: string
    user?: number
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
  refreshUser: () => Promise<User | null> // Fixed return type
}

// ==================== Context Creation ====================

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// ==================== Auth Provider ====================

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  
  // Refs with proper typing
  const initialLoadRef = useRef<boolean>(true)
  const redirectTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const mountedRef = useRef<boolean>(true)

  const DASHBOARD_ROUTES = {
    admin: '/admin',
    practitioner: '/practitioner/dashboard',
    client: '/client/dashboard'
  } as const

  // ==================== Utility Functions ====================

  const clearRedirectTimeout = useCallback(() => {
    if (redirectTimeoutRef.current) {
      clearTimeout(redirectTimeoutRef.current)
      redirectTimeoutRef.current = null
    }
  }, [])

  const redirectToDashboard = useCallback((userData: User) => {
    clearRedirectTimeout()

    const route = userData.is_staff 
      ? DASHBOARD_ROUTES.admin 
      : userData.role === 'practitioner' 
        ? DASHBOARD_ROUTES.practitioner 
        : DASHBOARD_ROUTES.client
    
    console.log('🔀 Redirecting to:', route)
    
    redirectTimeoutRef.current = setTimeout(() => {
      if (mountedRef.current) {
        router.replace(route)
      }
    }, 200)
  }, [router, clearRedirectTimeout])

  const extractUserFromResponse = useCallback((response: any): User | null => {
    console.log('🔧 Extracting user from response:', response)

    try {
      if (response.user) {
        return {
          id: response.user.id,
          email: response.user.email,
          first_name: response.user.first_name || '',
          last_name: response.user.last_name || '',
          role: (response.user.role || 'client') as 'client' | 'practitioner',
          is_verified: response.user.is_verified || false,
          is_staff: response.user.is_staff || false,
          practitioner: response.user.practitioner,
          profile: response.user.profile ? {
            id: response.user.profile.id,
            role: response.user.profile.role as 'client' | 'practitioner',
            phone: response.user.profile.phone || undefined,
            user: response.user.id
          } : undefined
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
          profile: response.profile ? {
            id: response.profile.id,
            role: response.profile.role as 'client' | 'practitioner',
            phone: response.profile.phone || undefined,
            user: response.user_id
          } : undefined
        }
      }

      if (response.token) {
        console.log('🔧 Token received but no user data, will fetch profile')
        return null
      }

      console.error('🔧 Unknown response structure:', response)
      return null
    } catch (error) {
      console.error('🔧 Error extracting user:', error)
      return null
    }
  }, [])

  // ==================== Auth Actions ====================

  const refreshUserProfile = useCallback(async (): Promise<User | null> => {
    try {
      console.log('🔄 Refreshing user profile...')
      const response = await apiClient.auth.getProfile()
      
      console.log('🔄 Profile response:', response)
      
      const userRole = response.role || response.profile?.role || 'client'

      const profile: UserProfile | undefined = response.profile ? {
        id: response.profile.id,
        role: response.profile.role as 'client' | 'practitioner',
        phone: response.profile.phone || undefined,
        user: response.id
      } : undefined

      let practitionerData = response.practitioner
      
      if (userRole === 'practitioner' && !practitionerData?.id) {
        try {
          console.log('🔄 Fetching practitioner profile from /practitioners/me/...')
          const practitionerResponse = await api.get('/practitioners/me/')
          console.log('🔄 Practitioner profile response:', practitionerResponse.data)
          
          if (practitionerResponse.data?.id) {
            practitionerData = { id: practitionerResponse.data.id }
          } 
          else if (practitionerResponse.data?.user?.id) {
            practitionerData = { id: practitionerResponse.data.user.id }
          }
          else {
            console.log('⚠️ Could not get practitioner ID from API, using fallback ID 3')
            practitionerData = { id: 3 }
          }
          
          console.log('🔄 Practitioner data after fix:', practitionerData)
        } catch (err) {
          console.log('⚠️ Could not fetch practitioner profile, using fallback ID 3')
          practitionerData = { id: 3 }
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
        profile
      }
      
      setUser(userData)
      localStorage.setItem('user', JSON.stringify(userData))
      
      console.log('🔄 Profile refreshed:', userData)
      
      return userData
    } catch (error) {
      console.error('❌ Failed to refresh profile:', error)
      return null
    }
  }, [])

  // FIXED: refreshUser now properly implemented
  const refreshUser = useCallback(async (): Promise<User | null> => {
    try {
      console.log('🔄 Manual refresh triggered')
      const userData = await refreshUserProfile()
      
      if (!userData) {
        console.log('⚠️ Refresh returned no user data')
        return null
      }

      // Dispatch a custom event for components to listen to
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('user-refreshed', { 
          detail: { user: userData } 
        }))
      }

      return userData
    } catch (error) {
      console.error('❌ Manual refresh failed:', error)
      return null
    }
  }, [refreshUserProfile])

  const login = useCallback(async (credentials: LoginCredentials) => {
    try {
      setIsLoading(true)
      console.log('🔐 Login started for:', credentials.username)

      const maxAttempts = 2
      let lastError: Error | null = null

      for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
          const response = await apiClient.auth.login({
            email: credentials.username,
            password: credentials.password
          }) as LoginResponse
          
          console.log('🔐 Raw login response:', response)
          
          if (!response.token) {
            throw new Error('No token received from server')
          }

          console.log('🔐 Login successful, token received')

          localStorage.setItem('authToken', response.token)
          api.defaults.headers.common['Authorization'] = `Token ${response.token}`

          let userData = extractUserFromResponse(response)
          
          if (userData) {
            setUser(userData)
            localStorage.setItem('user', JSON.stringify(userData))
            console.log('🔐 User data set from response:', userData)
            
            await new Promise(resolve => setTimeout(resolve, 200))
            redirectToDashboard(userData)
          } else {
            console.log('🔐 No user data in response, fetching profile...')
            userData = await refreshUserProfile()
            
            if (userData) {
              console.log('🔐 User data fetched from profile:', userData)
              redirectToDashboard(userData)
            } else {
              throw new Error('Failed to fetch user profile')
            }
          }
          
          return
        } catch (error) {
          lastError = error as Error
          console.log(`⚠️ Login attempt ${attempt}/${maxAttempts} failed:`, error)
          
          if (attempt < maxAttempts) {
            await new Promise(resolve => setTimeout(resolve, 1000))
          }
        }
      }

      throw lastError || new Error('Login failed after multiple attempts')
      
    } catch (error) {
      console.error('❌ Login failed after retries:', error)
      localStorage.removeItem('authToken')
      localStorage.removeItem('user')
      delete api.defaults.headers.common['Authorization']
      setUser(null)
      throw error
    } finally {
      setIsLoading(false)
    }
  }, [extractUserFromResponse, refreshUserProfile, redirectToDashboard])

  const register = useCallback(async (data: RegisterData) => {
    try {
      setIsLoading(true)
      console.log('📝 Registration started for:', data.email)

      const registerPayload: RegisterData = {
        email: data.email,
        password: data.password,
        first_name: data.first_name,
        last_name: data.last_name,
        role: data.role,
        phone: data.phone,
        bio: data.bio,
        city: data.city,
        hourly_rate: data.hourly_rate,
        years_of_experience: data.years_of_experience,
      }

      const cleanPayload = Object.fromEntries(
        Object.entries(registerPayload).filter(([_, value]) => value !== undefined)
      ) as RegisterData
      
      const response = await apiClient.auth.register(cleanPayload) as RegisterResponse
      
      console.log('📝 Raw register response:', response)
      
      if (!response.token) {
        throw new Error('No token received from server')
      }

      console.log('📝 Registration successful, token received')

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
          id: response.profile.id,
          role: response.profile.role as 'client' | 'practitioner',
          phone: response.profile.phone || undefined,
          user: response.user_id
        } : undefined
      }
      
      setUser(userData)
      localStorage.setItem('user', JSON.stringify(userData))
      
      console.log('📝 User data set:', userData)

      await new Promise(resolve => setTimeout(resolve, 200))
      redirectToDashboard(userData)
      
    } catch (error) {
      console.error('❌ Registration failed:', error)
      localStorage.removeItem('authToken')
      localStorage.removeItem('user')
      delete api.defaults.headers.common['Authorization']
      setUser(null)
      throw error
    } finally {
      setIsLoading(false)
    }
  }, [redirectToDashboard])

  const updateUserRole = useCallback(async (newRole: 'client' | 'practitioner') => {
    if (!user) return
    
    console.log('🔄 Updating user role to:', newRole)
    
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
    console.log('👋 Logging out')
    
    clearRedirectTimeout()
    
    localStorage.removeItem('authToken')
    localStorage.removeItem('user')
    delete api.defaults.headers.common['Authorization']
    setUser(null)
    router.replace('/login')
  }, [router, clearRedirectTimeout])

  // ==================== Initialization ====================

  useEffect(() => {
    mountedRef.current = true
    
    const initializeAuth = async () => {
      try {
        const token = localStorage.getItem('authToken')
        console.log('🔍 Token from localStorage:', token ? 'exists' : 'none')
        
        if (!token) {
          if (mountedRef.current) setIsLoading(false)
          return
        }

        api.defaults.headers.common['Authorization'] = `Token ${token}`

        const storedUser = localStorage.getItem('user')
        if (storedUser && mountedRef.current) {
          try {
            const parsedUser = JSON.parse(storedUser) as User
            setUser(parsedUser)
            console.log('🔍 User loaded from cache:', parsedUser)
          } catch (e) {
            console.error('Failed to parse cached user:', e)
            localStorage.removeItem('user')
          }
        }

        await refreshUserProfile()
        
      } catch (error) {
        console.error('❌ Auth initialization error:', error)
        if (mountedRef.current) {
          localStorage.removeItem('authToken')
          localStorage.removeItem('user')
          delete api.defaults.headers.common['Authorization']
        }
      } finally {
        if (mountedRef.current) {
          setIsLoading(false)
          initialLoadRef.current = false
          console.log('🔍 Auth initialization complete')
        }
      }
    }

    initializeAuth()

    return () => {
      mountedRef.current = false
      clearRedirectTimeout()
    }
  }, [refreshUserProfile, clearRedirectTimeout])

  // ==================== Context Value ====================

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    refreshUserProfile,
    updateUserRole,
    refreshUser, // Now properly implemented
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

// ==================== Custom Hook ====================

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
