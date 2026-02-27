// app/lib/utils.ts
import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import type { PaginatedResponse, DayOfWeek, ConsultationStatus, ApplicationStatus } from '@/app/types'

// ============================================================================
// TAILWIND CSS UTILITIES
// ============================================================================

/**
 * Merge Tailwind CSS classes without conflicts
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// ============================================================================
// API DATA EXTRACTION
// ============================================================================

/**
 * Extract results from paginated API responses
 * Handles both array responses and paginated objects with 'results' property
 */
export function extractResults<T>(data: T[] | PaginatedResponse<T> | any): T[] {
  if (Array.isArray(data)) {
    return data
  }
  if (data && typeof data === 'object' && 'results' in data && Array.isArray(data.results)) {
    return data.results as T[]
  }
  if (data && typeof data === 'object' && 'data' in data && Array.isArray(data.data)) {
    return data.data as T[]
  }
  console.warn('Unexpected data format:', data)
  return []
}

// ============================================================================
// DATE & TIME FORMATTING
// ============================================================================

/**
 * Format a date string or Date object to a readable format
 */
export function formatDate(
  date: string | Date,
  options?: Intl.DateTimeFormatOptions
): string {
  const d = typeof date === 'string' ? new Date(date) : date
  
  // Check if date is valid
  if (isNaN(d.getTime())) {
    console.warn('Invalid date:', date)
    return 'Invalid date'
  }
  
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    ...options,
  }).format(d)
}

/**
 * Format a date with weekday
 */
export function formatDateWithWeekday(date: string | Date): string {
  return formatDate(date, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
}

/**
 * Format time string (HH:MM:SS or HH:MM) to readable format
 */
export function formatTime(time: string): string {
  if (!time) return '--:--'
  
  // Handle ISO datetime strings
  if (time.includes('T')) {
    return new Date(time).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    })
  }
  
  // Handle time strings like "14:30:00" or "14:30"
  return time.slice(0, 5)
}

/**
 * Format time range
 */
export function formatTimeRange(start: string, end: string): string {
  return `${formatTime(start)} - ${formatTime(end)}`
}

/**
 * Get relative time (e.g., "2 hours ago", "yesterday")
 */
export function getRelativeTime(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date
  const now = new Date()
  const diffMs = now.getTime() - d.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'just now'
  if (diffMins < 60) return `${diffMins} minute${diffMins === 1 ? '' : 's'} ago`
  if (diffHours < 24) return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`
  if (diffDays === 1) return 'yesterday'
  if (diffDays < 7) return `${diffDays} days ago`
  
  return formatDate(d)
}

/**
 * Check if a date is in the past
 */
export function isPastDate(date: string | Date): boolean {
  const d = typeof date === 'string' ? new Date(date) : date
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return d < today
}

/**
 * Check if a date is today
 */
export function isToday(date: string | Date): boolean {
  const d = typeof date === 'string' ? new Date(date) : date
  const today = new Date()
  return d.toDateString() === today.toDateString()
}

/**
 * Check if a date is tomorrow
 */
export function isTomorrow(date: string | Date): boolean {
  const d = typeof date === 'string' ? new Date(date) : date
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  return d.toDateString() === tomorrow.toDateString()
}

// ============================================================================
// CURRENCY FORMATTING
// ============================================================================

/**
 * Format currency amount
 */
export function formatCurrency(
  amount: number,
  currency: string = 'KES',
  locale: string = 'en-KE'
): string {
  if (amount === undefined || amount === null) return `${currency} 0`
  
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

/**
 * Format number with commas
 */
export function formatNumber(num: number): string {
  return new Intl.NumberFormat('en-US').format(num)
}

// ============================================================================
// STATUS COLOR UTILITIES
// ============================================================================

/**
 * Get status color classes for different status types
 */
export const statusColors: Record<string, string> = {
  // Consultation statuses
  booked: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  completed: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
  cancelled: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
  no_show: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300',
  pending: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300',
  confirmed: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
  
  // Application statuses
  draft: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
  info_needed: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
  approved: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
  rejected: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
  
  // Availability types
  weekly: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
  one_time: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300',
  unavailable: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
  
  // Verification status
  verified: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
  unverified: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300',
  
  // Payment status
  paid: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
  unpaid: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300',
  refunded: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
  
  // Default
  default: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
}

/**
 * Get status color class for a given status
 */
export function getStatusColor(status: string): string {
  return statusColors[status] || statusColors.default
}

/**
 * Get human-readable status text
 */
export function getStatusText(status: string): string {
  const statusMap: Record<string, string> = {
    booked: 'Upcoming',
    completed: 'Completed',
    cancelled: 'Cancelled',
    no_show: 'No Show',
    pending: 'Pending',
    confirmed: 'Confirmed',
    draft: 'Draft',
    info_needed: 'Info Needed',
    approved: 'Approved',
    rejected: 'Rejected',
    weekly: 'Weekly',
    one_time: 'One Time',
    unavailable: 'Unavailable',
    verified: 'Verified',
    unverified: 'Unverified',
    paid: 'Paid',
    unpaid: 'Unpaid',
    refunded: 'Refunded',
  }
  
  return statusMap[status] || status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')
}

// ============================================================================
// DAY OF WEEK UTILITIES
// ============================================================================

/**
 * Day of week mapping (JS Sunday=0 to Monday=0)
 */
export const dayMapping: Record<number, DayOfWeek> = {
  0: 6, // Sunday (JS) -> 6 (Backend Sunday)
  1: 0, // Monday -> 0
  2: 1, // Tuesday -> 1
  3: 2, // Wednesday -> 2
  4: 3, // Thursday -> 3
  5: 4, // Friday -> 4
  6: 5, // Saturday -> 5
}

/**
 * Get day of week name
 */
export function getDayName(day: DayOfWeek, format: 'short' | 'long' = 'long'): string {
  const days = {
    long: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
    short: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
  }
  
  return days[format][day]
}

/**
 * Convert JS day (0-6, Sunday=0) to backend day (0-6, Monday=0)
 */
export function jsDayToBackendDay(jsDay: number): DayOfWeek {
  return dayMapping[jsDay]
}

/**
 * Convert backend day (0-6, Monday=0) to JS day (0-6, Sunday=0)
 */
export function backendDayToJsDay(backendDay: DayOfWeek): number {
  return Object.keys(dayMapping).find(key => dayMapping[parseInt(key)] === backendDay) as unknown as number
}

// ============================================================================
// TEXT UTILITIES
// ============================================================================

/**
 * Truncate text to a maximum length
 */
export function truncateText(text: string, maxLength: number): string {
  if (!text) return ''
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength) + '...'
}

/**
 * Capitalize first letter of each word
 */
export function capitalizeWords(text: string): string {
  if (!text) return ''
  return text.replace(/\b\w/g, char => char.toUpperCase())
}

/**
 * Generate initials from name
 */
export function getInitials(firstName?: string, lastName?: string): string {
  if (!firstName && !lastName) return 'U'
  return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase()
}

/**
 * Format phone number
 */
export function formatPhoneNumber(phone: string): string {
  if (!phone) return ''
  
  // Remove all non-numeric characters
  const cleaned = phone.replace(/\D/g, '')
  
  // Check if it's a Kenyan number
  if (cleaned.startsWith('254')) {
    return cleaned.replace(/(\d{3})(\d{3})(\d{3})/, '+$1 $2 $3')
  }
  
  // Default formatting
  const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/)
  if (match) {
    return '(' + match[1] + ') ' + match[2] + '-' + match[3]
  }
  
  return phone
}

// ============================================================================
// FILE UTILITIES
// ============================================================================

/**
 * Format file size
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

/**
 * Get file extension
 */
export function getFileExtension(filename: string): string {
  return filename.slice((filename.lastIndexOf('.') - 1 >>> 0) + 2)
}

// ============================================================================
// PERFORMANCE UTILITIES
// ============================================================================

/**
 * Debounce function to limit how often a function can be called
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null
  
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

/**
 * Throttle function to limit the rate at which a function can be called
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean = false
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => (inThrottle = false), limit)
    }
  }
}

/**
 * Measure function execution time
 */
export async function measurePerformance<T>(
  fn: () => Promise<T> | T,
  label: string
): Promise<T> {
  const start = performance.now()
  try {
    const result = await fn()
    const duration = Math.round(performance.now() - start)
    console.log(`⚡ ${label} completed in ${duration}ms`)
    return result
  } catch (error) {
    const duration = Math.round(performance.now() - start)
    console.error(`⚡ ${label} failed after ${duration}ms`)
    throw error
  }
}

// ============================================================================
// VALIDATION UTILITIES
// ============================================================================

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return re.test(email)
}

/**
 * Validate phone number (basic)
 */
export function isValidPhone(phone: string): boolean {
  const re = /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/
  return re.test(phone)
}

/**
 * Validate time string (HH:MM)
 */
export function isValidTime(time: string): boolean {
  const re = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/
  return re.test(time)
}

/**
 * Validate date string (YYYY-MM-DD)
 */
export function isValidDate(date: string): boolean {
  const re = /^\d{4}-\d{2}-\d{2}$/
  if (!re.test(date)) return false
  
  const d = new Date(date)
  return d instanceof Date && !isNaN(d.getTime())
}

// ============================================================================
// RANDOM UTILITIES
// ============================================================================

/**
 * Generate a random ID
 */
export function generateId(): string {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15)
}

/**
 * Generate a random color based on string
 */
export function stringToColor(str: string): string {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash)
  }
  
  const hue = hash % 360
  return `hsl(${hue}, 70%, 80%)`
}

/**
 * Sleep for a given number of milliseconds
 */
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * Retry a function with exponential backoff
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  let lastError: any
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn()
    } catch (error: any) {
      lastError = error
      
      // Don't retry on 4xx errors (client errors)
      if (error.response?.status >= 400 && error.response?.status < 500) {
        throw error
      }
      
      if (attempt < maxRetries) {
        const delay = baseDelay * Math.pow(2, attempt - 1)
        console.log(`🔄 Retry attempt ${attempt}/${maxRetries} after ${delay}ms`)
        await sleep(delay)
      }
    }
  }
  
  throw lastError
}