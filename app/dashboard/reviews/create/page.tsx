'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { reviewsApi } from '@/app/lib/api'
import { Button } from '@/app/components/ui/Buttons'
import { Card, CardBody } from '@/app/components/ui/Card'
import { StarIcon } from '@heroicons/react/24/solid'
import Link from 'next/link'

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
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Write a Review</h1>
      
      <Card>
        <CardBody>
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-3 rounded border border-red-200 dark:border-red-800">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium mb-2">Rating</label>
              <div className="flex space-x-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    className="focus:outline-none"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHover(star)}
                    onMouseLeave={() => setHover(0)}
                  >
                    <StarIcon 
                      className={`h-8 w-8 transition-colors ${
                        star <= (hover || rating) 
                          ? 'text-yellow-400' 
                          : 'text-gray-300 dark:text-gray-600'
                      }`} 
                    />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label htmlFor="comment" className="block text-sm font-medium mb-2">
                Your Review
              </label>
              <textarea
                id="comment"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="w-full p-3 border rounded-lg dark:bg-gray-800 dark:border-gray-700 focus:ring-2 focus:ring-primary-500"
                rows={5}
                placeholder="Share your experience..."
                required
              />
            </div>

            <div className="flex space-x-3">
              <Button type="submit" disabled={loading}>
                {loading ? 'Submitting...' : 'Submit Review'}
              </Button>
              <Link href="/dashboard/reviews">
                <Button variant="outline">Cancel</Button>
              </Link>
            </div>
          </form>
        </CardBody>
      </Card>
    </div>
  )
}