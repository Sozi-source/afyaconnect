'use client'

import React, { useState, useEffect, useRef } from 'react'
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
  const [activeFilterCount, setActiveFilterCount] = useState(0)
  const filterRef = useRef<HTMLDivElement>(null)
  
  const debouncedSearch = useDebounce(search, 300)

  // Calculate active filters count
  useEffect(() => {
    const count = Object.values(filters).filter(v => v !== undefined && v !== '' && v !== false).length
    setActiveFilterCount(count)
  }, [filters])

  // Trigger search when debounced value changes
  useEffect(() => {
    onFilterChange({ ...filters, search: debouncedSearch || undefined })
  }, [debouncedSearch])

  const handleFilterChange = (key: keyof PractitionerFilters, value: any) => {
    const newFilters = { ...filters, [key]: value || undefined }
    setFilters(newFilters)
    onFilterChange(newFilters)
  }

  const clearFilters = () => {
    setFilters({})
    setSearch('')
    onFilterChange({})
  }

  const hasFilters = activeFilterCount > 0 || search

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div ref={filterRef} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-3 sm:p-4 mb-4 sm:mb-6">
      {/* Search Bar */}
      <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
        <div className="flex-1 relative">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search practitioners..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 sm:pl-10 pr-4 py-2.5 sm:py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
          />
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className={`
              flex-1 sm:flex-none px-4 py-2.5 sm:py-2 border rounded-xl flex items-center justify-center space-x-2 text-sm transition-all
              ${isOpen 
                ? 'bg-blue-50 border-blue-300 text-blue-600 dark:bg-blue-900/20 dark:border-blue-700 dark:text-blue-400' 
                : 'border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
              }
            `}
          >
            <FunnelIcon className="h-4 w-4 sm:h-5 sm:w-5" />
            <span className="hidden xs:inline">Filters</span>
            {activeFilterCount > 0 && (
              <span className="ml-1 px-1.5 py-0.5 bg-blue-500 text-white text-xs rounded-full">
                {activeFilterCount}
              </span>
            )}
          </button>
          
          {hasFilters && (
            <button
              onClick={clearFilters}
              className="px-4 py-2.5 sm:py-2 text-red-600 hover:text-red-700 dark:text-red-400 flex items-center justify-center space-x-2 text-sm border border-transparent hover:border-red-200 dark:hover:border-red-800 rounded-xl transition-all"
            >
              <XMarkIcon className="h-4 w-4 sm:h-5 sm:w-5" />
              <span className="hidden xs:inline">Clear</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              {/* City Filter */}
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                  City
                </label>
                <input
                  type="text"
                  placeholder="Any city"
                  value={filters.city || ''}
                  onChange={(e) => handleFilterChange('city', e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>

              {/* Specialty Filter */}
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Specialty
                </label>
                <select
                  value={filters.specialty || ''}
                  onChange={(e) => handleFilterChange('specialty', e.target.value || undefined)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                >
                  <option value="">All Specialties</option>
                  {specialties.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Experience Filter */}
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Min Experience (years)
                </label>
                <input
                  type="number"
                  min="0"
                  placeholder="0"
                  value={filters.min_experience || ''}
                  onChange={(e) => handleFilterChange('min_experience', e.target.value ? parseInt(e.target.value) : undefined)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>

              {/* Rate Filters */}
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Min Rate ($)
                </label>
                <input
                  type="number"
                  min="0"
                  placeholder="0"
                  value={filters.min_rate || ''}
                  onChange={(e) => handleFilterChange('min_rate', e.target.value ? parseInt(e.target.value) : undefined)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Max Rate ($)
                </label>
                <input
                  type="number"
                  min="0"
                  placeholder="No max"
                  value={filters.max_rate || ''}
                  onChange={(e) => handleFilterChange('max_rate', e.target.value ? parseInt(e.target.value) : undefined)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>

              {/* Verified Checkbox */}
              <div className="flex items-center">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.is_verified || false}
                    onChange={(e) => handleFilterChange('is_verified', e.target.checked || undefined)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 h-4 w-4"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    Verified practitioners only
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