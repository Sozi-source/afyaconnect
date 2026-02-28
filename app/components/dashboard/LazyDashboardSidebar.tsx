'use client'

import { Suspense, lazy, useEffect, useState } from 'react'
import { useAuth } from '@/app/contexts/AuthContext'

// Lazy load the sidebar component
const DashboardSidebar = lazy(() => 
  import('@/app/components/dashboard/DashboardSidebar').then(mod => ({ default: mod.DashboardSidebar }))
)

interface LazyDashboardSidebarProps {
  isOpen: boolean
  onClose: () => void
}

export function LazyDashboardSidebar({ isOpen, onClose }: LazyDashboardSidebarProps) {
  const { user, isLoading } = useAuth()
  const [shouldRender, setShouldRender] = useState(false)

  useEffect(() => {
    // Only render the actual sidebar when we have user data and not loading
    if (!isLoading && user) {
      setShouldRender(true)
    }
  }, [isLoading, user])

  // Show skeleton while loading or if no user
  if (isLoading || !user || !shouldRender) {
    return (
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-72 lg:flex-col">
        <div className="flex flex-col flex-1 min-h-0 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800">
          {/* Skeleton loader */}
          <div className="h-20 flex items-center px-6 border-b border-gray-200 dark:border-gray-800">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gray-200 dark:bg-gray-800 rounded-xl animate-pulse"></div>
              <div className="space-y-2">
                <div className="h-5 w-32 bg-gray-200 dark:bg-gray-800 rounded animate-pulse"></div>
                <div className="h-3 w-24 bg-gray-200 dark:bg-gray-800 rounded animate-pulse"></div>
              </div>
            </div>
          </div>
          
          {/* User profile skeleton */}
          <div className="px-4 py-4 border-b border-gray-200 dark:border-gray-800">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gray-200 dark:bg-gray-800 rounded-full animate-pulse"></div>
              <div className="space-y-2 flex-1">
                <div className="h-4 w-24 bg-gray-200 dark:bg-gray-800 rounded animate-pulse"></div>
                <div className="h-3 w-32 bg-gray-200 dark:bg-gray-800 rounded animate-pulse"></div>
              </div>
            </div>
          </div>
          
          {/* Navigation skeleton */}
          <div className="flex-1 px-4 py-6 space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center space-x-3 px-3 py-3">
                <div className="h-5 w-5 bg-gray-200 dark:bg-gray-800 rounded animate-pulse"></div>
                <div className="h-4 w-32 bg-gray-200 dark:bg-gray-800 rounded animate-pulse"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <Suspense fallback={null}>
      <DashboardSidebar isOpen={isOpen} onClose={onClose} />
    </Suspense>
  )
}