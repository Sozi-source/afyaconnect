import api from './client'
export { api }
export default api 

export * from './auth'
export * from './practitioners'
export * from './consultations'
export * from './reviews'
export * from './profiles'
export * from './metrics'

// Re-export types for convenience
export type {
  User,
  UserProfile,
  Practitioner,
  Specialty,
  Availability,
  Consultation,
  Review,
  MetricsResponse,
  LoginCredentials,
  RegisterData,
  AuthResponse,
  PaginatedResponse,
} from '@/app/types'