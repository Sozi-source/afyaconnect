'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/app/contexts/AuthContext'
import { useTheme } from 'next-themes'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Bars3Icon,
  BellIcon,
  MagnifyingGlassIcon,
  ChevronDownIcon,
  SunIcon,
  MoonIcon,
  UserCircleIcon,
  ArrowRightOnRectangleIcon,
  Cog6ToothIcon,
} from '@heroicons/react/24/outline'

interface DashboardHeaderProps {
  onMenuClick: () => void
}

export function DashboardHeader({ onMenuClick }: DashboardHeaderProps) {
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const pathname = usePathname()
  const { user, logout } = useAuth()
  const { theme, setTheme } = useTheme()

  useEffect(() => {
    setMounted(true)
  }, [])

  // Log when user changes
  useEffect(() => {
    console.log('🔄 DashboardHeader - user updated:', user)
  }, [user])

  if (!mounted || !user) {
    return null
  }

  const userRole = user.is_staff ? 'admin' : (user.role || 'client')
  const displayName = user.first_name 
    ? `${user.first_name} ${user.last_name || ''}`.trim()
    : user.email?.split('@')[0] || 'User'
  const initials = user.first_name?.[0] || user.email?.[0]?.toUpperCase() || 'U'

  const getPageTitle = () => {
    if (!pathname) return 'Dashboard'
    const path = pathname.split('/')[2] || 'dashboard'
    return path.charAt(0).toUpperCase() + path.slice(1)
  }

  return (
    <header className="fixed top-0 right-0 left-0 lg:left-72 z-40 bg-white border-b border-gray-200">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Left Section */}
          <div className="flex items-center flex-1">
            <button
              onClick={onMenuClick}
              className="lg:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100 mr-3"
            >
              <Bars3Icon className="h-5 w-5 sm:h-6 sm:w-6" />
            </button>
            
            <h1 className="text-lg sm:text-xl lg:text-2xl font-semibold text-gray-900">
              {getPageTitle()}
            </h1>
          </div>

          {/* Search Bar */}
          <div className="hidden md:block flex-1 max-w-md mx-4">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search..."
                className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl bg-gray-50 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500/30"
              />
            </div>
          </div>

          {/* Right Section */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Theme Toggle */}
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-2 rounded-lg hover:bg-gray-100"
            >
              {theme === 'dark' ? (
                <SunIcon className="h-5 w-5 sm:h-6 sm:w-6 text-gray-600" />
              ) : (
                <MoonIcon className="h-5 w-5 sm:h-6 sm:w-6 text-gray-600" />
              )}
            </button>

            {/* Profile Menu */}
            <div className="relative">
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center space-x-2 p-1.5 pr-3 rounded-xl hover:bg-gray-100"
              >
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-teal-500 to-teal-600 rounded-lg flex items-center justify-center text-white font-medium text-sm sm:text-base">
                  {initials}
                </div>
                <div className="hidden lg:block text-left">
                  <p className="text-sm font-medium text-gray-900 truncate max-w-[150px]">
                    {displayName}
                  </p>
                  <p className="text-xs text-gray-500">
                    {userRole}
                  </p>
                </div>
                <ChevronDownIcon className="h-4 w-4 text-gray-400 hidden lg:block" />
              </button>

              <AnimatePresence>
                {isProfileOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden z-50"
                  >
                    <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
                      <p className="text-sm font-semibold text-gray-900">{displayName}</p>
                      <p className="text-xs text-gray-500 truncate mt-0.5">
                        {user.email}
                      </p>
                    </div>
                    
                    <Link
                      href={`/${userRole}/dashboard/profile`}
                      className="flex items-center space-x-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50"
                      onClick={() => setIsProfileOpen(false)}
                    >
                      <UserCircleIcon className="h-5 w-5 text-gray-400" />
                      <span>Your Profile</span>
                    </Link>
                    
                    <Link
                      href={`/${userRole}/dashboard/settings`}
                      className="flex items-center space-x-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50"
                      onClick={() => setIsProfileOpen(false)}
                    >
                      <Cog6ToothIcon className="h-5 w-5 text-gray-400" />
                      <span>Settings</span>
                    </Link>
                    
                    <hr className="border-gray-200" />
                    
                    <button
                      onClick={() => {
                        logout()
                        setIsProfileOpen(false)
                      }}
                      className="w-full flex items-center space-x-3 px-4 py-3 text-sm text-red-600 hover:bg-red-50"
                    >
                      <ArrowRightOnRectangleIcon className="h-5 w-5" />
                      <span>Logout</span>
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}