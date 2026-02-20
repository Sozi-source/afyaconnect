'use client'

import { useState, useEffect } from 'react'
import { apiClient } from '@/app/lib/api'
import { PractitionerGrid } from '@/app/components/practitioners/PractitionerGrid'
import { PractitionerFiltersComponent } from '@/app/components/practitioners/PractitionerFilters'
import { motion } from 'framer-motion'
import { PlusIcon, FunnelIcon } from '@heroicons/react/24/outline'
import Link from 'next/link'
import { Button } from '@/app/components/ui/Buttons'
import { Practitioner, Specialty, PractitionerFilters } from '@/app/types'

export default function PractitionersPage() {
  const [practitioners, setPractitioners] = useState<Practitioner[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filters, setFilters] = useState<PractitionerFilters>({})
  const [specialties, setSpecialties] = useState<Specialty[]>([])
  const [showMobileFilters, setShowMobileFilters] = useState(false)

  // Fetch practitioners
  useEffect(() => {
    const fetchPractitioners = async () => {
      try {
        setIsLoading(true)
        setError(null)
        
        const token = localStorage.getItem('authToken')
        console.log('🔑 Token:', token ? 'Present' : 'Missing')
        
        if (!token) {
          setError('Please login to view practitioners')
          setPractitioners([])
          return
        }

        console.log('Fetching with filters:', filters)
        const data = await apiClient.practitioners.getAll(filters)
        console.log('✅ Practitioners fetched:', data)
        setPractitioners(Array.isArray(data) ? data : [])
        
      } catch (err: any) {
        console.error('❌ Error:', err)
        setError(err.message || 'Failed to load practitioners')
        setPractitioners([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchPractitioners()
  }, [filters])

  // Fetch specialties
  useEffect(() => {
    const fetchSpecialties = async () => {
      try {
        const data = await apiClient.specialties.getAll()
        console.log('✅ Specialties fetched:', data)
        setSpecialties(Array.isArray(data) ? data : [])
      } catch (err) {
        console.error('Failed to load specialties:', err)
        setSpecialties([])
      }
    }
    fetchSpecialties()
  }, [])

  const handleFilterChange = (newFilters: PractitionerFilters) => {
    console.log('Filters changed:', newFilters)
    setFilters(newFilters)
  }

  const handleClearFilters = () => {
    setFilters({})
  }

  if (isLoading && practitioners.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading practitioners...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12 px-4">
        <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-6 max-w-md mx-auto">
          <h2 className="text-xl font-bold text-red-600 dark:text-red-400 mb-4">
            Error Loading Practitioners
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">{error}</p>
          {error.includes('login') ? (
            <Link href="/login">
              <Button>Go to Login</Button>
            </Link>
          ) : (
            <Button onClick={() => window.location.reload()} variant="outline">
              Try Again
            </Button>
          )}
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

        <Link href="/dashboard/practitioners/create" className="hidden sm:block">
          <Button>
            <PlusIcon className="h-5 w-5 mr-2" />
            Add Practitioner
          </Button>
        </Link>
      </div>

      {/* Filters - without initialFilters prop */}
      {showMobileFilters && (
        <div className="sm:hidden">
          <PractitionerFiltersComponent
            onFilterChange={handleFilterChange}
            specialties={specialties}
          />
        </div>
      )}

      <div className="hidden sm:block">
        <PractitionerFiltersComponent
          onFilterChange={handleFilterChange}
          specialties={specialties}
        />
      </div>

      {/* Results count and clear filters */}
      <div className="flex justify-between items-center">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {practitioners.length} practitioner{practitioners.length !== 1 ? 's' : ''} found
        </p>
        {Object.keys(filters).length > 0 && (
          <button
            onClick={handleClearFilters}
            className="text-sm text-blue-600 hover:text-blue-700"
          >
            Clear Filters
          </button>
        )}
      </div>

      {/* Practitioner Grid */}
      {practitioners.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
          <p className="text-gray-600 dark:text-gray-400 mb-4">No practitioners found</p>
          {Object.keys(filters).length > 0 && (
            <Button variant="outline" onClick={handleClearFilters}>
              Clear Filters
            </Button>
          )}
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