'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/app/contexts/AuthContext'
import { useTheme } from 'next-themes'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Bars3Icon, 
  XMarkIcon,
  UserCircleIcon,
  ArrowRightOnRectangleIcon,
  Cog6ToothIcon,
  SunIcon,
  MoonIcon,
  BellIcon,
  ChevronDownIcon,
  HomeIcon,
  CalendarIcon,
  UserGroupIcon,
  ChartBarIcon,
  ClockIcon,
  CurrencyDollarIcon,
  StarIcon
} from '@heroicons/react/24/outline'

// Extended user type
interface ExtendedUser {
  id: number
  email: string
  first_name?: string
  last_name?: string
  username?: string
  role?: string
  is_verified?: boolean
  is_staff?: boolean
}

interface HeaderProps {
  onMenuClick: () => void
}

export const Header = ({ onMenuClick }: HeaderProps) => {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false)
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
    setIsMobileMenuOpen(false)
    setIsProfileOpen(false)
    setIsNotificationsOpen(false)
  }, [pathname])

  // Close menus when clicking outside
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

  const userRole = extendedUser?.role || 'client'
  const isPractitioner = userRole === 'practitioner' && extendedUser?.is_verified

  // Navigation based on role
  const getNavigation = () => {
    if (isPractitioner) {
      return [
        { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
        { name: 'Practice', href: '/dashboard/practitioner', icon: ChartBarIcon },
        { name: 'Consultations', href: '/dashboard/consultations', icon: CalendarIcon },
        { name: 'Availability', href: '/dashboard/practitioner/availability', icon: ClockIcon },
        { name: 'Earnings', href: '/dashboard/practitioner/earnings', icon: CurrencyDollarIcon },
      ]
    } else {
      return [
        { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
        { name: 'Find Experts', href: '/dashboard/practitioners', icon: UserGroupIcon },
        { name: 'Consultations', href: '/dashboard/consultations', icon: CalendarIcon },
        { name: 'Favorites', href: '/dashboard/favorites', icon: StarIcon },
      ]
    }
  }

  const navigation = getNavigation()

  const notifications = [
    { id: 1, title: 'New consultation request', time: '5 min ago', read: false },
    { id: 2, title: 'Review received', time: '1 hour ago', read: false },
    { id: 3, title: 'Profile views increased', time: '2 hours ago', read: true },
  ]

  const unreadCount = notifications.filter(n => !n.read).length

  const displayName = extendedUser?.first_name 
    ? `${extendedUser.first_name} ${extendedUser.last_name || ''}`.trim()
    : extendedUser?.username || 'User'

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled
            ? 'bg-white/95 dark:bg-gray-900/95 backdrop-blur-md shadow-lg'
            : 'bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800'
        }`}
      >
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <button
                onClick={onMenuClick}
                className="lg:hidden p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <Bars3Icon className="h-5 w-5" />
              </button>
              <Link href="/" className="flex items-center space-x-2 flex-shrink-0">
                <div className="w-8 h-8 lg:w-10 lg:h-10 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center">
                  <span className="text-white font-bold text-lg lg:text-xl">MC</span>
                </div>
                <span className="text-lg lg:text-xl font-bold text-gray-900 dark:text-white hidden sm:block">
                  Medi<span className="text-emerald-600">Connect</span>
                </span>
              </Link>
            </div>

            {/* Desktop Navigation - Hidden on mobile */}
            <nav className="hidden lg:flex items-center space-x-1">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center space-x-2 ${
                    pathname === item.href
                      ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20'
                      : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                >
                  <item.icon className="h-4 w-4" />
                  <span>{item.name}</span>
                </Link>
              ))}
            </nav>

            {/* Right side actions */}
            <div className="flex items-center space-x-2 sm:space-x-3">
              {/* Theme toggle */}
              <button
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="p-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
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
                  className="p-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors relative"
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
                      transition={{ duration: 0.2 }}
                      className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden z-50"
                    >
                      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                        <h3 className="font-semibold text-gray-900 dark:text-white">Notifications</h3>
                      </div>
                      <div className="max-h-96 overflow-y-auto">
                        {notifications.map((notification) => (
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
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* User menu */}
              <div className="relative profile-menu">
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setIsProfileOpen(!isProfileOpen)
                    setIsNotificationsOpen(false)
                  }}
                  className="flex items-center space-x-2 p-1.5 pr-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  aria-label="Profile menu"
                >
                  <div className="w-8 h-8 lg:w-9 lg:h-9 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center text-white font-medium text-sm lg:text-base">
                    {extendedUser?.first_name?.[0] || extendedUser?.username?.[0]?.toUpperCase() || 'U'}
                  </div>
                  <div className="hidden md:block text-left">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {displayName}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-[120px]">
                      {extendedUser?.email}
                    </p>
                  </div>
                  <ChevronDownIcon className="h-4 w-4 text-gray-400 hidden md:block" />
                </button>

                <AnimatePresence>
                  {isProfileOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden z-50"
                    >
                      <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 md:hidden">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {displayName}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                          {extendedUser?.email}
                        </p>
                      </div>
                      
                      <Link
                        href="/dashboard/profile"
                        className="flex items-center space-x-3 px-4 py-3 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        onClick={() => setIsProfileOpen(false)}
                      >
                        <UserCircleIcon className="h-5 w-5" />
                        <span>Your Profile</span>
                      </Link>
                      
                      <Link
                        href="/dashboard/settings"
                        className="flex items-center space-x-3 px-4 py-3 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
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
                        className="w-full flex items-center space-x-3 px-4 py-3 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
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

      {/* Mobile menu overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            />
            
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'tween', duration: 0.3 }}
              className="fixed right-0 top-0 bottom-0 w-[280px] sm:w-80 bg-white dark:bg-gray-900 z-50 lg:hidden shadow-xl"
            >
              <div className="flex flex-col h-full">
                {/* Mobile menu header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800">
                  <span className="font-semibold text-gray-900 dark:text-white">Menu</span>
                  <button
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                  >
                    <XMarkIcon className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                  </button>
                </div>
                
                {/* Mobile navigation */}
                <nav className="flex-1 overflow-y-auto p-4">
                  <div className="space-y-1">
                    {navigation.map((item) => (
                      <Link
                        key={item.name}
                        href={item.href}
                        className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-colors ${
                          pathname === item.href
                            ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400'
                            : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                        }`}
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <item.icon className="h-5 w-5" />
                        <span className="text-sm font-medium">{item.name}</span>
                      </Link>
                    ))}
                  </div>

                  {/* Mobile notifications */}
                  <div className="mt-6">
                    <h3 className="px-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Notifications
                    </h3>
                    <div className="mt-2 space-y-1">
                      {notifications.slice(0, 2).map((notification) => (
                        <div
                          key={notification.id}
                          className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300"
                        >
                          <p className="font-medium">{notification.title}</p>
                          <p className="text-xs text-gray-400 mt-1">{notification.time}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </nav>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Spacer for fixed header */}
      <div className="h-16 lg:h-20" />
    </>
  )
}