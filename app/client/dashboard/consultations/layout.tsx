'use client'

import { ReactNode } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Calendar, Clock, CheckCircle, XCircle, CalendarRange } from 'lucide-react'

interface ConsultationsLayoutProps {
  children: ReactNode
}

export default function ConsultationsLayout({ children }: ConsultationsLayoutProps) {
  const pathname = usePathname()
  
  const tabs = [
    { name: 'Upcoming', href: '/dashboard/consultations/upcoming', icon: Clock },
    { name: 'Completed', href: '/dashboard/consultations/completed', icon: CheckCircle },
    { name: 'Cancelled', href: '/dashboard/consultations/cancelled', icon: XCircle },
    { name: 'All', href: '/dashboard/consultations/all', icon: CalendarRange },
  ]

  const isActive = (href: string) => {
    return pathname === href || pathname?.startsWith(href + '/')
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Header */}
      <div className="border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-5 lg:py-6">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">
            Consultations
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Manage and track all your consultations
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Mobile: Horizontal Scroll */}
          <div className="relative">
            {/* Left fade indicator */}
            <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-white dark:from-gray-900 to-transparent pointer-events-none sm:hidden"></div>
            
            {/* Scrollable tabs */}
            <div className="overflow-x-auto scrollbar-hide">
              <nav className="flex sm:flex-wrap gap-1 sm:gap-2 min-w-max sm:min-w-0 py-2">
                {tabs.map((tab) => {
                  const Icon = tab.icon
                  const active = isActive(tab.href)
                  
                  return (
                    <Link
                      key={tab.name}
                      href={tab.href}
                      className={`
                        inline-flex items-center px-3 sm:px-4 py-2.5 sm:py-3 
                        border-b-2 transition-all duration-200
                        text-xs sm:text-sm font-medium
                        whitespace-nowrap
                        ${active
                          ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400'
                          : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-700'
                        }
                      `}
                    >
                      <Icon className={`w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2 flex-shrink-0 ${
                        active ? 'text-emerald-500' : 'text-gray-500 dark:text-gray-500'
                      }`} />
                      <span>{tab.name}</span>
                    </Link>
                  )
                })}
              </nav>
            </div>
            
            {/* Right fade indicator */}
            <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-white dark:from-gray-900 to-transparent pointer-events-none sm:hidden"></div>
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        {/* Main Content - No fake stats */}
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
          {children}
        </div>
      </div>
    </div>
  )
}