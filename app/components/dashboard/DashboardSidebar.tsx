'use client'

import { useState, useEffect, useMemo } from 'react'
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
  CheckCircleIcon
} from '@heroicons/react/24/outline'

interface DashboardSidebarProps {
  isOpen: boolean
  onClose: () => void
}

type UserRole = 'client' | 'practitioner' | 'admin'

interface NavItem {
  name: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  badge?: number | string
  roles: UserRole[]
}

export function DashboardSidebar({ isOpen, onClose }: DashboardSidebarProps) {
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

  // Log when user changes to debug
  useEffect(() => {
    console.log('🔄 DashboardSidebar - user updated:', user)
  }, [user])

  if (!mounted) {
    return null
  }

  // Recompute these values whenever user changes
  const userRole = (() => {
    if (!user) return 'client' // fallback
    if (user.is_staff) return 'admin'
    return user.role || 'client'
  })()

  const isVerified = user?.is_verified || false

  // Define navigation items with role-based hrefs
  const navItems: NavItem[] = [
    { 
      name: 'Dashboard', 
      href: `/${userRole}/dashboard`, 
      icon: HomeIcon, 
      roles: ['client', 'practitioner', 'admin'] 
    },
    // Client specific
    { 
      name: 'Find Experts', 
      href: '/client/dashboard/practitioners', 
      icon: UserGroupIcon, 
      roles: ['client'] 
    },
    { 
      name: 'Favorites', 
      href: '/client/dashboard/favorites', 
      icon: HeartIcon, 
      roles: ['client'] 
    },
    // Practitioner specific
    { 
      name: 'Availability', 
      href: '/practitioner/dashboard/availability', 
      icon: ClockIcon, 
      roles: ['practitioner'] 
    },
    { 
      name: 'Earnings', 
      href: '/practitioner/dashboard/earnings', 
      icon: CurrencyDollarIcon, 
      roles: ['practitioner'] 
    },
    // Admin specific
    { 
      name: 'Admin Dashboard', 
      href: '/admin/dashboard', 
      icon: ChartBarIcon, 
      roles: ['admin'] 
    },
    { 
      name: 'Users', 
      href: '/admin/users', 
      icon: UserGroupIcon, 
      roles: ['admin'] 
    },
    // Common
    { 
      name: 'Consultations', 
      href: `/${userRole}/dashboard/consultations`, 
      icon: CalendarIcon, 
      roles: ['client', 'practitioner', 'admin'] 
    },
    { 
      name: 'Reviews', 
      href: `/${userRole}/dashboard/reviews`, 
      icon: StarIcon, 
      roles: ['client', 'practitioner'] 
    },
    { 
      name: 'Profile', 
      href: `/${userRole}/dashboard/profile`, 
      icon: UserIcon, 
      roles: ['client', 'practitioner', 'admin'] 
    },
  ]

  const secondaryNav = [
    { name: 'Settings', href: `/${userRole}/dashboard/settings`, icon: Cog6ToothIcon, roles: ['client', 'practitioner', 'admin'] },
    { name: 'Help', href: `/${userRole}/dashboard/support`, icon: DocumentTextIcon, roles: ['client', 'practitioner', 'admin'] },
  ]

  // Filter items based on user role
  const mainNav = navItems.filter(item => item.roles.includes(userRole))
  const supportNav = secondaryNav.filter(item => item.roles.includes(userRole))

  const isActive = (href: string) => {
    return pathname === href || pathname?.startsWith(href + '/')
  }

  const getUserInitials = () => {
    if (!user) return 'U'
    if (user.first_name && user.last_name) {
      return `${user.first_name[0]}${user.last_name[0]}`
    }
    if (user.first_name) {
      return user.first_name[0]
    }
    if (user.email) {
      return user.email[0].toUpperCase()
    }
    return userRole === 'practitioner' ? 'P' : userRole === 'admin' ? 'A' : 'C'
  }

  const getRoleBadge = () => {
    if (userRole === 'admin') {
      return {
        text: 'Administrator',
        color: 'bg-purple-50 text-purple-700 border border-purple-200'
      }
    }
    if (userRole === 'practitioner') {
      if (isVerified) {
        return {
          text: 'Verified Practitioner',
          color: 'bg-teal-50 text-teal-700 border border-teal-200'
        }
      } else {
        return {
          text: 'Pending Verification',
          color: 'bg-amber-50 text-amber-700 border border-amber-200'
        }
      }
    }
    return {
      text: 'Client',
      color: 'bg-blue-50 text-blue-700 border border-blue-200'
    }
  }

  const roleInfo = getRoleBadge()
  const portalName = userRole === 'practitioner' 
    ? 'Practitioner Portal' 
    : userRole === 'admin' 
    ? 'Admin Portal' 
    : 'Client Portal'

  const displayName = user 
    ? (user.first_name 
        ? `${user.first_name} ${user.last_name || ''}`.trim()
        : user.email?.split('@')[0] || 'User')
    : 'User'

  // Don't render if no user
  if (!user) {
    return null
  }

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-72 lg:flex-col">
        <div className="flex flex-col flex-1 min-h-0 bg-white border-r border-gray-200">
          {/* Logo */}
          <div className="h-20 flex items-center px-6 border-b border-gray-200">
            <Link href={`/${userRole}/dashboard`} className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-teal-500 to-teal-600 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-lg">NC</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  Nutri<span className="text-teal-600">Connect</span>
                </h1>
                <p className="text-xs text-gray-500">{portalName}</p>
              </div>
            </Link>
          </div>

          {/* User Profile */}
          <div className="px-4 py-4 border-b border-gray-200 bg-gray-50">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-teal-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                {getUserInitials()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {displayName}
                </p>
                <p className="text-xs text-gray-500 truncate mt-0.5">
                  {user.email}
                </p>
                <div className="mt-1.5">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${roleInfo.color}`}>
                    {roleInfo.text}
                    {isVerified && userRole === 'practitioner' && (
                      <CheckCircleIcon className="ml-1 h-3 w-3" />
                    )}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto py-6 px-4">
            <div className="space-y-1">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-3 mb-2">
                Main Menu
              </p>
              {mainNav.map((item) => {
                const active = isActive(item.href)
                const Icon = item.icon

                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`
                      flex items-center px-3 py-3 rounded-xl transition-all duration-200
                      ${active
                        ? 'bg-teal-50 text-teal-700'
                        : 'text-gray-700 hover:bg-gray-50'
                      }
                    `}
                  >
                    <Icon className={`h-5 w-5 flex-shrink-0 ${
                      active ? 'text-teal-600' : 'text-gray-400'
                    }`} />
                    <span className="ml-3 text-sm font-medium flex-1">
                      {item.name}
                    </span>
                  </Link>
                )
              })}
            </div>

            {supportNav.length > 0 && (
              <div className="mt-8">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-3 mb-2">
                  Support
                </p>
                <div className="space-y-1">
                  {supportNav.map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      className="flex items-center px-3 py-3 rounded-xl text-gray-700 hover:bg-gray-50"
                    >
                      <item.icon className="h-5 w-5 text-gray-400" />
                      <span className="ml-3 text-sm font-medium">
                        {item.name}
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200">
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-xs text-gray-600 text-center">
                Version 2.0.0
              </p>
              <p className="text-xs text-gray-500 text-center mt-1">
                © {new Date().getFullYear()} NutriConnect
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Sidebar */}
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
              className="fixed inset-y-0 left-0 w-80 bg-white z-50 lg:hidden shadow-2xl"
            >
              <div className="flex flex-col h-full">
                {/* Mobile Header */}
                <div className="flex items-center justify-between p-5 border-b border-gray-200">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-teal-500 to-teal-600 rounded-xl flex items-center justify-center">
                      <span className="text-white font-bold text-lg">NC</span>
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-gray-900">
                        NutriConnect
                      </h2>
                      <p className="text-xs text-gray-500">{portalName}</p>
                    </div>
                  </div>
                  <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
                    <XMarkIcon className="h-5 w-5 text-gray-600" />
                  </button>
                </div>

                {/* Mobile User Info */}
                <div className="p-4 border-b border-gray-200 bg-gray-50">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-teal-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                      {getUserInitials()}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{displayName}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{user.email}</p>
                      <span className={`inline-flex items-center px-2 py-0.5 mt-1.5 rounded text-xs font-medium ${roleInfo.color}`}>
                        {roleInfo.text}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Mobile Navigation */}
                <nav className="flex-1 overflow-y-auto py-6 px-4">
                  <div className="space-y-1">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-3 mb-2">
                      Main Menu
                    </p>
                    {mainNav.map((item) => (
                      <Link
                        key={item.name}
                        href={item.href}
                        onClick={onClose}
                        className={`
                          flex items-center px-3 py-3 rounded-xl
                          ${isActive(item.href)
                            ? 'bg-teal-50 text-teal-700'
                            : 'text-gray-700 hover:bg-gray-50'
                          }
                        `}
                      >
                        <item.icon className={`h-5 w-5 ${
                          isActive(item.href) ? 'text-teal-600' : 'text-gray-400'
                        }`} />
                        <span className="ml-3 text-sm font-medium">
                          {item.name}
                        </span>
                      </Link>
                    ))}
                  </div>
                </nav>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}