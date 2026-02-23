'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { apiClient } from '@/app/lib/api'
import { PractitionerProfile } from '@/app/components/practitioners/PractitionerProfile'
import { Button } from '@/app/components/ui/Buttons'
import { Card, CardBody } from '@/app/components/ui/Card'
import { motion } from 'framer-motion'
import { 
  CalendarIcon, 
  ChatBubbleLeftIcon, 
  ArrowLeftIcon,
  ClockIcon,
  CurrencyDollarIcon,
  MapPinIcon,
  BriefcaseIcon
} from '@heroicons/react/24/outline'
import Link from 'next/link'
import { useAuth } from '@/app/contexts/AuthContext'
import type { Practitioner, Consultation, PaginatedResponse } from '@/app/types'

// Helper function to extract results from paginated response
const extractConsultations = (response: Consultation[] | PaginatedResponse<Consultation> | undefined): Consultation[] => {
  if (!response) return []
  if (Array.isArray(response)) return response
  if ('results' in response) return response.results
  return []
}

// Extend the User type locally
interface ExtendedUser {
  id: number
  email: string
  first_name?: string
  last_name?: string
  is_staff?: boolean
  role?: string
  practitioner?: any
}

export default function PractitionerDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { user, isAuthenticated } = useAuth()
  const id = parseInt(params.id as string)
  
  const extendedUser = user as ExtendedUser | null
  
  const [practitioner, setPractitioner] = useState<Practitioner | null>(null)
  const [consultations, setConsultations] = useState<Consultation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'profile' | 'consultations'>('profile')
  const [consultationsLoading, setConsultationsLoading] = useState(false)

  useEffect(() => {
    const fetchPractitioner = async () => {
      try {
        setLoading(true)
        const data = await apiClient.practitioners.getOne(id)
        setPractitioner(data)
      } catch (err: any) {
        console.error('❌ Error fetching practitioner:', err)
        setError(err.message || 'Failed to load practitioner')
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      fetchPractitioner()
    }
  }, [id])

  const fetchConsultations = async () => {
    if (!practitioner) return
    
    setConsultationsLoading(true)
    try {
      const response = await apiClient.consultations.getAll({
        practitioner: practitioner.id,
        status: 'booked'
      })
      
      const consultationsList = extractConsultations(response)
      setConsultations(consultationsList)
    } catch (err: any) {
      console.error('❌ Error fetching consultations:', err)
    } finally {
      setConsultationsLoading(false)
    }
  }

  const handleTabChange = (tab: 'profile' | 'consultations') => {
    setActiveTab(tab)
    if (tab === 'consultations' && consultations.length === 0) {
      fetchConsultations()
    }
  }

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-4">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-4 border-emerald-200 border-t-emerald-600"></div>
          <p className="text-sm text-gray-600 dark:text-gray-400">Loading practitioner...</p>
        </div>
      </div>
    )
  }

  if (error || !practitioner) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="text-4xl sm:text-5xl mb-4">⚠️</div>
          <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 dark:text-white mb-2">
            {error ? 'Error Loading Data' : 'Practitioner Not Found'}
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
            {error || "The practitioner you're looking for doesn't exist or has been removed."}
          </p>
          <Link href="/client/dashboard/practitioners">
            <Button variant="outline" className="border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300">
              Back to Practitioners
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  const isCurrentUserPractitioner = extendedUser && 'practitioner' in extendedUser
  const isOwnProfile = isCurrentUserPractitioner && practitioner.user === extendedUser?.id

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-gray-50 dark:bg-gray-950"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        {/* Header with Back Button and Tabs */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <Link href="/client/dashboard/practitioners">
            <Button variant="outline" size="sm" className="inline-flex items-center px-3 py-2 text-sm border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300">
              <ArrowLeftIcon className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Back to Practitioners</span>
              <span className="sm:hidden">Back</span>
            </Button>
          </Link>

          {/* Tabs */}
          {(!isCurrentUserPractitioner || extendedUser?.is_staff) && (
            <div className="flex border-b border-gray-200 dark:border-gray-800">
              <button
                onClick={() => handleTabChange('profile')}
                className={`px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium transition-colors relative ${
                  activeTab === 'profile'
                    ? 'text-emerald-600 dark:text-emerald-400 border-b-2 border-emerald-600'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300'
                }`}
              >
                Profile
              </button>
              <button
                onClick={() => handleTabChange('consultations')}
                className={`px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium transition-colors relative ${
                  activeTab === 'consultations'
                    ? 'text-emerald-600 dark:text-emerald-400 border-b-2 border-emerald-600'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300'
                }`}
              >
                Consultations
              </button>
            </div>
          )}
        </div>

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
            {/* Main Profile Content */}
            <div className="lg:col-span-2">
              <PractitionerProfile practitioner={practitioner} />
            </div>

            {/* Sidebar */}
            <div className="space-y-4 sm:space-y-6">
              {/* Quick Info Card */}
              <Card className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
                <CardBody className="p-4 sm:p-6">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Practice Information
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <MapPinIcon className="h-5 w-5 text-gray-500 dark:text-gray-500 flex-shrink-0" />
                      <div>
                        <p className="text-xs text-gray-600 dark:text-gray-400">Location</p>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{practitioner.city || 'Not specified'}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <CurrencyDollarIcon className="h-5 w-5 text-gray-500 dark:text-gray-500 flex-shrink-0" />
                      <div>
                        <p className="text-xs text-gray-600 dark:text-gray-400">Hourly Rate</p>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {practitioner.hourly_rate ? `KES ${practitioner.hourly_rate}` : 'Not specified'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <BriefcaseIcon className="h-5 w-5 text-gray-500 dark:text-gray-500 flex-shrink-0" />
                      <div>
                        <p className="text-xs text-gray-600 dark:text-gray-400">Experience</p>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {practitioner.years_of_experience} years
                        </p>
                      </div>
                    </div>
                  </div>
                </CardBody>
              </Card>

              {/* Action Card - View Consultations Button */}
              <Card className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
                <CardBody className="p-4 sm:p-6">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    Consultations
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-4">
                    View upcoming and past consultations with {practitioner.first_name}.
                  </p>
                  <Button 
                    variant="primary" 
                    fullWidth 
                    onClick={() => handleTabChange('consultations')}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-sm sm:text-base py-2.5"
                  >
                    <CalendarIcon className="h-4 w-4 mr-2" />
                    View Consultations
                  </Button>
                </CardBody>
              </Card>

              {/* Contact Card */}
              <Card className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
                <CardBody className="p-4 sm:p-6">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    Get in Touch
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-4">
                    Send a message or book a consultation.
                  </p>
                  <Button 
                    variant="outline" 
                    fullWidth 
                    className="w-full border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 text-sm sm:text-base py-2.5"
                  >
                    <ChatBubbleLeftIcon className="h-4 w-4 mr-2" />
                    Send Message
                  </Button>
                </CardBody>
              </Card>
            </div>
          </div>
        )}

        {/* Consultations Tab */}
        {activeTab === 'consultations' && (
          <div className="space-y-4 sm:space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">
                Consultations with {practitioner.first_name}
              </h2>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setActiveTab('profile')}
                className="border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 text-sm sm:text-base"
              >
                Back to Profile
              </Button>
            </div>
            
            {consultationsLoading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-4 border-emerald-200 border-t-emerald-600"></div>
              </div>
            ) : consultations.length === 0 ? (
              <Card className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
                <CardBody className="p-8 sm:p-12 text-center">
                  <CalendarIcon className="h-12 w-12 sm:h-16 sm:w-16 text-gray-400 dark:text-gray-600 mx-auto mb-3" />
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-2">No consultations found</h3>
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                    There are no upcoming or past consultations with this practitioner.
                  </p>
                </CardBody>
              </Card>
            ) : (
              <div className="grid gap-3 sm:gap-4">
                {consultations.map((consultation) => (
                  <Card key={consultation.id} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 hover:shadow-lg transition-all">
                    <CardBody className="p-3 sm:p-4 lg:p-5">
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                        <div className="flex items-start gap-3">
                          <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
                            <CalendarIcon className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base">
                              {new Date(consultation.date).toLocaleDateString('en-US', {
                                weekday: 'long',
                                month: 'long',
                                day: 'numeric',
                                year: 'numeric'
                              })}
                            </h3>
                            <div className="flex flex-wrap items-center gap-2 mt-1">
                              <span className="inline-flex items-center text-xs text-gray-600 dark:text-gray-400">
                                <ClockIcon className="h-3 w-3 mr-1" />
                                {consultation.time.slice(0,5)}
                              </span>
                              <span className="text-xs text-gray-500 dark:text-gray-500">
                                • {consultation.duration_minutes} min
                              </span>
                            </div>
                            {consultation.client_notes && (
                              <p className="text-xs text-gray-600 dark:text-gray-400 mt-2 p-2 bg-gray-50 dark:bg-gray-800/50 rounded">
                                <span className="font-medium">📝 Note:</span> {consultation.client_notes}
                              </p>
                            )}
                          </div>
                        </div>
                        <span className={`px-2 sm:px-3 py-1 rounded-full text-xs font-medium w-fit ${
                          consultation.status === 'completed' 
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                            : consultation.status === 'cancelled'
                            ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                            : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
                        }`}>
                          {consultation.status.charAt(0).toUpperCase() + consultation.status.slice(1)}
                        </span>
                      </div>
                    </CardBody>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </motion.div>
  )
}