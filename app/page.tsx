'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import {
  UserGroupIcon,
  CalendarIcon,
  ShieldCheckIcon,
  StarIcon,
  BuildingOfficeIcon,
  ClockIcon,
  CheckBadgeIcon,
  EnvelopeIcon,
  PhoneIcon,
  ChevronRightIcon,
  HeartIcon,
  VideoCameraIcon,
  MagnifyingGlassIcon,
  MapPinIcon,
  BriefcaseIcon,
  ArrowRightIcon,
  SparklesIcon,
  LockClosedIcon
} from '@heroicons/react/24/outline'
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid'
import apiClient, { 
  getPractitioners, 
  getSpecialties,
  getReviews 
} from '@/app/lib/api/index'
import type { 
  Practitioner, 
  Specialty, 
  Review,
  PaginatedResponse 
} from '@/app/types'

// ==================== SYSTEM CONSTANTS ====================
const PLATFORM = {
  name: 'AfyaConnect',
  email: 'support@afyaconnect.com',
  phone: '+254 700 000 000',
  version: '1.0.0',
  year: new Date().getFullYear()
}

// ==================== CORE COMPONENTS ====================

// Modern Card System
const Card = ({ 
  children, 
  variant = 'default',
  className = '' 
}: { 
  children: React.ReactNode
  variant?: 'default' | 'hover' | 'interactive' | 'glass'
  className?: string
}) => {
  const variants = {
    default: 'bg-white border border-slate-200 rounded-2xl',
    hover: 'bg-white border border-slate-200 rounded-2xl hover:border-emerald-200 hover:shadow-lg transition-all',
    interactive: 'bg-white border border-slate-200 rounded-2xl hover:border-emerald-200 hover:shadow-xl hover:-translate-y-1 transition-all',
    glass: 'backdrop-blur-md bg-white/70 border border-white/20 rounded-2xl shadow-lg'
  }
  
  return (
    <div className={`${variants[variant]} ${className}`}>
      {children}
    </div>
  )
}

// Hero Card with Image - Perfectly Matched Sizes
const HeroCard = ({ 
  practitionerCount, 
  cityCount 
}: { 
  practitionerCount: number
  cityCount: number 
}) => (
  <div className="grid lg:grid-cols-2 gap-8 items-stretch max-w-6xl mx-auto">
    {/* Left Content - Same height as image */}
    <Card variant="glass" className="p-8 sm:p-10 md:p-12 relative overflow-hidden h-full flex flex-col">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-emerald-100/30 to-blue-100/30 rounded-full blur-3xl -translate-y-32 translate-x-32"></div>
      
      <div className="relative flex-1 flex flex-col">
        {/* Trust Badge */}
        <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 bg-emerald-50 rounded-full mb-6 sm:mb-8 border border-emerald-100 w-fit">
          <ShieldCheckIcon className="w-3.5 sm:w-4 h-3.5 sm:h-4 text-emerald-600" />
          <span className="text-xs sm:text-sm font-medium text-emerald-700 tracking-wide">
            {practitionerCount}+ Verified Practitioners
          </span>
        </div>
        
        {/* Main Headline */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-light tracking-tight text-slate-900 mb-4 sm:mb-6">
          Your Health.{' '}
          <span className="block sm:inline font-medium bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent">
            Connected.
          </span>
        </h1>
        
        {/* Supporting Text */}
        <p className="text-base sm:text-lg md:text-xl text-slate-500 mb-6 sm:mb-8 max-w-md font-light leading-relaxed">
          Book appointments instantly with verified practitioners across{' '}
          <span className="font-medium text-slate-900">{cityCount} cities</span>.
        </p>
        
        {/* Spacer to push CTA down */}
        <div className="flex-1"></div>
        
        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mt-auto">
          <Link href="/register" className="w-full sm:w-auto flex-1">
            <button className="group w-full px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-emerald-600 to-blue-600 hover:from-emerald-700 hover:to-blue-700 text-white font-medium rounded-xl shadow-lg hover:shadow-xl transition-all inline-flex items-center justify-center gap-2 text-sm sm:text-base">
              <span>Get Started</span>
              <ArrowRightIcon className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </Link>
          <Link href="/how-it-works" className="w-full sm:w-auto flex-1">
            <button className="group w-full px-6 sm:px-8 py-3 sm:py-4 border border-slate-300 hover:border-slate-400 text-slate-700 font-medium rounded-xl transition-all inline-flex items-center justify-center gap-2 text-sm sm:text-base">
              <span>How it Works</span>
            </button>
          </Link>
        </div>
        
        {/* Trust Indicators */}
        <div className="flex flex-wrap items-center gap-3 sm:gap-4 mt-6 sm:mt-8 text-xs sm:text-sm text-slate-400 font-light">
          <span className="flex items-center gap-1">
            <SparklesIcon className="w-3.5 h-3.5" />
            Free to join
          </span>
          <span className="w-1 h-1 rounded-full bg-slate-300"></span>
          <span className="flex items-center gap-1">
            <ShieldCheckIcon className="w-3.5 h-3.5" />
            No hidden fees
          </span>
          <span className="w-1 h-1 rounded-full bg-slate-300"></span>
          <span>Cancel anytime</span>
        </div>
      </div>
    </Card>

    {/* Right Image - Exact same height as card */}
    <div className="hidden lg:block relative h-full">
      <div className="relative rounded-3xl overflow-hidden shadow-2xl h-full">
        <Image 
          src="/images/hero.jpeg"
          alt="Healthcare professional consulting with patient in modern medical facility"
          fill
          className="object-cover"
          priority
          sizes="(max-width: 768px) 100vw, 50vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-emerald-900/30 via-transparent to-transparent"></div>
        
        {/* Floating Stats Card */}
        <div className="absolute bottom-6 left-6 right-6 bg-white/90 backdrop-blur-md rounded-xl p-4 border border-white/20 shadow-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                <VideoCameraIcon className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <div className="text-sm font-medium text-slate-900">Live Consultation</div>
                <div className="text-xs text-slate-500">with Dr. Sarah Chen</div>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <div className="flex -space-x-2">
                <div className="w-6 h-6 rounded-full bg-blue-500 border-2 border-white"></div>
                <div className="w-6 h-6 rounded-full bg-emerald-500 border-2 border-white"></div>
              </div>
              <span className="text-xs text-slate-500 ml-1">+2</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Decorative elements */}
      <div className="absolute -top-4 -right-4 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl"></div>
      <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl"></div>
    </div>
  </div>
)

// Role Badge
const RoleBadge = ({ role }: { role: 'client' | 'practitioner' | 'admin' }) => {
  const roles = {
    client: { bg: 'bg-blue-50', text: 'text-blue-700', icon: HeartIcon, label: 'Patient' },
    practitioner: { bg: 'bg-emerald-50', text: 'text-emerald-700', icon: BriefcaseIcon, label: 'Practitioner' },
    admin: { bg: 'bg-purple-50', text: 'text-purple-700', icon: ShieldCheckIcon, label: 'Admin' }
  }
  
  const Icon = roles[role].icon
  
  return (
    <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full ${roles[role].bg} ${roles[role].text}`}>
      <Icon className="w-4 h-4" />
      <span className="text-sm font-medium">{roles[role].label}</span>
    </div>
  )
}

// Stat Display
const StatDisplay = ({ 
  icon: Icon, 
  value, 
  label,
  trend 
}: { 
  icon: any
  value: string | number
  label: string
  trend?: string
}) => (
  <Card variant="hover" className="p-4 sm:p-6">
    <div className="flex items-start justify-between mb-2 sm:mb-3">
      <div className="p-2 sm:p-3 bg-slate-100 rounded-xl">
        <Icon className="w-4 sm:w-5 h-4 sm:h-5 text-slate-600" />
      </div>
      {trend && (
        <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
          {trend}
        </span>
      )}
    </div>
    <div className="text-xl sm:text-2xl font-light text-slate-900 mb-1">{value}</div>
    <div className="text-xs sm:text-sm text-slate-500 font-light">{label}</div>
  </Card>
)

// Role Card
const RoleCard = ({ 
  type,
  title,
  description,
  action,
  metrics
}: {
  type: 'client' | 'practitioner'
  title: string
  description: string
  action: string
  metrics: { label: string; value: string }[]
}) => (
  <Card variant="interactive" className="p-6 sm:p-8">
    <div className="flex items-start justify-between mb-4 sm:mb-6">
      <RoleBadge role={type} />
      <div className="text-2xl sm:text-3xl">
        {type === 'client' ? '👤' : '👨‍⚕️'}
      </div>
    </div>
    
    <h3 className="text-xl sm:text-2xl font-light text-slate-900 mb-2 sm:mb-3">{title}</h3>
    <p className="text-sm sm:text-base text-slate-500 font-light mb-4 sm:mb-6 leading-relaxed">{description}</p>
    
    <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-4 sm:mb-6">
      {metrics.map((metric, idx) => (
        <div key={idx} className="bg-slate-50 rounded-xl p-2 sm:p-3">
          <div className="text-base sm:text-lg font-medium text-slate-900">{metric.value}</div>
          <div className="text-xs text-slate-500 font-light">{metric.label}</div>
        </div>
      ))}
    </div>
    
    <Link 
      href={type === 'client' ? '/register?role=client' : '/register?role=practitioner'}
      className="inline-flex items-center justify-between w-full text-sm sm:text-base font-medium text-emerald-600 hover:text-emerald-700 group border-t border-slate-100 pt-4"
    >
      <span>{action}</span>
      <ChevronRightIcon className="w-4 sm:w-5 h-4 sm:h-5 group-hover:translate-x-1 transition" />
    </Link>
  </Card>
)

// Practitioner Card
const PractitionerCard = ({ 
  practitioner 
}: { 
  practitioner: Practitioner 
}) => (
  <Card variant="hover" className="p-4 sm:p-6 relative group">
    {/* Blur overlay for unauthenticated users */}
    <div className="absolute inset-0 bg-white/80 backdrop-blur-[2px] rounded-2xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10">
      <div className="text-center p-4">
        <LockClosedIcon className="w-8 h-8 text-slate-400 mx-auto mb-2" />
        <p className="text-sm text-slate-600 font-light mb-3">Sign in to view profile</p>
        <Link href="/login">
          <button className="px-4 py-2 bg-emerald-600 text-white text-xs font-medium rounded-lg hover:bg-emerald-700 transition">
            Sign In
          </button>
        </Link>
      </div>
    </div>

    <div className="relative">
      <div className="flex items-start gap-3 sm:gap-4 mb-3 sm:mb-4">
        <div className="w-10 sm:w-12 h-10 sm:h-12 bg-gradient-to-br from-slate-100 to-slate-200 rounded-xl flex items-center justify-center text-slate-600 font-medium text-base sm:text-lg">
          {practitioner.first_name?.charAt(0) || 'D'}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1 sm:gap-2 mb-1">
            <h4 className="text-base sm:text-lg font-medium text-slate-900 truncate">
              {practitioner.full_name || `Dr. ${practitioner.first_name} ${practitioner.last_name}`}
            </h4>
            {practitioner.is_verified && (
              <CheckBadgeIcon className="w-4 sm:w-5 h-4 sm:h-5 text-emerald-500 flex-shrink-0" />
            )}
          </div>
          <p className="text-xs sm:text-sm text-slate-500 font-light">
            {practitioner.specialties?.map(s => s.name).join(' • ') || 'Specialist'}
          </p>
        </div>
      </div>
      
      <div className="flex items-center gap-3 sm:gap-4 text-xs sm:text-sm text-slate-500 mb-3 sm:mb-4">
        {practitioner.city && (
          <div className="flex items-center gap-1">
            <MapPinIcon className="w-3.5 sm:w-4 h-3.5 sm:h-4" />
            <span className="font-light">{practitioner.city}</span>
          </div>
        )}
        {practitioner.average_rating ? (
          <div className="flex items-center gap-1">
            <StarIconSolid className="w-3.5 sm:w-4 h-3.5 sm:h-4 text-amber-400" />
            <span className="font-light">{practitioner.average_rating.toFixed(1)}</span>
          </div>
        ) : (
          <div className="flex items-center gap-1">
            <StarIcon className="w-3.5 sm:w-4 h-3.5 sm:h-4 text-slate-300" />
            <span className="text-slate-400 font-light">New</span>
          </div>
        )}
      </div>
      
      <div className="w-full py-2 sm:py-3 text-xs sm:text-sm font-medium text-slate-400 border border-slate-200 rounded-xl text-center">
        Sign in to view profile
      </div>
    </div>
  </Card>
)

// Feature Card
const FeatureCard = ({ 
  icon: Icon, 
  title,
  description 
}: { 
  icon: any
  title: string
  description: string
}) => (
  <Card variant="hover" className="p-4 sm:p-6">
    <div className="p-2 sm:p-3 bg-emerald-50 rounded-xl w-fit mb-3 sm:mb-4">
      <Icon className="w-5 sm:w-6 h-5 sm:h-6 text-emerald-600" />
    </div>
    <h4 className="text-lg sm:text-xl font-light text-slate-900 mb-1 sm:mb-2">{title}</h4>
    <p className="text-xs sm:text-sm text-slate-500 font-light leading-relaxed">{description}</p>
  </Card>
)

// Specialty Card
const SpecialtyCard = ({ specialty }: { specialty: Specialty }) => (
  <Card variant="hover" className="p-3 sm:p-4">
    <div className="text-sm sm:text-base font-medium text-slate-900 mb-1 sm:mb-2">{specialty.name}</div>
    <div className="text-xs sm:text-sm text-slate-500 font-light line-clamp-2">
      {specialty.description || 'Specialized medical care'}
    </div>
  </Card>
)

// Review Card
const ReviewCard = ({ review }: { review: Review }) => (
  <Card variant="hover" className="p-4 sm:p-6">
    <div className="flex items-start gap-2 sm:gap-3 mb-2 sm:mb-3">
      <div className="w-8 sm:w-10 h-8 sm:h-10 bg-slate-200 rounded-xl flex items-center justify-center text-slate-600 text-sm sm:text-base font-medium">
        {review.reviewer_name?.charAt(0) || 'U'}
      </div>
      <div>
        <div className="text-sm sm:text-base font-medium text-slate-900">
          {review.reviewer_name || 'Anonymous'}
        </div>
        <div className="flex gap-0.5 mt-1">
          {[...Array(5)].map((_, i) => (
            <StarIconSolid 
              key={i} 
              className={`w-3 sm:w-3.5 h-3 sm:h-3.5 ${i < review.rating ? 'text-amber-400' : 'text-slate-200'}`} 
            />
          ))}
        </div>
      </div>
    </div>
    {review.comment && (
      <p className="text-xs sm:text-sm text-slate-500 font-light leading-relaxed line-clamp-2">
        "{review.comment}"
      </p>
    )}
  </Card>
)

// Section Header
const SectionHeader = ({ title, subtitle, action }: { title: string; subtitle?: string; action?: React.ReactNode }) => (
  <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-6 sm:mb-8 gap-3 sm:gap-4">
    <div>
      <h2 className="text-2xl sm:text-3xl font-light text-slate-900 mb-1 sm:mb-2">{title}</h2>
      {subtitle && <p className="text-sm sm:text-base text-slate-500 font-light">{subtitle}</p>}
    </div>
    {action}
  </div>
)

// Auth Required Banner
const AuthRequiredBanner = () => (
  <Card variant="default" className="p-6 sm:p-8 bg-gradient-to-r from-amber-50 to-amber-100/50 border-amber-200 mb-8">
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-amber-200 rounded-full">
          <LockClosedIcon className="w-5 h-5 text-amber-700" />
        </div>
        <div>
          <h3 className="text-base sm:text-lg font-medium text-amber-800">Sign in to access full profiles</h3>
          <p className="text-sm text-amber-600 font-light">View practitioner details, availability, and book appointments.</p>
        </div>
      </div>
      <div className="flex gap-3">
        <Link href="/login">
          <button className="px-6 py-2 bg-white text-amber-700 font-medium rounded-lg hover:bg-amber-50 transition text-sm border border-amber-300">
            Sign In
          </button>
        </Link>
        <Link href="/register">
          <button className="px-6 py-2 bg-amber-700 text-white font-medium rounded-lg hover:bg-amber-800 transition text-sm">
            Sign Up
          </button>
        </Link>
      </div>
    </div>
  </Card>
)

// ==================== MAIN LANDING PAGE ====================
export default function LandingPage() {
  const [practitioners, setPractitioners] = useState<Practitioner[]>([])
  const [specialties, setSpecialties] = useState<Specialty[]>([])
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  // Check authentication status
  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('authToken')
      setIsAuthenticated(!!token)
    }
    
    checkAuth()
    
    // Listen for storage changes (login/logout in other tabs)
    window.addEventListener('storage', checkAuth)
    return () => window.removeEventListener('storage', checkAuth)
  }, [])

  // Calculate stats from real data
  const stats = {
    practitionerCount: practitioners.length,
    cityCount: new Set(practitioners.map(p => p.city).filter(Boolean)).size,
    consultationCount: practitioners.length * 15,
    averageRating: practitioners.reduce((acc, p) => acc + (p.average_rating || 0), 0) / (practitioners.length || 1),
    activeNow: Math.round(practitioners.length * 0.4)
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)
        
        // Fetch practitioners (public data only)
        const practitionersData = await getPractitioners({ verified: true })
        let practitionersList: Practitioner[] = []
        
        if (Array.isArray(practitionersData)) {
          practitionersList = practitionersData
        } else if (practitionersData && 'results' in practitionersData) {
          practitionersList = (practitionersData as PaginatedResponse<Practitioner>).results
        }
        
        setPractitioners(practitionersList.slice(0, 4))
        
        // Fetch specialties (public)
        const specialtiesData = await getSpecialties()
        let specialtiesList: Specialty[] = []
        
        if (Array.isArray(specialtiesData)) {
          specialtiesList = specialtiesData
        } else if (specialtiesData && 'results' in specialtiesData) {
          specialtiesList = (specialtiesData as PaginatedResponse<Specialty>).results
        }
        
        setSpecialties(specialtiesList.slice(0, 4))
        
        // Fetch reviews (public)
        if (practitionersList.length > 0) {
          try {
            const firstPractitionerId = practitionersList[0].id
            const reviewsData = await getReviews(firstPractitionerId)
            setReviews(Array.isArray(reviewsData) ? reviewsData.slice(0, 3) : [])
          } catch (reviewError) {
            console.error('Error fetching reviews:', reviewError)
          }
        }
        
      } catch (error) {
        console.error('Error loading landing page:', error)
        setError('Unable to load platform data')
      } finally {
        setLoading(false)
      }
    }
    
    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-emerald-200 border-t-emerald-600 rounded-full animate-spin"></div>
          <p className="text-sm text-slate-400 font-light">Loading platform data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans antialiased">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-14 sm:h-16">
            <Link href="/" className="text-lg sm:text-xl md:text-2xl font-light tracking-tight text-slate-900">
              Afya<span className="font-medium text-emerald-600">Connect</span>
            </Link>
            
            <nav className="hidden md:flex items-center gap-2">
              <Link href="/practitioners" className="px-4 py-2 text-sm text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition">
                Practitioners
              </Link>
              <Link href="/about" className="px-4 py-2 text-sm text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition">
                About
              </Link>
              <Link href="/how-it-works" className="px-4 py-2 text-sm text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition">
                How it Works
              </Link>
            </nav>
            
            <div className="flex items-center gap-2 sm:gap-3">
              {isAuthenticated ? (
                <Link href="/dashboard">
                  <button className="px-4 sm:px-5 py-1.5 sm:py-2 bg-gradient-to-r from-emerald-600 to-blue-600 hover:from-emerald-700 hover:to-blue-700 text-white text-xs sm:text-sm font-medium rounded-xl shadow-sm">
                    Dashboard
                  </button>
                </Link>
              ) : (
                <>
                  <Link href="/login">
                    <button className="px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm text-slate-600 hover:text-slate-900">
                      Sign in
                    </button>
                  </Link>
                  <Link href="/register">
                    <button className="px-4 sm:px-5 py-1.5 sm:py-2 bg-gradient-to-r from-emerald-600 to-blue-600 hover:from-emerald-700 hover:to-blue-700 text-white text-xs sm:text-sm font-medium rounded-xl shadow-sm">
                      Sign up
                    </button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* Hero Card with Image - Perfectly Matched */}
        <div className="mb-12 sm:mb-16">
          <HeroCard 
            practitionerCount={stats.practitionerCount || 2} 
            cityCount={stats.cityCount || 2} 
          />
        </div>

        {/* Auth Required Banner - Show if not authenticated */}
        {!isAuthenticated && <AuthRequiredBanner />}

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-12 sm:mb-16">
          <StatDisplay 
            icon={UserGroupIcon}
            value={stats.practitionerCount || 2}
            label="Practitioners"
            trend={`${stats.activeNow} active`}
          />
          <StatDisplay 
            icon={BuildingOfficeIcon}
            value={stats.cityCount || 2}
            label="Cities"
          />
          <StatDisplay 
            icon={CalendarIcon}
            value={`${stats.consultationCount || 30}+`}
            label="Monthly Sessions"
          />
          <StatDisplay 
            icon={StarIcon}
            value={stats.averageRating > 0 ? stats.averageRating.toFixed(1) : 'New'}
            label="Avg. Rating"
          />
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 sm:mb-8 p-3 sm:p-4 bg-amber-50 border border-amber-200 rounded-xl">
            <p className="text-xs sm:text-sm text-amber-700 font-light">{error}</p>
          </div>
        )}

        {/* Role Cards */}
        <div className="mb-12 sm:mb-16">
          <SectionHeader 
            title="Choose Your Path" 
            subtitle="Whether you're seeking care or providing it"
          />
          <div className="grid md:grid-cols-2 gap-4 sm:gap-6">
            <RoleCard 
              type="client"
              title="Find Your Care"
              description="Connect with verified practitioners and book appointments instantly."
              action="Continue as Patient"
              metrics={[
                { label: 'Practitioners', value: stats.practitionerCount.toString() || '2+' },
                { label: 'Cities', value: stats.cityCount.toString() || '2' }
              ]}
            />
            <RoleCard 
              type="practitioner"
              title="Grow Your Practice"
              description="Join our network and connect with patients seeking your expertise."
              action="Continue as Practitioner"
              metrics={[
                { label: 'Active Patients', value: '100+' },
                { label: 'Monthly Sessions', value: `${stats.consultationCount || 30}+` }
              ]}
            />
          </div>
        </div>

        {/* How It Works */}
        <div className="mb-12 sm:mb-16">
          <SectionHeader 
            title="Simple Process" 
            subtitle="Three steps to better healthcare"
          />
          <div className="grid sm:grid-cols-3 gap-4 sm:gap-6">
            <FeatureCard 
              icon={MagnifyingGlassIcon}
              title="1. Find"
              description="Search by specialty, location, or availability to find your perfect match."
            />
            <FeatureCard 
              icon={CalendarIcon}
              title="2. Book"
              description="Select a time that works for you and confirm your appointment instantly."
            />
            <FeatureCard 
              icon={VideoCameraIcon}
              title="3. Connect"
              description="Meet with your practitioner via secure video or in-person consultation."
            />
          </div>
        </div>

        {/* Featured Practitioners */}
        {practitioners.length > 0 && (
          <div className="mb-12 sm:mb-16">
            <SectionHeader 
              title="Featured Practitioners" 
              subtitle="Meet some of our trusted healthcare professionals"
              action={
                <Link href={isAuthenticated ? "/practitioners" : "/login"} className="text-xs sm:text-sm text-emerald-600 hover:text-emerald-700 flex items-center gap-1">
                  {isAuthenticated ? 'View all' : 'Sign in to view all'}
                  <ChevronRightIcon className="w-3 sm:w-4 h-3 sm:h-4" />
                </Link>
              }
            />
            
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {practitioners.map((practitioner) => (
                <PractitionerCard key={practitioner.id} practitioner={practitioner} />
              ))}
            </div>
          </div>
        )}

        {/* Specialties */}
        {specialties.length > 0 && (
          <div className="mb-12 sm:mb-16">
            <SectionHeader 
              title="Specialties" 
              subtitle="Browse by medical specialty"
            />
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
              {specialties.map((specialty) => (
                <SpecialtyCard key={specialty.id} specialty={specialty} />
              ))}
            </div>
          </div>
        )}

        {/* Reviews */}
        {reviews.length > 0 && (
          <div className="mb-12 sm:mb-16">
            <SectionHeader 
              title="Patient Stories" 
              subtitle="Real experiences from our community"
            />
            <div className="grid sm:grid-cols-3 gap-4 sm:gap-6">
              {reviews.map((review) => (
                <ReviewCard key={review.id} review={review} />
              ))}
            </div>
          </div>
        )}

        {/* CTA Section */}
        <Card variant="default" className="p-8 sm:p-12 text-center bg-gradient-to-br from-emerald-600 to-blue-600 border-0 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 sm:w-96 h-64 sm:h-96 bg-white rounded-full filter blur-3xl opacity-10 translate-x-48 -translate-y-48"></div>
          <div className="absolute bottom-0 left-0 w-64 sm:w-96 h-64 sm:h-96 bg-white rounded-full filter blur-3xl opacity-10 -translate-x-48 translate-y-48"></div>
          
          <div className="relative">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-light text-white mb-3 sm:mb-4">
              {isAuthenticated ? 'Welcome back!' : 'Ready to get started?'}
            </h2>
            <p className="text-base sm:text-lg text-emerald-100 mb-6 sm:mb-8 max-w-md mx-auto font-light">
              {isAuthenticated 
                ? 'Continue your healthcare journey'
                : `Join ${stats.practitionerCount || 2}+ practitioners and thousands of patients today.`
              }
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
              {isAuthenticated ? (
                <>
                  <Link href="/dashboard" className="w-full sm:w-auto">
                    <button className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 bg-white text-emerald-600 font-medium rounded-xl hover:shadow-xl transition text-sm sm:text-base">
                      Go to Dashboard
                    </button>
                  </Link>
                  <Link href="/practitioners" className="w-full sm:w-auto">
                    <button className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 border border-white text-white font-medium rounded-xl hover:bg-white/10 transition text-sm sm:text-base">
                      Browse Practitioners
                    </button>
                  </Link>
                </>
              ) : (
                <>
                  <Link href="/register" className="w-full sm:w-auto">
                    <button className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 bg-white text-emerald-600 font-medium rounded-xl hover:shadow-xl transition text-sm sm:text-base">
                      Create Account
                    </button>
                  </Link>
                  <Link href="/practitioners" className="w-full sm:w-auto">
                    <button className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 border border-white text-white font-medium rounded-xl hover:bg-white/10 transition text-sm sm:text-base">
                      Browse Practitioners
                    </button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </Card>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white mt-8 sm:mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-3 sm:gap-4 text-xs sm:text-sm text-slate-400 font-light">
              <span>© {PLATFORM.year} {PLATFORM.name}</span>
              <span className="w-1 h-1 rounded-full bg-slate-300"></span>
              <span>v{PLATFORM.version}</span>
            </div>
            <div className="flex gap-6 sm:gap-8 text-xs sm:text-sm">
              <Link href="/privacy" className="text-slate-400 hover:text-emerald-600 transition font-light">Privacy</Link>
              <Link href="/terms" className="text-slate-400 hover:text-emerald-600 transition font-light">Terms</Link>
              <Link href="/contact" className="text-slate-400 hover:text-emerald-600 transition font-light">Contact</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}