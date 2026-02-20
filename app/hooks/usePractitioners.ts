// hooks/usePractitioners.ts
import { useState, useEffect } from 'react'
import { practitionersApi } from '@/app/lib/api/practitioners'
import { Practitioner, PractitionerFilters, Specialty } from '@/app/types'

export function usePractitioners() {
  const [practitioners, setPractitioners] = useState<Practitioner[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filters, setFilters] = useState<PractitionerFilters>({})
  const [specialties, setSpecialties] = useState<Specialty[]>([])
  const [totalCount, setTotalCount] = useState(0)

  // Load specialties
  useEffect(() => {
    const loadSpecialties = async () => {
      try {
        const data = await practitionersApi.getSpecialties()
        setSpecialties(data)
      } catch (err) {
        console.error('Failed to load specialties:', err)
      }
    }
    loadSpecialties()
  }, [])

  // Load practitioners with filters
  useEffect(() => {
    const loadPractitioners = async () => {
      setIsLoading(true)
      setError(null)
      
      try {
        // Check for token
        const token = localStorage.getItem('authToken')
        if (!token) {
          setError('Please login to view practitioners')
          setPractitioners([])
          return
        }

        // Fetch practitioners with filters
        const data = await practitionersApi.getAll(filters)
        
        // Ensure data is an array
        const practitionersArray = Array.isArray(data) ? data : 
                                   data?.results ? data.results : []
        
        setPractitioners(practitionersArray)
        setTotalCount(practitionersArray.length)
        
      } catch (err: any) {
        console.error('Error loading practitioners:', err)
        setError(err.response?.data?.detail || 'Failed to load practitioners')
        setPractitioners([])
      } finally {
        setIsLoading(false)
      }
    }

    loadPractitioners()
  }, [filters])

  // Refresh function
  const refresh = async () => {
    setIsLoading(true)
    try {
      const data = await practitionersApi.getAll(filters)
      const practitionersArray = Array.isArray(data) ? data : 
                                 data?.results ? data.results : []
      setPractitioners(practitionersArray)
      setTotalCount(practitionersArray.length)
      setError(null)
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to refresh')
    } finally {
      setIsLoading(false)
    }
  }

  return {
    practitioners,
    isLoading,
    error,
    filters,
    setFilters,
    specialties,
    totalCount,
    refresh
  }
}