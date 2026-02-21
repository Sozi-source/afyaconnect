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
  
  // Cast user to ExtendedUser
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
      
      // Handle both array and paginated responses
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
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (error || !practitioner) {
    return (
      <div className="text-center py-12 px-4">
        <h2 className="text-xl sm:text-2xl font-bold text-red-600 dark:text-red-400 mb-4">
          {error ? 'Error Loading Data' : 'Practitioner Not Found'}
        </h2>
        <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-6">
          {error || "The practitioner you're looking for doesn't exist or has been removed."}
        </p>
        <Link href="/dashboard/practitioners">
          <Button variant="outline">
            Back to Practitioners
          </Button>
        </Link>
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
      className="space-y-4 sm:space-y-6"
    >
      {/* Header with Back Button and Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <Link href="/dashboard/practitioners">
          <Button variant="outline" size="sm" className="!px-3">
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
            Back to Practitioners
          </Button>
        </Link>

        {/* Tabs - Only show if user is client or admin */}
        {(!isCurrentUserPractitioner || extendedUser?.is_staff) && (
          <div className="flex border-b border-gray-200 dark:border-gray-700">
            <button
              onClick={() => handleTabChange('profile')}
              className={`px-4 py-2 font-medium text-sm ${
                activeTab === 'profile'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'
              }`}
            >
              Profile
            </button>
            <button
              onClick={() => handleTabChange('consultations')}
              className={`px-4 py-2 font-medium text-sm ${
                activeTab === 'consultations'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'
              }`}
            >
              View Consultations
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
            <Card>
              <CardBody className="p-4 sm:p-6">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Practice Information
                </h3>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <MapPinIcon className="h-5 w-5 text-gray-400 flex-shrink-0" />
                    <div>
                      <p className="text-sm text-gray-500">Location</p>
                      <p className="text-sm font-medium">{practitioner.city || 'Not specified'}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CurrencyDollarIcon className="h-5 w-5 text-gray-400 flex-shrink-0" />
                    <div>
                      <p className="text-sm text-gray-500">Hourly Rate</p>
                      <p className="text-sm font-medium">
                        {practitioner.hourly_rate ? `KES ${practitioner.hourly_rate}` : 'Not specified'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <BriefcaseIcon className="h-5 w-5 text-gray-400 flex-shrink-0" />
                    <div>
                      <p className="text-sm text-gray-500">Experience</p>
                      <p className="text-sm font-medium">
                        {practitioner.years_of_experience} years
                      </p>
                    </div>
                  </div>
                </div>
              </CardBody>
            </Card>

            {/* Action Card - View Consultations Button */}
            <Card>
              <CardBody className="p-4 sm:p-6">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Consultations
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  View upcoming and past consultations with {practitioner.first_name}.
                </p>
                <Button 
                  variant="primary" 
                  fullWidth 
                  onClick={() => handleTabChange('consultations')}
                  className="text-sm sm:text-base"
                >
                  <CalendarIcon className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                  View Consultations
                </Button>
              </CardBody>
            </Card>

            {/* Contact Card */}
            <Card>
              <CardBody className="p-4 sm:p-6">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Get in Touch
                </h3>
                <Button variant="outline" fullWidth className="text-sm sm:text-base">
                  <ChatBubbleLeftIcon className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                  Send Message
                </Button>
              </CardBody>
            </Card>
          </div>
        </div>
      )}

      {/* Consultations Tab */}
      {activeTab === 'consultations' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Consultations with {practitioner.first_name}</h2>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setActiveTab('profile')}
            >
              Back to Profile
            </Button>
          </div>
          
          {consultationsLoading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : consultations.length === 0 ? (
            <Card>
              <CardBody className="p-8 text-center">
                <CalendarIcon className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600 dark:text-gray-400">No consultations found</p>
                <p className="text-sm text-gray-500 mt-2">
                  There are no upcoming or past consultations with this practitioner.
                </p>
              </CardBody>
            </Card>
          ) : (
            <div className="grid gap-4">
              {consultations.map((consultation) => (
                <Card key={consultation.id}>
                  <CardBody className="p-4 sm:p-6">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                          <CalendarIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                          <h3 className="font-semibold">
                            {new Date(consultation.date).toLocaleDateString('en-US', {
                              weekday: 'long',
                              month: 'long',
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {consultation.time.slice(0,5)} • {consultation.duration_minutes} minutes
                          </p>
                          {consultation.client_notes && (
                            <p className="text-sm text-gray-500 mt-2">
                              <span className="font-medium">Notes:</span> {consultation.client_notes}
                            </p>
                          )}
                        </div>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium w-fit ${
                        consultation.status === 'completed' 
                          ? 'bg-green-100 text-green-800'
                          : consultation.status === 'cancelled'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-blue-100 text-blue-800'
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
    </motion.div>
  )
}