// app/components/client/CreateReviewPage.tsx
'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  StarIcon,
  ArrowLeftIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  UserCircleIcon,
  CalendarIcon,
  ClockIcon,
  ChatBubbleLeftIcon,
  SparklesIcon
} from '@heroicons/react/24/outline'
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid'
import { useAuth } from '@/app/contexts/AuthContext'
import { Card, CardBody } from '@/app/components/ui/Card'
import { Button } from '@/app/components/ui/Buttons'
import { apiClient } from '@/app/lib/api'
import type { Consultation, Review } from '@/app/types'

// ============================================================================
// Rating Component
// ============================================================================
const RatingSelector = ({ 
  value, 
  onChange,
  disabled = false 
}: { 
  value: number
  onChange: (rating: number) => void
  disabled?: boolean
}) => {
  const [hover, setHover] = useState(0)
  
  return (
    <div className="flex flex-col items-center gap-3">
      <div className="flex items-center gap-2">
        {[1, 2, 3, 4, 5].map((rating) => (
          <button
            key={rating}
            type="button"
            onClick={() => !disabled && onChange(rating)}
            onMouseEnter={() => !disabled && setHover(rating)}
            onMouseLeave={() => !disabled && setHover(0)}
            disabled={disabled}
            className="focus:outline-none transition-transform hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {rating <= (hover || value) ? (
              <StarIconSolid className="w-8 h-8 sm:w-10 sm:h-10 text-yellow-400" />
            ) : (
              <StarIcon className="w-8 h-8 sm:w-10 sm:h-10 text-gray-300" />
            )}
          </button>
        ))}
      </div>
      <div className="text-sm font-medium text-gray-600">
        {value === 0 && 'Select a rating'}
        {value === 1 && 'Poor'}
        {value === 2 && 'Fair'}
        {value === 3 && 'Good'}
        {value === 4 && 'Very Good'}
        {value === 5 && 'Excellent'}
      </div>
    </div>
  )
}

// ============================================================================
// Main Component
// ============================================================================
export default function CreateReviewPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user, isAuthenticated, isLoading: authLoading } = useAuth()
  
  // =============================================
  // ALL HOOKS - TOP LEVEL, UNCONDITIONAL
  // =============================================
  // Router hooks
  const consultationId = useMemo(() => {
    const id = searchParams.get('consultation')
    return id ? parseInt(id) : null
  }, [searchParams])

  // State hooks - ALL defined unconditionally at the top
  const [consultation, setConsultation] = useState<Consultation | null>(null)
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [submitted, setSubmitted] = useState(false)
  const [createdReview, setCreatedReview] = useState<Review | null>(null)
  const [redirectPath, setRedirectPath] = useState<string | null>(null)

  // =============================================
  // EFFECT 1: Handle authentication redirect
  // =============================================
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      setRedirectPath(`/login?redirect=/client/dashboard/reviews/create?consultation=${consultationId}`)
    }
  }, [authLoading, isAuthenticated, consultationId])

  // =============================================
  // EFFECT 2: Perform the actual redirect
  // =============================================
  useEffect(() => {
    if (redirectPath) {
      router.push(redirectPath)
    }
  }, [redirectPath, router])

  // =============================================
  // EFFECT 3: Handle missing consultation ID
  // =============================================
  useEffect(() => {
    if (!authLoading && isAuthenticated && !consultationId) {
      router.push('/client/dashboard/consultations')
    }
  }, [authLoading, isAuthenticated, consultationId, router])

  // =============================================
  // EFFECT 4: Fetch consultation data
  // =============================================
  useEffect(() => {
    const fetchConsultation = async () => {
      // Only fetch if we have all required data
      if (!consultationId || !isAuthenticated || !user || redirectPath) {
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        setError(null)
        const data = await apiClient.consultations.getOne(consultationId)
        
        // Verify this consultation belongs to the current user
        if (data.client !== user.id) {
          setError('You do not have permission to review this consultation')
          return
        }
        
        // Check if consultation can be reviewed (must be completed)
        if (data.status !== 'completed') {
          setError('Only completed consultations can be reviewed')
          return
        }
        
        // Check if already reviewed
        if (data.has_review) {
          setError('This consultation has already been reviewed')
          return
        }
        
        setConsultation(data)
      } catch (error) {
        console.error('Error fetching consultation:', error)
        setError('Failed to load consultation details')
      } finally {
        setLoading(false)
      }
    }

    fetchConsultation()
  }, [consultationId, isAuthenticated, user, redirectPath])

  // =============================================
  // Memoized values
  // =============================================
  const isValid = useMemo(() => {
    return rating > 0 && rating <= 5
  }, [rating])

  // =============================================
  // Callbacks
  // =============================================
  const handleSubmit = useCallback(async () => {
    if (!isValid || !consultation) return

    setIsSubmitting(true)
    setError(null)

    try {
      const review = await apiClient.reviews.create({
        consultation: consultation.id,
        rating,
        comment: comment.trim() || undefined
      })
      
      setCreatedReview(review)
      setSubmitted(true)
    } catch (error: any) {
      console.error('Error submitting review:', error)
      setError(error.response?.data?.message || 'Failed to submit review. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }, [isValid, consultation, rating, comment])

  const handleBack = useCallback(() => {
    router.back()
  }, [router])

  const handleViewReview = useCallback(() => {
    if (createdReview) {
      router.push(`/client/dashboard/reviews/${createdReview.id}`)
    }
  }, [createdReview, router])

  const handleBackToDashboard = useCallback(() => {
    router.push('/client/dashboard')
  }, [router])

  // =============================================
  // EARLY RETURNS - AFTER ALL HOOKS
  // =============================================
  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-purple-50/30 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
            <StarIcon className="w-8 h-8 text-purple-600 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
          </div>
          <p className="mt-4 text-sm font-medium text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated || redirectPath) {
    return null // Redirecting...
  }

  if (!consultationId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-purple-50/30 py-8 px-4">
        <div className="max-w-md mx-auto">
          <Card className="border-0 shadow-2xl">
            <CardBody className="p-8 text-center">
              <ExclamationTriangleIcon className="w-12 h-12 text-amber-500 mx-auto mb-4" />
              <h2 className="text-xl font-bold text-gray-900 mb-2">No Consultation Selected</h2>
              <p className="text-gray-600 mb-6">
                Please select a consultation to review from your dashboard.
              </p>
              <Link href="/client/dashboard/consultations">
                <Button className="bg-purple-600 hover:bg-purple-700 text-white">
                  Go to Consultations
                </Button>
              </Link>
            </CardBody>
          </Card>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-purple-50/30 py-8 px-4">
        <div className="max-w-md mx-auto">
          <Card className="border-0 shadow-2xl">
            <CardBody className="p-8 text-center">
              <ExclamationTriangleIcon className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <h2 className="text-xl font-bold text-gray-900 mb-2">Unable to Review</h2>
              <p className="text-gray-600 mb-6">{error}</p>
              <Button onClick={handleBack} className="bg-purple-600 hover:bg-purple-700 text-white">
                Go Back
              </Button>
            </CardBody>
          </Card>
        </div>
      </div>
    )
  }

  if (!consultation) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-purple-50/30 py-8 px-4">
        <div className="max-w-md mx-auto">
          <Card className="border-0 shadow-2xl">
            <CardBody className="p-8 text-center">
              <ExclamationTriangleIcon className="w-12 h-12 text-amber-500 mx-auto mb-4" />
              <h2 className="text-xl font-bold text-gray-900 mb-2">Consultation Not Found</h2>
              <p className="text-gray-600 mb-6">
                The consultation you're trying to review doesn't exist.
              </p>
              <Link href="/client/dashboard/consultations">
                <Button className="bg-purple-600 hover:bg-purple-700 text-white">
                  Back to Consultations
                </Button>
              </Link>
            </CardBody>
          </Card>
        </div>
      </div>
    )
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-purple-50/30 py-8 px-4">
        <div className="max-w-2xl mx-auto">
          <Card className="border-0 shadow-2xl">
            <CardBody className="p-8">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center"
              >
                <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircleIcon className="w-12 h-12 text-green-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Thank You!</h2>
                <p className="text-gray-600 mb-2">
                  Your review for Dr. {consultation.practitioner_name} has been submitted.
                </p>
                <p className="text-sm text-gray-500 mb-8">
                  Your feedback helps other clients make informed decisions.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button onClick={handleViewReview} className="bg-purple-600 hover:bg-purple-700 text-white">
                    View Your Review
                  </Button>
                  <Button onClick={handleBackToDashboard} variant="outline" className="border-gray-300">
                    Back to Dashboard
                  </Button>
                </div>
              </motion.div>
            </CardBody>
          </Card>
        </div>
      </div>
    )
  }

  // =============================================
  // MAIN RENDER
  // =============================================
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-purple-50/30 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={handleBack}
            className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-purple-600 transition-colors mb-4"
          >
            <ArrowLeftIcon className="w-4 h-4" />
            Back
          </button>
          
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl shadow-lg">
              <StarIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Write a Review</h1>
              <p className="text-sm text-gray-500">
                Share your experience with Dr. {consultation.practitioner_name}
              </p>
            </div>
          </div>
        </div>

        {/* Main Card */}
        <Card className="border-0 shadow-2xl overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600/5 via-transparent to-pink-600/5"></div>
          
          <CardBody className="p-6 sm:p-8 relative">
            <div className="space-y-8">
              {/* Consultation Summary */}
              <div className="bg-purple-50 rounded-xl p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-1.5 bg-white rounded-lg">
                    <UserCircleIcon className="w-5 h-5 text-purple-600" />
                  </div>
                  <h2 className="font-semibold text-gray-900">Consultation Details</h2>
                </div>
                
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="flex items-center gap-2">
                    <CalendarIcon className="w-4 h-4 text-purple-400" />
                    <span className="text-gray-600">
                      {new Date(consultation.date).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <ClockIcon className="w-4 h-4 text-purple-400" />
                    <span className="text-gray-600">{consultation.time?.slice(0,5)}</span>
                  </div>
                </div>
              </div>

              {/* Rating */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <SparklesIcon className="w-5 h-5 text-purple-600" />
                  <h2 className="text-lg font-semibold text-gray-900">How was your experience?</h2>
                </div>
                
                <RatingSelector 
                  value={rating}
                  onChange={setRating}
                />
              </div>

              {/* Comment */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <ChatBubbleLeftIcon className="w-5 h-5 text-purple-600" />
                  <h2 className="text-lg font-semibold text-gray-900">Write a comment (optional)</h2>
                </div>
                
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Share your experience... What did you like? How was the consultation?"
                  className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent min-h-[120px] resize-y"
                  maxLength={500}
                />
                
                <div className="text-right text-xs text-gray-400">
                  {comment.length}/500 characters
                </div>
              </div>

              {/* Error Message */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="bg-red-50 border border-red-200 rounded-xl p-3"
                  >
                    <p className="text-sm text-red-600 flex items-center gap-2">
                      <ExclamationTriangleIcon className="w-4 h-4" />
                      {error}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <Button
                  onClick={handleSubmit}
                  disabled={!isValid || isSubmitting}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white py-3 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-[1.02] active:scale-[0.98] font-medium shadow-lg hover:shadow-xl"
                >
                  {isSubmitting ? (
                    <>
                      <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></span>
                      Submitting...
                    </>
                  ) : (
                    'Submit Review'
                  )}
                </Button>
                
                <Button
                  onClick={handleBack}
                  variant="outline"
                  disabled={isSubmitting}
                  className="flex-1 border-gray-300 hover:border-purple-300 hover:bg-purple-50 py-3 rounded-xl"
                >
                  Cancel
                </Button>
              </div>

              {/* Disclaimer */}
              <p className="text-xs text-center text-gray-400">
                Your review will be public and help other clients make informed decisions.
              </p>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  )
}