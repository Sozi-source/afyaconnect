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
  XMarkIcon,
  SunIcon,
  MoonIcon,
  UserCircleIcon,
  ArrowRightOnRectangleIcon,
  Cog6ToothIcon
} from '@heroicons/react/24/outline'

interface DashboardHeaderProps {
  onMenuClick: () => void
}

// Extended user type
interface ExtendedUser {
  id: number
  email: string
  first_name?: string
  last_name?: string
  username?: string
  role?: string
  is_verified?: boolean
}

export function DashboardHeader({ onMenuClick }: DashboardHeaderProps) {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [mounted, setMounted] = useState(false)
  
  const pathname = usePathname()
  const { user, logout } = useAuth()
  const extendedUser = user as ExtendedUser | null
  const { theme, setTheme } = useTheme()

  useEffect(() => {
    setMounted(true)
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      if (!target.closest('.profile-menu') && !target.closest('.notifications-menu')) {
        setIsProfileOpen(false)
        setIsNotificationsOpen(false)
      }
    }
    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [])

  if (!mounted) return null

  const getPageTitle = () => {
    if (!pathname) return 'Dashboard'
    const path = pathname.split('/')[2] || 'dashboard'
    return path.charAt(0).toUpperCase() + path.slice(1)
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      window.location.href = `/dashboard/search?q=${encodeURIComponent(searchQuery)}`
      setIsSearchOpen(false)
    }
  }

  const notifications = [
    { id: 1, title: 'New consultation request', time: '5 min ago', read: false, type: 'request' },
    { id: 2, title: 'Review received', time: '1 hour ago', read: false, type: 'review' },
    { id: 3, title: 'Payment confirmed', time: '3 hours ago', read: true, type: 'payment' },
  ]

  const unreadCount = notifications.filter(n => !n.read).length

  const displayName = extendedUser?.first_name 
    ? `${extendedUser.first_name} ${extendedUser.last_name || ''}`.trim()
    : extendedUser?.username || 'User'

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 lg:left-64 z-30 transition-all duration-300 ${
          isScrolled
            ? 'bg-white/95 dark:bg-gray-900/95 backdrop-blur-md shadow-lg'
            : 'bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800'
        }`}
      >
        <div className="px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            {/* Left Section */}
            <div className="flex items-center flex-1">
              <button
                onClick={onMenuClick}
                className="lg:hidden p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 mr-3"
                aria-label="Open menu"
              >
                <Bars3Icon className="h-5 w-5" />
              </button>
              
              <h1 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
                {getPageTitle()}
              </h1>
            </div>

            {/* Search Bar - Desktop */}
            <div className="hidden md:block flex-1 max-w-md mx-4">
              <form onSubmit={handleSearch}>
                <div className="relative">
                  <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search practitioners..."
                    className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </form>
            </div>

            {/* Right Section */}
            <div className="flex items-center space-x-2">
              {/* Mobile Search Toggle */}
              <button
                onClick={() => setIsSearchOpen(true)}
                className="md:hidden p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <MagnifyingGlassIcon className="h-5 w-5" />
              </button>

              {/* Theme Toggle */}
              <button
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                aria-label="Toggle theme"
              >
                {theme === 'dark' ? (
                  <SunIcon className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                ) : (
                  <MoonIcon className="h-5 w-5 text-gray-600" />
                )}
              </button>

              {/* Notifications */}
              <div className="relative notifications-menu hidden sm:block">
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setIsNotificationsOpen(!isNotificationsOpen)
                    setIsProfileOpen(false)
                  }}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 relative"
                  aria-label="Notifications"
                >
                  <BellIcon className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white dark:ring-gray-900"></span>
                  )}
                </button>

                <AnimatePresence>
                  {isNotificationsOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden z-50"
                    >
                      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                        <h3 className="font-semibold text-gray-900 dark:text-white">Notifications</h3>
                      </div>
                      <div className="max-h-96 overflow-y-auto">
                        {notifications.length === 0 ? (
                          <div className="p-4 text-center text-gray-500">
                            No notifications
                          </div>
                        ) : (
                          notifications.map((notification) => (
                            <div
                              key={notification.id}
                              className={`p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer border-b last:border-0 border-gray-100 dark:border-gray-700 ${
                                !notification.read ? 'bg-emerald-50/50 dark:bg-emerald-900/10' : ''
                              }`}
                            >
                              <p className="text-sm font-medium text-gray-900 dark:text-white">
                                {notification.title}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                {notification.time}
                              </p>
                            </div>
                          ))
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Profile Menu */}
              <div className="relative profile-menu">
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setIsProfileOpen(!isProfileOpen)
                    setIsNotificationsOpen(false)
                  }}
                  className="flex items-center space-x-2 p-1 pr-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  aria-label="Profile menu"
                >
                  <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-lg flex items-center justify-center text-white font-medium text-sm">
                    {extendedUser?.first_name?.[0] || extendedUser?.username?.[0]?.toUpperCase() || 'U'}
                  </div>
                  <div className="hidden lg:block text-left">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate max-w-[120px]">
                      {displayName}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {extendedUser?.role || 'client'}
                    </p>
                  </div>
                  <ChevronDownIcon className="h-4 w-4 text-gray-400 hidden lg:block" />
                </button>

                <AnimatePresence>
                  {isProfileOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden z-50"
                    >
                      <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{displayName}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                          {extendedUser?.email}
                        </p>
                      </div>
                      
                      <Link
                        href="/dashboard/profile"
                        className="flex items-center space-x-3 px-4 py-3 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                        onClick={() => setIsProfileOpen(false)}
                      >
                        <UserCircleIcon className="h-5 w-5" />
                        <span>Your Profile</span>
                      </Link>
                      
                      <Link
                        href="/dashboard/settings"
                        className="flex items-center space-x-3 px-4 py-3 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                        onClick={() => setIsProfileOpen(false)}
                      >
                        <Cog6ToothIcon className="h-5 w-5" />
                        <span>Settings</span>
                      </Link>
                      
                      <hr className="border-gray-200 dark:border-gray-700" />
                      
                      <button
                        onClick={() => {
                          logout()
                          setIsProfileOpen(false)
                        }}
                        className="w-full flex items-center space-x-3 px-4 py-3 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
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

      {/* Mobile Search Modal */}
      <AnimatePresence>
        {isSearchOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSearchOpen(false)}
              className="fixed inset-0 bg-black/50 z-40 md:hidden"
            />
            
            <motion.div
              initial={{ y: '-100%' }}
              animate={{ y: 0 }}
              exit={{ y: '-100%' }}
              className="fixed top-0 left-0 right-0 bg-white dark:bg-gray-900 z-50 md:hidden p-4 shadow-lg"
            >
              <div className="flex items-center space-x-3">
                <form onSubmit={handleSearch} className="flex-1">
                  <div className="relative">
                    <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search practitioners..."
                      className="w-full pl-9 pr-4 py-3 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white"
                      autoFocus
                    />
                  </div>
                </form>
                <button
                  onClick={() => setIsSearchOpen(false)}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  <XMarkIcon className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}