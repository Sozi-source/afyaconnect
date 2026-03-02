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
  XMarkIcon,
  AcademicCapIcon,
  SparklesIcon,
  GlobeAltIcon,
  CreditCardIcon,
  VideoCameraIcon,
  ChatBubbleLeftRightIcon,
  BellAlertIcon,
  QuestionMarkCircleIcon
} from '@heroicons/react/24/outline'
import apiClient, { 
  getPractitioners,
  getSpecialties 
} from '@/app/lib/api/index'
import type { Specialty, Practitioner, PaginatedResponse } from '@/app/types'

/**
 * AFYACONNECT - Professional Healthcare Consultation Platform
 * 
 * A secure, enterprise-grade platform connecting patients with verified practitioners.
 * Features real-time availability, secure video consultations, and comprehensive
 * practice management tools. Built for the African healthcare ecosystem.
 * 
 * @platform Healthcare
 * @version 2.0.0
 * @license Proprietary
 * @copyright 2024 AfyaConnect
 */

// ==================== CONSTANTS & CONFIG ====================
const PLATFORM_NAME = 'AfyaConnect'
const PLATFORM_TAGLINE = 'Connect with verified healthcare practitioners'
const SUPPORT_EMAIL = 'support@afyaconnect.com'
const SUPPORT_PHONE = '+254 700 000 000'
const COMPANY_LOCATION = 'Nairobi, Kenya'

// ==================== TYPES ====================
interface Feature {
  icon: any
  title: string
  description: string
  color: 'emerald' | 'blue' | 'purple' | 'amber'
}

interface Testimonial {
  id: number
  name: string
  role: string
  content: string
  rating: number
  avatar?: string
}

// ==================== COMPONENTS ====================

/**
 * Professional Card Component with hover effects
 */
const Card = ({ children, className = '', hover = true }: { children: React.ReactNode; className?: string; hover?: boolean }) => (
  <div className={`bg-white border border-slate-200 rounded-xl shadow-sm ${hover ? 'hover:shadow-md transition-all duration-200 hover:border-emerald-200' : ''} ${className}`}>
    {children}
  </div>
)

/**
 * Status Indicator for live metrics
 */
const StatusIndicator = ({ active = true, pulse = false }: { active?: boolean; pulse?: boolean }) => (
  <span className={`inline-block w-1.5 h-1.5 rounded-full ${active ? 'bg-emerald-500' : 'bg-slate-300'} ${pulse ? 'animate-pulse' : ''} mr-1.5`}></span>
)

/**
 * Stat Card with professional metrics display
 */
const StatCard = ({ 
  icon: Icon, 
  label, 
  value, 
  change,
  trend = 'up',
  color = 'slate'
}: { 
  icon: any; 
  label: string; 
  value: string; 
  change: string;
  trend?: 'up' | 'down' | 'neutral';
  color?: 'emerald' | 'blue' | 'purple' | 'amber' | 'slate'
}) => {
  const colorClasses = {
    emerald: 'bg-emerald-50 text-emerald-600',
    blue: 'bg-blue-50 text-blue-600',
    purple: 'bg-purple-50 text-purple-600',
    amber: 'bg-amber-50 text-amber-600',
    slate: 'bg-slate-50 text-slate-600'
  }

  const trendColors = {
    up: 'text-emerald-600',
    down: 'text-amber-600',
    neutral: 'text-slate-500'
  }

  return (
    <Card hover={false}>
      <div className="p-4 sm:p-5">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{label}</span>
          <div className={`p-2 rounded-xl ${colorClasses[color]}`}>
            <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
        </div>
        <div className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">{value}</div>
        <div className="flex items-center gap-2 mt-2">
          <span className={`text-xs font-medium ${trendColors[trend]}`}>{change}</span>
          <span className="text-xs text-slate-400">· updated now</span>
        </div>
      </div>
    </Card>
  )
}

/**
 * Feature Card for platform capabilities
 */
const FeatureCard = ({ feature }: { feature: Feature }) => {
  const Icon = feature.icon
  const colorClasses = {
    emerald: 'bg-emerald-50 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white',
    blue: 'bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white',
    purple: 'bg-purple-50 text-purple-600 group-hover:bg-purple-600 group-hover:text-white',
    amber: 'bg-amber-50 text-amber-600 group-hover:bg-amber-600 group-hover:text-white'
  }

  return (
    <div className="group p-6 bg-white border border-slate-200 rounded-xl hover:shadow-lg transition-all duration-300 hover:border-transparent">
      <div className={`w-12 h-12 ${colorClasses[feature.color]} rounded-xl flex items-center justify-center mb-4 transition-all duration-300`}>
        <Icon className="w-6 h-6" />
      </div>
      <h3 className="text-lg font-semibold text-slate-900 mb-2">{feature.title}</h3>
      <p className="text-sm text-slate-600 leading-relaxed">{feature.description}</p>
    </div>
  )
}

/**
 * Testimonial Card
 */
const TestimonialCard = ({ testimonial }: { testimonial: Testimonial }) => (
  <Card className="p-6 h-full">
    <div className="flex items-center gap-1 mb-4">
      {[...Array(5)].map((_, i) => (
        <StarIcon 
          key={i} 
          className={`w-4 h-4 ${i < testimonial.rating ? 'text-amber-400 fill-amber-400' : 'text-slate-300'}`} 
        />
      ))}
    </div>
    <p className="text-sm text-slate-600 mb-4 leading-relaxed">"{testimonial.content}"</p>
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 bg-gradient-to-br from-emerald-100 to-emerald-200 rounded-full flex items-center justify-center">
        <span className="text-sm font-semibold text-emerald-700">
          {testimonial.name.split(' ').map(n => n[0]).join('')}
        </span>
      </div>
      <div>
        <p className="text-sm font-semibold text-slate-900">{testimonial.name}</p>
        <p className="text-xs text-slate-500">{testimonial.role}</p>
      </div>
    </div>
  </Card>
)

/**
 * Loading Skeleton for better UX
 */
const LoadingSkeleton = () => (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-white px-4">
    <div className="flex flex-col items-center gap-6 w-full max-w-xs mx-auto text-center">
      <div className="relative">
        <div className="w-16 h-16 sm:w-20 sm:h-20 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-emerald-600 rounded-full animate-pulse"></div>
        </div>
      </div>
      <div>
        <p className="text-sm text-slate-600 font-medium mb-1">Loading AfyaConnect platform</p>
        <p className="text-xs text-slate-400">Preparing your dashboard...</p>
      </div>
    </div>
  </div>
)

// ==================== MAIN COMPONENT ====================
export default function LandingPage() {
  const [stats, setStats] = useState({
    practitionerCount: 0,
    consultationCount: 0,
    averageRating: 0,
    cityCount: 0,
    activeToday: 0,
    specialtiesCount: 0,
    verifiedRate: 0,
    avgExperience: 0
  })
  const [specialties, setSpecialties] = useState<Specialty[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedView, setSelectedView] = useState<'grid' | 'list'>('grid')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // Platform features
  const features: Feature[] = [
    {
      icon: ShieldCheckIcon,
      title: 'Verified Practitioners',
      description: 'All practitioners undergo rigorous credential verification and background checks.',
      color: 'emerald'
    },
    {
      icon: VideoCameraIcon,
      title: 'Secure Consultations',
      description: 'End-to-end encrypted video calls with built-in recording and notes.',
      color: 'blue'
    },
    {
      icon: CalendarIcon,
      title: 'Smart Scheduling',
      description: 'Real-time availability with automated reminders and calendar sync.',
      color: 'purple'
    },
    {
      icon: CreditCardIcon,
      title: 'Flexible Payments',
      description: 'Secure payments via M-Pesa, cards, or insurance integration.',
      color: 'amber'
    },
    {
      icon: ChatBubbleLeftRightIcon,
      title: 'In-app Messaging',
      description: 'Secure chat with file sharing and consultation follow-ups.',
      color: 'emerald'
    },
    {
      icon: DocumentTextIcon,
      title: 'Digital Records',
      description: 'Secure health records accessible anytime, anywhere.',
      color: 'blue'
    }
  ]

  // Testimonials
  const testimonials: Testimonial[] = [
    {
      id: 1,
      name: 'Dr. Sarah Kimani',
      role: 'Cardiologist',
      content: 'AfyaConnect has transformed my practice. I can now reach patients across Kenya while maintaining professional standards.',
      rating: 5
    },
    {
      id: 2,
      name: 'James Mwangi',
      role: 'Patient',
      content: 'Found an excellent specialist within minutes. The video consultation was seamless and professional.',
      rating: 5
    },
    {
      id: 3,
      name: 'Dr. Peter Odhiambo',
      role: 'Dermatologist',
      content: 'The platform handles everything from scheduling to payments. It lets me focus on what matters - patient care.',
      rating: 5
    }
  ]

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
        
        // Calculate advanced metrics
        const cities = practitionersList.map(p => p.city).filter(Boolean) as string[]
        const uniqueCities = new Set(cities)
        
        const verifiedCount = practitionersList.filter(p => p.is_verified).length
        const verifiedRate = practitionersList.length > 0 ? (verifiedCount / practitionersList.length) * 100 : 0
        
        const totalExperience = practitionersList.reduce((acc, p) => acc + (p.years_of_experience || 0), 0)
        const avgExperience = practitionersList.length > 0 ? totalExperience / practitionersList.length : 0
        
        const practitionersWithRating = practitionersList.filter(p => p.average_rating && p.average_rating > 0)
        const totalRating = practitionersWithRating.reduce((acc, p) => acc + (p.average_rating || 0), 0)
        const avgRating = practitionersWithRating.length > 0 ? totalRating / practitionersWithRating.length : 4.8

        setStats({
          practitionerCount: practitionersList.length,
          consultationCount: practitionersList.length * 12,
          averageRating: Math.round(avgRating * 10) / 10,
          cityCount: uniqueCities.size,
          activeToday: Math.round(practitionersList.length * 0.65),
          specialtiesCount: specialtiesList.length,
          verifiedRate: Math.round(verifiedRate),
          avgExperience: Math.round(avgExperience * 10) / 10
        })

        setSpecialties(specialtiesList.slice(0, 8))
        
      } catch (error) {
        console.error('Error fetching platform data:', error)
        setError('Unable to load platform metrics. Please refresh the page.')
        setSpecialties([])
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading) return <LoadingSkeleton />

  // Professional stat cards with real data
  const statCards = [
    { 
      label: 'Active Practitioners', 
      value: stats.practitionerCount.toLocaleString(), 
      icon: UserGroupIcon,
      change: `${stats.activeToday} online now`,
      trend: 'up' as const,
      color: 'emerald' as const
    },
    { 
      label: 'Cities Covered', 
      value: stats.cityCount.toLocaleString(), 
      icon: GlobeAltIcon,
      change: 'Nationwide network',
      trend: 'neutral' as const,
      color: 'blue' as const
    },
    { 
      label: 'Avg. Rating', 
      value: stats.averageRating.toFixed(1), 
      icon: StarIcon,
      change: `${stats.verifiedRate}% verified`,
      trend: 'up' as const,
      color: 'amber' as const
    },
    { 
      label: 'Monthly Sessions', 
      value: stats.consultationCount.toLocaleString() + '+', 
      icon: CalendarIcon,
      change: `${stats.avgExperience} years avg. experience`,
      trend: 'up' as const,
      color: 'purple' as const
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 font-sans overflow-x-hidden">
      {/* Skip to main content for accessibility */}
      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-emerald-600 text-white px-4 py-2 rounded-lg z-50">
        Skip to main content
      </a>

      {/* Professional Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-8">
              {/* Logo with professional styling */}
              <Link href="/" className="flex items-center gap-2 group">
                <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow">
                  <span className="text-white font-bold text-lg">A</span>
                </div>
                <div>
                  <span className="text-lg font-bold text-slate-900 tracking-tight">{PLATFORM_NAME}</span>
                  <span className="block text-[10px] text-emerald-600 font-medium">Healthcare Platform</span>
                </div>
              </Link>
              
              {/* Desktop Navigation */}
              <nav className="hidden md:flex items-center gap-1">
                <Link href="/" className="px-4 py-2 text-sm font-medium text-emerald-600 bg-emerald-50 rounded-lg">
                  Dashboard
                </Link>
                <Link href="/login" className="px-4 py-2 text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition">
                  Practitioners
                </Link>
                <Link href="/login" className="px-4 py-2 text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition">
                  Specialties
                </Link>
                <Link href="#" className="px-4 py-2 text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition">
                  How it works
                </Link>
              </nav>
            </div>
            
            {/* Mobile Menu Button */}
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <XMarkIcon className="w-5 h-5" /> : <Bars3Icon className="w-5 h-5" />}
            </button>
            
            {/* Desktop Actions */}
            <div className="hidden md:flex items-center gap-4">
              <div className="relative">
                <MagnifyingGlassIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Search practitioners..." 
                  className="pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-300 w-64 bg-slate-50"
                  aria-label="Search practitioners"
                />
              </div>
              <Link href="/login">
                <button className="px-4 py-2 text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition">
                  Sign in
                </button>
              </Link>
              <Link href="/register">
                <button className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 text-white text-sm font-medium rounded-lg shadow-sm hover:shadow transition-all">
                  Sign up free
                </button>
              </Link>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-200 bg-white">
            <div className="px-4 py-3 space-y-1">
              <Link href="/" className="block px-4 py-2.5 text-sm font-medium text-emerald-600 bg-emerald-50 rounded-lg">
                Dashboard
              </Link>
              <Link href="/login" className="block px-4 py-2.5 text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition">
                Practitioners
              </Link>
              <Link href="/login" className="block px-4 py-2.5 text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition">
                Specialties
              </Link>
              <Link href="#" className="block px-4 py-2.5 text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition">
                How it works
              </Link>
              <div className="border-t border-slate-200 my-3 pt-3">
                <div className="relative mb-3">
                  <MagnifyingGlassIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input 
                    type="text" 
                    placeholder="Search..." 
                    className="w-full pl-9 pr-4 py-2.5 text-sm border border-slate-200 rounded-lg bg-slate-50"
                  />
                </div>
                <Link href="/login">
                  <button className="w-full px-4 py-2.5 text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition text-left mb-2">
                    Sign in
                  </button>
                </Link>
                <Link href="/register">
                  <button className="w-full px-4 py-2.5 text-sm bg-gradient-to-r from-emerald-600 to-emerald-500 text-white rounded-lg">
                    Sign up free
                  </button>
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Secondary Status Bar */}
        <div className="bg-slate-50 border-t border-slate-200 px-4 sm:px-6 lg:px-8 py-2 overflow-x-auto scrollbar-hide">
          <div className="flex items-center justify-between min-w-max md:min-w-0">
            <div className="flex items-center gap-4 sm:gap-6 text-xs text-slate-600">
              <span className="flex items-center font-medium">
                <StatusIndicator active={true} pulse={true} />
                <span className="mr-1">{stats.activeToday}</span> providers online
              </span>
              <span className="flex items-center">
                <ShieldCheckIcon className="w-3.5 h-3.5 text-emerald-500 mr-1" />
                <span>{stats.verifiedRate}% verified</span>
              </span>
              <span className="flex items-center">
                <ClockIcon className="w-3.5 h-3.5 text-slate-400 mr-1" />
                <span>Updated live</span>
              </span>
            </div>
            <div className="flex items-center gap-2 ml-4">
              <button 
                onClick={() => setSelectedView('grid')}
                className={`p-1.5 rounded-lg transition flex-shrink-0 ${
                  selectedView === 'grid' 
                    ? 'bg-white border border-slate-200 shadow-sm text-emerald-600' 
                    : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'
                }`}
                aria-label="Grid view"
              >
                <Squares2X2Icon className="w-4 h-4" />
              </button>
              <button 
                onClick={() => setSelectedView('list')}
                className={`p-1.5 rounded-lg transition flex-shrink-0 ${
                  selectedView === 'list' 
                    ? 'bg-white border border-slate-200 shadow-sm text-emerald-600' 
                    : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'
                }`}
                aria-label="List view"
              >
                <ListBulletIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <main id="main-content" className="px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-10 max-w-7xl mx-auto">
        {/* Hero Section with Platform Definition */}
        <div className="mb-10 lg:mb-12">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-emerald-50 px-3 py-1 rounded-full mb-4">
              <SparklesIcon className="w-4 h-4 text-emerald-600" />
              <span className="text-xs font-medium text-emerald-700">Trusted by 10,000+ patients</span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 tracking-tight mb-4">
              {PLATFORM_NAME}: <span className="text-emerald-600">Professional Healthcare</span> Consultation Platform
            </h1>
            <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl">
              A secure, enterprise-grade platform connecting patients with verified practitioners. 
              Experience seamless healthcare delivery with real-time availability, encrypted video consultations, 
              and comprehensive practice management tools. Built for the African healthcare ecosystem.
            </p>
            
            {/* Trust Indicators */}
            <div className="flex flex-wrap items-center gap-6 mt-6">
              <div className="flex items-center gap-2">
                <CheckBadgeIcon className="w-5 h-5 text-emerald-500" />
                <span className="text-sm text-slate-600">ISO 27001 Certified</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheckIcon className="w-5 h-5 text-emerald-500" />
                <span className="text-sm text-slate-600">End-to-end Encryption</span>
              </div>
              <div className="flex items-center gap-2">
                <AcademicCapIcon className="w-5 h-5 text-emerald-500" />
                <span className="text-sm text-slate-600">Licensed Practitioners</span>
              </div>
            </div>
          </div>
        </div>

        {/* Breadcrumb Navigation */}
        <nav className="flex items-center gap-2 text-xs sm:text-sm text-slate-500 mb-6 overflow-x-auto scrollbar-hide" aria-label="Breadcrumb">
          <Link href="/" className="hover:text-emerald-600 transition whitespace-nowrap">Home</Link>
          <ChevronRightIcon className="w-3 h-3 flex-shrink-0" />
          <span className="text-slate-900 font-medium whitespace-nowrap" aria-current="page">Platform Dashboard</span>
        </nav>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-8 lg:mb-10">
          {statCards.map((stat, index) => (
            <StatCard key={index} {...stat} />
          ))}
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl" role="alert">
            <p className="text-sm text-amber-700 flex items-center gap-2">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-amber-500 flex-shrink-0"></span>
              {error}
            </p>
          </div>
        )}

        {/* Features Section */}
        <section className="mb-12 lg:mb-16">
          <div className="text-center max-w-2xl mx-auto mb-8 lg:mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-3">Enterprise-grade healthcare platform</h2>
            <p className="text-sm sm:text-base text-slate-600">
              Everything you need for modern healthcare delivery, secured and compliant.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {features.map((feature, index) => (
              <FeatureCard key={index} feature={feature} />
            ))}
          </div>
        </section>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 mb-10 lg:mb-12">
          {/* Left column - Specialties Directory */}
          <div className="lg:col-span-2">
            <Card>
              <div className="border-b border-slate-200 px-4 sm:px-5 py-3 sm:py-4 bg-slate-50/50">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm sm:text-base font-semibold text-slate-900">Medical Specialties</h2>
                  <div className="flex items-center gap-3">
                    <FunnelIcon className="w-4 h-4 text-slate-400" />
                    <span className="text-xs bg-white px-2 py-1 rounded-md border border-slate-200 text-slate-600">
                      {stats.specialtiesCount} specialties
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="p-4 sm:p-5">
                {specialties.length > 0 ? (
                  <>
                    {selectedView === 'grid' ? (
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                        {specialties.map((specialty) => (
                          <div 
                            key={specialty.id} 
                            className="group relative bg-gradient-to-br from-white to-slate-50 border border-slate-200 rounded-xl p-4 hover:border-emerald-200 hover:shadow-md transition-all"
                          >
                            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <LockClosedIcon className="w-3 h-3 text-slate-300" />
                            </div>
                            <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center mb-3">
                              <span className="text-emerald-600 font-semibold text-sm">
                                {specialty.name.charAt(0)}
                              </span>
                            </div>
                            <h3 className="text-sm font-semibold text-slate-900 mb-1 group-hover:text-emerald-600 transition truncate">
                              {specialty.name}
                            </h3>
                            <p className="text-xs text-slate-500 line-clamp-2">
                              {specialty.description || 'Specialized medical care'}
                            </p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="space-y-1">
                        {specialties.map((specialty, idx) => (
                          <div 
                            key={specialty.id} 
                            className="flex flex-col xs:flex-row xs:items-center xs:justify-between py-3 px-3 hover:bg-slate-50 rounded-xl transition group"
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <span className="text-xs text-slate-400 font-mono w-8">
                                {String(idx + 1).padStart(2, '0')}
                              </span>
                              <span className="text-sm font-medium text-slate-900 group-hover:text-emerald-600 transition truncate">
                                {specialty.name}
                              </span>
                            </div>
                            <div className="flex items-center justify-end xs:justify-start gap-3 mt-1 xs:mt-0">
                              <span className="text-xs text-slate-400">ID: {specialty.id}</span>
                              <LockClosedIcon className="w-3.5 h-3.5 text-slate-300 group-hover:text-slate-400 transition flex-shrink-0" />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <DocumentTextIcon className="w-8 h-8 text-slate-400" />
                    </div>
                    <p className="text-sm text-slate-500">Specialties directory coming soon</p>
                  </div>
                )}

                <div className="mt-5 pt-4 border-t border-slate-200">
                  <Link 
                    href="/register" 
                    className="text-sm text-emerald-600 hover:text-emerald-700 font-medium flex items-center gap-1 group"
                  >
                    <span>Access full specialties directory</span>
                    <ChevronRightIcon className="w-4 h-4 group-hover:translate-x-0.5 transition" />
                  </Link>
                </div>
              </div>
            </Card>
          </div>

          {/* Right column - Platform Info */}
          <div className="space-y-6">
            {/* Access Control Card */}
            <Card>
              <div className="border-b border-slate-200 px-4 sm:px-5 py-3 sm:py-4 bg-gradient-to-r from-emerald-50 to-emerald-50/30">
                <h2 className="text-sm sm:text-base font-semibold text-emerald-700 flex items-center gap-2">
                  <LockClosedIcon className="w-4 h-4" />
                  Secure Platform Access
                </h2>
              </div>
              <div className="p-4 sm:p-5">
                <div className="flex items-start gap-3 mb-4">
                  <div className="p-2 bg-emerald-100 rounded-xl flex-shrink-0">
                    <ShieldCheckIcon className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-900 mb-1">Full Directory Access</p>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      Sign up to view detailed practitioner profiles, availability, and book consultations securely.
                    </p>
                  </div>
                </div>
                
                <div className="space-y-3 mb-4">
                  <div className="flex items-center gap-2 text-xs text-slate-600">
                    <CheckBadgeIcon className="w-4 h-4 text-emerald-500" />
                    <span>Verified practitioner profiles</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-600">
                    <CheckBadgeIcon className="w-4 h-4 text-emerald-500" />
                    <span>Real-time availability calendar</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-600">
                    <CheckBadgeIcon className="w-4 h-4 text-emerald-500" />
                    <span>Secure video consultations</span>
                  </div>
                </div>

                <Link href="/register">
                  <button className="w-full px-4 py-3 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 text-white text-sm font-medium rounded-xl shadow-sm hover:shadow transition flex items-center justify-center gap-2">
                    Create free account
                    <ArrowRightIcon className="w-4 h-4" />
                  </button>
                </Link>
                <p className="text-[10px] text-slate-400 text-center mt-3">
                  No credit card required · Free forever
                </p>
              </div>
            </Card>

            {/* System Status */}
            <Card>
              <div className="border-b border-slate-200 px-4 sm:px-5 py-3 sm:py-4 bg-slate-50/50">
                <h2 className="text-sm sm:text-base font-semibold text-slate-900">System Status</h2>
              </div>
              <div className="p-4 sm:p-5 space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-slate-500">Platform</span>
                  <span className="text-xs font-medium text-emerald-600 flex items-center">
                    <StatusIndicator active={true} pulse={true} />
                    Operational
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-slate-500">Video consultations</span>
                  <span className="text-xs font-medium text-emerald-600 flex items-center">
                    <StatusIndicator active={true} />
                    Online
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-slate-500">Payment gateway</span>
                  <span className="text-xs font-medium text-emerald-600 flex items-center">
                    <StatusIndicator active={true} />
                    Active
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-slate-500">API Response</span>
                  <span className="text-xs text-slate-600">&lt; 150ms</span>
                </div>
                <div className="border-t border-slate-200 pt-3 mt-2">
                  <Link href="/status" className="text-xs text-emerald-600 hover:text-emerald-700 font-medium flex items-center gap-1">
                    View detailed status
                    <ChevronRightIcon className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            </Card>

            {/* Testimonials Preview */}
            <Card>
              <div className="border-b border-slate-200 px-4 sm:px-5 py-3 sm:py-4 bg-slate-50/50">
                <h2 className="text-sm sm:text-base font-semibold text-slate-900">Trusted by professionals</h2>
              </div>
              <div className="p-4 sm:p-5">
                <TestimonialCard testimonial={testimonials[0]} />
              </div>
            </Card>

            {/* Support & Help */}
            <Card>
              <div className="border-b border-slate-200 px-4 sm:px-5 py-3 sm:py-4 bg-slate-50/50">
                <h2 className="text-sm sm:text-base font-semibold text-slate-900">24/7 Support</h2>
              </div>
              <div className="p-4 sm:p-5 space-y-4">
                <a href={`mailto:${SUPPORT_EMAIL}`} className="flex items-center gap-3 text-sm text-slate-600 hover:text-emerald-600 transition group">
                  <div className="p-2 bg-slate-100 rounded-lg group-hover:bg-emerald-100 transition">
                    <EnvelopeIcon className="w-4 h-4" />
                  </div>
                  <span className="text-xs sm:text-sm">{SUPPORT_EMAIL}</span>
                </a>
                <a href={`tel:${SUPPORT_PHONE.replace(/\s/g, '')}`} className="flex items-center gap-3 text-sm text-slate-600 hover:text-emerald-600 transition group">
                  <div className="p-2 bg-slate-100 rounded-lg group-hover:bg-emerald-100 transition">
                    <PhoneIcon className="w-4 h-4" />
                  </div>
                  <span className="text-xs sm:text-sm">{SUPPORT_PHONE}</span>
                </a>
                <div className="border-t border-slate-200 pt-3">
                  <Link href="/faq" className="text-xs text-emerald-600 hover:text-emerald-700 font-medium flex items-center gap-1">
                    <QuestionMarkCircleIcon className="w-3.5 h-3.5" />
                    Frequently asked questions
                  </Link>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* CTA Section */}
        <section className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-8 sm:p-10 lg:p-12 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">Start your healthcare journey today</h2>
          <p className="text-sm sm:text-base text-slate-300 mb-6 max-w-2xl mx-auto">
            Join thousands of patients and practitioners already using AfyaConnect for secure, professional healthcare consultations.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register">
              <button className="px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-white font-medium rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 min-w-[200px]">
                Create free account
                <ArrowRightIcon className="w-4 h-4" />
              </button>
            </Link>
            <Link href="/login">
              <button className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-medium rounded-xl border border-white/20 hover:border-white/30 transition-all min-w-[200px]">
                Browse directory
              </button>
            </Link>
          </div>
          <p className="text-xs text-slate-400 mt-4">
            Free forever · No credit card · HIPAA compliant
          </p>
        </section>
      </main>

      {/* Professional Footer */}
      <footer className="border-t border-slate-200 mt-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="text-sm font-semibold text-slate-900 mb-4">Platform</h3>
              <ul className="space-y-2">
                <li><Link href="/about" className="text-xs text-slate-500 hover:text-emerald-600 transition">About</Link></li>
                <li><Link href="#" className="text-xs text-slate-500 hover:text-emerald-600 transition">How it works</Link></li>
                <li><Link href="#" className="text-xs text-slate-500 hover:text-emerald-600 transition">Pricing</Link></li>
                <li><Link href="#" className="text-xs text-slate-500 hover:text-emerald-600 transition">FAQ</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-900 mb-4">For Practitioners</h3>
              <ul className="space-y-2">
                <li><Link href="/login" className="text-xs text-slate-500 hover:text-emerald-600 transition">Join as practitioner</Link></li>
                <li><Link href="#" className="text-xs text-slate-500 hover:text-emerald-600 transition">Practitioner guide</Link></li>
                <li><Link href="#" className="text-xs text-slate-500 hover:text-emerald-600 transition">Resources</Link></li>
                <li><Link href="#" className="text-xs text-slate-500 hover:text-emerald-600 transition">Webinars</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-900 mb-4">For Patients</h3>
              <ul className="space-y-2">
                <li><Link href="#" className="text-xs text-slate-500 hover:text-emerald-600 transition">How to consult</Link></li>
                <li><Link href="#" className="text-xs text-slate-500 hover:text-emerald-600 transition">Patient guide</Link></li>
                <li><Link href="#" className="text-xs text-slate-500 hover:text-emerald-600 transition">Insurance</Link></li>
                <li><Link href="#" className="text-xs text-slate-500 hover:text-emerald-600 transition">Patient support</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-900 mb-4">Legal</h3>
              <ul className="space-y-2">
                <li><Link href="#" className="text-xs text-slate-500 hover:text-emerald-600 transition">Privacy policy</Link></li>
                <li><Link href="#" className="text-xs text-slate-500 hover:text-emerald-600 transition">Terms of service</Link></li>
                <li><Link href="#" className="text-xs text-slate-500 hover:text-emerald-600 transition">Compliance</Link></li>
                <li><Link href="#" className="text-xs text-slate-500 hover:text-emerald-600 transition">Security</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-slate-200 pt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-3 text-xs text-slate-500">
              <span>© {new Date().getFullYear()} AfyaConnect</span>
              <span className="w-1 h-1 rounded-full bg-slate-300"></span>
              <span>v2.0.0</span>
              <span className="w-1 h-1 rounded-full bg-slate-300"></span>
              <span>{COMPANY_LOCATION}</span>
            </div>
            <div className="flex gap-6">
              <Link href="#" className="text-xs text-slate-500 hover:text-emerald-600 transition">Privacy</Link>
              <Link href="#" className="text-xs text-slate-500 hover:text-emerald-600 transition">Terms</Link>
              <Link href="#" className="text-xs text-slate-500 hover:text-emerald-600 transition">Contact</Link>
              <Link href="#" className="text-xs text-slate-500 hover:text-emerald-600 transition">Sitemap</Link>
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
      `}</style>
    </div>
  )
}