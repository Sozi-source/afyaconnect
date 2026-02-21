'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/app/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { DashboardHeader } from '@/app/components/dashboard/DashboardHeader'
import { DashboardSidebar } from '@/app/components/dashboard/DashboardSidebar'
import { DashboardMobileNav } from '@/app/components/dashboard/DashboardMobileNav'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const { isAuthenticated, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login')
    }
  }, [isLoading, isAuthenticated, router])

  if (!mounted || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-emerald-200 border-t-emerald-600"></div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Desktop Sidebar */}
      <DashboardSidebar 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)} 
      />

      {/* Main Content */}
      <div className="lg:pl-64">
        {/* Header */}
        <DashboardHeader onMenuClick={() => setSidebarOpen(true)} />

        {/* Page Content */}
        <main className="min-h-screen pt-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
            {children}
          </div>
        </main>

        {/* Mobile Bottom Navigation */}
        <DashboardMobileNav />
      </div>
    </div>
  )
}