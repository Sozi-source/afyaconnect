'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
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
  CheckCircleIcon,
  ClipboardDocumentListIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline'
import { apiClient } from '@/app/lib/api'

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
  showIfVerified?: boolean
  showIfUnverified?: boolean
}

export function DashboardSidebar({ isOpen, onClose }: DashboardSidebarProps) {
  // ============================================================================
  // ALL HOOKS MUST BE AT THE TOP LEVEL
  // ============================================================================
  
  // State hooks
  const [mounted, setMounted] = useState(false)
  const [applicationStatus, setApplicationStatus] = useState<string | null>(null)
  const [hasApplication, setHasApplication] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  
  // Next.js hooks
  const pathname = usePathname()
  
  // Auth hook
  const { user, refreshUser } = useAuth()

  // Set mounted state immediately
  useEffect(() => {
    setMounted(true)
  }, [])

  // Determine user role
  const userRole = useMemo((): UserRole => {
    if (!user) return 'client'
    if (user.is_staff) return 'admin'
    return (user.role as UserRole) || 'client'
  }, [user])

  // Check if user is verified
  const isVerified = useMemo(() => user?.is_verified || false, [user?.is_verified])

  // Fetch application status
  const fetchApplicationStatus = useCallback(async () => {
    if (!user || user.role !== 'practitioner') return
    
    try {
      const response = await apiClient.practitioners.applications.getStatus()
      setHasApplication(response.hasApplication)
      if (response.hasApplication && response.application) {
        setApplicationStatus(response.application.status)
      }
    } catch (error) {
      console.error('Failed to fetch application status:', error)
    }
  }, [user])

  // Refresh data
  const refreshData = useCallback(async () => {
    if (isRefreshing || !user) return
    
    setIsRefreshing(true)
    try {
      await refreshUser()
      if (user.role === 'practitioner') {
        await fetchApplicationStatus()
      }
    } finally {
      setIsRefreshing(false)
    }
  }, [user, isRefreshing, refreshUser, fetchApplicationStatus])

  // Fetch application status on mount and when user changes
  useEffect(() => {
    if (user?.role === 'practitioner') {
      fetchApplicationStatus()
    }
  }, [user?.id, user?.role, fetchApplicationStatus])

  // Poll for updates
  useEffect(() => {
    if (!user) return
    
    const interval = setInterval(() => {
      refreshData()
    }, 30000)
    
    return () => clearInterval(interval)
  }, [user, refreshData])

  // Refresh on visibility change
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && user) {
        refreshData()
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [user, refreshData])

  // Close sidebar on route change for mobile
  useEffect(() => {
    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
      onClose()
    }
  }, [pathname, onClose])

  // Compute role badge information
  const roleInfo = useMemo(() => {
    if (!user) {
      return {
        text: 'Loading...',
        color: 'bg-slate-50 text-slate-700 border border-slate-200',
        icon: UserIcon
      }
    }
    
    if (userRole === 'admin') {
      return {
        text: 'Administrator',
        color: 'bg-purple-50 text-purple-700 border border-purple-200',
        icon: ShieldCheckIcon
      }
    }
    if (userRole === 'practitioner') {
      if (isVerified) {
        return {
          text: 'Verified Practitioner',
          color: 'bg-teal-50 text-teal-700 border border-teal-200',
          icon: CheckCircleIcon
        }
      } else {
        let statusText = 'Pending Verification'
        if (hasApplication) {
          if (applicationStatus === 'pending') statusText = 'Application Under Review'
          else if (applicationStatus === 'draft') statusText = 'Complete Application'
          else if (applicationStatus === 'info_needed') statusText = 'Action Required'
          else if (applicationStatus === 'rejected') statusText = 'Application Rejected'
          else if (applicationStatus === 'approved') statusText = 'Application Approved'
        }
        
        return {
          text: statusText,
          color: applicationStatus === 'approved' 
            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
            : 'bg-amber-50 text-amber-700 border border-amber-200',
          icon: applicationStatus === 'approved' ? CheckCircleIcon : ClockIcon
        }
      }
    }
    return {
      text: 'Client',
      color: 'bg-blue-50 text-blue-700 border border-blue-200',
      icon: UserIcon
    }
  }, [user, userRole, isVerified, hasApplication, applicationStatus])

  // Navigation items
  const navItems = useMemo((): NavItem[] => [
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
      roles: ['practitioner'],
      showIfVerified: true
    },
    { 
      name: 'Earnings', 
      href: '/practitioner/dashboard/earnings', 
      icon: CurrencyDollarIcon, 
      roles: ['practitioner'],
      showIfVerified: true
    },
    { 
      name: 'Application', 
      href: '/practitioner/application', 
      icon: ClipboardDocumentListIcon, 
      roles: ['practitioner'],
      showIfUnverified: true
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
  ], [userRole])

  const secondaryNav = useMemo(() => [
    { name: 'Settings', href: `/${userRole}/dashboard/settings`, icon: Cog6ToothIcon, roles: ['client', 'practitioner', 'admin'] },
    { name: 'Help', href: `/${userRole}/dashboard/support`, icon: DocumentTextIcon, roles: ['client', 'practitioner', 'admin'] },
  ], [userRole])

  // ============================================================================
  // RENDER LOGIC
  // ============================================================================
  
  // Don't render anything if not mounted (prevents hydration issues)
  if (!mounted) {
    return null
  }

  // If no user, show a simplified sidebar or null
  if (!user) {
    return (
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-72 lg:flex-col">
        <div className="flex flex-col flex-1 min-h-0 bg-white border-r border-gray-200">
          <div className="h-20 flex items-center px-6 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-teal-500 to-teal-600 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-lg">NC</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  Nutri<span className="text-teal-600">Connect</span>
                </h1>
                <p className="text-xs text-gray-500">Loading...</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Filter navigation items
  const mainNav = navItems.filter(item => {
    if (!item.roles.includes(userRole)) return false
    if (item.showIfVerified === true && !isVerified) return false
    if (item.showIfUnverified === true && isVerified) return false
    return true
  })

  const supportNav = secondaryNav.filter(item => item.roles.includes(userRole))

  const isActive = (href: string) => {
    return pathname === href || pathname?.startsWith(href + '/')
  }

  const getUserInitials = () => {
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

  const RoleIcon = roleInfo.icon
  const portalName = userRole === 'practitioner' 
    ? 'Practitioner Portal' 
    : userRole === 'admin' 
    ? 'Admin Portal' 
    : 'Client Portal'

  const displayName = user.first_name 
    ? `${user.first_name} ${user.last_name || ''}`.trim()
    : user.email?.split('@')[0] || 'User'

  return (
    <>
      {/* Desktop Sidebar - Always visible on large screens */}
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
                <div className="mt-1.5 flex items-center gap-2">
                  <span 
                    key={`${isVerified}-${applicationStatus}`} 
                    className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${roleInfo.color}`}
                  >
                    <RoleIcon className="mr-1 h-3 w-3" />
                    {roleInfo.text}
                  </span>
                  <button
                    onClick={refreshData}
                    disabled={isRefreshing}
                    className="text-xs text-teal-600 hover:text-teal-700 disabled:opacity-50"
                    title="Refresh status"
                  >
                    <ArrowPathIcon className={`h-3 w-3 ${isRefreshing ? 'animate-spin' : ''}`} />
                  </button>
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
                    {item.name === 'Application' && applicationStatus && (
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        applicationStatus === 'draft' ? 'bg-slate-100 text-slate-600' :
                        applicationStatus === 'pending' ? 'bg-amber-100 text-amber-600' :
                        applicationStatus === 'info_needed' ? 'bg-blue-100 text-blue-600' :
                        applicationStatus === 'rejected' ? 'bg-red-100 text-red-600' :
                        'bg-emerald-100 text-emerald-600'
                      }`}>
                        {applicationStatus === 'approved' ? 'Approved' : applicationStatus.replace('_', ' ')}
                      </span>
                    )}
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

      {/* Mobile Sidebar - Only shown when isOpen is true */}
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
                      <div className="mt-1.5 flex items-center gap-2">
                        <span 
                          key={`${isVerified}-${applicationStatus}-mobile`} 
                          className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${roleInfo.color}`}
                        >
                          <RoleIcon className="mr-1 h-3 w-3" />
                          {roleInfo.text}
                        </span>
                        <button
                          onClick={refreshData}
                          disabled={isRefreshing}
                          className="text-xs text-teal-600 hover:text-teal-700 disabled:opacity-50"
                          title="Refresh status"
                        >
                          <ArrowPathIcon className={`h-3 w-3 ${isRefreshing ? 'animate-spin' : ''}`} />
                        </button>
                      </div>
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
                        {item.name === 'Application' && applicationStatus && (
                          <span className={`ml-2 text-xs px-2 py-1 rounded-full ${
                            applicationStatus === 'draft' ? 'bg-slate-100 text-slate-600' :
                            applicationStatus === 'pending' ? 'bg-amber-100 text-amber-600' :
                            applicationStatus === 'info_needed' ? 'bg-blue-100 text-blue-600' :
                            applicationStatus === 'rejected' ? 'bg-red-100 text-red-600' :
                            'bg-emerald-100 text-emerald-600'
                          }`}>
                            {applicationStatus === 'approved' ? 'Approved' : applicationStatus.replace('_', ' ')}
                          </span>
                        )}
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