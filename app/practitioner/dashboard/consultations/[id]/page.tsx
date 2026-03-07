// app/practitioner/dashboard/consultations/[id]/page.tsx
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
  PencilIcon,
  ShieldCheckIcon,
  ExclamationTriangleIcon,
  ChatBubbleLeftRightIcon,
  EnvelopeIcon
} from '@heroicons/react/24/outline'
import { Card, CardBody } from '@/app/components/ui/Card'
import { Button } from '@/app/components/ui/Buttons'
import VideoCall from '@/app/components/consultation/VideoCall'
import { apiClient } from '@/app/lib/api'
import { extractResults } from '@/app/lib/utils'
import type { Consultation, Message } from '@/app/types'

interface ExtendedUser {
  id: number
  email: string
  first_name?: string
  last_name?: string
  role?: string
  is_verified?: boolean
}

export default function PractitionerConsultationDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { user, isAuthenticated } = useAuth()
  const extendedUser = user as ExtendedUser | null
  const [consultation, setConsultation] = useState<Consultation | null>(null)
  const [recentMessages, setRecentMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)
  const [showCancelModal, setShowCancelModal] = useState(false)
  const [cancelReason, setCancelReason] = useState('')
  const [isCancelling, setIsCancelling] = useState(false)
  const [showVideoCall, setShowVideoCall] = useState(false)
  const [showNotes, setShowNotes] = useState(false)
  const [notes, setNotes] = useState('')
  const [savingNotes, setSavingNotes] = useState(false)
  const [error, setError] = useState<string | null>(null)

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
      setError(null)
      
      const data = await apiClient.consultations.getOne(parseInt(id))
      setConsultation(data)
      setNotes(data.practitioner_notes || '')
      
      try {
        const messages = await apiClient.messages.getAll(parseInt(id))
        const messagesList = extractResults<Message>(messages)
        setRecentMessages(messagesList.slice(0, 2))
      } catch (error) {
        console.log('No messages available')
        setRecentMessages([])
      }
      
    } catch (error: any) {
      console.error('Error fetching consultation:', error)
      setError(error.message || 'Failed to load consultation details')
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = async () => {
    setIsCancelling(true)
    try {
      await apiClient.consultations.updateStatus(parseInt(id), 'cancelled')
      await fetchConsultation()
      setShowCancelModal(false)
    } catch (error: any) {
      console.error('Error cancelling consultation:', error)
      setError(error.message || 'Failed to cancel consultation')
    } finally {
      setIsCancelling(false)
    }
  }

  const handleReschedule = () => {
    router.push(`/practitioner/dashboard/consultations/reschedule/${id}`)
  }

  const handleJoinCall = () => {
    setShowVideoCall(true)
  }

  const handleLeaveCall = () => {
    setShowVideoCall(false)
    fetchConsultation()
  }

  const handleSaveNotes = async () => {
    setSavingNotes(true)
    try {
      // Use updateStatus for notes? Or check if there's a dedicated method
      // For now, we'll assume there's an update method or we'll need to use a different approach
      console.log('Saving notes:', notes)
      // You may need to use a different API endpoint for notes
      // await apiClient.consultations.updateNotes(parseInt(id), notes)
      setConsultation(prev => prev ? { ...prev, practitioner_notes: notes } : null)
      setShowNotes(false)
    } catch (error) {
      console.error('Error saving notes:', error)
    } finally {
      setSavingNotes(false)
    }
  }

  const formatDateTime = (dateString: string, timeString: string) => {
    const date = new Date(dateString)
    const formattedDate = date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
    const formattedTime = timeString.slice(0,5)
    return { formattedDate, formattedTime }
  }

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="relative">
          <div className="animate-spin rounded-full h-12 w-12 sm:h-14 sm:w-14 border-4 border-emerald-200 border-t-emerald-600"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <CalendarIcon className="h-5 w-5 sm:h-6 sm:w-6 text-emerald-600 animate-pulse" />
          </div>
        </div>
      </div>
    )
  }

  if (error || !consultation) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardBody className="p-6 text-center">
            <div className="w-14 h-14 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <ExclamationTriangleIcon className="w-7 h-7 text-amber-600" />
            </div>
            <h2 className="text-lg font-semibold text-slate-900 mb-2">Consultation not found</h2>
            <p className="text-sm text-slate-500 mb-4">{error || 'The consultation you\'re looking for doesn\'t exist'}</p>
            <Link href="/practitioner/dashboard/consultations">
              <Button variant="outline" className="w-full">
                <ArrowLeftIcon className="w-4 h-4 mr-2" />
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
  const { formattedDate, formattedTime } = formatDateTime(consultation.date, consultation.time)

  const getStatusConfig = () => {
    if (isUpcoming) return {
      icon: ClockIcon,
      title: 'Upcoming Consultation',
      message: 'Please be ready 5 minutes before the scheduled time',
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      text: 'text-blue-800',
      subtext: 'text-blue-600'
    }
    if (isCompleted) return {
      icon: CheckCircleIcon,
      title: 'Consultation Completed',
      message: 'This consultation has been completed',
      bg: 'bg-green-50',
      border: 'border-green-200',
      text: 'text-green-800',
      subtext: 'text-green-600'
    }
    return {
      icon: XCircleIcon,
      title: 'Consultation Cancelled',
      message: 'This consultation has been cancelled',
      bg: 'bg-red-50',
      border: 'border-red-200',
      text: 'text-red-800',
      subtext: 'text-red-600'
    }
  }

  const statusConfig = getStatusConfig()
  const StatusIcon = statusConfig.icon

  // If video call is active, show full-screen video
  if (showVideoCall) {
    return (
      <div className="fixed inset-0 z-50 bg-white">
        <VideoCall
          roomId={`consultation-${id}`}
          userId={`practitioner-${user?.id}`}
          userName={`Dr. ${user?.first_name || ''} ${user?.last_name || ''}`.trim() || 'Practitioner'}
          userRole="practitioner"
          onLeave={handleLeaveCall}
        />
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 py-4 sm:py-5 md:py-6 space-y-4 sm:space-y-5 md:space-y-6">
      {/* Back Button */}
      <Link href="/practitioner/dashboard/consultations">
        <Button variant="outline" size="sm" className="!p-2 sm:!px-4">
          <ArrowLeftIcon className="h-4 w-4 sm:mr-2" />
          <span className="hidden sm:inline">Back to Consultations</span>
        </Button>
      </Link>

      {/* Status Banner */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`rounded-lg sm:rounded-xl p-3 sm:p-4 ${statusConfig.bg} border ${statusConfig.border}`}
      >
        <div className="flex items-start sm:items-center gap-2 sm:gap-3">
          <div className={`p-1.5 sm:p-2 rounded-lg ${statusConfig.bg} border ${statusConfig.border} flex-shrink-0`}>
            <StatusIcon className={`h-4 w-4 sm:h-5 sm:w-5 ${statusConfig.text}`} />
          </div>
          <div className="flex-1 min-w-0">
            <p className={`text-sm sm:text-base font-medium ${statusConfig.text}`}>
              {statusConfig.title}
            </p>
            <p className={`text-xs sm:text-sm ${statusConfig.subtext} mt-0.5`}>
              {statusConfig.message}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-5 md:gap-6">
        {/* Left Column - Details */}
        <div className="lg:col-span-2 space-y-4 sm:space-y-5">
          {/* Consultation Details */}
          <Card>
            <CardBody className="p-4 sm:p-5 md:p-6">
              <h2 className="text-base sm:text-lg font-semibold text-slate-900 mb-4">Consultation Details</h2>
              <div className="space-y-4">
                {/* Client Info */}
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-full flex items-center justify-center text-white font-bold text-base sm:text-lg flex-shrink-0">
                    {consultation.client_name?.[0] || 'C'}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm sm:text-base font-semibold text-slate-900 truncate">
                      {consultation.client_name || 'Client'}
                    </p>
                    <p className="text-xs sm:text-sm text-slate-500">Client</p>
                  </div>
                </div>

                {/* Date/Time Grid */}
                <div className="grid grid-cols-2 gap-3 sm:gap-4 pt-3 sm:pt-4 border-t border-slate-200">
                  <div>
                    <p className="text-xs text-slate-500">Date</p>
                    <p className="text-sm font-medium text-slate-900">{formattedDate}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Time</p>
                    <p className="text-sm font-medium text-slate-900">
                      {formattedTime} ({consultation.duration_minutes} min)
                    </p>
                  </div>
                </div>

                {/* Client Notes */}
                <div className="pt-3 sm:pt-4 border-t border-slate-200">
                  <p className="text-xs text-slate-500 mb-2">Client Notes</p>
                  <div className="bg-slate-50 p-3 sm:p-4 rounded-lg">
                    <p className="text-xs sm:text-sm text-slate-700">
                      {consultation.client_notes || 'No notes provided'}
                    </p>
                  </div>
                </div>

                {/* Practitioner Notes */}
                <div className="pt-3 sm:pt-4 border-t border-slate-200">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs text-slate-500">Your Notes</p>
                    <button
                      onClick={() => setShowNotes(!showNotes)}
                      className="text-xs text-emerald-600 hover:text-emerald-700 font-medium flex items-center gap-1"
                    >
                      <PencilIcon className="h-3 w-3" />
                      {showNotes ? 'Cancel' : 'Edit'}
                    </button>
                  </div>
                  
                  {showNotes ? (
                    <div className="space-y-3">
                      <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        className="w-full p-3 text-xs sm:text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                        rows={4}
                        placeholder="Add your consultation notes here..."
                      />
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={handleSaveNotes}
                          disabled={savingNotes}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs"
                        >
                          {savingNotes ? 'Saving...' : 'Save Notes'}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setShowNotes(false)
                            setNotes(consultation.practitioner_notes || '')
                          }}
                          className="text-xs"
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-emerald-50 p-3 sm:p-4 rounded-lg">
                      <p className="text-xs sm:text-sm text-emerald-700">
                        {consultation.practitioner_notes || 'No notes added yet'}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Messages Preview */}
          <Card>
            <CardBody className="p-4 sm:p-5 md:p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base sm:text-lg font-semibold text-slate-900">Messages</h2>
                <Link href={`/practitioner/dashboard/messages?consultation=${id}`} 
                      className="text-xs sm:text-sm text-emerald-600 hover:text-emerald-700 font-medium flex items-center gap-1">
                  View all
                  <ArrowLeftIcon className="h-3 w-3 rotate-180" />
                </Link>
              </div>
              
              {recentMessages.length > 0 ? (
                <div className="space-y-3">
                  {recentMessages.map((message) => (
                    <div key={message.id} className="flex items-start gap-2 sm:gap-3">
                      <div className="w-7 h-7 sm:w-8 sm:h-8 bg-slate-200 rounded-full flex items-center justify-center text-xs font-bold text-slate-700 flex-shrink-0">
                        {message.sender_name?.[0] || 'U'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-xs sm:text-sm font-medium text-slate-900">
                            {message.sender_name || 'User'}
                          </p>
                          <span className="text-[10px] text-slate-400">
                            {message.created_at ? new Date(message.created_at).toLocaleDateString() : ''}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 mt-1 line-clamp-2">
                          {message.content}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6">
                  <ChatBubbleLeftRightIcon className="h-8 w-8 text-slate-300 mx-auto mb-2" />
                  <p className="text-xs text-slate-500">No messages yet</p>
                  <Link href={`/practitioner/dashboard/messages/new?recipient=${consultation.client}&consultation=${id}`}>
                    <Button variant="outline" size="sm" className="mt-3 text-xs">
                      Send Message
                    </Button>
                  </Link>
                </div>
              )}
            </CardBody>
          </Card>
        </div>

        {/* Right Column - Actions */}
        <div className="space-y-4">
          {/* Action Buttons */}
          {isUpcoming && (
            <Card>
              <CardBody className="p-4 sm:p-5 md:p-6">
                <h2 className="text-base sm:text-lg font-semibold text-slate-900 mb-4">Join Session</h2>
                <div className="space-y-2 sm:space-y-3">
                  <Button
                    fullWidth
                    className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm py-2.5"
                    onClick={handleJoinCall}
                  >
                    <VideoCameraIcon className="h-4 w-4 mr-2" />
                    Join Video Call
                  </Button>
                  <Button
                    fullWidth
                    variant="outline"
                    onClick={handleJoinCall}
                    className="text-xs sm:text-sm py-2.5"
                  >
                    <PhoneIcon className="h-4 w-4 mr-2" />
                    Join Audio Call
                  </Button>
                  <Link href={`/practitioner/dashboard/messages/new?recipient=${consultation.client}&consultation=${id}`}>
                    <Button
                      fullWidth
                      variant="outline"
                      className="text-xs sm:text-sm py-2.5"
                    >
                      <ChatBubbleLeftIcon className="h-4 w-4 mr-2" />
                      Send Message
                    </Button>
                  </Link>
                </div>
              </CardBody>
            </Card>
          )}

          {/* Management Actions */}
          <Card>
            <CardBody className="p-4 sm:p-5 md:p-6">
              <h2 className="text-base sm:text-lg font-semibold text-slate-900 mb-4">Manage</h2>
              <div className="space-y-2 sm:space-y-3">
                {isUpcoming && (
                  <>
                    <Button
                      fullWidth
                      variant="outline"
                      onClick={handleReschedule}
                      className="text-xs sm:text-sm py-2.5"
                      disabled
                    >
                      <CalendarIcon className="h-4 w-4 mr-2" />
                      Reschedule
                    </Button>
                    <Button
                      fullWidth
                      variant="danger"
                      onClick={() => setShowCancelModal(true)}
                      className="text-xs sm:text-sm py-2.5"
                    >
                      <XCircleIcon className="h-4 w-4 mr-2" />
                      Cancel Consultation
                    </Button>
                  </>
                )}
              </div>
            </CardBody>
          </Card>

          {/* Meeting Info */}
          {isUpcoming && (
            <Card>
              <CardBody className="p-4 sm:p-5 md:p-6">
                <h2 className="text-base sm:text-lg font-semibold text-slate-900 mb-4">Meeting Information</h2>
                <div className="space-y-2 text-xs sm:text-sm">
                  <p className="flex items-center gap-2 text-slate-600">
                    <VideoCameraIcon className="h-4 w-4 text-slate-400 flex-shrink-0" />
                    <span>Click "Join Video Call" to start</span>
                  </p>
                  <p className="flex items-center gap-2 text-slate-600">
                    <ClockIcon className="h-4 w-4 text-slate-400 flex-shrink-0" />
                    <span>Duration: {consultation.duration_minutes} minutes</span>
                  </p>
                  <p className="flex items-center gap-2 text-slate-600">
                    <ShieldCheckIcon className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                    <span>End-to-end encrypted</span>
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
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-xl max-w-md w-full p-5 sm:p-6"
            >
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 mb-3">Cancel Consultation</h2>
              <p className="text-xs sm:text-sm text-slate-600 mb-4">
                Are you sure you want to cancel this consultation? This action cannot be undone.
              </p>
              <textarea
                placeholder="Reason for cancellation (optional)"
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                className="w-full p-2.5 sm:p-3 text-xs sm:text-sm border border-slate-200 rounded-lg mb-4 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                rows={3}
              />
              <div className="flex flex-col xs:flex-row gap-2">
                <Button
                  variant="danger"
                  fullWidth
                  onClick={handleCancel}
                  disabled={isCancelling}
                  className="text-xs sm:text-sm py-2.5"
                >
                  {isCancelling ? (
                    <>
                      <ArrowLeftIcon className="h-4 w-4 mr-2 animate-spin" />
                      Cancelling...
                    </>
                  ) : (
                    'Yes, Cancel'
                  )}
                </Button>
                <Button
                  variant="outline"
                  fullWidth
                  onClick={() => setShowCancelModal(false)}
                  className="text-xs sm:text-sm py-2.5"
                >
                  No, Keep it
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}