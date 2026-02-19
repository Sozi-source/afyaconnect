'use client'

import { PractitionerGrid } from '@/app/components/practitioners/PractitionerGrid'
import { PractitionerFiltersComponent } from '@/app/components/practitioners/PractitionerFilters'
import { usePractitioners } from '@/app/hooks/usePractitioners'
import { motion } from 'framer-motion'
import { PlusIcon, FunnelIcon } from '@heroicons/react/24/outline'
import Link from 'next/link'
import { Button } from '@/app/components/ui/Buttons'
import { useState } from 'react'

export default function PractitionersPage() {
  const { 
    practitioners, 
    isLoading, 
    filters, 
    setFilters, 
    specialties,
    totalCount,
    error 
  } = usePractitioners()
  
  const [showMobileFilters, setShowMobileFilters] = useState(false)

  // Show error state if something goes wrong
  if (error) {
    return (
      <div className="text-center py-12 px-4">
        <h2 className="text-xl sm:text-2xl font-bold text-red-600 dark:text-red-400 mb-4">
          Something went wrong
        </h2>
        <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-6">{error}</p>
        <Button onClick={() => window.location.reload()} variant="outline">
          Try Again
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-4 sm:space-y-6">
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
            className="flex-1 px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center gap-2"
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
        <div className="sm:hidden">
          <PractitionerFiltersComponent
            onFilterChange={setFilters}
            specialties={specialties}
          />
        </div>
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
          Showing {practitioners.length} of {totalCount} practitioner{totalCount !== 1 ? 's' : ''}
        </p>
        {isLoading && (
          <div className="flex items-center text-xs sm:text-sm text-gray-500">
            <div className="animate-spin rounded-full h-3 w-3 sm:h-4 sm:w-4 border-b-2 border-blue-600 mr-2"></div>
            Loading...
          </div>
        )}
      </div>

      {/* Practitioner Grid */}
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
    </div>
  )
}