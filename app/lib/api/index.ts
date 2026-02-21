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
  MetricsResponse
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

    // ✅ ADD THIS - Update profile
    update: async (id: number, data: Partial<UserProfile>): Promise<UserProfile> => {
      const response = await api.put<UserProfile>(`/profiles/${id}/update/`, data)
      return response.data
    },

    // ✅ ADD THIS - Create profile
    create: async (data: Partial<UserProfile>): Promise<UserProfile> => {
      const response = await api.post<UserProfile>('/profiles/create/', data)
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
    }
  },

  // ==================== CONSULTATIONS ====================
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

    updateStatus: async (id: number, status: string): Promise<Consultation> => {
      const response = await api.patch<Consultation>(`/consultations/${id}/status/`, { status })
      return response.data
    },

    getMetrics: async (): Promise<MetricsResponse> => {
      const response = await api.get<MetricsResponse>('/metrics/')
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
    }
  },

  // ==================== SPECIALTIES ====================
  specialties: {
    getAll: async (): Promise<Specialty[]> => {
      const response = await api.get<Specialty[]>('/specialties/')
      return response.data
    }
  }
}