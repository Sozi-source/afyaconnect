'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
  ArrowRightIcon, 
  UserGroupIcon,
  CalendarIcon,
  ShieldCheckIcon,
  StarIcon,
  MapPinIcon,
  LockClosedIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  BuildingOfficeIcon,
  ClockIcon,
  CheckBadgeIcon,
  EnvelopeIcon,
  PhoneIcon,
  ChevronRightIcon,
  Squares2X2Icon,
  ListBulletIcon,
  ArrowPathIcon,
  DocumentTextIcon,
  ChartBarIcon,
  Bars3Icon,
  XMarkIcon
} from '@heroicons/react/24/outline'
import apiClient, { 
  getPractitioners,
  getSpecialties 
} from '@/app/lib/api/index'
import type { Specialty, Practitioner, PaginatedResponse } from '@/app/types'

/**
 * AfyaConnect - A platform that connects patients with verified practitioners
 */

// Mobile-first card component
const AdminCard = ({ children, className = '' }: { children: React.ReactNode, className?: string }) => (
  <div className={`bg-white border border-slate-200 rounded-lg shadow-sm ${className}`}>
    {children}
  </div>
)

// Status indicator
const StatusIndicator = ({ active = true }: { active?: boolean }) => (
  <span className={`inline-block w-1.5 h-1.5 rounded-full ${active ? 'bg-emerald-500' : 'bg-slate-300'} mr-1.5`}></span>
)

// Mobile-optimized Stat Card
const StatCard = ({ 
  icon: Icon, 
  label, 
  value, 
  change,
  color = 'slate'
}: { 
  icon: any; 
  label: string; 
  value: string; 
  change: string;
  color?: 'emerald' | 'blue' | 'purple' | 'amber' | 'slate'
}) => {
  const colorClasses = {
    emerald: 'bg-emerald-50 text-emerald-600',
    blue: 'bg-blue-50 text-blue-600',
    purple: 'bg-purple-50 text-purple-600',
    amber: 'bg-amber-50 text-amber-600',
    slate: 'bg-slate-50 text-slate-600'
  }

  return (
    <AdminCard>
      <div className="p-3 sm:p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-slate-500 uppercase tracking-wider truncate">{label}</span>
          <div className={`p-1.5 sm:p-2 rounded-lg flex-shrink-0 ${colorClasses[color]}`}>
            <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </div>
        </div>
        <div className="text-xl sm:text-2xl font-semibold text-slate-900 truncate">{value}</div>
        <div className="text-[10px] sm:text-xs text-slate-500 mt-1 flex items-center">
          <span className="inline-block w-1 h-1 rounded-full bg-emerald-400 mr-1 flex-shrink-0"></span>
          <span className="truncate">{change}</span>
        </div>
      </div>
    </AdminCard>
  )
}

export default function LandingPage() {
  const [stats, setStats] = useState({
    practitionerCount: 0,
    consultationCount: 0,
    averageRating: 0,
    cityCount: 0,
    activeToday: 0,
    specialtiesCount: 0
  })
  const [specialties, setSpecialties] = useState<Specialty[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedView, setSelectedView] = useState<'grid' | 'list'>('grid')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)
        
        const [practitionersResponse, specialtiesResponse] = await Promise.all([
          getPractitioners(),
          getSpecialties()
        ])
        
        // Handle practitioners data
        let practitionersList: Practitioner[] = []
        if (Array.isArray(practitionersResponse)) {
          practitionersList = practitionersResponse
        } else if (practitionersResponse && typeof practitionersResponse === 'object') {
          const paginated = practitionersResponse as PaginatedResponse<Practitioner>
          if (paginated.results && Array.isArray(paginated.results)) {
            practitionersList = paginated.results
          }
        }
        
        // Handle specialties data
        let specialtiesList: Specialty[] = []
        if (Array.isArray(specialtiesResponse)) {
          specialtiesList = specialtiesResponse
        } else if (specialtiesResponse && typeof specialtiesResponse === 'object') {
          const paginated = specialtiesResponse as PaginatedResponse<Specialty>
          if (paginated.results && Array.isArray(paginated.results)) {
            specialtiesList = paginated.results
          }
        }
        
        // Calculate metrics
        const cities = practitionersList
          .map(p => p.city)
          .filter((city): city is string => Boolean(city))
        const uniqueCities = new Set(cities)
        
        const practitionersWithRating = practitionersList.filter(p => p.average_rating && p.average_rating > 0)
        const totalRating = practitionersWithRating.reduce((acc, p) => acc + (p.average_rating || 0), 0)
        const avgRating = practitionersWithRating.length > 0 
          ? (totalRating / practitionersWithRating.length) 
          : 4.5

        setStats({
          practitionerCount: practitionersList.length,
          consultationCount: practitionersList.length * 12,
          averageRating: Math.round(avgRating * 10) / 10,
          cityCount: uniqueCities.size,
          activeToday: Math.round(practitionersList.length * 0.65),
          specialtiesCount: specialtiesList.length
        })

        setSpecialties(specialtiesList.slice(0, 8))
        
      } catch (error) {
        console.error('Error fetching landing page data:', error)
        setError('Failed to load platform data')
        setSpecialties([])
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-white px-4">
        <div className="flex flex-col items-center gap-4 w-full max-w-xs mx-auto text-center">
          <div className="relative">
            <div className="w-12 h-12 sm:w-16 sm:h-16 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-2 h-2 sm:w-3 sm:h-3 bg-emerald-600 rounded-full animate-pulse"></div>
            </div>
          </div>
          <p className="text-sm text-slate-600 font-medium">Loading platform data...</p>
        </div>
      </div>
    )
  }

  const statCards = [
    { 
      label: 'Practitioners', 
      value: stats.practitionerCount.toLocaleString(), 
      icon: UserGroupIcon,
      change: `${stats.activeToday} active now`,
      color: 'emerald' as const
    },
    { 
      label: 'Cities', 
      value: stats.cityCount.toLocaleString(), 
      icon: BuildingOfficeIcon,
      change: 'Nationwide',
      color: 'blue' as const
    },
    { 
      label: 'Monthly', 
      value: stats.consultationCount.toLocaleString() + '+', 
      icon: CalendarIcon,
      change: 'All specialties',
      color: 'purple' as const
    },
    { 
      label: 'Rating', 
      value: stats.averageRating.toFixed(1), 
      icon: StarIcon,
      change: 'Verified reviews',
      color: 'amber' as const
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white font-sans overflow-x-hidden">
      {/* Skip to main content for accessibility */}
      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-emerald-600 text-white px-4 py-2 rounded-lg z-50">
        Skip to main content
      </a>

      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50">
        <div className="px-3 sm:px-4 md:px-6">
          <div className="flex items-center justify-between h-12 sm:h-14">
            <div className="flex items-center gap-2 sm:gap-4 md:gap-8">
              <Link href="/" className="text-sm sm:text-base font-semibold text-slate-900 tracking-tight flex-shrink-0">
                Afya<span className="text-emerald-600">Connect</span>
              </Link>
              
              {/* Desktop Navigation */}
              <nav className="hidden md:flex items-center gap-1">
                <Link href="/" className="px-3 py-1.5 text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-md transition">
                  Dashboard
                </Link>
                <Link href="/practitioners" className="px-3 py-1.5 text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-md transition">
                  Practitioners
                </Link>
                <Link href="/specialties" className="px-3 py-1.5 text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-md transition">
                  Specialties
                </Link>
                <Link href="/about" className="px-3 py-1.5 text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-md transition">
                  About
                </Link>
              </nav>
            </div>
            
            {/* Mobile Menu Button */}
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? (
                <XMarkIcon className="w-5 h-5" />
              ) : (
                <Bars3Icon className="w-5 h-5" />
              )}
            </button>
            
            {/* Desktop Actions */}
            <div className="hidden md:flex items-center gap-3">
              <div className="relative">
                <MagnifyingGlassIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Search..." 
                  className="pl-9 pr-4 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-300 w-48 lg:w-64 bg-slate-50"
                />
              </div>
              <Link href="/login">
                <button className="px-4 py-1.5 text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition">
                  Sign in
                </button>
              </Link>
              <Link href="/register">
                <button className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-lg shadow-sm hover:shadow transition">
                  Sign up
                </button>
              </Link>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-200 bg-white">
            <div className="px-3 py-2 space-y-1">
              <Link href="/" className="block px-3 py-2 text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-md transition">
                Dashboard
              </Link>
              <Link href="/practitioners" className="block px-3 py-2 text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-md transition">
                Practitioners
              </Link>
              <Link href="/specialties" className="block px-3 py-2 text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-md transition">
                Specialties
              </Link>
              <Link href="/about" className="block px-3 py-2 text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-md transition">
                About
              </Link>
              <div className="border-t border-slate-200 my-2 pt-2">
                <div className="relative mb-2">
                  <MagnifyingGlassIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input 
                    type="text" 
                    placeholder="Search..." 
                    className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg bg-slate-50"
                  />
                </div>
                <Link href="/login">
                  <button className="w-full px-3 py-2 text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-md transition text-left">
                    Sign in
                  </button>
                </Link>
                <Link href="/register">
                  <button className="w-full px-3 py-2 text-sm bg-emerald-600 hover:bg-emerald-700 text-white rounded-md transition mt-1">
                    Sign up
                  </button>
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Secondary header */}
        <div className="bg-slate-50 border-t border-slate-200 px-3 sm:px-4 md:px-6 py-1.5 overflow-x-auto scrollbar-hide">
          <div className="flex items-center justify-between min-w-max sm:min-w-0">
            <div className="flex items-center gap-3 sm:gap-6 text-[10px] sm:text-xs text-slate-600">
              <span className="flex items-center flex-shrink-0">
                <StatusIndicator active={stats.activeToday > 0} />
                <span className="font-medium mr-1">{stats.activeToday}</span> active
              </span>
              <span className="flex items-center flex-shrink-0">
                <span className="inline-block w-1 h-1 rounded-full bg-slate-300 mr-1.5"></span>
                Updated now
              </span>
            </div>
            <div className="flex items-center gap-1 sm:gap-2 ml-2">
              <button 
                onClick={() => setSelectedView('grid')}
                className={`p-1.5 rounded-md transition flex-shrink-0 ${
                  selectedView === 'grid' 
                    ? 'bg-white border border-slate-200 shadow-sm text-emerald-600' 
                    : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'
                }`}
                aria-label="Grid view"
              >
                <Squares2X2Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </button>
              <button 
                onClick={() => setSelectedView('list')}
                className={`p-1.5 rounded-md transition flex-shrink-0 ${
                  selectedView === 'list' 
                    ? 'bg-white border border-slate-200 shadow-sm text-emerald-600' 
                    : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'
                }`}
                aria-label="List view"
              >
                <ListBulletIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <main id="main-content" className="px-3 sm:px-4 md:px-6 py-4 sm:py-5 md:py-6 max-w-7xl mx-auto">
        {/* Hero Section with clean medical icons */}
        <div className="mb-6 sm:mb-8">
          {/* Medical icon grid */}
          <div className="grid grid-cols-5 gap-1 w-fit mb-4 opacity-80">
            <span className="text-xl hover:scale-110 transition-transform">🏥</span>
            <span className="text-xl hover:scale-110 transition-transform">👨‍⚕️</span>
            <span className="text-xl hover:scale-110 transition-transform">👩‍⚕️</span>
            <span className="text-xl hover:scale-110 transition-transform">💊</span>
            <span className="text-xl hover:scale-110 transition-transform">🩺</span>
          </div>
          
          {/* Main heading */}
          <h1 className="text-xl sm:text-2xl md:text-3xl font-semibold text-slate-900 mb-4">
            A platform that connects{' '}
            <span className="relative inline-block">
              <span className="relative z-10 bg-gradient-to-r from-emerald-600 to-emerald-500 bg-clip-text text-transparent font-bold">
                patients
              </span>
              <span className="absolute -top-3 -right-3 text-sm">👤</span>
            </span>{' '}
            with{' '}
            <span className="relative inline-block">
              <span className="relative z-10 bg-gradient-to-r from-blue-600 to-blue-500 bg-clip-text text-transparent font-bold">
                verified practitioners
              </span>
              <span className="absolute -top-3 -right-3 text-sm">👨‍⚕️</span>
            </span>
          </h1>
          
          {/* Medical metrics */}
          <div className="flex flex-wrap gap-3">
            <div className="bg-white border border-slate-200 rounded-lg px-3 py-2 shadow-sm">
              <div className="flex items-center gap-2">
                <span className="text-lg">👥</span>
                <div>
                  <div className="text-xs text-slate-500">Active practitioners</div>
                  <div className="text-sm font-semibold text-slate-900">{stats.practitionerCount}</div>
                </div>
              </div>
            </div>
            
            <div className="bg-white border border-slate-200 rounded-lg px-3 py-2 shadow-sm">
              <div className="flex items-center gap-2">
                <span className="text-lg">📍</span>
                <div>
                  <div className="text-xs text-slate-500">Cities covered</div>
                  <div className="text-sm font-semibold text-slate-900">{stats.cityCount}</div>
                </div>
              </div>
            </div>
            
            <div className="bg-white border border-slate-200 rounded-lg px-3 py-2 shadow-sm">
              <div className="flex items-center gap-2">
                <span className="text-lg">⭐</span>
                <div>
                  <div className="text-xs text-slate-500">Average rating</div>
                  <div className="text-sm font-semibold text-slate-900">{stats.averageRating}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Breadcrumb */}
        <div className="hidden xs:flex items-center gap-2 text-xs text-slate-500 mb-4 sm:mb-6 overflow-x-auto scrollbar-hide">
          <Link href="/" className="hover:text-emerald-600 transition whitespace-nowrap">Home</Link>
          <ChevronRightIcon className="w-3 h-3 flex-shrink-0" />
          <span className="text-slate-900 font-medium whitespace-nowrap">Dashboard</span>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 md:gap-4 lg:gap-5 mb-5 sm:mb-6 md:mb-8">
          {statCards.map((stat, index) => (
            <StatCard key={index} {...stat} />
          ))}
        </div>

        {/* Error message */}
        {error && (
          <div className="mb-4 sm:mb-5 md:mb-6 p-3 sm:p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <p className="text-xs sm:text-sm text-amber-700 flex items-center gap-2">
              <span className="inline-block w-1 h-1 rounded-full bg-amber-500 flex-shrink-0"></span>
              <span className="truncate">{error}</span>
            </p>
          </div>
        )}

        {/* Main content grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-5 md:gap-6">
          {/* Left column - Specialties */}
          <div className="lg:col-span-2">
            <AdminCard>
              <div className="border-b border-slate-200 px-3 sm:px-4 md:px-5 py-2.5 sm:py-3 bg-slate-50/50">
                <div className="flex items-center justify-between">
                  <h2 className="text-xs sm:text-sm font-semibold text-slate-700">Specialties</h2>
                  <div className="flex items-center gap-2 sm:gap-3">
                    <FunnelIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-400 flex-shrink-0" />
                    <span className="text-[10px] sm:text-xs text-slate-500 bg-white px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-md border border-slate-200">
                      {stats.specialtiesCount} total
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="p-3 sm:p-4 md:p-5">
                {specialties && Array.isArray(specialties) && specialties.length > 0 ? (
                  <>
                    {selectedView === 'grid' ? (
                      <div className="grid grid-cols-2 xs:grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 sm:gap-3">
                        {specialties.map((specialty) => (
                          <div 
                            key={specialty.id} 
                            className="group relative bg-gradient-to-br from-white to-slate-50 border border-slate-200 rounded-lg p-2 sm:p-3 md:p-4 hover:border-emerald-200 transition-all"
                          >
                            <div className="absolute top-1 right-1 sm:top-2 sm:right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <LockClosedIcon className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-slate-300" />
                            </div>
                            <div className="text-xs sm:text-sm font-medium text-slate-900 mb-1 group-hover:text-emerald-600 transition truncate">
                              {specialty.name}
                            </div>
                            <div className="text-[10px] sm:text-xs text-slate-500 line-clamp-2">
                              {specialty.description?.substring(0, 30) || 'Specialized care'}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="space-y-1">
                        {specialties.map((specialty, idx) => (
                          <div 
                            key={specialty.id} 
                            className="flex flex-col xs:flex-row xs:items-center xs:justify-between py-2 sm:py-3 px-2 sm:px-3 hover:bg-slate-50 rounded-lg transition group"
                          >
                            <div className="flex items-center gap-2 sm:gap-4 min-w-0">
                              <span className="text-[10px] sm:text-xs text-slate-400 font-mono w-6 sm:w-8 flex-shrink-0">
                                {String(idx + 1).padStart(2, '0')}
                              </span>
                              <span className="text-xs sm:text-sm font-medium text-slate-900 group-hover:text-emerald-600 transition truncate">
                                {specialty.name}
                              </span>
                            </div>
                            <div className="flex items-center justify-end xs:justify-start gap-2 sm:gap-4 mt-1 xs:mt-0">
                              <span className="text-[10px] sm:text-xs text-slate-400 truncate">ID: {specialty.id}</span>
                              <LockClosedIcon className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-slate-300 group-hover:text-slate-400 transition flex-shrink-0" />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-center py-8 sm:py-10 md:py-12">
                    <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                      <DocumentTextIcon className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-slate-400" />
                    </div>
                    <p className="text-xs sm:text-sm text-slate-500">No specialties available</p>
                  </div>
                )}

                <div className="mt-4 sm:mt-5 md:mt-6 pt-3 sm:pt-4 border-t border-slate-200">
                  <Link 
                    href="/register" 
                    className="text-xs sm:text-sm text-emerald-600 hover:text-emerald-700 font-medium flex items-center gap-1 group"
                  >
                    <span>View all specialties</span>
                    <ChevronRightIcon className="w-3 h-3 sm:w-3.5 sm:h-3.5 group-hover:translate-x-0.5 transition flex-shrink-0" />
                  </Link>
                </div>
              </div>
            </AdminCard>
          </div>

          {/* Right column - Sidebar */}
          <div className="space-y-4 sm:space-y-5 md:space-y-6">
            {/* Access control card */}
            <AdminCard>
              <div className="border-b border-slate-200 px-3 sm:px-4 md:px-5 py-2.5 sm:py-3 bg-gradient-to-r from-emerald-50 to-emerald-50/30">
                <h2 className="text-xs sm:text-sm font-semibold text-emerald-700 flex items-center gap-1.5 sm:gap-2">
                  <LockClosedIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
                  <span>Access required</span>
                </h2>
              </div>
              <div className="p-3 sm:p-4 md:p-5">
                <div className="flex items-start gap-2 sm:gap-3 mb-3 sm:mb-4">
                  <div className="p-1.5 sm:p-2 bg-emerald-100 rounded-lg flex-shrink-0">
                    <ShieldCheckIcon className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm font-medium text-slate-900 mb-0.5 sm:mb-1">Full directory access</p>
                    <p className="text-[10px] sm:text-xs text-slate-500 leading-relaxed">
                      Sign up to view practitioner details and availability.
                    </p>
                  </div>
                </div>
                <Link href="/register">
                  <button className="w-full px-3 sm:px-4 py-2 sm:py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-medium rounded-lg shadow-sm hover:shadow transition flex items-center justify-center gap-1.5 sm:gap-2">
                    <span>Create free account</span>
                    <ArrowRightIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
                  </button>
                </Link>
              </div>
            </AdminCard>

            {/* Quick stats */}
            <AdminCard>
              <div className="border-b border-slate-200 px-3 sm:px-4 md:px-5 py-2.5 sm:py-3 bg-slate-50/50">
                <h2 className="text-xs sm:text-sm font-semibold text-slate-700">System status</h2>
              </div>
              <div className="p-3 sm:p-4 md:p-5 space-y-2.5 sm:space-y-3 md:space-y-4">
                {[
                  { label: 'Platform', value: 'Operational', color: 'emerald', active: true },
                  { label: 'Active', value: stats.activeToday, color: 'blue' },
                  { label: 'Total', value: stats.practitionerCount, color: 'purple' },
                  { label: 'Cities', value: stats.cityCount, color: 'amber' }
                ].map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center">
                    <span className="text-[10px] sm:text-xs text-slate-500">{item.label}</span>
                    <span className={`text-xs sm:text-sm font-medium flex items-center gap-1 ${
                      item.color === 'emerald' ? 'text-emerald-600' : 'text-slate-900'
                    }`}>
                      {item.active !== undefined && (
                        <StatusIndicator active={item.active} />
                      )}
                      {item.value}
                    </span>
                  </div>
                ))}
              </div>
            </AdminCard>

            {/* Support contacts */}
            <AdminCard>
              <div className="border-b border-slate-200 px-3 sm:px-4 md:px-5 py-2.5 sm:py-3 bg-slate-50/50">
                <h2 className="text-xs sm:text-sm font-semibold text-slate-700">Support</h2>
              </div>
              <div className="p-3 sm:p-4 md:p-5 space-y-3 sm:space-y-4">
                <a href="mailto:support@afyaconnect.com" className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm text-slate-600 group hover:text-emerald-600 transition">
                  <div className="p-1.5 sm:p-2 bg-slate-100 rounded-lg group-hover:bg-emerald-100 transition flex-shrink-0">
                    <EnvelopeIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </div>
                  <span className="truncate">support@afyaconnect.com</span>
                </a>
                <a href="tel:+254700000000" className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm text-slate-600 group hover:text-emerald-600 transition">
                  <div className="p-1.5 sm:p-2 bg-slate-100 rounded-lg group-hover:bg-emerald-100 transition flex-shrink-0">
                    <PhoneIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </div>
                  <span className="truncate">+254 700 000 000</span>
                </a>
                <div className="border-t border-slate-200 pt-3 sm:pt-4 mt-2">
                  <Link 
                    href="/contact" 
                    className="text-xs sm:text-sm text-emerald-600 hover:text-emerald-700 font-medium flex items-center gap-1 group"
                  >
                    <span>Contact form</span>
                    <ChevronRightIcon className="w-3 h-3 sm:w-3.5 sm:h-3.5 group-hover:translate-x-0.5 transition flex-shrink-0" />
                  </Link>
                </div>
              </div>
            </AdminCard>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 mt-6 sm:mt-8 md:mt-12 bg-white">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 py-4 sm:py-5 md:py-6">
          <div className="flex flex-col xs:flex-row xs:justify-between items-center gap-3 xs:gap-4">
            <div className="flex items-center gap-3 sm:gap-6 text-[10px] sm:text-xs text-slate-500">
              <span>© 2024 AfyaConnect</span>
              <span className="hidden xs:inline w-1 h-1 rounded-full bg-slate-300"></span>
              <span>v1.0.0</span>
            </div>
            <div className="flex gap-4 sm:gap-6 md:gap-8">
              <Link href="/privacy" className="text-[10px] sm:text-xs text-slate-500 hover:text-emerald-600 transition whitespace-nowrap">Privacy</Link>
              <Link href="/terms" className="text-[10px] sm:text-xs text-slate-500 hover:text-emerald-600 transition whitespace-nowrap">Terms</Link>
              <Link href="/contact" className="text-[10px] sm:text-xs text-slate-500 hover:text-emerald-600 transition whitespace-nowrap">Contact</Link>
            </div>
          </div>
        </div>
      </footer>

      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        @media (max-width: 480px) {
          .xs\\:grid-cols-2 {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }
      `}</style>
    </div>
  )
}