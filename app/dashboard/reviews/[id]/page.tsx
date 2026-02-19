'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { reviewsApi } from '@/app/lib/api'
import { Button } from '@/app/components/ui/Buttons'
import { Card, CardBody } from '@/app/components/ui/Card'
import { StarIcon } from '@heroicons/react/24/solid'
import { PencilIcon, ArrowLeftIcon } from '@heroicons/react/24/outline'
import Link from 'next/link'
import { motion } from 'framer-motion'

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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!review) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-bold">Review not found</h2>
        <Button onClick={() => router.back()} className="mt-4">
          Go Back
        </Button>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6">
      {/* Header with back button */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
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
            Review Details
          </h1>
        </div>
        <Link href={`/dashboard/reviews/${id}/edit`}>
          <Button size="sm" className="!px-3 sm:!px-4">
            <PencilIcon className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">Edit</span>
          </Button>
        </Link>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <Card>
          <CardBody className="p-4 sm:p-6">
            <div className="space-y-4 sm:space-y-6">
              {/* Rating and Date */}
              <div className="flex flex-col xs:flex-row xs:items-center xs:justify-between gap-3">
                <div className="flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <StarIcon 
                      key={i} 
                      className={`h-5 w-5 sm:h-6 sm:w-6 ${
                        i < review.rating ? 'text-yellow-400' : 'text-gray-300 dark:text-gray-600'
                      }`} 
                    />
                  ))}
                </div>
                <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                  {new Date(review.created_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </span>
              </div>

              {/* Review Comment */}
              <div>
                <h3 className="text-sm sm:text-base font-medium text-gray-500 dark:text-gray-400 mb-2">
                  Your Review
                </h3>
                <div className="bg-gray-50 dark:bg-gray-800 p-4 sm:p-5 rounded-xl">
                  <p className="text-sm sm:text-base text-gray-900 dark:text-white whitespace-pre-line">
                    {review.comment || 'No comment provided'}
                  </p>
                </div>
              </div>

              {/* Consultation Link */}
              <div>
                <h3 className="text-sm sm:text-base font-medium text-gray-500 dark:text-gray-400 mb-2">
                  Consultation
                </h3>
                <Link 
                  href={`/dashboard/consultations/${review.consultation}`} 
                  className="inline-flex items-center text-sm sm:text-base text-blue-600 hover:text-blue-700 dark:text-blue-400"
                >
                  View Consultation #{review.consultation}
                  <svg className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col xs:flex-row gap-3 pt-4">
                <Link href={`/dashboard/reviews/${id}/edit`} className="flex-1">
                  <Button variant="outline" fullWidth>
                    <PencilIcon className="h-4 w-4 mr-2" />
                    Edit Review
                  </Button>
                </Link>
              </div>
            </div>
          </CardBody>
        </Card>
      </motion.div>
    </div>
  )
}