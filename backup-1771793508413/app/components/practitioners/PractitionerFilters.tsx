// app/components/practitioners/PractitionerFilters.tsx
'use client'

import { useState, useEffect, useRef } from 'react'
import { PractitionerFilters, Specialty } from '@/app/types'

interface FilterProps {
  onFilterChange: (filters: PractitionerFilters) => void
  specialties: Specialty[]
  initialFilters?: PractitionerFilters
}

export function PractitionerFiltersComponent({ 
  onFilterChange, 
  specialties,
  initialFilters = {}
}: FilterProps) {
  const [filters, setFilters] = useState<PractitionerFilters>(initialFilters)
  const isFirstRender = useRef(true)

  // Sync with initialFilters only when it actually changes (prevents infinite loop)
  useEffect(() => {
    // Skip the first render to avoid unnecessary update
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }

    // Deep compare to check if initialFilters actually changed
    const hasChanges = JSON.stringify(initialFilters) !== JSON.stringify(filters)
    
    if (hasChanges) {
      setFilters(initialFilters)
    }
  }, [initialFilters]) // Only depend on initialFilters, not filters

  const handleChange = (key: keyof PractitionerFilters, value: any) => {
    const newFilters = { ...filters, [key]: value }
    setFilters(newFilters)
    onFilterChange(newFilters)
  }

  const handleClear = () => {
    const emptyFilters = {}
    setFilters(emptyFilters)
    onFilterChange(emptyFilters)
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Search */}
        <div>
          <label htmlFor="search" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Search
          </label>
          <input
            id="search"
            type="text"
            placeholder="Name or specialty..."
            value={filters.search || ''}
            onChange={(e) => handleChange('search', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
        </div>

        {/* City */}
        <div>
          <label htmlFor="city" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            City
          </label>
          <input
            id="city"
            type="text"
            placeholder="Enter city"
            value={filters.city || ''}
            onChange={(e) => handleChange('city', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
        </div>

        {/* Specialty */}
        <div>
          <label htmlFor="specialty" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Specialty
          </label>
          <select
            id="specialty"
            value={filters.specialty || ''}
            onChange={(e) => handleChange('specialty', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          >
            <option value="">All Specialties</option>
            {specialties.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>

        {/* Rate Range */}
        <div>
          <label htmlFor="max_rate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Max Rate (KES)
          </label>
          <input
            id="max_rate"
            type="number"
            placeholder="Max hourly rate"
            min="0"
            step="100"
            value={filters.max_rate || ''}
            onChange={(e) => handleChange('max_rate', e.target.value ? Number(e.target.value) : undefined)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
        </div>
      </div>

      {/* Clear Filters Button */}
      {(filters.search || filters.city || filters.specialty || filters.max_rate) && (
        <div className="mt-4 flex justify-end">
          <button
            onClick={handleClear}
            className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
          >
            Clear Filters
          </button>
        </div>
      )}
    </div>
  )
}