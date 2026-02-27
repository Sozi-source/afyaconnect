// app/hooks/useAvailability.ts
import { useState, useCallback, useEffect } from 'react'
import { apiClient } from '@/app/lib/api'
import type { Availability, CreateAvailabilityData, BulkAvailabilityData } from '@/app/types'

function extractResults<T>(data: any): T[] {
  if (!data) return []
  if (Array.isArray(data)) return data
  if (data && typeof data === 'object') {
    if ('results' in data && Array.isArray(data.results)) {
      return data.results
    }
  }
  return []
}

export function useAvailability(practitionerId?: number) {
  const [availability, setAvailability] = useState<Availability[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchAvailability = useCallback(async (force = false) => {
    if (!practitionerId && !force) return []
    
    setLoading(true)
    setError(null)
    
    try {
      console.log('Fetching availability...')
      const data = await apiClient.availability.getAll(practitionerId)
      console.log('Raw availability data:', data)
      
      const availabilityList = extractResults<Availability>(data)
      console.log('Processed availability:', availabilityList)
      
      setAvailability(availabilityList)
      return availabilityList
    } catch (err: any) {
      console.error('Fetch availability error:', err)
      const errorMessage = err.response?.data?.detail || err.message || 'Failed to fetch availability'
      setError(errorMessage)
      return []
    } finally {
      setLoading(false)
    }
  }, [practitionerId])

  const createSlot = useCallback(async (data: CreateAvailabilityData): Promise<Availability | null> => {
    setLoading(true)
    setError(null)
    try {
      console.log('Creating slot with data:', data)
      const newSlot = await apiClient.availability.create(data)
      console.log('Slot created:', newSlot)
      
      setAvailability(prev => {
        // Check if slot already exists to avoid duplicates
        const exists = prev.some(s => 
          s.recurrence_type === data.recurrence_type &&
          s.day_of_week === data.day_of_week &&
          s.start_time === data.start_time
        )
        
        if (exists) {
          console.log('Slot already exists, not adding duplicate')
          return prev
        }
        
        return [...prev, newSlot]
      })
      
      return newSlot
    } catch (err: any) {
      console.error('Create slot error:', err)
      const errorMessage = err.response?.data?.detail || err.message || 'Failed to create slot'
      setError(errorMessage)
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  const bulkCreateSlots = useCallback(async (data: BulkAvailabilityData): Promise<Availability[]> => {
    setLoading(true)
    setError(null)
    try {
      console.log('Bulk creating slots:', data)
      const newSlots = await apiClient.availability.createBulk(data)
      console.log('Bulk created:', newSlots)
      
      setAvailability(prev => {
        // Filter out duplicates based on day_of_week for weekly slots
        const existingDays = new Set(
          prev
            .filter(s => s.recurrence_type === 'weekly')
            .map(s => s.day_of_week)
        )
        
        const uniqueNewSlots = newSlots.filter(slot => 
          slot.recurrence_type === 'weekly' 
            ? !existingDays.has(slot.day_of_week)
            : true
        )
        
        return [...prev, ...uniqueNewSlots]
      })
      
      return newSlots
    } catch (err: any) {
      console.error('Bulk create error:', err)
      const errorMessage = err.response?.data?.detail || err.message || 'Failed to create slots'
      setError(errorMessage)
      return []
    } finally {
      setLoading(false)
    }
  }, [])

  const updateSlot = useCallback(async (id: number, data: Partial<CreateAvailabilityData>): Promise<Availability | null> => {
    setLoading(true)
    setError(null)
    try {
      const updated = await apiClient.availability.update(id, data)
      setAvailability(prev => prev.map(slot => slot.id === id ? updated : slot))
      return updated
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || err.message || 'Failed to update slot'
      setError(errorMessage)
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  const deleteSlot = useCallback(async (id: number): Promise<boolean> => {
    setLoading(true)
    setError(null)
    try {
      await apiClient.availability.delete(id)
      setAvailability(prev => prev.filter(slot => slot.id !== id))
      return true
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || err.message || 'Failed to delete slot'
      setError(errorMessage)
      return false
    } finally {
      setLoading(false)
    }
  }, [])

  // Auto-fetch on mount if practitionerId provided
  useEffect(() => {
    if (practitionerId) {
      fetchAvailability()
    }
  }, [practitionerId, fetchAvailability])

  return {
    availability,
    loading,
    error,
    fetchAvailability,
    createSlot,
    bulkCreateSlots,
    updateSlot,
    deleteSlot
  }
}