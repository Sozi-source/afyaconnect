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
  const { user, isAuthenticated, isLoading: authLoading } = useAuth()
  const router = useRouter()
  const [isMounted, setIsMounted] = useState(false)
  const [favorites, setFavorites] = useState<Practitioner[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // ALWAYS add this mounting check first
  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Handle auth loading - MUST be first return
  if (authLoading || !isMounted) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-200 border-t-primary-600"></div>
      </div>
    )
  }

  // Redirect if not authenticated - MUST be second check
  if (!isAuthenticated || !user) {
    router.push('/login')
    return null
  }

  // Data fetching - runs after auth is confirmed
  useEffect(() => {
    loadFavorites()
  }, [])

  const loadFavorites = async () => {
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
  }

  const removeFavorite = (id: number) => {
    const updated = favorites.filter(f => f.id !== id)
    setFavorites(updated)
    localStorage.setItem('favoritePractitioners', JSON.stringify(updated.map(f => f.id)))
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
      <div className="flex items-center justify-center min-h-[60vh] p-4">
        <Card className="border-neutral-200 max-w-md w-full">
          <CardBody className="p-8 text-center">
            <XMarkIcon className="h-12 w-12 text-red-500 mx-auto mb-4" />
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
    <div className="space-y-6 px-4 py-4 sm:py-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">My Favorite Practitioners</h1>
          <p className="text-sm text-neutral-500 mt-1">Your saved practitioners for quick booking</p>
        </div>
      </div>

      {favorites.length === 0 ? (
        <Card className="border-neutral-200">
          <CardBody className="py-16 px-6 text-center">
            <HeartIcon className="h-12 w-12 text-neutral-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-neutral-900 mb-2">No Favorites Yet</h3>
            <p className="text-sm text-neutral-500 mb-6">Start adding practitioners to your favorites</p>
            <Link href="/client/dashboard/practitioners">
              <Button className="bg-primary-600 hover:bg-primary-700 text-white">Browse Practitioners</Button>
            </Link>
          </CardBody>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {favorites.map((practitioner, index) => (
            <motion.div key={practitioner.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}>
              <Card className="border-neutral-200 hover:border-primary-200 transition-all">
                <CardBody className="p-5">
                  <div className="flex justify-end mb-2">
                    <button onClick={() => removeFavorite(practitioner.id)} className="p-1 hover:bg-red-50 rounded-full">
                      <XMarkIcon className="h-5 w-5 text-red-500" />
                    </button>
                  </div>
                  <Link href={`/client/dashboard/practitioners/${practitioner.id}`}>
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center text-white font-bold">
                        {practitioner.first_name?.[0]}{practitioner.last_name?.[0]}
                      </div>
                      <div>
                        <h3 className="font-semibold text-neutral-900">Dr. {practitioner.first_name} {practitioner.last_name}</h3>
                        <p className="text-xs text-neutral-500">{practitioner.city || 'No location'}</p>
                      </div>
                    </div>
                    <div className="flex justify-between text-sm mb-4">
                      <span>{practitioner.years_of_experience || 0} years</span>
                      <span className="text-primary-600 font-medium">{formatCurrency(practitioner.hourly_rate || 0)}</span>
                    </div>
                    <Button size="sm" fullWidth className="bg-primary-600 hover:bg-primary-700 text-white">
                      Book Appointment
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