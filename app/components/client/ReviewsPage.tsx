// app/components/client/dashboard/reviews/ReviewsPage.tsx
'use client'

import { useState, useEffect } from 'react'
import { apiClient } from '@/app/lib/api'
import { Card, CardBody } from '@/app/components/ui/Card'
import { Button } from '@/app/components/ui/Buttons'
import Link from 'next/link'
import { StarIcon } from '@heroicons/react/24/solid'
import { PlusIcon, PencilIcon, SparklesIcon } from '@heroicons/react/24/outline'
import { Review, Consultation } from '@/app/types'
import { motion } from 'framer-motion'
import { useAuth } from '@/app/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { extractResults } from '@/app/lib/utils'

export default function ReviewsPage() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth()
  const router = useRouter()
  const [isMounted, setIsMounted] = useState(false)
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [pendingConsultations, setPendingConsultations] = useState<Consultation[]>([])

  // ⚠️ CRITICAL: This must be called BEFORE any conditional returns
  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Handle auth loading - MUST be first return
  if (authLoading || !isMounted) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-teal-200 border-t-teal-600"></div>
          <p className="text-sm text-slate-500">Loading...</p>
        </div>
      </div>
    )
  }

  // Redirect if not authenticated - MUST be second check
  if (!isAuthenticated || !user) {
    router.push('/login')
    return null
  }

  // Data fetching effect - runs after auth is confirmed
  useEffect(() => {
    Promise.all([fetchReviews(), fetchPendingConsultations()])
  }, [])

  const fetchReviews = async () => {
    try {
      const data = await apiClient.reviews.getMyReviews()
      setReviews(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Failed to fetch reviews:', error)
      setReviews([])
    } finally {
      setLoading(false)
    }
  }

  const fetchPendingConsultations = async () => {
    try {
      const data = await apiClient.consultations.getAll({ status: 'completed' })
      const completedConsultations = extractResults<Consultation>(data)
      const pending = completedConsultations.filter(c => !c.has_review)
      setPendingConsultations(pending)
    } catch (error) {
      console.error('Failed to fetch pending reviews:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-teal-200 border-t-teal-600"></div>
          <p className="text-sm text-slate-500">Loading reviews...</p>
        </div>
      </div>
    )
  }

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
          {pendingConsultations.length > 0 && (
            <Link href="/client/dashboard/reviews/create?consultation=pending" className="w-full sm:w-auto">
              <Button className="w-full sm:w-auto bg-teal-600 hover:bg-teal-700 text-white shadow-sm relative">
                <PlusIcon className="h-4 w-4 mr-2" />
                Write a Review
                <span className="absolute -top-2 -right-2 bg-rose-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center shadow-sm">
                  {pendingConsultations.length}
                </span>
              </Button>
            </Link>
          )}
        </div>

        {/* Reviews Grid */}
        <div className="grid gap-4">
          {reviews.length > 0 ? (
            reviews.map((review, index) => (
              <motion.div key={review.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(index * 0.05, 0.5) }}
              >
                <Link href={`/client/dashboard/reviews/${review.id}`}>
                  <Card className="border-slate-200/60 hover:border-teal-200 transition-all cursor-pointer">
                    <CardBody className="p-5">
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-teal-600 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-sm">
                              {review.practitioner_name?.[0] || 'DR'}
                            </div>
                            <div>
                              <p className="font-medium text-slate-800">Dr. {review.practitioner_name || 'Practitioner'}</p>
                              <div className="flex items-center gap-1 mt-1">
                                {[...Array(5)].map((_, i) => (
                                  <StarIcon key={i} className={`h-4 w-4 ${i < review.rating ? 'text-amber-400' : 'text-slate-200'}`} />
                                ))}
                              </div>
                            </div>
                          </div>
                          {review.comment && (
                            <p className="text-sm text-slate-600 mt-2 pl-[52px]">"{review.comment}"</p>
                          )}
                        </div>
                        <div className="flex items-center gap-3 pl-[52px] sm:pl-0">
                          <span className="text-xs text-slate-400">
                            {new Date(review.created_at).toLocaleDateString('en-US', {
                              month: 'short', day: 'numeric', year: 'numeric'
                            })}
                          </span>
                          <PencilIcon className="h-4 w-4 text-slate-300 hover:text-teal-600 transition-colors" />
                        </div>
                      </div>
                    </CardBody>
                  </Card>
                </Link>
              </motion.div>
            ))
          ) : (
            <EmptyState pendingCount={pendingConsultations.length} />
          )}
        </div>
      </div>
    </div>
  )
}

function EmptyState({ pendingCount }: { pendingCount: number }) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
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
        <Link href="/client/dashboard/reviews/create?consultation=pending" className="inline-block mt-6">
          <Button className="bg-teal-600 hover:bg-teal-700 text-white shadow-sm">
            Write Your First Review
          </Button>
        </Link>
      )}
    </motion.div>
  )
}