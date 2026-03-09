// app/components/client/dashboard/reviews/ReviewsPage.tsx
'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { StarIcon } from '@heroicons/react/24/solid'
import { PlusIcon, PencilIcon, SparklesIcon, XCircleIcon } from '@heroicons/react/24/outline'
import { useAuth } from '@/app/contexts/AuthContext'
import { Card, CardBody } from '@/app/components/ui/Card'
import { Button } from '@/app/components/ui/Buttons'
import { apiClient } from '@/app/lib/api'
import { extractResults } from '@/app/lib/utils'
import type { Review, Consultation } from '@/app/types'

export default function ReviewsPage() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth()
  const router = useRouter()
  const [isMounted, setIsMounted] = useState(false)
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState<Consultation[]>([])

  useEffect(() => setIsMounted(true), [])

  const fetchData = useCallback(async () => {
    if (!isMounted || !isAuthenticated || !user) return
    try {
      const [reviewsData, consultationsData] = await Promise.all([
        apiClient.reviews.getMyReviews(),
        apiClient.consultations.getAll({ status: 'completed' })
      ])
      setReviews(Array.isArray(reviewsData) ? reviewsData : [])
      setPending(extractResults<Consultation>(consultationsData).filter(c => !c.has_review))
    } catch (err) {
      setError('Failed to load reviews')
    } finally {
      setLoading(false)
    }
  }, [isMounted, isAuthenticated, user])

  useEffect(() => {
    if (isMounted && isAuthenticated && user) fetchData()
  }, [isMounted, isAuthenticated, user, fetchData])

  useEffect(() => {
    if (isMounted && !authLoading && !isAuthenticated) router.push('/login')
  }, [isMounted, authLoading, isAuthenticated, router])

  const averageRating = useMemo(() => {
    if (!reviews.length) return 0
    return (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
  }, [reviews])

  if (authLoading || !isMounted || loading) return <ReviewsLoading />
  if (!isAuthenticated || !user) return null
  if (error) return <ReviewsError error={error} onRetry={fetchData} />

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white py-6 sm:py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-6">
        <Header 
          reviewCount={reviews.length} 
          averageRating={averageRating} 
          pendingCount={pending.length} 
        />
        {pending.length > 0 && <PendingBanner count={pending.length} />}
        <div className="grid gap-4">
          {reviews.length ? (
            reviews.map((r, i) => <ReviewItem key={r.id} review={r} index={i} />)
          ) : (
            <EmptyState pendingCount={pending.length} />
          )}
        </div>
      </div>
    </div>
  )
}

const Header = ({ reviewCount, averageRating, pendingCount }: any) => (
  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
    <div>
      <div className="flex items-center gap-2 text-teal-600 mb-1">
        <SparklesIcon className="h-4 w-4" />
        <span className="text-xs font-medium uppercase">Feedback</span>
      </div>
      <h1 className="text-2xl sm:text-3xl font-light text-slate-800">
        My <span className="font-semibold text-teal-600">Reviews</span>
      </h1>
      <p className="text-sm text-slate-500 mt-1">{pendingCount} pending</p>
    </div>
    {reviewCount > 0 && (
      <div className="flex items-center gap-3">
        <div className="text-right">
          <div className="text-2xl font-bold text-slate-800">{averageRating}</div>
          <div className="flex items-center gap-1">
            {[...Array(5)].map((_, i) => (
              <StarIcon key={i} className={`h-3 w-3 ${i < Math.round(Number(averageRating)) ? 'text-amber-400' : 'text-slate-200'}`} />
            ))}
          </div>
        </div>
        <div className="h-8 w-px bg-slate-200" />
        <div className="text-right">
          <div className="text-2xl font-bold text-slate-800">{reviewCount}</div>
          <div className="text-xs text-slate-500">Total</div>
        </div>
      </div>
    )}
  </div>
)

const PendingBanner = ({ count }: { count: number }) => (
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
            {count} completed consultation{count > 1 ? 's' : ''} waiting for review
          </p>
          <p className="text-xs text-slate-500 mt-1">Share your feedback to help others</p>
        </div>
      </div>
      <Link href="/client/dashboard/reviews/create">
        <Button className="bg-amber-600 hover:bg-amber-700 text-white whitespace-nowrap">
          <PlusIcon className="h-4 w-4 mr-2" />
          Write Review{count > 1 ? 's' : ''}
        </Button>
      </Link>
    </div>
  </motion.div>
)

const ReviewItem = ({ review, index }: { review: Review; index: number }) => (
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

const EmptyState = ({ pendingCount }: { pendingCount: number }) => (
  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
    className="text-center py-16 bg-white rounded-2xl border border-slate-200 shadow-sm"
  >
    <div className="w-20 h-20 bg-teal-50 rounded-full flex items-center justify-center mx-auto mb-4">
      <StarIcon className="h-8 w-8 text-teal-400" />
    </div>
    <h3 className="text-lg font-semibold text-slate-800 mb-2">No reviews yet</h3>
    <p className="text-sm text-slate-500 max-w-sm mx-auto px-4">
      {pendingCount ? "Complete consultations waiting for feedback!" : "Complete a consultation to share your experience."}
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

const ReviewsLoading = () => (
  <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white py-6 sm:py-8">
    <div className="max-w-4xl mx-auto px-4 sm:px-6">
      <div className="mb-8 animate-pulse">
        <div className="h-4 w-24 bg-slate-200 rounded mb-2" />
        <div className="h-8 w-48 bg-slate-200 rounded" />
      </div>
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-white rounded-2xl border border-slate-200 p-5">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-slate-200 rounded-full animate-pulse" />
              <div className="flex-1">
                <div className="h-5 w-32 bg-slate-200 rounded animate-pulse mb-2" />
                <div className="h-4 w-24 bg-slate-200 rounded animate-pulse" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
)

const ReviewsError = ({ error, onRetry }: { error: string; onRetry: () => void }) => (
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