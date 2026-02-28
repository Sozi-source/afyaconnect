// ==================== USER TYPES ====================
export interface User {
  id: number
  email: string
  first_name?: string
  last_name?: string
  username?: string
  is_staff?: boolean
  is_active?: boolean
  role?: 'client' | 'practitioner' | 'admin'
  is_verified?: boolean
  profile?: UserProfile
  practitioner?: { 
    id: number
  }
}

export interface UserProfile {
  id: number
  user: number
  role: 'client' | 'practitioner'
  phone?: string | null
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
  user?: {
    email: string
    first_name: string
    last_name: string
    role: string
    is_practitioner: boolean
    is_verified: boolean
    is_staff: boolean
  }
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
  currency?: string
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
  application_status?: ApplicationStatus
  total_reviews?: number
  average_rating?: number
  created_at: string
  updated_at: string
}

// ==================== PRACTITIONER APPLICATION TYPES ====================
export type ApplicationStatus = 'draft' | 'pending' | 'approved' | 'rejected' | 'info_needed'

export interface PractitionerApplication {
  id: number
  user: number
  user_email?: string
  user_name?: string
  full_name?: string
  email?: string
  professional_title: string
  qualifications: string
  experience_description: string
  specialized_areas: string
  id_document?: string
  certification_documents?: string
  profile_photo?: string
  linkedin_url?: string
  website_url?: string
  status: ApplicationStatus
  admin_notes?: string
  rejection_reason?: string
  submitted_at?: string
  reviewed_at?: string
  reviewed_by?: number
  terms_accepted: boolean
  data_consent_given: boolean
  created_at: string
  updated_at: string
}

export interface PractitionerApplicationData {
  professional_title?: string
  qualifications: string
  experience_description: string
  specialized_areas?: string
  id_document?: File
  certification_documents?: File
  profile_photo?: File
  linkedin_url?: string
  website_url?: string
  terms_accepted: boolean
  data_consent_given: boolean
}

export interface ApplicationStatusResponse {
  hasApplication: boolean
  application: PractitionerApplication | null
  can_edit?: boolean
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
  day_display?: string
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
  client_email?: string
  practitioner: number
  practitioner_name?: string
  practitioner_email?: string
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
  has_review?: boolean
  can_review?: boolean
}

// ==================== REVIEW TYPES ====================
export interface Review {
  id: number
  consultation: number
  reviewer: number
  reviewer_name?: string
  reviewer_email?: string
  practitioner?: number
  practitioner_name?: string
  practitioner_email?: string
  client_name?: string
  client_email?: string
  rating: 1 | 2 | 3 | 4 | 5
  comment: string | null
  created_at: string
  updated_at?: string
  consultation_date?: string
  consultation_time?: string
}

export interface CreateReviewData {
  consultation: number
  rating: number
  comment?: string
}

// ==================== TIME SLOT TYPES ====================
export interface TimeSlot {
  date: string
  start_time: string
  end_time: string
  practitioner_id: number
  practitioner_name: string
  formatted_time?: string
  is_available?: boolean
  id?:number
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
  completed_consultations: number
  upcoming_consultations: number
  cancelled_consultations: number
  total_spent: number
  pending_reviews: number
  average_rating?: number
}

export interface PractitionerMetrics {
  total_consultations: number
  completed_consultations: number
  upcoming_consultations: number
  cancelled_consultations: number
  total_earnings: number
  average_rating: number
  total_reviews: number
  completion_rate: number
  total_clients?: number
}

export interface MetricsResponse {
  as_client?: ClientMetrics
  as_practitioner?: PractitionerMetrics
  total_consultations?: number
  completed_consultations?: number
  upcoming_consultations?: number
  cancelled_consultations?: number
  total_earnings?: number
  total_spent?: number
  pending_reviews?: number
  average_rating?: number
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
  recurrence_type: RecurrenceType
  day_of_week?: DayOfWeek
  specific_date?: string
  start_time: string
  end_time: string
  is_available?: boolean
  notes?: string
}

export interface BulkAvailabilityData {
  days: DayOfWeek[]
  start_time: string
  end_time: string
  is_available?: boolean
  notes?: string
}

// ==================== DASHBOARD TYPES ====================
export interface DashboardStats {
  total_consultations: number
  upcoming_consultations: number
  completed_consultations: number
  cancelled_consultations: number
  total_earnings?: number
  total_spent?: number
  pending_reviews?: number
  average_rating?: number
  total_reviews?: number
  total_clients?: number
  recent_activity?: Consultation[]
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
  city?: string
  is_verified?: boolean
}

// ==================== SLOT CHECK TYPES ====================
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

// ==================== NOTIFICATION TYPES ====================
export type NotificationType = 
  | 'consultation_request'
  | 'consultation_confirmed'
  | 'consultation_cancelled'
  | 'consultation_completed'
  | 'review_received'
  | 'payment_received'
  | 'practitioner_verified'
  | 'application_approved'
  | 'application_rejected'
  | 'info_requested'
  | 'system'

export interface Notification {
  id: number
  recipient: number
  notification_type: NotificationType
  title: string
  message: string
  data: Record<string, any>
  is_read: boolean
  created_at: string
  read_at?: string
  time_ago?: string
}

export interface UnreadCountResponse {
  unread_count: number
}

// ==================== ADMIN TYPES ====================
export interface AdminStats {
  total_users: number
  total_practitioners: number
  total_clients: number
  pending_applications: number
  pending_verifications: number
  total_consultations: number
  total_revenue: number
  recent_applications?: PractitionerApplication[]
  recent_consultations?: Consultation[]
}

export interface AdminActionResponse {
  message: string
  status: string
  id?: number
}

// ==================== FILE UPLOAD TYPES ====================
export interface FileUploadResponse {
  id: number
  file: string
  filename: string
  uploaded_at: string
}

// ==================== PAYMENT TYPES (Future) ====================
export interface Payment {
  id: number
  consultation: number
  amount: number
  currency: string
  status: 'pending' | 'completed' | 'failed' | 'refunded'
  payment_method: string
  transaction_id?: string
  created_at: string
  completed_at?: string
}

// ==================== CHAT/MESSAGE TYPES (Future) ====================
export interface Message {
  id: number
  sender: number
  sender_name?: string
  recipient: number
  recipient_name?: string
  consultation?: number
  content: string
  is_read: boolean
  created_at: string
  attachments?: FileUploadResponse[]
}