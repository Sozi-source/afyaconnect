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
  XMarkIcon
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
      
      // Get favorite IDs from localStorage
      const savedFavorites = localStorage.getItem('favoritePractitioners')
      const favoriteIds = savedFavorites ? JSON.parse(savedFavorites) : []
      
      if (favoriteIds.length === 0) {
        setFavorites([])
        return
      }

      // Fetch all practitioners
      const response = await apiClient.practitioners.getAll({ verified: true })
      
      // Handle both PaginatedResponse and array
      let practitionersList: Practitioner[] = []
      if (Array.isArray(response)) {
        practitionersList = response
      } else if (response && 'results' in response) {
        practitionersList = response.results
      }

      // Filter to only favorites
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
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-emerald-200 border-t-emerald-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card>
          <CardBody className="p-8 text-center">
            <XMarkIcon className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Error Loading Favorites</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
            <Button onClick={loadFavorites}>Try Again</Button>
          </CardBody>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">My Favorite Practitioners</h1>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          Your saved practitioners for quick booking
        </p>
      </div>

      {/* Favorites Grid */}
      {favorites.length === 0 ? (
        <Card>
          <CardBody className="p-12 text-center">
            <HeartIcon className="h-16 w-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Favorites Yet</h3>
            <p className="text-sm text-gray-500 mb-6">
              Start adding practitioners to your favorites for quick access
            </p>
            <Link href="/client/dashboard/practitioners">
              <Button>Browse Practitioners</Button>
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
              transition={{ delay: index * 0.05 }}
            >
              <Card className="relative group">
                <button
                  onClick={() => removeFavorite(practitioner.id)}
                  className="absolute top-3 right-3 p-1.5 bg-white dark:bg-gray-800 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition"
                >
                  <XMarkIcon className="h-4 w-4 text-red-500" />
                </button>
                <CardBody className="p-4">
                  <Link href={`/client/dashboard/practitioners/${practitioner.id}`}>
                    <div className="flex items-start gap-3 mb-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                        {practitioner.first_name?.[0]}{practitioner.last_name?.[0]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold truncate">
                          Dr. {practitioner.first_name} {practitioner.last_name}
                        </h3>
                        <div className="flex items-center gap-1 mt-1">
                          <MapPinIcon className="h-3 w-3 text-gray-400" />
                          <span className="text-xs text-gray-500 truncate">
                            {practitioner.city || 'Location N/A'}
                          </span>
                        </div>
                      </div>
                      <HeartIconSolid className="h-5 w-5 text-red-500" />
                    </div>

                    <div className="flex items-center justify-between text-sm mb-3">
                      <div className="flex items-center gap-1">
                        <BriefcaseIcon className="h-4 w-4 text-gray-400" />
                        <span>{practitioner.years_of_experience} years</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <CurrencyDollarIcon className="h-4 w-4 text-gray-400" />
                        <span>{formatPrice(practitioner.hourly_rate)}</span>
                      </div>
                    </div>

                    {practitioner.specialties && practitioner.specialties.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-3">
                        {practitioner.specialties.slice(0, 2).map(s => (
                          <span
                            key={s.id}
                            className="px-2 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs"
                          >
                            {s.name}
                          </span>
                        ))}
                        {practitioner.specialties.length > 2 && (
                          <span className="text-xs text-gray-500">
                            +{practitioner.specialties.length - 2}
                          </span>
                        )}
                      </div>
                    )}

                    <Button
                      size="sm"
                      fullWidth
                      className="bg-emerald-600 hover:bg-emerald-700 text-white"
                    >
                      Book Again
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