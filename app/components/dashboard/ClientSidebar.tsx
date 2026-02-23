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

  // Desktop Sidebar
  const desktopSidebar = (
    <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-66 lg:flex-col">
      <div className="flex flex-col flex-1 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 shadow-xl">
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
              <p className="text-xs text-gray-500 dark:text-gray-400">Client Portal</p>
            </div>
          </Link>
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
        <nav className="flex-1 overflow-y-auto py-6 px-4">
          {/* Main Navigation */}
          <div className="space-y-1">
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider px-3 mb-2">
              Main Menu
            </p>
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                onClick={(e) => handleClick(e, item)}
                className={`
                  flex items-center px-3 py-3 rounded-xl transition-all duration-200 relative group
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
                    : 'text-gray-500 dark:text-gray-500'
                }`} />
                <span className="ml-3 text-sm font-medium flex-1">{item.name}</span>
                {!item.isReady && (
                  <>
                    <LockClosedIcon className="h-4 w-4 text-gray-400 dark:text-gray-600" />
                    <span className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 shadow-lg">
                      Coming soon
                    </span>
                  </>
                )}
              </Link>
            ))}
          </div>

          {/* Secondary Navigation */}
          <div className="mt-8">
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider px-3 mb-2">
              Support
            </p>
            <div className="space-y-1">
              {secondaryNav.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={(e) => handleClick(e, item)}
                  className={`
                    flex items-center px-3 py-3 rounded-xl transition-all duration-200 relative group
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
                      : 'text-gray-500 dark:text-gray-500'
                  }`} />
                  <span className="ml-3 text-sm font-medium flex-1">{item.name}</span>
                  {!item.isReady && (
                    <>
                      <LockClosedIcon className="h-4 w-4 text-gray-400 dark:text-gray-600" />
                      <span className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 shadow-lg">
                        Coming soon
                      </span>
                    </>
                  )}
                </Link>
              ))}
            </div>
          </div>
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

  // Mobile Sidebar
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
                    <p className="text-xs text-gray-500 dark:text-gray-400">Client Portal</p>
                  </div>
                </div>
                <button 
                  onClick={onClose} 
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                  aria-label="Close menu"
                >
                  <XMarkIcon className="h-5 w-5 text-gray-700 dark:text-gray-300" />
                </button>
              </div>

              {/* Coming Soon Toast */}
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

              {/* Mobile Navigation */}
              <nav className="flex-1 overflow-y-auto py-6 px-4">
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider px-3 mb-2">
                    Main Menu
                  </p>
                  {navItems.map((item) => (
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
                      <span className="ml-3 text-sm font-medium flex-1">{item.name}</span>
                      {!item.isReady && (
                        <LockClosedIcon className="h-4 w-4 text-gray-400 dark:text-gray-600" />
                      )}
                    </Link>
                  ))}
                </div>

                <div className="mt-8">
                  <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider px-3 mb-2">
                    Support
                  </p>
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
                        <span className="ml-3 text-sm font-medium flex-1">{item.name}</span>
                        {!item.isReady && (
                          <LockClosedIcon className="h-4 w-4 text-gray-400 dark:text-gray-600" />
                        )}
                      </Link>
                    ))}
                  </div>
                </div>
              </nav>

              {/* Mobile Footer */}
              <div className="p-4 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
                <p className="text-xs text-gray-600 dark:text-gray-400 text-center">
                  Version 2.0.0 • {new Date().getFullYear()}
                </p>
              </div>
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