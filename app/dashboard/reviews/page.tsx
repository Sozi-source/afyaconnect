'use client'

import { useState, useEffect } from 'react'
import { apiClient } from '@/app/lib/api'
import { Card, CardBody } from '@/app/components/ui/Card'
import { Button } from '@/app/components/ui/Buttons'
import Link from 'next/link'
import { StarIcon } from '@heroicons/react/24/solid'
import { PlusIcon } from '@heroicons/react/24/outline'
import { Review } from '@/app/types'
import { motion } from 'framer-motion'

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const data = await apiClient.reviews.getAll()
        setReviews(Array.isArray(data) ? data : [])
      } catch (error) {
        console.error('Failed to fetch reviews:', error)
        setReviews([])
      } finally {
        setLoading(false)
      }
    }
    fetchReviews()
  }, [])

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-48 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
        <div className="grid gap-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-24 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"></div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
            Reviews
          </h1>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-1">
            Share your experience with practitioners
          </p>
        </div>
        <Link href="/dashboard/reviews/create" className="w-full sm:w-auto">
          <Button fullWidth className="sm:w-auto">
            <PlusIcon className="h-5 w-5 mr-2" />
            Write a Review
          </Button>
        </Link>
      </div>

      {/* Reviews Grid */}
      <div className="grid gap-3 sm:gap-4">
        {reviews.length > 0 ? (
          reviews.map((review, index) => (
            <motion.div
              key={review.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(index * 0.05, 0.5) }}
            >
              <Link href={`/dashboard/reviews/${review.id}`}>
                <Card hoverable className="cursor-pointer">
                  <CardBody className="p-4 sm:p-5">
                    <div className="space-y-2 sm:space-y-3">
                      {/* Rating and Date */}
                      <div className="flex flex-col xs:flex-row xs:items-center xs:justify-between gap-2">
                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, i) => (
                            <StarIcon 
                              key={i} 
                              className={`h-4 w-4 sm:h-5 sm:w-5 ${
                                i < review.rating ? 'text-yellow-400' : 'text-gray-300 dark:text-gray-600'
                              }`} 
                            />
                          ))}
                        </div>
                        <span className="text-xs sm:text-sm text-gray-500">
                          {new Date(review.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      
                      {/* Comment */}
                      <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 line-clamp-2">
                        {review.comment || 'No comment provided'}
                      </p>
                      
                      {/* Consultation Link */}
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Consultation #{review.consultation}
                      </p>
                    </div>
                  </CardBody>
                </Card>
              </Link>
            </motion.div>
          ))
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12 sm:py-16 bg-white dark:bg-gray-800 rounded-xl shadow-sm"
          >
            <div className="text-4xl sm:text-5xl mb-4">⭐</div>
            <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No reviews yet
            </h3>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 max-w-sm mx-auto px-4">
              Share your experience with practitioners you've consulted with.
            </p>
            <Link href="/dashboard/reviews/create" className="inline-block mt-6">
              <Button>
                Write Your First Review
              </Button>
            </Link>
          </motion.div>
        )}
      </div>
    </div>
  )
}