'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/app/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { ClientSidebar } from '@/app/components/dashboard/ClientSidebar'
import { DashboardHeader } from '@/app/components/dashboard/DashboardHeader'
import { DashboardMobileNav } from '@/app/components/dashboard/DashboardMobileNav'

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { user, isAuthenticated, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login')
    }
    // Redirect if not client
    if (!isLoading && user && user.role !== 'client') {
      router.push(`/${user.role}/dashboard`)
    }
  }, [isLoading, isAuthenticated, user, router])

  if (isLoading) {
    return <div>Loading...</div>
  }

  if (!isAuthenticated || user?.role !== 'client') {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <ClientSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="lg:pl-64">
        <DashboardHeader onMenuClick={() => setSidebarOpen(true)} />
        <main className="min-h-screen pt-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
            {children}
          </div>
        </main>
        <DashboardMobileNav />
      </div>
    </div>
  )
}