// app/lib/api/index.ts
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
} from '@/app/types'

// ==============================================================================
// CONFIGURATION
// ==============================================================================

// Enable detailed logging only in development and when explicitly enabled
const ENABLE_API_LOGGING = process.env.NODE_ENV === 'development' && process.env.NEXT_PUBLIC_ENABLE_API_LOGS === 'true'
// Throttle logs to prevent console spam (only log every 5 seconds for repeated calls)
const LOG_THROTTLE_MS = 5000

// Simple throttle cache
const logThrottleCache: Record<string, number> = {}

// ==============================================================================
// HELPER FUNCTIONS
// ==============================================================================

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

/**
 * Performance measurement with throttled logging to prevent console spam
 */
const measurePerformance = async <T>(
  fn: () => Promise<T>,
  operation: string
): Promise<T> => {
  const start = performance.now()
  
  try {
    const result = await fn()
    const duration = Math.round(performance.now() - start)
    
    // Only log in development with throttling
    if (ENABLE_API_LOGGING) {
      const now = Date.now()
      const lastLog = logThrottleCache[operation] || 0
      
      // Log if:
      // 1. It's been more than LOG_THROTTLE_MS since last log for this operation
      // 2. The operation took more than 500ms (slow operations are worth noting)
      if (now - lastLog > LOG_THROTTLE_MS || duration > 500) {
        console.log(`📊 ${operation} completed in ${duration}ms`)
        logThrottleCache[operation] = now
      }
    }
    
    return result
  } catch (error) {
    const duration = Math.round(performance.now() - start)
    
    // Always log errors in development, throttle in production
    if (process.env.NODE_ENV === 'development') {
      console.error(`📊 ${operation} failed after ${duration}ms:`, error)
    } else if (ENABLE_API_LOGGING) {
      // Throttled error logging in production
      const now = Date.now()
      const lastLog = logThrottleCache[`error-${operation}`] || 0
      if (now - lastLog > LOG_THROTTLE_MS * 2) {
        console.error(`📊 ${operation} failed after ${duration}ms`)
        logThrottleCache[`error-${operation}`] = now
      }
    }
    
    throw error
  }
}

const extractData = <T>(data: any): T[] => {
  if (Array.isArray(data)) {
    return data as T[]
  }
  if (data && typeof data === 'object') {
    if ('results' in data && Array.isArray(data.results)) {
      return data.results as T[]
    }
    if ('data' in data && Array.isArray(data.data)) {
      return data.data as T[]
    }
  }
  return []
}

const formatTime = (time?: string): string | undefined => {
  if (!time) return time
  return time.includes(':') && time.split(':').length === 2 ? `${time}:00` : time
}

// ==============================================================================
// API CLIENT
// ==============================================================================

export const apiClient = {
  // ==================== AUTH ====================
  auth: {
    login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
      return measurePerformance(async () => {
        // Only log login attempts in development
        if (ENABLE_API_LOGGING) {
          console.log('🔐 Attempting login with:', credentials.email)
        }
        const response = await publicApi.post<AuthResponse>('/login/', {
          email: credentials.email,
          password: credentials.password
        })
        return response.data
      }, 'Auth Login')
    },

    register: async (data: RegisterData): Promise<AuthResponse> => {
      return measurePerformance(async () => {
        const response = await publicApi.post<AuthResponse>('/register/', data)
        return response.data
      }, 'Auth Register')
    },

    logout: async (): Promise<void> => {
      return measurePerformance(async () => {
        await api.post('/logout/')
        localStorage.removeItem('authToken')
        localStorage.removeItem('user')
      }, 'Auth Logout')
    },

    getProfile: async (): Promise<User> => {
      return measurePerformance(async () => {
        const response = await api.get<User>('/profile/')
        return response.data
      }, 'Get Profile')
    }
  },

  // ==================== PROFILES ====================
  profiles: {
    getMyProfile: async (): Promise<UserProfile> => {
      return measurePerformance(async () => {
        const response = await api.get<UserProfile>('/profile/')
        return response.data
      }, 'Get My Profile')
    },

    updateMyProfile: async (data: Partial<UserProfile>): Promise<UserProfile> => {
      return measurePerformance(async () => {
        const response = await api.patch<UserProfile>('/profile/', data)
        return response.data
      }, 'Update My Profile')
    },

    getOne: async (id: number): Promise<UserProfile> => {
      return measurePerformance(async () => {
        const response = await api.get<UserProfile>(`/profiles/${id}/`)
        return response.data
      }, `Get Profile ${id}`)
    }
  },

  // ==================== PRACTITIONERS ====================
  practitioners: {
    // Public endpoints - use publicApi
    getAll: async (params?: PractitionerFilters): Promise<PaginatedResponse<Practitioner> | Practitioner[]> => {
      return measurePerformance(async () => {
        const query = buildQueryString(params)
        const response = await publicApi.get<Practitioner[] | PaginatedResponse<Practitioner>>(`/practitioners/${query}`)
        return response.data
      }, 'Get All Practitioners')
    },

    getOne: async (id: number): Promise<Practitioner> => {
      return measurePerformance(async () => {
        const response = await publicApi.get<Practitioner>(`/practitioners/${id}/`)
        return response.data
      }, `Get Practitioner ${id}`)
    },

    getAvailability: async (practitionerId: number): Promise<PaginatedResponse<Availability>> => {
      return measurePerformance(async () => {
        const response = await publicApi.get<PaginatedResponse<Availability>>(`/practitioners/${practitionerId}/availability/`)
        return response.data
      }, `Get Practitioner ${practitionerId} Availability`)
    },

    getReviews: async (practitionerId: number): Promise<Review[]> => {
      return measurePerformance(async () => {
        const response = await publicApi.get<Review[]>(`/practitioners/${practitionerId}/reviews/`)
        return response.data
      }, `Get Practitioner ${practitionerId} Reviews`)
    },

    getMyProfile: async (): Promise<Practitioner> => {
      return measurePerformance(async () => {
        const response = await api.get<Practitioner>('/practitioners/me/')
        return response.data
      }, 'Get My Practitioner Profile')
    },

    updateMyProfile: async (data: Partial<Practitioner>): Promise<Practitioner> => {
      return measurePerformance(async () => {
        const response = await api.patch<Practitioner>('/practitioners/me/', data)
        return response.data
      }, 'Update My Practitioner Profile')
    },

    verify: async (id: number): Promise<{ message: string }> => {
      return measurePerformance(async () => {
        const response = await api.post(`/practitioners/${id}/verify/`)
        return response.data
      }, `Verify Practitioner ${id}`)
    },

    // ========== PRACTITIONER APPLICATIONS ==========
    applications: {
      getStatus: async (): Promise<ApplicationStatusResponse> => {
        return measurePerformance(async () => {
          const response = await api.get('/practitioners/application/status/')
          return {
            hasApplication: response.data.has_application,
            application: response.data.has_application ? response.data : null,
            can_edit: response.data.can_edit
          }
        }, 'Get Application Status')
      },

      create: async (data: PractitionerApplicationData): Promise<PractitionerApplication> => {
        return measurePerformance(async () => {
          const response = await api.post<PractitionerApplication>('/practitioners/application/create/', data)
          return response.data
        }, 'Create Application')
      },

      getMine: async (): Promise<PractitionerApplication> => {
        return measurePerformance(async () => {
          const response = await api.get<PractitionerApplication>('/practitioners/application/me/')
          return response.data
        }, 'Get My Application')
      },

      update: async (data: Partial<PractitionerApplicationData>): Promise<PractitionerApplication> => {
        return measurePerformance(async () => {
          const response = await api.patch<PractitionerApplication>('/practitioners/application/me/', data)
          return response.data
        }, 'Update Application')
      },

      submit: async (): Promise<{ message: string; status: ApplicationStatus }> => {
        return measurePerformance(async () => {
          const response = await api.post('/practitioners/application/submit/')
          return response.data
        }, 'Submit Application')
      },

      uploadDocument: async (fieldName: string, file: File): Promise<PractitionerApplication> => {
        return measurePerformance(async () => {
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
        }, `Upload ${fieldName}`)
      },

      uploadDocuments: async (files: {
        id_document?: File,
        certification_documents?: File,
        profile_photo?: File
      }): Promise<PractitionerApplication> => {
        return measurePerformance(async () => {
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
        }, 'Upload Documents')
      }
    }
  },

  // ==================== CONSULTATIONS ====================
  consultations: {
    getAll: async (filters?: ConsultationFilters): Promise<Consultation[] | PaginatedResponse<Consultation>> => {
      return measurePerformance(async () => {
        const query = buildQueryString(filters)
        const response = await api.get<Consultation[] | PaginatedResponse<Consultation>>(`/consultations/${query}`)
        return response.data
      }, 'Get All Consultations')
    },

    getOne: async (id: number): Promise<Consultation> => {
      return measurePerformance(async () => {
        const response = await api.get<Consultation>(`/consultations/${id}/`)
        return response.data
      }, `Get Consultation ${id}`)
    },

    create: async (data: CreateConsultationData): Promise<Consultation> => {
      return measurePerformance(async () => {
        const response = await api.post<Consultation>('/consultations/', data)
        return response.data
      }, 'Create Consultation')
    },

    updateStatus: async (id: number, status: ConsultationStatus): Promise<Consultation> => {
      return measurePerformance(async () => {
        const response = await api.patch<Consultation>(`/consultations/${id}/status/`, { status })
        return response.data
      }, `Update Consultation ${id} Status`)
    },

    getMetrics: async (): Promise<PractitionerMetrics | ClientMetrics> => {
      return measurePerformance(async () => {
        const response = await api.get<PractitionerMetrics | ClientMetrics>('/consultations/metrics/')
        return response.data
      }, 'Get Metrics')
    },

    getMyClientConsultations: async (filters?: ConsultationFilters): Promise<Consultation[]> => {
      return measurePerformance(async () => {
        const query = buildQueryString(filters)
        const response = await api.get<Consultation[]>(`/consultations/my-client/${query}`)
        return response.data
      }, 'Get My Client Consultations')
    },

    getMyPractitionerConsultations: async (filters?: ConsultationFilters): Promise<Consultation[]> => {
      return measurePerformance(async () => {
        const query = buildQueryString(filters)
        const response = await api.get<Consultation[]>(`/consultations/my-practitioner/${query}`)
        return response.data
      }, 'Get My Practitioner Consultations')
    },

    getCompletedWithoutReview: async (): Promise<Consultation[]> => {
      return measurePerformance(async () => {
        const response = await api.get<Consultation[]>('/consultations/completed/no-review/')
        return response.data
      }, 'Get Completed Without Review')
    }
  },

  // ==================== REVIEWS ====================
  reviews: {
    getAll: async (params?: Record<string, any>): Promise<Review[] | PaginatedResponse<Review>> => {
      return measurePerformance(async () => {
        const query = buildQueryString(params)
        const response = await api.get<Review[] | PaginatedResponse<Review>>(`/reviews/${query}`)
        return response.data
      }, 'Get All Reviews')
    },

    create: async (data: CreateReviewData): Promise<Review> => {
      return measurePerformance(async () => {
        const response = await api.post<Review>('/reviews/create/', data)
        return response.data
      }, 'Create Review')
    },

    getMyReviews: async (): Promise<Review[]> => {
      return measurePerformance(async () => {
        const response = await api.get<Review[]>('/reviews/my-reviews/')
        return response.data
      }, 'Get My Reviews')
    },

    getByPractitioner: async (practitionerId: number): Promise<Review[]> => {
      return measurePerformance(async () => {
        const response = await publicApi.get<Review[]>(`/practitioners/${practitionerId}/reviews/`)
        return response.data
      }, `Get Reviews for Practitioner ${practitionerId}`)
    }
  },

  // ==================== AVAILABILITY ====================
  availability: {
    getMyAvailability: async (): Promise<Availability[]> => {
      return measurePerformance(async () => {
        // Only log in development with throttling
        if (ENABLE_API_LOGGING) {
          console.log('📡 Fetching my availability')
        }
        const response = await api.get<Availability[] | PaginatedResponse<Availability>>('/availability/')
        
        if (Array.isArray(response.data)) {
          return response.data
        } else if (response.data && typeof response.data === 'object') {
          if ('results' in response.data && Array.isArray(response.data.results)) {
            return response.data.results
          }
        }
        
        // Only log warnings in development
        if (ENABLE_API_LOGGING) {
          console.warn('⚠️ Unexpected response format:', response.data)
        }
        return []
      }, 'Get My Availability')
    },

    getPractitionerAvailability: async (practitionerId: number): Promise<PaginatedResponse<Availability>> => {
      return measurePerformance(async () => {
        const response = await publicApi.get<PaginatedResponse<Availability>>(`/practitioners/${practitionerId}/availability/`)
        return response.data
      }, `Get Practitioner ${practitionerId} Availability`)
    },

    getOne: async (id: number): Promise<Availability> => {
      return measurePerformance(async () => {
        const response = await api.get<Availability>(`/availability/${id}/`)
        return response.data
      }, `Get Availability ${id}`)
    },

    create: async (data: CreateAvailabilityData): Promise<Availability> => {
      return measurePerformance(async () => {
        if (!data) {
          throw new Error('No data provided for availability creation')
        }

        // Only log in development
        if (ENABLE_API_LOGGING) {
          console.log('📝 Creating availability slot')
        }

        const payload: any = {
          recurrence_type: data.recurrence_type,
          start_time: formatTime(data.start_time),
          end_time: formatTime(data.end_time),
          is_available: data.is_available ?? true,
        }

        if (data.recurrence_type === 'weekly') {
          if (data.day_of_week === undefined) {
            throw new Error('day_of_week is required for weekly recurrence')
          }
          payload.day_of_week = data.day_of_week
        } else {
          if (!data.specific_date) {
            throw new Error('specific_date is required for one-time or unavailable slots')
          }
          payload.specific_date = data.specific_date
        }

        if (data.notes) {
          payload.notes = data.notes
        }

        const response = await api.post<Availability>('/availability/', payload)
        return response.data
      }, 'Create Availability Slot')
    },

    createBulk: async (data: BulkAvailabilityData): Promise<Availability[]> => {
      // Only log in development
      if (ENABLE_API_LOGGING) {
        console.log(`📦 Bulk Availability Creation - ${data?.days?.length || 0} days`)
      }

      if (!data?.days?.length) {
        throw new Error('No days selected for bulk creation')
      }

      const formattedStartTime = formatTime(data.start_time)
      const formattedEndTime = formatTime(data.end_time)

      const results: Availability[] = []
      const errors: Error[] = []

      for (let i = 0; i < data.days.length; i++) {
        const day = data.days[i]

        try {
          const slotPayload = {
            recurrence_type: 'weekly',
            day_of_week: day,
            start_time: formattedStartTime,
            end_time: formattedEndTime,
            is_available: data.is_available ?? true,
            notes: data.notes || ''
          }

          const response = await api.post<Availability>('/availability/', slotPayload)
          results.push(response.data)

          if (i < data.days.length - 1) {
            await new Promise(resolve => setTimeout(resolve, 300))
          }
        } catch (slotError: any) {
          if (ENABLE_API_LOGGING) {
            console.error(`❌ Failed to create slot for day ${day}:`, slotError.message)
          }
          errors.push(slotError)
        }
      }

      if (ENABLE_API_LOGGING) {
        console.log(`✅ Created ${results.length}/${data.days.length} slots`)
      }

      if (results.length === 0) {
        throw new Error('Failed to create any slots. Please try again.')
      }

      return results
    },

    update: async (id: number, data: Partial<CreateAvailabilityData>): Promise<Availability> => {
      return measurePerformance(async () => {
        const payload: any = {
          ...data,
          start_time: data.start_time ? formatTime(data.start_time) : undefined,
          end_time: data.end_time ? formatTime(data.end_time) : undefined,
        }

        const response = await api.patch<Availability>(`/availability/${id}/`, payload)
        return response.data
      }, `Update Availability ${id}`)
    },

    delete: async (id: number): Promise<void> => {
      return measurePerformance(async () => {
        try {
          await api.delete(`/availability/${id}/`)
          if (ENABLE_API_LOGGING) {
            console.log(`✅ Deleted availability ${id}`)
          }
        } catch (error: any) {
          if (ENABLE_API_LOGGING) {
            console.error(`❌ Delete failed for ${id}:`, error.message)
          }
          throw error
        }
      }, `Delete Availability ${id}`)
    },

    checkSlot: async (practitionerId: number, date: string, time: string): Promise<CheckSlotResponse> => {
      return measurePerformance(async () => {
        const response = await publicApi.get<CheckSlotResponse>(
          `/availability/check/${practitionerId}/?date=${date}&time=${time}`
        )
        return response.data
      }, `Check Slot for Practitioner ${practitionerId}`)
    },

    getSlots: async (practitionerId: number, date: string): Promise<TimeSlot[]> => {
      return measurePerformance(async () => {
        const response = await publicApi.get<TimeSlot[]>(`/availability/slots/${practitionerId}/?date=${date}`)
        return response.data
      }, `Get Slots for Practitioner ${practitionerId} on ${date}`)
    },

    getAll: async (practitionerId?: number): Promise<Availability[] | PaginatedResponse<Availability>> => {
      // Only log warning in development with throttling
      if (ENABLE_API_LOGGING) {
        const now = Date.now()
        const lastLog = logThrottleCache['deprecated-getAll'] || 0
        if (now - lastLog > LOG_THROTTLE_MS) {
          console.warn('⚠️ getAll() is deprecated. Use getMyAvailability() or getPractitionerAvailability()')
          logThrottleCache['deprecated-getAll'] = now
        }
      }
      
      return measurePerformance(async () => {
        if (practitionerId) {
          return apiClient.availability.getPractitionerAvailability(practitionerId)
        }
        return apiClient.availability.getMyAvailability()
      }, 'Get All Availability')
    },
  },

  // ==================== SPECIALTIES ====================
  specialties: {
    getAll: async (): Promise<Specialty[]> => {
      return measurePerformance(async () => {
        const response = await publicApi.get<Specialty[]>('/specialties/')
        return response.data
      }, 'Get All Specialties')
    }
  },

  // ==================== NOTIFICATIONS ====================
  notifications: {
    getAll: async (): Promise<Notification[]> => {
      return measurePerformance(async () => {
        const response = await api.get<Notification[]>('/notifications/')
        return extractData<Notification>(response.data)
      }, 'Get All Notifications')
    },

    getUnreadCount: async (): Promise<UnreadCountResponse> => {
      return measurePerformance(async () => {
        const response = await api.get<UnreadCountResponse>('/notifications/unread-count/')
        return response.data
      }, 'Get Unread Count')
    },

    markAsRead: async (id: number): Promise<{ status: string }> => {
      return measurePerformance(async () => {
        const response = await api.post(`/notifications/${id}/read/`)
        return response.data
      }, `Mark Notification ${id} as Read`)
    },

    markAllAsRead: async (): Promise<{ message: string; count: number }> => {
      return measurePerformance(async () => {
        const response = await api.post('/notifications/mark-all-read/')
        return response.data
      }, 'Mark All Notifications as Read')
    },

    getOne: async (id: number): Promise<Notification> => {
      return measurePerformance(async () => {
        const response = await api.get<Notification>(`/notifications/${id}/`)
        return response.data
      }, `Get Notification ${id}`)
    }
  },

  // ==================== ADMIN ====================
  admin: {
    applications: {
      getAll: async (status?: ApplicationStatus): Promise<PractitionerApplication[]> => {
        return measurePerformance(async () => {
          const query = status ? `?status=${status}` : ''
          const response = await api.get<PractitionerApplication[]>(`/admin/applications/${query}`)
          return extractData<PractitionerApplication>(response.data)
        }, 'Get All Applications')
      },

      getOne: async (id: number): Promise<PractitionerApplication> => {
        return measurePerformance(async () => {
          const response = await api.get<PractitionerApplication>(`/admin/applications/${id}/`)
          return response.data
        }, `Get Application ${id}`)
      },

      approve: async (id: number): Promise<AdminActionResponse> => {
        return measurePerformance(async () => {
          const response = await api.post(`/admin/applications/${id}/action/`, { action: 'approve' })
          return response.data
        }, `Approve Application ${id}`)
      },

      reject: async (id: number, reason: string): Promise<AdminActionResponse> => {
        return measurePerformance(async () => {
          const response = await api.post(`/admin/applications/${id}/action/`, {
            action: 'reject',
            reason
          })
          return response.data
        }, `Reject Application ${id}`)
      },

      requestInfo: async (id: number, notes: string): Promise<AdminActionResponse> => {
        return measurePerformance(async () => {
          const response = await api.post(`/admin/applications/${id}/action/`, {
            action: 'request_info',
            notes
          })
          return response.data
        }, `Request Info for Application ${id}`)
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
        return measurePerformance(async () => {
          const response = await api.get('/admin/applications/stats/')
          return response.data
        }, 'Get Application Stats')
      }
    },

    practitioners: {
      getPending: async (): Promise<Practitioner[]> => {
        return measurePerformance(async () => {
          const response = await api.get<Practitioner[]>('/admin/practitioners/pending/')
          return extractData<Practitioner>(response.data)
        }, 'Get Pending Practitioners')
      },

      approve: async (id: number): Promise<{ message: string }> => {
        return measurePerformance(async () => {
          const response = await api.patch(`/admin/practitioners/${id}/approve/`)
          return response.data
        }, `Approve Practitioner ${id}`)
      },

      reject: async (id: number, reason: string): Promise<{ message: string }> => {
        return measurePerformance(async () => {
          const response = await api.post(`/admin/practitioners/${id}/reject/`, { reason })
          return response.data
        }, `Reject Practitioner ${id}`)
      }
    },

    getStats: async (): Promise<AdminStats> => {
      return measurePerformance(async () => {
        const response = await api.get<AdminStats>('/admin/stats/')
        return response.data
      }, 'Get Admin Stats')
    }
  },

  // ==================== DASHBOARD ====================
  dashboard: {
    getStats: async (): Promise<DashboardStats> => {
      return measurePerformance(async () => {
        const response = await api.get<DashboardStats>('/consultations/metrics/')
        return response.data
      }, 'Get Dashboard Stats')
    }
  },

  // ==================== HEALTH CHECK ====================
  health: {
    check: async (): Promise<{ status: string; timestamp: string }> => {
      return measurePerformance(async () => {
        const response = await publicApi.get('/health/')
        return response.data
      }, 'Health Check')
    }
  },

  // ==================== PAYMENTS (Future) ====================
  payments: {
    getAll: async (): Promise<Payment[]> => {
      return measurePerformance(async () => {
        const response = await api.get<Payment[]>('/payments/')
        return extractData<Payment>(response.data)
      }, 'Get All Payments')
    },

    getOne: async (id: number): Promise<Payment> => {
      return measurePerformance(async () => {
        const response = await api.get<Payment>(`/payments/${id}/`)
        return response.data
      }, `Get Payment ${id}`)
    },

    create: async (data: { consultation: number; payment_method: string }): Promise<Payment> => {
      return measurePerformance(async () => {
        const response = await api.post<Payment>('/payments/', data)
        return response.data
      }, 'Create Payment')
    }
  },

  // ==================== MESSAGES (Future) ====================
  messages: {
    getAll: async (consultationId?: number): Promise<Message[]> => {
      return measurePerformance(async () => {
        const url = consultationId ? `/messages/?consultation=${consultationId}` : '/messages/'
        const response = await api.get<Message[]>(url)
        return extractData<Message>(response.data)
      }, 'Get All Messages')
    },

    send: async (data: { recipient: number; consultation?: number; content: string }): Promise<Message> => {
      return measurePerformance(async () => {
        const response = await api.post<Message>('/messages/', data)
        return response.data
      }, 'Send Message')
    },

    markAsRead: async (id: number): Promise<void> => {
      return measurePerformance(async () => {
        await api.post(`/messages/${id}/read/`)
      }, `Mark Message ${id} as Read`)
    }
  }
}

// ==============================================================================
// UTILITY FUNCTIONS
// ==============================================================================

export const createApiCall = <T>(
  method: 'get' | 'post' | 'put' | 'patch' | 'delete',
  url: string,
  data?: any,
  options?: any
): Promise<T> => {
  return measurePerformance(async () => {
    const response = await (api as any)[method](url, data, options)
    return response.data
  }, `Custom ${method.toUpperCase()} ${url}`)
}

// ==============================================================================
// EXPORTED FUNCTIONS (for convenience)
// ==============================================================================

export const getMyClientConsultations = apiClient.consultations.getMyClientConsultations
export const getMyPractitionerConsultations = apiClient.consultations.getMyPractitionerConsultations
export const getPractitioners = apiClient.practitioners.getAll
export const getPractitioner = apiClient.practitioners.getOne
export const getSpecialties = apiClient.specialties.getAll
export const createConsultation = apiClient.consultations.create
export const getMyApplications = apiClient.practitioners.applications.getMine
export const createApplication = apiClient.practitioners.applications.create
export const submitApplication = apiClient.practitioners.applications.submit
export const uploadDocuments = apiClient.practitioners.applications.uploadDocuments
export const getAvailability = apiClient.availability.getAll
export const createBulkAvailability = apiClient.availability.createBulk
export const deleteAvailability = apiClient.availability.delete
export const getReviews = apiClient.reviews.getByPractitioner
export const createReview = apiClient.reviews.create
export const getNotifications = apiClient.notifications.getAll
export const markNotificationAsRead = apiClient.notifications.markAsRead
export const getAdminStats = apiClient.admin.getStats
export const getAdminApplications = apiClient.admin.applications.getAll
export const approveApplication = apiClient.admin.applications.approve
export const rejectApplication = apiClient.admin.applications.reject

// Also export the entire apiClient as default
export default apiClient