'use client'

import { Suspense, lazy, useEffect, useState } from 'react'
import { useAuth } from '@/app/contexts/AuthContext'

// Lazy load the header component
const DashboardHeader = lazy(() => 
  import('@/app/components/dashboard/DashboardHeader').then(mod => ({ default: mod.DashboardHeader }))
)

interface LazyDashboardHeaderProps {
  onMenuClick: () => void
}

export function LazyDashboardHeader({ onMenuClick }: LazyDashboardHeaderProps) {
  const { user, isLoading } = useAuth()
  const [shouldRender, setShouldRender] = useState(false)

  useEffect(() => {
    // Only render the actual header when we have user data and not loading
    if (!isLoading && user) {
      setShouldRender(true)
    }
  }, [isLoading, user])

  // Show skeleton while loading or if no user
  if (isLoading || !user || !shouldRender) {
    return (
      <header className="fixed top-0 right-0 left-0 lg:left-72 z-40 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            <div className="flex items-center flex-1">
              <div className="lg:hidden p-2 mr-3">
                <div className="h-5 w-5 bg-gray-200 dark:bg-gray-800 rounded animate-pulse"></div>
              </div>
              <div className="h-6 w-32 bg-gray-200 dark:bg-gray-800 rounded animate-pulse"></div>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="h-8 w-8 bg-gray-200 dark:bg-gray-800 rounded-lg animate-pulse"></div>
              <div className="h-8 w-8 bg-gray-200 dark:bg-gray-800 rounded-lg animate-pulse"></div>
              <div className="flex items-center space-x-2">
                <div className="h-10 w-10 bg-gray-200 dark:bg-gray-800 rounded-lg animate-pulse"></div>
                <div className="hidden lg:block space-y-2">
                  <div className="h-4 w-24 bg-gray-200 dark:bg-gray-800 rounded animate-pulse"></div>
                  <div className="h-3 w-16 bg-gray-200 dark:bg-gray-800 rounded animate-pulse"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>
    )
  }

  return (
    <Suspense fallback={null}>
      <DashboardHeader onMenuClick={onMenuClick} />
    </Suspense>
  )
}