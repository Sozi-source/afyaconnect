import api from './client'
import type { 
  Practitioner, 
  Specialty, 
  Consultation,
  ConsultationFilters,
  AuthResponse,
  LoginCredentials,
  RegisterData,
  User,
  UserProfile,
  MetricsResponse,
  Review,
  PaginatedResponse,
  Availability
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
  
  return query.toString() ? `?${query.toString()}` : ''
}

export const apiClient = {
  // ==================== AUTH ====================
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
    }
  },

  // ==================== PROFILES ====================
  profiles: {
    getMyProfile: async (): Promise<UserProfile> => {
      const response = await api.get<UserProfile>('/my-profile/')
      return response.data
    },

    update: async (id: number, data: Partial<UserProfile>): Promise<UserProfile> => {
      const response = await api.put<UserProfile>(`/profiles/${id}/update/`, data)
      return response.data
    },

    create: async (data: Partial<UserProfile>): Promise<UserProfile> => {
      const response = await api.post<UserProfile>('/profiles/create/', data)
      return response.data
    },

    getOne: async (id: number): Promise<UserProfile> => {
      const response = await api.get<UserProfile>(`/profiles/${id}/`)
      return response.data
    }
  },

  // ==================== PRACTITIONERS ====================
  practitioners: {
    getAll: async (params?: Record<string, any>): Promise<Practitioner[]> => {
      const query = buildQueryString(params)
      const response = await api.get<Practitioner[]>(`/practitioners/${query}`)
      return response.data
    },

    getOne: async (id: number): Promise<Practitioner> => {
      const response = await api.get<Practitioner>(`/practitioners/${id}/`)
      return response.data
    },

    getMyProfile: async (): Promise<Practitioner> => {
      const response = await api.get<Practitioner>('/practitioners/me/')
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

    getSpecialties: async (id: number): Promise<Specialty[]> => {
      const response = await api.get<Specialty[]>(`/practitioners/${id}/specialties/`)
      return response.data
    }
  },

  // ==================== CONSULTATIONS ====================
  consultations: {
    getAll: async (filters?: ConsultationFilters): Promise<Consultation[] | PaginatedResponse<Consultation>> => {
      const query = buildQueryString(filters)
      const response = await api.get<Consultation[] | PaginatedResponse<Consultation>>(`/consultations/${query}`)
      return response.data
    },

    getOne: async (id: number): Promise<Consultation> => {
      const response = await api.get<Consultation>(`/consultations/${id}/`)
      return response.data
    },

    create: async (data: {
      practitioner: number
      date: string
      time: string
      duration_minutes: number
      client_notes?: string
    }): Promise<Consultation> => {
      const response = await api.post<Consultation>('/consultations/create/', data)
      return response.data
    },

    update: async (id: number, data: Partial<Consultation>): Promise<Consultation> => {
      const response = await api.put<Consultation>(`/consultations/${id}/update/`, data)
      return response.data
    },

    updateStatus: async (id: number, status: string): Promise<Consultation> => {
      const response = await api.patch<Consultation>(`/consultations/${id}/status/`, { status })
      return response.data
    },

    getMetrics: async (): Promise<MetricsResponse> => {
      const response = await api.get<MetricsResponse>('/metrics/')
      return response.data
    },

    getByPractitioner: async (practitionerId: number, filters?: ConsultationFilters): Promise<Consultation[]> => {
      const query = buildQueryString({ ...filters, practitioner: practitionerId })
      const response = await api.get<Consultation[]>(`/consultations/by-practitioner/${practitionerId}/${query}`)
      return response.data
    },

    getByClient: async (clientId: number, filters?: ConsultationFilters): Promise<Consultation[]> => {
      const query = buildQueryString({ ...filters, client: clientId })
      const response = await api.get<Consultation[]>(`/consultations/by-client/${clientId}/${query}`)
      return response.data
    }
  },

  // ==================== REVIEWS ====================
  reviews: {
    getAll: async (params?: Record<string, any>): Promise<Review[] | PaginatedResponse<Review>> => {
      const query = buildQueryString(params)
      const response = await api.get<Review[] | PaginatedResponse<Review>>(`/reviews/${query}`)
      return response.data
    },

    getOne: async (id: number | string): Promise<Review> => {
      const response = await api.get<Review>(`/reviews/${id}/`)
      return response.data
    },

    create: async (data: {
      consultation: number
      rating: number
      comment?: string
    }): Promise<Review> => {
      const response = await api.post<Review>('/reviews/create/', data)
      return response.data
    },

    update: async (id: number | string, data: Partial<Review>): Promise<Review> => {
      const response = await api.put<Review>(`/reviews/${id}/update/`, data)
      return response.data
    },

    delete: async (id: number | string): Promise<void> => {
      await api.delete(`/reviews/${id}/delete/`)
    },

    getByConsultation: async (consultationId: number): Promise<Review> => {
      const response = await api.get<Review>(`/reviews/by-consultation/${consultationId}/`)
      return response.data
    },

    getByPractitioner: async (practitionerId: number): Promise<Review[]> => {
      const response = await api.get<Review[]>(`/reviews/by-practitioner/${practitionerId}/`)
      return response.data
    }
  },

  // ==================== AVAILABILITY ====================
  availability: {
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

    create: async (data: Partial<Availability>): Promise<Availability> => {
      const response = await api.post<Availability>('/availability/create/', data)
      return response.data
    },

    update: async (id: number, data: Partial<Availability>): Promise<Availability> => {
      const response = await api.put<Availability>(`/availability/${id}/update/`, data)
      return response.data
    },

    delete: async (id: number): Promise<void> => {
      await api.delete(`/availability/${id}/delete/`)
    },

    getSlots: async (practitionerId: number, date: string): Promise<string[]> => {
      const response = await api.get<string[]>(`/availability/slots/${practitionerId}/?date=${date}`)
      return response.data
    }
  },

  // ==================== ADMIN ====================
  admin: {
    getPendingPractitioners: async (): Promise<Practitioner[]> => {
      const response = await api.get<Practitioner[]>('/admin/practitioners/pending/')
      return response.data
    },

    approvePractitioner: async (id: number): Promise<{ message: string }> => {
      const response = await api.patch(`/admin/practitioners/${id}/approve/`)
      return response.data
    },

    rejectPractitioner: async (id: number, reason?: string): Promise<{ message: string }> => {
      const response = await api.patch(`/admin/practitioners/${id}/reject/`, { reason })
      return response.data
    },

    getAllUsers: async (): Promise<User[]> => {
      const response = await api.get<User[]>('/admin/users/')
      return response.data
    },

    getUserDetails: async (id: number): Promise<User & { profile: UserProfile }> => {
      const response = await api.get<User & { profile: UserProfile }>(`/admin/users/${id}/`)
      return response.data
    }
  },

  // ==================== SPECIALTIES ====================
  specialties: {
    getAll: async (): Promise<Specialty[]> => {
      const response = await api.get<Specialty[]>('/specialties/')
      return response.data
    },

    getOne: async (id: number): Promise<Specialty> => {
      const response = await api.get<Specialty>(`/specialties/${id}/`)
      return response.data
    },

    create: async (data: { name: string; description?: string }): Promise<Specialty> => {
      const response = await api.post<Specialty>('/specialties/create/', data)
      return response.data
    },

    update: async (id: number, data: Partial<Specialty>): Promise<Specialty> => {
      const response = await api.put<Specialty>(`/specialties/${id}/update/`, data)
      return response.data
    },

    delete: async (id: number): Promise<void> => {
      await api.delete(`/specialties/${id}/delete/`)
    }
  },

  // ==================== DASHBOARD ====================
  dashboard: {
    getStats: async (): Promise<{
      total_consultations: number
      upcoming_consultations: number
      total_practitioners: number
      total_reviews: number
      recent_activity: Consultation[]
    }> => {
      const response = await api.get('/dashboard/stats/')
      return response.data
    }
  }
}