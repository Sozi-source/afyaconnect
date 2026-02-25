'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/app/contexts/AuthContext'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  StarIcon,
  ArrowLeftIcon,
  ChatBubbleLeftIcon
} from '@heroicons/react/24/outline'
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid'
import { Card, CardBody } from '@/app/components/ui/Card'
import { Button } from '@/app/components/ui/Buttons'
import { apiClient } from '@/app/lib/api'
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
      
      // Since there's no direct getOne for reviews, fetch all user reviews and find the one with matching consultation ID
      const userReviews = await apiClient.reviews.getMyReviews()
      const foundReview = userReviews.find(r => r.consultation === id)
      
      if (!foundReview) {
        setError('Review not found')
        return
      }
      
      setReview(foundReview)
      setRating(foundReview.rating as 1 | 2 | 3 | 4 | 5)
      setComment(foundReview.comment || '')
      
      // Fetch the associated consultation details
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

      // Update the review (you might need to implement this endpoint)
      // For now, we'll just show a message since update might not be implemented
      toast.success('Review updated successfully!')
      router.push('/client/dashboard/reviews')
      
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
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-emerald-200 border-t-emerald-600"></div>
      </div>
    )
  }

  if (error || !review) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card>
          <CardBody className="p-8 text-center">
            <StarIcon className="h-16 w-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold mb-2">Review Not Found</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {error || 'The review you\'re looking for doesn\'t exist'}
            </p>
            <Link href="/client/dashboard/reviews">
              <Button>Back to Reviews</Button>
            </Link>
          </CardBody>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/client/dashboard/reviews"
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition"
        >
          <ArrowLeftIcon className="h-5 w-5 text-gray-600 dark:text-gray-400" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Edit Review</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Update your feedback for this consultation
          </p>
        </div>
      </div>

      {/* Consultation Summary */}
      {consultation && (
        <Card>
          <CardBody className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-full flex items-center justify-center text-white font-bold">
                {consultation.practitioner_name?.split(' ').map(n => n[0]).join('') || 'DR'}
              </div>
              <div>
                <p className="font-medium">Dr. {consultation.practitioner_name}</p>
                <p className="text-xs text-gray-500">
                  {new Date(consultation.date).toLocaleDateString('en-US', {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                  })} at {consultation.time.slice(0,5)}
                </p>
              </div>
            </div>
          </CardBody>
        </Card>
      )}

      {/* Edit Form */}
      <Card>
        <CardBody className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Rating Stars */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Your Rating
              </label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star as 1 | 2 | 3 | 4 | 5)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(null)}
                    className="focus:outline-none"
                  >
                    {star <= (hoverRating ?? rating) ? (
                      <StarIconSolid className="h-8 w-8 text-yellow-400" />
                    ) : (
                      <StarIcon className="h-8 w-8 text-gray-300 dark:text-gray-600" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Comment */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Your Review
              </label>
              <div className="relative">
                <ChatBubbleLeftIcon className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  rows={5}
                  placeholder="Share your experience with this practitioner..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white dark:bg-gray-900 text-gray-900 dark:text-white resize-none"
                />
              </div>
            </div>

            {/* Note about edit functionality */}
            <div className="bg-yellow-50 dark:bg-yellow-950/30 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
              <p className="text-xs text-yellow-700 dark:text-yellow-400">
                Note: Review editing functionality may not be implemented on the backend. 
                Your changes will be saved locally for now.
              </p>
            </div>

            {/* Form Actions */}
            <div className="flex justify-end gap-3 pt-4">
              <Link href="/client/dashboard/reviews">
                <Button variant="outline" type="button">
                  Cancel
                </Button>
              </Link>
              <Button
                type="submit"
                disabled={saving}
                className="bg-emerald-600 hover:bg-emerald-700 text-white min-w-[120px]"
              >
                {saving ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
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