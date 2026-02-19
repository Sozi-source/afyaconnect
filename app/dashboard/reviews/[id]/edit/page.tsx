'use client'

import { useParams, useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { reviewsApi } from '@/app/lib/api'
import { Button } from '@/app/components/ui/Buttons'
import { Card, CardBody } from '@/app/components/ui/Card'
import { StarIcon } from '@heroicons/react/24/solid'

interface Review {
  id: number
  consultation: number
  rating: number
  comment: string | null  // Comment can be null
  created_at: string
}

interface UpdateReviewData {
  rating?: number
  comment?: string
}

export default function EditReviewPage() {
  const params = useParams()
  const router = useRouter()
  const id = parseInt(params.id as string)
  
  const [rating, setRating] = useState(0)
  const [hover, setHover] = useState(0)
  const [comment, setComment] = useState('') // Initialize as empty string
  const [loading, setLoading] = useState(false)
  const [fetchLoading, setFetchLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchReview = async () => {
      try {
        const data = await reviewsApi.getOne(id)
        setRating(data.rating)
        // Handle null comment by converting to empty string
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
      const updateData: UpdateReviewData = { 
        rating, 
        comment: comment || undefined // Send undefined if empty
      }
      await reviewsApi.update(id, updateData)
      router.push(`/dashboard/reviews/${id}`)
    } catch (err: any) {
      console.error('Failed to update review:', err)
      setError(err.response?.data?.message || err.message || 'Failed to update review')
    } finally {
      setLoading(false)
    }
  }

  if (fetchLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Edit Review</h1>
      
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
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHover(star)}
                    onMouseLeave={() => setHover(0)}
                    className="focus:outline-none"
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
                placeholder="Write your review..."
                required
              />
            </div>

            <div className="flex space-x-3">
              <Button type="submit" disabled={loading}>
                {loading ? 'Updating...' : 'Update Review'}
              </Button>
              <Button 
                type="button" 
                variant="outline"
                onClick={() => router.back()}
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardBody>
      </Card>
    </div>
  )
}