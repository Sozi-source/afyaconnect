// app/components/practitioners/PractitionerReviews.tsx
'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  StarIcon,
  UserCircleIcon,
  CalendarIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  SparklesIcon
} from '@heroicons/react/24/outline'
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid'
import { apiClient } from '@/app/lib/api'
import type { Review } from '@/app/types'

interface PractitionerReviewsProps {
  practitionerId: number
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  const now = new Date()
  const diffTime = Math.abs(now.getTime() - date.getTime())
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  
  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7) return `${diffDays} days ago`
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`
  return `${Math.floor(diffDays / 365)} years ago`
}

const RatingBar = ({ rating, count, total }: { rating: number; count: number; total: number }) => {
  const percentage = total > 0 ? (count / total) * 100 : 0
  
  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-slate-500 w-8">{rating} ★</span>
      <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.5 }}
          className="h-full bg-amber-400 rounded-full"
        />
      </div>
      <span className="text-sm text-slate-500 w-8">{count}</span>
    </div>
  )
}

export function PractitionerReviews({ practitionerId }: PractitionerReviewsProps) {
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [sortBy, setSortBy] = useState<'recent' | 'highest' | 'lowest'>('recent')
  const [filterRating, setFilterRating] = useState<number | null>(null)
  const [showFilters, setShowFilters] = useState(false)
  const [displayCount, setDisplayCount] = useState(3)

  useEffect(() => {
    const loadReviews = async () => {
      try {
        const data = await apiClient.reviews.getByPractitioner(practitionerId)
        setReviews(Array.isArray(data) ? data : [])
      } catch (error) {
        console.error('Failed to load reviews:', error)
      } finally {
        setLoading(false)
      }
    }
    loadReviews()
  }, [practitionerId])

  const stats = {
    total: reviews.length,
    average: reviews.length 
      ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
      : '0.0',
    distribution: [5, 4, 3, 2, 1].map(rating => ({
      rating,
      count: reviews.filter(r => Math.floor(r.rating) === rating).length
    }))
  }

  const filteredReviews = reviews
    .filter(r => filterRating ? Math.floor(r.rating) === filterRating : true)
    .sort((a, b) => {
      if (sortBy === 'recent') return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      if (sortBy === 'highest') return b.rating - a.rating
      return a.rating - b.rating
    })

  const displayedReviews = filteredReviews.slice(0, displayCount)
  const hasMore = filteredReviews.length > displayCount

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-8">
        <div className="flex flex-col items-center justify-center py-8">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-emerald-100 border-t-emerald-600 rounded-full animate-spin" />
            <StarIcon className="w-6 h-6 text-emerald-600 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
          </div>
          <p className="mt-4 text-sm text-slate-500">Loading reviews...</p>
        </div>
      </div>
    )
  }

  if (reviews.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-8 text-center">
        <div className="w-20 h-20 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <StarIcon className="w-10 h-10 text-emerald-600" />
        </div>
        <h3 className="text-xl font-semibold text-slate-800 mb-2">No Reviews Yet</h3>
        <p className="text-sm text-slate-500 max-w-sm mx-auto">
          Be the first to share your experience with this practitioner.
        </p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-amber-500 to-orange-500 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
            <StarIconSolid className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-white">Patient Reviews</h2>
            <p className="text-sm text-amber-100">Real feedback from real patients</p>
          </div>
        </div>

        {/* Rating Summary */}
        <div className="flex flex-col sm:flex-row items-center gap-6 text-white">
          <div className="text-center">
            <div className="text-4xl font-bold">{stats.average}</div>
            <div className="flex items-center gap-1 mt-1">
              {[...Array(5)].map((_, i) => (
                <StarIconSolid
                  key={i}
                  className={`w-4 h-4 ${i < Math.round(Number(stats.average)) ? 'text-white' : 'text-amber-200'}`}
                />
              ))}
            </div>
            <div className="text-sm text-amber-100 mt-1">{stats.total} reviews</div>
          </div>
          
          <div className="flex-1 space-y-1.5 w-full">
            {stats.distribution.map(({ rating, count }) => (
              <RatingBar key={rating} rating={rating} count={count} total={stats.total} />
            ))}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="p-5 border-b border-slate-200">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center justify-between w-full text-sm font-medium text-slate-700"
        >
          <span>Filter & Sort Reviews</span>
          {showFilters ? <ChevronUpIcon className="w-4 h-4" /> : <ChevronDownIcon className="w-4 h-4" />}
        </button>

        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="pt-4 space-y-4">
                {/* Sort */}
                <div>
                  <label className="text-xs text-slate-500 mb-2 block">Sort by</label>
                  <div className="flex gap-2">
                    {[
                      { value: 'recent', label: 'Most Recent' },
                      { value: 'highest', label: 'Highest Rated' },
                      { value: 'lowest', label: 'Lowest Rated' }
                    ].map(option => (
                      <button
                        key={option.value}
                        onClick={() => setSortBy(option.value as any)}
                        className={`
                          flex-1 py-2 px-3 rounded-lg text-xs font-medium transition-all
                          ${sortBy === option.value
                            ? 'bg-emerald-600 text-white shadow-md'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }
                        `}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Filter by rating */}
                <div>
                  <label className="text-xs text-slate-500 mb-2 block">Filter by rating</label>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setFilterRating(null)}
                      className={`
                        px-3 py-1.5 rounded-lg text-xs font-medium transition-all
                        ${filterRating === null
                          ? 'bg-emerald-600 text-white'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }
                      `}
                    >
                      All
                    </button>
                    {[5, 4, 3, 2, 1].map(rating => (
                      <button
                        key={rating}
                        onClick={() => setFilterRating(rating)}
                        className={`
                          px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1
                          ${filterRating === rating
                            ? 'bg-emerald-600 text-white'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }
                        `}
                      >
                        {rating} <StarIconSolid className="w-3 h-3" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Reviews List */}
      <div className="p-5 space-y-4 max-h-[500px] overflow-y-auto">
        {displayedReviews.map((review, index) => (
          <motion.div
            key={review.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="group relative bg-slate-50 rounded-xl p-4 hover:shadow-md transition-all"
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                  {review.client_name?.[0] || 'U'}
                </div>
                <div>
                  <p className="font-medium text-slate-800">{review.client_name || 'Anonymous'}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <div className="flex items-center gap-0.5">
                      {[...Array(5)].map((_, i) => (
                        <StarIconSolid
                          key={i}
                          className={`w-3 h-3 ${i < review.rating ? 'text-amber-400' : 'text-slate-200'}`}
                        />
                      ))}
                    </div>
                    <span className="text-xs text-slate-400">•</span>
                    <span className="text-xs text-slate-400">{formatDate(review.created_at)}</span>
                  </div>
                </div>
              </div>
              
              {/* Verified Badge */}
              <div className="px-2 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-medium">
                Verified
              </div>
            </div>

            {/* Comment */}
            {review.comment && (
              <div className="pl-13">
                <p className="text-sm text-slate-600 italic leading-relaxed">
                  "{review.comment}"
                </p>
              </div>
            )}

            {/* Footer */}
            <div className="mt-3 flex items-center gap-3 text-xs text-slate-400">
              <span className="flex items-center gap-1">
                <CalendarIcon className="w-3 h-3" />
                Consultation on {review.consultation_date || 'N/A'}
              </span>
            </div>
          </motion.div>
        ))}

        {/* Load More */}
        {hasMore && (
          <button
            onClick={() => setDisplayCount(prev => prev + 3)}
            className="w-full py-3 mt-2 text-sm font-medium text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-xl transition-colors"
          >
            Show More Reviews
          </button>
        )}
      </div>

      {/* Footer */}
      <div className="p-4 bg-slate-50 border-t border-slate-200">
        <div className="flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <SparklesIcon className="w-4 h-4 text-emerald-600" />
            <span>All reviews are from verified patients</span>
          </div>
          <span>{filteredReviews.length} of {reviews.length} shown</span>
        </div>
      </div>
    </div>
  )
}