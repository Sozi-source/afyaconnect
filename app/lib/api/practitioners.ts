import api from './client'
import { 
  Practitioner, 
  Specialty, 
  Availability, 
  PractitionerFilters 
} from '@/app/types'

export const practitionersApi = {
  // Get all practitioners - returns array directly
  getAll: async (params?: PractitionerFilters): Promise<Practitioner[]> => {
    const response = await api.get<Practitioner[]>('/practitioners/', { params })
    return response.data
  },

  // Get single practitioner
  getOne: async (id: number): Promise<Practitioner> => {
    const response = await api.get<Practitioner>(`/practitioners/${id}/`)
    return response.data
  },

  // Create practitioner
  create: async (data: Partial<Practitioner>): Promise<Practitioner> => {
    const response = await api.post<Practitioner>('/practitioners/create/', data)
    return response.data
  },

  // Update practitioner
  update: async (id: number, data: Partial<Practitioner>): Promise<Practitioner> => {
    const response = await api.put<Practitioner>(`/practitioners/${id}/update/`, data)
    return response.data
  },

  // Delete practitioner
  delete: async (id: number): Promise<void> => {
    await api.delete(`/practitioners/${id}/delete/`)
  },

  // Get practitioner availability
  getAvailability: async (practitionerId: number): Promise<Availability[]> => {
    const response = await api.get<Availability[]>(`/practitioners/${practitionerId}/availability/`)
    return response.data || []
  },

  // Create availability slot
  createAvailability: async (practitionerId: number, data: Partial<Availability>): Promise<Availability> => {
    const response = await api.post<Availability>(
      `/practitioners/${practitionerId}/availability/create/`, 
      data
    )
    return response.data
  },

  // Update availability slot
  updateAvailability: async (practitionerId: number, availabilityId: number, data: Partial<Availability>): Promise<Availability> => {
    const response = await api.put<Availability>(
      `/practitioners/${practitionerId}/availability/${availabilityId}/`,
      data
    )
    return response.data
  },

  // Delete availability slot
  deleteAvailability: async (practitionerId: number, availabilityId: number): Promise<void> => {
    await api.delete(`/practitioners/${practitionerId}/availability/${availabilityId}/`)
  },

  // Get specialties
  getSpecialties: async (): Promise<Specialty[]> => {
    try {
      const response = await api.get<Specialty[]>('/specialties/')
      return response.data
    } catch {
      // Fallback: extract unique specialties from practitioners
      const practitioners = await practitionersApi.getAll()
      const specialtiesMap = new Map()
      practitioners.forEach(p => {
        p.specialties?.forEach(s => specialtiesMap.set(s.id, s))
      })
      return Array.from(specialtiesMap.values())
    }
  }
}