'use client'

import { useAuth } from '@/app/contexts/AuthContext'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { 
  UserGroupIcon, 
  CalendarIcon, 
  ChartBarIcon,
  ClockIcon,
  CheckCircleIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline'
import { span } from 'framer-motion/client'

export default function DashboardPage() {
  const { user, isAuthenticated, isLoading, logout } = useAuth()
  const router = useRouter()
  const [showDebug, setShowDebug] = useState(false)

  useEffect(() => {
    console.log('📊 Dashboard mounted:', { 
      isAuthenticated, 
      isLoading, 
      user: user?.email 
    })
  }, [isAuthenticated, isLoading, user])

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-sm sm:text-base text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  // If not authenticated, let the login page handle it
  if (!isAuthenticated || !user) {
    console.log('⛔ Not authenticated in dashboard')
    return null
  }

  const displayName = user.first_name || user.username || user.email?.split('@')[0] || 'User'

  const stats = [
    { name: 'Upcoming Consultations', value: '3', icon: ClockIcon, color: 'blue' },
    { name: 'Completed', value: '12', icon: CheckCircleIcon, color: 'green' },
    { name: 'Practitioners', value: '8', icon: UserGroupIcon, color: 'purple' },
    { name: 'Total Hours', value: '24', icon: ChartBarIcon, color: 'orange' },
  ]

  const quickActions = [
    { name: 'Find Practitioners', href: '/dashboard/practitioners', icon: UserGroupIcon, color: 'bg-blue-500' },
    { name: 'Book Consultation', href: '/dashboard/consultations/create', icon: CalendarIcon, color: 'bg-green-500' },
    { name: 'View Metrics', href: '/dashboard/metrics', icon: ChartBarIcon, color: 'bg-purple-500' },
  ]

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
            Welcome back, {displayName}!
          </h1>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-1">
            Here's what's happening with your account today.
          </p>
        </div>
        <button
          onClick={logout}
          className="w-full sm:w-auto px-4 py-2.5 sm:py-2 bg-red-500 text-white text-sm sm:text-base rounded-xl hover:bg-red-600 transition-colors active:scale-95"
        >
          Logout
        </button>
      </div>

      {/* Success Message */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4"
      >
        <p className="text-sm sm:text-base text-green-700 dark:text-green-300 font-medium">
          ✅ Successfully logged in!
        </p>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {stats.map((stat, index) => {
          const colors = {
            blue: 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400',
            green: 'bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400',
            purple: 'bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400',
            orange: 'bg-orange-50 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400',
          }

          return (
            <motion.div
              key={stat.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4"
            >
              <div className="flex items-center justify-between mb-2">
                <div className={`p-2 rounded-lg ${colors[stat.color as keyof typeof colors]}`}>
                  <stat.icon className="h-5 w-5" />
                </div>
                <span className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white">
                  {stat.value}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 truncate">
                {stat.name}
              </p>
            </motion.div>
          )
        })}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
          {quickActions.map((action, index) => (
            <motion.div
              key={action.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + index * 0.1 }}
            >
              <Link
                href={action.href}
                className="block bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md transition-all p-4 sm:p-5 group"
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 sm:p-3 rounded-xl ${action.color} text-white`}>
                    <action.icon className="h-5 w-5 sm:h-6 sm:w-6" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white">
                      {action.name}
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 flex items-center group-hover:text-blue-600 transition-colors">
                      Get started
                      <ArrowRightIcon className="h-3 w-3 ml-1 group-hover:translate-x-1 transition-transform" />
                    </p>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>

      {/* User Info Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden"
      >
        <div className="bg-gradient-to-r from-blue-500 to-indigo-500 px-4 sm:px-6 py-4">
          <h3 className="text-base sm:text-lg font-semibold text-white">Account Information</h3>
        </div>
        <div className="p-4 sm:p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">User ID</p>
              <p className="text-sm sm:text-base font-medium text-gray-900 dark:text-white">{user.id}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Email</p>
              <p className="text-sm sm:text-base font-medium text-gray-900 dark:text-white break-all">{user.email}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Username</p>
              <p className="text-sm sm:text-base font-medium text-gray-900 dark:text-white">{user.username || 'N/A'}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Full Name</p>
              <p className="text-sm sm:text-base font-medium text-gray-900 dark:text-white">
                {user.first_name} {user.last_name}
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Debug Info - Collapsible */}
      <div className="mt-6">
        <button
          onClick={() => setShowDebug(!showDebug)}
          className="text-xs sm:text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 flex items-center gap-2"
        >
          <span>Debug Information</span>
          <svg
            className={`h-4 w-4 transition-transform ${showDebug ? 'rotate-180' : ''}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        
        {showDebug && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-3 p-3 sm:p-4 bg-gray-100 dark:bg-gray-800 rounded-xl overflow-hidden"
          >
            <p className="text-xs sm:text-sm font-mono break-all">
              <span className="font-semibold">Token in localStorage:</span>{' '}
              {typeof window !== 'undefined' && localStorage.getItem('authToken') ? (
                <span className="text-green-600">✅ Present</span>
              ) : (
                <span className="text-red-600">❌ Missing</span>
              )}
            </p>
            <p className="text-xs sm:text-sm font-mono break-all mt-2">
              <span className="font-semibold">User Object:</span>{' '}
              <span className="text-gray-600 dark:text-gray-400">
                {JSON.stringify(user, null, 2)}
              </span>
            </p>
          </motion.div>
        )}
      </div>
    </div>
  )
}