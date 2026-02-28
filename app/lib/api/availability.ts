import api from './client'
import type { Availability, BulkAvailabilityData, CreateAvailabilityData, TimeSlot, CheckSlotResponse } from '@/app/types'

export const availabilityApi = {
  getAll: async (practitionerId?: number): Promise<Availability[]> => {
    if (practitionerId) {
      // ✅ CORRECT: Use the practitioner-specific endpoint
      console.log(`📡 Fetching availability for practitioner ${practitionerId} from: /practitioners/${practitionerId}/availability/`)
      const response = await api.get(`/practitioners/${practitionerId}/availability/`)
      
      // Handle paginated response
      if (response.data && typeof response.data === 'object') {
        if ('results' in response.data && Array.isArray(response.data.results)) {
          console.log(`📡 Found ${response.data.results.length} slots in results`)
          return response.data.results
        }
      }
      return response.data
    }
    
    // For admin/overview
    const response = await api.get('/availability/')
    return response.data
  },

  getOne: async (id: number): Promise<Availability> => {
    const response = await api.get(`/availability/${id}/`)
    return response.data
  },

  create: async (data: CreateAvailabilityData): Promise<Availability> => {
    const response = await api.post('/availability/', data)
    return response.data
  },

  bulkCreate: async (data: BulkAvailabilityData): Promise<Availability[]> => {
    const { days, start_time, end_time, is_available, notes } = data

    const promises = days.map(day =>
      api.post('/availability/', {
        recurrence_type: 'weekly',
        day_of_week: day,
        start_time,
        end_time,
        is_available,
        notes
      })
    )

    const responses = await Promise.all(promises)
    return responses.map(r => r.data)
  },

  update: async (id: number, data: Partial<CreateAvailabilityData>): Promise<Availability> => {
    const response = await api.patch(`/availability/${id}/`, data)
    return response.data
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/availability/${id}/`)
  },

  checkSlot: async (practitionerId: number, date: string, time: string): Promise<CheckSlotResponse> => {
    const response = await api.get(`/availability/check/${practitionerId}/?date=${date}&time=${time}`)
    return response.data
  },

  getSlots: async (practitionerId: number, date: string): Promise<TimeSlot[]> => {
    const response = await api.get(`/availability/slots/${practitionerId}/?date=${date}`)
    return response.data
  }
}