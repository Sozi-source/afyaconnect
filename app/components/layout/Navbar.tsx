'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/app/contexts/AuthContext'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Bars3Icon,
  BellIcon,
  MagnifyingGlassIcon,
  ChevronDownIcon,
  XMarkIcon,
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
  const [showMobileSearch, setShowMobileSearch] = useState(false)
  
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
    const path = pathname?.split('/')[2] || 'dashboard'
    return path.charAt(0).toUpperCase() + path.slice(1)
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      window.location.href = `/dashboard/search?q=${encodeURIComponent(searchQuery)}`
      setShowMobileSearch(false)
    }
  }

  if (!isAuthenticated) return null

  const notifications = [
    { id: 1, title: 'New consultation request', time: '5 min ago', read: false },
    { id: 2, title: 'Review received', time: '1 hour ago', read: false },
    { id: 3, title: 'Profile views increased', time: '2 hours ago', read: true },
  ]

  const unreadCount = notifications.filter(n => !n.read).length

  return (
    <>
      <nav
        className={`
          fixed top-0 left-0 right-0 z-40 transition-all duration-300
          ${scrolled 
            ? 'bg-white/95 dark:bg-gray-900/95 backdrop-blur-md shadow-lg' 
            : 'bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800'
          }
        `}
      >
        <div className="px-3 sm:px-4 lg:px-6">
          <div className="flex items-center justify-between h-16">
            {/* Left section */}
            <div className="flex items-center flex-1">
              <button
                onClick={onMenuClick}
                className="lg:hidden p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 mr-2"
                aria-label="Toggle sidebar"
              >
                <Bars3Icon className="h-5 w-5" />
              </button>

              <h1 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white truncate max-w-[150px] sm:max-w-none">
                {getPageTitle()}
              </h1>
            </div>

            {/* Search - Desktop */}
            <div className="hidden md:block flex-1 max-w-md mx-4">
              <form onSubmit={handleSearch}>
                <div className="relative">
                  <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search..."
                    className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </form>
            </div>

            {/* Right section */}
            <div className="flex items-center justify-end space-x-2 sm:space-x-3 flex-1">
              {/* Mobile search toggle */}
              <button
                onClick={() => setShowMobileSearch(!showMobileSearch)}
                className="md:hidden p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                aria-label="Search"
              >
                <MagnifyingGlassIcon className="h-5 w-5" />
              </button>

              {/* Notifications */}
              <div className="relative notifications-menu hidden sm:block">
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setShowNotifications(!showNotifications)
                    setShowProfileMenu(false)
                  }}
                  className="p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 relative"
                  aria-label="Notifications"
                >
                  <BellIcon className="h-5 w-5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white dark:ring-gray-900"></span>
                  )}
                </button>

                <AnimatePresence>
                  {showNotifications && (
                    <motion.div
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      className="absolute right-0 mt-2 w-72 sm:w-80 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden z-50"
                    >
                      <div className="p-3 border-b border-gray-200 dark:border-gray-700">
                        <h3 className="font-semibold text-gray-900 dark:text-white">Notifications</h3>
                      </div>
                      <div className="max-h-96 overflow-y-auto">
                        {notifications.map((notification) => (
                          <div
                            key={notification.id}
                            className={`p-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer border-b last:border-0 border-gray-100 dark:border-gray-700 ${
                              !notification.read ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''
                            }`}
                          >
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                              {notification.title}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                              {notification.time}
                            </p>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Profile dropdown */}
              <div className="relative profile-menu">
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setShowProfileMenu(!showProfileMenu)
                    setShowNotifications(false)
                  }}
                  className="flex items-center space-x-2 p-1.5 pr-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  aria-label="Profile menu"
                >
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center text-white font-medium text-sm">
                    {user?.first_name?.[0] || user?.username?.[0]?.toUpperCase() || 'U'}
                  </div>
                  <div className="hidden lg:block text-left">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {user?.first_name 
                        ? `${user.first_name} ${user.last_name || ''}`.trim()
                        : user?.username || 'User'}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-[100px]">
                      {user?.email}
                    </p>
                  </div>
                  <ChevronDownIcon className="h-4 w-4 text-gray-400 hidden lg:block" />
                </button>

                <AnimatePresence>
                  {showProfileMenu && (
                    <motion.div
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden z-50"
                    >
                      <Link
                        href="/dashboard/profile"
                        className="block px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                        onClick={() => setShowProfileMenu(false)}
                      >
                        Your Profile
                      </Link>
                      <Link
                        href="/dashboard/profile/edit"
                        className="block px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                        onClick={() => setShowProfileMenu(false)}
                      >
                        Edit Profile
                      </Link>
                      <hr className="border-gray-200 dark:border-gray-700" />
                      <button
                        onClick={handleLogout}
                        className="block w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        Sign out
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile search overlay */}
      <AnimatePresence>
        {showMobileSearch && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowMobileSearch(false)}
              className="fixed inset-0 bg-black/50 z-40 md:hidden"
            />
            
            <motion.div
              initial={{ y: '-100%' }}
              animate={{ y: 0 }}
              exit={{ y: '-100%' }}
              transition={{ type: 'tween' }}
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
                      className="w-full pl-9 pr-4 py-3 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      autoFocus
                    />
                  </div>
                </form>
                <button
                  onClick={() => setShowMobileSearch(false)}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  <XMarkIcon className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Spacer for fixed navbar */}
      <div className="h-16" />
    </>
  )
}