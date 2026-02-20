'use client'

import { PractitionerGrid } from '@/app/components/practitioners/PractitionerGrid'
import { PractitionerFiltersComponent } from '@/app/components/practitioners/PractitionerFilters'
import { usePractitioners } from '@/app/hooks/usePractitioners'
import { motion } from 'framer-motion'
import { PlusIcon, FunnelIcon } from '@heroicons/react/24/outline'
import Link from 'next/link'
import { Button } from '@/app/components/ui/Buttons'
import { useState, useEffect } from 'react'

export default function PractitionersPage() {
  const { 
    practitioners, 
    isLoading, 
    filters, 
    setFilters, 
    specialties,
    totalCount,
    error,
    refresh
  } = usePractitioners()
  
  const [showMobileFilters, setShowMobileFilters] = useState(false)
  const [isClient, setIsClient] = useState(false)

  // Handle client-side hydration
  useEffect(() => {
    setIsClient(true)
  }, [])

  // Show loading state while checking auth or initial load
  if (!isClient || isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading practitioners...</p>
        </div>
      </div>
    )
  }

  // Show error state if something goes wrong
  if (error) {
    return (
      <div className="text-center py-12 px-4 max-w-md mx-auto">
        <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-6">
          <h2 className="text-xl sm:text-2xl font-bold text-red-600 dark:text-red-400 mb-4">
            Unable to Load Practitioners
          </h2>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-6">
            {error === 'Please login to view practitioners' 
              ? 'You need to be logged in to view practitioners.'
              : error || 'An unexpected error occurred.'}
          </p>
          <div className="space-y-3">
            {error === 'Please login to view practitioners' ? (
              <Link href="/login">
                <Button fullWidth>Go to Login</Button>
              </Link>
            ) : (
              <Button 
                onClick={() => window.location.reload()} 
                variant="outline"
                fullWidth
              >
                Try Again
              </Button>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4 sm:space-y-6 p-4 sm:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
            Practitioners
          </h1>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-1">
            Find and connect with certified nutrition experts
          </p>
        </div>
        
        {/* Mobile Action Buttons */}
        <div className="flex sm:hidden gap-2">
          <button
            onClick={() => setShowMobileFilters(!showMobileFilters)}
            className="flex-1 px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center gap-2 text-gray-700 dark:text-gray-300"
          >
            <FunnelIcon className="h-5 w-5" />
            <span>Filters</span>
          </button>
          <Link href="/dashboard/practitioners/create" className="flex-1">
            <Button fullWidth>
              <PlusIcon className="h-5 w-5 mr-2" />
              Add
            </Button>
          </Link>
        </div>

        {/* Desktop Add Button */}
        <Link href="/dashboard/practitioners/create" className="hidden sm:block">
          <Button>
            <PlusIcon className="h-5 w-5 mr-2" />
            Add Practitioner
          </Button>
        </Link>
      </div>

      {/* Mobile Filters Toggle */}
      {showMobileFilters && (
        <motion.div 
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="sm:hidden"
        >
          <PractitionerFiltersComponent
            onFilterChange={setFilters}
            specialties={specialties}
          />
        </motion.div>
      )}

      {/* Desktop Filters */}
      <div className="hidden sm:block">
        <PractitionerFiltersComponent
          onFilterChange={setFilters}
          specialties={specialties}
        />
      </div>

      {/* Results Count */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
          {practitioners.length === 0 ? (
            'No practitioners found'
          ) : (
            <>
              Showing <span className="font-medium">{practitioners.length}</span> of{' '}
              <span className="font-medium">{totalCount || practitioners.length}</span> practitioner
              {totalCount !== 1 ? 's' : ''}
            </>
          )}
        </p>
        {isLoading && (
          <div className="flex items-center text-xs sm:text-sm text-gray-500">
            <div className="animate-spin rounded-full h-3 w-3 sm:h-4 sm:w-4 border-b-2 border-blue-600 mr-2"></div>
            Loading...
          </div>
        )}
      </div>

      {/* Practitioner Grid */}
      {practitioners.length === 0 && !isLoading ? (
        <div className="text-center py-12 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            No practitioners match your criteria
          </p>
          <Button 
            variant="outline" 
            onClick={() => setFilters({})}
          >
            Clear Filters
          </Button>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <PractitionerGrid 
            practitioners={practitioners} 
            isLoading={isLoading}
          />
        </motion.div>
      )}
    </div>
  )
}