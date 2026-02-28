// app/client/dashboard/reviews/create/page.tsx
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
  CheckCircleIcon,
  XCircleIcon
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
      
      if (data.client !== user?.id) {
        setError('You are not authorized to review this consultation')
        return
      }
      
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
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-200 border-t-primary-600"></div>
      </div>
    )
  }

  if (error && !consultation) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-4">
        <Card className="max-w-md w-full border-neutral-200">
          <CardBody className="p-8 text-center">
            <XCircleIcon className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <p className="text-red-600 mb-4">{error}</p>
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
      <div className="min-h-[60vh] flex items-center justify-center p-4">
        <Card className="max-w-md w-full border-neutral-200">
          <CardBody className="p-8 text-center">
            <div className="w-20 h-20 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-4xl">👨‍⚕️</span>
            </div>
            <p className="text-neutral-600 mb-4">Consultation not found</p>
            <Link href="/client/dashboard/consultations">
              <Button variant="outline">Back to Consultations</Button>
            </Link>
          </CardBody>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 px-4 py-4 sm:py-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          href={`/client/dashboard/consultations/${consultationId}`}
          className="p-2 hover:bg-neutral-100 rounded-lg transition"
        >
          <ArrowLeftIcon className="h-5 w-5 text-neutral-500" />
        </Link>
        <h1 className="text-xl sm:text-2xl font-bold text-neutral-900">Write a Review</h1>
      </div>

      {/* Review Form */}
      <Card className="border-neutral-200">
        <CardHeader>
          <h2 className="text-lg font-semibold text-neutral-900">Rate Your Experience</h2>
        </CardHeader>
        <CardBody className="p-4 sm:p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Consultation Info */}
            <div className="bg-neutral-50 rounded-xl p-4">
              <p className="text-xs text-neutral-500 mb-1">Consultation with</p>
              <p className="font-medium text-neutral-900">
                Dr. {consultation.practitioner_name || 'Unknown'}
              </p>
              <p className="text-xs text-neutral-400 mt-1">
                {new Date(consultation.date).toLocaleDateString('en-US', {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric'
                })} at {consultation.time?.slice(0,5)}
              </p>
              {consultation.client === user?.id && (
                <p className="text-xs text-primary-600 flex items-center mt-2">
                  <CheckCircleIcon className="h-4 w-4 mr-1" />
                  You are reviewing this consultation
                </p>
              )}
            </div>

            {/* Rating Stars */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-3">
                Rating <span className="text-red-500">*</span>
              </label>
              <div className="flex items-center gap-1 flex-wrap">
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
                      <StarIconSolid className="h-7 w-7 sm:h-8 sm:w-8 text-yellow-400" />
                    ) : (
                      <StarIcon className="h-7 w-7 sm:h-8 sm:w-8 text-neutral-300" />
                    )}
                  </button>
                ))}
                <span className="ml-2 text-sm text-neutral-400">
                  {rating > 0 ? `${rating} out of 5` : 'Select a rating'}
                </span>
              </div>
            </div>

            {/* Comment */}
            <div>
              <label htmlFor="comment" className="block text-sm font-medium text-neutral-700 mb-2">
                Comment (Optional)
              </label>
              <textarea
                id="comment"
                rows={5}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Share your experience with this practitioner..."
                className="w-full px-4 py-3 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white text-neutral-900 placeholder-neutral-400 resize-none"
                maxLength={500}
              />
              <p className="mt-1 text-xs text-neutral-400 text-right">
                {comment.length}/500
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-3 bg-red-50 text-red-600 rounded-xl text-sm">
                {error}
              </div>
            )}

            {/* Form Actions */}
            <div className="flex flex-col sm:flex-row sm:justify-end gap-3 pt-4 border-t border-neutral-200">
              <Link href={`/client/dashboard/consultations/${consultationId}`} className="w-full sm:w-auto">
                <Button variant="outline" type="button" fullWidth className="sm:w-auto">
                  Cancel
                </Button>
              </Link>
              <Button 
                type="submit" 
                disabled={submitting || rating === 0}
                isLoading={submitting}
                fullWidth
                className="sm:w-auto bg-primary-600 hover:bg-primary-700 text-white"
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