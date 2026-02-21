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
    
    if (extendedUser?.role !== 'client') {
      router.push('/dashboard')
      return
    }

    fetchData()
    loadFavorites()
  }, [isAuthenticated, extendedUser, router])

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
    const matchesSearch = p.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         p.bio?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesSpecialty = !selectedSpecialty || 
                            p.specialties.some(s => s.id.toString() === selectedSpecialty)
    const matchesCity = !selectedCity || 
                       p.city.toLowerCase().includes(selectedCity.toLowerCase())
    return matchesSearch && matchesSpecialty && matchesCity
  })

  const cities = [...new Set(practitioners.map(p => p.city).filter(Boolean))]

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-emerald-200 border-t-emerald-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Find Health Experts</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Browse our network of verified practitioners
        </p>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search by name or specialty..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-sm"
        />
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1.5 bg-gray-100 dark:bg-gray-700 rounded-lg"
        >
          <FunnelIcon className="h-4 w-4 text-gray-600 dark:text-gray-300" />
        </button>
      </div>

      {/* Filters */}
      {showFilters && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700 space-y-3"
        >
          <div>
            <label className="text-xs font-medium text-gray-500">Specialty</label>
            <select
              value={selectedSpecialty}
              onChange={(e) => setSelectedSpecialty(e.target.value)}
              className="w-full mt-1 px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-sm"
            >
              <option value="">All Specialties</option>
              {specialties.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-gray-500">Location</label>
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="w-full mt-1 px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-sm"
            >
              <option value="">All Cities</option>
              {cities.map(city => (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>
          </div>
          <Button
            variant="outline"
            size="sm"
            fullWidth
            onClick={() => {
              setSelectedSpecialty('')
              setSelectedCity('')
            }}
          >
            Clear Filters
          </Button>
        </motion.div>
      )}

      {/* Results Count */}
      <p className="text-sm text-gray-500">
        Found {filteredPractitioners.length} practitioners
      </p>

      {/* Practitioners Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredPractitioners.map((practitioner, index) => (
          <motion.div
            key={practitioner.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <Card hoverable>
              <CardBody className="p-4">
                {/* Header with Favorite */}
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
                    onClick={() => toggleFavorite(practitioner.id)}
                    className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
                  >
                    <HeartIcon 
                      className={`h-5 w-5 ${
                        favorites.includes(practitioner.id) 
                          ? 'text-red-500 fill-red-500' 
                          : 'text-gray-400'
                      }`} 
                    />
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

                {/* Specialties */}
                {practitioner.specialties.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-4">
                    {practitioner.specialties.slice(0, 2).map(s => (
                      <span key={s.id} className="px-2 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs">
                        {s.name}
                      </span>
                    ))}
                    {practitioner.specialties.length > 2 && (
                      <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">
                        +{practitioner.specialties.length - 2}
                      </span>
                    )}
                  </div>
                )}

                {/* Rating */}
                <div className="flex items-center mb-4">
                  {[1,2,3,4,5].map(star => (
                    star <= 4 ? (
                      <StarIconSolid key={star} className="h-4 w-4 text-yellow-400" />
                    ) : (
                      <StarIcon key={star} className="h-4 w-4 text-gray-300" />
                    )
                  ))}
                  <span className="text-xs text-gray-500 ml-2">(4.0)</span>
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

      {/* Empty State */}
      {filteredPractitioners.length === 0 && (
        <div className="text-center py-12">
          <div className="text-5xl mb-4">🔍</div>
          <h3 className="text-lg font-semibold mb-2">No practitioners found</h3>
          <p className="text-sm text-gray-500">Try adjusting your filters</p>
        </div>
      )}
    </div>
  )
}