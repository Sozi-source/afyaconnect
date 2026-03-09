'use client'

import { useEffect, useRef } from 'react'
import { useAuth } from '@/app/contexts/AuthContext'

interface ProtectedRouteProps {
  children: React.ReactNode
  allowedRoles?: Array<'client' | 'practitioner' | 'admin'>
}

const DEFAULT_ROLES: Array<'client' | 'practitioner' | 'admin'> = ['client', 'practitioner', 'admin']

export default function ProtectedRoute({
  children,
  allowedRoles = DEFAULT_ROLES,
}: ProtectedRouteProps) {
  const { user, isLoading, isAuthenticated } = useAuth()
  const allowedRolesRef = useRef(allowedRoles)
  allowedRolesRef.current = allowedRoles

  useEffect(() => {
    if (isLoading) return

    if (!isAuthenticated) {
      window.location.href = '/login'
      return
    }

    if (user) {
      const userRole = user.is_staff ? 'admin' : (user.role ?? 'client')
      if (userRole !== 'admin' && !allowedRolesRef.current.includes(userRole as any)) {
        window.location.href =
          userRole === 'practitioner' ? '/practitioner/dashboard' : '/client/dashboard'
      }
    }
  }, [isLoading, isAuthenticated, user])

  // Always render children — never return null or a spinner here.
  // The layout router requires children to always be mounted.
  // Auth redirects are handled by the useEffect above.
  return <>{children}</>
}