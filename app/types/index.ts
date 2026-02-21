// ==================== USER TYPES ====================
export interface User {
  id: number
  email: string
  first_name?: string
  last_name?: string
  username?: string
  is_staff?: boolean
  is_active?: boolean
  role?: 'client' | 'practitioner'
  is_verified?: boolean
  profile?: UserProfile
}

export interface UserProfile {
  id: number
  user: number
  role: 'client' | 'practitioner'
  phone: string | null
  city?: string
  bio?: string
  created_at?: string
  updated_at?: string
}

export interface AuthResponse {
  token: string
  user_id: number
  email: string
  first_name: string
  last_name: string
  role: string
  is_practitioner: boolean
  is_verified: boolean
  is_staff: boolean
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterData {
  email: string
  first_name: string
  last_name: string
  password: string
  role: 'client' | 'practitioner'
  phone?: string
  bio?: string
  city?: string
  hourly_rate?: number
  years_of_experience?: number
}

// ==================== SPECIALTY TYPES ====================
export interface Specialty {
  id: number
  name: string
  description: string | null
}

// ==================== PRACTITIONER TYPES ====================
export interface Practitioner {
  id: number
  user: number
  first_name: string
  last_name: string
  full_name: string
  email: string
  bio: string | null
  city: string
  hourly_rate: number
  currency: string
  years_of_experience: number
  is_verified: boolean
  profile_complete: boolean
  specialties: Specialty[]
  availability_count?: number
  created_at: string
  updated_at: string
}

// ==================== AVAILABILITY TYPES ====================
export type DayOfWeek = 0 | 1 | 2 | 3 | 4 | 5 | 6
export type RecurrenceType = 'weekly' | 'one_time' | 'unavailable'

export interface Availability {
  id: number
  practitioner: number
  practitioner_name?: string
  recurrence_type: RecurrenceType
  day_of_week: DayOfWeek | null
  specific_date: string | null
  start_time: string
  end_time: string
  is_available: boolean
  notes: string | null
  created_at: string
  updated_at: string
}

// ==================== CONSULTATION TYPES ====================
export type ConsultationStatus = 'booked' | 'completed' | 'cancelled' | 'no_show'

export interface Consultation {
  id: number
  client: number
  client_name?: string
  practitioner: number
  practitioner_name?: string
  date: string
  time: string
  status: ConsultationStatus
  duration_minutes: number
  client_notes?: string | null
  practitioner_notes?: string | null
  created_at: string
  updated_at: string
  version?: number
  price?: number
}

// ==================== REVIEW TYPES ====================
export interface Review {
  id: number
  consultation: number
  reviewer: number
  reviewer_name?: string
  rating: 1 | 2 | 3 | 4 | 5
  comment: string | null
  created_at: string
}

// ==================== TIME SLOT TYPES ====================
export interface TimeSlot {
  date: string
  start_time: string
  end_time: string
  practitioner_id: number
  practitioner_name: string
  formatted_time?: string
}

// ==================== FILTER TYPES ====================
export interface PractitionerFilters {
  search?: string
  city?: string
  specialty?: string | number
  min_rate?: number
  max_rate?: number
  min_experience?: number
  verified?: boolean
}

export interface ConsultationFilters {
  status?: ConsultationStatus
  start_date?: string
  end_date?: string
  practitioner?: number
  client?: number
  ordering?: string
  page?: number
  page_size?: number
}

// ==================== API RESPONSE TYPES ====================
export interface ApiError {
  detail?: string
  error?: string
  message?: string
  [key: string]: any
}

export interface PaginatedResponse<T> {
  count: number
  next: string | null
  previous: string | null
  results: T[]
}

// ==================== METRICS TYPES ====================
export interface ClientMetrics {
  total_consultations: number
  completed: number
  pending: number
  cancelled: number
  total_spent: number
  upcoming?: number
}

export interface PractitionerMetrics {
  total_consultations: number
  completed: number
  pending: number
  cancelled: number
  total_earned: number
  upcoming?: number
}

export interface MetricsResponse {
  as_client: ClientMetrics
  as_practitioner: PractitionerMetrics
}

// ==================== CREATE/UPDATE TYPES ====================
export interface CreateConsultationData {
  practitioner: number
  date: string
  time: string
  duration_minutes?: number
  client_notes?: string
}

export interface UpdateConsultationData {
  status?: ConsultationStatus
  client_notes?: string
  practitioner_notes?: string
}

export interface CreateAvailabilityData {
  practitioner_id: number
  recurrence_type: RecurrenceType
  day_of_week?: DayOfWeek
  specific_date?: string
  start_time: string
  end_time: string
  is_available?: boolean
  notes?: string
}

export interface BulkAvailabilityData {
  practitioner_id: number
  days: DayOfWeek[]
  start_time: string
  end_time: string
  is_available?: boolean
  notes?: string
}

// ==================== APPLICATION TYPES ====================
export type ApplicationStatus = 'pending' | 'approved' | 'rejected' | 'more_info'

export interface PractitionerApplication {
  id: number
  user: number
  user_email?: string
  user_name?: string
  bio: string
  city: string
  hourly_rate: string
  years_of_experience: number
  qualifications: string
  license_number: string
  specialties: Specialty[]
  status: ApplicationStatus
  admin_notes?: string
  created_at: string
  updated_at: string
  reviewed_at?: string
  reviewed_by?: number
}

export interface ApplicationStatusResponse {
  hasApplication: boolean
  application: PractitionerApplication | null
}

// ==================== DASHBOARD TYPES ====================
export interface DashboardStats {
  total_consultations: number
  upcoming_consultations: number
  total_practitioners: number
  total_reviews: number
  recent_activity: Consultation[]
}

// ==================== PRACTITIONER METRIC TYPES ====================
export interface PractitionerMetric {
  id: number
  name: string
  email: string
  specialties: string[]
  total_consultations: number
  completed_consultations: number
  revenue: number
  average_rating: number
  hourly_rate?: number
}


export interface Availability {
  id: number
  practitioner: number
  practitioner_name?: string
  recurrence_type: RecurrenceType
  day_of_week: DayOfWeek | null
  specific_date: string | null
  start_time: string
  end_time: string
  is_available: boolean
  notes: string | null
  created_at: string
  updated_at: string
}

// Add this new interface
export interface CheckSlotResponse {
  available: boolean
  reason?: string 
  message?: string
  conflicting_consultation?: {
    id: number
    date: string
    time: string
  }
  practitioner_name?: string
  available_slots?: TimeSlot[]
}

export interface TimeSlot {
  date: string
  start_time: string
  end_time: string
  practitioner_id: number
  practitioner_name: string
  formatted_time?: string
}

export interface BulkAvailabilityData {
  practitioner_id: number
  days: DayOfWeek[]
  start_time: string
  end_time: string
  is_available?: boolean
  notes?: string
}