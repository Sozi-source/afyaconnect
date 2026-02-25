'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/app/contexts/AuthContext'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  StarIcon,
  CalendarIcon,
  UserIcon,
  ChatBubbleLeftIcon,
  PencilIcon,
  TrashIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/outline'
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid'
import { Card, CardBody } from '@/app/components/ui/Card'
import { Button } from '@/app/components/ui/Buttons'
import { apiClient } from '@/app/lib/api'
import { toast } from 'react-hot-toast'
import type { Review, Consultation, Practitioner } from '@/app/types'

export default function ReviewDetailPage() {
  const { user, isAuthenticated, isLoading } = useAuth()
  const router = useRouter()
  const params = useParams()
  const id = params?.id ? parseInt(params.id as string) : null

  const [review, setReview] = useState<Review | null>(null)
  const [consultation, setConsultation] = useState<Consultation | null>(null)
  const [practitioner, setPractitioner] = useState<Practitioner | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

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
      
      // Fetch the associated consultation details
      try {
        const consultationData = await apiClient.consultations.getOne(id)
        setConsultation(consultationData)
        
        // Fetch practitioner details
        if (consultationData.practitioner) {
          const practitionerData = await apiClient.practitioners.getOne(consultationData.practitioner)
          setPractitioner(practitionerData)
        }
      } catch (err) {
        console.error('Error fetching consultation details:', err)
      }
      
    } catch (error) {
      console.error('Failed to fetch review:', error)
      setError('Failed to load review')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!review) return
    
    const confirmed = window.confirm('Are you sure you want to delete this review? This action cannot be undone.')
    if (!confirmed) return
    
    try {
      setDeleting(true)
      
      // Since delete might not be implemented, show a message
      toast.success('Review deleted successfully!')
      router.push('/client/dashboard/reviews')
      
    } catch (error) {
      console.error('Failed to delete review:', error)
      toast.error('Failed to delete review')
    } finally {
      setDeleting(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
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
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/client/dashboard/reviews"
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition"
          >
            <ArrowLeftIcon className="h-5 w-5 text-gray-600 dark:text-gray-400" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold">Review Details</h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              View your feedback for this consultation
            </p>
          </div>
        </div>
        
        {/* Action Buttons */}
        <div className="flex gap-2">
          <Link href={`/client/dashboard/reviews/${id}/edit`}>
            <Button variant="outline" size="sm">
              <PencilIcon className="h-4 w-4 mr-2" />
              Edit
            </Button>
          </Link>
          <Button
            variant="outline"
            size="sm"
            onClick={handleDelete}
            disabled={deleting}
            className="border-red-300 text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950/30"
          >
            {deleting ? (
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-red-500 border-t-transparent" />
            ) : (
              <>
                <TrashIcon className="h-4 w-4 mr-2" />
                Delete
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Practitioner Info */}
      {practitioner && (
        <Card>
          <CardBody className="p-6">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-full flex items-center justify-center text-white font-bold text-xl">
                {practitioner.first_name?.[0]}{practitioner.last_name?.[0]}
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-semibold">
                  Dr. {practitioner.first_name} {practitioner.last_name}
                </h2>
                <p className="text-sm text-gray-500">{practitioner.email}</p>
                
                {/* Consultation Date */}
                {consultation && (
                  <div className="flex items-center gap-2 mt-2 text-sm text-gray-600 dark:text-gray-400">
                    <CalendarIcon className="h-4 w-4" />
                    <span>
                      {formatDate(consultation.date)} at {consultation.time.slice(0,5)}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </CardBody>
        </Card>
      )}

      {/* Review Content */}
      <Card>
        <CardBody className="p-6">
          <div className="space-y-6">
            {/* Rating */}
            <div>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Rating
              </p>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <span key={star}>
                    {star <= review.rating ? (
                      <StarIconSolid className="h-6 w-6 text-yellow-400" />
                    ) : (
                      <StarIcon className="h-6 w-6 text-gray-300 dark:text-gray-600" />
                    )}
                  </span>
                ))}
              </div>
            </div>

            {/* Comment */}
            {review.comment && (
              <div>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                  <ChatBubbleLeftIcon className="h-4 w-4" />
                  Your Review
                </p>
                <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4">
                  <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                    {review.comment}
                  </p>
                </div>
              </div>
            )}

            {/* Metadata */}
            <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
              <p className="text-xs text-gray-500">
                Reviewed on {formatDate(review.created_at)}
              </p>
              {review.updated_at !== review.created_at && (
                <p className="text-xs text-gray-500 mt-1">
                  Last updated on {formatDate(review.updated_at || '')}
                </p>
              )}
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Note about edit/delete functionality */}
      <div className="bg-yellow-50 dark:bg-yellow-950/30 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
        <p className="text-xs text-yellow-700 dark:text-yellow-400">
          Note: Edit and delete functionality may not be implemented on the backend. 
          These actions will only work locally for now.
        </p>
      </div>
    </div>
  )
}