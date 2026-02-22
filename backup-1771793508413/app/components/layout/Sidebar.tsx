'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/app/contexts/AuthContext'
import { motion } from 'framer-motion'
import {
  ChartBarIcon,
  UserGroupIcon,
  CalendarIcon,
  StarIcon,
  UserIcon,
  ClockIcon,
  Cog6ToothIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  HomeIcon,
  CurrencyDollarIcon,
  HeartIcon,
  BriefcaseIcon,
  DocumentTextIcon
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

interface SidebarItem {
  name: string
  href: string
  icon: React.ElementType
  badge?: number
  showFor?: ('client' | 'practitioner' | 'admin')[]
}

export const Sidebar = () => {
  const [collapsed, setCollapsed] = useState(false)
  const [mounted, setMounted] = useState(false)
  const pathname = usePathname()
  const { user, isAuthenticated } = useAuth()
  const extendedUser = user as ExtendedUser | null

  useEffect(() => {
    setMounted(true)
    const savedState = localStorage.getItem('sidebarCollapsed')
    if (savedState) {
      setCollapsed(JSON.parse(savedState))
    }
  }, [])

  const toggleSidebar = () => {
    setCollapsed(!collapsed)
    localStorage.setItem('sidebarCollapsed', JSON.stringify(!collapsed))
  }

  if (!mounted || !isAuthenticated || !extendedUser) return null

  const userRole = extendedUser.role || 'client'
  const isPractitioner = userRole === 'practitioner' && extendedUser.is_verified
  const isAdmin = extendedUser.is_staff || false

  // Define all possible navigation items with role requirements
  const allNavigationItems: SidebarItem[] = [
    { name: 'Home', href: '/dashboard', icon: HomeIcon, showFor: ['client', 'practitioner', 'admin'] },
    
    // Client-only items
    { name: 'Find Experts', href: '/dashboard/practitioners', icon: UserGroupIcon, showFor: ['client'] },
    { name: 'Favorites', href: '/dashboard/favorites', icon: HeartIcon, showFor: ['client'] },
    
    // Practitioner-only items
    { name: 'My Practice', href: '/dashboard/practitioner', icon: ChartBarIcon, showFor: ['practitioner'] },
    { name: 'Availability', href: '/dashboard/practitioner/availability', icon: ClockIcon, showFor: ['practitioner'] },
    { name: 'Earnings', href: '/dashboard/practitioner/earnings', icon: CurrencyDollarIcon, showFor: ['practitioner'] },
    
    // Shared items
    { name: 'Consultations', href: '/dashboard/consultations', icon: CalendarIcon, showFor: ['client', 'practitioner'] },
    { name: 'Reviews', href: '/dashboard/reviews', icon: StarIcon, showFor: ['client', 'practitioner'] },
    { name: 'Profile', href: '/dashboard/profile', icon: UserIcon, showFor: ['client', 'practitioner'] },
    
    // Admin items
    { name: 'Admin Panel', href: '/admin', icon: BriefcaseIcon, showFor: ['admin'] },
  ]

  const secondaryNavigationItems: SidebarItem[] = [
    { name: 'Settings', href: '/dashboard/settings', icon: Cog6ToothIcon, showFor: ['client', 'practitioner'] },
    { name: 'Help & Support', href: '/dashboard/support', icon: DocumentTextIcon, showFor: ['client', 'practitioner'] },
  ]

  // Filter items based on user role
  const getFilteredItems = (items: SidebarItem[]): SidebarItem[] => {
    return items.filter(item => {
      if (!item.showFor) return true
      if (isAdmin && item.showFor.includes('admin')) return true
      if (isPractitioner && item.showFor.includes('practitioner')) return true
      if (userRole === 'client' && item.showFor.includes('client')) return true
      return false
    })
  }

  const navigation = getFilteredItems(allNavigationItems)
  const secondaryNavigation = getFilteredItems(secondaryNavigationItems)

  const isActive = (href: string) => {
    if (href === '/dashboard') return pathname === '/dashboard'
    if (href === '/admin') return pathname?.startsWith('/admin')
    return pathname?.startsWith(href) || false
  }

  // Get user initials for avatar
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

  // Get user display name
  const getUserDisplayName = () => {
    if (extendedUser.first_name && extendedUser.last_name) {
      return `${extendedUser.first_name} ${extendedUser.last_name}`
    }
    if (extendedUser.first_name) {
      return extendedUser.first_name
    }
    if (extendedUser.username) {
      return extendedUser.username
    }
    return 'User'
  }

  // Get role badge text
  const getRoleBadge = () => {
    if (isAdmin) return 'Admin'
    if (isPractitioner) return 'Practitioner'
    return 'Client'
  }

  return (
    <motion.aside
      initial={{ width: collapsed ? 80 : 280 }}
      animate={{ width: collapsed ? 80 : 280 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className="fixed left-0 top-0 bottom-0 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 hidden lg:block overflow-hidden z-30"
    >
      <div className="relative h-full flex flex-col">
        {/* Logo */}
        <div className="h-20 flex items-center px-4 border-b border-gray-200 dark:border-gray-800">
          {!collapsed ? (
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">MC</span>
              </div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                Medi<span className="text-emerald-600">Connect</span>
              </h1>
            </Link>
          ) : (
            <Link href="/" className="mx-auto">
              <div className="w-8 h-8 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">MC</span>
              </div>
            </Link>
          )}
        </div>

        {/* Toggle button */}
        <button
          onClick={toggleSidebar}
          className="absolute -right-3 top-24 w-6 h-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors z-10 shadow-md"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? (
            <ChevronRightIcon className="h-4 w-4" />
          ) : (
            <ChevronLeftIcon className="h-4 w-4" />
          )}
        </button>

        {/* User profile summary (visible when expanded) */}
        {!collapsed && (
          <div className="px-4 py-4 border-b border-gray-200 dark:border-gray-800">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                {getUserInitials()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {getUserDisplayName()}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  {extendedUser.email}
                </p>
                <div className="mt-1">
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300">
                    {getRoleBadge()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 scrollbar-hide">
          <div className="space-y-1">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`
                  relative flex items-center px-3 py-2.5 rounded-xl transition-all duration-200 group
                  ${isActive(item.href)
                    ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }
                `}
              >
                <item.icon className="h-5 w-5 flex-shrink-0" />
                
                {!collapsed && (
                  <>
                    <span className="ml-3 text-sm font-medium flex-1">
                      {item.name}
                    </span>
                    {item.badge && (
                      <span className="px-2 py-0.5 text-xs font-medium bg-red-500 text-white rounded-full">
                        {item.badge}
                      </span>
                    )}
                  </>
                )}
                
                {collapsed && item.badge && (
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
                )}

                {/* Tooltip for collapsed mode */}
                {collapsed && (
                  <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50">
                    {item.name}
                    {item.badge && ` (${item.badge})`}
                  </div>
                )}
              </Link>
            ))}
          </div>

          {/* Secondary navigation */}
          {secondaryNavigation.length > 0 && (
            <>
              {!collapsed && (
                <div className="my-4 border-t border-gray-200 dark:border-gray-800" />
              )}

              <div className="space-y-1">
                {secondaryNavigation.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`
                      relative flex items-center px-3 py-2.5 rounded-xl transition-all duration-200 group
                      ${isActive(item.href)
                        ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400'
                        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                      }
                    `}
                  >
                    <item.icon className="h-5 w-5 flex-shrink-0" />
                    {!collapsed && (
                      <span className="ml-3 text-sm font-medium">
                        {item.name}
                      </span>
                    )}
                    {/* Tooltip for collapsed mode */}
                    {collapsed && (
                      <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50">
                        {item.name}
                      </div>
                    )}
                  </Link>
                ))}
              </div>
            </>
          )}
        </nav>

        {/* Footer - User info when collapsed */}
        {collapsed && (
          <div className="p-3 border-t border-gray-200 dark:border-gray-800">
            <div className="relative group">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl mx-auto flex items-center justify-center text-white font-medium">
                {getUserInitials()}
              </div>
              
              {/* Tooltip for user info */}
              <div className="absolute left-full ml-2 px-3 py-2 bg-gray-900 text-white text-xs rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50">
                <p className="font-medium">{getUserDisplayName()}</p>
                <p className="text-gray-400 mt-1">{extendedUser.email}</p>
                <p className="text-emerald-400 mt-1 capitalize">{getRoleBadge()}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </motion.aside>
  )
}