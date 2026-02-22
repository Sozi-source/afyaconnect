'use client'

import { useState, useEffect } from 'react'
import { apiClient } from '@/app/lib/api'
import { Card, CardBody } from '@/app/components/ui/Card'
import { Button } from '@/app/components/ui/Buttons'
import Link from 'next/link'
import { StarIcon } from '@heroicons/react/24/solid'
import { UserIcon, CalendarIcon } from '@heroicons/react/24/outline'
import { Review } from '@/app/types'
import { motion } from 'framer-motion'
import { useAuth } from '@/app/contexts/AuthContext'
import { useRouter } from 'next/navigation'

export default function PractitionerReviewsPage() {
  const { user, isAuthenticated } = useAuth()
  const router = useRouter()
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    averageRating: 0,
    totalReviews: 0,
    fiveStarCount: 0
  })

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login')
      return
    }
    fetchReviews()
  }, [isAuthenticated, router])

  const fetchReviews = async () => {
    try {
      // Get all reviews and filter for this practitioner
      const data = await apiClient.reviews.getAll()
      const allReviews = Array.isArray(data) ? data : []
      
      // Filter to show reviews for this practitioner
      const practitionerReviews = allReviews.filter(r => r.practitioner === user?.id)
      setReviews(practitionerReviews)
      
      // Calculate stats
      if (practitionerReviews.length > 0) {
        const total = practitionerReviews.length
        const sum = practitionerReviews.reduce((acc, r) => acc + r.rating, 0)
        const fiveStar = practitionerReviews.filter(r => r.rating === 5).length
        
        setStats({
          averageRating: sum / total,
          totalReviews: total,
          fiveStarCount: fiveStar
        })
      }
    } catch (error) {
      console.error('Failed to fetch reviews:', error)
      setReviews([])
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-48 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
        <div className="grid gap-4 md:grid-cols-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-24 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"></div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Client Reviews</h1>
        <p className="text-gray-600 dark:text-gray-400">
          See what clients are saying about your practice
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardBody className="p-4 text-center">
            <p className="text-3xl font-bold text-emerald-600">
              {stats.averageRating.toFixed(1)}
            </p>
            <div className="flex justify-center gap-1 my-2">
              {[...Array(5)].map((_, i) => (
                <StarIcon 
                  key={i} 
                  className={`h-4 w-4 ${
                    i < Math.round(stats.averageRating) ? 'text-yellow-400' : 'text-gray-300'
                  }`} 
                />
              ))}
            </div>
            <p className="text-sm text-gray-500">Average Rating</p>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="p-4 text-center">
            <p className="text-3xl font-bold">{stats.totalReviews}</p>
            <p className="text-sm text-gray-500 mt-2">Total Reviews</p>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="p-4 text-center">
            <p className="text-3xl font-bold text-yellow-600">{stats.fiveStarCount}</p>
            <p className="text-sm text-gray-500 mt-2">5-Star Reviews</p>
          </CardBody>
        </Card>
      </div>

      {/* Reviews List */}
      <div className="space-y-3">
        {reviews.length > 0 ? (
          reviews.map((review, index) => (
            <motion.div
              key={review.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(index * 0.05, 0.5) }}
            >
              <Card>
                <CardBody className="p-4">
                  <div className="space-y-3">
                    {/* Client Info and Rating */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-full flex items-center justify-center text-white font-bold">
                          {review.reviewer_name?.[0] || 'C'}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {review.reviewer_name || 'Client'}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <div className="flex items-center gap-1">
                              {[...Array(5)].map((_, i) => (
                                <StarIcon 
                                  key={i} 
                                  className={`h-4 w-4 ${
                                    i < review.rating ? 'text-yellow-400' : 'text-gray-300'
                                  }`} 
                                />
                              ))}
                            </div>
                            <span className="text-xs text-gray-400">
                              • {new Date(review.created_at).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                      <Link href={`/practitioner/dashboard/consultations/${review.consultation}`}>
                        <Button size="sm" variant="outline">
                          View Consultation
                        </Button>
                      </Link>
                    </div>

                    {/* Review Comment */}
                    {review.comment && (
                      <div className="pl-13 sm:pl-16">
                        <p className="text-sm text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                          "{review.comment}"
                        </p>
                      </div>
                    )}
                  </div>
                </CardBody>
              </Card>
            </motion.div>
          ))
        ) : (
          <EmptyState />
        )}
      </div>
    </div>
  )
}

function EmptyState() {
  return (
    <div className="text-center py-12">
      <div className="text-5xl mb-4">⭐</div>
      <h3 className="text-lg font-semibold mb-2">No reviews yet</h3>
      <p className="text-sm text-gray-500 max-w-sm mx-auto">
        Reviews from clients will appear here once they complete consultations and leave feedback.
      </p>
    </div>
  )
}