'use client'

import { useAuth } from '@/app/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { Header } from '@/app/components/layout/Header'
import { Sidebar } from '@/app/components/layout/Sidebar'
import { MobileNav } from '@/app/components/layout/MobileNav'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { isAuthenticated, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login')
    }
  }, [isAuthenticated, isLoading, router])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header - Your existing Header component */}
      <Header />
      
      {/* Sidebar - Your existing Sidebar component (hidden on mobile) */}
      <Sidebar />
      
      {/* Main content area with proper spacing for sidebar and header */}
      <div className="lg:pl-64 pt-16 lg:pt-20 min-h-screen">
        <main className="p-6 sm:p-6 md:p-8">
          {children}
        </main>
      </div>
      
      {/* Mobile Navigation - Your existing MobileNav component (visible only on mobile) */}
      <MobileNav />
    </div>
  )
}