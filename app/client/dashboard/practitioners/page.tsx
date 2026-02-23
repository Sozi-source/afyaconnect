'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/app/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { 
  MagnifyingGlassIcon,
  FunnelIcon,
  MapPinIcon,
  CurrencyDollarIcon,
  BriefcaseIcon,
  StarIcon,
  HeartIcon
} from '@heroicons/react/24/outline'
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid'
import { Card, CardBody } from '@/app/components/ui/Card'
import { Button } from '@/app/components/ui/Buttons'
import { apiClient } from '@/app/lib/api'
import type { Practitioner, Specialty } from '@/app/types'

interface ExtendedUser {
  id: number
  email: string
  role?: string
}

export default function PractitionersPage() {
  const { user, isAuthenticated } = useAuth()
  const router = useRouter()
  const extendedUser = user as ExtendedUser | null
  const [practitioners, setPractitioners] = useState<Practitioner[]>([])
  const [specialties, setSpecialties] = useState<Specialty[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedSpecialty, setSelectedSpecialty] = useState('')
  const [selectedCity, setSelectedCity] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [favorites, setFavorites] = useState<number[]>([])

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login')
      return
    }
    
    fetchData()
    loadFavorites()
  }, [isAuthenticated, router])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [practitionersData, specialtiesData] = await Promise.all([
        apiClient.practitioners.getAll({ verified: true }),
        apiClient.specialties.getAll()
      ])
      setPractitioners(practitionersData)
      setSpecialties(specialtiesData)
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadFavorites = () => {
    const saved = localStorage.getItem('favoritePractitioners')
    if (saved) {
      setFavorites(JSON.parse(saved))
    }
  }

  const toggleFavorite = (id: number) => {
    const newFavorites = favorites.includes(id)
      ? favorites.filter(f => f !== id)
      : [...favorites, id]
    setFavorites(newFavorites)
    localStorage.setItem('favoritePractitioners', JSON.stringify(newFavorites))
  }

  const filteredPractitioners = practitioners.filter(p => {
    const matchesSearch = p.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         p.bio?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesSpecialty = !selectedSpecialty || 
                            p.specialties?.some(s => s.id.toString() === selectedSpecialty)
    const matchesCity = !selectedCity || 
                       p.city?.toLowerCase().includes(selectedCity.toLowerCase())
    return matchesSearch && matchesSpecialty && matchesCity
  })

  const cities = [...new Set(practitioners.map(p => p.city).filter(Boolean))]

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-4">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-4 border-emerald-200 border-t-emerald-600"></div>
          <p className="text-sm text-gray-600 dark:text-gray-400">Loading practitioners...</p>
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
              Find Health Experts
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Browse our network of verified practitioners
            </p>
          </div>
          
          {/* Results count moved here for better visibility */}
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-500">
            {filteredPractitioners.length} practitioners found
          </p>
        </div>

        {/* Search Bar - Fixed visibility */}
        <div className="relative mb-4">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-gray-500 dark:text-gray-400" />
          <input
            type="text"
            placeholder="Search by name or specialty..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 sm:pl-10 pr-20 py-2.5 sm:py-3 text-sm border border-gray-300 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`absolute right-2 top-1/2 transform -translate-y-1/2 p-1.5 sm:p-2 rounded-lg transition-colors ${
              showFilters 
                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300' 
                : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            <FunnelIcon className="h-4 w-4" />
          </button>
        </div>

        {/* Filters - Improved visibility */}
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-900 rounded-xl p-4 sm:p-5 shadow-lg border border-gray-200 dark:border-gray-800 mb-6"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Specialty
                </label>
                <select
                  value={selectedSpecialty}
                  onChange={(e) => setSelectedSpecialty(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="">All Specialties</option>
                  {specialties.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Location
                </label>
                <select
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="">All Cities</option>
                  {cities.map(city => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </select>
              </div>
              <div className="flex items-end">
                <Button
                  variant="outline"
                  size="sm"
                  fullWidth
                  onClick={() => {
                    setSelectedSpecialty('')
                    setSelectedCity('')
                  }}
                  className="text-sm border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  Clear Filters
                </Button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Practitioners Grid */}
        {filteredPractitioners.length === 0 ? (
          <div className="text-center py-8 sm:py-12 lg:py-16 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800">
            <div className="text-4xl sm:text-5xl lg:text-6xl mb-3 sm:mb-4">🔍</div>
            <h3 className="text-base sm:text-lg lg:text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No practitioners found
            </h3>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 max-w-md mx-auto px-4">
              Try adjusting your search filters or browse all practitioners
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSearchTerm('')
                setSelectedSpecialty('')
                setSelectedCity('')
              }}
              className="mt-4 text-sm border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300"
            >
              Clear All Filters
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
            {filteredPractitioners.map((practitioner, index) => (
              <motion.div
                key={practitioner.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="h-full"
              >
                <Card className="h-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 hover:shadow-lg transition-all">
                  <CardBody className="p-3 sm:p-4 lg:p-5 flex flex-col h-full">
                    {/* Header with Favorite */}
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
                        onClick={() => toggleFavorite(practitioner.id)}
                        className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors flex-shrink-0"
                      >
                        <HeartIcon 
                          className={`h-4 w-4 sm:h-5 sm:w-5 ${
                            favorites.includes(practitioner.id) 
                              ? 'text-red-500 fill-red-500' 
                              : 'text-gray-500 dark:text-gray-500'
                          }`} 
                        />
                      </button>
                    </div>

                    {/* Details - Improved text visibility */}
                    <div className="space-y-2 mb-3">
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
                        <span>{practitioner.years_of_experience} years exp</span>
                      </div>
                    </div>

                    {/* Specialties - Better visibility */}
                    {practitioner.specialties && practitioner.specialties.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-3">
                        {practitioner.specialties.slice(0, 2).map(s => (
                          <span key={s.id} className="px-2 py-1 bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300 rounded-full text-xs font-medium">
                            {s.name}
                          </span>
                        ))}
                        {practitioner.specialties.length > 2 && (
                          <span className="px-2 py-1 bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 rounded-full text-xs font-medium">
                            +{practitioner.specialties.length - 2}
                          </span>
                        )}
                      </div>
                    )}

                    {/* Rating - Fixed visibility */}
                    <div className="flex items-center mb-3 sm:mb-4">
                      <div className="flex gap-0.5">
                        {[1,2,3,4,5].map(star => (
                          star <= 4 ? (
                            <StarIconSolid key={star} className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-yellow-400" />
                          ) : (
                            <StarIcon key={star} className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-gray-300 dark:text-gray-600" />
                          )
                        ))}
                      </div>
                      <span className="text-xs text-gray-600 dark:text-gray-400 ml-2">(4.0)</span>
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