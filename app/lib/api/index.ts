import api, { publicApi } from './client'
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
  Review,
  PaginatedResponse,
  Availability,
  PractitionerMetrics,
  PractitionerApplication,
  PractitionerApplicationData,
  DashboardStats
} from '@/app/types/index'

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
      const response = await publicApi.post<AuthResponse>('/login/', {
        email: credentials.email,
        password: credentials.password
      })
      return response.data
    },

    register: async (data: RegisterData): Promise<AuthResponse> => {
      const response = await publicApi.post<AuthResponse>('/register/', data)
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
 // In your api/index.ts, update the profiles section:

profiles: {
  getMyProfile: async (): Promise<UserProfile> => {
    const response = await api.get<UserProfile>('/profile/')
    return response.data
  },

  updateMyProfile: async (data: Partial<UserProfile>): Promise<UserProfile> => {
    const response = await api.put<UserProfile>('/profile/', data)
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

    updateMyProfile: async (data: Partial<Practitioner>): Promise<Practitioner> => {
      const response = await api.put<Practitioner>('/practitioners/me/', data)
      return response.data
    },

    // Practitioner Applications
    applications: {
      create: async (data: PractitionerApplicationData): Promise<PractitionerApplication> => {
        const response = await api.post<PractitionerApplication>('/practitioners/applications/create/', data)
        return response.data
      },

      getMine: async (): Promise<PractitionerApplication> => {
        const response = await api.get<PractitionerApplication>('/practitioners/applications/')
        return response.data
      },

      update: async (data: Partial<PractitionerApplicationData>): Promise<PractitionerApplication> => {
        const response = await api.put<PractitionerApplication>('/practitioners/applications/', data)
        return response.data
      },

      submit: async (): Promise<{ message: string; status: string }> => {
        const response = await api.post('/practitioners/applications/submit/')
        return response.data
      }
    },

    // Public availability
    getAvailability: async (practitionerId: number): Promise<Availability[]> => {
      const response = await api.get<Availability[]>(`/practitioners/${practitionerId}/availability/`)
      return response.data
    },

    // Reviews
    getReviews: async (practitionerId: number): Promise<Review[]> => {
      const response = await api.get<Review[]>(`/practitioners/${practitionerId}/reviews/`)
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
      const response = await api.post<Consultation>('/consultations/', data)
      return response.data
    },

    updateStatus: async (id: number, status: string): Promise<Consultation> => {
      const response = await api.patch<Consultation>(`/consultations/${id}/status/`, { status })
      return response.data
    },

    getMetrics: async (): Promise<PractitionerMetrics> => {
      const response = await api.get<PractitionerMetrics>('/consultations/metrics/')
      return response.data
    },

    getMyClientConsultations: async (filters?: ConsultationFilters): Promise<Consultation[]> => {
      const query = buildQueryString(filters)
      const response = await api.get<Consultation[]>(`/consultations/my-client/${query}`)
      return response.data
    },

    getMyPractitionerConsultations: async (filters?: ConsultationFilters): Promise<Consultation[]> => {
      const query = buildQueryString(filters)
      const response = await api.get<Consultation[]>(`/consultations/my-practitioner/${query}`)
      return response.data
    },

    getCompletedWithoutReview: async (): Promise<Consultation[]> => {
      const response = await api.get<Consultation[]>('/consultations/completed/no-review/')
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

    create: async (data: {
      consultation: number
      rating: number
      comment?: string
    }): Promise<Review> => {
      const response = await api.post<Review>('/reviews/create/', data)
      return response.data
    },

    getMyReviews: async (): Promise<Review[]> => {
      const response = await api.get<Review[]>('/reviews/my-reviews/')
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
      const response = await api.post<Availability>('/availability/', data)
      return response.data
    },

    update: async (id: number, data: Partial<Availability>): Promise<Availability> => {
      const response = await api.put<Availability>(`/availability/${id}/`, data)
      return response.data
    },

    delete: async (id: number): Promise<void> => {
      await api.delete(`/availability/${id}/`)
    },

    getSlots: async (practitionerId: number, date: string): Promise<string[]> => {
      const response = await api.get<string[]>(`/availability/slots/${practitionerId}/?date=${date}`)
      return response.data
    }
  },

  // ==================== SPECIALTIES ====================
  specialties: {
    getAll: async (): Promise<Specialty[]> => {
      const response = await api.get<Specialty[]>('/specialties/')
      return response.data
    }
  },

  // ==================== NOTIFICATIONS ====================
  notifications: {
    getAll: async (): Promise<any[]> => {
      const response = await api.get('/notifications/')
      return response.data
    },
    
    getUnreadCount: async (): Promise<{unread_count: number}> => {
      const response = await api.get('/notifications/unread-count/')
      return response.data
    },
    
    markAsRead: async (id: number): Promise<void> => {
      await api.post(`/notifications/${id}/read/`)
    },
    
    markAllAsRead: async (): Promise<void> => {
      await api.post('/notifications/mark-all-read/')
    }
  },

  // ==================== ADMIN ====================
  admin: {
    // Practitioner applications
    applications: {
      getAll: async (status?: string): Promise<PractitionerApplication[]> => {
        const query = status ? `?status=${status}` : ''
        const response = await api.get<PractitionerApplication[]>(`/admin/applications/${query}`)
        return response.data
      },

      getOne: async (id: number): Promise<PractitionerApplication> => {
        const response = await api.get<PractitionerApplication>(`/admin/applications/${id}/`)
        return response.data
      },

      approve: async (id: number): Promise<{ message: string }> => {
        const response = await api.post(`/admin/applications/${id}/`, { action: 'approve' })
        return response.data
      },

      reject: async (id: number, reason: string): Promise<{ message: string }> => {
        const response = await api.post(`/admin/applications/${id}/`, { 
          action: 'reject', 
          reason 
        })
        return response.data
      },

      requestInfo: async (id: number, notes: string): Promise<{ message: string }> => {
        const response = await api.post(`/admin/applications/${id}/`, { 
          action: 'request_info', 
          notes 
        })
        return response.data
      }
    },

    // Practitioner management
    practitioners: {
      getPending: async (): Promise<Practitioner[]> => {
        const response = await api.get<Practitioner[]>('/admin/practitioners/pending/')
        return response.data
      },

      approve: async (id: number): Promise<{ message: string }> => {
        const response = await api.patch(`/admin/practitioners/${id}/approve/`)
        return response.data
      }
    }
  },

  // ==================== DASHBOARD ====================
  dashboard: {
    getStats: async (): Promise<DashboardStats> => {
      const response = await api.get<DashboardStats>('/consultations/metrics/')
      return response.data
    }
  }
}