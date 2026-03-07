// app/client/dashboard/layout.tsx
'use client'

import { useState, useEffect } from 'react'
import { DashboardSidebar } from '@/app/components/dashboard/DashboardSidebar'
import { DashboardHeader } from '@/app/components/dashboard/DashboardHeader'
import { DashboardMobileNav } from '@/app/components/dashboard/DashboardMobileNav'
import ProtectedRoute from '@/app/components/ProtectedRoute'
import { AuthProvider, useAuth } from '@/app/contexts/AuthContext'

// Inner component that uses useAuth
function ClientDashboardContent({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isMounted, setIsMounted] = useState(false)
  const { user, isLoading } = useAuth()

  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Log auth state changes
  useEffect(() => {
    console.log('📊 ClientLayout - Auth state:', { 
      isLoading, 
      hasUser: !!user,
      userRole: user?.role,
      isMounted 
    })
  }, [isLoading, user, isMounted])

  // Show loading spinner while initial auth check happens
  if (isLoading || !isMounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-200 border-t-primary-600"></div>
          <p className="text-sm text-neutral-500">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  // Wait for user to be available
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-200 border-t-primary-600"></div>
          <p className="text-sm text-neutral-500">Loading your profile...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardSidebar 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)} 
      />
      
      <div className="lg:pl-72 flex flex-col min-h-screen">
        <DashboardHeader onMenuClick={() => setSidebarOpen(true)} />
        
        <main className="flex-1 pt-16 lg:pt-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
            <ProtectedRoute allowedRoles={['client', 'admin']}>
              {children}
            </ProtectedRoute>
          </div>
        </main>
        
        <DashboardMobileNav />
      </div>
    </div>
  )
}

// Main layout component that provides AuthProvider
export default function ClientDashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AuthProvider>
      <ClientDashboardContent>
        {children}
      </ClientDashboardContent>
    </AuthProvider>
  )
}