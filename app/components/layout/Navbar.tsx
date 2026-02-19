'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/app/contexts/AuthContext'
import { motion } from 'framer-motion'
import {
  Bars3Icon,
  BellIcon,
  MagnifyingGlassIcon,
  ChevronDownIcon,
} from '@heroicons/react/24/outline'
import { useToast } from '@/app/hooks/useToast'

interface NavbarProps {
  onMenuClick: () => void
}

export const Navbar = ({ onMenuClick }: NavbarProps) => {
  const [scrolled, setScrolled] = useState(false)
  const [showProfileMenu, setShowProfileMenu] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  
  const pathname = usePathname()
  const { user, logout, isAuthenticated } = useAuth()
  const { showSuccess } = useToast()

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      if (!target.closest('.profile-menu') && !target.closest('.notifications-menu')) {
        setShowProfileMenu(false)
        setShowNotifications(false)
      }
    }
    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [])

  const handleLogout = async () => {
    try {
      await logout()
      showSuccess('Logged out successfully')
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  const getPageTitle = () => {
    const path = pathname.split('/')[1]
    if (!path || path === 'dashboard') return 'Dashboard'
    return path.charAt(0).toUpperCase() + path.slice(1)
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      window.location.href = `/dashboard/search?q=${encodeURIComponent(searchQuery)}`
    }
  }

  if (!isAuthenticated) return null

  return (
    <nav
      className={`
        fixed top-0 left-0 right-0 z-40 transition-all duration-300
        ${scrolled 
          ? 'bg-white/80 dark:bg-gray-900/80 backdrop-blur-md shadow-lg' 
          : 'bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700'
        }
      `}
    >
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left section */}
          <div className="flex items-center">
            <button
              onClick={onMenuClick}
              className="lg:hidden p-2 rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 mr-4"
              aria-label="Toggle sidebar"
            >
              <Bars3Icon className="h-6 w-6" />
            </button>

            <h1 className="text-xl font-semibold text-gray-900 dark:text-white hidden sm:block">
              {getPageTitle()}
            </h1>
          </div>

          {/* Search */}
          <div className="flex-1 max-w-lg mx-4 hidden md:block">
            <form onSubmit={handleSearch}>
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search practitioners, consultations..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </form>
          </div>

          {/* Right section */}
          <div className="flex items-center space-x-3">
            {/* Notifications */}
            <div className="relative notifications-menu">
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setShowNotifications(!showNotifications)
                  setShowProfileMenu(false)
                }}
                className="p-2 rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 relative"
                aria-label="Notifications"
              >
                <BellIcon className="h-5 w-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>

              {/* Notifications dropdown */}
              {showNotifications && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden z-50"
                >
                  <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                    <h3 className="font-semibold text-gray-900 dark:text-white">Notifications</h3>
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    <NotificationItem
                      title="New Consultation"
                      message="You have a new consultation request"
                      time="5 min ago"
                    />
                    <NotificationItem
                      title="Review Received"
                      message="Someone left a review on your profile"
                      time="1 hour ago"
                    />
                  </div>
                  <div className="p-3 border-t border-gray-200 dark:border-gray-700 text-center">
                    <Link href="/dashboard/notifications" className="text-sm text-primary-600 hover:text-primary-700">
                      View all notifications
                    </Link>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Profile dropdown */}
            <div className="relative profile-menu">
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setShowProfileMenu(!showProfileMenu)
                  setShowNotifications(false)
                }}
                className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                aria-label="Profile menu"
              >
                <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-full flex items-center justify-center text-white font-medium">
                  {user?.first_name?.[0] || user?.username?.[0] || 'U'}
                </div>
                <div className="hidden md:block text-left">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {user?.first_name 
                      ? `${user.first_name} ${user.last_name || ''}`.trim()
                      : user?.username || 'User'}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{user?.email}</p>
                </div>
                <ChevronDownIcon className="h-4 w-4 text-gray-400 hidden md:block" />
              </button>

              {/* Profile dropdown menu */}
              {showProfileMenu && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden z-50"
                >
                  <Link
                    href="/dashboard/profile"
                    className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    onClick={() => setShowProfileMenu(false)}
                  >
                    Your Profile
                  </Link>
                  <Link
                    href="/dashboard/profile/edit"
                    className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    onClick={() => setShowProfileMenu(false)}
                  >
                    Edit Profile
                  </Link>
                  <Link
                    href="/dashboard/settings"
                    className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    onClick={() => setShowProfileMenu(false)}
                  >
                    Settings
                  </Link>
                  <hr className="border-gray-200 dark:border-gray-700" />
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    Sign out
                  </button>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}

// Notification Item Component
const NotificationItem = ({ title, message, time }: { title: string; message: string; time: string }) => {
  return (
    <div className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer border-b last:border-0 border-gray-100 dark:border-gray-700">
      <p className="text-sm font-medium text-gray-900 dark:text-white">{title}</p>
      <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">{message}</p>
      <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">{time}</p>
    </div>
  )
}