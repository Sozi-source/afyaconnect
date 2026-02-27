'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { apiClient } from '@/app/lib/api'
import { Card, CardBody, CardHeader } from '@/app/components/ui/Card'
import { Button } from '@/app/components/ui/Buttons'
import Link from 'next/link'
import { 
  StarIcon, 
  ArrowLeftIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline'
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid'
import { useAuth } from '@/app/contexts/AuthContext'
import type { Consultation } from '@/app/types'

export default function CreateReviewPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user } = useAuth()
  
  const consultationId = searchParams.get('consultation')
  
  const [consultation, setConsultation] = useState<Consultation | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const [rating, setRating] = useState<number>(0)
  const [hoverRating, setHoverRating] = useState<number | null>(null)
  const [comment, setComment] = useState('')

  useEffect(() => {
    if (!consultationId) {
      router.push('/client/dashboard/consultations')
      return
    }

    fetchConsultation()
  }, [consultationId, router])

  const fetchConsultation = async () => {
    try {
      setLoading(true)
      const data = await apiClient.consultations.getOne(parseInt(consultationId!))
      
      // Check if user is authorized to review this consultation
      if (data.client !== user?.id) {
        setError('You are not authorized to review this consultation')
        return
      }
      
      // Check if consultation is completed
      if (data.status !== 'completed') {
        setError('You can only review completed consultations')
        return
      }
      
      setConsultation(data)
    } catch (err) {
      console.error('Failed to fetch consultation:', err)
      setError('Failed to load consultation details')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (rating === 0) {
      setError('Please select a rating')
      return
    }

    try {
      setSubmitting(true)
      setError(null)

      await apiClient.reviews.create({
        consultation: parseInt(consultationId!),
        rating,
        comment: comment.trim() || undefined
      })

      // ✅ FIXED: Use correct path for client dashboard
      router.push('/client/dashboard/consultations?review=success')
      
    } catch (err: any) {
      console.error('Failed to create review:', err)
      setError(err.response?.data?.message || err.message || 'Failed to create review')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-emerald-200 border-t-emerald-600"></div>
      </div>
    )
  }

  if (error && !consultation) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Card className="max-w-md w-full">
          <CardBody className="p-8 text-center">
            <div className="text-4xl mb-4">😕</div>
            <p className="text-red-500 mb-4">{error}</p>
            <Link href="/client/dashboard/consultations">
              <Button variant="outline">Back to Consultations</Button>
            </Link>
          </CardBody>
        </Card>
      </div>
    )
  }

  if (!consultation) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Card className="max-w-md w-full">
          <CardBody className="p-8 text-center">
            <div className="text-4xl mb-4">👨‍⚕️</div>
            <p className="text-gray-500 mb-4">Consultation not found</p>
            <Link href="/client/dashboard/consultations">
              <Button variant="outline">Back to Consultations</Button>
            </Link>
          </CardBody>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 p-4">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Link
          href={`/client/dashboard/consultations/${consultationId}`}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition"
        >
          <ArrowLeftIcon className="h-5 w-5 text-gray-600 dark:text-gray-400" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Write a Review</h1>
      </div>

      {/* Review Form */}
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Rate Your Experience</h2>
        </CardHeader>
        <CardBody className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Consultation Info */}
            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Consultation with</p>
              <p className="font-medium text-gray-900 dark:text-white">
                Dr. {consultation.practitioner_name || consultation.practitioner_name || 'Unknown'}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
                {new Date(consultation.date).toLocaleDateString()} at {consultation.time?.slice(0,5)}
              </p>
              {consultation.client === user?.id && (
                <p className="text-sm text-emerald-600 dark:text-emerald-400 flex items-center mt-2">
                  <CheckCircleIcon className="h-4 w-4 mr-1" />
                  You are reviewing this consultation
                </p>
              )}
            </div>

            {/* Rating Stars */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Rating <span className="text-red-500">*</span>
              </label>
              <div className="flex items-center space-x-1">
                {[1, 2, 3, 4, 5].map((value) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setRating(value)}
                    onMouseEnter={() => setHoverRating(value)}
                    onMouseLeave={() => setHoverRating(null)}
                    className="p-1 focus:outline-none"
                  >
                    {value <= (hoverRating ?? rating) ? (
                      <StarIconSolid className="h-8 w-8 text-yellow-400" />
                    ) : (
                      <StarIcon className="h-8 w-8 text-gray-300 dark:text-gray-600" />
                    )}
                  </button>
                ))}
                <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">
                  {rating > 0 ? `${rating} out of 5` : 'Select a rating'}
                </span>
              </div>
            </div>

            {/* Comment */}
            <div>
              <label htmlFor="comment" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Comment (Optional)
              </label>
              <textarea
                id="comment"
                rows={5}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Share your experience with this practitioner..."
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                maxLength={500}
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                {comment.length}/500 characters
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-3 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 rounded-lg text-sm">
                {error}
              </div>
            )}

            {/* Form Actions */}
            <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
              <Link href={`/client/dashboard/consultations/${consultationId}`}>
                <Button variant="outline" type="button">
                  Cancel
                </Button>
              </Link>
              <Button 
                type="submit" 
                disabled={submitting || rating === 0}
                isLoading={submitting}
              >
                {submitting ? 'Submitting...' : 'Submit Review'}
              </Button>
            </div>
          </form>
        </CardBody>
      </Card>
    </div>
  )
}