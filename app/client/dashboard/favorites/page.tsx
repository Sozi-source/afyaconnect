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
  XMarkIcon
} from '@heroicons/react/24/outline'
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid'
import { Card, CardBody } from '@/app/components/ui/Card'
import { Button } from '@/app/components/ui/Buttons'
import { apiClient } from '@/app/lib/api'
import type { Practitioner } from '@/app/types'

interface ExtendedUser {
  id: number
  email: string
  role?: string
}

export default function FavoritesPage() {
  const { user, isAuthenticated } = useAuth()
  const router = useRouter()
  const extendedUser = user as ExtendedUser | null
  const [favorites, setFavorites] = useState<Practitioner[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login')
      return
    }
    
    if (extendedUser?.role !== 'client') {
      router.push('/client/dashboard')
      return
    }

    loadFavorites()
  }, [isAuthenticated, extendedUser, router])

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

      const allPractitioners = await apiClient.practitioners.getAll({ verified: true })
      const filtered = allPractitioners.filter(p => favoriteIds.includes(p.id))
      setFavorites(filtered)
    } catch (error: any) {
      console.error('Error loading favorites:', error)
      setError(error.message || 'Failed to load favorites')
    } finally {
      setLoading(false)
    }
  }

  const removeFavorite = (id: number) => {
    const savedFavorites = localStorage.getItem('favoritePractitioners')
    const favoriteIds = savedFavorites ? JSON.parse(savedFavorites) : []
    const newFavorites = favoriteIds.filter((favId: number) => favId !== id)
    localStorage.setItem('favoritePractitioners', JSON.stringify(newFavorites))
    setFavorites(prev => prev.filter(p => p.id !== id))
  }

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-4">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-4 border-emerald-200 border-t-emerald-600"></div>
          <p className="text-sm text-gray-600 dark:text-gray-400">Loading favorites...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="text-4xl sm:text-5xl mb-4">⚠️</div>
          <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Error loading favorites
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">{error}</p>
          <Button 
            onClick={loadFavorites} 
            variant="outline"
            className="inline-flex items-center justify-center px-4 py-2 text-sm border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            Try Again
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">
              My Favorites
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Your saved practitioners
            </p>
          </div>
          
          {favorites.length > 0 && (
            <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-500">
              {favorites.length} {favorites.length === 1 ? 'practitioner' : 'practitioners'} saved
            </div>
          )}
        </div>

        {/* Favorites Grid */}
        {favorites.length === 0 ? (
          <div className="text-center py-8 sm:py-12 lg:py-16 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800">
            <div className="text-4xl sm:text-5xl lg:text-6xl mb-3 sm:mb-4">❤️</div>
            <h3 className="text-base sm:text-lg lg:text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No favorites yet
            </h3>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 max-w-md mx-auto px-4 mb-6">
              Start adding practitioners to your favorites by clicking the heart icon on their profiles
            </p>
            <Link href="/client/dashboard/practitioners">
              <Button className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 sm:px-6 py-2 sm:py-2.5 text-xs sm:text-sm font-medium rounded-lg">
                Browse Practitioners
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
            {favorites.map((practitioner, index) => (
              <motion.div
                key={practitioner.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="h-full"
              >
                <Card className="h-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 hover:shadow-lg transition-all">
                  <CardBody className="p-3 sm:p-4 lg:p-5 flex flex-col h-full">
                    {/* Header with Remove Button */}
                    <div className="flex justify-between items-start gap-2 mb-3">
                      <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-full flex items-center justify-center text-white font-bold text-sm sm:text-base flex-shrink-0">
                          {practitioner.first_name?.[0]}{practitioner.last_name?.[0]}
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base truncate">
                            Dr. {practitioner.first_name} {practitioner.last_name}
                          </h3>
                          <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
                            {practitioner.specialties?.[0]?.name || 'General Practitioner'}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => removeFavorite(practitioner.id)}
                        className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors flex-shrink-0"
                        title="Remove from favorites"
                      >
                        <XMarkIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-gray-500 dark:text-gray-400" />
                      </button>
                    </div>

                    {/* Details - Improved text visibility */}
                    <div className="space-y-2 mb-3 sm:mb-4">
                      <div className="flex items-center text-xs text-gray-700 dark:text-gray-300">
                        <MapPinIcon className="h-3 w-3 sm:h-3.5 sm:w-3.5 mr-1.5 flex-shrink-0 text-gray-500 dark:text-gray-500" />
                        <span className="truncate">{practitioner.city || 'Location not specified'}</span>
                      </div>
                      <div className="flex items-center text-xs text-gray-700 dark:text-gray-300">
                        <CurrencyDollarIcon className="h-3 w-3 sm:h-3.5 sm:w-3.5 mr-1.5 flex-shrink-0 text-gray-500 dark:text-gray-500" />
                        <span>KES {practitioner.hourly_rate}/hr</span>
                      </div>
                      <div className="flex items-center text-xs text-gray-700 dark:text-gray-300">
                        <BriefcaseIcon className="h-3 w-3 sm:h-3.5 sm:w-3.5 mr-1.5 flex-shrink-0 text-gray-500 dark:text-gray-500" />
                        <span>{practitioner.years_of_experience} years experience</span>
                      </div>
                    </div>

                    {/* Rating Section */}
                    <div className="flex items-center mb-3 sm:mb-4">
                      <div className="flex gap-0.5">
                        {[1,2,3,4,5].map(star => (
                          <StarIcon 
                            key={star} 
                            className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-gray-300 dark:text-gray-600" 
                          />
                        ))}
                      </div>
                      <span className="text-xs text-gray-600 dark:text-gray-400 ml-2">
                        (0 reviews)
                      </span>
                    </div>

                    {/* Actions - Full width buttons on mobile */}
                    <div className="flex gap-2 mt-auto">
                      <Link 
                        href={`/dashboard/practitioners/${practitioner.id}`} 
                        className="flex-1"
                      >
                        <Button 
                          size="sm" 
                          variant="outline" 
                          fullWidth
                          className="text-xs sm:text-sm border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800"
                        >
                          View Profile
                        </Button>
                      </Link>
                      <Link 
                        href={`/dashboard/consultations/create?practitioner=${practitioner.id}`} 
                        className="flex-1"
                      >
                        <Button 
                          size="sm" 
                          fullWidth 
                          className="text-xs sm:text-sm bg-emerald-600 hover:bg-emerald-700 text-white"
                        >
                          Book
                        </Button>
                      </Link>
                    </div>
                  </CardBody>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}