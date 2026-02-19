import api from './client'
import { Consultation, PaginatedResponse } from '@/app/types'

// Define a type for creating a consultation (matches your backend)
export interface CreateConsultationRequest {
  client?: number  // Add this - will be handled by auth in backend
  practitioner: number
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

  // CREATE consultation - FIXED: Use the correct endpoint '/consultations/create/'
  create: async (data: CreateConsultationRequest) => {
    // Log the data being sent for debugging
    console.log('📤 Sending to /consultations/create/:', data)
    
    // Use the correct endpoint as per your Django URLs
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