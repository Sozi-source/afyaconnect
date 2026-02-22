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
} from '@heroicons/react/24/outline'

interface PractitionerSidebarProps {
  isOpen: boolean
  onClose: () => void
}

export function PractitionerSidebar({ isOpen, onClose }: PractitionerSidebarProps) {
  const [mounted, setMounted] = useState(false)
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

  // Main navigation items for practitioners
  const mainNav = [
    { 
      name: 'Dashboard', 
      href: '/practitioner/dashboard', 
      icon: HomeIcon,
      description: 'Overview of your practice'
    },
    { 
      name: 'Consultations', 
      href: '/practitioner/dashboard/consultations', 
      icon: CalendarIcon,
      description: 'Manage your appointments',
      badge: 3 // Example: number of upcoming consultations
    },
    { 
      name: 'Availability', 
      href: '/practitioner/dashboard/availability', 
      icon: ClockIcon,
      description: 'Set your weekly schedule'
    },
    { 
      name: 'Earnings', 
      href: '/practitioner/dashboard/earnings', 
      icon: CurrencyDollarIcon,
      description: 'Track your income'
    },
    { 
      name: 'Reviews', 
      href: '/practitioner/dashboard/reviews', 
      icon: StarIcon,
      description: 'See what clients say'
    },
    { 
      name: 'Profile', 
      href: '/practitioner/dashboard/profile', 
      icon: UserIcon,
      description: 'Manage your public profile'
    },
  ]

  const secondaryNav = [
    { 
      name: 'Analytics', 
      href: '/practitioner/dashboard/analytics', 
      icon: ChartBarIcon,
      description: 'Practice insights'
    },
    { 
      name: 'Resources', 
      href: '/practitioner/dashboard/resources', 
      icon: BriefcaseIcon,
      description: 'Professional resources'
    },
    { 
      name: 'Settings', 
      href: '/practitioner/dashboard/settings', 
      icon: Cog6ToothIcon,
      description: 'Account settings'
    },
    { 
      name: 'Help & Support', 
      href: '/practitioner/dashboard/support', 
      icon: DocumentTextIcon,
      description: 'Get assistance'
    },
  ]

  // Admin link - only show if user is staff
  const adminNav = user?.is_staff ? [
    { 
      name: 'Admin Panel', 
      href: '/admin', 
      icon: ShieldCheckIcon,
      description: 'Administration'
    }
  ] : []

  // Desktop Sidebar
  const desktopSidebar = (
    <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
      <div className="flex flex-col flex-1 min-h-0 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800">
        {/* Logo */}
        <div className="h-20 flex items-center px-6 border-b border-gray-200 dark:border-gray-800">
          <Link href="/practitioner/dashboard" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold">MP</span>
            </div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">
              Medi<span className="text-emerald-600">Practice</span>
            </h1>
          </Link>
        </div>

        {/* User Profile Summary */}
        <div className="px-4 py-4 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
              {getInitials()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                Dr. {user?.first_name} {user?.last_name}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                {user?.email}
              </p>
              <div className="mt-1">
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300">
                  {user?.is_verified ? '✅ Verified' : '⏳ Pending'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 scrollbar-hide">
          {/* Main Navigation */}
          <div className="space-y-1">
            {mainNav.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`
                  group flex items-center px-3 py-2.5 rounded-xl transition-all duration-200 relative
                  ${isActive(item.href)
                    ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }
                `}
              >
                <item.icon className="h-5 w-5 flex-shrink-0" />
                <span className="ml-3 text-sm font-medium flex-1">
                  {item.name}
                </span>
                {item.badge && (
                  <span className="px-2 py-0.5 text-xs font-medium bg-red-500 text-white rounded-full">
                    {item.badge}
                  </span>
                )}
                
                {/* Tooltip on hover */}
                <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                  {item.description}
                </div>
              </Link>
            ))}
          </div>

          {/* Secondary Navigation */}
          {secondaryNav.length > 0 && (
            <>
              <div className="my-4 border-t border-gray-200 dark:border-gray-800" />
              <div className="space-y-1">
                {secondaryNav.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`
                      group flex items-center px-3 py-2.5 rounded-xl transition-all duration-200 relative
                      ${isActive(item.href)
                        ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400'
                        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                      }
                    `}
                  >
                    <item.icon className="h-5 w-5 flex-shrink-0" />
                    <span className="ml-3 text-sm font-medium flex-1">
                      {item.name}
                    </span>
                    
                    {/* Tooltip on hover */}
                    <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                      {item.description}
                    </div>
                  </Link>
                ))}
              </div>
            </>
          )}

          {/* Admin Navigation */}
          {adminNav.length > 0 && (
            <>
              <div className="my-4 border-t border-gray-200 dark:border-gray-800" />
              <div className="space-y-1">
                {adminNav.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`
                      group flex items-center px-3 py-2.5 rounded-xl transition-all duration-200 relative
                      ${isActive(item.href)
                        ? 'bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400'
                        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                      }
                    `}
                  >
                    <item.icon className="h-5 w-5 flex-shrink-0" />
                    <span className="ml-3 text-sm font-medium flex-1">
                      {item.name}
                    </span>
                    
                    {/* Tooltip on hover */}
                    <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                      {item.description}
                    </div>
                  </Link>
                ))}
              </div>
            </>
          )}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-800">
          <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
            <p>© 2024 MediConnect</p>
            <p className="mt-1">Practitioner Portal</p>
          </div>
        </div>
      </div>
    </div>
  )

  // Mobile Sidebar (Drawer)
  const mobileSidebar = (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          />
          
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'tween', duration: 0.3 }}
            className="fixed inset-y-0 left-0 w-72 bg-white dark:bg-gray-900 z-50 lg:hidden shadow-xl overflow-y-auto"
          >
            {/* Mobile Header */}
            <div className="sticky top-0 bg-white dark:bg-gray-900 z-10">
              <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800">
                <Link href="/practitioner/dashboard" className="flex items-center space-x-2" onClick={onClose}>
                  <div className="w-8 h-8 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold">MP</span>
                  </div>
                  <span className="text-lg font-bold text-gray-900 dark:text-white">
                    Medi<span className="text-emerald-600">Practice</span>
                  </span>
                </Link>
                <button
                  onClick={onClose}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  <XMarkIcon className="h-5 w-5 text-gray-600 dark:text-gray-300" />
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
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {user?.email}
                    </p>
                    <span className="inline-flex items-center px-2 py-0.5 mt-1 rounded text-xs font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300">
                      {user?.is_verified ? '✅ Verified' : '⏳ Pending'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Mobile Navigation */}
            <nav className="p-4 space-y-6">
              {/* Main Navigation */}
              <div className="space-y-1">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-3 mb-2">
                  Main
                </p>
                {mainNav.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={onClose}
                    className={`
                      flex items-center px-3 py-3 rounded-xl transition-all duration-200
                      ${isActive(item.href)
                        ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400'
                        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                      }
                    `}
                  >
                    <item.icon className="h-5 w-5 flex-shrink-0" />
                    <span className="ml-3 text-sm font-medium flex-1">
                      {item.name}
                    </span>
                    {item.badge && (
                      <span className="px-2 py-0.5 text-xs font-medium bg-red-500 text-white rounded-full">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                ))}
              </div>

              {/* Secondary Navigation */}
              <div className="space-y-1">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-3 mb-2">
                  Resources
                </p>
                {secondaryNav.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={onClose}
                    className={`
                      flex items-center px-3 py-3 rounded-xl transition-all duration-200
                      ${isActive(item.href)
                        ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400'
                        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                      }
                    `}
                  >
                    <item.icon className="h-5 w-5 flex-shrink-0" />
                    <span className="ml-3 text-sm font-medium">{item.name}</span>
                  </Link>
                ))}
              </div>

              {/* Admin Navigation */}
              {adminNav.length > 0 && (
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-3 mb-2">
                    Admin
                  </p>
                  {adminNav.map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={onClose}
                      className={`
                        flex items-center px-3 py-3 rounded-xl transition-all duration-200
                        ${isActive(item.href)
                          ? 'bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400'
                          : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                        }
                      `}
                    >
                      <item.icon className="h-5 w-5 flex-shrink-0" />
                      <span className="ml-3 text-sm font-medium">{item.name}</span>
                    </Link>
                  ))}
                </div>
              )}
            </nav>
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