'use client'

import { PractitionerGrid } from '@/app/components/practitioners/PractitionerGrid'
import { PractitionerFiltersComponent } from '@/app/components/practitioners/PractitionerFilters'
import { usePractitioners } from '@/app/hooks/usePractitioners'
import { motion } from 'framer-motion'
import { PlusIcon } from '@heroicons/react/24/outline'
import Link from 'next/link'
import { Button } from '@/app/components/ui/Buttons'

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

  // Show error state if something goes wrong
  if (error) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-red-600 dark:text-red-400 mb-4">
          Something went wrong
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">{error}</p>
        <Button onClick={() => window.location.reload()} variant="outline">
          Try Again
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Practitioners
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Find and connect with certified nutrition experts
          </p>
        </div>
        
        {/* Only show for admin users - you might want to add role check */}
        <Link href="/dashboard/practitioners/create">
          <Button>
            <PlusIcon className="h-5 w-5 mr-2" />
            Add Practitioner
          </Button>
        </Link>
      </div>

      <PractitionerFiltersComponent
        onFilterChange={setFilters}
        specialties={specialties}
      />

      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Showing {practitioners.length} of {totalCount} practitioner{totalCount !== 1 ? 's' : ''}
        </p>
        {isLoading && (
          <div className="flex items-center text-sm text-gray-500">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-600 mr-2"></div>
            Loading...
          </div>
        )}
      </div>

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