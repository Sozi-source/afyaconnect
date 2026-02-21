'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/app/contexts/AuthContext'
import {
  HomeIcon,
  CalendarIcon,
  UserGroupIcon,
  UserIcon,
  HeartIcon,
  ClockIcon
} from '@heroicons/react/24/outline'
import { HomeIcon as HomeIconSolid } from '@heroicons/react/24/solid'

interface ExtendedUser {
  id: number
  email: string
  role?: string
  is_verified?: boolean
}

export function DashboardMobileNav() {
  const [mounted, setMounted] = useState(false)
  const pathname = usePathname()
  const { user } = useAuth()
  const extendedUser = user as ExtendedUser | null

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted || !extendedUser) return null

  const userRole = extendedUser.role || 'client'
  const isPractitioner = userRole === 'practitioner' && extendedUser.is_verified

  const getNavItems = () => {
    const baseItems = [
      {
        name: 'Home',
        href: '/dashboard',
        icon: HomeIcon,
        activeIcon: HomeIconSolid,
      },
      {
        name: 'Consultations',
        href: '/dashboard/consultations',
        icon: CalendarIcon,
        activeIcon: CalendarIcon,
      },
    ]

    if (isPractitioner) {
      return [
        ...baseItems,
        {
          name: 'Practice',
          href: '/dashboard/practitioner',
          icon: ClockIcon,
          activeIcon: ClockIcon,
        },
        {
          name: 'Profile',
          href: '/dashboard/profile',
          icon: UserIcon,
          activeIcon: UserIcon,
        },
      ]
    } else {
      return [
        ...baseItems,
        {
          name: 'Experts',
          href: '/dashboard/practitioners',
          icon: UserGroupIcon,
          activeIcon: UserGroupIcon,
        },
        {
          name: 'Favorites',
          href: '/dashboard/favorites',
          icon: HeartIcon,
          activeIcon: HeartIcon,
        },
      ]
    }
  }

  const navItems = getNavItems()

  const isActive = (href: string) => {
    if (href === '/dashboard') return pathname === '/dashboard'
    return pathname?.startsWith(href) || false
  }

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 z-30">
      <div className="flex items-center justify-around px-2 py-2">
        {navItems.map((item) => {
          const active = isActive(item.href)
          const Icon = active ? item.activeIcon : item.icon

          return (
            <Link
              key={item.name}
              href={item.href}
              className="flex flex-col items-center p-2"
            >
              <Icon 
                className={`h-6 w-6 ${
                  active 
                    ? 'text-emerald-600 dark:text-emerald-400' 
                    : 'text-gray-600 dark:text-gray-400'
                }`} 
              />
              <span 
                className={`text-xs mt-1 ${
                  active 
                    ? 'text-emerald-600 dark:text-emerald-400 font-medium' 
                    : 'text-gray-600 dark:text-gray-400'
                }`}
              >
                {item.name}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}