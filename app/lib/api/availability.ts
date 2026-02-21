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

  // Bulk create weekly availability
  bulkCreate: async (data: BulkAvailabilityData): Promise<Availability[]> => {
    const response = await api.post<{ slots: Availability[] }>('/availability/bulk-create/', data)
    return response.data.slots
  },

  // Get available slots for a practitioner (public)
  getPractitionerSlots: async (
    practitionerId: number, 
    startDate: string, 
    endDate: string
  ): Promise<TimeSlot[]> => {
    const response = await api.get<TimeSlot[]>(
      `/practitioners/${practitionerId}/available-slots/`,
      { params: { start_date: startDate, end_date: endDate } }
    )
    return response.data
  },

  // Check if a specific time slot is available
  checkSlot: async (
    practitionerId: number, 
    date: string, 
    time: string
  ): Promise<CheckSlotResponse> => {
    const response = await api.post<CheckSlotResponse>('/availability/check-slot/', {
      practitioner: practitionerId,
      date: date,
      time: time
    })
    return response.data
  },

  // Get practitioner availability (public view)
  getPractitionerAvailability: async (practitionerId: number): Promise<Availability[]> => {
    const response = await api.get<Availability[]>(`/practitioners/${practitionerId}/availability/`)
    return response.data
  }
}