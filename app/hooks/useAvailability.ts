import { useState, useCallback } from 'react'
import { availabilityApi } from '@/app/lib/api/availability'
import type { Availability, CreateAvailabilityData, BulkAvailabilityData } from '@/app/types'

export function useAvailability(practitionerId?: number) {
  const [availability, setAvailability] = useState<Availability[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchAvailability = useCallback(async (params?: Record<string, any>) => {
    setLoading(true)
    setError(null)
    try {
      // Use getAll with practitionerId if available
      const data = await availabilityApi.getAll(practitionerId)
      setAvailability(data)
      return data
    } catch (err: any) {
      setError(err.message || 'Failed to fetch availability')
      throw err
    } finally {
      setLoading(false)
    }
  }, [practitionerId])

  const createSlot = useCallback(async (data: CreateAvailabilityData) => {
    setLoading(true)
    setError(null)
    try {
      const newSlot = await availabilityApi.create(data)
      setAvailability(prev => [...prev, newSlot])
      return newSlot
    } catch (err: any) {
      setError(err.message || 'Failed to create slot')
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const bulkCreateSlots = useCallback(async (data: BulkAvailabilityData) => {
    setLoading(true)
    setError(null)
    try {
      const newSlots = await availabilityApi.bulkCreate(data)
      setAvailability(prev => [...prev, ...newSlots])
      return newSlots
    } catch (err: any) {
      setError(err.message || 'Failed to create slots')
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const updateSlot = useCallback(async (id: number, data: Partial<CreateAvailabilityData>) => {
    setLoading(true)
    setError(null)
    try {
      const updated = await availabilityApi.update(id, data)
      setAvailability(prev => prev.map(slot => slot.id === id ? updated : slot))
      return updated
    } catch (err: any) {
      setError(err.message || 'Failed to update slot')
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const deleteSlot = useCallback(async (id: number) => {
    setLoading(true)
    setError(null)
    try {
      await availabilityApi.delete(id)
      setAvailability(prev => prev.filter(slot => slot.id !== id))
    } catch (err: any) {
      setError(err.message || 'Failed to delete slot')
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

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