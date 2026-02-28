'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/app/contexts/AuthContext'
import { apiClient } from '@/app/lib/api'
import type { Consultation, ConsultationStatus, PaginatedResponse } from '@/app/types'
import Link from 'next/link'

// Status badge component with proper typing and mobile-optimized sizing
const StatusBadge = ({ status }: { status: ConsultationStatus }) => {
  const colors: Record<ConsultationStatus, string> = {
    booked: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
    completed: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
    cancelled: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
    no_show: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
  }

  const color = colors[status] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'

  // Format status for display
  const displayStatus = status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())

  return (
    <span className={`px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-medium ${color}`}>
      {displayStatus}
    </span>
  )
}

export default function PractitionerDashboardPage() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth()
  const router = useRouter()

  const [consultations, setConsultations] = useState<Consultation[]>([])
  const [dataLoading, setDataLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [isMounted, setIsMounted] = useState(false)

  // Handle mounting
  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Log auth state changes for debugging
  useEffect(() => {
    console.log('📊 PractitionerDashboard - Auth state:', { 
      user, 
      isAuthenticated, 
      authLoading,
      userRole: user?.role,
      isMounted 
    })
  }, [user, isAuthenticated, authLoading, isMounted])

  // Auth and role check
  useEffect(() => {
    if (!authLoading && isMounted) {
      if (!isAuthenticated) {
        console.log('🔒 Not authenticated, redirecting to login')
        router.replace('/login')
        return
      }

      if (user && user.role !== 'practitioner' && !user.is_staff) {
        console.log('🚫 Wrong role, redirecting to:', `/${user.role}/dashboard`)
        router.replace(`/${user.role}/dashboard`)
        return
      }
    }
  }, [authLoading, isAuthenticated, user, router, isMounted])

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      // Wait for auth to be ready
      if (authLoading || !isMounted) {
        console.log('⏳ Waiting for auth to be ready...')
        return
      }

      // Wait for user to be available
      if (!user) {
        console.log('⏳ Waiting for user data...')
        return
      }

      // Check if user has access
      if (user.role !== 'practitioner' && !user.is_staff) {
        console.log('⏳ User does not have access to practitioner dashboard')
        return
      }

      try {
        setDataLoading(true)
        setError(null)
        
        console.log('📥 Fetching consultations for practitioner:', user.id)
        
        const response = await apiClient.consultations.getMyPractitionerConsultations()
        
        // Handle different response formats
        let consultationsArray: Consultation[] = []
        
        if (Array.isArray(response)) {
          consultationsArray = response
        } else if (response && typeof response === 'object') {
          if ('results' in response && Array.isArray((response as any).results)) {
            consultationsArray = (response as PaginatedResponse<Consultation>).results
          } else if ('data' in response && Array.isArray((response as any).data)) {
            consultationsArray = (response as any).data
          }
        }
        
        console.log('📥 Fetched consultations:', consultationsArray.length)
        setConsultations(consultationsArray)
      } catch (error: any) {
        console.error('❌ Failed to fetch consultations:', error)
        
        // Handle timeout errors specifically
        if (error.message?.includes('timeout')) {
          setError('Request timed out. The server is taking too long to respond. Please try again.')
        } else if (error.message?.includes('network')) {
          setError('Network error. Please check your internet connection.')
        } else {
          setError(error.message || 'Failed to load consultations')
        }
      } finally {
        setDataLoading(false)
      }
    }

    fetchData()
  }, [user, authLoading, isMounted])

  // Show loading while auth is initializing
  if (authLoading || !isMounted) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-emerald-200 border-t-emerald-600"></div>
          <p className="text-sm text-neutral-500">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  // Show loading while waiting for user data
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-emerald-200 border-t-emerald-600"></div>
          <p className="text-sm text-neutral-500">Loading your profile...</p>
        </div>
      </div>
    )
  }

  // Show loading while fetching data
  if (dataLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 sm:h-12 sm:w-12 border-4 border-emerald-200 border-t-emerald-600"></div>
      </div>
    )
  }

  // Safety check
  if (!user || (user.role !== 'practitioner' && !user.is_staff)) {
    return null
  }

  // Ensure consultations is an array before using array methods
  const safeConsultations = Array.isArray(consultations) ? consultations : []
  
  // Calculate stats using valid status values
  const totalConsultations = safeConsultations.length
  const bookedCount = safeConsultations.filter(c => c.status === 'booked').length
  const completedCount = safeConsultations.filter(c => c.status === 'completed').length
  const cancelledCount = safeConsultations.filter(c => c.status === 'cancelled').length
  const noShowCount = safeConsultations.filter(c => c.status === 'no_show').length

  // Get user's display name
  const displayName = user.first_name 
    ? `${user.first_name} ${user.last_name || ''}`.trim()
    : user.email?.split('@')[0] || 'User'

  return (
    <div className="p-3 sm:p-4 md:p-6 space-y-4 sm:space-y-5 md:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-0">
        <div>
          <h1 className="text-lg sm:text-xl md:text-2xl font-semibold text-gray-900 dark:text-white">
            Welcome {user.is_staff ? 'Admin' : 'Dr.'} {displayName}
          </h1>
          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-0.5 sm:mt-1">
            {new Date().toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </p>
        </div>
        <div className="flex gap-2 sm:gap-3">
          <Link
            href="/practitioner/dashboard/availability"
            className="px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium"
          >
            Availability
          </Link>
          <Link
            href="/practitioner/dashboard/profile"
            className="px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors font-medium"
          >
            Profile
          </Link>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          <button 
            onClick={() => {
              setDataLoading(true)
              setError(null)
              // Re-fetch data
              apiClient.consultations.getMyPractitionerConsultations()
                .then(response => {
                  let consultationsArray: Consultation[] = []
                  if (Array.isArray(response)) {
                    consultationsArray = response
                  } else if (response && typeof response === 'object') {
                    if ('results' in response && Array.isArray((response as any).results)) {
                      consultationsArray = (response as PaginatedResponse<Consultation>).results
                    }
                  }
                  setConsultations(consultationsArray)
                })
                .catch(err => setError(err.message))
                .finally(() => setDataLoading(false))
            }}
            className="mt-2 text-sm text-red-600 dark:text-red-400 hover:underline font-medium"
          >
            Try again
          </button>
        </div>
      )}

      {/* Stats Cards - Mobile optimized grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 md:gap-4">
        <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 md:p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Total</p>
          <p className="text-lg sm:text-xl md:text-2xl font-semibold mt-1 sm:mt-2 text-gray-900 dark:text-white">{totalConsultations}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 md:p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Booked</p>
          <p className="text-lg sm:text-xl md:text-2xl font-semibold mt-1 sm:mt-2 text-blue-600 dark:text-blue-400">{bookedCount}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 md:p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Completed</p>
          <p className="text-lg sm:text-xl md:text-2xl font-semibold mt-1 sm:mt-2 text-green-600 dark:text-green-400">{completedCount}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 md:p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Cancelled</p>
          <p className="text-lg sm:text-xl md:text-2xl font-semibold mt-1 sm:mt-2 text-red-600 dark:text-red-400">{cancelledCount}</p>
        </div>
      </div>

      {/* Consultations Section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="px-3 sm:px-4 md:px-6 py-3 sm:py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <h2 className="text-sm sm:text-base md:text-lg font-medium text-gray-900 dark:text-white">Your Consultations</h2>
          {noShowCount > 0 && (
            <span className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400">
              {noShowCount} no-show{noShowCount > 1 ? 's' : ''}
            </span>
          )}
        </div>

        {error ? (
          <div className="p-6 sm:p-8 md:p-12 text-center text-red-600 dark:text-red-400">
            <p className="text-sm sm:text-base">{error}</p>
          </div>
        ) : safeConsultations.length === 0 ? (
          <div className="p-8 sm:p-10 md:p-12 text-center">
            <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400">No consultations found.</p>
            <p className="text-xs sm:text-sm text-gray-400 dark:text-gray-500 mt-2">
              When clients book appointments, they will appear here.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {safeConsultations.map((consultation) => (
              <Link
                key={consultation.id}
                href={`/practitioner/consultations/${consultation.id}`}
                className="block p-3 sm:p-4 md:p-6 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
              >
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 sm:gap-0">
                  <div className="space-y-1 sm:space-y-2">
                    <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                      <h3 className="text-sm sm:text-base font-medium text-gray-900 dark:text-white">
                        Consultation with {consultation.client_name || 'Client'}
                      </h3>
                      <StatusBadge status={consultation.status} />
                    </div>
                    
                    <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 space-y-0.5 sm:space-y-1">
                      {consultation.date && (
                        <p>
                          📅 {new Date(consultation.date).toLocaleDateString()} 
                          {consultation.time && ` at ${consultation.time}`}
                        </p>
                      )}
                      
                      {consultation.duration_minutes && (
                        <p>⏱️ Duration: {consultation.duration_minutes} minutes</p>
                      )}
                    </div>
                  </div>

                  <div className="text-[10px] sm:text-xs text-gray-400 dark:text-gray-500 sm:text-right">
                    {new Date(consultation.created_at).toLocaleDateString()}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Quick Actions - Mobile optimized */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 md:gap-4">
        <Link
          href="/practitioner/dashboard/availability"
          className="p-4 sm:p-5 md:p-6 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-lg border border-emerald-200 dark:border-emerald-800 hover:shadow-md transition-shadow"
        >
          <h3 className="text-sm sm:text-base font-semibold text-emerald-900 dark:text-emerald-300">Set Your Availability</h3>
          <p className="text-xs sm:text-sm text-emerald-700 dark:text-emerald-400 mt-1">
            Manage your working hours
          </p>
        </Link>

        <Link
          href="/practitioner/reviews"
          className="p-4 sm:p-5 md:p-6 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg border border-blue-200 dark:border-blue-800 hover:shadow-md transition-shadow"
        >
          <h3 className="text-sm sm:text-base font-semibold text-blue-900 dark:text-blue-300">View Reviews</h3>
          <p className="text-xs sm:text-sm text-blue-700 dark:text-blue-400 mt-1">
            See what clients say
          </p>
        </Link>
      </div>
    </div>
  )
}