'use client'

import { useState, useEffect } from 'react'
import { reviewsApi } from '@/app/lib/api'
import { Card, CardBody } from '@/app/components/ui/Card'
import { Button } from '@/app/components/ui/Buttons'
import Link from 'next/link'
import { StarIcon } from '@heroicons/react/24/solid'
import { Review, PaginatedResponse } from '@/app/types'  // Import from types

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const data = await reviewsApi.getAll() as PaginatedResponse<Review> | Review[]
        
        // Handle both paginated and non-paginated responses
        if (Array.isArray(data)) {
          setReviews(data)
        } else if (data && 'results' in data) {
          setReviews(data.results)
        } else {
          setReviews([])
        }
      } catch (error) {
        console.error('Failed to fetch reviews:', error)
        setReviews([])
      } finally {
        setLoading(false)
      }
    }
    fetchReviews()
  }, [])

  if (loading) return <div className="flex justify-center p-8">Loading...</div>

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Reviews</h1>
        <Link href="/dashboard/reviews/create">
          <Button>Write a Review</Button>
        </Link>
      </div>

      <div className="grid gap-4">
        {reviews.length > 0 ? (
          reviews.map((review) => (
            <Link href={`/dashboard/reviews/${review.id}`} key={review.id}>
              <Card hoverable>
                <CardBody>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <div className="flex text-yellow-400">
                          {[...Array(5)].map((_, i) => (
                            <StarIcon key={i} className={`h-5 w-5 ${i < review.rating ? 'text-yellow-400' : 'text-gray-300'}`} />
                          ))}
                        </div>
                        <span className="text-sm text-gray-500">
                          {new Date(review.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-gray-700 dark:text-gray-300 line-clamp-2">
                        {review.comment || 'No comment provided'}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                        Consultation #{review.consultation}
                      </p>
                    </div>
                  </div>
                </CardBody>
              </Card>
            </Link>
          ))
        ) : (
          <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg">
            <p className="text-gray-500 dark:text-gray-400">No reviews yet</p>
            <Link href="/dashboard/reviews/create">
              <Button variant="outline" className="mt-4">
                Write Your First Review
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}