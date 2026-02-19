'use client'

import { useAuth } from '@/app/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { 
  HomeIcon,
  UserGroupIcon,
  CalendarIcon,
  ChartBarIcon,
  UserCircleIcon,
  ArrowRightOnRectangleIcon,
  Bars3Icon,
  XMarkIcon
} from '@heroicons/react/24/outline'
import { motion, AnimatePresence } from 'framer-motion'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { isAuthenticated, isLoading, logout } = useAuth()
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login')
    }
  }, [isAuthenticated, isLoading, router])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
    { name: 'Practitioners', href: '/dashboard/practitioners', icon: UserGroupIcon },
    { name: 'Consultations', href: '/dashboard/consultations', icon: CalendarIcon },
    { name: 'Metrics', href: '/dashboard/metrics', icon: ChartBarIcon },
  ]

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Mobile header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-30 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 h-16 flex items-center justify-between">
        <span className="text-lg font-bold text-blue-600">NutriConnect</span>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          {sidebarOpen ? (
            <XMarkIcon className="h-6 w-6 text-gray-600 dark:text-gray-300" />
          ) : (
            <Bars3Icon className="h-6 w-6 text-gray-600 dark:text-gray-300" />
          )}
        </button>
      </div>

      {/* Mobile sidebar overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        initial={{ x: -300 }}
        animate={{ x: sidebarOpen ? 0 : -300 }}
        transition={{ type: 'tween', duration: 0.3 }}
        className="fixed inset-y-0 left-0 w-64 sm:w-72 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 z-50 lg:translate-x-0"
      >
        <div className="flex flex-col h-full">
          {/* Logo - Desktop */}
          <div className="hidden lg:flex h-16 items-center px-6 border-b border-gray-200 dark:border-gray-700">
            <span className="text-xl font-bold text-blue-600">NutriConnect</span>
          </div>

          {/* Logo - Mobile */}
          <div className="lg:hidden h-16 flex items-center px-6 border-b border-gray-200 dark:border-gray-700">
            <span className="text-lg font-bold text-blue-600">Menu</span>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto py-4 sm:py-6 px-3 sm:px-4 space-y-1">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="flex items-center px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors"
                onClick={() => setSidebarOpen(false)}
              >
                <item.icon className="h-5 w-5 mr-3 flex-shrink-0" />
                {item.name}
              </Link>
            ))}
          </nav>

          {/* User menu */}
          <div className="p-3 sm:p-4 border-t border-gray-200 dark:border-gray-700">
            <Link
              href="/dashboard/profile"
              className="flex items-center px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors mb-2"
              onClick={() => setSidebarOpen(false)}
            >
              <UserCircleIcon className="h-5 w-5 mr-3 flex-shrink-0" />
              Profile
            </Link>
            <button
              onClick={() => {
                logout()
                setSidebarOpen(false)
              }}
              className="w-full flex items-center px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors"
            >
              <ArrowRightOnRectangleIcon className="h-5 w-5 mr-3 flex-shrink-0" />
              Logout
            </button>
          </div>
        </div>
      </motion.aside>

      {/* Main content */}
      <div className="lg:ml-64 pt-16 lg:pt-0 min-h-screen">
        <main className="p-4 sm:p-6 md:p-8">
          {children}
        </main>
      </div>
    </div>
  )
}