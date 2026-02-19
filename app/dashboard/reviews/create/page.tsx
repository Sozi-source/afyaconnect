'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { reviewsApi } from '@/app/lib/api'
import { Button } from '@/app/components/ui/Buttons'
import { Card, CardBody } from '@/app/components/ui/Card'
import { StarIcon } from '@heroicons/react/24/solid'
import { ArrowLeftIcon } from '@heroicons/react/24/outline'
import Link from 'next/link'
import { motion } from 'framer-motion'

interface CreateReviewData {
  consultation: string
  rating: number
  comment: string
}

export default function CreateReviewPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const consultationId = searchParams.get('consultation')
  
  const [rating, setRating] = useState(0)
  const [hover, setHover] = useState(0)
  const [comment, setComment] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (rating === 0) {
      setError('Please select a rating')
      return
    }

    if (!consultationId) {
      setError('No consultation specified')
      return
    }

    setLoading(true)
    setError('')

    try {
      const reviewData: CreateReviewData = {
        consultation: consultationId,
        rating,
        comment
      }
      await reviewsApi.create(reviewData)
      router.push('/dashboard/reviews')
    } catch (err: any) {
      console.error('Failed to submit review:', err)
      setError(err.response?.data?.message || err.message || 'Failed to submit review')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6">
      {/* Header with back button */}
      <div className="flex items-center gap-4 mb-6">
        <Link href="/dashboard/reviews">
          <Button variant="outline" size="sm" className="!p-2 sm:!px-4">
            <ArrowLeftIcon className="h-5 w-5 sm:mr-2" />
            <span className="hidden sm:inline">Back</span>
          </Button>
        </Link>
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
          Write a Review
        </h1>
      </div>
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <Card>
          <CardBody className="p-4 sm:p-6">
            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
              {/* Error Message */}
              {error && (
                <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-3 sm:p-4 rounded-xl border border-red-200 dark:border-red-800">
                  <p className="text-xs sm:text-sm">{error}</p>
                </div>
              )}

              {/* Rating */}
              <div>
                <label className="block text-xs sm:text-sm font-medium mb-2">
                  Rating <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-1 sm:gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      className="focus:outline-none p-1"
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHover(star)}
                      onMouseLeave={() => setHover(0)}
                    >
                      <StarIcon 
                        className={`h-7 w-7 sm:h-8 sm:w-8 transition-all ${
                          star <= (hover || rating) 
                            ? 'text-yellow-400 scale-110' 
                            : 'text-gray-300 dark:text-gray-600'
                        }`} 
                      />
                    </button>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  {rating === 0 ? 'Click to rate' : `You selected ${rating} star${rating > 1 ? 's' : ''}`}
                </p>
              </div>

              {/* Comment */}
              <div>
                <label htmlFor="comment" className="block text-xs sm:text-sm font-medium mb-2">
                  Your Review
                </label>
                <textarea
                  id="comment"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="w-full p-3 sm:p-4 text-sm border rounded-xl dark:bg-gray-800 dark:border-gray-700 focus:ring-2 focus:ring-blue-500"
                  rows={5}
                  placeholder="Share your experience with the practitioner... What went well? What could be improved?"
                  required
                />
                <p className="text-xs text-gray-500 mt-1 text-right">
                  {comment.length}/500
                </p>
              </div>

              {/* Buttons */}
              <div className="flex flex-col-reverse sm:flex-row gap-3 pt-4">
                <Link href="/dashboard/reviews" className="flex-1">
                  <Button variant="outline" fullWidth>
                    Cancel
                  </Button>
                </Link>
                <Button type="submit" disabled={loading} fullWidth className="flex-1">
                  {loading ? 'Submitting...' : 'Submit Review'}
                </Button>
              </div>
            </form>
          </CardBody>
        </Card>
      </motion.div>
    </div>
  )
}