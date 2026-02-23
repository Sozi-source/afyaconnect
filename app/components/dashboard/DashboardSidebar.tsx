'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/app/contexts/AuthContext'
import { motion, AnimatePresence } from 'framer-motion'
import {
  HomeIcon,
  UserGroupIcon,
  CalendarIcon,
  StarIcon,
  UserIcon,
  ClockIcon,
  Cog6ToothIcon,
  ChartBarIcon,
  CurrencyDollarIcon,
  HeartIcon,
  BriefcaseIcon,
  DocumentTextIcon,
  ShieldCheckIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline'

interface DashboardSidebarProps {
  isOpen: boolean
  onClose: () => void
}

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

interface NavItem {
  name: string
  href: string
  icon: React.ElementType
  badge?: number
  roles: ('client' | 'practitioner' | 'admin')[]
}

export function DashboardSidebar({ isOpen, onClose }: DashboardSidebarProps) {
  const [mounted, setMounted] = useState(false)
  const pathname = usePathname()
  const { user } = useAuth()
  const extendedUser = user as ExtendedUser | null

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (window.innerWidth < 1024) {
      onClose()
    }
  }, [pathname, onClose])

  if (!mounted || !extendedUser) {
    return null
  }

  const userRole = extendedUser.role || 'client'
  const isVerified = extendedUser.is_verified
  const isAdmin = extendedUser.is_staff || false

  const effectiveRole = isAdmin ? 'admin' : 
                       (userRole === 'practitioner' && isVerified) ? 'practitioner' : 
                       'client'

  const navItems: NavItem[] = [
    { name: 'Dashboard', href: '/dashboard', icon: HomeIcon, roles: ['client', 'practitioner', 'admin'] },
    { name: 'Find Experts', href: '/dashboard/practitioners', icon: UserGroupIcon, roles: ['client'] },
    { name: 'Favorites', href: '/dashboard/favorites', icon: HeartIcon, roles: ['client'] },
    { name: 'My Practice', href: '/dashboard/practitioner', icon: ChartBarIcon, roles: ['practitioner'] },
    { name: 'Availability', href: '/dashboard/practitioner/availability', icon: ClockIcon, roles: ['practitioner'] },
    { name: 'Earnings', href: '/dashboard/practitioner/earnings', icon: CurrencyDollarIcon, roles: ['practitioner'] },
    { name: 'Consultations', href: '/dashboard/consultations', icon: CalendarIcon, roles: ['client', 'practitioner'] },
    { name: 'Reviews', href: '/dashboard/reviews', icon: StarIcon, roles: ['client', 'practitioner'] },
    { name: 'Profile', href: '/dashboard/profile', icon: UserIcon, roles: ['client', 'practitioner'] },
    { name: 'Admin Panel', href: '/admin', icon: ShieldCheckIcon, roles: ['admin'] },
  ]

  const secondaryNavItems: NavItem[] = [
    { name: 'Settings', href: '/dashboard/settings', icon: Cog6ToothIcon, roles: ['client', 'practitioner'] },
    { name: 'Help & Support', href: '/dashboard/support', icon: DocumentTextIcon, roles: ['client', 'practitioner'] },
  ]

  const getFilteredItems = (items: NavItem[]) => {
    return items.filter(item => item.roles.includes(effectiveRole as any))
  }

  const mainNav = getFilteredItems(navItems)
  const secondaryNav = getFilteredItems(secondaryNavItems)

  const isActive = (href: string) => {
    if (href === '/dashboard') return pathname === '/dashboard'
    if (href === '/admin') return pathname?.startsWith('/admin')
    return pathname?.startsWith(href) || false
  }

  const getUserInitials = () => {
    if (extendedUser.first_name && extendedUser.last_name) {
      return `${extendedUser.first_name[0]}${extendedUser.last_name[0]}`
    }
    if (extendedUser.first_name) {
      return extendedUser.first_name[0]
    }
    if (extendedUser.username) {
      return extendedUser.username[0].toUpperCase()
    }
    return 'U'
  }

  const getRoleBadge = () => {
    if (isAdmin) return { text: 'Admin', color: 'bg-purple-100 text-purple-800 border border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-800' }
    if (userRole === 'practitioner') {
      if (isVerified) {
        return { text: 'Verified Practitioner', color: 'bg-emerald-100 text-emerald-800 border border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-800' }
      } else {
        return { text: 'Pending Verification', color: 'bg-yellow-100 text-yellow-800 border border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-800' }
      }
    }
    return { text: 'Client', color: 'bg-blue-100 text-blue-800 border border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800' }
  }

  const roleInfo = getRoleBadge()

  // Desktop Sidebar
  const desktopSidebar = (
    <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-72 lg:flex-col">
      <div className="flex flex-col flex-1 min-h-0 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 shadow-xl">
        {/* Logo */}
        <div className="h-20 flex items-center px-6 border-b border-gray-200 dark:border-gray-800">
          <Link href="/client/dashboard" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center shadow-md group-hover:shadow-lg transition-all">
              <span className="text-white font-bold text-lg">NC</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                Nutri<span className="text-emerald-600">Connect</span>
              </h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {effectiveRole === 'practitioner' ? 'Practitioner Portal' : 'Client Portal'}
              </p>
            </div>
          </Link>
        </div>

        {/* User Profile Summary */}
        <div className="px-4 py-4 border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-md">
              {getUserInitials()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                {extendedUser.first_name 
                  ? `${extendedUser.first_name} ${extendedUser.last_name || ''}`.trim()
                  : extendedUser.username || 'User'}
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-400 truncate mt-0.5">
                {extendedUser.email}
              </p>
              <div className="mt-1.5">
                <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${roleInfo.color}`}>
                  {roleInfo.text}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-6 px-4 scrollbar-hide">
          <div className="space-y-1">
            {mainNav.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`
                  flex items-center px-3 py-3 rounded-xl transition-all duration-200 group
                  ${isActive(item.href)
                    ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 border-l-4 border-emerald-500'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }
                `}
              >
                <item.icon className={`h-5 w-5 flex-shrink-0 ${
                  isActive(item.href)
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : 'text-gray-500 dark:text-gray-500 group-hover:text-gray-700 dark:group-hover:text-gray-300'
                }`} />
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

          {secondaryNav.length > 0 && (
            <>
              <div className="my-6 border-t border-gray-200 dark:border-gray-800" />
              <div className="space-y-1">
                {secondaryNav.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`
                      flex items-center px-3 py-3 rounded-xl transition-all duration-200 group
                      ${isActive(item.href)
                        ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 border-l-4 border-emerald-500'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                      }
                    `}
                  >
                    <item.icon className={`h-5 w-5 flex-shrink-0 ${
                      isActive(item.href)
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : 'text-gray-500 dark:text-gray-500 group-hover:text-gray-700 dark:group-hover:text-gray-300'
                    }`} />
                    <span className="ml-3 text-sm font-medium">{item.name}</span>
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

  // Mobile Sidebar (similar color fixes applied)
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
            className="fixed inset-y-0 left-0 w-80 bg-white dark:bg-gray-900 z-50 lg:hidden shadow-2xl"
          >
            <div className="flex flex-col h-full">
              {/* Mobile Header */}
              <div className="flex items-center justify-between p-5 border-b border-gray-200 dark:border-gray-800">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center">
                    <span className="text-white font-bold text-lg">NC</span>
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                      NutriConnect
                    </h2>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {effectiveRole === 'practitioner' ? 'Practitioner Portal' : 'Client Portal'}
                    </p>
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
                    {getUserInitials()}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {extendedUser.first_name 
                        ? `${extendedUser.first_name} ${extendedUser.last_name || ''}`.trim()
                        : extendedUser.username || 'User'}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
                      {extendedUser.email}
                    </p>
                    <span className={`inline-flex items-center px-2 py-0.5 mt-1.5 rounded text-xs font-medium ${roleInfo.color}`}>
                      {roleInfo.text}
                    </span>
                  </div>
                </div>
              </div>

              {/* Mobile Navigation */}
              <nav className="flex-1 overflow-y-auto py-6 px-4">
                <div className="space-y-1">
                  {mainNav.map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={onClose}
                      className={`
                        flex items-center px-3 py-3 rounded-xl transition-all duration-200
                        ${isActive(item.href)
                          ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300'
                          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                        }
                      `}
                    >
                      <item.icon className={`h-5 w-5 flex-shrink-0 ${
                        isActive(item.href)
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : 'text-gray-500 dark:text-gray-500'
                      }`} />
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

                {secondaryNav.length > 0 && (
                  <>
                    <div className="my-6 border-t border-gray-200 dark:border-gray-800" />
                    <div className="space-y-1">
                      {secondaryNav.map((item) => (
                        <Link
                          key={item.name}
                          href={item.href}
                          onClick={onClose}
                          className={`
                            flex items-center px-3 py-3 rounded-xl transition-all duration-200
                            ${isActive(item.href)
                              ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300'
                              : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                            }
                          `}
                        >
                          <item.icon className={`h-5 w-5 flex-shrink-0 ${
                            isActive(item.href)
                              ? 'text-emerald-600 dark:text-emerald-400'
                              : 'text-gray-500 dark:text-gray-500'
                          }`} />
                          <span className="ml-3 text-sm font-medium">{item.name}</span>
                        </Link>
                      ))}
                    </div>
                  </>
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