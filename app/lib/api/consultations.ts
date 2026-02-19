import api from './client'
import { Consultation, PaginatedResponse } from '@/app/types'

// Define a type for creating a consultation (matches your backend)
export interface CreateConsultationRequest {
  practitioner: number  // Just the ID
  date: string
  time: string
  duration_minutes?: number
  client_notes?: string
}

export const consultationsApi = {
  // Get all consultations
  getAll: async (params?: any) => {
    const response = await api.get<PaginatedResponse<Consultation>>('/consultations/', { params })
    return response.data
  },

  // Get single consultation
  getOne: async (id: number) => {
    const response = await api.get<Consultation>(`/consultations/${id}/`)
    return response.data
  },

  // Create consultation - FIXED: Use CreateConsultationRequest, not Partial<Consultation>
  create: async (data: CreateConsultationRequest) => {
    const response = await api.post<Consultation>('/consultations/create/', data)
    return response.data
  },

  // Update consultation status
  updateStatus: async (id: number, status: string) => {
    const response = await api.patch<Consultation>(`/consultations/${id}/status/`, { status })
    return response.data
  },

  // Get consultation reviews
  getReviews: async (consultationId: number) => {
    const response = await api.get(`/consultations/${consultationId}/reviews/`)
    return response.data
  },
}