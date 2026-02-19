'use client'

import React, { useState, useEffect } from 'react'
import { PractitionerFilters } from '@/app/types'
import { MagnifyingGlassIcon, FunnelIcon, XMarkIcon } from '@heroicons/react/24/outline'
import { motion, AnimatePresence } from 'framer-motion'

interface FilterProps {
  onFilterChange: (filters: PractitionerFilters) => void
  specialties: Array<{ id: number; name: string }>
}

// Custom debounce hook
const useDebounce = <T,>(value: T, delay: number): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}

export const PractitionerFiltersComponent: React.FC<FilterProps> = ({
  onFilterChange,
  specialties,
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [filters, setFilters] = useState<PractitionerFilters>({})
  
  const debouncedSearch = useDebounce(search, 300)

  // Trigger search when debounced value changes
  useEffect(() => {
    onFilterChange({ ...filters, search: debouncedSearch })
  }, [debouncedSearch])

  const handleFilterChange = (key: keyof PractitionerFilters, value: any) => {
    const newFilters = { ...filters, [key]: value }
    setFilters(newFilters)
    onFilterChange(newFilters)
  }

  const clearFilters = () => {
    setFilters({})
    setSearch('')
    onFilterChange({})
  }

  const hasFilters = Object.keys(filters).length > 0 || search

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 mb-6">
      <div className="flex items-center space-x-4">
        <div className="flex-1 relative">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name, bio, or specialties..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
        </div>
        
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`px-4 py-2 border rounded-lg flex items-center space-x-2 transition ${
            isOpen 
              ? 'bg-primary-50 border-primary-300 text-primary-600 dark:bg-primary-900/20 dark:border-primary-700' 
              : 'border-gray-300 hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-700'
          }`}
        >
          <FunnelIcon className="h-5 w-5" />
          <span>Filters</span>
        </button>
        
        {hasFilters && (
          <button
            onClick={clearFilters}
            className="px-4 py-2 text-red-600 hover:text-red-700 dark:text-red-400 flex items-center space-x-2"
          >
            <XMarkIcon className="h-5 w-5" />
            <span>Clear</span>
          </button>
        )}
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  City
                </label>
                <input
                  type="text"
                  placeholder="Enter city"
                  value={filters.city || ''}
                  onChange={(e) => handleFilterChange('city', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Specialty
                </label>
                <select
                  value={filters.specialty || ''}
                  onChange={(e) => handleFilterChange('specialty', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600"
                >
                  <option value="">All Specialties</option>
                  {specialties.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Experience (years)
                </label>
                <input
                  type="number"
                  min="0"
                  placeholder="Min years"
                  value={filters.min_experience || ''}
                  onChange={(e) => handleFilterChange('min_experience', parseInt(e.target.value) || undefined)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Min Rate
                </label>
                <input
                  type="number"
                  min="0"
                  placeholder="Min rate"
                  value={filters.min_rate || ''}
                  onChange={(e) => handleFilterChange('min_rate', parseInt(e.target.value) || undefined)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Max Rate
                </label>
                <input
                  type="number"
                  min="0"
                  placeholder="Max rate"
                  value={filters.max_rate || ''}
                  onChange={(e) => handleFilterChange('max_rate', parseInt(e.target.value) || undefined)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600"
                />
              </div>

              <div className="flex items-center">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.is_verified || false}
                    onChange={(e) => handleFilterChange('is_verified', e.target.checked)}
                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    Verified only
                  </span>
                </label>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}