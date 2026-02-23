'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/app/contexts/AuthContext'
import { motion, AnimatePresence } from 'framer-motion'
import {
  HomeIcon,
  CalendarIcon,
  ClockIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  StarIcon,
  UserIcon,
  Cog6ToothIcon,
  DocumentTextIcon,
  ShieldCheckIcon,
  BriefcaseIcon,
  XMarkIcon,
  LockClosedIcon,
} from '@heroicons/react/24/outline'

interface PractitionerSidebarProps {
  isOpen: boolean
  onClose: () => void
}

const PENDING_PAGES = [
  '/practitioner/dashboard/analytics',
  '/practitioner/dashboard/resources',
  '/practitioner/dashboard/settings',
  '/practitioner/dashboard/support',
]

export function PractitionerSidebar({ isOpen, onClose }: PractitionerSidebarProps) {
  const [mounted, setMounted] = useState(false)
  const [showComingSoon, setShowComingSoon] = useState<string | null>(null)
  const pathname = usePathname()
  const { user } = useAuth()

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (window.innerWidth < 1024) {
      onClose()
    }
  }, [pathname, onClose])

  if (!mounted) return null

  const isActive = (href: string) => {
    if (href === '/practitioner/dashboard') return pathname === '/practitioner/dashboard'
    return pathname?.startsWith(href) || false
  }

  const getInitials = () => {
    if (user?.first_name && user?.last_name) {
      return `${user.first_name[0]}${user.last_name[0]}`
    }
    if (user?.first_name) {
      return user.first_name[0]
    }
    if (user?.email) {
      return user.email[0].toUpperCase()
    }
    return 'P'
  }

  const handleClick = (e: React.MouseEvent, item: { name: string; href: string; isReady: boolean }) => {
    if (!item.isReady) {
      e.preventDefault()
      setShowComingSoon(item.name)
      setTimeout(() => setShowComingSoon(null), 2000)
    }
  }

  const mainNav = [
    { 
      name: 'Dashboard', 
      href: '/practitioner/dashboard', 
      icon: HomeIcon,
      description: 'Overview of your practice',
      isReady: true
    },
    { 
      name: 'Consultations', 
      href: '/practitioner/dashboard/consultations', 
      icon: CalendarIcon,
      description: 'Manage your appointments',
      badge: 3,
      isReady: true
    },
    { 
      name: 'Availability', 
      href: '/practitioner/dashboard/availability', 
      icon: ClockIcon,
      description: 'Set your weekly schedule',
      isReady: true
    },
    { 
      name: 'Earnings', 
      href: '/practitioner/dashboard/earnings', 
      icon: CurrencyDollarIcon,
      description: 'Track your income',
      isReady: true
    },
    { 
      name: 'Reviews', 
      href: '/practitioner/dashboard/reviews', 
      icon: StarIcon,
      description: 'See what clients say',
      isReady: true
    },
    { 
      name: 'Profile', 
      href: '/practitioner/dashboard/profile', 
      icon: UserIcon,
      description: 'Manage your public profile',
      isReady: true
    },
  ]

  const secondaryNav = [
    { 
      name: 'Analytics', 
      href: '/practitioner/dashboard/analytics', 
      icon: ChartBarIcon,
      description: 'Practice insights',
      isReady: false
    },
    { 
      name: 'Resources', 
      href: '/practitioner/dashboard/resources', 
      icon: BriefcaseIcon,
      description: 'Professional resources',
      isReady: false
    },
    { 
      name: 'Settings', 
      href: '/practitioner/dashboard/settings', 
      icon: Cog6ToothIcon,
      description: 'Account settings',
      isReady: false
    },
    { 
      name: 'Help & Support', 
      href: '/practitioner/dashboard/support', 
      icon: DocumentTextIcon,
      description: 'Get assistance',
      isReady: false
    },
  ]

  const adminNav = user?.is_staff ? [
    { 
      name: 'Admin Panel', 
      href: '/admin', 
      icon: ShieldCheckIcon,
      description: 'Administration',
      isReady: true
    }
  ] : []

  // Desktop Sidebar
  const desktopSidebar = (
    <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-72 lg:flex-col">
      <div className="flex flex-col flex-1 min-h-0 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 shadow-xl">
        {/* Logo */}
        <div className="h-20 flex items-center px-6 border-b border-gray-200 dark:border-gray-800">
          <Link href="/practitioner/dashboard" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center shadow-md group-hover:shadow-lg transition-all">
              <span className="text-white font-bold text-lg">NP</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                Nutri<span className="text-emerald-600">Practice</span>
              </h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">Practitioner Portal</p>
            </div>
          </Link>
        </div>

        {/* User Profile Summary */}
        <div className="px-4 py-4 border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-md">
              {getInitials()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                Dr. {user?.first_name} {user?.last_name}
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-400 truncate mt-0.5">
                {user?.email}
              </p>
              <div className="mt-1.5">
                <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                  user?.is_verified 
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-800'
                    : 'bg-yellow-100 text-yellow-800 border border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-800'
                }`}>
                  {user?.is_verified ? '✅ Verified' : '⏳ Pending Verification'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Coming Soon Toast */}
        <AnimatePresence>
          {showComingSoon && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute top-24 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white px-4 py-2 rounded-lg text-sm z-50 whitespace-nowrap shadow-lg"
            >
              🔜 {showComingSoon} coming soon!
            </motion.div>
          )}
        </AnimatePresence>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-6 px-4 scrollbar-hide">
          {/* Main Navigation */}
          <div className="space-y-1">
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider px-3 mb-2">
              Main Menu
            </p>
            {mainNav.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                onClick={(e) => handleClick(e, item)}
                className={`
                  group flex items-center px-3 py-3 rounded-xl transition-all duration-200 relative
                  ${!item.isReady ? 'cursor-not-allowed opacity-60' : ''}
                  ${isActive(item.href) && item.isReady
                    ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 border-l-4 border-emerald-500'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }
                `}
              >
                <item.icon className={`h-5 w-5 flex-shrink-0 ${
                  isActive(item.href) && item.isReady
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : 'text-gray-500 dark:text-gray-500 group-hover:text-gray-700 dark:group-hover:text-gray-300'
                }`} />
                <span className="ml-3 text-sm font-medium flex-1">
                  {item.name}
                </span>
                {item.badge && item.isReady && (
                  <span className="px-2 py-0.5 text-xs font-medium bg-red-500 text-white rounded-full">
                    {item.badge}
                  </span>
                )}
                {!item.isReady && (
                  <>
                    <LockClosedIcon className="h-4 w-4 text-gray-400 dark:text-gray-600" />
                    <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 shadow-lg">
                      Coming soon
                    </div>
                  </>
                )}
                
                {item.isReady && (
                  <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 shadow-lg">
                    {item.description}
                  </div>
                )}
              </Link>
            ))}
          </div>

          {/* Secondary Navigation */}
          {secondaryNav.length > 0 && (
            <>
              <div className="my-6 border-t border-gray-200 dark:border-gray-800" />
              <div className="space-y-1">
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider px-3 mb-2">
                  Resources
                </p>
                {secondaryNav.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={(e) => handleClick(e, item)}
                    className={`
                      group flex items-center px-3 py-3 rounded-xl transition-all duration-200 relative
                      ${!item.isReady ? 'cursor-not-allowed opacity-60' : ''}
                      ${isActive(item.href) && item.isReady
                        ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 border-l-4 border-emerald-500'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                      }
                    `}
                  >
                    <item.icon className={`h-5 w-5 flex-shrink-0 ${
                      isActive(item.href) && item.isReady
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : 'text-gray-500 dark:text-gray-500 group-hover:text-gray-700 dark:group-hover:text-gray-300'
                    }`} />
                    <span className="ml-3 text-sm font-medium flex-1">
                      {item.name}
                    </span>
                    {!item.isReady && (
                      <>
                        <LockClosedIcon className="h-4 w-4 text-gray-400 dark:text-gray-600" />
                        <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 shadow-lg">
                          Coming soon
                        </div>
                      </>
                    )}
                    
                    {item.isReady && (
                      <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 shadow-lg">
                        {item.description}
                      </div>
                    )}
                  </Link>
                ))}
              </div>
            </>
          )}

          {/* Admin Navigation */}
          {adminNav.length > 0 && (
            <>
              <div className="my-6 border-t border-gray-200 dark:border-gray-800" />
              <div className="space-y-1">
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider px-3 mb-2">
                  Admin
                </p>
                {adminNav.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={(e) => handleClick(e, item)}
                    className={`
                      group flex items-center px-3 py-3 rounded-xl transition-all duration-200 relative
                      ${!item.isReady ? 'cursor-not-allowed opacity-60' : ''}
                      ${isActive(item.href) && item.isReady
                        ? 'bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300 border-l-4 border-purple-500'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                      }
                    `}
                  >
                    <item.icon className={`h-5 w-5 flex-shrink-0 ${
                      isActive(item.href) && item.isReady
                        ? 'text-purple-600 dark:text-purple-400'
                        : 'text-gray-500 dark:text-gray-500 group-hover:text-gray-700 dark:group-hover:text-gray-300'
                    }`} />
                    <span className="ml-3 text-sm font-medium flex-1">
                      {item.name}
                    </span>
                    {!item.isReady && (
                      <>
                        <LockClosedIcon className="h-4 w-4 text-gray-400 dark:text-gray-600" />
                        <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 shadow-lg">
                          Coming soon
                        </div>
                      </>
                    )}
                    
                    {item.isReady && (
                      <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 shadow-lg">
                        {item.description}
                      </div>
                    )}
                  </Link>
                ))}
              </div>
            </>
          )}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-800">
          <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
            <p className="text-xs text-gray-600 dark:text-gray-400 text-center">
              Version 2.0.0
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-500 text-center mt-1">
              © {new Date().getFullYear()} NutriConnect
            </p>
          </div>
        </div>
      </div>
    </div>
  )

  // Mobile Sidebar (similar fixes applied)
  const mobileSidebar = (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          />
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-y-0 left-0 w-80 bg-white dark:bg-gray-900 z-50 lg:hidden shadow-2xl overflow-y-auto"
          >
            <div className="flex flex-col h-full">
              {/* Mobile Header */}
              <div className="sticky top-0 bg-white dark:bg-gray-900 z-10">
                <div className="flex items-center justify-between p-5 border-b border-gray-200 dark:border-gray-800">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center">
                      <span className="text-white font-bold text-lg">NP</span>
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                        NutriPractice
                      </h2>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Practitioner Portal</p>
                    </div>
                  </div>
                  <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
                    <XMarkIcon className="h-5 w-5 text-gray-700 dark:text-gray-300" />
                  </button>
                </div>

                {/* Mobile User Info */}
                <div className="p-4 border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                      {getInitials()}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        Dr. {user?.first_name} {user?.last_name}
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
                        {user?.email}
                      </p>
                      <span className={`inline-flex items-center px-2 py-0.5 mt-1.5 rounded text-xs font-medium ${
                        user?.is_verified 
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300'
                          : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
                      }`}>
                        {user?.is_verified ? '✅ Verified' : '⏳ Pending'}
                      </span>
                    </div>
                  </div>
                </div>

                <AnimatePresence>
                  {showComingSoon && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute top-20 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white px-4 py-2 rounded-lg text-sm z-50 whitespace-nowrap shadow-lg"
                    >
                      🔜 {showComingSoon} coming soon!
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Mobile Navigation */}
              <nav className="flex-1 overflow-y-auto p-4">
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider px-3 mb-2">
                    Main
                  </p>
                  {mainNav.map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={(e) => {
                        handleClick(e, item)
                        if (item.isReady) onClose()
                      }}
                      className={`
                        flex items-center px-3 py-3 rounded-xl transition-all duration-200
                        ${!item.isReady ? 'cursor-not-allowed opacity-60' : ''}
                        ${isActive(item.href) && item.isReady
                          ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300'
                          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                        }
                      `}
                    >
                      <item.icon className={`h-5 w-5 flex-shrink-0 ${
                        isActive(item.href) && item.isReady
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : 'text-gray-500 dark:text-gray-500'
                      }`} />
                      <span className="ml-3 text-sm font-medium flex-1">
                        {item.name}
                      </span>
                      {item.badge && item.isReady && (
                        <span className="px-2 py-0.5 text-xs font-medium bg-red-500 text-white rounded-full">
                          {item.badge}
                        </span>
                      )}
                      {!item.isReady && (
                        <LockClosedIcon className="h-4 w-4 text-gray-400 dark:text-gray-600" />
                      )}
                    </Link>
                  ))}
                </div>

                {/* Secondary Navigation */}
                <div className="mt-6 space-y-1">
                  <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider px-3 mb-2">
                    Resources
                  </p>
                  {secondaryNav.map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={(e) => {
                        handleClick(e, item)
                        if (item.isReady) onClose()
                      }}
                      className={`
                        flex items-center px-3 py-3 rounded-xl transition-all duration-200
                        ${!item.isReady ? 'cursor-not-allowed opacity-60' : ''}
                        ${isActive(item.href) && item.isReady
                          ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300'
                          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                        }
                      `}
                    >
                      <item.icon className={`h-5 w-5 flex-shrink-0 ${
                        isActive(item.href) && item.isReady
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : 'text-gray-500 dark:text-gray-500'
                      }`} />
                      <span className="ml-3 text-sm font-medium flex-1">
                        {item.name}
                      </span>
                      {!item.isReady && (
                        <LockClosedIcon className="h-4 w-4 text-gray-400 dark:text-gray-600" />
                      )}
                    </Link>
                  ))}
                </div>

                {/* Admin Navigation */}
                {adminNav.length > 0 && (
                  <div className="mt-6 space-y-1">
                    <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider px-3 mb-2">
                      Admin
                    </p>
                    {adminNav.map((item) => (
                      <Link
                        key={item.name}
                        href={item.href}
                        onClick={(e) => {
                          handleClick(e, item)
                          if (item.isReady) onClose()
                        }}
                        className={`
                          flex items-center px-3 py-3 rounded-xl transition-all duration-200
                          ${!item.isReady ? 'cursor-not-allowed opacity-60' : ''}
                          ${isActive(item.href) && item.isReady
                            ? 'bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300'
                            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                          }
                        `}
                      >
                        <item.icon className={`h-5 w-5 flex-shrink-0 ${
                          isActive(item.href) && item.isReady
                            ? 'text-purple-600 dark:text-purple-400'
                            : 'text-gray-500 dark:text-gray-500'
                        }`} />
                        <span className="ml-3 text-sm font-medium flex-1">
                          {item.name}
                        </span>
                        {!item.isReady && (
                          <LockClosedIcon className="h-4 w-4 text-gray-400 dark:text-gray-600" />
                        )}
                      </Link>
                    ))}
                  </div>
                )}
              </nav>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )

  return (
    <>
      {desktopSidebar}
      {mobileSidebar}
    </>
  )
}