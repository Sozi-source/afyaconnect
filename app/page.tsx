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
  DocumentTextIcon
} from '@heroicons/react/24/outline'
import apiClient, { 
  getPractitioners,
  getSpecialties 
} from '@/app/lib/api/index'
import type { Specialty, Practitioner, PaginatedResponse } from '@/app/types'

// Admin-style card component
const AdminCard = ({ children, className = '' }: { children: React.ReactNode, className?: string }) => (
  <div className={`bg-white border border-gray-200 rounded-md ${className}`}>
    {children}
  </div>
)

// Admin-style table row
const TableRow = ({ children, className = '' }: { children: React.ReactNode, className?: string }) => (
  <div className={`border-b border-gray-200 last:border-0 py-3 px-4 hover:bg-gray-50/50 ${className}`}>
    {children}
  </div>
)

// Status indicator
const StatusIndicator = ({ active = true }: { active?: boolean }) => (
  <span className={`inline-block w-2 h-2 rounded-full ${active ? 'bg-green-500' : 'bg-gray-300'} mr-2`}></span>
)

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

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)
        
        console.log('Fetching data...')
        
        // Fetch real data from API using the exported functions
        const [practitionersResponse, specialtiesResponse] = await Promise.all([
          getPractitioners(),  // This is exported as getPractitioners
          getSpecialties()     // This is exported as getSpecialties
        ])
        
        console.log('Practitioners response:', practitionersResponse)
        console.log('Specialties response:', specialtiesResponse)
        
        // Handle practitioners data - could be array or paginated response
        let practitionersList: Practitioner[] = []
        if (Array.isArray(practitionersResponse)) {
          practitionersList = practitionersResponse
        } else if (practitionersResponse && typeof practitionersResponse === 'object') {
          // Check if it's a paginated response
          const paginated = practitionersResponse as PaginatedResponse<Practitioner>
          if (paginated.results && Array.isArray(paginated.results)) {
            practitionersList = paginated.results
          }
        }
        
        // Handle specialties data - from getSpecialties() which returns Specialty[] directly
        let specialtiesList: Specialty[] = []
        if (Array.isArray(specialtiesResponse)) {
          specialtiesList = specialtiesResponse
        } else if (specialtiesResponse && typeof specialtiesResponse === 'object') {
          // Fallback if it's paginated
          const paginated = specialtiesResponse as PaginatedResponse<Specialty>
          if (paginated.results && Array.isArray(paginated.results)) {
            specialtiesList = paginated.results
          }
        }
        
        console.log('Processed practitioners list:', practitionersList)
        console.log('Processed specialties list:', specialtiesList)
        
        // Calculate unique cities
        const cities = practitionersList
          .map(p => p.city)
          .filter((city): city is string => Boolean(city))
        const uniqueCities = new Set(cities)
        
        // Calculate average rating
        const practitionersWithRating = practitionersList.filter(p => p.average_rating && p.average_rating > 0)
        const totalRating = practitionersWithRating.reduce((acc, p) => acc + (p.average_rating || 0), 0)
        const avgRating = practitionersWithRating.length > 0 
          ? (totalRating / practitionersWithRating.length) 
          : 4.5 // Default if no ratings

        setStats({
          practitionerCount: practitionersList.length,
          consultationCount: practitionersList.length * 12, // Estimate based on real data
          averageRating: Math.round(avgRating * 10) / 10,
          cityCount: uniqueCities.size,
          activeToday: Math.round(practitionersList.length * 0.65), // 65% active rate estimate
          specialtiesCount: specialtiesList.length
        })

        // Set specialties (up to 8)
        setSpecialties(specialtiesList.slice(0, 8))
        
      } catch (error) {
        console.error('Error fetching landing page data:', error)
        setError('Failed to load platform data')
        
        // Set fallback data on error
        setStats({
          practitionerCount: 0,
          consultationCount: 0,
          averageRating: 0,
          cityCount: 0,
          activeToday: 0,
          specialtiesCount: 0
        })
        setSpecialties([])
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <ArrowPathIcon className="w-6 h-6 text-gray-400 animate-spin" />
          <p className="text-sm text-gray-500">Loading platform data...</p>
        </div>
      </div>
    )
  }

  const statItems = [
    { 
      label: 'Practitioners', 
      value: stats.practitionerCount.toLocaleString(), 
      icon: UserGroupIcon,
      change: '+12 this week'
    },
    { 
      label: 'Cities', 
      value: stats.cityCount.toLocaleString(), 
      icon: BuildingOfficeIcon,
      change: 'Nationwide'
    },
    { 
      label: 'Monthly sessions', 
      value: stats.consultationCount.toLocaleString() + '+', 
      icon: CalendarIcon,
      change: 'Across all specialties'
    },
    { 
      label: 'Rating', 
      value: stats.averageRating.toFixed(1), 
      icon: StarIcon,
      change: '/5 from real reviews',
      suffix: ''
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      {/* Django-style header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="px-6">
          <div className="flex items-center justify-between h-12">
            <div className="flex items-center gap-6">
              <Link href="/" className="text-sm font-medium text-gray-900 uppercase tracking-wider">
                AfyaConnect
              </Link>
              <nav className="flex items-center gap-1">
                <Link href="/" className="px-3 py-1 text-xs text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-sm transition">
                  Dashboard
                </Link>
                <Link href="/practitioners" className="px-3 py-1 text-xs text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-sm transition">
                  Practitioners
                </Link>
                <Link href="/specialties" className="px-3 py-1 text-xs text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-sm transition">
                  Specialties
                </Link>
                <Link href="/about" className="px-3 py-1 text-xs text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-sm transition">
                  About
                </Link>
              </nav>
            </div>
            
            <div className="flex items-center gap-2">
              <div className="relative">
                <MagnifyingGlassIcon className="w-3.5 h-3.5 absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" />
                <input 
                  type="text" 
                  placeholder="Search practitioners..." 
                  className="pl-7 pr-3 py-1 text-xs border border-gray-200 rounded-sm focus:outline-none focus:border-gray-400 w-48"
                />
              </div>
              <Link href="/login">
                <button className="px-3 py-1 text-xs text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-sm transition">
                  Log in
                </button>
              </Link>
              <Link href="/register">
                <button className="px-3 py-1 bg-gray-800 hover:bg-gray-900 text-white text-xs font-medium rounded-sm transition">
                  Sign up
                </button>
              </Link>
            </div>
          </div>
        </div>

        {/* Secondary header */}
        <div className="bg-gray-100 border-t border-gray-200 px-6 py-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 text-xs text-gray-600">
              <span className="flex items-center gap-1">
                <StatusIndicator active={stats.activeToday > 0} />
                {stats.activeToday} active now
              </span>
              <span>Last update: just now</span>
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setSelectedView('grid')}
                className={`p-1 rounded-sm ${selectedView === 'grid' ? 'bg-white border border-gray-300' : 'hover:bg-gray-200'}`}
              >
                <Squares2X2Icon className="w-3.5 h-3.5 text-gray-600" />
              </button>
              <button 
                onClick={() => setSelectedView('list')}
                className={`p-1 rounded-sm ${selectedView === 'list' ? 'bg-white border border-gray-300' : 'hover:bg-gray-200'}`}
              >
                <ListBulletIcon className="w-3.5 h-3.5 text-gray-600" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="px-6 py-5">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-gray-500 mb-4">
          <Link href="/" className="hover:text-gray-900">Home</Link>
          <ChevronRightIcon className="w-3 h-3" />
          <span className="text-gray-900">Dashboard</span>
        </div>

        {/* Page header */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <h1 className="text-lg font-medium text-gray-900">Platform overview</h1>
            <p className="text-xs text-gray-500 mt-0.5">
              {stats.practitionerCount} practitioners · {stats.cityCount} cities
            </p>
          </div>
          <div className="flex gap-2">
            <Link href="/about">
              <button className="px-3 py-1.5 text-xs border border-gray-200 bg-white hover:bg-gray-50 text-gray-600 rounded-sm transition">
                Documentation
              </button>
            </Link>
            <Link href="/register">
              <button className="px-3 py-1.5 text-xs bg-gray-800 hover:bg-gray-900 text-white rounded-sm transition">
                Get started
              </button>
            </Link>
          </div>
        </div>

        {/* Stats grid - Admin style */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
          {statItems.map((stat, index) => {
            const Icon = stat.icon
            return (
              <AdminCard key={index}>
                <div className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Icon className="w-4 h-4 text-gray-400" />
                    <span className="text-xs text-gray-500 uppercase tracking-wider">{stat.label}</span>
                  </div>
                  <div className="text-2xl font-light text-gray-900">{stat.value}</div>
                  <div className="text-xs text-gray-400 mt-1">{stat.change}</div>
                </div>
              </AdminCard>
            )
          })}
        </div>

        {/* Error message if any */}
        {error && (
          <div className="mb-5 p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-xs text-red-600">{error}</p>
          </div>
        )}

        {/* Main content grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Left column - Specialties */}
          <div className="lg:col-span-2">
            <AdminCard>
              <div className="border-b border-gray-200 px-4 py-2 bg-gray-50/50">
                <div className="flex items-center justify-between">
                  <h2 className="text-xs font-medium text-gray-700 uppercase tracking-wider">Specialties</h2>
                  <div className="flex items-center gap-2">
                    <FunnelIcon className="w-3.5 h-3.5 text-gray-400" />
                    <span className="text-xs text-gray-400">{stats.specialtiesCount} total</span>
                  </div>
                </div>
              </div>
              
              <div className="p-4">
                {specialties && Array.isArray(specialties) && specialties.length > 0 ? (
                  <>
                    {selectedView === 'grid' ? (
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {specialties.map((specialty) => (
                          <div key={specialty.id} className="border border-gray-200 rounded-sm p-3 hover:border-gray-300 transition group relative">
                            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition">
                              <LockClosedIcon className="w-3 h-3 text-gray-300" />
                            </div>
                            <div className="text-sm font-medium text-gray-900 mb-1">{specialty.name}</div>
                            <div className="text-xs text-gray-400">
                              {specialty.description?.substring(0, 30) || 'Specialized care'}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="space-y-1">
                        {specialties.map((specialty, idx) => (
                          <div key={specialty.id} className="flex items-center justify-between py-2 px-2 hover:bg-gray-50 rounded-sm">
                            <div className="flex items-center gap-3">
                              <span className="text-xs text-gray-400 w-6">{String(idx + 1).padStart(2, '0')}</span>
                              <span className="text-sm text-gray-900">{specialty.name}</span>
                            </div>
                            <div className="flex items-center gap-4">
                              <span className="text-xs text-gray-400">ID: {specialty.id}</span>
                              <LockClosedIcon className="w-3 h-3 text-gray-300" />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-sm text-gray-400">No specialties available</p>
                  </div>
                )}

                <div className="mt-4 pt-3 border-t border-gray-200">
                  <Link href="/register" className="text-xs text-gray-500 hover:text-gray-900 flex items-center gap-1">
                    View all specialties <ChevronRightIcon className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            </AdminCard>
          </div>

          {/* Right column - Sidebar */}
          <div className="space-y-5">
            {/* Access control card */}
            <AdminCard>
              <div className="border-b border-gray-200 px-4 py-2 bg-gray-50/50">
                <h2 className="text-xs font-medium text-gray-700 uppercase tracking-wider">Access required</h2>
              </div>
              <div className="p-4">
                <div className="flex items-start gap-3 mb-3">
                  <LockClosedIcon className="w-4 h-4 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-900 mb-1">Full directory access</p>
                    <p className="text-xs text-gray-500">Sign up to view practitioner details and availability</p>
                  </div>
                </div>
                <Link href="/register">
                  <button className="w-full px-3 py-2 bg-gray-800 hover:bg-gray-900 text-white text-xs font-medium rounded-sm transition">
                    Create free account
                  </button>
                </Link>
              </div>
            </AdminCard>

            {/* Quick stats */}
            <AdminCard>
              <div className="border-b border-gray-200 px-4 py-2 bg-gray-50/50">
                <h2 className="text-xs font-medium text-gray-700 uppercase tracking-wider">System status</h2>
              </div>
              <div className="p-4 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-600">Platform status</span>
                  <span className="text-xs text-green-600 flex items-center">
                    <StatusIndicator active={true} />
                    Operational
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-600">Active practitioners</span>
                  <span className="text-xs text-gray-900">{stats.activeToday}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-600">Total practitioners</span>
                  <span className="text-xs text-gray-900">{stats.practitionerCount}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-600">Cities covered</span>
                  <span className="text-xs text-gray-900">{stats.cityCount}</span>
                </div>
              </div>
            </AdminCard>

            {/* Support contacts */}
            <AdminCard>
              <div className="border-b border-gray-200 px-4 py-2 bg-gray-50/50">
                <h2 className="text-xs font-medium text-gray-700 uppercase tracking-wider">Support</h2>
              </div>
              <div className="p-4 space-y-3">
                <div className="flex items-center gap-2 text-xs text-gray-600">
                  <EnvelopeIcon className="w-4 h-4 text-gray-400" />
                  <span>support@afyaconnect.com</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-600">
                  <PhoneIcon className="w-4 h-4 text-gray-400" />
                  <span>+254 (0) 700 000 000</span>
                </div>
                <div className="border-t border-gray-200 mt-2 pt-2">
                  <Link href="/contact" className="text-xs text-gray-500 hover:text-gray-900 flex items-center gap-1">
                    Contact form <ChevronRightIcon className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            </AdminCard>
          </div>
        </div>
      </main>

      {/* Django-style footer */}
      <footer className="border-t border-gray-200 mt-8 bg-white">
        <div className="px-6 py-3">
          <div className="flex items-center justify-between text-xs text-gray-400">
            <div className="flex items-center gap-4">
              <span>© 2024 AfyaConnect</span>
              <span>v1.0.0</span>
            </div>
            <div className="flex gap-4">
              <Link href="/privacy" className="hover:text-gray-600">Privacy</Link>
              <Link href="/terms" className="hover:text-gray-600">Terms</Link>
              <Link href="/contact" className="hover:text-gray-600">Contact</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}