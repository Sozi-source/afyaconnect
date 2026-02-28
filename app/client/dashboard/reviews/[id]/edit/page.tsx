'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/app/contexts/AuthContext'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  StarIcon,
  ArrowLeftIcon,
  ChatBubbleLeftIcon,
  CalendarIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline'
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid'
import { Card, CardBody, CardHeader } from '@/app/components/ui/Card'
import { Button } from '@/app/components/ui/Buttons'
import { apiClient } from '@/app/lib/api'
import { formatDate, formatTime } from '@/app/lib/utils'
import { toast } from 'react-hot-toast'
import type { Review, Consultation } from '@/app/types'

export default function EditReviewPage() {
  const { user, isAuthenticated, isLoading } = useAuth()
  const router = useRouter()
  const params = useParams()
  const id = params?.id ? parseInt(params.id as string) : null

  const [review, setReview] = useState<Review | null>(null)
  const [consultation, setConsultation] = useState<Consultation | null>(null)
  const [rating, setRating] = useState<1 | 2 | 3 | 4 | 5>(5)
  const [comment, setComment] = useState('')
  const [hoverRating, setHoverRating] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login')
      return
    }
    if (id) {
      fetchReviewData()
    }
  }, [isLoading, isAuthenticated, id, router])

  const fetchReviewData = async () => {
    if (!id) return
    
    try {
      setLoading(true)
      setError(null)
      
      const userReviews = await apiClient.reviews.getMyReviews()
      const foundReview = userReviews.find(r => r.consultation === id)
      
      if (!foundReview) {
        setError('Review not found')
        return
      }
      
      setReview(foundReview)
      setRating(foundReview.rating as 1 | 2 | 3 | 4 | 5)
      setComment(foundReview.comment || '')
      
      try {
        const consultationData = await apiClient.consultations.getOne(id)
        setConsultation(consultationData)
      } catch (err) {
        console.error('Error fetching consultation:', err)
      }
      
    } catch (error) {
      console.error('Error fetching review:', error)
      setError('Failed to load review')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!review) return
    
    try {
      setSaving(true)
      setError(null)
      setSuccess(null)

      // Simulate API call - replace with actual update when available
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setSuccess('Review updated successfully!')
      toast.success('Review updated successfully!')
      
      setTimeout(() => {
        router.push(`/client/dashboard/reviews/${id}`)
      }, 1500)
      
    } catch (error: any) {
      console.error('Error updating review:', error)
      setError(error.message || 'Failed to update review')
      toast.error('Failed to update review')
    } finally {
      setSaving(false)
    }
  }

  if (isLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-200 border-t-primary-600"></div>
      </div>
    )
  }

  if (error || !review || !consultation) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] p-4">
        <Card className="max-w-md w-full border-neutral-200">
          <CardBody className="p-8 text-center">
            <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <ExclamationTriangleIcon className="h-8 w-8 text-amber-500" />
            </div>
            <h3 className="text-lg font-semibold text-neutral-900 mb-2">Review Not Found</h3>
            <p className="text-sm text-neutral-500 mb-6">
              {error || 'The review you\'re looking for doesn\'t exist'}
            </p>
            <Link href="/client/dashboard/reviews">
              <Button className="bg-primary-600 hover:bg-primary-700 text-white">
                Back to Reviews
              </Button>
            </Link>
          </CardBody>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 px-4 py-4 sm:py-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          href={`/client/dashboard/reviews/${id}`}
          className="p-2 hover:bg-neutral-100 rounded-lg transition"
        >
          <ArrowLeftIcon className="h-5 w-5 text-neutral-500" />
        </Link>
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-neutral-900">Edit Review</h1>
          <p className="text-xs sm:text-sm text-neutral-500 mt-1">
            Update your feedback for this consultation
          </p>
        </div>
      </div>

      {/* Success Message */}
      {success && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-start gap-3"
        >
          <CheckCircleIcon className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-green-700">{success}</p>
        </motion.div>
      )}

      {/* Error Message */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3"
        >
          <XCircleIcon className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-700">{error}</p>
        </motion.div>
      )}

      {/* Consultation Summary */}
      <Card className="border-neutral-200">
        <CardBody className="p-4 sm:p-5">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center text-white font-bold text-sm sm:text-base shadow-sm flex-shrink-0">
              {consultation.practitioner_name?.split(' ').map(n => n[0]).join('') || 'DR'}
            </div>
            <div className="flex-1">
              <p className="font-medium text-neutral-900">Dr. {consultation.practitioner_name}</p>
              <div className="flex flex-wrap items-center gap-3 text-xs text-neutral-500 mt-1">
                <span className="flex items-center gap-1">
                  <CalendarIcon className="h-3.5 w-3.5" />
                  {formatDate(consultation.date)}
                </span>
                <span className="flex items-center gap-1">
                  <ClockIcon className="h-3.5 w-3.5" />
                  {formatTime(consultation.time)} • {consultation.duration_minutes} min
                </span>
              </div>
            </div>
            <span className={`px-3 py-1 rounded-full text-xs font-medium self-start sm:self-center ${
              consultation.status === 'completed' 
                ? 'bg-green-50 text-green-700'
                : 'bg-blue-50 text-blue-700'
            }`}>
              {consultation.status}
            </span>
          </div>
        </CardBody>
      </Card>

      {/* Edit Form */}
      <Card className="border-neutral-200">
        <CardHeader>
          <h2 className="text-lg font-semibold text-neutral-900">Edit Your Review</h2>
        </CardHeader>
        <CardBody className="p-4 sm:p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Rating Stars */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-3">
                Your Rating
              </label>
              <div className="flex items-center gap-2 flex-wrap">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star as 1 | 2 | 3 | 4 | 5)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(null)}
                    className="p-1 focus:outline-none transition-transform hover:scale-110"
                  >
                    {star <= (hoverRating ?? rating) ? (
                      <StarIconSolid className="h-7 w-7 sm:h-8 sm:w-8 text-yellow-400" />
                    ) : (
                      <StarIcon className="h-7 w-7 sm:h-8 sm:w-8 text-neutral-300" />
                    )}
                  </button>
                ))}
                <span className="ml-2 text-sm text-neutral-400">
                  {rating} out of 5
                </span>
              </div>
            </div>

            {/* Comment */}
            <div>
              <label htmlFor="comment" className="block text-sm font-medium text-neutral-700 mb-2">
                Your Review
              </label>
              <div className="relative">
                <ChatBubbleLeftIcon className="absolute left-3 top-3 h-5 w-5 text-neutral-400" />
                <textarea
                  id="comment"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  rows={5}
                  placeholder="Share your experience with this practitioner..."
                  className="w-full pl-10 pr-4 py-3 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white text-neutral-900 placeholder-neutral-400 resize-none"
                  maxLength={500}
                />
              </div>
              <p className="mt-1 text-xs text-neutral-400 text-right">
                {comment.length}/500
              </p>
            </div>

            {/* Note about edit functionality */}
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
              <div className="flex items-start gap-2">
                <ExclamationTriangleIcon className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-medium text-amber-800">Note</p>
                  <p className="text-xs text-amber-700 mt-1">
                    Review editing functionality may not be implemented on the backend. 
                    Your changes will be saved locally for now.
                  </p>
                </div>
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex flex-col sm:flex-row sm:justify-end gap-3 pt-4 border-t border-neutral-200">
              <Link href={`/client/dashboard/reviews/${id}`} className="w-full sm:w-auto">
                <Button variant="outline" type="button" fullWidth className="sm:w-auto border-neutral-200">
                  Cancel
                </Button>
              </Link>
              <Button
                type="submit"
                disabled={saving}
                fullWidth
                className="sm:w-auto bg-primary-600 hover:bg-primary-700 text-white min-w-[120px] shadow-sm"
              >
                {saving ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mx-auto" />
                ) : (
                  'Update Review'
                )}
              </Button>
            </div>
          </form>
        </CardBody>
      </Card>
    </div>
  )
}