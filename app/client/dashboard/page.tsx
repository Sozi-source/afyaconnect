'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/app/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { 
  CalendarIcon,
  ClockIcon,
  UserGroupIcon,
  CheckCircleIcon,
  BriefcaseIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline'
import { Card, CardBody } from '@/app/components/ui/Card'
import { Button } from '@/app/components/ui/Buttons'
import { apiClient } from '@/app/lib/api'
import type { Consultation } from '@/app/types'

// Status badge component with mobile-optimized sizing
const StatusBadge = ({ status }: { status: string }) => {
  const colors: Record<string, string> = {
    booked: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
    completed: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
    cancelled: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
    no_show: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
  }

  const color = colors[status] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
  const displayStatus = status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())

  return (
    <span className={`px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-medium ${color}`}>
      {displayStatus}
    </span>
  )
}

export default function ClientDashboardPage() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth()
  const router = useRouter()
  
  const [dataLoading, setDataLoading] = useState(true)
  const [consultations, setConsultations] = useState<Consultation[]>([])
  const [error, setError] = useState<string | null>(null)
  const [isMounted, setIsMounted] = useState(false)

  // Handle mounting
  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Log auth state changes for debugging
  useEffect(() => {
    console.log('📊 ClientDashboard - Auth state:', { 
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

      // Allow clients and admins to access client dashboard
      if (user && user.role !== 'client' && !user.is_staff) {
        console.log('🚫 Wrong role, redirecting to:', `/${user.role}/dashboard`)
        router.replace(`/${user.role}/dashboard`)
        return
      }
    }
  }, [authLoading, isAuthenticated, user, router, isMounted])

  // Fetch dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
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
      if (user.role !== 'client' && !user.is_staff) {
        console.log('⏳ User does not have access to client dashboard')
        return
      }

      try {
        setDataLoading(true)
        setError(null)
        
        console.log('📥 Fetching consultations for client:', user.id)
        
        const response = await apiClient.consultations.getMyClientConsultations()
        
        // Handle different response formats
        let consultationsArray: Consultation[] = []
        
        if (Array.isArray(response)) {
          consultationsArray = response
        } else if (response && typeof response === 'object') {
          if ('results' in response && Array.isArray((response as any).results)) {
            consultationsArray = (response as any).results
          } else if ('data' in response && Array.isArray((response as any).data)) {
            consultationsArray = (response as any).data
          }
        }
        
        console.log('📥 Fetched consultations:', consultationsArray.length)
        setConsultations(consultationsArray)
      } catch (error: any) {
        console.error('❌ Error fetching dashboard data:', error)
        setError(error.message || 'Failed to load dashboard data')
      } finally {
        setDataLoading(false)
      }
    }

    fetchDashboardData()
  }, [user, authLoading, isMounted]) // Re-run when user or auth state changes

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

  // Ensure consultations is an array
  const safeConsultations = Array.isArray(consultations) ? consultations : []
  
  // Calculate stats
  const stats = {
    totalConsultations: safeConsultations.length,
    upcoming: safeConsultations.filter(c => c.status === 'booked').length,
    completed: safeConsultations.filter(c => c.status === 'completed').length,
    cancelled: safeConsultations.filter(c => c.status === 'cancelled').length,
    noShow: safeConsultations.filter(c => c.status === 'no_show').length
  }

  const recentConsultations = safeConsultations.slice(0, 5)
  const firstName = user?.first_name || user?.email?.split('@')[0] || 'User'

  return (
    <div className="p-3 sm:p-4 md:p-6 space-y-4 sm:space-y-5 md:space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 dark:text-white">
          Client Dashboard
        </h1>
        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-0.5 sm:mt-1">
          Welcome back, {firstName}!
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
        <Card>
          <CardBody className="p-3 sm:p-4">
            <div className="flex items-center justify-between mb-1 sm:mb-2">
              <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400">Total</p>
              <CalendarIcon className="h-3 w-3 sm:h-4 sm:w-4 text-emerald-500" />
            </div>
            <p className="text-base sm:text-lg md:text-xl font-bold">{stats.totalConsultations}</p>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="p-3 sm:p-4">
            <div className="flex items-center justify-between mb-1 sm:mb-2">
              <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400">Upcoming</p>
              <ClockIcon className="h-3 w-3 sm:h-4 sm:w-4 text-blue-500" />
            </div>
            <p className="text-base sm:text-lg md:text-xl font-bold text-blue-600">{stats.upcoming}</p>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="p-3 sm:p-4">
            <div className="flex items-center justify-between mb-1 sm:mb-2">
              <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400">Completed</p>
              <CheckCircleIcon className="h-3 w-3 sm:h-4 sm:w-4 text-green-500" />
            </div>
            <p className="text-base sm:text-lg md:text-xl font-bold text-green-600">{stats.completed}</p>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="p-3 sm:p-4">
            <div className="flex items-center justify-between mb-1 sm:mb-2">
              <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400">Cancelled</p>
              <div className="h-3 w-3 sm:h-4 sm:w-4 rounded-full bg-red-500" />
            </div>
            <p className="text-base sm:text-lg md:text-xl font-bold text-red-600">{stats.cancelled}</p>
          </CardBody>
        </Card>
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 sm:p-4">
          <p className="text-xs sm:text-sm text-red-600 dark:text-red-400">{error}</p>
          <button 
            onClick={() => {
              setDataLoading(true)
              setError(null)
              // Re-fetch data
              apiClient.consultations.getMyClientConsultations()
                .then(response => {
                  let consultationsArray: Consultation[] = []
                  if (Array.isArray(response)) {
                    consultationsArray = response
                  } else if (response && typeof response === 'object') {
                    if ('results' in response && Array.isArray((response as any).results)) {
                      consultationsArray = (response as any).results
                    }
                  }
                  setConsultations(consultationsArray)
                })
                .catch(err => setError(err.message))
                .finally(() => setDataLoading(false))
            }}
            className="mt-2 text-xs sm:text-sm text-red-600 dark:text-red-400 hover:underline font-medium"
          >
            Try again
          </button>
        </div>
      )}

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-5 md:gap-6">
        {/* Recent Consultations */}
        <div className="lg:col-span-2">
          <Card>
            <CardBody className="p-3 sm:p-4 md:p-5">
              <div className="flex justify-between items-center mb-3 sm:mb-4">
                <h2 className="text-sm sm:text-base md:text-lg font-semibold">Recent Consultations</h2>
                <Link 
                  href="/client/dashboard/consultations" 
                  className="text-xs sm:text-sm text-emerald-600 hover:text-emerald-700 font-medium flex items-center gap-1"
                >
                  View all <ArrowRightIcon className="h-3 w-3" />
                </Link>
              </div>

              {safeConsultations.length > 0 ? (
                <div className="space-y-2 sm:space-y-3">
                  {recentConsultations.map((consultation) => (
                    <Link 
                      key={consultation.id} 
                      href={`/client/dashboard/consultations/${consultation.id}`}
                      className="block p-2 sm:p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0">
                        <div>
                          <p className="text-xs sm:text-sm font-medium">
                            Dr. {consultation.practitioner_name || 'Practitioner'}
                          </p>
                          <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                            {consultation.date ? new Date(consultation.date).toLocaleDateString() : 'Date TBD'} 
                            {consultation.time && ` at ${consultation.time.slice(0,5)}`}
                          </p>
                        </div>
                        <StatusBadge status={consultation.status} />
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 sm:py-8">
                  <CalendarIcon className="h-10 w-10 sm:h-12 sm:w-12 text-gray-400 mx-auto mb-2 sm:mb-3" />
                  <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">No consultations yet</p>
                  <Link href="/client/dashboard/practitioners">
                    <Button size="sm" className="mt-3 sm:mt-4 bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm px-3 sm:px-4 py-1.5 sm:py-2">
                      Book Your First Consultation
                    </Button>
                  </Link>
                </div>
              )}
            </CardBody>
          </Card>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-3 sm:space-y-4">
          {/* Quick Actions */}
          <Card>
            <CardBody className="p-3 sm:p-4 md:p-5">
              <h2 className="text-sm sm:text-base md:text-lg font-semibold mb-3 sm:mb-4">Quick Actions</h2>
              <div className="space-y-2">
                <Link href="/client/dashboard/practitioners">
                  <Button variant="outline" fullWidth className="justify-start text-xs sm:text-sm px-3 sm:px-4 py-2">
                    <UserGroupIcon className="h-3 w-3 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" />
                    Find Practitioners
                  </Button>
                </Link>
                <Link href="/client/dashboard/consultations">
                  <Button variant="outline" fullWidth className="justify-start text-xs sm:text-sm px-3 sm:px-4 py-2">
                    <CalendarIcon className="h-3 w-3 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" />
                    View Consultations
                  </Button>
                </Link>
              </div>
            </CardBody>
          </Card>

          {/* Become Practitioner Card */}
          <Card>
            <CardBody className="p-3 sm:p-4 md:p-5 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20">
              <div className="flex items-start gap-2 sm:gap-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-emerald-500 rounded-full flex items-center justify-center text-white flex-shrink-0">
                  <BriefcaseIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-white">
                    Become a Practitioner
                  </h3>
                  <p className="text-[10px] sm:text-xs text-gray-600 dark:text-gray-400 mt-0.5 sm:mt-1">
                    Interested in becoming a practitioner? Contact our support team.
                  </p>
                  <a
                    href="mailto:support@afyaconnect.com?subject=Practitioner%20Application"
                    className="inline-block mt-2 sm:mt-3 text-[10px] sm:text-xs text-emerald-600 hover:text-emerald-700 font-medium"
                  >
                    Contact Support →
                  </a>
                </div>
              </div>
            </CardBody>
          </Card>

          {/* No-show Notice */}
          {stats.noShow > 0 && (
            <Card>
              <CardBody className="p-3 sm:p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
                <p className="text-[10px] sm:text-xs text-amber-800 dark:text-amber-300">
                  You have {stats.noShow} no-show{stats.noShow > 1 ? 's' : ''}. Please contact support if this is an error.
                </p>
              </CardBody>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}