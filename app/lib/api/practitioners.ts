import api from './client'
import { 
  Practitioner, 
  Specialty, 
  Availability, 
  AvailabilityResponse,
  PaginatedResponse, 
  PractitionerFilters 
} from '@/app/types'

export const practitionersApi = {
  // Get all practitioners
  getAll: async (params?: PractitionerFilters) => {
    const response = await api.get<PaginatedResponse<Practitioner>>('/practitioners/', { params })
    return response.data
  },

  // Get single practitioner
  getOne: async (id: number) => {
    const response = await api.get<Practitioner>(`/practitioners/${id}/`)
    return response.data
  },

  // Create practitioner
  create: async (data: Partial<Practitioner>) => {
    const response = await api.post<Practitioner>('/practitioners/create/', data)
    return response.data
  },

  // Update practitioner
  update: async (id: number, data: Partial<Practitioner>) => {
    const response = await api.put<Practitioner>(`/practitioners/${id}/update/`, data)
    return response.data
  },

  // Get practitioner availability - FIXED TYPING
  getAvailability: async (practitionerId: number): Promise<Availability[]> => {
    const response = await api.get<Availability[] | PaginatedResponse<Availability>>(
      `/practitioners/${practitionerId}/availability/`
    )
    
    // Normalize the response to always return an array
    const data = response.data
    if (Array.isArray(data)) {
      return data
    } else if (data && 'results' in data && Array.isArray(data.results)) {
      return data.results
    }
    return []
  },

  // Create availability slot
  createAvailability: async (practitionerId: number, data: Partial<Availability>) => {
    const response = await api.post<Availability>(
      `/practitioners/${practitionerId}/availability/create/`, 
      data
    )
    return response.data
  },

  // Get specialties
  getSpecialties: async () => {
    const response = await api.get<Specialty[]>('/specialties/')
    return response.data
  },
}