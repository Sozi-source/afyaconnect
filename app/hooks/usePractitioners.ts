// app/hooks/usePractitioners.ts
import { useState, useEffect, useCallback } from 'react'
import api from '../lib/api/client'
import { publicApi } from '../lib/api/client'
import type { Practitioner, PractitionerFilters } from '@/app/types'

export function usePractitioners() {
  const [practitioners, setPractitioners] = useState<Practitioner[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filters, setFilters] = useState<PractitionerFilters>({})

  const fetchPractitioners = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      // ✅ IMPORTANT: Use publicApi for public endpoints
      const response = await publicApi.get('/practitioners/', { params: filters })
      
      // Handle paginated response
      const data = response.data
      if (data && typeof data === 'object') {
        if ('results' in data) {
          setPractitioners(data.results)
        } else if (Array.isArray(data)) {
          setPractitioners(data)
        }
      }
    } catch (err: any) {
      console.error('Error fetching practitioners:', err)
      setError(err.message || 'Failed to load practitioners')
    } finally {
      setIsLoading(false)
    }
  }, [filters])

  useEffect(() => {
    fetchPractitioners()
  }, [fetchPractitioners])

  const updateFilters = useCallback((newFilters: Partial<PractitionerFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }))
  }, [])

  return {
    practitioners,
    isLoading,
    error,
    filters,
    setFilters: updateFilters
  }
}