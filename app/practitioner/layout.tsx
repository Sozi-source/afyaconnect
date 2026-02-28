// app/practitioner/dashboard/layout.tsx
'use client'

import { useState } from 'react'
import { LazyDashboardSidebar } from '@/app/components/dashboard/LazyDashboardSidebar'
import { LazyDashboardHeader } from '@/app/components/dashboard/LazyDashboardHeader'
import { DashboardMobileNav } from '@/app/components/dashboard/DashboardMobileNav'
import ProtectedRoute from '@/app/components/ProtectedRoute'
import { useAuth } from '@/app/contexts/AuthContext'

export default function PractitionerDashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-200 border-t-primary-600"></div>
          <p className="text-sm text-neutral-500">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <LazyDashboardSidebar 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)} 
      />
      
      <div className="lg:pl-72 flex flex-col min-h-screen">
        <LazyDashboardHeader onMenuClick={() => setSidebarOpen(true)} />
        
        <main className="flex-1 pt-16 lg:pt-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
            <ProtectedRoute allowedRoles={['practitioner', 'admin']}>
              {children}
            </ProtectedRoute>
          </div>
        </main>
        
        <DashboardMobileNav />
      </div>
    </div>
  )
}