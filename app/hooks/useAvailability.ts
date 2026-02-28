import { useState, useCallback, useEffect } from 'react'
import { apiClient } from '@/app/lib/api'
import type { Availability, CreateAvailabilityData, BulkAvailabilityData } from '@/app/types'

export function useAvailability(practitionerId?: number) {
  const [availability, setAvailability] = useState<Availability[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchAvailability = useCallback(async () => {
  if (!practitionerId) {
    console.log('⚠️ No practitioner ID')
    return []
  }
  
  setLoading(true)
  setError(null)
  
  try {
    console.log('📡 Fetching availability for practitioner:', practitionerId)
    const response = await apiClient.availability.getAll(practitionerId)
    console.log('📡 Raw API response:', response)
    
    // Handle paginated response from /practitioners/{id}/availability/
    let availabilityList: Availability[] = []
    
    // The response might be the data directly or might have a results property
    if (response && typeof response === 'object') {
      if (Array.isArray(response)) {
        // Direct array response
        availabilityList = response
        console.log(`📡 Found ${availabilityList.length} slots in array`)
      } else if ('results' in response && Array.isArray(response.results)) {
        // Paginated response with results array
        availabilityList = response.results
        console.log(`📡 Found ${availabilityList.length} slots in results`)
      } else if ('data' in response && Array.isArray(response.data)) {
        // Response with data property
        availabilityList = response.data
        console.log(`📡 Found ${availabilityList.length} slots in data`)
      }
    }
    
    console.log('📡 Setting availability with:', availabilityList.length, 'slots')
    setAvailability(availabilityList)
    return availabilityList
  } catch (err: any) {
    console.error('❌ Fetch error:', err)
    setError(err.message || 'Failed to fetch availability')
    return []
  } finally {
    setLoading(false)
  }
}, [practitionerId])

  const createSlot = useCallback(async (data: CreateAvailabilityData): Promise<Availability | null> => {
    try {
      console.log('📡 Creating slot with data:', data)
      const newSlot = await apiClient.availability.create(data)
      console.log('📡 Create response:', newSlot)
      
      // Add the new slot to the list
      setAvailability(prev => [...prev, newSlot])
      
      return newSlot
    } catch (err: any) {
      console.error('❌ Create error:', err)
      setError(err.message || 'Failed to create slot')
      return null
    }
  }, [])

  const bulkCreateSlots = useCallback(async (data: BulkAvailabilityData): Promise<Availability[]> => {
    try {
      console.log('📡 Bulk creating slots:', data)
      const newSlots = await apiClient.availability.createBulk(data)
      console.log('📡 Bulk create response:', newSlots)
      
      if (Array.isArray(newSlots)) {
        setAvailability(prev => [...prev, ...newSlots])
      }
      
      return newSlots
    } catch (err: any) {
      console.error('❌ Bulk create error:', err)
      setError(err.message || 'Failed to create slots')
      return []
    }
  }, [])

  const updateSlot = useCallback(async (id: number, data: Partial<CreateAvailabilityData>): Promise<Availability | null> => {
    try {
      console.log('📡 Updating slot:', id, data)
      const updated = await apiClient.availability.update(id, data)
      console.log('📡 Update response:', updated)
      
      setAvailability(prev => prev.map(slot => 
        slot.id === id ? updated : slot
      ))
      
      return updated
    } catch (err: any) {
      console.error('❌ Update error:', err)
      setError(err.message || 'Failed to update slot')
      return null
    }
  }, [])

  const deleteSlot = useCallback(async (id: number): Promise<boolean> => {
    try {
      console.log('📡 Deleting slot:', id)
      await apiClient.availability.delete(id)
      console.log('📡 Delete successful')
      
      setAvailability(prev => prev.filter(slot => slot.id !== id))
      
      return true
    } catch (err: any) {
      console.error('❌ Delete error:', err)
      setError(err.message || 'Failed to delete slot')
      return false
    }
  }, [])

  // Auto-fetch on mount and when practitionerId changes
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