'use client'

import { useEffect } from 'react'
import { useAuth } from '@/app/contexts/AuthContext'
import { useRouter, usePathname } from 'next/navigation'

interface ProtectedRouteProps {
  children: React.ReactNode
  allowedRoles?: Array<'client' | 'practitioner' | 'admin'>
}

export default function ProtectedRoute({ children, allowedRoles = ['client', 'practitioner', 'admin'] }: ProtectedRouteProps) {
  const { user, isLoading, isAuthenticated } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (!isLoading) {
      // Not authenticated - redirect to login
      if (!isAuthenticated) {
        console.log(`🔒 Not authenticated, redirecting from ${pathname} to /login`)
        router.push('/login')
        return
      }

      // Check role-based access
      if (user) {
        const userRole = user.is_staff ? 'admin' : user.role || 'client'
        
        // Admin can access everything
        if (userRole === 'admin') return

        // Check if user's role is allowed for this route
        if (!allowedRoles.includes(userRole as any)) {
          console.log(`🚫 Role ${userRole} not allowed on ${pathname}`)
          
          // Redirect to appropriate dashboard
          if (userRole === 'client') {
            router.push('/client/dashboard')
          } else if (userRole === 'practitioner') {
            router.push('/practitioner/dashboard')
          }
        }
      }
    }
  }, [isLoading, isAuthenticated, user, router, pathname, allowedRoles])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-emerald-200 border-t-emerald-600"></div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  return <>{children}</>
}