'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/app/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  HeartIcon,
  MapPinIcon,
  CurrencyDollarIcon,
  BriefcaseIcon,
  XMarkIcon,
  ChevronRightIcon,
  StarIcon
} from '@heroicons/react/24/outline'
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid'
import { Card, CardBody } from '@/app/components/ui/Card'
import { Button } from '@/app/components/ui/Buttons'
import { apiClient } from '@/app/lib/api'
import { extractResults, formatCurrency } from '@/app/lib/utils'
import type { Practitioner } from '@/app/types'

export default function FavoritesPage() {
  // =============================================
  // 1. ALL HOOKS FIRST - UNCONDITIONALLY
  // =============================================
  const { user, isAuthenticated, isLoading: authLoading } = useAuth()
  const router = useRouter()
  const [isMounted, setIsMounted] = useState(false)
  const [favorites, setFavorites] = useState<Practitioner[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Memoize loadFavorites function
  const loadFavorites = useCallback(async () => {
    if (!isAuthenticated || !user || !isMounted) return
    
    try {
      setLoading(true)
      setError(null)
      
      const savedFavorites = localStorage.getItem('favoritePractitioners')
      const favoriteIds = savedFavorites ? JSON.parse(savedFavorites) : []
      
      if (favoriteIds.length === 0) {
        setFavorites([])
        setLoading(false)
        return
      }

      const response = await apiClient.practitioners.getAll()
      const practitionersList = extractResults<Practitioner>(response)
      const filtered = practitionersList.filter(p => favoriteIds.includes(p.id))
      setFavorites(filtered)
    } catch (error: any) {
      console.error('Error loading favorites:', error)
      setError(error.message || 'Failed to load favorites')
    } finally {
      setLoading(false)
    }
  }, [isAuthenticated, user, isMounted])

  const removeFavorite = useCallback((id: number) => {
    setFavorites(prev => {
      const updated = prev.filter(f => f.id !== id)
      localStorage.setItem('favoritePractitioners', JSON.stringify(updated.map(f => f.id)))
      return updated
    })
  }, [])

  // Mount effect
  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Data fetching effect - now unconditional
  useEffect(() => {
    if (isMounted && isAuthenticated && user) {
      loadFavorites()
    }
  }, [isMounted, isAuthenticated, user, loadFavorites])

  // Redirect effect - handle navigation in useEffect
  useEffect(() => {
    if (isMounted && !authLoading && !isAuthenticated) {
      router.push('/login')
    }
  }, [isMounted, authLoading, isAuthenticated, router])

  // =============================================
  // 2. EARLY RETURNS (after all hooks)
  // =============================================
  if (authLoading || !isMounted) {
    return <LoadingSkeleton />
  }

  if (!isAuthenticated || !user) {
    return null // Redirect happens in useEffect above
  }

  if (loading) {
    return <LoadingSkeleton />
  }

  if (error) {
    return <ErrorState error={error} onRetry={loadFavorites} />
  }

  // =============================================
  // 3. RENDER COMPONENT
  // =============================================
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 text-rose-500 mb-2">
              <HeartIconSolid className="h-5 w-5" />
              <span className="text-sm font-medium">Your favorites</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-light text-slate-800 tracking-tight">
              Saved <span className="font-semibold text-rose-500">Practitioners</span>
            </h1>
          </div>
          <div className="text-sm text-slate-500 bg-white border border-slate-200 px-4 py-2 rounded-full shadow-sm">
            {favorites.length} {favorites.length === 1 ? 'favorite' : 'favorites'}
          </div>
        </div>

        {/* Content */}
        {favorites.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {favorites.map((practitioner, index) => (
              <FavoriteCard 
                key={practitioner.id} 
                practitioner={practitioner} 
                index={index}
                onRemove={removeFavorite}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// =============================================
// HELPER COMPONENTS
// =============================================

function FavoriteCard({ practitioner, index, onRemove }: { 
  practitioner: Practitioner; 
  index: number;
  onRemove: (id: number) => void;
}) {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      whileHover={{ y: -4 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      <Card className="relative border border-slate-200/60 hover:border-rose-200 hover:shadow-lg transition-all group overflow-hidden">
        {/* Remove button */}
        <button
          onClick={() => onRemove(practitioner.id)}
          className="absolute top-3 right-3 p-2 bg-white/80 backdrop-blur-sm rounded-full shadow-sm hover:bg-rose-50 transition-all z-10"
          aria-label="Remove from favorites"
        >
          <XMarkIcon className="h-4 w-4 text-rose-500" />
        </button>

        <CardBody className="p-6">
          {/* Avatar and name */}
          <Link href={`/client/dashboard/practitioners/${practitioner.id}`}>
            <div className="flex items-center gap-4 mb-4">
              <div className="relative">
                <div className="w-16 h-16 bg-gradient-to-br from-rose-500 to-rose-600 rounded-2xl flex items-center justify-center text-white font-bold text-xl shadow-lg">
                  {practitioner.first_name?.[0]}{practitioner.last_name?.[0]}
                </div>
                {isHovered && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full border-2 border-white"
                  />
                )}
              </div>
              <div>
                <h3 className="font-semibold text-slate-800 text-lg group-hover:text-rose-600 transition-colors">
                  Dr. {practitioner.first_name} {practitioner.last_name}
                </h3>
                <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                  <MapPinIcon className="h-3 w-3" />
                  {practitioner.city || 'Location not specified'}
                </p>
              </div>
            </div>

            {/* Details */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="p-3 bg-slate-50 rounded-xl">
                <p className="text-xs text-slate-500 mb-1">Experience</p>
                <p className="font-semibold text-slate-800">
                  {practitioner.years_of_experience || 0} years
                </p>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl">
                <p className="text-xs text-slate-500 mb-1">Rate</p>
                <p className="font-semibold text-rose-600">
                  {formatCurrency(practitioner.hourly_rate || 0)}
                </p>
              </div>
            </div>

            {/* Specialties */}
            {practitioner.specialties && practitioner.specialties.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-4">
                {practitioner.specialties.slice(0, 2).map(s => (
                  <span 
                    key={s.id} 
                    className="px-3 py-1.5 bg-rose-50 text-rose-700 rounded-full text-xs font-medium"
                  >
                    {s.name}
                  </span>
                ))}
                {practitioner.specialties.length > 2 && (
                  <span className="px-3 py-1.5 bg-slate-100 text-slate-600 rounded-full text-xs font-medium">
                    +{practitioner.specialties.length - 2}
                  </span>
                )}
              </div>
            )}

            {/* Book button */}
            <Link href={`/client/dashboard/consultations/book?practitioner=${practitioner.id}`}>
              <Button 
                size="sm" 
                fullWidth 
                className="bg-rose-500 hover:bg-rose-600 text-white transition-all"
              >
                Book Appointment
              </Button>
            </Link>
          </Link>
        </CardBody>
      </Card>
    </motion.div>
  )
}

function EmptyState() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      <Card className="border-slate-200/60">
        <CardBody className="py-20 px-6 text-center">
          <div className="w-24 h-24 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <HeartIcon className="h-10 w-10 text-rose-400" />
          </div>
          <h3 className="text-2xl font-semibold text-slate-800 mb-3">No Favorites Yet</h3>
          <p className="text-slate-500 mb-8 max-w-md mx-auto">
            Start exploring practitioners and add them to your favorites for quick access
          </p>
          <Link href="/client/dashboard/practitioners">
            <Button className="bg-rose-500 hover:bg-rose-600 text-white px-8 py-3 text-base">
              Browse Practitioners
              <ChevronRightIcon className="h-5 w-5 ml-2" />
            </Button>
          </Link>
        </CardBody>
      </Card>
    </motion.div>
  )
}

function LoadingSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Header Skeleton */}
        <div className="mb-8 animate-pulse">
          <div className="h-4 w-24 bg-slate-200 rounded mb-2"></div>
          <div className="h-10 w-64 bg-slate-200 rounded"></div>
        </div>

        {/* Grid Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="border-slate-200/60">
              <CardBody className="p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 bg-slate-200 rounded-2xl animate-pulse"></div>
                  <div className="flex-1">
                    <div className="h-5 w-32 bg-slate-200 rounded animate-pulse mb-2"></div>
                    <div className="h-4 w-24 bg-slate-200 rounded animate-pulse"></div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="h-16 bg-slate-200 rounded-xl animate-pulse"></div>
                  <div className="h-16 bg-slate-200 rounded-xl animate-pulse"></div>
                </div>
                <div className="h-10 w-full bg-slate-200 rounded animate-pulse"></div>
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
            <XMarkIcon className="h-8 w-8 text-red-500" />
          </div>
          <h2 className="text-xl font-semibold text-slate-800 mb-2">Unable to Load Favorites</h2>
          <p className="text-slate-500 mb-6">{error}</p>
          <Button 
            onClick={onRetry} 
            className="bg-rose-500 hover:bg-rose-600 text-white"
          >
            Try Again
          </Button>
        </CardBody>
      </Card>
    </div>
  )
}