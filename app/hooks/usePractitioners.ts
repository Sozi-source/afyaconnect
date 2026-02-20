import { useState, useEffect, useCallback, useMemo } from 'react'
import { apiClient } from '@/app/lib/api'
import type { Practitioner, PractitionerFilters, Specialty } from '@/app/types'

export function usePractitioners() {
  const [practitioners, setPractitioners] = useState<Practitioner[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filters, setFilters] = useState<PractitionerFilters>({})
  const [specialties, setSpecialties] = useState<Specialty[]>([])

  // Load specialties once on mount
  useEffect(() => {
    apiClient.specialties.getAll()
      .then(data => {
        setSpecialties(Array.isArray(data) ? data : [])
      })
      .catch(err => console.error('Failed to load specialties:', err))
  }, [])

  // Memoized fetch function
  const fetchPractitioners = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      // Check for token
      const token = localStorage.getItem('authToken')
      if (!token) {
        setError('Please login to view practitioners')
        setPractitioners([])
        setIsLoading(false)
        return
      }

      const data = await apiClient.practitioners.getAll(filters)
      setPractitioners(Array.isArray(data) ? data : [])
    } catch (err: any) {
      console.error('Error loading practitioners:', err)
      
      if (err.response?.status === 401) {
        setError('Your session has expired. Please login again.')
        localStorage.removeItem('authToken')
        localStorage.removeItem('user')
      } else {
        setError(err.message || 'Failed to load practitioners')
      }
      
      setPractitioners([])
    } finally {
      setIsLoading(false)
    }
  }, [filters])

  // Load practitioners when filters change
  useEffect(() => {
    fetchPractitioners()
  }, [fetchPractitioners])

  // Memoized filter update
  const updateFilters = useCallback((newFilters: Partial<PractitionerFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }))
  }, [])

  // Memoized clear filters
  const clearFilters = useCallback(() => {
    setFilters({})
  }, [])

  // Memoized values
  const totalCount = useMemo(() => practitioners.length, [practitioners])

  return {
    practitioners,
    isLoading,
    error,
    filters,
    setFilters: updateFilters,
    clearFilters,
    specialties,
    totalCount,
    refresh: fetchPractitioners
  }
}