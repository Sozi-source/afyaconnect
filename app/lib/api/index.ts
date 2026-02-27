import api, { publicApi } from '@/app/lib/api/client'
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

const measurePerformance = async <T>(
  fn: () => Promise<T>,
  operation: string
): Promise<T> => {
  const start = performance.now()
  try {
    const result = await fn()
    const duration = Math.round(performance.now() - start)
    console.log(`📊 ${operation} completed in ${duration}ms`)
    return result
  } catch (error) {
    const duration = Math.round(performance.now() - start)
    console.error(`📊 ${operation} failed after ${duration}ms`)
    throw error
  }
}

const withRetry = async <T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> => {
  let lastError: any
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn()
    } catch (error: any) {
      lastError = error
      
      if (error.response?.status >= 400 && error.response?.status < 500) {
        throw error
      }
      
      console.log(`🔄 Retry attempt ${attempt}/${maxRetries} after ${delay}ms`)
      
      if (attempt < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, delay * attempt))
      }
    }
  }
  
  throw lastError
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

export const apiClient = {
  // ==================== AUTH ====================
  auth: {
    login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
      return measurePerformance(async () => {
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

    getAvailability: async (practitionerId: number): Promise<Availability[]> => {
      return measurePerformance(async () => {
        const response = await publicApi.get<Availability[]>(`/practitioners/${practitionerId}/availability/`)
        return response.data
      }, `Get Practitioner ${practitionerId} Availability`)
    },

    getReviews: async (practitionerId: number): Promise<Review[]> => {
      return measurePerformance(async () => {
        const response = await publicApi.get<Review[]>(`/practitioners/${practitionerId}/reviews/`)
        return response.data
      }, `Get Practitioner ${practitionerId} Reviews`)
    },

    // Protected endpoints - use api (require authentication)
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
    getAll: async (practitionerId?: number): Promise<Availability[]> => {
      return measurePerformance(async () => {
        if (practitionerId) {
          const response = await publicApi.get<Availability[]>(`/practitioners/${practitionerId}/availability/`)
          return response.data
        }
        const response = await api.get<Availability[]>('/availability/')
        return response.data
      }, 'Get All Availability')
    },

    getOne: async (id: number): Promise<Availability> => {
      return measurePerformance(async () => {
        const response = await api.get<Availability>(`/availability/${id}/`)
        return response.data
      }, `Get Availability ${id}`)
    },

    create: async (data: CreateAvailabilityData): Promise<Availability> => {
      return measurePerformance(async () => {
        const response = await api.post<Availability>('/availability/', data)
        return response.data
      }, 'Create Availability Slot')
    },

    createBulk: async (data: BulkAvailabilityData): Promise<Availability[]> => {
      console.group(`📦 Bulk Availability Creation - ${data.days.length} days`)
      console.log('Payload:', data)
      
      try {
        try {
          const response = await api.post<Availability[]>('/availability/bulk/', data)
          console.log(`✅ Bulk endpoint successful - ${response.data.length} slots created`)
          console.groupEnd()
          return response.data
        } catch (bulkError: any) {
          if (bulkError.response?.status === 404) {
            console.log('⚠️ Bulk endpoint not found (404), falling back to individual creation...')
            
            const results: Availability[] = []
            const errors: Error[] = []
            
            for (let i = 0; i < data.days.length; i++) {
              const day = data.days[i]
              console.log(`Creating slot ${i + 1}/${data.days.length} for day ${day}`)
              
              try {
                const response = await api.post<Availability>('/availability/', {
                  recurrence_type: 'weekly',
                  day_of_week: day,
                  start_time: data.start_time,
                  end_time: data.end_time,
                  is_available: data.is_available ?? true,
                  notes: data.notes
                })
                
                results.push(response.data)
                
                if (i < data.days.length - 1) {
                  await new Promise(resolve => setTimeout(resolve, 500))
                }
                
              } catch (slotError: any) {
                console.error(`❌ Failed to create slot for day ${day}:`, slotError.message)
                errors.push(slotError)
              }
            }
            
            console.log(`✅ Created ${results.length}/${data.days.length} slots individually`)
            if (errors.length > 0) {
              console.warn(`⚠️ Failed to create ${errors.length} slots`)
            }
            
            console.groupEnd()
            
            if (results.length === 0) {
              throw new Error('Failed to create any slots. Please try again.')
            }
            
            return results
          }
          
          throw bulkError
        }
      } catch (error) {
        console.error('❌ Bulk creation failed:', error)
        console.groupEnd()
        throw error
      }
    },

    update: async (id: number, data: Partial<CreateAvailabilityData>): Promise<Availability> => {
      return measurePerformance(async () => {
        const response = await api.patch<Availability>(`/availability/${id}/`, data)
        return response.data
      }, `Update Availability ${id}`)
    },

    delete: async (id: number): Promise<void> => {
      return measurePerformance(async () => {
        await api.delete(`/availability/${id}/`)
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
    }
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