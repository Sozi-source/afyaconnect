import { useState, useEffect, useCallback } from 'react'
import { availabilityApi } from '@/app/lib/api/availability'
import type { Availability, TimeSlot, BulkAvailabilityData } from '@/app/types'
import { toast } from 'react-hot-toast'

export function useAvailability(practitionerId?: number) {
  const [availability, setAvailability] = useState<Availability[]>([])
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Fetch my availability (for practitioner dashboard)
  const fetchMyAvailability = useCallback(async (params?: any) => {
    setLoading(true)
    setError(null)
    try {
      const data = await availabilityApi.getMyAvailability(params)
      setAvailability(data)
    } catch (err: any) {
      setError(err.message || 'Failed to load availability')
      console.error('Error loading availability:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  // Fetch practitioner's public availability
  const fetchPractitionerAvailability = useCallback(async (id: number) => {
    setLoading(true)
    setError(null)
    try {
      const data = await availabilityApi.getPractitionerAvailability(id)
      setAvailability(data)
    } catch (err: any) {
      setError(err.message || 'Failed to load availability')
      console.error('Error loading availability:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  // Fetch available time slots for a date range
  const fetchTimeSlots = useCallback(async (
    pId: number,
    startDate: string,
    endDate: string
  ) => {
    setLoading(true)
    setError(null)
    try {
      const data = await availabilityApi.getPractitionerSlots(pId, startDate, endDate)
      setTimeSlots(data)
      return data
    } catch (err: any) {
      setError(err.message || 'Failed to load time slots')
      console.error('Error loading time slots:', err)
      return []
    } finally {
      setLoading(false)
    }
  }, [])

  // Create availability slot
  const createSlot = useCallback(async (data: Partial<Availability>) => {
    setLoading(true)
    try {
      const newSlot = await availabilityApi.create(data)
      setAvailability(prev => [...prev, newSlot])
      toast.success('Availability slot created')
      return newSlot
    } catch (err: any) {
      toast.error(err.message || 'Failed to create slot')
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  // Bulk create slots
  const bulkCreateSlots = useCallback(async (data: BulkAvailabilityData) => {
    setLoading(true)
    try {
      const newSlots = await availabilityApi.bulkCreate(data)
      setAvailability(prev => [...prev, ...newSlots])
      toast.success(`Created ${newSlots.length} availability slots`)
      return newSlots
    } catch (err: any) {
      toast.error(err.message || 'Failed to create slots')
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  // Update slot
  const updateSlot = useCallback(async (id: number, data: Partial<Availability>) => {
    setLoading(true)
    try {
      const updated = await availabilityApi.update(id, data)
      setAvailability(prev => prev.map(slot => slot.id === id ? updated : slot))
      toast.success('Availability slot updated')
      return updated
    } catch (err: any) {
      toast.error(err.message || 'Failed to update slot')
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  // Delete slot
  const deleteSlot = useCallback(async (id: number) => {
    setLoading(true)
    try {
      await availabilityApi.delete(id)
      setAvailability(prev => prev.filter(slot => slot.id !== id))
      toast.success('Availability slot deleted')
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete slot')
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  // Check if a specific time is available
  const checkSlotAvailability = useCallback(async (
    pId: number,
    date: string,
    time: string
  ) => {
    try {
      return await availabilityApi.checkSlot(pId, date, time)
    } catch (err: any) {
      console.error('Error checking slot:', err)
      return { available: false, reason: err.message }
    }
  }, [])

  // Load data on mount if practitionerId provided
  useEffect(() => {
    if (practitionerId) {
      fetchPractitionerAvailability(practitionerId)
    }
  }, [practitionerId, fetchPractitionerAvailability])

  return {
    availability,
    timeSlots,
    loading,
    error,
    fetchMyAvailability,
    fetchPractitionerAvailability,
    fetchTimeSlots,
    createSlot,
    bulkCreateSlots,
    updateSlot,
    deleteSlot,
    checkSlotAvailability
  }
}