import api, { publicApi } from './client'
import type { 
  // User types
  User,
  UserProfile,
  AuthResponse,
  LoginCredentials,
  RegisterData,
  
  // Practitioner types
  Practitioner,
  PractitionerFilters,
  
  // Application types
  PractitionerApplication,
  PractitionerApplicationData,
  ApplicationStatus,
  ApplicationStatusResponse,
  
  // Specialty types
  Specialty,
  
  // Availability types
  Availability,
  CreateAvailabilityData,
  BulkAvailabilityData,
  DayOfWeek,
  
  // Consultation types
  Consultation,
  ConsultationFilters,
  ConsultationStatus,
  CreateConsultationData,
  UpdateConsultationData,
  
  // Review types
  Review,
  CreateReviewData,
  
  // Metrics types
  PractitionerMetrics,
  ClientMetrics,
  DashboardStats,
  
  // Time slot types
  TimeSlot,
  CheckSlotResponse,
  
  // Notification types
  Notification,
  UnreadCountResponse,
  
  // Admin types
  AdminStats,
  AdminActionResponse,
  
  // API response types
  PaginatedResponse,
  ApiError,
  
  // Payment types (future)
  Payment,
  
  // Message types (future)
  Message
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
  profiles: {
    getMyProfile: async (): Promise<UserProfile> => {
      const response = await api.get<UserProfile>('/profile/')
      return response.data
    },

    updateMyProfile: async (data: Partial<UserProfile>): Promise<UserProfile> => {
      const response = await api.patch<UserProfile>('/profile/', data)
      return response.data
    },

    getOne: async (id: number): Promise<UserProfile> => {
      const response = await api.get<UserProfile>(`/profiles/${id}/`)
      return response.data
    }
  },

  // ==================== PRACTITIONERS ====================
  practitioners: {
    getAll: async (params?: PractitionerFilters): Promise<PaginatedResponse<Practitioner> | Practitioner[]> => {
      const query = buildQueryString(params)
      const response = await api.get<Practitioner[] | PaginatedResponse<Practitioner>>(`/practitioners/${query}`)
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
      const response = await api.patch<Practitioner>('/practitioners/me/', data)
      return response.data
    },

    // ========== PRACTITIONER APPLICATIONS ==========
    applications: {
      // Check application status first
      getStatus: async (): Promise<ApplicationStatusResponse> => {
        const response = await api.get('/practitioners/application/status/')
        return {
          hasApplication: response.data.has_application,
          application: response.data.has_application ? response.data : null,
          can_edit: response.data.can_edit
        }
      },

      // Create a new application
      create: async (data: PractitionerApplicationData): Promise<PractitionerApplication> => {
        const response = await api.post<PractitionerApplication>('/practitioners/application/create/', data)
        return response.data
      },

      // Get existing application details
      getMine: async (): Promise<PractitionerApplication> => {
        const response = await api.get<PractitionerApplication>('/practitioners/application/me/')
        return response.data
      },

      // Update application (PATCH for partial updates)
      update: async (data: Partial<PractitionerApplicationData>): Promise<PractitionerApplication> => {
        const response = await api.patch<PractitionerApplication>('/practitioners/application/me/', data)
        return response.data
      },

      // Submit application for review
      submit: async (): Promise<{ message: string; status: ApplicationStatus }> => {
        const response = await api.post('/practitioners/application/submit/')
        return response.data
      },

      // Upload document files
      uploadDocument: async (fieldName: string, file: File): Promise<PractitionerApplication> => {
        const formData = new FormData()
        formData.append(fieldName, file)
        const response = await api.patch<PractitionerApplication>(
          '/practitioners/application/me/', 
          formData,
          {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          }
        )
        return response.data
      },

      // Upload multiple documents at once
      uploadDocuments: async (files: {
        id_document?: File,
        certification_documents?: File,
        profile_photo?: File
      }): Promise<PractitionerApplication> => {
        const formData = new FormData()
        if (files.id_document) formData.append('id_document', files.id_document)
        if (files.certification_documents) formData.append('certification_documents', files.certification_documents)
        if (files.profile_photo) formData.append('profile_photo', files.profile_photo)
        
        const response = await api.patch<PractitionerApplication>(
          '/practitioners/application/me/', 
          formData,
          {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          }
        )
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
    },

    // Verification (admin)
    verify: async (id: number): Promise<{ message: string }> => {
      const response = await api.post(`/practitioners/${id}/verify/`)
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

    create: async (data: CreateConsultationData): Promise<Consultation> => {
      const response = await api.post<Consultation>('/consultations/', data)
      return response.data
    },

    updateStatus: async (id: number, status: ConsultationStatus): Promise<Consultation> => {
      const response = await api.patch<Consultation>(`/consultations/${id}/status/`, { status })
      return response.data
    },

    getMetrics: async (): Promise<PractitionerMetrics | ClientMetrics> => {
      const response = await api.get<PractitionerMetrics | ClientMetrics>('/consultations/metrics/')
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

    create: async (data: CreateReviewData): Promise<Review> => {
      const response = await api.post<Review>('/reviews/create/', data)
      return response.data
    },

    getMyReviews: async (): Promise<Review[]> => {
      const response = await api.get<Review[]>('/reviews/my-reviews/')
      return response.data
    },

    getByPractitioner: async (practitionerId: number): Promise<Review[]> => {
      const response = await api.get<Review[]>(`/practitioners/${practitionerId}/reviews/`)
      return response.data
    }
  },

  // ==================== AVAILABILITY ====================
 availability: {
  getAll: async (practitionerId?: number): Promise<Availability[]> => {
    if (practitionerId) {
      const response = await api.get<Availability[]>(`/practitioners/${practitionerId}/availability/`)
      return response.data
    }
    const response = await api.get<Availability[]>('/availability/')
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

  createBulk: async (data: BulkAvailabilityData): Promise<Availability[]> => {
    const response = await api.post<Availability[]>('/availability/bulk/', data)
    return response.data
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
    getAll: async (): Promise<Notification[]> => {
      const response = await api.get<Notification[]>('/notifications/')
      return response.data
    },
    
    getUnreadCount: async (): Promise<UnreadCountResponse> => {
      const response = await api.get<UnreadCountResponse>('/notifications/unread-count/')
      return response.data
    },
    
    markAsRead: async (id: number): Promise<{ status: string }> => {
      const response = await api.post(`/notifications/${id}/read/`)
      return response.data
    },
    
    markAllAsRead: async (): Promise<{ message: string; count: number }> => {
      const response = await api.post('/notifications/mark-all-read/')
      return response.data
    },

    getOne: async (id: number): Promise<Notification> => {
      const response = await api.get<Notification>(`/notifications/${id}/`)
      return response.data
    }
  },

  // ==================== ADMIN ====================
  admin: {
    // Practitioner applications management
    applications: {
      getAll: async (status?: ApplicationStatus): Promise<PractitionerApplication[]> => {
        const query = status ? `?status=${status}` : ''
        const response = await api.get<PractitionerApplication[]>(`/admin/applications/${query}`)
        return response.data
      },

      getOne: async (id: number): Promise<PractitionerApplication> => {
        const response = await api.get<PractitionerApplication>(`/admin/applications/${id}/`)
        return response.data
      },

      approve: async (id: number): Promise<AdminActionResponse> => {
        const response = await api.post(`/admin/applications/${id}/action/`, { action: 'approve' })
        return response.data
      },

      reject: async (id: number, reason: string): Promise<AdminActionResponse> => {
        const response = await api.post(`/admin/applications/${id}/action/`, { 
          action: 'reject', 
          reason 
        })
        return response.data
      },

      requestInfo: async (id: number, notes: string): Promise<AdminActionResponse> => {
        const response = await api.post(`/admin/applications/${id}/action/`, { 
          action: 'request_info', 
          notes 
        })
        return response.data
      },

      getStats: async (): Promise<{
        total: number
        draft: number
        pending: number
        approved: number
        rejected: number
        info_needed: number
        by_status: Record<string, number>
      }> => {
        const response = await api.get('/admin/applications/stats/')
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
      },

      reject: async (id: number, reason: string): Promise<{ message: string }> => {
        const response = await api.post(`/admin/practitioners/${id}/reject/`, { reason })
        return response.data
      }
    },

    // Dashboard stats
    getStats: async (): Promise<AdminStats> => {
      const response = await api.get<AdminStats>('/admin/stats/')
      return response.data
    }
  },

  // ==================== DASHBOARD ====================
  dashboard: {
    getStats: async (): Promise<DashboardStats> => {
      const response = await api.get<DashboardStats>('/consultations/metrics/')
      return response.data
    }
  },

  // ==================== HEALTH CHECK ====================
  health: {
    check: async (): Promise<{ status: string; timestamp: string }> => {
      const response = await publicApi.get('/health/')
      return response.data
    }
  },

  // ==================== PAYMENTS (Future) ====================
  payments: {
    getAll: async (): Promise<Payment[]> => {
      const response = await api.get<Payment[]>('/payments/')
      return response.data
    },

    getOne: async (id: number): Promise<Payment> => {
      const response = await api.get<Payment>(`/payments/${id}/`)
      return response.data
    },

    create: async (data: { consultation: number; payment_method: string }): Promise<Payment> => {
      const response = await api.post<Payment>('/payments/', data)
      return response.data
    }
  },

  // ==================== MESSAGES (Future) ====================
  messages: {
    getAll: async (consultationId?: number): Promise<Message[]> => {
      const url = consultationId ? `/messages/?consultation=${consultationId}` : '/messages/'
      const response = await api.get<Message[]>(url)
      return response.data
    },

    send: async (data: { recipient: number; consultation?: number; content: string }): Promise<Message> => {
      const response = await api.post<Message>('/messages/', data)
      return response.data
    },

    markAsRead: async (id: number): Promise<void> => {
      await api.post(`/messages/${id}/read/`)
    }
  }
}