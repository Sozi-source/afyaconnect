// User Types
export interface User {
  id: number
  email: string
  first_name: string
  last_name: string
  profile?: UserProfile
}


// Practitioner Types
export interface Specialty {
  id: number
  name: string
  description: string | null
}

export interface Practitioner {
  id: number
  user: number                    // User ID
  first_name: string              // Direct from API response
  last_name: string               // Direct from API response
  email: string                   // Direct from API response
  bio: string | null
  currency: 'KES' | 'USD'
  hourly_rate: string
  specialties: Specialty[]
  city?: string
  years_of_experience?: number
  is_verified?: boolean
  phone?: any                     // Keep this if needed
}

// Consultation Types
export type ConsultationStatus = 'booked' | 'completed' | 'cancelled' | 'no_show'

export interface Consultation {
  id: number
  client: number
  practitioner: Practitioner  // Full practitioner object in responses
  date: string
  time: string
  status: ConsultationStatus
  duration_minutes?: number
  client_notes?: string
  practitioner_notes?: string
  created_at?: string
  updated_at?: string
}

// Review Types
export interface Review {
  id: number
  consultation: number
  reviewer: number
  rating: 1 | 2 | 3 | 4 | 5
  comment: string | null
  created_at: string
}

// Metrics Types
export interface MetricsResponse {
  as_client: {
    total_consultations: number
    completed: number
    pending: number
    cancelled: number
    total_spent: number
  }
  as_practitioner: {
    total_consultations: number
    completed: number
    pending: number
    cancelled: number
    total_earned: number
  }
}

// Auth Types
export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterData {
  email: string
  password: string
  first_name: string
  last_name: string
  role?: 'client' | 'practitioner'
  phone?: string
}

export interface AuthResponse {
  token: string
  user_id: number
  email: string
  username: string | null
  is_practitioner: boolean
  is_staff: boolean
}

// API Response Types
export interface PaginatedResponse<T> {
  count: number
  next: string | null
  previous: string | null
  results: T[]
}

// Filter Types
export interface PractitionerFilters {
  search?: string
  city?: string
  specialty?: number | string  // Can be ID or name
  specialties?: number[]       // For multiple specialties
  min_rate?: number
  max_rate?: number
  min_experience?: number
  is_verified?: boolean
  ordering?: string
}

export interface ConsultationFilters {
  status?: ConsultationStatus
  start_date?: string
  end_date?: string
  ordering?: string
   practitioner?: number 
}

export interface CreateConsultationData {
  practitioner: number  // Just the ID, not the full object
  date: string
  time: string
  duration_minutes?: number
  client_notes?: string
}

// For updates
export interface UpdateConsultationData {
  status?: ConsultationStatus
  client_notes?: string
  practitioner_notes?: string
}

// API Response Types
export interface PaginatedResponse<T> {
  count: number
  next: string | null
  previous: string | null
  results: T[]
}

// User Types
export interface User {
  id: number
  email: string
  first_name: string
  last_name: string
  username?: string
  date_joined?: string
}

export interface UserProfile {
  id: number
  user: number | User
  role: 'client' | 'practitioner'
  phone: string | null
  bio?: string | null
  city?: string | null
  specialties?: Specialty[]
  created_at?: string
  updated_at?: string
}

export interface UpdateProfileData {
  phone?: string
  bio?: string
  city?: string
  specialties?: number[]
}

export interface ChangePasswordData {
  current_password: string
  new_password: string
}

export interface ChangePasswordData {
  current_password: string
  new_password: string
}

// Add/update these types
export interface Availability {
  id: number
  practitioner: number
  day_of_week: number
  start_time: string
  end_time: string
  created_at?: string
  updated_at?: string
}

export interface PaginatedResponse<T> {
  count: number
  next: string | null
  previous: string | null
  results: T[]
}

// Union type for availability responses
export type AvailabilityResponse = Availability[] | PaginatedResponse<Availability>

// Add Metrics types
export interface MetricsResponse {
  as_client: {
    total_consultations: number
    completed: number
    pending: number
    cancelled: number
    total_spent: number
  }
  as_practitioner: {
    total_consultations: number
    completed: number
    pending: number
    cancelled: number
    total_earned: number
  }
}