'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAuth } from '@/app/contexts/AuthContext'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { 
  ArrowLeftIcon,
  CalendarIcon,
  ClockIcon,
  UserIcon,
  VideoCameraIcon,
  PhoneIcon,
  ChatBubbleLeftIcon,
  DocumentTextIcon,
  CheckCircleIcon,
  XCircleIcon,
  PencilIcon
} from '@heroicons/react/24/outline'
import { Card, CardBody, CardHeader } from '@/app/components/ui/Card'
import { Button } from '@/app/components/ui/Buttons'
import { apiClient } from '@/app/lib/api'
import type { Consultation } from '@/app/types'

interface ExtendedUser {
  id: number
  email: string
  first_name?: string
  last_name?: string
  role?: string
}

export default function ConsultationDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { user, isAuthenticated } = useAuth()
  const extendedUser = user as ExtendedUser | null
  const [consultation, setConsultation] = useState<Consultation | null>(null)
  const [loading, setLoading] = useState(true)
  const [showCancelModal, setShowCancelModal] = useState(false)
  const [cancelReason, setCancelReason] = useState('')
  const [isCancelling, setIsCancelling] = useState(false)

  const id = params.id as string

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login')
      return
    }
    fetchConsultation()
  }, [isAuthenticated, id, router])

  const fetchConsultation = async () => {
    try {
      setLoading(true)
      // Mock data - replace with API call
      const mockData: Consultation = {
        id: parseInt(id),
        client: 101,
        client_name: 'Mary Wanjiku',
        practitioner: 201,
        practitioner_name: 'Dr. James Omondi',
        date: '2024-02-22',
        time: '10:00:00',
        status: 'booked',
        duration_minutes: 60,
        client_notes: 'First consultation about nutrition plan. Need help with meal planning for diabetes management.',
        practitioner_notes: '',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
      setConsultation(mockData)
    } catch (error) {
      console.error('Error fetching consultation:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = async () => {
    setIsCancelling(true)
    try {
      // API call to cancel consultation
      await new Promise(resolve => setTimeout(resolve, 1000))
      setConsultation(prev => prev ? { ...prev, status: 'cancelled' } : null)
      setShowCancelModal(false)
    } catch (error) {
      console.error('Error cancelling consultation:', error)
    } finally {
      setIsCancelling(false)
    }
  }

  const handleReschedule = () => {
    router.push(`/dashboard/consultations/reschedule/${id}`)
  }

  const handleJoinCall = () => {
    // Implement video/audio call logic
    window.open(`/call/${id}`, '_blank')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-emerald-200 border-t-emerald-600"></div>
      </div>
    )
  }

  if (!consultation) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-bold">Consultation not found</h2>
        <Link href="/dashboard/consultations" className="mt-4 inline-block">
          <Button variant="outline">Back to Consultations</Button>
        </Link>
      </div>
    )
  }

  const isPractitioner = extendedUser?.role === 'practitioner'
  const isUpcoming = consultation.status === 'booked'
  const isCompleted = consultation.status === 'completed'
  const isCancelled = consultation.status === 'cancelled'

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Link href="/dashboard/consultations">
        <Button variant="outline" size="sm">
          <ArrowLeftIcon className="h-4 w-4 mr-2" />
          Back to Consultations
        </Button>
      </Link>

      {/* Status Banner */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`rounded-xl p-4 ${
          isUpcoming ? 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800' :
          isCompleted ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800' :
          'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
        }`}
      >
        <div className="flex items-center gap-3">
          {isUpcoming && <ClockIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" />}
          {isCompleted && <CheckCircleIcon className="h-5 w-5 text-green-600 dark:text-green-400" />}
          {isCancelled && <XCircleIcon className="h-5 w-5 text-red-600 dark:text-red-400" />}
          <div>
            <p className={`font-medium ${
              isUpcoming ? 'text-blue-800 dark:text-blue-300' :
              isCompleted ? 'text-green-800 dark:text-green-300' :
              'text-red-800 dark:text-red-300'
            }`}>
              {isUpcoming && 'Upcoming Consultation'}
              {isCompleted && 'Consultation Completed'}
              {isCancelled && 'Consultation Cancelled'}
            </p>
            <p className={`text-sm ${
              isUpcoming ? 'text-blue-600 dark:text-blue-400' :
              isCompleted ? 'text-green-600 dark:text-green-400' :
              'text-red-600 dark:text-red-400'
            }`}>
              {isUpcoming && 'Please be ready 5 minutes before the scheduled time'}
              {isCompleted && 'Thank you for your consultation'}
              {isCancelled && 'This consultation has been cancelled'}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Consultation Details */}
          <Card>
            <CardBody className="p-6">
              <h2 className="text-lg font-semibold mb-4">Consultation Details</h2>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                    {isPractitioner ? consultation.client_name?.[0] : consultation.practitioner_name?.[0]}
                  </div>
                  <div>
                    <p className="font-semibold">
                      {isPractitioner ? consultation.client_name : consultation.practitioner_name}
                    </p>
                    <p className="text-sm text-gray-500">
                      {isPractitioner ? 'Client' : 'Practitioner'}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div>
                    <p className="text-xs text-gray-500">Date</p>
                    <p className="text-sm font-medium">
                      {new Date(consultation.date).toLocaleDateString('en-US', {
                        weekday: 'long',
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Time</p>
                    <p className="text-sm font-medium">
                      {consultation.time.slice(0,5)} ({consultation.duration_minutes} min)
                    </p>
                  </div>
                </div>

                {/* Notes */}
                <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                  <p className="text-xs text-gray-500 mb-2">Notes</p>
                  <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                    <p className="text-sm">
                      {consultation.client_notes || 'No notes provided'}
                    </p>
                  </div>
                </div>

                {isPractitioner && isUpcoming && (
                  <div className="pt-4">
                    <Button
                      variant="outline"
                      fullWidth
                      onClick={() => router.push(`/dashboard/consultations/${id}/notes`)}
                    >
                      <PencilIcon className="h-4 w-4 mr-2" />
                      Add Consultation Notes
                    </Button>
                  </div>
                )}
              </div>
            </CardBody>
          </Card>

          {/* Messages Preview */}
          <Card>
            <CardBody className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">Messages</h2>
                <Link href={`/dashboard/messages?consultation=${id}`} className="text-sm text-emerald-600 hover:underline">
                  View all
                </Link>
              </div>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center text-xs font-bold">
                    {isPractitioner ? 'MW' : 'JO'}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">
                      {isPractitioner ? 'Mary Wanjiku' : 'Dr. James Omondi'}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Looking forward to our session!
                    </p>
                    <p className="text-xs text-gray-400 mt-1">2 hours ago</p>
                  </div>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Right Column - Actions */}
        <div className="space-y-4">
          {/* Action Buttons */}
          {isUpcoming && (
            <Card>
              <CardBody className="p-6">
                <h2 className="text-lg font-semibold mb-4">Join Session</h2>
                <div className="space-y-3">
                  <Button
                    fullWidth
                    className="bg-emerald-600 hover:bg-emerald-700 text-white"
                    onClick={handleJoinCall}
                  >
                    <VideoCameraIcon className="h-4 w-4 mr-2" />
                    Join Video Call
                  </Button>
                  <Button
                    fullWidth
                    variant="outline"
                    onClick={handleJoinCall}
                  >
                    <PhoneIcon className="h-4 w-4 mr-2" />
                    Join Audio Call
                  </Button>
                  <Button
                    fullWidth
                    variant="outline"
                    onClick={() => router.push(`/dashboard/messages/new?consultation=${id}`)}
                  >
                    <ChatBubbleLeftIcon className="h-4 w-4 mr-2" />
                    Send Message
                  </Button>
                </div>
              </CardBody>
            </Card>
          )}

          {/* Management Actions */}
          <Card>
            <CardBody className="p-6">
              <h2 className="text-lg font-semibold mb-4">Manage</h2>
              <div className="space-y-3">
                {isUpcoming && (
                  <>
                    <Button
                      fullWidth
                      variant="outline"
                      onClick={handleReschedule}
                    >
                      <CalendarIcon className="h-4 w-4 mr-2" />
                      Reschedule
                    </Button>
                    <Button
                      fullWidth
                      variant="danger"
                      onClick={() => setShowCancelModal(true)}
                    >
                      <XCircleIcon className="h-4 w-4 mr-2" />
                      Cancel Consultation
                    </Button>
                  </>
                )}
                {isCompleted && (
                  <Button
                    fullWidth
                    variant="outline"
                    onClick={() => router.push(`/dashboard/reviews/new?consultation=${id}`)}
                  >
                    <DocumentTextIcon className="h-4 w-4 mr-2" />
                    Leave a Review
                  </Button>
                )}
              </div>
            </CardBody>
          </Card>

          {/* Meeting Info */}
          {isUpcoming && (
            <Card>
              <CardBody className="p-6">
                <h2 className="text-lg font-semibold mb-4">Meeting Information</h2>
                <div className="space-y-2 text-sm">
                  <p className="flex items-center gap-2">
                    <VideoCameraIcon className="h-4 w-4 text-gray-400" />
                    <span>Meeting link will appear 5 minutes before start</span>
                  </p>
                  <p className="flex items-center gap-2">
                    <ClockIcon className="h-4 w-4 text-gray-400" />
                    <span>Duration: {consultation.duration_minutes} minutes</span>
                  </p>
                </div>
              </CardBody>
            </Card>
          )}
        </div>
      </div>

      {/* Cancel Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full p-6"
          >
            <h2 className="text-xl font-bold mb-4">Cancel Consultation</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Are you sure you want to cancel this consultation? This action cannot be undone.
            </p>
            <textarea
              placeholder="Reason for cancellation (optional)"
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              className="w-full p-3 border border-gray-200 dark:border-gray-700 rounded-lg mb-4 text-sm"
              rows={3}
            />
            <div className="flex gap-3">
              <Button
                variant="danger"
                fullWidth
                onClick={handleCancel}
                disabled={isCancelling}
              >
                {isCancelling ? 'Cancelling...' : 'Yes, Cancel'}
              </Button>
              <Button
                variant="outline"
                fullWidth
                onClick={() => setShowCancelModal(false)}
              >
                No, Keep it
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}