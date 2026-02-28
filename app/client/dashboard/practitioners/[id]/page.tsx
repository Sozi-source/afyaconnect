// app/client/dashboard/practitioners/[id]/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { apiClient } from '@/app/lib/api'
import { PractitionerProfile } from '@/app/components/practitioners/PractitionerProfile'
import { Button } from '@/app/components/ui/Buttons'
import { Card, CardBody } from '@/app/components/ui/Card'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  CalendarIcon, 
  ChatBubbleLeftIcon, 
  ArrowLeftIcon,
  ClockIcon,
  CurrencyDollarIcon,
  MapPinIcon,
  BriefcaseIcon,
  StarIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline'
import Link from 'next/link'
import { useAuth } from '@/app/contexts/AuthContext'
import type { Practitioner, Consultation, PaginatedResponse } from '@/app/types'

const extractConsultations = (response: Consultation[] | PaginatedResponse<Consultation> | undefined): Consultation[] => {
  if (!response) return []
  if (Array.isArray(response)) return response
  if ('results' in response) return response.results
  return []
}

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
        console.error('Error fetching practitioner:', err)
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
      console.error('Error fetching consultations:', err)
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
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-200 border-t-primary-600"></div>
          <p className="text-sm text-neutral-500">Loading practitioner...</p>
        </div>
      </div>
    )
  }

  if (error || !practitioner) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-4xl">⚠️</span>
          </div>
          <h2 className="text-xl font-bold text-neutral-900 mb-2">
            {error ? 'Error Loading Data' : 'Practitioner Not Found'}
          </h2>
          <p className="text-sm text-neutral-500 mb-6">
            {error || "The practitioner you're looking for doesn't exist."}
          </p>
          <Link href="/client/dashboard/practitioners">
            <Button variant="outline" className="border-neutral-200 text-neutral-700 hover:bg-neutral-50">
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
      className="min-h-screen bg-background"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        {/* Header with Back Button and Tabs */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <Link href="/client/dashboard/practitioners">
            <Button variant="outline" size="sm" className="inline-flex items-center px-4 py-2 border-neutral-200 text-neutral-700 hover:bg-neutral-50">
              <ArrowLeftIcon className="h-4 w-4 mr-2" />
              <span>Back to Practitioners</span>
            </Button>
          </Link>

          {/* Tabs */}
          {(!isCurrentUserPractitioner || extendedUser?.is_staff) && (
            <div className="flex bg-neutral-100 p-1 rounded-xl">
              <button
                onClick={() => handleTabChange('profile')}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                  activeTab === 'profile'
                    ? 'bg-white text-primary-600 shadow-sm'
                    : 'text-neutral-600 hover:text-neutral-900'
                }`}
              >
                Profile
              </button>
              <button
                onClick={() => handleTabChange('consultations')}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                  activeTab === 'consultations'
                    ? 'bg-white text-primary-600 shadow-sm'
                    : 'text-neutral-600 hover:text-neutral-900'
                }`}
              >
                Consultations
              </button>
            </div>
          )}
        </div>

        {/* Profile Tab */}
        <AnimatePresence mode="wait">
          {activeTab === 'profile' && (
            <motion.div
              key="profile"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid grid-cols-1 lg:grid-cols-3 gap-6"
            >
              {/* Main Profile Content */}
              <div className="lg:col-span-2">
                <PractitionerProfile practitioner={practitioner} />
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Quick Info Card */}
                <Card className="bg-white border-neutral-200">
                  <CardBody className="p-6">
                    <h3 className="text-lg font-semibold text-neutral-900 mb-4">
                      Practice Information
                    </h3>
                    <div className="space-y-4">
                      <InfoItem
                        icon={MapPinIcon}
                        label="Location"
                        value={practitioner.city || 'Not specified'}
                      />
                      <InfoItem
                        icon={CurrencyDollarIcon}
                        label="Hourly Rate"
                        value={practitioner.hourly_rate ? `KES ${practitioner.hourly_rate}` : 'Not specified'}
                      />
                      <InfoItem
                        icon={BriefcaseIcon}
                        label="Experience"
                        value={`${practitioner.years_of_experience} years`}
                      />
                      <InfoItem
                        icon={StarIcon}
                        label="Rating"
                        value={`${practitioner.average_rating?.toFixed(1) || 'New'} (${practitioner.total_reviews || 0} reviews)`}
                      />
                    </div>
                  </CardBody>
                </Card>

                {/* Action Cards */}
                <Card className="bg-white border-neutral-200">
                  <CardBody className="p-6">
                    <h3 className="text-lg font-semibold text-neutral-900 mb-2">
                      Book a Consultation
                    </h3>
                    <p className="text-sm text-neutral-500 mb-4">
                      Schedule a session with {practitioner.first_name}.
                    </p>
                    <Link href={`/client/dashboard/consultations/book?practitioner=${practitioner.id}`}>
                      <Button className="w-full bg-primary-600 hover:bg-primary-700 text-white shadow-sm">
                        <CalendarIcon className="h-4 w-4 mr-2" />
                        Book Now
                      </Button>
                    </Link>
                  </CardBody>
                </Card>

                <Card className="bg-white border-neutral-200">
                  <CardBody className="p-6">
                    <h3 className="text-lg font-semibold text-neutral-900 mb-2">
                      Get in Touch
                    </h3>
                    <p className="text-sm text-neutral-500 mb-4">
                      Send a message or ask a question.
                    </p>
                    <Button 
                      variant="outline" 
                      fullWidth 
                      className="border-neutral-200 text-neutral-700 hover:bg-neutral-50"
                    >
                      <ChatBubbleLeftIcon className="h-4 w-4 mr-2" />
                      Send Message
                    </Button>
                  </CardBody>
                </Card>
              </div>
            </motion.div>
          )}

          {/* Consultations Tab */}
          {activeTab === 'consultations' && (
            <motion.div
              key="consultations"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-neutral-900">
                  Consultations with Dr. {practitioner.first_name}
                </h2>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setActiveTab('profile')}
                  className="border-neutral-200 text-neutral-700 hover:bg-neutral-50"
                >
                  Back to Profile
                </Button>
              </div>
              
              {consultationsLoading ? (
                <div className="flex justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-4 border-primary-200 border-t-primary-600"></div>
                </div>
              ) : consultations.length === 0 ? (
                <Card className="bg-white border-neutral-200">
                  <CardBody className="py-12 text-center">
                    <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <CalendarIcon className="h-8 w-8 text-neutral-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-neutral-900 mb-2">No consultations found</h3>
                    <p className="text-sm text-neutral-500">
                      There are no consultations with this practitioner yet.
                    </p>
                  </CardBody>
                </Card>
              ) : (
                <div className="grid gap-4">
                  {consultations.map((consultation) => (
                    <ConsultationCard key={consultation.id} consultation={consultation} />
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}

// Helper Components
function InfoItem({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3">
      <Icon className="h-5 w-5 text-neutral-400 mt-0.5 flex-shrink-0" />
      <div>
        <p className="text-xs text-neutral-500">{label}</p>
        <p className="text-sm font-medium text-neutral-900">{value}</p>
      </div>
    </div>
  )
}

function ConsultationCard({ consultation }: { consultation: Consultation }) {
  return (
    <Card className="bg-white border-neutral-200 hover:border-primary-200 transition-all">
      <CardBody className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-primary-50 rounded-lg">
              <CalendarIcon className="h-5 w-5 text-primary-600" />
            </div>
            <div>
              <h4 className="font-medium text-neutral-900">
                {new Date(consultation.date).toLocaleDateString('en-US', {
                  weekday: 'long',
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric'
                })}
              </h4>
              <div className="flex items-center gap-3 mt-1">
                <span className="flex items-center text-sm text-neutral-500">
                  <ClockIcon className="h-4 w-4 mr-1" />
                  {consultation.time.slice(0,5)}
                </span>
                <span className="text-sm text-neutral-500">
                  • {consultation.duration_minutes} min
                </span>
              </div>
              {consultation.client_notes && (
                <p className="text-sm text-neutral-600 mt-2 p-2 bg-neutral-50 rounded-lg">
                  <span className="font-medium">Note:</span> {consultation.client_notes}
                </p>
              )}
            </div>
          </div>
          <StatusBadge status={consultation.status} />
        </div>
      </CardBody>
    </Card>
  )
}

function StatusBadge({ status }: { status: string }) {
  const styles = {
    booked: 'bg-blue-50 text-blue-700',
    completed: 'bg-green-50 text-green-700',
    cancelled: 'bg-red-50 text-red-700',
    'no_show': 'bg-amber-50 text-amber-700'
  }

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-medium ${styles[status as keyof typeof styles] || 'bg-neutral-100 text-neutral-700'}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  )
}