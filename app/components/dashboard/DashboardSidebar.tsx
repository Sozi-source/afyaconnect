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
  XMarkIcon
} from '@heroicons/react/24/outline'

interface DashboardSidebarProps {
  isOpen: boolean
  onClose: () => void
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
    // Close sidebar on route change (mobile)
    if (window.innerWidth < 1024) {
      onClose()
    }
  }, [pathname, onClose])

  if (!mounted || !extendedUser) return null

  const userRole = extendedUser.role || 'client'
  const isPractitioner = userRole === 'practitioner' && extendedUser.is_verified
  const isAdmin = extendedUser.is_staff || false

  // Define all navigation items with role requirements
  const navItems: NavItem[] = [
    { name: 'Dashboard', href: '/dashboard', icon: HomeIcon, roles: ['client', 'practitioner', 'admin'] },
    
    // Client items
    { name: 'Find Experts', href: '/dashboard/practitioners', icon: UserGroupIcon, roles: ['client'] },
    { name: 'Favorites', href: '/dashboard/favorites', icon: HeartIcon, roles: ['client'] },
    
    // Practitioner items
    { name: 'My Practice', href: '/dashboard/practitioner', icon: ChartBarIcon, roles: ['practitioner'] },
    { name: 'Availability', href: '/dashboard/practitioner/availability', icon: ClockIcon, roles: ['practitioner'] },
    { name: 'Earnings', href: '/dashboard/practitioner/earnings', icon: CurrencyDollarIcon, roles: ['practitioner'] },
    
    // Shared items
    { name: 'Consultations', href: '/dashboard/consultations', icon: CalendarIcon, roles: ['client', 'practitioner'] },
    { name: 'Reviews', href: '/dashboard/reviews', icon: StarIcon, roles: ['client', 'practitioner'] },
    { name: 'Profile', href: '/dashboard/profile', icon: UserIcon, roles: ['client', 'practitioner'] },
    
    // Admin items
    { name: 'Admin Panel', href: '/admin', icon: ShieldCheckIcon, roles: ['admin'] },
  ]

  const secondaryNavItems: NavItem[] = [
    { name: 'Settings', href: '/dashboard/settings', icon: Cog6ToothIcon, roles: ['client', 'practitioner'] },
    { name: 'Help & Support', href: '/dashboard/support', icon: DocumentTextIcon, roles: ['client', 'practitioner'] },
  ]

  // Filter items based on user role
  const getFilteredItems = (items: NavItem[]) => {
    return items.filter(item => {
      if (isAdmin && item.roles.includes('admin')) return true
      if (isPractitioner && item.roles.includes('practitioner')) return true
      if (userRole === 'client' && item.roles.includes('client')) return true
      return false
    })
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
    if (isAdmin) return { text: 'Admin', color: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300' }
    if (isPractitioner) return { text: 'Practitioner', color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300' }
    return { text: 'Client', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' }
  }

  const roleInfo = getRoleBadge()

  // Desktop Sidebar
  const desktopSidebar = (
    <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
      <div className="flex flex-col flex-1 min-h-0 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800">
        {/* Logo */}
        <div className="h-20 flex items-center px-6 border-b border-gray-200 dark:border-gray-800">
          <Link href="/dashboard" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold">MC</span>
            </div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">
              Medi<span className="text-emerald-600">Connect</span>
            </h1>
          </Link>
        </div>

        {/* User Profile Summary */}
        <div className="px-4 py-4 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
              {getUserInitials()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                {extendedUser.first_name 
                  ? `${extendedUser.first_name} ${extendedUser.last_name || ''}`.trim()
                  : extendedUser.username || 'User'}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                {extendedUser.email}
              </p>
              <div className="mt-1">
                <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${roleInfo.color}`}>
                  {roleInfo.text}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 scrollbar-hide">
          <div className="space-y-1">
            {mainNav.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`
                  flex items-center px-3 py-2.5 rounded-xl transition-all duration-200
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

          {secondaryNav.length > 0 && (
            <>
              <div className="my-4 border-t border-gray-200 dark:border-gray-800" />
              <div className="space-y-1">
                {secondaryNav.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`
                      flex items-center px-3 py-2.5 rounded-xl transition-all duration-200
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
            </>
          )}
        </nav>
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
            className="fixed inset-y-0 left-0 w-72 bg-white dark:bg-gray-900 z-50 lg:hidden shadow-xl"
          >
            <div className="flex flex-col h-full">
              {/* Mobile Header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800">
                <Link href="/dashboard" className="flex items-center space-x-2" onClick={onClose}>
                  <div className="w-8 h-8 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold">MC</span>
                  </div>
                  <span className="text-lg font-bold text-gray-900 dark:text-white">
                    Medi<span className="text-emerald-600">Connect</span>
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
              <div className="p-4 border-b border-gray-200 dark:border-gray-800">
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
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {extendedUser.email}
                    </p>
                    <span className={`inline-flex items-center px-2 py-0.5 mt-1 rounded text-xs font-medium ${roleInfo.color}`}>
                      {roleInfo.text}
                    </span>
                  </div>
                </div>
              </div>

              {/* Mobile Navigation */}
              <nav className="flex-1 overflow-y-auto py-4 px-3">
                <div className="space-y-1">
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

                {secondaryNav.length > 0 && (
                  <>
                    <div className="my-4 border-t border-gray-200 dark:border-gray-800" />
                    <div className="space-y-1">
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