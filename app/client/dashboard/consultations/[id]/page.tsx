// app/client/dashboard/consultations/[id]/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAuth } from '@/app/contexts/AuthContext'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
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
  ChevronRightIcon,
  EnvelopeIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline'
import { Card, CardBody, CardHeader } from '@/app/components/ui/Card'
import { Button } from '@/app/components/ui/Buttons'
import VideoCall from '@/app/components/consultation/VideoCall'
import { apiClient } from '@/app/lib/api'
import type { Consultation } from '@/app/types'

interface ExtendedUser {
  id: number
  email: string
  first_name?: string
  last_name?: string
  role?: string
}

export default function ClientConsultationDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { user, isAuthenticated } = useAuth()
  const extendedUser = user as ExtendedUser | null
  const [consultation, setConsultation] = useState<Consultation | null>(null)
  const [loading, setLoading] = useState(true)
  const [showCancelModal, setShowCancelModal] = useState(false)
  const [cancelReason, setCancelReason] = useState('')
  const [isCancelling, setIsCancelling] = useState(false)
  const [showVideoCall, setShowVideoCall] = useState(false)

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
      const data = await apiClient.consultations.getOne(parseInt(id))
      setConsultation(data)
    } catch (error) {
      console.error('Error fetching consultation:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = async () => {
    setIsCancelling(true)
    try {
      // Use updateStatus instead of update
      await apiClient.consultations.updateStatus(parseInt(id), 'cancelled')
      // Refetch to get updated data
      await fetchConsultation()
      setShowCancelModal(false)
    } catch (error) {
      console.error('Error cancelling consultation:', error)
    } finally {
      setIsCancelling(false)
    }
  }

  const handleReschedule = () => {
    router.push(`/client/dashboard/consultations/reschedule/${id}`)
  }

  const handleJoinCall = () => {
    setShowVideoCall(true)
  }

  const handleLeaveCall = () => {
    setShowVideoCall(false)
    // Refresh consultation data in case anything changed during the call
    fetchConsultation()
  }

  const handleWriteReview = () => {
    router.push(`/client/dashboard/reviews/create?consultation=${id}`)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-200 border-t-primary-600"></div>
      </div>
    )
  }

  if (!consultation) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="border-neutral-200 max-w-md w-full">
          <CardBody className="p-8 text-center">
            <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <UserIcon className="h-8 w-8 text-neutral-400" />
            </div>
            <h2 className="text-xl font-bold text-neutral-900 mb-2">Consultation not found</h2>
            <Link href="/client/dashboard/consultations" className="inline-block">
              <Button variant="outline" className="border-neutral-200 mt-2">
                Back to Consultations
              </Button>
            </Link>
          </CardBody>
        </Card>
      </div>
    )
  }

  const isUpcoming = consultation.status === 'booked'
  const isCompleted = consultation.status === 'completed'
  const isCancelled = consultation.status === 'cancelled'

  const getStatusStyles = () => {
    if (isUpcoming) return {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      text: 'text-blue-800',
      icon: 'text-blue-600',
      light: 'text-blue-600'
    }
    if (isCompleted) return {
      bg: 'bg-green-50',
      border: 'border-green-200',
      text: 'text-green-800',
      icon: 'text-green-600',
      light: 'text-green-600'
    }
    return {
      bg: 'bg-red-50',
      border: 'border-red-200',
      text: 'text-red-800',
      icon: 'text-red-600',
      light: 'text-red-600'
    }
  }

  const statusStyles = getStatusStyles()

  // If video call is active, show full-screen video
  if (showVideoCall) {
    return (
      <div className="fixed inset-0 z-50 bg-white">
        <VideoCall
          roomId={`consultation-${id}`}
          userId={`client-${user?.id}`}
          userName={`${user?.first_name || ''} ${user?.last_name || ''}`.trim() || 'Client'}
          userRole="client"
          onLeave={handleLeaveCall}
        />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header with Back Button */}
      <div className="flex items-center gap-4">
        <Link href="/client/dashboard/consultations">
          <Button variant="outline" size="sm" className="!p-2 border-neutral-200">
            <ArrowLeftIcon className="h-5 w-5 text-neutral-600" />
          </Button>
        </Link>
        <h1 className="text-xl font-semibold text-neutral-900">Consultation Details</h1>
      </div>

      {/* Status Banner */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`rounded-xl p-4 ${statusStyles.bg} border ${statusStyles.border}`}
      >
        <div className="flex items-center gap-3">
          {isUpcoming && <ClockIcon className={`h-5 w-5 ${statusStyles.icon}`} />}
          {isCompleted && <CheckCircleIcon className={`h-5 w-5 ${statusStyles.icon}`} />}
          {isCancelled && <XCircleIcon className={`h-5 w-5 ${statusStyles.icon}`} />}
          <div>
            <p className={`font-medium ${statusStyles.text}`}>
              {isUpcoming && 'Upcoming Consultation'}
              {isCompleted && 'Consultation Completed'}
              {isCancelled && 'Consultation Cancelled'}
            </p>
            <p className={`text-sm ${statusStyles.light}`}>
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
          <Card className="border-neutral-200">
            <CardHeader>
              <h2 className="text-lg font-semibold text-neutral-900">Consultation Details</h2>
            </CardHeader>
            <CardBody className="p-6">
              <div className="space-y-6">
                {/* Practitioner Info */}
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-sm">
                    {consultation.practitioner_name?.[0] || 'P'}
                  </div>
                  <div>
                    <p className="font-semibold text-neutral-900">
                      Dr. {consultation.practitioner_name || 'Unknown'}
                    </p>
                    <p className="text-sm text-neutral-500">Practitioner</p>
                  </div>
                </div>

                {/* Date and Time */}
                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-neutral-200">
                  <div className="bg-neutral-50 p-3 rounded-xl">
                    <p className="text-xs text-neutral-500 mb-1">Date</p>
                    <p className="text-sm font-medium text-neutral-900">
                      {new Date(consultation.date).toLocaleDateString('en-US', {
                        weekday: 'long',
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </p>
                  </div>
                  <div className="bg-neutral-50 p-3 rounded-xl">
                    <p className="text-xs text-neutral-500 mb-1">Time</p>
                    <p className="text-sm font-medium text-neutral-900">
                      {consultation.time?.slice(0,5)} • {consultation.duration_minutes} min
                    </p>
                  </div>
                </div>

                {/* Notes */}
                <div className="pt-4 border-t border-neutral-200">
                  <p className="text-xs text-neutral-500 mb-2">Your Notes</p>
                  <div className="bg-neutral-50 p-4 rounded-xl">
                    <p className="text-sm text-neutral-700">
                      {consultation.client_notes || 'No notes provided'}
                    </p>
                  </div>
                </div>

                {/* Price if available */}
                {consultation.price && (
                  <div className="pt-4 border-t border-neutral-200">
                    <p className="text-xs text-neutral-500 mb-2">Price</p>
                    <p className="text-lg font-semibold text-primary-600">
                      KES {consultation.price.toLocaleString()}
                    </p>
                  </div>
                )}
              </div>
            </CardBody>
          </Card>

          {/* Messages Preview */}
          <Card className="border-neutral-200">
            <CardHeader>
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold text-neutral-900">Messages</h2>
                <Link 
                  href={`/client/dashboard/messages?consultation=${id}`} 
                  className="text-sm text-primary-600 hover:text-primary-700 flex items-center gap-1"
                >
                  View all
                  <ChevronRightIcon className="h-4 w-4" />
                </Link>
              </div>
            </CardHeader>
            <CardBody className="p-6">
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-neutral-200 rounded-full flex items-center justify-center text-xs font-bold text-neutral-700 flex-shrink-0">
                    {consultation.practitioner_name?.[0] || 'P'}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-neutral-900">
                      Dr. {consultation.practitioner_name}
                    </p>
                    <p className="text-xs text-neutral-500 mt-1">
                      Looking forward to our session!
                    </p>
                    <p className="text-xs text-neutral-400 mt-1">2 hours ago</p>
                  </div>
                </div>
                <Link href={`/client/dashboard/messages/new?recipient=${consultation.practitioner}&consultation=${id}`}>
                  <Button variant="outline" fullWidth className="border-neutral-200 text-neutral-700 hover:bg-neutral-50">
                    <ChatBubbleLeftIcon className="h-4 w-4 mr-2" />
                    Send a Message
                  </Button>
                </Link>
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Right Column - Actions */}
        <div className="space-y-4">
          {/* Action Buttons */}
          {isUpcoming && (
            <Card className="border-neutral-200">
              <CardHeader>
                <h2 className="text-lg font-semibold text-neutral-900">Join Session</h2>
              </CardHeader>
              <CardBody className="p-6 space-y-3">
                <Button
                  fullWidth
                  className="bg-primary-600 hover:bg-primary-700 text-white shadow-sm"
                  onClick={handleJoinCall}
                >
                  <VideoCameraIcon className="h-4 w-4 mr-2" />
                  Join Video Call
                </Button>
                <Button
                  fullWidth
                  variant="outline"
                  onClick={handleJoinCall}
                  className="border-neutral-200 hover:bg-neutral-50"
                >
                  <PhoneIcon className="h-4 w-4 mr-2" />
                  Join Audio Call
                </Button>
              </CardBody>
            </Card>
          )}

          {/* Management Actions */}
          <Card className="border-neutral-200">
            <CardHeader>
              <h2 className="text-lg font-semibold text-neutral-900">Manage</h2>
            </CardHeader>
            <CardBody className="p-6 space-y-3">
              {isUpcoming && (
                <>
                  <Button
                    fullWidth
                    variant="outline"
                    onClick={handleReschedule}
                    className="border-neutral-200 hover:bg-neutral-50"
                  >
                    <CalendarIcon className="h-4 w-4 mr-2" />
                    Reschedule
                  </Button>
                  <Button
                    fullWidth
                    variant="danger"
                    onClick={() => setShowCancelModal(true)}
                    className="bg-red-50 text-red-700 hover:bg-red-100 border-red-200"
                  >
                    <XCircleIcon className="h-4 w-4 mr-2" />
                    Cancel Consultation
                  </Button>
                </>
              )}
              {isCompleted && !consultation.has_review && (
                <Button
                  fullWidth
                  variant="outline"
                  onClick={handleWriteReview}
                  className="border-neutral-200 hover:bg-neutral-50"
                >
                  <DocumentTextIcon className="h-4 w-4 mr-2" />
                  Leave a Review
                </Button>
              )}
              {isCompleted && (
                <Link href={`/client/dashboard/consultations/book?practitioner=${consultation.practitioner}`}>
                  <Button
                    fullWidth
                    className="bg-primary-600 hover:bg-primary-700 text-white mt-2"
                  >
                    <CalendarIcon className="h-4 w-4 mr-2" />
                    Book Again
                  </Button>
                </Link>
              )}
            </CardBody>
          </Card>

          {/* Meeting Info */}
          {isUpcoming && (
            <Card className="border-neutral-200 bg-primary-50">
              <CardBody className="p-6">
                <h2 className="text-lg font-semibold text-primary-900 mb-4">Meeting Information</h2>
                <div className="space-y-3 text-sm">
                  <p className="flex items-center gap-3 text-primary-700">
                    <VideoCameraIcon className="h-5 w-5 text-primary-500" />
                    <span>Click "Join Video Call" to start</span>
                  </p>
                  <p className="flex items-center gap-3 text-primary-700">
                    <ShieldCheckIcon className="h-5 w-5 text-primary-500" />
                    <span>End-to-end encrypted</span>
                  </p>
                  <p className="flex items-center gap-3 text-primary-700">
                    <ClockIcon className="h-5 w-5 text-primary-500" />
                    <span>Duration: {consultation.duration_minutes} minutes</span>
                  </p>
                </div>
              </CardBody>
            </Card>
          )}
        </div>
      </div>

      {/* Cancel Modal */}
      <AnimatePresence>
        {showCancelModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
            onClick={() => setShowCancelModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl"
              onClick={e => e.stopPropagation()}
            >
              <h2 className="text-xl font-bold text-neutral-900 mb-4">Cancel Consultation</h2>
              <p className="text-sm text-neutral-500 mb-4">
                Are you sure you want to cancel this consultation? This action cannot be undone.
              </p>
              <textarea
                placeholder="Reason for cancellation (optional)"
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                className="w-full p-3 border border-neutral-200 rounded-xl mb-4 text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                rows={3}
              />
              <div className="flex gap-3">
                <Button
                  variant="danger"
                  fullWidth
                  onClick={handleCancel}
                  disabled={isCancelling}
                  className="bg-red-600 hover:bg-red-700 text-white"
                >
                  {isCancelling ? 'Cancelling...' : 'Yes, Cancel'}
                </Button>
                <Button
                  variant="outline"
                  fullWidth
                  onClick={() => setShowCancelModal(false)}
                  className="border-neutral-200"
                >
                  No, Keep it
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}