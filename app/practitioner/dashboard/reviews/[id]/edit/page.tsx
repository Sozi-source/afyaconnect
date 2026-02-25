'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { apiClient } from '@/app/lib/api'
import { Button } from '@/app/components/ui/Buttons'
import { Card, CardBody } from '@/app/components/ui/Card'
import { StarIcon } from '@heroicons/react/24/solid'
import { ArrowLeftIcon } from '@heroicons/react/24/outline'
import { motion } from 'framer-motion'
import type { Review } from '@/app/types'

export default function EditReviewPage() {
  const params = useParams()
  const router = useRouter()
  const id = parseInt(params.id as string)
  
  const [review, setReview] = useState<Review | null>(null)
  const [rating, setRating] = useState<number>(0)
  const [comment, setComment] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hoveredRating, setHoveredRating] = useState<number>(0)

  useEffect(() => {
    const fetchReview = async () => {
      try {
        setLoading(true)
        setError(null)
        
        // Fetch all reviews and find the one we need
        const reviews = await apiClient.reviews.getMyReviews()
        const foundReview = reviews.find(r => r.id === id)
        
        if (foundReview) {
          setReview(foundReview)
          setRating(foundReview.rating)
          setComment(foundReview.comment || '')
        } else {
          setError('Review not found')
        }
      } catch (error) {
        console.error('Failed to fetch review:', error)
        setError('Failed to load review')
      } finally {
        setLoading(false)
      }
    }
    
    if (id) {
      fetchReview()
    }
  }, [id])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError(null)

    try {
      // Since there's no direct update method in the API,
      // you might need to create a new review or handle this differently
      // For now, we'll show a message that this feature is coming soon
      alert('Review update feature coming soon')
      router.back()
      
      // When the API supports updates, you would do something like:
      // await apiClient.reviews.update(id, { rating, comment })
      
    } catch (error: any) {
      console.error('Failed to update review:', error)
      setError(error.message || 'Failed to update review')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-emerald-200 border-t-emerald-600"></div>
      </div>
    )
  }

  if (error || !review) {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6">
        <Card>
          <CardBody className="p-8 text-center">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              {error || 'Review not found'}
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              The review you're trying to edit doesn't exist or you don't have permission to edit it.
            </p>
            <Button onClick={() => router.back()} variant="primary">
              Go Back
            </Button>
          </CardBody>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6">
      {/* Header with back button */}
      <div className="flex items-center gap-4 mb-6">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => router.back()}
          className="!p-2 sm:!px-4"
        >
          <ArrowLeftIcon className="h-5 w-5 sm:mr-2" />
          <span className="hidden sm:inline">Back</span>
        </Button>
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
          Edit Review
        </h1>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <Card>
          <CardBody className="p-4 sm:p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Rating Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Rating
                </label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoveredRating(star)}
                      onMouseLeave={() => setHoveredRating(0)}
                      className="focus:outline-none"
                    >
                      <StarIcon 
                        className={`h-8 w-8 sm:h-10 sm:w-10 transition-colors ${
                          star <= (hoveredRating || rating)
                            ? 'text-yellow-400'
                            : 'text-gray-300 dark:text-gray-600'
                        }`} 
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Comment */}
              <div>
                <label 
                  htmlFor="comment" 
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                >
                  Your Review
                </label>
                <textarea
                  id="comment"
                  rows={5}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Share your experience with this practitioner..."
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent dark:bg-gray-800 dark:text-white resize-none"
                />
              </div>

              {/* Original Review Info */}
              <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-xl">
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Original Review
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Created on {new Date(review.created_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>

              {/* Note about update limitation */}
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                <p className="text-sm text-yellow-800 dark:text-yellow-300">
                  ⚠️ Note: Review updates are not yet supported by the API. This feature will be available soon.
                </p>
              </div>

              {/* Error Message */}
              {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                  <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <Button
                  type="submit"
                  disabled={saving || rating === 0}
                  variant="primary"
                  fullWidth
                  className="sm:flex-1"
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </Button>
                <Button
                  type="button"
                  onClick={() => router.back()}
                  variant="outline"
                  fullWidth
                  className="sm:flex-1"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardBody>
        </Card>
      </motion.div>
    </div>
  )
}