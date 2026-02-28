'use client'

import { useEffect } from 'react'
import { useAuth } from '@/app/contexts/AuthContext'
import { useRouter, usePathname } from 'next/navigation'

interface ProtectedRouteProps {
  children: React.ReactNode
  allowedRoles?: Array<'client' | 'practitioner' | 'admin'>
}

export default function ProtectedRoute({ 
  children, 
  allowedRoles = ['client', 'practitioner', 'admin'] 
}: ProtectedRouteProps) {
  const { user, isLoading, isAuthenticated } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    // Log state for debugging
    console.log('🛡️ ProtectedRoute - State:', {
      isLoading,
      isAuthenticated,
      user: user ? { role: user.role, is_staff: user.is_staff } : null,
      pathname,
      allowedRoles
    })

    // Don't do anything while loading
    if (isLoading) return

    // Not authenticated - redirect to login
    if (!isAuthenticated) {
      console.log(`🔒 Not authenticated, redirecting from ${pathname} to /login`)
      router.replace('/login')
      return
    }

    // If we have user, check role access
    if (user) {
      const userRole = user.is_staff ? 'admin' : (user.role || 'client')
      
      // Admin can access everything
      if (userRole === 'admin') return

      // Check if user's role is allowed for this route
      if (!allowedRoles.includes(userRole as any)) {
        console.log(`🚫 Role ${userRole} not allowed on ${pathname}`)
        
        // Redirect to appropriate dashboard
        const redirectPath = userRole === 'client' 
          ? '/client/dashboard' 
          : userRole === 'practitioner' 
            ? '/practitioner/dashboard' 
            : '/login'
        
        router.replace(redirectPath)
      }
    }
  }, [isLoading, isAuthenticated, user, router, pathname, allowedRoles])

  // Show loading spinner while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-emerald-200 border-t-emerald-600"></div>
      </div>
    )
  }

  // If not authenticated, don't render anything (redirect will happen)
  if (!isAuthenticated) {
    return null
  }

  // If we have user, check role access before rendering
  if (user) {
    const userRole = user.is_staff ? 'admin' : user.role
    
    // Allow access if role is in allowedRoles OR user is admin
    if (allowedRoles.includes(userRole as any) || user.is_staff) {
      return <>{children}</>
    }
    
    // Don't render if role not allowed (redirect will happen in useEffect)
    return null
  }

  // If we get here, user is null but authenticated? This shouldn't happen
  return null
}