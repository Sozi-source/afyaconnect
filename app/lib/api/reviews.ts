import api from './client'
import { Review, PaginatedResponse } from '@/app/types'

// Define types for creating/updating reviews
export interface CreateReviewData {
  consultation: string | number
  rating: number
  comment: string
}

export interface UpdateReviewData {
  rating?: number
  comment?: string
}

export const reviewsApi = {
  // Get all reviews
  getAll: async () => {
    const response = await api.get<PaginatedResponse<Review>>('/reviews/')
    return response.data
  },

  // Get single review
  getOne: async (id: number) => {
    const response = await api.get<Review>(`/reviews/${id}/`)
    return response.data
  },

  // Create review
  create: async (data: CreateReviewData) => {
    const response = await api.post<Review>('/reviews/create/', data)
    return response.data
  },

  // Update review
  update: async (id: number, data: UpdateReviewData) => {
    const response = await api.put<Review>(`/reviews/${id}/update/`, data)
    return response.data
  },

  // Delete review
  delete: async (id: number) => {
    await api.delete(`/reviews/${id}/update/`)
  },
}