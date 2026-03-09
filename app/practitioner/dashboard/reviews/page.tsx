// app/practitioner/dashboard/reviews/page.tsx
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
  const { user, isAuthenticated, isLoading: authLoading } = useAuth()
  const router = useRouter()
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [stats, setStats] = useState({
    averageRating: 0,
    totalReviews: 0,
    fiveStarCount: 0,
    fourStarCount: 0,
    threeStarCount: 0,
    twoStarCount: 0,
    oneStarCount: 0
  })

  useEffect(() => {
    if (!isAuthenticated && !authLoading) {
      router.push('/login')
      return
    }
    
    if (isAuthenticated && user) {
      fetchReviews()
    }
  }, [isAuthenticated, user, authLoading, router])

  const fetchReviews = async () => {
    if (!user?.id) return
    
    try {
      setLoading(true)
      setError(null)
      
      // CORRECT: Use the practitioner-specific endpoint
      // This assumes the practitioner ID is available
      const practitionerId = user.id // or user.practitioner?.id depending on your user object
      
      // Try to get reviews for this practitioner
      const data = await apiClient.reviews.getByPractitioner(practitionerId)
      const reviewsList = Array.isArray(data) ? data : []
      
      setReviews(reviewsList)
      
      // Calculate stats
      if (reviewsList.length > 0) {
        const total = reviewsList.length
        const sum = reviewsList.reduce((acc, r) => acc + r.rating, 0)
        
        setStats({
          averageRating: sum / total,
          totalReviews: total,
          fiveStarCount: reviewsList.filter(r => r.rating === 5).length,
          fourStarCount: reviewsList.filter(r => r.rating === 4).length,
          threeStarCount: reviewsList.filter(r => r.rating === 3).length,
          twoStarCount: reviewsList.filter(r => r.rating === 2).length,
          oneStarCount: reviewsList.filter(r => r.rating === 1).length
        })
      }
    } catch (error) {
      console.error('Failed to fetch reviews:', error)
      setError('Could not load reviews. Please try again later.')
      setReviews([])
    } finally {
      setLoading(false)
    }
  }

  // Alternative approach if getByPractitioner doesn't work
  const fetchReviewsFallback = async () => {
    try {
      // If the above fails, you might need to fetch consultations first
      // and then get reviews for each completed consultation
      const consultations = await apiClient.consultations.getMyPractitionerConsultations({ status: 'completed' })
      const consultationsList = Array.isArray(consultations) ? consultations : []
      
      // Then fetch reviews for each consultation that has one
      // This is more complex and would need backend support
    } catch (error) {
      console.error('Fallback also failed:', error)
    }
  }

  if (authLoading) {
    return <LoadingSkeleton />
  }

  if (!isAuthenticated) {
    return null
  }

  if (loading) {
    return <LoadingSkeleton />
  }

  if (error) {
    return (
      <div className="space-y-6">
        <ErrorState error={error} onRetry={fetchReviews} />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Client Reviews</h1>
        <p className="text-sm text-slate-500 mt-1">
          See what clients are saying about your practice
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <StatCard
          title="Average Rating"
          value={stats.averageRating.toFixed(1)}
          icon="⭐"
          color="text-amber-600"
        >
          <div className="flex justify-center gap-1 mt-2">
            {[...Array(5)].map((_, i) => (
              <StarIcon 
                key={i} 
                className={`h-4 w-4 ${
                  i < Math.round(stats.averageRating) ? 'text-amber-400' : 'text-slate-200'
                }`} 
              />
            ))}
          </div>
        </StatCard>

        <StatCard
          title="Total Reviews"
          value={stats.totalReviews}
          icon="📊"
          color="text-emerald-600"
        />

        <StatCard
          title="5-Star Reviews"
          value={stats.fiveStarCount}
          icon="🌟"
          color="text-yellow-600"
        />

        <StatCard
          title="Response Rate"
          value={`${stats.totalReviews > 0 ? Math.round((stats.fiveStarCount / stats.totalReviews) * 100) : 0}%`}
          icon="📈"
          color="text-purple-600"
        />
      </div>

      {/* Rating Distribution */}
      {stats.totalReviews > 0 && (
        <Card>
          <CardBody className="p-4">
            <h3 className="text-sm font-medium text-slate-700 mb-3">Rating Distribution</h3>
            <div className="space-y-2">
              <RatingBar label="5 stars" count={stats.fiveStarCount} total={stats.totalReviews} color="bg-amber-500" />
              <RatingBar label="4 stars" count={stats.fourStarCount} total={stats.totalReviews} color="bg-amber-400" />
              <RatingBar label="3 stars" count={stats.threeStarCount} total={stats.totalReviews} color="bg-amber-300" />
              <RatingBar label="2 stars" count={stats.twoStarCount} total={stats.totalReviews} color="bg-amber-200" />
              <RatingBar label="1 star" count={stats.oneStarCount} total={stats.totalReviews} color="bg-amber-100" />
            </div>
          </CardBody>
        </Card>
      )}

      {/* Reviews List */}
      <div className="space-y-3">
        {reviews.length > 0 ? (
          reviews.map((review, index) => (
            <ReviewCard key={review.id} review={review} index={index} />
          ))
        ) : (
          <EmptyState />
        )}
      </div>
    </div>
  )
}

// =============================================
// HELPER COMPONENTS
// =============================================

interface StatCardProps {
  title: string
  value: string | number
  icon: string
  color: string
  children?: React.ReactNode
}

function StatCard({ title, value, icon, color, children }: StatCardProps) {
  return (
    <Card>
      <CardBody className="p-4 text-center">
        <div className={`text-2xl mb-1`}>{icon}</div>
        <p className={`text-2xl font-bold ${color}`}>{value}</p>
        <p className="text-xs text-slate-500 mt-1">{title}</p>
        {children}
      </CardBody>
    </Card>
  )
}

interface RatingBarProps {
  label: string
  count: number
  total: number
  color: string
}

function RatingBar({ label, count, total, color }: RatingBarProps) {
  const percentage = total > 0 ? (count / total) * 100 : 0
  
  return (
    <div className="flex items-center gap-2 text-sm">
      <span className="w-16 text-slate-600">{label}</span>
      <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
        <div 
          className={`h-full ${color} rounded-full transition-all duration-500`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      <span className="w-12 text-right text-slate-600">{count}</span>
    </div>
  )
}

function ReviewCard({ review, index }: { review: Review; index: number }) {
  return (
    <motion.div
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
                <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-full flex items-center justify-center text-white font-bold shadow-sm">
                  {review.reviewer_name?.[0] || 'C'}
                </div>
                <div>
                  <p className="font-medium text-slate-800">
                    {review.reviewer_name || 'Client'}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <StarIcon 
                          key={i} 
                          className={`h-4 w-4 ${
                            i < review.rating ? 'text-amber-400' : 'text-slate-200'
                          }`} 
                        />
                      ))}
                    </div>
                    <span className="text-xs text-slate-400 flex items-center gap-1">
                      <CalendarIcon className="h-3 w-3" />
                      {new Date(review.created_at).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </span>
                  </div>
                </div>
              </div>
              <Link href={`/practitioner/dashboard/consultations/${review.consultation}`}>
                <Button size="sm" variant="outline" className="text-xs">
                  View Consultation
                </Button>
              </Link>
            </div>

            {/* Review Comment */}
            {review.comment && (
              <div className="pl-13 sm:pl-16">
                <p className="text-sm text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-100">
                  "{review.comment}"
                </p>
              </div>
            )}
          </div>
        </CardBody>
      </Card>
    </motion.div>
  )
}

function EmptyState() {
  return (
    <div className="text-center py-16 bg-white rounded-2xl border border-slate-200">
      <div className="text-6xl mb-4 animate-bounce">⭐</div>
      <h3 className="text-xl font-semibold text-slate-800 mb-2">No reviews yet</h3>
      <p className="text-sm text-slate-500 max-w-md mx-auto">
        Reviews from clients will appear here once they complete consultations and leave feedback.
      </p>
    </div>
  )
}

function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      <div className="h-8 w-48 bg-slate-200 rounded animate-pulse"></div>
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map(i => (
          <Card key={i}>
            <CardBody className="p-4">
              <div className="h-16 bg-slate-200 rounded animate-pulse"></div>
            </CardBody>
          </Card>
        ))}
      </div>
      <div className="space-y-3">
        {[1, 2, 3].map(i => (
          <Card key={i}>
            <CardBody className="p-4">
              <div className="h-20 bg-slate-200 rounded animate-pulse"></div>
            </CardBody>
          </Card>
        ))}
      </div>
    </div>
  )
}

function ErrorState({ error, onRetry }: { error: string; onRetry: () => void }) {
  return (
    <div className="text-center py-12">
      <div className="text-5xl mb-4">⚠️</div>
      <h3 className="text-lg font-semibold text-slate-800 mb-2">Unable to Load Reviews</h3>
      <p className="text-sm text-slate-500 mb-4">{error}</p>
      <Button onClick={onRetry} className="bg-emerald-600 hover:bg-emerald-700 text-white">
        Try Again
      </Button>
    </div>
  )
}