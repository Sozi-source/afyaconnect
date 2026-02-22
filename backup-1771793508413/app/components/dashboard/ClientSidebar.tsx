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
  XMarkIcon
} from '@heroicons/react/24/outline'
import { motion, AnimatePresence } from 'framer-motion'

interface ClientSidebarProps {
  isOpen: boolean
  onClose: () => void
}

export function ClientSidebar({ isOpen, onClose }: ClientSidebarProps) {
  const pathname = usePathname()

  const navItems = [
    { name: 'Dashboard', href: '/client/dashboard', icon: HomeIcon },
    { name: 'Find Experts', href: '/client/dashboard/practitioners', icon: UserGroupIcon },
    { name: 'My Consultations', href: '/client/dashboard/consultations', icon: CalendarIcon },
    { name: 'Favorites', href: '/client/dashboard/favorites', icon: HeartIcon },
    { name: 'My Reviews', href: '/client/dashboard/reviews', icon: StarIcon },
    { name: 'Profile', href: '/client/dashboard/profile', icon: UserIcon },
  ]

  const secondaryNav = [
    { name: 'Settings', href: '/client/dashboard/settings', icon: Cog6ToothIcon },
    { name: 'Help & Support', href: '/client/dashboard/support', icon: DocumentTextIcon },
  ]

  const isActive = (href: string) => pathname === href || pathname?.startsWith(href + '/')

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

        <nav className="flex-1 overflow-y-auto py-4 px-3">
          <div className="space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center px-3 py-2.5 rounded-xl transition ${
                  isActive(item.href)
                    ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                <item.icon className="h-5 w-5" />
                <span className="ml-3 text-sm font-medium">{item.name}</span>
              </Link>
            ))}
          </div>

          <div className="my-4 border-t border-gray-200 dark:border-gray-800" />
          <div className="space-y-1">
            {secondaryNav.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center px-3 py-2.5 rounded-xl transition ${
                  isActive(item.href)
                    ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                <item.icon className="h-5 w-5" />
                <span className="ml-3 text-sm font-medium">{item.name}</span>
              </Link>
            ))}
          </div>
        </nav>
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
            {/* Mobile content similar to desktop but with close button */}
            <div className="flex justify-between items-center p-4 border-b">
              <Link href="/client/dashboard" onClick={onClose}>
                <span className="text-lg font-bold">Client Portal</span>
              </Link>
              <button onClick={onClose}>
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
            <nav className="p-4">
              {/* Same nav items as desktop */}
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