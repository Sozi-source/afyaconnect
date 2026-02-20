// app/components/practitioners/PractitionerFilters.tsx
'use client'

import { useState, useEffect } from 'react'
import { PractitionerFilters, Specialty } from '@/app/types'

interface FilterProps {
  onFilterChange: (filters: PractitionerFilters) => void
  specialties: Specialty[]
  initialFilters?: PractitionerFilters // Add this optional prop
}

export function PractitionerFiltersComponent({ 
  onFilterChange, 
  specialties,
  initialFilters = {} // Default to empty object
}: FilterProps) {
  const [filters, setFilters] = useState<PractitionerFilters>(initialFilters)

  // Update local state when initialFilters changes
  useEffect(() => {
    setFilters(initialFilters)
  }, [initialFilters])

  const handleChange = (key: keyof PractitionerFilters, value: any) => {
    const newFilters = { ...filters, [key]: value }
    setFilters(newFilters)
    onFilterChange(newFilters)
  }

  const handleClear = () => {
    setFilters({})
    onFilterChange({})
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Search */}
        <div>
          <label className="block text-sm font-medium mb-1">Search</label>
          <input
            type="text"
            placeholder="Name or specialty..."
            value={filters.search || ''}
            onChange={(e) => handleChange('search', e.target.value)}
            className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
          />
        </div>

        {/* City */}
        <div>
          <label className="block text-sm font-medium mb-1">City</label>
          <input
            type="text"
            placeholder="Enter city"
            value={filters.city || ''}
            onChange={(e) => handleChange('city', e.target.value)}
            className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
          />
        </div>

        {/* Specialty */}
        <div>
          <label className="block text-sm font-medium mb-1">Specialty</label>
          <select
            value={filters.specialty || ''}
            onChange={(e) => handleChange('specialty', e.target.value)}
            className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
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
          <label className="block text-sm font-medium mb-1">Max Rate (KES)</label>
          <input
            type="number"
            placeholder="Max hourly rate"
            value={filters.max_rate || ''}
            onChange={(e) => handleChange('max_rate', e.target.value ? Number(e.target.value) : undefined)}
            className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
          />
        </div>
      </div>

      {/* Clear Filters Button */}
      {(filters.search || filters.city || filters.specialty || filters.max_rate) && (
        <div className="mt-4 flex justify-end">
          <button
            onClick={handleClear}
            className="text-sm text-blue-600 hover:text-blue-700"
          >
            Clear Filters
          </button>
        </div>
      )}
    </div>
  )
}