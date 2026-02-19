'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  HomeIcon,
  UserGroupIcon,
  CalendarIcon,
  ChartBarIcon,
  UserCircleIcon,
  PlusCircleIcon,
} from '@heroicons/react/24/outline'
import {
  HomeIcon as HomeIconSolid,
  UserGroupIcon as UserGroupIconSolid,
  CalendarIcon as CalendarIconSolid,
  ChartBarIcon as ChartBarIconSolid,
  UserCircleIcon as UserCircleIconSolid,
} from '@heroicons/react/24/solid'

interface NavItem {
  name: string
  href: string
  icon: React.ElementType
  activeIcon: React.ElementType
}

const navItems: NavItem[] = [
  {
    name: 'Home',
    href: '/dashboard',
    icon: HomeIcon,
    activeIcon: HomeIconSolid,
  },
  {
    name: 'Practitioners',
    href: '/dashboard/practitioners',
    icon: UserGroupIcon,
    activeIcon: UserGroupIconSolid,
  },
  {
    name: 'Consultations',
    href: '/dashboard/consultations',
    icon: CalendarIcon,
    activeIcon: CalendarIconSolid,
  },
  {
    name: 'Metrics',
    href: '/dashboard/metrics',
    icon: ChartBarIcon,
    activeIcon: ChartBarIconSolid,
  },
  {
    name: 'Profile',
    href: '/dashboard/profile',
    icon: UserCircleIcon,
    activeIcon: UserCircleIconSolid,
  },
]

export const MobileNav = () => {
  const [isVisible, setIsVisible] = useState(true)
  const [lastScrollY, setLastScrollY] = useState(0)
  const pathname = usePathname()

  useEffect(() => {
    const controlNavbar = () => {
      if (typeof window !== 'undefined') {
        if (window.scrollY > lastScrollY && window.scrollY > 100) {
          setIsVisible(false)
        } else {
          setIsVisible(true)
        }
        setLastScrollY(window.scrollY)
      }
    }

    window.addEventListener('scroll', controlNavbar)
    return () => window.removeEventListener('scroll', controlNavbar)
  }, [lastScrollY])

  // Add padding to body for mobile nav
  useEffect(() => {
    document.body.style.paddingBottom = '4rem'
    return () => {
      document.body.style.paddingBottom = '0'
    }
  }, [])

  return (
    <>
      {/* Floating Action Button */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.5 }}
        className="lg:hidden fixed bottom-20 right-4 z-50"
      >
        <Link
          href="/dashboard/consultations/create"
          className="flex items-center justify-center w-14 h-14 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full text-white shadow-lg hover:shadow-xl transition-shadow"
        >
          <PlusCircleIcon className="h-6 w-6" />
        </Link>
      </motion.div>

      {/* Bottom Navigation Bar */}
      <AnimatePresence>
        {isVisible && (
          <motion.nav
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            exit={{ y: 100 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="lg:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 z-40 px-2 pb-2 pt-1"
          >
            <div className="flex items-center justify-around">
              {navItems.map((item) => {
                const isActive = pathname === item.href
                const Icon = isActive ? item.activeIcon : item.icon

                return (
                  <Link
                    key={item.name}
                    href={item.href as any}
                    className={`
                      relative flex flex-col items-center pt-2 px-3 pb-1 rounded-lg
                      transition-colors
                      ${isActive 
                        ? 'text-primary-600 dark:text-primary-400' 
                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                      }
                    `}
                  >
                    <Icon className="h-6 w-6" />
                    <span className="text-xs mt-1 font-medium">
                      {item.name}
                    </span>
                    
                    {/* Active indicator */}
                    {isActive && (
                      <motion.div
                        layoutId="activeTab"
                        className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-primary-600 dark:bg-primary-400 rounded-full"
                        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                      />
                    )}
                  </Link>
                )
              })}
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </>
  )
}