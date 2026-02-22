'use client'

import { useParams, useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { apiClient } from '@/app/lib/api'
import { Button } from '@/app/components/ui/Buttons'
import { Card, CardBody } from '@/app/components/ui/Card'
import { StarIcon } from '@heroicons/react/24/solid'
import { ArrowLeftIcon } from '@heroicons/react/24/outline'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Review } from '@/app/types' // Import Review type

export default function EditReviewPage() {
  const params = useParams()
  const router = useRouter()
  const id = parseInt(params.id as string)
  
  const [rating, setRating] = useState<1 | 2 | 3 | 4 | 5>(5) // Type as valid rating
  const [hover, setHover] = useState(0)
  const [comment, setComment] = useState('')
  const [loading, setLoading] = useState(false)
  const [fetchLoading, setFetchLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchReview = async () => {
      try {
        const data = await apiClient.reviews.getOne(id)
        setRating(data.rating as 1 | 2 | 3 | 4 | 5)
        setComment(data.comment || '')
      } catch (error) {
        console.error('Failed to fetch review:', error)
        setError('Failed to load review')
      } finally {
        setFetchLoading(false)
      }
    }
    fetchReview()
  }, [id])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      // Create a Partial<Review> object directly
      const updateData: Partial<Review> = { 
        rating, // Now rating is the correct type
        comment: comment || undefined
      }
      
      await apiClient.reviews.update(id, updateData)
      router.push(`/dashboard/reviews/${id}`)
    } catch (err: any) {
      console.error('Failed to update review:', err)
      setError(err.response?.data?.message || err.message || 'Failed to update review')
    } finally {
      setLoading(false)
    }
  }

  const handleRatingClick = (star: number) => {
    setRating(star as 1 | 2 | 3 | 4 | 5)
  }

  if (fetchLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6">
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
                      onClick={() => handleRatingClick(star)}
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
                  placeholder="Share your experience..."
                  required
                />
                <p className="text-xs text-gray-500 mt-1 text-right">
                  {comment.length}/500
                </p>
              </div>

              {/* Buttons */}
              <div className="flex flex-col-reverse sm:flex-row gap-3 pt-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => router.back()}
                  fullWidth
                  className="sm:flex-1"
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={loading} fullWidth className="sm:flex-1">
                  {loading ? 'Updating...' : 'Update Review'}
                </Button>
              </div>
            </form>
          </CardBody>
        </Card>
      </motion.div>
    </div>
  )
}