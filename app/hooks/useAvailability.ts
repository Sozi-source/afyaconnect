import { useState, useCallback, useEffect } from 'react'
import { apiClient } from '@/app/lib/api'
import { useAuth } from '@/app/contexts/AuthContext'
import type { Availability, CreateAvailabilityData, BulkAvailabilityData } from '@/app/types'

export function useAvailability(practitionerId?: number) {
  const { user } = useAuth()
  const [availability, setAvailability] = useState<Availability[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchAvailability = useCallback(async () => {
    if (!practitionerId) {
      setAvailability([])
      return []
    }
    
    setLoading(true)
    setError(null)
    
    try {
      const isOwnAvailability = user?.practitioner?.id === practitionerId
      
      let availabilityList: Availability[] = []
      
      if (isOwnAvailability) {
        const response = await apiClient.availability.getMyAvailability()
        availabilityList = Array.isArray(response) ? response : []
      } else {
        const response = await apiClient.availability.getPractitionerAvailability(practitionerId)
        if (response && typeof response === 'object') {
          if ('results' in response && Array.isArray(response.results)) {
            availabilityList = response.results
          } else if (Array.isArray(response)) {
            availabilityList = response
          }
        }
      }
      
      const invalidSlots = availabilityList.filter(slot => 
        slot.practitioner && slot.practitioner !== practitionerId
      )
      
      if (invalidSlots.length > 0) {
        availabilityList = availabilityList.filter(slot => 
          !slot.practitioner || slot.practitioner === practitionerId
        )
      }
      
      setAvailability(availabilityList)
      return availabilityList
    } catch (err: any) {
      setError(err.message || 'Failed to fetch availability')
      return []
    } finally {
      setLoading(false)
    }
  }, [practitionerId, user])

  const createSlot = useCallback(async (data: CreateAvailabilityData): Promise<Availability | null> => {
    try {
      if (!practitionerId) {
        throw new Error('No practitioner ID available')
      }
      
      const payload = {
        ...data,
        practitioner: practitionerId,
      }
      
      const newSlot = await apiClient.availability.create(payload)
      
      if (newSlot.practitioner && newSlot.practitioner !== practitionerId) {
        return null
      }
      
      setAvailability(prev => [...prev, newSlot])
      
      return newSlot
    } catch (err: any) {
      setError(err.message || 'Failed to create slot')
      return null
    }
  }, [practitionerId])

  const bulkCreateSlots = useCallback(async (data: BulkAvailabilityData): Promise<Availability[]> => {
    try {
      if (!practitionerId) {
        throw new Error('No practitioner ID available')
      }
      
      const newSlots = await apiClient.availability.createBulk(data)
      
      if (Array.isArray(newSlots)) {
        const validSlots = newSlots.filter((slot: Availability) => 
          !slot.practitioner || slot.practitioner === practitionerId
        )
        
        setAvailability(prev => [...prev, ...validSlots])
        return validSlots
      }
      
      return []
    } catch (err: any) {
      setError(err.message || 'Failed to create slots')
      return []
    }
  }, [practitionerId])

  const updateSlot = useCallback(async (id: number, data: Partial<CreateAvailabilityData>): Promise<Availability | null> => {
    try {
      if (!practitionerId) {
        throw new Error('No practitioner ID available')
      }
      
      const slotToUpdate = availability.find(slot => slot.id === id)
      if (slotToUpdate && slotToUpdate.practitioner && slotToUpdate.practitioner !== practitionerId) {
        throw new Error('Cannot update slot from another practitioner')
      }
      
      const updated = await apiClient.availability.update(id, data)
      
      if (updated.practitioner && updated.practitioner !== practitionerId) {
        return null
      }
      
      setAvailability(prev => prev.map(slot => 
        slot.id === id ? updated : slot
      ))
      
      return updated
    } catch (err: any) {
      setError(err.message || 'Failed to update slot')
      return null
    }
  }, [practitionerId, availability])

  const deleteSlot = useCallback(async (id: number): Promise<boolean> => {
    try {
      if (!practitionerId) {
        throw new Error('No practitioner ID available')
      }
      
      const slotToDelete = availability.find(slot => slot.id === id)
      if (slotToDelete && slotToDelete.practitioner && slotToDelete.practitioner !== practitionerId) {
        throw new Error('Cannot delete slot from another practitioner')
      }
      
      await apiClient.availability.delete(id)
      
      setAvailability(prev => prev.filter(slot => slot.id !== id))
      
      return true
    } catch (err: any) {
      setError(err.message || 'Failed to delete slot')
      return false
    }
  }, [practitionerId, availability])

  useEffect(() => {
    if (practitionerId) {
      fetchAvailability()
    } else {
      setAvailability([])
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