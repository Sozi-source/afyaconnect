// app/components/client/dashboard/practitioners/PractitionersPage.tsx
'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { useAuth } from '@/app/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  MagnifyingGlassIcon,
  MapPinIcon,
  CurrencyDollarIcon,
  BriefcaseIcon,
  HeartIcon,
  XMarkIcon,
  AdjustmentsHorizontalIcon,
  SparklesIcon,
  ChevronRightIcon,
  UserGroupIcon,
  BeakerIcon,
  HeartIcon as HeartIconSolid,
  AcademicCapIcon,
  EyeIcon,
  MicrophoneIcon
} from '@heroicons/react/24/outline'
import { Card, CardBody } from '@/app/components/ui/Card'
import { Button } from '@/app/components/ui/Buttons'
import { apiClient } from '@/app/lib/api'
import { formatCurrency } from '@/app/lib/utils'
import type { Practitioner, Specialty, PaginatedResponse } from '@/app/types'
import { BrainIcon, StethoscopeIcon } from 'lucide-react'


// Map specialty names to appropriate icons based on keywords
const getSpecialtyIcon = (name: string) => {
  const lowerName = name.toLowerCase()
  
  if (lowerName.includes('cardio') || lowerName.includes('heart')) return HeartIconSolid
  if (lowerName.includes('brain') || lowerName.includes('neuro')) return BrainIcon
  if (lowerName.includes('child') || lowerName.includes('pedi')) return UserGroupIcon
  if (lowerName.includes('derma') || lowerName.includes('skin')) return BeakerIcon
  if (lowerName.includes('dent') || lowerName.includes('tooth')) return SparklesIcon
  if (lowerName.includes('eye') || lowerName.includes('ophth')) return EyeIcon
  if (lowerName.includes('ent') || lowerName.includes('ear')) return MicrophoneIcon
  if (lowerName.includes('general') || lowerName.includes('family')) return StethoscopeIcon
  if (lowerName.includes('psych') || lowerName.includes('mental')) return BrainIcon
  if (lowerName.includes('ortho') || lowerName.includes('bone')) return BriefcaseIcon
  
  // Default icon
  return StethoscopeIcon
}

// Generate consistent gradient colors based on specialty ID
const getSpecialtyColor = (id: number): string => {
  const colors = [
    'from-blue-500 to-blue-600',
    'from-emerald-500 to-teal-500',
    'from-purple-500 to-indigo-500',
    'from-rose-500 to-red-500',
    'from-amber-500 to-orange-500',
    'from-indigo-500 to-purple-500',
    'from-cyan-500 to-blue-500',
    'from-fuchsia-500 to-pink-500',
    'from-lime-500 to-green-500',
    'from-violet-500 to-purple-500',
    'from-pink-500 to-rose-500',
    'from-teal-500 to-emerald-500'
  ]
  
  // Use specialty ID to get consistent color
  return colors[id % colors.length]
}

// Helper function to extract results from API response
function extractPractitioners(data: any): Practitioner[] {
  if (!data) return []
  if (Array.isArray(data)) return data
  if (data.results && Array.isArray(data.results)) return data.results
  return []
}

function extractSpecialties(data: any): Specialty[] {
  if (!data) return []
  if (Array.isArray(data)) return data
  if (data.results && Array.isArray(data.results)) return data.results
  return []
}

// Category type for grouped specialties
interface SpecialtyCategory {
  id: number
  name: string
  description: string | null
  count: number
  icon: any
  color: string
  practitioners: Practitioner[]
}

export default function PractitionersPage() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth()
  const router = useRouter()
  const [isMounted, setIsMounted] = useState(false)
  const [practitioners, setPractitioners] = useState<Practitioner[]>([])
  const [specialties, setSpecialties] = useState<Specialty[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedSpecialtyId, setSelectedSpecialtyId] = useState<number | ''>('')
  const [selectedCity, setSelectedCity] = useState<string>('')
  const [showFilters, setShowFilters] = useState(false)
  const [favorites, setFavorites] = useState<number[]>([])
  const [error, setError] = useState<string | null>(null)
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null)
  const [viewMode, setViewMode] = useState<'categories' | 'list'>('categories')

  // Memoized fetch function
  const fetchData = useCallback(async () => {
    if (!isAuthenticated || !user || !isMounted) return
    
    try {
      setLoading(true)
      setError(null)
      
      // Fetch both practitioners and specialties from your backend
      const [practitionersData, specialtiesData] = await Promise.allSettled([
        apiClient.practitioners.getAll(),
        apiClient.specialties.getAll()
      ])
      
      if (practitionersData.status === 'fulfilled') {
        const practitionersList = extractPractitioners(practitionersData.value)
        // Only show practitioners that are verified/approved
        // According to your types, verified practitioners have is_verified = true
        // Or you might want to show all practitioners since the API might only return approved ones
        setPractitioners(practitionersList)
      } else {
        setError('Failed to load practitioners')
      }
      
      if (specialtiesData.status === 'fulfilled') {
        const specialtiesList = extractSpecialties(specialtiesData.value)
        setSpecialties(specialtiesList)
      }
    } catch (error: any) {
      setError(error.message || 'Failed to load practitioners')
    } finally {
      setLoading(false)
    }
  }, [isAuthenticated, user, isMounted])

  const loadFavorites = useCallback(() => {
    try {
      const saved = localStorage.getItem('favoritePractitioners')
      if (saved) {
        const parsed = JSON.parse(saved)
        setFavorites(Array.isArray(parsed) ? parsed : [])
      }
    } catch (error) {
      console.error('Error loading favorites:', error)
      setFavorites([])
    }
  }, [])

  const toggleFavorite = useCallback((id: number) => {
    setFavorites(prev => {
      const newFavorites = prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]
      localStorage.setItem('favoritePractitioners', JSON.stringify(newFavorites))
      return newFavorites
    })
  }, [])

  const clearFilters = useCallback(() => {
    setSearchTerm('')
    setSelectedSpecialtyId('')
    setSelectedCity('')
    setSelectedCategoryId(null)
  }, [])

  // Mount effect
  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Data fetching effect
  useEffect(() => {
    if (isMounted && isAuthenticated && user) {
      fetchData()
      loadFavorites()
    }
  }, [isMounted, isAuthenticated, user, fetchData, loadFavorites])

  // Redirect effect
  useEffect(() => {
    if (isMounted && !authLoading && !isAuthenticated) {
      router.push('/login')
    }
  }, [isMounted, authLoading, isAuthenticated, router])

  // Group practitioners by specialty ID - using your Specialty model
  const practitionersBySpecialty = useMemo(() => {
    const grouped: Record<number, Practitioner[]> = {}
    
    practitioners.forEach(practitioner => {
      if (practitioner.specialties && practitioner.specialties.length > 0) {
        practitioner.specialties.forEach(specialty => {
          const specialtyId = specialty.id
          if (!grouped[specialtyId]) {
            grouped[specialtyId] = []
          }
          grouped[specialtyId].push(practitioner)
        })
      }
    })
    
    return grouped
  }, [practitioners])

  // Create specialty categories by merging with specialties data
  const specialtyCategories = useMemo<SpecialtyCategory[]>(() => {
    return specialties
      .map(specialty => ({
        id: specialty.id,
        name: specialty.name,
        description: specialty.description,
        count: practitionersBySpecialty[specialty.id]?.length || 0,
        icon: getSpecialtyIcon(specialty.name),
        color: getSpecialtyColor(specialty.id),
        practitioners: practitionersBySpecialty[specialty.id] || []
      }))
      .filter(category => category.count > 0) // Only show specialties with practitioners
      .sort((a, b) => b.count - a.count) // Sort by count descending
  }, [specialties, practitionersBySpecialty])

  // Filter practitioners based on selected category and filters
  const filteredPractitioners = useMemo(() => {
    let filtered = practitioners

    // Apply category filter (by specialty ID)
    if (selectedCategoryId) {
      filtered = practitionersBySpecialty[selectedCategoryId] || []
    }

    // Apply search and other filters
    return filtered.filter(p => {
      const fullName = `${p.first_name || ''} ${p.last_name || ''}`.toLowerCase()
      const matchesSearch = !searchTerm || 
        fullName.includes(searchTerm.toLowerCase()) ||
        (p.bio && p.bio.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (p.specialties && p.specialties.some(s => s.name.toLowerCase().includes(searchTerm.toLowerCase())))
      
      const matchesSpecialty = selectedSpecialtyId === '' || !selectedSpecialtyId || 
        (p.specialties && p.specialties.some(s => s.id === selectedSpecialtyId))
      
      const matchesCity = !selectedCity || (p.city && p.city.toLowerCase() === selectedCity.toLowerCase())
      
      return matchesSearch && matchesSpecialty && matchesCity
    })
  }, [practitioners, practitionersBySpecialty, selectedCategoryId, searchTerm, selectedSpecialtyId, selectedCity])

  const cities = useMemo(() => 
    [...new Set(practitioners.filter(p => p.city).map(p => p.city as string))].sort(),
    [practitioners]
  )

  const activeFilterCount = useMemo(() => {
    return [searchTerm, selectedSpecialtyId, selectedCity].filter(Boolean).length
  }, [searchTerm, selectedSpecialtyId, selectedCity])

  // Get selected category name for display
  const selectedCategoryName = useMemo(() => {
    if (!selectedCategoryId) return null
    const category = specialties.find(s => s.id === selectedCategoryId)
    return category?.name || null
  }, [selectedCategoryId, specialties])

  // =============================================
  // EARLY RETURNS
  // =============================================
  if (authLoading || !isMounted) {
    return <LoadingSkeleton />
  }

  if (!isAuthenticated || !user) {
    return null
  }

  if (loading) {
    return <LoadingSkeleton />
  }

  if (error) {
    return <ErrorState error={error} onRetry={fetchData} />
  }

  // =============================================
  // RENDER
  // =============================================
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-10">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 text-teal-600 mb-2">
              <SparklesIcon className="h-5 w-5" />
              <span className="text-sm font-medium">Expert network</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-light text-slate-800 tracking-tight">
              Find Health <span className="font-semibold text-teal-600">Experts</span>
            </h1>
          </div>
          
          {/* View Toggle */}
          <div className="flex items-center gap-2 bg-white rounded-lg border border-slate-200 p-1">
            <button
              onClick={() => setViewMode('categories')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                viewMode === 'categories' 
                  ? 'bg-teal-600 text-white' 
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Categories ({specialtyCategories.length})
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                viewMode === 'list' 
                  ? 'bg-teal-600 text-white' 
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              All Practitioners ({practitioners.length})
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative mb-6">
          <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name, specialty, or keywords..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-36 py-4 text-base border border-slate-200 rounded-2xl bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500"
          />
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`absolute right-2 top-1/2 -translate-y-1/2 p-2.5 rounded-xl transition-all ${
              showFilters ? 'bg-teal-100 text-teal-600' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <AdjustmentsHorizontalIcon className="h-5 w-5" />
          </button>
        </div>

        {/* Filters Panel */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-white rounded-2xl shadow-xl border border-slate-200 p-6 mb-8"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Specialty</label>
                  <select
                    value={selectedSpecialtyId}
                    onChange={(e) => setSelectedSpecialtyId(e.target.value ? Number(e.target.value) : '')}
                    className="w-full px-4 py-3 text-sm border border-slate-200 rounded-xl bg-white"
                  >
                    <option value="">All Specialties</option>
                    {specialties.map(s => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Location</label>
                  <select
                    value={selectedCity}
                    onChange={(e) => setSelectedCity(e.target.value)}
                    className="w-full px-4 py-3 text-sm border border-slate-200 rounded-xl bg-white"
                  >
                    <option value="">All Cities</option>
                    {cities.map(city => (
                      <option key={city} value={city}>{city}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="flex justify-end mt-6 pt-4 border-t border-slate-200">
                <Button variant="outline" size="sm" onClick={clearFilters}>
                  Clear All Filters
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Results Count */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-sm text-slate-500">
            {viewMode === 'categories' && selectedCategoryId
              ? `${filteredPractitioners.length} practitioners in ${selectedCategoryName}`
              : viewMode === 'categories'
              ? `${specialtyCategories.length} specialty categories`
              : `${filteredPractitioners.length} practitioners found`}
          </p>
          {selectedCategoryId && (
            <button
              onClick={() => setSelectedCategoryId(null)}
              className="text-sm text-teal-600 hover:text-teal-700 flex items-center gap-1"
            >
              <XMarkIcon className="h-4 w-4" />
              Clear category filter
            </button>
          )}
        </div>

        {/* Content based on view mode */}
        {viewMode === 'categories' && !selectedCategoryId ? (
          // Categories Grid View - Using your Specialty model
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {specialtyCategories.map((category, index) => {
              const Icon = category.icon
              return (
                <motion.div
                  key={category.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card 
                    className="border-slate-200 hover:border-teal-200 hover:shadow-lg transition-all cursor-pointer group"
                    onClick={() => setSelectedCategoryId(category.id)}
                  >
                    <CardBody className="p-6">
                      <div className="flex items-start gap-4">
                        <div className={`p-3 rounded-xl bg-gradient-to-br ${category.color} text-white shadow-lg group-hover:scale-110 transition-transform`}>
                          <Icon className="h-6 w-6" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-slate-800 text-lg mb-1">{category.name}</h3>
                          <p className="text-sm text-slate-500">{category.count} practitioners</p>
                          {category.description && (
                            <p className="text-xs text-slate-400 mt-1 line-clamp-1">{category.description}</p>
                          )}
                        </div>
                        <ChevronRightIcon className="h-5 w-5 text-slate-400 group-hover:text-teal-500 group-hover:translate-x-1 transition-all" />
                      </div>

                      {/* Preview of practitioners in category */}
                      {category.practitioners.length > 0 && (
                        <div className="mt-4 pt-4 border-t border-slate-100">
                          <div className="flex -space-x-2 overflow-hidden">
                            {category.practitioners.slice(0, 5).map((p) => (
                              <div
                                key={p.id}
                                className="inline-block w-8 h-8 rounded-full bg-gradient-to-br from-teal-500 to-teal-600 border-2 border-white flex items-center justify-center text-white text-xs font-bold"
                                title={`Dr. ${p.first_name} ${p.last_name}`}
                              >
                                {p.first_name?.[0]}{p.last_name?.[0]}
                              </div>
                            ))}
                            {category.practitioners.length > 5 && (
                              <div className="w-8 h-8 rounded-full bg-slate-100 border-2 border-white flex items-center justify-center text-xs font-medium text-slate-600">
                                +{category.practitioners.length - 5}
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </CardBody>
                  </Card>
                </motion.div>
              )
            })}
          </div>
        ) : (
          // Practitioners List View (either all or filtered by category)
          <>
            {filteredPractitioners.length === 0 ? (
              <EmptyState 
                title={selectedCategoryName ? `No practitioners in ${selectedCategoryName}` : "No practitioners match your filters"}
                description="Try adjusting your search criteria or browse other categories"
                onClear={clearFilters}
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredPractitioners.map((practitioner, index) => (
                  <PractitionerCard
                    key={practitioner.id}
                    practitioner={practitioner}
                    index={index}
                    isFavorite={favorites.includes(practitioner.id)}
                    onToggleFavorite={toggleFavorite}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

// =============================================
// PRACTITIONER CARD COMPONENT
// =============================================
interface PractitionerCardProps {
  practitioner: Practitioner
  index: number
  isFavorite: boolean
  onToggleFavorite: (id: number) => void
}

function PractitionerCard({ practitioner, index, isFavorite, onToggleFavorite }: PractitionerCardProps) {
  const [isHovered, setIsHovered] = useState(false)

  // Get primary specialty for display
  const primarySpecialty = practitioner.specialties && practitioner.specialties.length > 0
    ? practitioner.specialties[0].name
    : 'General Practitioner'

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.05, 0.5) }}
      whileHover={{ y: -4 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      <Card className="h-full border border-slate-200/60 hover:border-teal-200 hover:shadow-lg transition-all group">
        <CardBody className="p-6 flex flex-col h-full">
          {/* Header */}
          <div className="flex justify-between items-start gap-3 mb-4">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <div className="relative">
                <div className="w-14 h-14 bg-gradient-to-br from-teal-500 to-teal-600 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-sm">
                  {practitioner.first_name?.[0]}{practitioner.last_name?.[0]}
                </div>
                {isHovered && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full border-2 border-white"
                  />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="font-semibold text-slate-800 text-base sm:text-lg truncate group-hover:text-teal-600">
                  Dr. {practitioner.first_name} {practitioner.last_name}
                </h3>
                <p className="text-xs text-slate-500 truncate">
                  {primarySpecialty}
                </p>
              </div>
            </div>
            <button
              onClick={() => onToggleFavorite(practitioner.id)}
              className="p-2 hover:bg-slate-100 rounded-full transition-colors"
              aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
            >
              {isFavorite ? (
                <HeartIconSolid className="h-5 w-5 text-rose-500" />
              ) : (
                <HeartIcon className="h-5 w-5 text-slate-400 group-hover:text-rose-400" />
              )}
            </button>
          </div>

          {/* Details */}
          <div className="space-y-3 mb-4">
            <div className="flex items-center text-sm text-slate-600">
              <MapPinIcon className="h-4 w-4 mr-2 text-slate-400 flex-shrink-0" />
              <span className="truncate">{practitioner.city || 'Location not specified'}</span>
            </div>
            <div className="flex items-center text-sm text-slate-600">
              <CurrencyDollarIcon className="h-4 w-4 mr-2 text-slate-400 flex-shrink-0" />
              <span>{formatCurrency(practitioner.hourly_rate || 0)}/hr</span>
            </div>
            <div className="flex items-center text-sm text-slate-600">
              <BriefcaseIcon className="h-4 w-4 mr-2 text-slate-400 flex-shrink-0" />
              <span>{practitioner.years_of_experience || 0} years experience</span>
            </div>
          </div>

          {/* Specialties */}
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

          {/* Verification badge - optional */}
          {practitioner.is_verified && (
            <div className="mb-3">
              <span className="inline-flex items-center px-2 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-medium">
                <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812z" clipRule="evenodd" />
                  <path fillRule="evenodd" d="M10 12a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                </svg>
                Verified
              </span>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2 mt-auto">
            <Link href={`/client/dashboard/practitioners/${practitioner.id}`} className="flex-1">
              <Button
                size="sm"
                variant="outline"
                fullWidth
                className="text-sm border-slate-200 text-slate-600 hover:bg-slate-50"
              >
                View Profile
              </Button>
            </Link>
            <Link href={`/client/dashboard/practitioners/${practitioner.id}/book`} className="flex-1">
            <Button
              size="sm"
              fullWidth
              className="text-sm bg-teal-600 hover:bg-teal-700 text-white"
            >
              Book
            </Button>
          </Link>
          </div>
        </CardBody>
      </Card>
    </motion.div>
  )
}

// =============================================
// HELPER COMPONENTS
// =============================================

interface EmptyStateProps {
  title: string
  description: string
  onClear: () => void
}

function EmptyState({ title, description, onClear }: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-center py-16 bg-white rounded-2xl border border-slate-200"
    >
      <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
        <span className="text-5xl">🔍</span>
      </div>
      <h3 className="text-xl font-semibold text-slate-800 mb-2">{title}</h3>
      <p className="text-slate-500 mb-6">{description}</p>
      <Button
        variant="outline"
        onClick={onClear}
        className="text-teal-600 border-teal-200 hover:bg-teal-50"
      >
        Clear All Filters
      </Button>
    </motion.div>
  )
}

function LoadingSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-10">
        {/* Header Skeleton */}
        <div className="mb-8 animate-pulse">
          <div className="h-4 w-24 bg-slate-200 rounded mb-2"></div>
          <div className="h-10 w-64 bg-slate-200 rounded"></div>
        </div>

        {/* Search Skeleton */}
        <div className="mb-8 animate-pulse">
          <div className="h-14 bg-slate-200 rounded-2xl"></div>
        </div>

        {/* Grid Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="border border-slate-200/60">
              <CardBody className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-14 h-14 bg-slate-200 rounded-full animate-pulse"></div>
                  <div className="flex-1">
                    <div className="h-5 w-32 bg-slate-200 rounded animate-pulse mb-2"></div>
                    <div className="h-4 w-24 bg-slate-200 rounded animate-pulse"></div>
                  </div>
                </div>
                <div className="space-y-3 mb-4">
                  <div className="h-4 w-full bg-slate-200 rounded animate-pulse"></div>
                  <div className="h-4 w-3/4 bg-slate-200 rounded animate-pulse"></div>
                  <div className="h-4 w-1/2 bg-slate-200 rounded animate-pulse"></div>
                </div>
                <div className="flex gap-2">
                  <div className="h-10 flex-1 bg-slate-200 rounded animate-pulse"></div>
                  <div className="h-10 flex-1 bg-slate-200 rounded animate-pulse"></div>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}

interface ErrorStateProps {
  error: string
  onRetry: () => void
}

function ErrorState({ error, onRetry }: ErrorStateProps) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex items-center justify-center p-4">
      <Card className="max-w-md w-full border-neutral-200">
        <CardBody className="p-8 text-center">
          <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <XMarkIcon className="h-8 w-8 text-red-600" />
          </div>
          <h2 className="text-xl font-semibold text-slate-800 mb-2">Oops! Something went wrong</h2>
          <p className="text-slate-500 mb-6">{error}</p>
          <Button onClick={onRetry} className="bg-teal-600 hover:bg-teal-700 text-white">
            Try Again
          </Button>
        </CardBody>
      </Card>
    </div>
  )
}