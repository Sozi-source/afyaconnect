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
      router.push('/dashboard')
      return
    }

    loadFavorites()
  }, [isAuthenticated, extendedUser, router])

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

      // Fetch all practitioners and filter
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
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-emerald-200 border-t-emerald-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-5xl mb-4">⚠️</div>
        <h3 className="text-lg font-semibold mb-2">Error loading favorites</h3>
        <p className="text-sm text-gray-500 mb-4">{error}</p>
        <Button onClick={loadFavorites} variant="outline">
          Try Again
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">My Favorites</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Your saved practitioners
        </p>
      </div>

      {/* Favorites Grid */}
      {favorites.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-5xl mb-4">❤️</div>
          <h3 className="text-lg font-semibold mb-2">No favorites yet</h3>
          <p className="text-sm text-gray-500 mb-4">
            Start adding practitioners to your favorites
          </p>
          <Link href="/dashboard/practitioners">
            <Button className="bg-emerald-600 hover:bg-emerald-700 text-white">
              Browse Practitioners
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {favorites.map((practitioner, index) => (
            <motion.div
              key={practitioner.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card hoverable>
                <CardBody className="p-4">
                  {/* Header with Remove Button */}
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                        {practitioner.first_name?.[0]}{practitioner.last_name?.[0]}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                          Dr. {practitioner.first_name} {practitioner.last_name}
                        </h3>
                        <p className="text-xs text-gray-500">
                          {practitioner.specialties[0]?.name || 'General Practitioner'}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => removeFavorite(practitioner.id)}
                      className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
                    >
                      <XMarkIcon className="h-4 w-4 text-gray-400" />
                    </button>
                  </div>

                  {/* Details */}
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-xs text-gray-600 dark:text-gray-400">
                      <MapPinIcon className="h-3 w-3 mr-1" />
                      {practitioner.city || 'Location not specified'}
                    </div>
                    <div className="flex items-center text-xs text-gray-600 dark:text-gray-400">
                      <CurrencyDollarIcon className="h-3 w-3 mr-1" />
                      KES {practitioner.hourly_rate}/hr
                    </div>
                    <div className="flex items-center text-xs text-gray-600 dark:text-gray-400">
                      <BriefcaseIcon className="h-3 w-3 mr-1" />
                      {practitioner.years_of_experience} years exp
                    </div>
                  </div>

                  {/* Rating - This would come from reviews API */}
                  <div className="flex items-center mb-4">
                    {[1,2,3,4,5].map(star => (
                      <StarIcon key={star} className="h-4 w-4 text-gray-300" />
                    ))}
                    <span className="text-xs text-gray-500 ml-2">(0 reviews)</span>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Link href={`/dashboard/practitioners/${practitioner.id}`} className="flex-1">
                      <Button size="sm" variant="outline" fullWidth>
                        View Profile
                      </Button>
                    </Link>
                    <Link href={`/dashboard/consultations/create?practitioner=${practitioner.id}`} className="flex-1">
                      <Button size="sm" fullWidth className="bg-emerald-600 hover:bg-emerald-700 text-white">
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
  )
}