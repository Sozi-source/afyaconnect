'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/app/contexts/AuthContext'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  StarIcon,
  ArrowLeftIcon,
  CalendarIcon,
  ClockIcon,
  UserIcon,
  PencilIcon,
  TrashIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline'
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid'
import { Card, CardBody } from '@/app/components/ui/Card'
import { Button } from '@/app/components/ui/Buttons'
import { apiClient } from '@/app/lib/api'
import { formatDate, formatTime } from '@/app/lib/utils'
import type { Review, Consultation } from '@/app/types'

export default function ReviewDetailPage() {
  const { user, isAuthenticated, isLoading } = useAuth()
  const router = useRouter()
  const params = useParams()
  const id = params?.id ? parseInt(params.id as string) : null

  const [review, setReview] = useState<Review | null>(null)
  const [consultation, setConsultation] = useState<Consultation | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

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

  const handleDelete = async () => {
    if (!review) return
    
    try {
      // Delete review logic here when API supports it
      console.log('Deleting review:', review.id)
      router.push('/client/dashboard/reviews')
    } catch (error) {
      console.error('Error deleting review:', error)
    }
  }

  if (isLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-200 border-t-primary-600"></div>
      </div>
    )
  }

  if (error || !review) {
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/client/dashboard/reviews"
            className="p-2 hover:bg-neutral-100 rounded-lg transition"
          >
            <ArrowLeftIcon className="h-5 w-5 text-neutral-500" />
          </Link>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-neutral-900">Review Details</h1>
            <p className="text-xs sm:text-sm text-neutral-500 mt-1">
              View your feedback for this consultation
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2 ml-9 sm:ml-0">
          <Link href={`/client/dashboard/reviews/${id}/edit`}>
            <Button
              variant="outline"
              size="sm"
              className="border-neutral-200 text-neutral-700 hover:bg-neutral-50"
            >
              <PencilIcon className="h-4 w-4 mr-2" />
              Edit
            </Button>
          </Link>
          <Button
            variant="outline"
            size="sm"
            className="border-red-200 text-red-600 hover:bg-red-50"
            onClick={() => setShowDeleteConfirm(true)}
          >
            <TrashIcon className="h-4 w-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
          onClick={() => setShowDeleteConfirm(false)}
        >
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl"
            onClick={e => e.stopPropagation()}
          >
            <div className="text-center">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <ExclamationTriangleIcon className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-neutral-900 mb-2">Delete Review</h3>
              <p className="text-sm text-neutral-500 mb-6">
                Are you sure you want to delete this review? This action cannot be undone.
              </p>
              <div className="flex gap-3 justify-center">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowDeleteConfirm(false)}
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  className="bg-red-600 hover:bg-red-700 text-white"
                  onClick={handleDelete}
                >
                  Delete
                </Button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Review */}
        <div className="lg:col-span-2">
          <Card className="border-neutral-200">
            <CardBody className="p-6">
              <div className="space-y-6">
                {/* Rating */}
                <div>
                  <p className="text-xs text-neutral-500 mb-2">Your Rating</p>
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        star <= review.rating ? (
                          <StarIconSolid key={star} className="h-6 w-6 text-yellow-400" />
                        ) : (
                          <StarIcon key={star} className="h-6 w-6 text-neutral-300" />
                        )
                      ))}
                    </div>
                    <span className="text-sm font-medium text-neutral-700">
                      {review.rating}.0 out of 5
                    </span>
                  </div>
                </div>

                {/* Review Content */}
                {review.comment && (
                  <div>
                    <p className="text-xs text-neutral-500 mb-2">Your Review</p>
                    <div className="bg-neutral-50 rounded-xl p-4">
                      <p className="text-sm text-neutral-700 leading-relaxed">
                        {review.comment}
                      </p>
                    </div>
                  </div>
                )}

                {/* Metadata */}
                <div className="pt-4 border-t border-neutral-200">
                  <p className="text-xs text-neutral-500 mb-2">Review Information</p>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-neutral-50 rounded-lg p-3">
                      <p className="text-xs text-neutral-400">Submitted</p>
                      <p className="text-sm font-medium text-neutral-900">
                        {new Date(review.created_at).toLocaleDateString('en-US', {
                          month: 'long',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </p>
                    </div>
                    <div className="bg-neutral-50 rounded-lg p-3">
                      <p className="text-xs text-neutral-400">Review ID</p>
                      <p className="text-sm font-medium text-neutral-900">#{review.id}</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Right Column - Consultation Details */}
        <div>
          <Card className="border-neutral-200">
            <CardBody className="p-6">
              <h3 className="font-semibold text-neutral-900 mb-4">Consultation Details</h3>
              
              {consultation ? (
                <div className="space-y-4">
                  {/* Practitioner */}
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-sm">
                      {consultation.practitioner_name?.split(' ').map(n => n[0]).join('') || 'DR'}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-neutral-900">
                        Dr. {consultation.practitioner_name}
                      </p>
                      <p className="text-xs text-neutral-500">Practitioner</p>
                    </div>
                  </div>

                  {/* Date & Time */}
                  <div className="bg-neutral-50 rounded-xl p-3">
                    <div className="flex items-center gap-2 text-sm text-neutral-600 mb-2">
                      <CalendarIcon className="h-4 w-4 text-neutral-400" />
                      <span>{formatDate(consultation.date)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-neutral-600">
                      <ClockIcon className="h-4 w-4 text-neutral-400" />
                      <span>{formatTime(consultation.time)} • {consultation.duration_minutes} min</span>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-neutral-500">Status</span>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      consultation.status === 'completed' 
                        ? 'bg-green-50 text-green-700'
                        : consultation.status === 'cancelled'
                        ? 'bg-red-50 text-red-700'
                        : 'bg-blue-50 text-blue-700'
                    }`}>
                      {consultation.status}
                    </span>
                  </div>

                  {/* View Consultation Link */}
                  <Link 
                    href={`/client/dashboard/consultations/${consultation.id}`}
                    className="block mt-4 pt-4 border-t border-neutral-200"
                  >
                    <Button variant="outline" fullWidth className="border-neutral-200 text-neutral-700 hover:bg-neutral-50">
                      View Full Consultation
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="animate-pulse space-y-3">
                    <div className="h-10 w-10 bg-neutral-200 rounded-full mx-auto"></div>
                    <div className="h-4 bg-neutral-200 rounded w-3/4 mx-auto"></div>
                    <div className="h-3 bg-neutral-200 rounded w-1/2 mx-auto"></div>
                  </div>
                </div>
              )}
            </CardBody>
          </Card>

          {/* Quick Actions */}
          <Card className="border-neutral-200 mt-4">
            <CardBody className="p-4">
              <h3 className="font-medium text-neutral-900 mb-3">Quick Actions</h3>
              <div className="space-y-2">
                <Link href="/client/dashboard/consultations/create">
                  <button className="w-full text-left px-3 py-2 text-sm text-neutral-700 hover:bg-neutral-50 rounded-lg transition">
                    Book Another Consultation
                  </button>
                </Link>
                <Link href="/client/dashboard/practitioners">
                  <button className="w-full text-left px-3 py-2 text-sm text-neutral-700 hover:bg-neutral-50 rounded-lg transition">
                    Find More Practitioners
                  </button>
                </Link>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  )
}