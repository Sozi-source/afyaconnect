'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { reviewsApi } from '@/app/lib/api'
import { Button } from '@/app/components/ui/Buttons'
import { Card, CardBody } from '@/app/components/ui/Card'
import { StarIcon } from '@heroicons/react/24/solid'
import Link from 'next/link'

interface Review {
  id: number
  consultation: number
  rating: number
  comment: string | null
  created_at: string
}

export default function ReviewDetailPage() {
  const params = useParams()
  const router = useRouter()
  const id = parseInt(params.id as string)
  
  const [review, setReview] = useState<Review | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchReview = async () => {
      try {
        const data = await reviewsApi.getOne(id)
        setReview(data)
      } catch (error) {
        console.error('Failed to fetch review:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchReview()
  }, [id])

  if (loading) return <div className="flex justify-center p-8">Loading...</div>
  if (!review) return <div>Review not found</div>

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex justify-between items-start mb-6">
        <h1 className="text-3xl font-bold">Review Details</h1>
        <Button variant="outline" onClick={() => router.back()}>
          Back
        </Button>
      </div>

      <Card>
        <CardBody>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex text-yellow-400">
                {[...Array(5)].map((_, i) => (
                  <StarIcon key={i} className={`h-6 w-6 ${i < review.rating ? 'text-yellow-400' : 'text-gray-300 dark:text-gray-600'}`} />
                ))}
              </div>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {new Date(review.created_at).toLocaleDateString()}
              </span>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Review</h3>
              <p className="text-gray-900 dark:text-gray-100">
                {review.comment || 'No comment provided'}
              </p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Consultation</h3>
              <Link 
                href={`/dashboard/consultations/${review.consultation}`} 
                className="text-primary-600 hover:text-primary-700 dark:text-primary-400"
              >
                View Consultation #{review.consultation}
              </Link>
            </div>

            <div className="pt-4 flex space-x-3">
              <Link href={`/dashboard/reviews/${id}/edit`}>
                <Button variant="outline">Edit Review</Button>
              </Link>
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  )
}