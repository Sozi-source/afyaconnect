// app/client/dashboard/layout.tsx

'use client'

import { useState } from 'react'
import { ClientSidebar } from '@/app/components/dashboard/ClientSidebar'
import { DashboardHeader } from '@/app/components/dashboard/DashboardHeader'
import { DashboardMobileNav } from '@/app/components/dashboard/DashboardMobileNav'
import ProtectedRoute from '@/app/components/ProtectedRoute'
import { useAuth } from '@/app/contexts/AuthContext'

export default function ClientDashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { isLoading, isAuthenticated } = useAuth()

  // Show loading spinner while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-emerald-200 border-t-emerald-600"></div>
          <p className="text-sm text-gray-600 dark:text-gray-400">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  // Don't render anything if not authenticated (ProtectedRoute will handle redirect)
  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <ClientSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <div className="lg:pl-64 flex flex-col min-h-screen">
        <DashboardHeader onMenuClick={() => setSidebarOpen(true)} />
        
        <main className="flex-1 pt-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
            <ProtectedRoute allowedRoles={['client']}>
              {children}
            </ProtectedRoute>
          </div>
        </main>
        
        <DashboardMobileNav />
      </div>
    </div>
  )
}