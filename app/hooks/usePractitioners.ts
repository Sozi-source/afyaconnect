'use client'

import { useState, useEffect, useCallback } from 'react'
import useSWR from 'swr'
import { practitionersApi } from '@/app/lib/api/practitioners'
import { Practitioner, Specialty, PaginatedResponse, PractitionerFilters } from '@/app/types'
import { useAuth } from '@/app/contexts/AuthContext'
import { useDebounce } from '@/app/hooks/useDebounce'

interface UsePractitionersReturn {
  practitioners: Practitioner[]
  totalCount: number
  specialties: Specialty[]
  isLoading: boolean
  isLoadingSpecialties: boolean
  error: Error | null
  filters: PractitionerFilters
  setFilters: (filters: PractitionerFilters) => void
  updateFilter: (key: keyof PractitionerFilters, value: any) => void
  clearFilters: () => void
  refresh: () => Promise<void>
}

export const usePractitioners = (initialFilters: PractitionerFilters = {}) => {
  const { isAuthenticated } = useAuth()
  const [filters, setFilters] = useState<PractitionerFilters>(initialFilters)
  const [specialties, setSpecialties] = useState<Specialty[]>([])
  const [isLoadingSpecialties, setIsLoadingSpecialties] = useState(true)
  
  const debouncedFilters = useDebounce(filters, 500)

  // Get token from localStorage directly for debugging
  const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null

  // Debug token
  useEffect(() => {
    console.log('🔑 Auth State in usePractitioners:', { 
      isAuthenticated, 
      hasToken: !!token,
      tokenPreview: token ? token.substring(0, 10) + '...' : null
    })
  }, [isAuthenticated, token])

  // SWR key - only fetch if authenticated
  const swrKey = isAuthenticated && token 
    ? ['practitioners', debouncedFilters, token] 
    : null

  const {
    data,
    error,
    isLoading,
    mutate
  } = useSWR<PaginatedResponse<Practitioner>>(
    swrKey,
    () => {
      console.log('📡 Fetching practitioners with filters:', debouncedFilters)
      return practitionersApi.getAll(debouncedFilters)
    },
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      onError: (err) => {
        console.error('❌ Error fetching practitioners:', err)
      }
    }
  )

  // Fetch specialties
  useEffect(() => {
    const loadSpecialties = async () => {
      if (!isAuthenticated || !token) return
      
      try {
        setIsLoadingSpecialties(true)
        const data = await practitionersApi.getSpecialties()
        setSpecialties(data)
      } catch (error) {
        console.error('Failed to load specialties:', error)
      } finally {
        setIsLoadingSpecialties(false)
      }
    }
    
    loadSpecialties()
  }, [isAuthenticated, token])

  const updateFilter = useCallback((key: keyof PractitionerFilters, value: any) => {
    setFilters(prev => {
      const newFilters = { ...prev, [key]: value }
      if (value === '' || value === undefined || value === null) {
        delete newFilters[key]
      }
      return newFilters
    })
  }, [])

  const clearFilters = useCallback(() => {
    setFilters({})
  }, [])

  return {
    practitioners: data?.results || [],
    totalCount: data?.count || 0,
    specialties,
    isLoading,
    isLoadingSpecialties,
    error: error || null,
    filters,
    setFilters,
    updateFilter,
    clearFilters,
    refresh: mutate,
  }
}