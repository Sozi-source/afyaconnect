import api from './client'
import type { 
  Practitioner, 
  Specialty, 
  Availability, 
  Consultation,
  Review,
  User,
  UserProfile,
  MetricsResponse,
  PractitionerFilters,
  ConsultationFilters,
  AuthResponse,
  LoginCredentials,
  RegisterData,
  CreateConsultationData,
  UpdateConsultationData
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

export const apiClient = {
  auth: {
    login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
      const response = await api.post<AuthResponse>('/login/', {
        username: credentials.email,
        password: credentials.password
      })
      return response.data
    },

    register: async (data: RegisterData): Promise<AuthResponse> => {
      const response = await api.post<AuthResponse>('/register/', data)
      return response.data
    },

    logout: async (): Promise<void> => {
      await api.post('/logout/')
      localStorage.removeItem('authToken')
      localStorage.removeItem('user')
    },

    getProfile: async (): Promise<User> => {
      const response = await api.get<User>('/profile/')
      return response.data
    },

    getMyProfile: async (): Promise<UserProfile> => {
      const response = await api.get<UserProfile>('/my-profile/')
      return response.data
    }
  },

  users: {
    getAll: async (): Promise<User[]> => {
      const response = await api.get<User[]>('/users/')
      return response.data
    },

    getOne: async (id: number): Promise<User> => {
      const response = await api.get<User>(`/users/${id}/`)
      return response.data
    }
  },

// In the profiles section of apiClient, add update and other missing methods:

profiles: {
  getAll: async (): Promise<UserProfile[]> => {
    const response = await api.get<UserProfile[]>('/profiles/')
    return response.data
  },

  getOne: async (id: number): Promise<UserProfile> => {
    const response = await api.get<UserProfile>(`/profiles/${id}/`)
    return response.data
  },

  create: async (data: Partial<UserProfile>): Promise<UserProfile> => {
    const response = await api.post<UserProfile>('/profiles/create/', data)
    return response.data
  },

  update: async (id: number, data: Partial<UserProfile>): Promise<UserProfile> => {
    const response = await api.put<UserProfile>(`/profiles/${id}/update/`, data)
    return response.data
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/profiles/${id}/delete/`)
  },

  getMyProfile: async (): Promise<UserProfile> => {
    const response = await api.get<UserProfile>('/my-profile/')
    return response.data
  }
},

  practitioners: {
    getAll: async (params?: PractitionerFilters): Promise<Practitioner[]> => {
      const query = buildQueryString(params)
      const response = await api.get<Practitioner[]>(`/practitioners/${query}`)
      return response.data
    },

    getOne: async (id: number): Promise<Practitioner> => {
      const response = await api.get<Practitioner>(`/practitioners/${id}/`)
      return response.data
    },

    create: async (data: Partial<Practitioner>): Promise<Practitioner> => {
      const response = await api.post<Practitioner>('/practitioners/create/', data)
      return response.data
    },

    update: async (id: number, data: Partial<Practitioner>): Promise<Practitioner> => {
      const response = await api.put<Practitioner>(`/practitioners/${id}/update/`, data)
      return response.data
    },

    delete: async (id: number): Promise<void> => {
      await api.delete(`/practitioners/${id}/update/`)
    },

    getAvailability: async (practitionerId: number): Promise<Availability[]> => {
      const response = await api.get<Availability[]>(`/practitioners/${practitionerId}/availability/`)
      return response.data
    },

    createAvailability: async (practitionerId: number, data: Partial<Availability>): Promise<Availability> => {
      const response = await api.post<Availability>(
        `/practitioners/${practitionerId}/availability/create/`, 
        data
      )
      return response.data
    },

    updateAvailability: async (practitionerId: number, availabilityId: number, data: Partial<Availability>): Promise<Availability> => {
      const response = await api.put<Availability>(
        `/practitioners/${practitionerId}/availability/${availabilityId}/`,
        data
      )
      return response.data
    },

    deleteAvailability: async (practitionerId: number, availabilityId: number): Promise<void> => {
      await api.delete(`/practitioners/${practitionerId}/availability/${availabilityId}/`)
    }
  },

  consultations: {
    getAll: async (filters?: ConsultationFilters): Promise<Consultation[]> => {
      const query = buildQueryString(filters)
      const response = await api.get<Consultation[]>(`/consultations/${query}`)
      return response.data
    },

    getOne: async (id: number): Promise<Consultation> => {
      const response = await api.get<Consultation>(`/consultations/${id}/`)
      return response.data
    },

    create: async (data: CreateConsultationData): Promise<Consultation> => {
      const response = await api.post<Consultation>('/consultations/create/', data)
      return response.data
    },

    updateStatus: async (id: number, status: string): Promise<Consultation> => {
      const response = await api.patch<Consultation>(`/consultations/${id}/status/`, { status })
      return response.data
    },

    getMetrics: async (): Promise<MetricsResponse> => {
      const response = await api.get<MetricsResponse>('/metrics/')
      return response.data
    }
  },

  availability: {
    getAll: async (): Promise<Availability[]> => {
      const response = await api.get<Availability[]>('/availability/')
      return response.data
    },

    getOne: async (id: number): Promise<Availability> => {
      const response = await api.get<Availability>(`/availability/${id}/`)
      return response.data
    }
  },

  reviews: {
    getAll: async (): Promise<Review[]> => {
      const response = await api.get<Review[]>('/reviews/')
      return response.data
    },

    getOne: async (id: number): Promise<Review> => {
      const response = await api.get<Review>(`/reviews/${id}/`)
      return response.data
    },

    create: async (data: Partial<Review>): Promise<Review> => {
      const response = await api.post<Review>('/reviews/create/', data)
      return response.data
    },

    update: async (id: number, data: Partial<Review>): Promise<Review> => {
      const response = await api.put<Review>(`/reviews/${id}/update/`, data)
      return response.data
    },

    delete: async (id: number): Promise<void> => {
      await api.delete(`/reviews/${id}/update/`)
    },

    getForConsultation: async (consultationId: number): Promise<Review[]> => {
      const response = await api.get<Review[]>(`/consultations/${consultationId}/reviews/`)
      return response.data
    },

    createForConsultation: async (consultationId: number, data: { rating: number; comment?: string }): Promise<Review> => {
      const response = await api.post<Review>(`/consultations/${consultationId}/reviews/create/`, data)
      return response.data
    }
  },

  specialties: {
    getAll: async (): Promise<Specialty[]> => {
      const response = await api.get<Specialty[]>('/specialties/')
      return response.data
    },

    getOne: async (id: number): Promise<Specialty> => {
      const response = await api.get<Specialty>(`/specialties/${id}/`)
      return response.data
    }
  }
}