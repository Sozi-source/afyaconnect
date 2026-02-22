import api from './client'
import type { 
  Availability, 
  TimeSlot, 
  BulkAvailabilityData,
  CheckSlotResponse 
} from '@/app/types'

// Helper to build query strings
const buildQueryString = (params?: Record<string, any>): string => {
  if (!params) return ''
  
  const query = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      query.append(key, String(value))
    }
  })
  
  const queryString = query.toString()
  return queryString ? `?${queryString}` : ''
}

export const availabilityApi = {
  // Get all availability for the logged-in practitioner
  getMyAvailability: async (params?: {
    recurrence_type?: string
    day_of_week?: number
    is_available?: boolean
  }): Promise<Availability[]> => {
    const query = buildQueryString(params)
    const response = await api.get<Availability[]>(`/availability/${query}`)
    return response.data
  },

  // Get single availability slot
  getOne: async (id: number): Promise<Availability> => {
    const response = await api.get<Availability>(`/availability/${id}/`)
    return response.data
  },

  // Create availability slot
  create: async (data: Partial<Availability>): Promise<Availability> => {
    const response = await api.post<Availability>('/availability/', data)
    return response.data
  },

  // Update availability slot
  update: async (id: number, data: Partial<Availability>): Promise<Availability> => {
    const response = await api.put<Availability>(`/availability/${id}/`, data)
    return response.data
  },

  // Delete availability slot
  delete: async (id: number): Promise<void> => {
    await api.delete(`/availability/${id}/`)
  },

  // Bulk create weekly availability - Using standard endpoint
  bulkCreate: async (data: BulkAvailabilityData): Promise<Availability[]> => {
    // Since there's no bulk endpoint, create slots one by one
    const { practitioner_id, days, start_time, end_time, is_available, notes } = data
    
    const promises = days.map(day => 
      api.post<Availability>('/availability/', {
        practitioner: practitioner_id,
        recurrence_type: 'weekly',
        day_of_week: day,
        start_time,
        end_time,
        is_available,
        notes: notes || ''
      })
    )
    
    const responses = await Promise.all(promises)
    return responses.map(r => r.data)
  },

  // Get available slots for a practitioner (public)
  getPractitionerSlots: async (
    practitionerId: number, 
    startDate: string, 
    endDate: string
  ): Promise<TimeSlot[]> => {
    // This would need a custom endpoint, but for now return empty array
    console.warn('getPractitionerSlots needs backend implementation')
    return []
  },

  // Check if a specific time slot is available
  checkSlot: async (
    practitionerId: number, 
    date: string, 
    time: string
  ): Promise<CheckSlotResponse> => {
    // This would need a custom endpoint
    console.warn('checkSlot needs backend implementation')
    return { available: false, reason: 'Not implemented' }
  },

  // Get practitioner availability (public view)
  getPractitionerAvailability: async (practitionerId: number): Promise<Availability[]> => {
    const response = await api.get<Availability[]>(`/availability/?practitioner=${practitionerId}`)
    return response.data
  }
}