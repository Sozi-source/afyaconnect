// app/components/client/dashboard/reviews/ReviewsPage.tsx
'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { apiClient } from '@/app/lib/api'
import { Card, CardBody } from '@/app/components/ui/Card'
import { Button } from '@/app/components/ui/Buttons'
import Link from 'next/link'
import { StarIcon } from '@heroicons/react/24/solid'
import { PlusIcon, PencilIcon, SparklesIcon, XCircleIcon } from '@heroicons/react/24/outline'
import { Review, Consultation } from '@/app/types'
import { motion } from 'framer-motion'
import { useAuth } from '@/app/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { extractResults } from '@/app/lib/utils'

export default function ReviewsPage() {
  // =============================================
  // 1. ALL HOOKS FIRST - UNCONDITIONALLY
  // =============================================
  const { user, isAuthenticated, isLoading: authLoading } = useAuth()
  const router = useRouter()
  const [isMounted, setIsMounted] = useState(false)
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [pendingConsultations, setPendingConsultations] = useState<Consultation[]>([])

  // Memoized fetch functions
  const fetchReviews = useCallback(async () => {
    if (!isAuthenticated || !user || !isMounted) return
    
    try {
      const data = await apiClient.reviews.getMyReviews()
      setReviews(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Failed to fetch reviews:', error)
      setError('Failed to load reviews')
    }
  }, [isAuthenticated, user, isMounted])

  const fetchPendingConsultations = useCallback(async () => {
    if (!isAuthenticated || !user || !isMounted) return
    
    try {
      const data = await apiClient.consultations.getAll({ status: 'completed' })
      const completedConsultations = extractResults<Consultation>(data)
      const pending = completedConsultations.filter(c => !c.has_review)
      setPendingConsultations(pending)
    } catch (error) {
      console.error('Failed to fetch pending reviews:', error)
    }
  }, [isAuthenticated, user, isMounted])

  // Mount effect
  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Data fetching effect
  useEffect(() => {
    if (isMounted && isAuthenticated && user) {
      Promise.all([fetchReviews(), fetchPendingConsultations()])
        .finally(() => setLoading(false))
    }
  }, [isMounted, isAuthenticated, user, fetchReviews, fetchPendingConsultations])

  // Redirect effect
  useEffect(() => {
    if (isMounted && !authLoading && !isAuthenticated) {
      router.push('/login')
    }
  }, [isMounted, authLoading, isAuthenticated, router])

  // Memoized average rating
  const averageRating = useMemo(() => {
    if (reviews.length === 0) return 0
    const sum = reviews.reduce((acc, r) => acc + r.rating, 0)
    return (sum / reviews.length).toFixed(1)
  }, [reviews])

  // =============================================
  // 2. EARLY RETURNS (after all hooks)
  // =============================================
  if (authLoading || !isMounted) {
    return <LoadingSkeleton />
  }

  if (!isAuthenticated || !user) {
    return null // Redirect happens in useEffect
  }

  if (loading) {
    return <LoadingSkeleton />
  }

  if (error) {
    return <ErrorState error={error} onRetry={() => {
      setLoading(true)
      Promise.all([fetchReviews(), fetchPendingConsultations()])
        .finally(() => setLoading(false))
    }} />
  }

  // =============================================
  // 3. RENDER COMPONENT
  // =============================================
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white py-6 sm:py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-teal-600 mb-1">
              <SparklesIcon className="h-4 w-4" />
              <span className="text-xs font-medium uppercase tracking-wider">Feedback</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-light text-slate-800">
              My <span className="font-semibold text-teal-600">Reviews</span>
            </h1>
            <p className="text-sm text-slate-500 mt-1">Share your experience with practitioners</p>
          </div>
          
          {/* Stats */}
          {reviews.length > 0 && (
            <div className="flex items-center gap-3">
              <div className="text-right">
                <div className="text-2xl font-bold text-slate-800">{averageRating}</div>
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <StarIcon key={i} className={`h-3 w-3 ${i < Math.round(Number(averageRating)) ? 'text-amber-400' : 'text-slate-200'}`} />
                  ))}
                </div>
              </div>
              <div className="h-8 w-px bg-slate-200"></div>
              <div className="text-right">
                <div className="text-2xl font-bold text-slate-800">{reviews.length}</div>
                <div className="text-xs text-slate-500">Total Reviews</div>
              </div>
            </div>
          )}
        </div>

        {/* Write Review Button */}
        {pendingConsultations.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl p-4 border border-amber-200"
          >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-100 rounded-full">
                  <StarIcon className="h-5 w-5 text-amber-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-800">
                    You have {pendingConsultations.length} completed consultation{pendingConsultations.length > 1 ? 's' : ''} waiting for your review
                  </p>
                  <p className="text-xs text-slate-500 mt-1">Share your feedback to help others</p>
                </div>
              </div>
              <Link href="/client/dashboard/reviews/create">
                <Button className="bg-amber-600 hover:bg-amber-700 text-white whitespace-nowrap">
                  <PlusIcon className="h-4 w-4 mr-2" />
                  Write Review{pendingConsultations.length > 1 ? 's' : ''}
                </Button>
              </Link>
            </div>
          </motion.div>
        )}

        {/* Reviews Grid */}
        <div className="grid gap-4">
          {reviews.length > 0 ? (
            reviews.map((review, index) => (
              <ReviewCard key={review.id} review={review} index={index} />
            ))
          ) : (
            <EmptyState pendingCount={pendingConsultations.length} />
          )}
        </div>
      </div>
    </div>
  )
}

// =============================================
// HELPER COMPONENTS
// =============================================

function ReviewCard({ review, index }: { review: Review; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.05, 0.5) }}
    >
      <Link href={`/client/dashboard/reviews/${review.id}`}>
        <Card className="border-slate-200/60 hover:border-teal-200 hover:shadow-md transition-all cursor-pointer group">
          <CardBody className="p-5">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-teal-600 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-sm">
                    {review.practitioner_name?.[0] || 'DR'}
                  </div>
                  <div>
                    <p className="font-semibold text-slate-800 group-hover:text-teal-600 transition-colors">
                      Dr. {review.practitioner_name || 'Practitioner'}
                    </p>
                    <div className="flex items-center gap-1 mt-1">
                      {[...Array(5)].map((_, i) => (
                        <StarIcon key={i} className={`h-4 w-4 ${i < review.rating ? 'text-amber-400' : 'text-slate-200'}`} />
                      ))}
                    </div>
                  </div>
                </div>
                {review.comment && (
                  <div className="pl-[60px]">
                    <p className="text-sm text-slate-600 italic bg-slate-50 p-3 rounded-xl">
                      "{review.comment}"
                    </p>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-3 pl-[60px] sm:pl-0">
                <span className="text-xs text-slate-400 bg-slate-50 px-3 py-1 rounded-full">
                  {new Date(review.created_at).toLocaleDateString('en-US', {
                    month: 'short', day: 'numeric', year: 'numeric'
                  })}
                </span>
                <PencilIcon className="h-4 w-4 text-slate-300 group-hover:text-teal-600 transition-colors" />
              </div>
            </div>
          </CardBody>
        </Card>
      </Link>
    </motion.div>
  )
}

function EmptyState({ pendingCount }: { pendingCount: number }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} 
      animate={{ opacity: 1, y: 0 }}
      className="text-center py-16 bg-white rounded-2xl border border-slate-200 shadow-sm"
    >
      <div className="w-20 h-20 bg-teal-50 rounded-full flex items-center justify-center mx-auto mb-4">
        <StarIcon className="h-8 w-8 text-teal-400" />
      </div>
      <h3 className="text-lg font-semibold text-slate-800 mb-2">No reviews yet</h3>
      <p className="text-sm text-slate-500 max-w-sm mx-auto px-4">
        {pendingCount > 0 
          ? "You have completed consultations waiting for your feedback!"
          : "Complete a consultation to share your experience."}
      </p>
      {pendingCount > 0 && (
        <Link href="/client/dashboard/reviews/create">
          <Button className="bg-teal-600 hover:bg-teal-700 text-white mt-6">
            Write Your First Review
          </Button>
        </Link>
      )}
    </motion.div>
  )
}

function LoadingSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white py-6 sm:py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        {/* Header Skeleton */}
        <div className="mb-8 animate-pulse">
          <div className="h-4 w-24 bg-slate-200 rounded mb-2"></div>
          <div className="h-8 w-48 bg-slate-200 rounded"></div>
        </div>

        {/* Cards Skeleton */}
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="border-slate-200">
              <CardBody className="p-5">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-slate-200 rounded-full animate-pulse"></div>
                  <div className="flex-1">
                    <div className="h-5 w-32 bg-slate-200 rounded animate-pulse mb-2"></div>
                    <div className="h-4 w-24 bg-slate-200 rounded animate-pulse"></div>
                  </div>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}

function ErrorState({ error, onRetry }: { error: string; onRetry: () => void }) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex items-center justify-center p-4">
      <Card className="max-w-md w-full border-neutral-200">
        <CardBody className="p-8 text-center">
          <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <XCircleIcon className="h-8 w-8 text-red-500" />
          </div>
          <h2 className="text-xl font-semibold text-slate-800 mb-2">Unable to Load Reviews</h2>
          <p className="text-slate-500 mb-6">{error}</p>
          <Button onClick={onRetry} className="bg-teal-600 hover:bg-teal-700 text-white">
            Try Again
          </Button>
        </CardBody>
      </Card>
    </div>
  )
}