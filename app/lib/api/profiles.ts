import api from './client'
import { UserProfile, UpdateProfileData } from '@/app/types'

export const profilesApi = {
  // Get current user's profile
  getMyProfile: async () => {
    const response = await api.get<UserProfile>('/my-profile/')
    return response.data
  },

  // Create profile
  create: async (data: UpdateProfileData) => {
    const response = await api.post<UserProfile>('/profiles/create/', data)
    return response.data
  },

  // Get profile by ID
  getOne: async (id: number) => {
    const response = await api.get<UserProfile>(`/profiles/${id}/`)
    return response.data
  },

  // Update profile - now accepts UpdateProfileData
  update: async (id: number, data: UpdateProfileData) => {
    const response = await api.put<UserProfile>(`/profiles/${id}/`, data)
    return response.data
  },
}