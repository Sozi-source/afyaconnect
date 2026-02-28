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
  const isPractitioner = userRole === 'practitioner'

  const getNavItems = () => {
    // Base items that everyone gets (max 4 total)
    const items = [
      {
        name: 'Home',
        href: userRole === 'practitioner' ? '/practitioner/dashboard' : '/client/dashboard',
        icon: HomeIcon,
        activeIcon: HomeIconSolid,
      },
      {
        name: 'Consultations',
        href: userRole === 'practitioner' ? '/practitioner/dashboard/consultations' : '/client/dashboard/consultations',
        icon: CalendarIcon,
        activeIcon: CalendarIcon,
      },
    ]

    // Add role-specific items (keep total at 4)
    if (isPractitioner) {
      items.push({
        name: 'Schedule',
        href: '/practitioner/dashboard/availability',
        icon: ClockIcon,
        activeIcon: ClockIcon,
      })
      items.push({
        name: 'Profile',
        href: '/practitioner/dashboard/profile',
        icon: UserIcon,
        activeIcon: UserIcon,
      })
    } else {
      items.push({
        name: 'Experts',
        href: '/client/dashboard/practitioners',
        icon: UserGroupIcon,
        activeIcon: UserGroupIcon,
      })
      items.push({
        name: 'Profile',
        href: '/client/dashboard/profile',
        icon: UserIcon,
        activeIcon: UserIcon,
      })
    }

    return items // Always returns exactly 4 items
  }

  const navItems = getNavItems()

  const isActive = (href: string) => {
    return pathname === href || pathname?.startsWith(href + '/')
  }

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 z-30 shadow-lg">
      <div className="flex items-center justify-around px-2 py-1">
        {navItems.map((item) => {
          const active = isActive(item.href)
          const Icon = active ? item.activeIcon : item.icon

          return (
            <Link
              key={item.name}
              href={item.href}
              className="flex flex-col items-center p-2 min-w-[64px]"
            >
              <Icon 
                className={`h-5 w-5 sm:h-6 sm:w-6 ${
                  active 
                    ? 'text-emerald-600 dark:text-emerald-400' 
                    : 'text-gray-500 dark:text-gray-400'
                }`} 
              />
              <span 
                className={`text-[10px] sm:text-xs mt-0.5 ${
                  active 
                    ? 'text-emerald-600 dark:text-emerald-400 font-medium' 
                    : 'text-gray-500 dark:text-gray-400'
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