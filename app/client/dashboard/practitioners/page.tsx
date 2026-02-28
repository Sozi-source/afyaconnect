// app/client/dashboard/practitioners/page.tsx
'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { useAuth } from '@/app/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  MagnifyingGlassIcon,
  FunnelIcon,
  MapPinIcon,
  CurrencyDollarIcon,
  BriefcaseIcon,
  HeartIcon,
  XMarkIcon,
  AdjustmentsHorizontalIcon,
  SparklesIcon,
  StarIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline'
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid'
import { Card, CardBody } from '@/app/components/ui/Card'
import { Button } from '@/app/components/ui/Buttons'
import { apiClient } from '@/app/lib/api'
import { extractResults, formatCurrency } from '@/app/lib/utils'
import type { Practitioner, Specialty } from '@/app/types'

export default function PractitionersPage() {
  const { user, isAuthenticated } = useAuth()
  const router = useRouter()
  const [practitioners, setPractitioners] = useState<Practitioner[]>([])
  const [specialties, setSpecialties] = useState<Specialty[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>('')
  const [selectedCity, setSelectedCity] = useState<string>('')
  const [showFilters, setShowFilters] = useState(false)
  const [favorites, setFavorites] = useState<number[]>([])
  const [error, setError] = useState<string | null>(null)

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
      setError(null)
      
      const [practitionersData, specialtiesData] = await Promise.allSettled([
        apiClient.practitioners.getAll(),
        apiClient.specialties.getAll()
      ])
      
      if (practitionersData.status === 'fulfilled') {
        const practitionersList = extractResults<Practitioner>(practitionersData.value)
        setPractitioners(practitionersList)
      } else {
        console.error('Error fetching practitioners:', practitionersData.reason)
        setError('Failed to load practitioners')
      }
      
      if (specialtiesData.status === 'fulfilled') {
        const specialtiesList = extractResults<Specialty>(specialtiesData.value)
        setSpecialties(specialtiesList)
      } else {
        console.error('Error fetching specialties:', specialtiesData.reason)
      }
      
    } catch (error: any) {
      console.error('Error fetching data:', error)
      setError(error.message || 'Failed to load practitioners')
    } finally {
      setLoading(false)
    }
  }

  const loadFavorites = useCallback(() => {
    try {
      const saved = localStorage.getItem('favoritePractitioners')
      if (saved) {
        setFavorites(JSON.parse(saved))
      }
    } catch (error) {
      console.error('Error loading favorites:', error)
    }
  }, [])

  const toggleFavorite = useCallback((id: number) => {
    setFavorites(prev => {
      const newFavorites = prev.includes(id)
        ? prev.filter(f => f !== id)
        : [...prev, id]
      localStorage.setItem('favoritePractitioners', JSON.stringify(newFavorites))
      return newFavorites
    })
  }, [])

  const filteredPractitioners = useMemo(() => 
    practitioners.filter(p => {
      if (!p) return false
      
      const fullName = `${p.first_name || ''} ${p.last_name || ''}`.toLowerCase()
      const matchesSearch = !searchTerm || 
        fullName.includes(searchTerm.toLowerCase()) ||
        (p.bio && p.bio.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (p.specialties && p.specialties.some(s => s?.name?.toLowerCase().includes(searchTerm.toLowerCase())))
      
      const matchesSpecialty = !selectedSpecialty || 
        (p.specialties && p.specialties.some(s => s?.id?.toString() === selectedSpecialty))
      
      const matchesCity = !selectedCity || 
        (p.city && p.city.toLowerCase() === selectedCity.toLowerCase())
      
      return matchesSearch && matchesSpecialty && matchesCity
    }),
    [practitioners, searchTerm, selectedSpecialty, selectedCity]
  )

  const cities = useMemo(() => 
    [...new Set(
      practitioners
        .filter(p => p && p.city)
        .map(p => p.city as string)
    )].sort(),
    [practitioners]
  )

  const clearFilters = useCallback(() => {
    setSearchTerm('')
    setSelectedSpecialty('')
    setSelectedCity('')
  }, [])

  const activeFilterCount = useMemo(() => {
    let count = 0
    if (searchTerm) count++
    if (selectedSpecialty) count++
    if (selectedCity) count++
    return count
  }, [searchTerm, selectedSpecialty, selectedCity])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-teal-200 border-t-teal-600"></div>
          <p className="text-sm text-slate-500">Loading practitioners...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-4xl">⚠️</span>
          </div>
          <h3 className="text-lg font-semibold text-slate-800 mb-2">
            Something went wrong
          </h3>
          <p className="text-sm text-slate-500 mb-6">{error}</p>
          <Button onClick={fetchData} className="bg-teal-600 hover:bg-teal-700 text-white shadow-lg shadow-teal-200/50">
            Try Again
          </Button>
        </div>
      </div>
    )
  }

  if (practitioners.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center max-w-md">
          <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-5xl">👨‍⚕️</span>
          </div>
          <h3 className="text-xl font-semibold text-slate-800 mb-2">
            No Practitioners Found
          </h3>
          <p className="text-sm text-slate-500">
            There are no practitioners available at the moment. Please check back later.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-10">
        {/* Header with decorative elements */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 text-teal-600 mb-2">
              <SparklesIcon className="h-5 w-5" />
              <span className="text-sm font-medium">Expert network</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-light text-slate-800 tracking-tight">
              Find Health <span className="font-semibold text-teal-600">Experts</span>
            </h1>
            <p className="text-base text-slate-500 mt-2">
              Browse our network of verified practitioners
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="text-sm text-slate-500 bg-white border border-slate-200 px-4 py-2 rounded-full shadow-sm">
              {filteredPractitioners.length} of {practitioners.length} found
            </div>
            {activeFilterCount > 0 && (
              <button
                onClick={clearFilters}
                className="p-2 bg-white border border-slate-200 rounded-full hover:bg-slate-50 transition-colors shadow-sm"
                aria-label="Clear filters"
              >
                <XMarkIcon className="h-4 w-4 text-slate-500" />
              </button>
            )}
          </div>
        </div>

        {/* Search and Filter Bar */}
        <div className="relative mb-8">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name, specialty, or keywords..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-36 py-4 text-base border border-slate-200 rounded-2xl bg-white text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 shadow-sm transition-shadow"
            />
            <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`p-2.5 rounded-xl transition-all ${
                  showFilters 
                    ? 'bg-teal-100 text-teal-600' 
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
                aria-label="Toggle filters"
              >
                <AdjustmentsHorizontalIcon className="h-5 w-5" />
              </button>
              {activeFilterCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-teal-600 text-white text-xs font-medium rounded-full h-5 w-5 flex items-center justify-center shadow-sm">
                  {activeFilterCount}
                </span>
              )}
            </div>
          </div>

          {/* Filters Panel */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl border border-slate-200 p-6 z-10"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Specialty
                    </label>
                    <select
                      value={selectedSpecialty}
                      onChange={(e) => setSelectedSpecialty(e.target.value)}
                      className="w-full px-4 py-3 text-sm border border-slate-200 rounded-xl bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500"
                    >
                      <option value="">All Specialties</option>
                      {specialties.map(s => (
                        <option key={s.id} value={s.id.toString()}>{s.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Location
                    </label>
                    <select
                      value={selectedCity}
                      onChange={(e) => setSelectedCity(e.target.value)}
                      className="w-full px-4 py-3 text-sm border border-slate-200 rounded-xl bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500"
                    >
                      <option value="">All Cities</option>
                      {cities.map(city => (
                        <option key={city} value={city}>{city}</option>
                      ))}
                    </select>
                  </div>
                </div>
                
                <div className="flex justify-end mt-6 pt-4 border-t border-slate-200">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={clearFilters}
                    className="text-sm border-slate-200 text-slate-600 hover:bg-slate-50"
                  >
                    Clear All Filters
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Practitioners Grid */}
        {filteredPractitioners.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16 bg-white rounded-2xl border border-slate-200 shadow-sm"
          >
            <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-5xl">🔍</span>
            </div>
            <h3 className="text-xl font-semibold text-slate-800 mb-2">
              No practitioners match your filters
            </h3>
            <p className="text-sm text-slate-500 max-w-md mx-auto px-4">
              Try adjusting your search filters to see more results
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={clearFilters}
              className="mt-6 border-slate-200 text-slate-600 hover:bg-slate-50"
            >
              Clear All Filters
            </Button>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPractitioners.map((practitioner, index) => (
              <motion.div
                key={practitioner.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(index * 0.05, 0.5) }}
                className="h-full"
              >
                <Card className="h-full bg-white border border-slate-200/60 hover:border-teal-200 hover:shadow-lg transition-all group">
                  <CardBody className="p-6 flex flex-col h-full">
                    {/* Header with gradient avatar */}
                    <div className="flex justify-between items-start gap-3 mb-4">
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div className="w-14 h-14 bg-gradient-to-br from-teal-500 to-teal-600 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-sm flex-shrink-0">
                          {practitioner.first_name?.[0] || ''}{practitioner.last_name?.[0] || ''}
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="font-semibold text-slate-800 text-base sm:text-lg truncate group-hover:text-teal-700 transition-colors">
                            Dr. {practitioner.first_name} {practitioner.last_name}
                          </h3>
                          <p className="text-xs text-slate-500 truncate">
                            {practitioner.specialties?.[0]?.name || 'General Practitioner'}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => toggleFavorite(practitioner.id)}
                        className="p-2 hover:bg-slate-100 rounded-full transition-colors flex-shrink-0"
                      >
                        {favorites.includes(practitioner.id) ? (
                          <HeartIconSolid className="h-5 w-5 text-rose-500" />
                        ) : (
                          <HeartIcon className="h-5 w-5 text-slate-400 group-hover:text-rose-400 transition-colors" />
                        )}
                      </button>
                    </div>

                    {/* Details with icons */}
                    <div className="space-y-3 mb-4">
                      <div className="flex items-center text-sm text-slate-600">
                        <MapPinIcon className="h-4 w-4 mr-2 text-slate-400" />
                        <span className="truncate">{practitioner.city || 'Location not specified'}</span>
                      </div>
                      <div className="flex items-center text-sm text-slate-600">
                        <CurrencyDollarIcon className="h-4 w-4 mr-2 text-slate-400" />
                        <span>{formatCurrency(practitioner.hourly_rate || 0)}/hr</span>
                      </div>
                      <div className="flex items-center text-sm text-slate-600">
                        <BriefcaseIcon className="h-4 w-4 mr-2 text-slate-400" />
                        <span>{practitioner.years_of_experience || 0} years experience</span>
                      </div>
                    </div>

                    {/* Specialties with teal badges */}
                    {practitioner.specialties && practitioner.specialties.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-4">
                        {practitioner.specialties.slice(0, 2).map(s => (
                          <span 
                            key={s.id} 
                            className="px-3 py-1.5 bg-teal-50 text-teal-700 rounded-full text-xs font-medium"
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

                    {/* Actions */}
                    <div className="flex gap-2 mt-auto">
                      <Link 
                        href={`/client/dashboard/practitioners/${practitioner.id}`} 
                        className="flex-1"
                      >
                        <Button 
                          size="sm" 
                          variant="outline" 
                          fullWidth
                          className="text-sm border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300"
                        >
                          View Profile
                        </Button>
                      </Link>
                      <Link 
                        href={`/client/dashboard/consultations/book?practitioner=${practitioner.id}`} 
                        className="flex-1"
                      >
                        <Button 
                          size="sm" 
                          fullWidth 
                          className="text-sm bg-teal-600 hover:bg-teal-700 text-white shadow-sm shadow-teal-200/50"
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