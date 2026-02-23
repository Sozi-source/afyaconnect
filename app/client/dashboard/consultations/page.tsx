'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/app/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { 
  CalendarIcon,
  ClockIcon,
  VideoCameraIcon,
  PhoneIcon,
  ArrowPathIcon,
  StarIcon
} from '@heroicons/react/24/outline'
import { Card, CardBody } from '@/app/components/ui/Card'
import { Button } from '@/app/components/ui/Buttons'
import { apiClient } from '@/app/lib/api'
import type { Consultation } from '@/app/types'

export default function ClientConsultationsPage() {
  const { user, isAuthenticated } = useAuth()
  const router = useRouter()
  const [consultations, setConsultations] = useState<Consultation[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'completed' | 'cancelled'>('upcoming')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login')
      return
    }
    fetchConsultations()
  }, [isAuthenticated, router, filter])

  const fetchConsultations = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const filters: any = {}
      
      // Add status filter based on selected tab
      if (filter !== 'all') {
        filters.status = filter === 'upcoming' ? 'booked' : filter
      }
      
      // Use the appropriate endpoint based on user role
      const data = await apiClient.consultations.getMyClientConsultations(filters)
      setConsultations(data)
    } catch (error: any) {
      console.error('Error fetching consultations:', error)
      setError(error.message || 'Failed to load consultations')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    await fetchConsultations()
  }

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'booked': 
        return 'bg-blue-50 text-blue-800 border border-blue-200 dark:bg-blue-900/30 dark:text-blue-200 dark:border-blue-800'
      case 'completed': 
        return 'bg-green-50 text-green-800 border border-green-200 dark:bg-green-900/30 dark:text-green-200 dark:border-green-800'
      case 'cancelled': 
        return 'bg-red-50 text-red-800 border border-red-200 dark:bg-red-900/30 dark:text-red-200 dark:border-red-800'
      default: 
        return 'bg-gray-50 text-gray-800 border border-gray-200 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-700'
    }
  }

  const getStatusText = (status: string) => {
    switch(status) {
      case 'booked': return 'Upcoming'
      case 'completed': return 'Completed'
      case 'cancelled': return 'Cancelled'
      default: return status
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const formatTime = (timeString: string) => {
    if (timeString.includes('T')) {
      return new Date(timeString).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
      })
    }
    return timeString.slice(0,5)
  }

  const canWriteReview = (consultation: Consultation) => {
    return consultation.status === 'completed' && !consultation.has_review
  }

  const handleJoinCall = (consultation: Consultation) => {
    // Implement video/phone call logic here
    console.log('Joining call for consultation:', consultation.id)
  }

  if (loading && !refreshing) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-4 border-emerald-200 border-t-emerald-600"></div>
          <p className="text-sm text-gray-600 dark:text-gray-400">Loading consultations...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">
              My Consultations
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Track and manage your appointments
            </p>
          </div>
          
          {/* Action Buttons */}
          <div className="flex flex-col xs:flex-row gap-2 w-full sm:w-auto">
            <Button
              onClick={handleRefresh}
              disabled={refreshing}
              variant="outline"
              className="w-full xs:w-auto inline-flex items-center justify-center gap-2 px-3 sm:px-4 py-2 text-sm border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              <ArrowPathIcon className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
              <span className="sm:inline">{refreshing ? 'Refreshing...' : 'Refresh'}</span>
            </Button>
            <Link href="/client/dashboard/practitioners" className="w-full xs:w-auto">
              <Button className="w-full xs:w-auto inline-flex items-center justify-center px-3 sm:px-4 py-2 text-sm bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg transition-colors">
                Book New
              </Button>
            </Link>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-3 sm:p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-xs sm:text-sm text-red-700 dark:text-red-300">{error}</p>
          </div>
        )}

        {/* Filter Tabs */}
        <div className="mb-6 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 scrollbar-hide">
          <div className="flex sm:flex-wrap gap-2 min-w-max sm:min-w-0">
            {['upcoming', 'completed', 'cancelled', 'all'].map((tab) => (
              <button
                key={tab}
                onClick={() => setFilter(tab as any)}
                className={`
                  px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium rounded-lg whitespace-nowrap transition-all
                  ${filter === tab
                    ? 'bg-emerald-600 text-white shadow-md'
                    : 'bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800'
                  }
                `}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Consultations Grid */}
        <div className="space-y-3 sm:space-y-4">
          {consultations.length > 0 ? (
            consultations.map((consultation, index) => (
              <motion.div
                key={consultation.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Link href={`/client/dashboard/consultations/${consultation.id}`}>
                  <Card className="block bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 hover:shadow-lg transition-all">
                    <CardBody className="p-3 sm:p-4 lg:p-5">
                      {/* Main Content */}
                      <div className="flex flex-col gap-3">
                        {/* Top Row: Practitioner Info + Status */}
                        <div className="flex items-start justify-between gap-2">
                          {/* Practitioner Info */}
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-full flex items-center justify-center text-white font-bold text-sm sm:text-base flex-shrink-0">
                              {consultation.practitioner_name?.[0] || 'P'}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base truncate">
                                Dr. {consultation.practitioner_name || 'Practitioner'}
                              </h3>
                              {/* Date/Time */}
                              <div className="flex flex-wrap items-center gap-1 sm:gap-2 mt-0.5">
                                <span className="inline-flex items-center text-xs text-gray-600 dark:text-gray-400 whitespace-nowrap">
                                  <CalendarIcon className="h-3 w-3 sm:h-3.5 sm:w-3.5 mr-1" />
                                  {formatDate(consultation.date)}
                                </span>
                                <span className="inline-flex items-center text-xs text-gray-600 dark:text-gray-400 whitespace-nowrap">
                                  <ClockIcon className="h-3 w-3 sm:h-3.5 sm:w-3.5 mr-1" />
                                  {formatTime(consultation.time)}
                                </span>
                                <span className="text-xs text-gray-500 dark:text-gray-500 whitespace-nowrap">
                                  ({consultation.duration_minutes}m)
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Status Badge */}
                          <span className={`px-2 sm:px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ${getStatusColor(consultation.status)}`}>
                            {getStatusText(consultation.status)}
                          </span>
                        </div>

                        {/* Bottom Row: Review + Actions */}
                        <div className="flex items-center justify-between gap-2 pl-12 sm:pl-14">
                          {/* Review Badge */}
                          <div className="flex-1 min-w-0">
                            {canWriteReview(consultation) && (
                              <span className="inline-flex items-center text-xs text-amber-700 bg-amber-50 dark:bg-amber-900/30 dark:text-amber-300 px-2 py-1 rounded-full">
                                <StarIcon className="h-3 w-3 mr-1" />
                                <span className="hidden xs:inline">Write a Review</span>
                                <span className="xs:hidden">Review</span>
                              </span>
                            )}
                          </div>

                          {/* Action Buttons */}
                          {consultation.status === 'booked' && (
                            <div className="flex gap-1 sm:gap-2">
                              <button 
                                onClick={(e) => {
                                  e.preventDefault()
                                  handleJoinCall(consultation)
                                }}
                                className="p-1.5 sm:p-2 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                                title="Video Call"
                              >
                                <VideoCameraIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-gray-700 dark:text-gray-300" />
                              </button>
                              <button 
                                onClick={(e) => {
                                  e.preventDefault()
                                  handleJoinCall(consultation)
                                }}
                                className="p-1.5 sm:p-2 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                                title="Phone Call"
                              >
                                <PhoneIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-gray-700 dark:text-gray-300" />
                              </button>
                            </div>
                          )}
                        </div>

                        {/* Client Notes */}
                        {consultation.client_notes && (
                          <div className="mt-2 p-2 sm:p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
                            <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 break-words">
                              <span className="font-medium">📝 Note:</span> {consultation.client_notes}
                            </p>
                          </div>
                        )}
                      </div>
                    </CardBody>
                  </Card>
                </Link>
              </motion.div>
            ))
          ) : (
            <EmptyState filter={filter} />
          )}
        </div>
      </div>
    </div>
  )
}

function EmptyState({ filter }: { filter: string }) {
  return (
    <div className="text-center py-8 sm:py-12 lg:py-16 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800">
      <div className="text-4xl sm:text-5xl lg:text-6xl mb-3 sm:mb-4">📅</div>
      <h3 className="text-base sm:text-lg lg:text-xl font-semibold text-gray-900 dark:text-white mb-2">
        No consultations found
      </h3>
      <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 max-w-md mx-auto px-4">
        {filter === 'upcoming' 
          ? "You don't have any upcoming consultations. Book your first consultation now!"
          : `No ${filter} consultations to display`}
      </p>
      {filter === 'upcoming' && (
        <Link href="/client/dashboard/practitioners" className="inline-block mt-4 sm:mt-6">
          <Button className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 sm:px-6 py-2 sm:py-2.5 text-xs sm:text-sm font-medium rounded-lg">
            Find a Practitioner
          </Button>
        </Link>
      )}
    </div>
  )
}