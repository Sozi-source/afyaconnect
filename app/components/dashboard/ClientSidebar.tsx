'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  HomeIcon,
  UserGroupIcon,
  CalendarIcon,
  StarIcon,
  UserIcon,
  HeartIcon,
  Cog6ToothIcon,
  DocumentTextIcon,
  XMarkIcon,
  LockClosedIcon
} from '@heroicons/react/24/outline'
import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'

interface ClientSidebarProps {
  isOpen: boolean
  onClose: () => void
}

// Define which pages are pending/not ready
const PENDING_PAGES = [
  '/client/dashboard/favorites',
  '/client/dashboard/settings',
  '/client/dashboard/support',
]

export function ClientSidebar({ isOpen, onClose }: ClientSidebarProps) {
  const pathname = usePathname()
  const [showComingSoon, setShowComingSoon] = useState<string | null>(null)

  const navItems = [
    { name: 'Dashboard', href: '/client/dashboard', icon: HomeIcon, isReady: true },
    { name: 'Find Experts', href: '/client/dashboard/practitioners', icon: UserGroupIcon, isReady: true },
    { name: 'My Consultations', href: '/client/dashboard/consultations', icon: CalendarIcon, isReady: true },
    { name: 'Favorites', href: '/client/dashboard/favorites', icon: HeartIcon, isReady: true },
    { name: 'My Reviews', href: '/client/dashboard/reviews', icon: StarIcon, isReady: true },
    { name: 'Profile', href: '/client/dashboard/profile', icon: UserIcon, isReady: true },
  ]

  const secondaryNav = [
    { name: 'Settings', href: '/client/dashboard/settings', icon: Cog6ToothIcon, isReady: false },
    { name: 'Help & Support', href: '/client/dashboard/support', icon: DocumentTextIcon, isReady: false },
  ]

  const isActive = (href: string) => pathname === href || pathname?.startsWith(href + '/')

  const handleClick = (e: React.MouseEvent, item: { name: string; href: string; isReady: boolean }) => {
    if (!item.isReady) {
      e.preventDefault()
      setShowComingSoon(item.name)
      setTimeout(() => setShowComingSoon(null), 2000)
    }
  }

  // Desktop sidebar
  const desktopSidebar = (
    <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
      <div className="flex flex-col flex-1 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800">
        <div className="h-20 flex items-center px-6 border-b">
          <Link href="/client/dashboard" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold">MC</span>
            </div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">
              Client<span className="text-emerald-600">Portal</span>
            </h1>
          </Link>
        </div>

        {/* Coming Soon Toast */}
        <AnimatePresence>
          {showComingSoon && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute top-24 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white px-4 py-2 rounded-lg text-sm z-50 whitespace-nowrap"
            >
              🔜 {showComingSoon} coming soon!
            </motion.div>
          )}
        </AnimatePresence>

        <nav className="flex-1 overflow-y-auto py-4 px-3">
          <div className="space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                onClick={(e) => handleClick(e, item)}
                className={`
                  flex items-center px-3 py-2.5 rounded-xl transition relative group
                  ${!item.isReady ? 'cursor-not-allowed opacity-50' : ''}
                  ${isActive(item.href) && item.isReady
                    ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }
                `}
              >
                <item.icon className="h-5 w-5" />
                <span className="ml-3 text-sm font-medium flex-1">{item.name}</span>
                {!item.isReady && (
                  <>
                    <LockClosedIcon className="h-4 w-4 text-gray-400" />
                    {/* Tooltip on hover */}
                    <span className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition pointer-events-none whitespace-nowrap z-50">
                      Coming soon
                    </span>
                  </>
                )}
              </Link>
            ))}
          </div>

          <div className="my-4 border-t border-gray-200 dark:border-gray-800" />
          <div className="space-y-1">
            {secondaryNav.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                onClick={(e) => handleClick(e, item)}
                className={`
                  flex items-center px-3 py-2.5 rounded-xl transition relative group
                  ${!item.isReady ? 'cursor-not-allowed opacity-50' : ''}
                  ${isActive(item.href) && item.isReady
                    ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }
                `}
              >
                <item.icon className="h-5 w-5" />
                <span className="ml-3 text-sm font-medium flex-1">{item.name}</span>
                {!item.isReady && (
                  <>
                    <LockClosedIcon className="h-4 w-4 text-gray-400" />
                    {/* Tooltip on hover */}
                    <span className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition pointer-events-none whitespace-nowrap z-50">
                      Coming soon
                    </span>
                  </>
                )}
              </Link>
            ))}
          </div>
        </nav>

        {/* Footer with version info */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-800">
          <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
            Version 1.0.0 • {new Date().getFullYear()}
          </p>
        </div>
      </div>
    </div>
  )

  // Mobile sidebar
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
            className="fixed inset-y-0 left-0 w-72 bg-white dark:bg-gray-900 z-50 lg:hidden shadow-xl"
          >
            <div className="flex flex-col h-full">
              {/* Mobile Header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800">
                <Link href="/client/dashboard" onClick={onClose}>
                  <span className="text-lg font-bold text-gray-900 dark:text-white">
                    Client Portal
                  </span>
                </Link>
                <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
                  <XMarkIcon className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                </button>
              </div>

              {/* Coming Soon Toast for Mobile */}
              <AnimatePresence>
                {showComingSoon && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute top-20 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white px-4 py-2 rounded-lg text-sm z-50 whitespace-nowrap"
                  >
                    🔜 {showComingSoon} coming soon!
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Mobile Navigation */}
              <nav className="flex-1 overflow-y-auto py-4 px-3">
                <div className="space-y-1">
                  {navItems.map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={(e) => {
                        handleClick(e, item)
                        if (item.isReady) onClose()
                      }}
                      className={`
                        flex items-center px-3 py-3 rounded-xl transition relative
                        ${!item.isReady ? 'cursor-not-allowed opacity-50' : ''}
                        ${isActive(item.href) && item.isReady
                          ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400'
                          : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                        }
                      `}
                    >
                      <item.icon className="h-5 w-5" />
                      <span className="ml-3 text-sm font-medium flex-1">{item.name}</span>
                      {!item.isReady && <LockClosedIcon className="h-4 w-4 text-gray-400" />}
                    </Link>
                  ))}
                </div>

                <div className="my-4 border-t border-gray-200 dark:border-gray-800" />
                <div className="space-y-1">
                  {secondaryNav.map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={(e) => {
                        handleClick(e, item)
                        if (item.isReady) onClose()
                      }}
                      className={`
                        flex items-center px-3 py-3 rounded-xl transition relative
                        ${!item.isReady ? 'cursor-not-allowed opacity-50' : ''}
                        ${isActive(item.href) && item.isReady
                          ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400'
                          : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                        }
                      `}
                    >
                      <item.icon className="h-5 w-5" />
                      <span className="ml-3 text-sm font-medium flex-1">{item.name}</span>
                      {!item.isReady && <LockClosedIcon className="h-4 w-4 text-gray-400" />}
                    </Link>
                  ))}
                </div>
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