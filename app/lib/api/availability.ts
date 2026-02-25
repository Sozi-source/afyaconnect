import api from './client'
import type { Availability, BulkAvailabilityData, CreateAvailabilityData, TimeSlot, CheckSlotResponse } from '@/app/types'

export const availabilityApi = {
  getAll: async (practitionerId?: number): Promise<Availability[]> => {
    const url = practitionerId 
      ? `/availability/?practitioner=${practitionerId}`
      : '/availability/'
    const response = await api.get<Availability[]>(url)
    return response.data
  },

  getOne: async (id: number): Promise<Availability> => {
    const response = await api.get<Availability>(`/availability/${id}/`)
    return response.data
  },

  create: async (data: CreateAvailabilityData): Promise<Availability> => {
    const response = await api.post<Availability>('/availability/', data)
    return response.data
  },

  bulkCreate: async (data: BulkAvailabilityData): Promise<Availability[]> => {
    // Since there's no bulk endpoint, create slots one by one
    // Note: practitioner_id is not in BulkAvailabilityData, it's handled by the hook/context
    const { days, start_time, end_time, is_available, notes } = data

    const promises = days.map(day =>
      api.post<Availability>('/availability/', {
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
    const response = await api.patch<Availability>(`/availability/${id}/`, data)
    return response.data
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/availability/${id}/`)
  },

  checkSlot: async (practitionerId: number, date: string, time: string): Promise<CheckSlotResponse> => {
    const response = await api.get<CheckSlotResponse>(
      `/availability/check/${practitionerId}/?date=${date}&time=${time}`
    )
    return response.data
  },

  getSlots: async (practitionerId: number, date: string): Promise<TimeSlot[]> => {
    const response = await api.get<TimeSlot[]>(`/availability/slots/${practitionerId}/?date=${date}`)
    return response.data
  }
}