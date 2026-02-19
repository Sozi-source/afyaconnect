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
} from '@heroicons/react/24/outline'

interface SidebarItem {
  name: string
  href: string
  icon: React.ElementType
  badge?: number
}

const navigation: SidebarItem[] = [
  { name: 'Home', href: '/dashboard', icon: HomeIcon },
  { name: 'Practitioners', href: '/dashboard/practitioners', icon: UserGroupIcon },
  { name: 'Consultations', href: '/dashboard/consultations', icon: CalendarIcon },
  { name: 'Reviews', href: '/dashboard/reviews', icon: StarIcon },
  { name: 'Profile', href: '/dashboard/profile', icon: UserIcon },
]

const secondaryNavigation: SidebarItem[] = [
  { name: 'Availability', href: '/dashboard/availability', icon: ClockIcon },
  { name: 'Settings', href: '/dashboard/settings', icon: Cog6ToothIcon },
]

export const Sidebar = () => {
  const [collapsed, setCollapsed] = useState(false)
  const [mounted, setMounted] = useState(false)
  const pathname = usePathname()
  const { isAuthenticated } = useAuth()

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

  if (!mounted || !isAuthenticated) return null

  const isActive = (href: string) => {
    if (href === '/dashboard') return pathname === '/dashboard'
    return pathname.startsWith(href)
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
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">NC</span>
              </div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                Nutri<span className="text-blue-600">Connect</span>
              </h1>
            </Link>
          ) : (
            <Link href="/" className="mx-auto">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">NC</span>
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

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-6 px-3 scrollbar-hide">
          <div className="space-y-1">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`
                  relative flex items-center px-3 py-2.5 rounded-xl transition-all duration-200 group
                  ${isActive(item.href)
                    ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400'
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
                    ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400'
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
        </nav>

        {/* User info when collapsed */}
        {collapsed && (
          <div className="p-3 border-t border-gray-200 dark:border-gray-800">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl mx-auto flex items-center justify-center text-white font-medium">
              U
            </div>
          </div>
        )}
      </div>
    </motion.aside>
  )
}