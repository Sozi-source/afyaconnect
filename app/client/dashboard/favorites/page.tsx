// app/client/dashboard/favorites/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/app/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  HeartIcon,
  MapPinIcon,
  CurrencyDollarIcon,
  BriefcaseIcon,
  StarIcon,
  UserIcon,
  XMarkIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline'
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid'
import { Card, CardBody } from '@/app/components/ui/Card'
import { Button } from '@/app/components/ui/Buttons'
import { apiClient } from '@/app/lib/api'
import type { Practitioner, PaginatedResponse } from '@/app/types'

export default function FavoritesPage() {
  const { user, isAuthenticated } = useAuth()
  const router = useRouter()
  const [favorites, setFavorites] = useState<Practitioner[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login')
      return
    }
    loadFavorites()
  }, [isAuthenticated, router])

  const loadFavorites = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const savedFavorites = localStorage.getItem('favoritePractitioners')
      const favoriteIds = savedFavorites ? JSON.parse(savedFavorites) : []
      
      if (favoriteIds.length === 0) {
        setFavorites([])
        return
      }

      const response = await apiClient.practitioners.getAll({ verified: true })
      
      let practitionersList: Practitioner[] = []
      if (Array.isArray(response)) {
        practitionersList = response
      } else if (response && 'results' in response) {
        practitionersList = response.results
      }

      const filtered = practitionersList.filter(p => favoriteIds.includes(p.id))
      setFavorites(filtered)
    } catch (error: any) {
      console.error('Error loading favorites:', error)
      setError(error.message || 'Failed to load favorites')
    } finally {
      setLoading(false)
    }
  }

  const removeFavorite = (id: number) => {
    const updated = favorites.filter(f => f.id !== id)
    setFavorites(updated)
    localStorage.setItem('favoritePractitioners', JSON.stringify(updated.map(f => f.id)))
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-200 border-t-primary-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="border-neutral-200 max-w-md w-full">
          <CardBody className="p-8 text-center">
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <XMarkIcon className="h-8 w-8 text-red-600" />
            </div>
            <h3 className="text-lg font-semibold text-neutral-900 mb-2">Error Loading Favorites</h3>
            <p className="text-neutral-500 mb-6">{error}</p>
            <Button onClick={loadFavorites} className="bg-primary-600 hover:bg-primary-700 text-white">
              Try Again
            </Button>
          </CardBody>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-neutral-900">My Favorite Practitioners</h1>
        <p className="text-sm text-neutral-500 mt-1">
          Your saved practitioners for quick booking
        </p>
      </div>

      {/* Favorites Grid */}
      {favorites.length === 0 ? (
        <Card className="border-neutral-200">
          <CardBody className="py-16 px-6 text-center">
            <div className="w-20 h-20 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <HeartIcon className="h-10 w-10 text-neutral-400" />
            </div>
            <h3 className="text-lg font-semibold text-neutral-900 mb-2">No Favorites Yet</h3>
            <p className="text-sm text-neutral-500 mb-6 max-w-sm mx-auto">
              Start adding practitioners to your favorites for quick access
            </p>
            <Link href="/client/dashboard/practitioners">
              <Button className="bg-primary-600 hover:bg-primary-700 text-white">
                Browse Practitioners
              </Button>
            </Link>
          </CardBody>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {favorites.map((practitioner, index) => (
            <motion.div
              key={practitioner.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(index * 0.05, 0.5) }}
              className="relative group"
            >
              <Card className="border-neutral-200 hover:border-primary-200 transition-all">
                <button
                  onClick={() => removeFavorite(practitioner.id)}
                  className="absolute top-3 right-3 z-10 p-2 bg-white rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-all hover:bg-red-50"
                  aria-label="Remove from favorites"
                >
                  <XMarkIcon className="h-4 w-4 text-red-500" />
                </button>
                <CardBody className="p-5">
                  <Link href={`/client/dashboard/practitioners/${practitioner.id}`}>
                    <div className="flex items-start gap-3 mb-4">
                      <div className="w-14 h-14 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-sm flex-shrink-0">
                        {practitioner.first_name?.[0]}{practitioner.last_name?.[0]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-neutral-900 truncate">
                          Dr. {practitioner.first_name} {practitioner.last_name}
                        </h3>
                        <div className="flex items-center gap-1 mt-1">
                          <MapPinIcon className="h-3 w-3 text-neutral-400" />
                          <span className="text-xs text-neutral-500 truncate">
                            {practitioner.city || 'Location N/A'}
                          </span>
                        </div>
                      </div>
                      <HeartIconSolid className="h-5 w-5 text-red-500 flex-shrink-0" />
                    </div>

                    <div className="flex items-center justify-between text-sm mb-4">
                      <div className="flex items-center gap-1">
                        <BriefcaseIcon className="h-4 w-4 text-neutral-400" />
                        <span className="text-neutral-600">{practitioner.years_of_experience} years</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <CurrencyDollarIcon className="h-4 w-4 text-neutral-400" />
                        <span className="text-primary-600 font-medium">{formatPrice(practitioner.hourly_rate)}</span>
                      </div>
                    </div>

                    {practitioner.specialties && practitioner.specialties.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-4">
                        {practitioner.specialties.slice(0, 2).map(s => (
                          <span
                            key={s.id}
                            className="px-2.5 py-1 bg-primary-50 text-primary-700 rounded-full text-xs font-medium"
                          >
                            {s.name}
                          </span>
                        ))}
                        {practitioner.specialties.length > 2 && (
                          <span className="px-2.5 py-1 bg-neutral-100 text-neutral-600 rounded-full text-xs font-medium">
                            +{practitioner.specialties.length - 2}
                          </span>
                        )}
                      </div>
                    )}

                    <Button
                      size="sm"
                      fullWidth
                      className="bg-primary-600 hover:bg-primary-700 text-white group-hover:shadow-md transition-all"
                    >
                      <span>Book Again</span>
                      <ChevronRightIcon className="h-4 w-4 ml-1" />
                    </Button>
                  </Link>
                </CardBody>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}