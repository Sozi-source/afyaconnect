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
  ChevronRightIcon,
  HeartIcon,
  VideoCameraIcon,
  MagnifyingGlassIcon,
  MapPinIcon,
  BriefcaseIcon,
  ArrowRightIcon,
  SparklesIcon,
  LockClosedIcon,
  BoltIcon,
  ChatBubbleLeftRightIcon,
  DocumentTextIcon,
  GlobeAltIcon
} from '@heroicons/react/24/outline'
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid'
import { 
  getPractitioners, 
  getSpecialties 
} from '@/app/lib/api/index'
import type { 
  Practitioner, 
  Specialty,
  PaginatedResponse 
} from '@/app/types'

// ==================== SYSTEM CONSTANTS ====================
const PLATFORM = {
  name: 'AfyaConnect',
  year: new Date().getFullYear(),
  version: '1.0.0'
}

// ==================== CORE COMPONENTS ====================

// Unified Card System
const Card = ({ 
  children, 
  interactive = true,
  className = '' 
}: { 
  children: React.ReactNode
  interactive?: boolean
  className?: string
}) => {
  const baseClasses = 'bg-white border border-slate-200 rounded-xl p-5 w-full'
  const interactiveClasses = interactive ? 'hover:border-emerald-200 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200' : ''
  
  return (
    <div className={`${baseClasses} ${interactiveClasses} ${className}`}>
      {children}
    </div>
  )
}

// Hero Section
const HeroSection = ({ 
  practitionerCount, 
  cityCount 
}: { 
  practitionerCount: number
  cityCount: number 
}) => (
  <div className="grid lg:grid-cols-2 gap-6 md:gap-8 items-stretch max-w-6xl mx-auto">
    {/* Left Content - Main Hero */}
    <div className="bg-gradient-to-br from-white to-emerald-50/30 border border-slate-200 rounded-2xl p-6 sm:p-8 md:p-10 lg:p-12 relative overflow-hidden h-full flex flex-col">
      <div className="absolute top-0 right-0 w-64 sm:w-80 md:w-96 h-64 sm:h-80 md:h-96 bg-gradient-to-br from-emerald-200/30 to-blue-200/30 rounded-full blur-3xl -translate-y-48 translate-x-48"></div>
      <div className="absolute bottom-0 left-0 w-64 sm:w-80 md:w-96 h-64 sm:h-80 md:h-96 bg-gradient-to-tr from-emerald-200/20 to-blue-200/20 rounded-full blur-3xl translate-y-48 -translate-x-48"></div>
      
      <div className="relative flex-1 flex flex-col z-10">
        {/* Trust Badge */}
        <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-emerald-100/80 rounded-full mb-6 sm:mb-8 border border-emerald-200/50 shadow-sm w-fit">
          <div className="p-1 bg-emerald-600 rounded-full">
            <ShieldCheckIcon className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-white" />
          </div>
          <span className="text-xs sm:text-sm font-semibold text-emerald-800 tracking-wide">
            {practitionerCount}+ Verified Practitioners
          </span>
        </div>
        
        {/* Main Headline */}
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-4 sm:mb-6">
          <span className="bg-gradient-to-r from-emerald-600 to-emerald-700 bg-clip-text text-transparent">
            AfyaConnect
          </span>
        </h1>
        
        {/* Supporting Text */}
        <p className="text-base sm:text-lg md:text-xl text-slate-600 mb-6 sm:mb-8 max-w-md font-light leading-relaxed">
          Book appointments instantly with verified practitioners across{' '}
          <span className="font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-lg inline-block">
            {cityCount} cities
          </span>
        </p>
        
        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mt-auto">
          <Link href="/login" className="w-full sm:w-auto flex-1">
            <button className="group w-full px-6 sm:px-8 py-3 sm:py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 inline-flex items-center justify-center gap-2 sm:gap-3 text-sm sm:text-base">
              <span>Sign In to Book</span>
              <LockClosedIcon className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </Link>
          <Link href="#" className="w-full sm:w-auto flex-1">
            <button className="group w-full px-6 sm:px-8 py-3 sm:py-4 bg-white border-2 border-slate-200 hover:border-emerald-300 text-slate-700 font-semibold rounded-xl hover:shadow-lg transition-all duration-200 inline-flex items-center justify-center gap-2 text-sm sm:text-base">
              <span>How it Works</span>
              <ChevronRightIcon className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </Link>
        </div>
        
        {/* Trust Indicators */}
        <div className="flex flex-wrap items-center gap-3 sm:gap-4 mt-6 sm:mt-8 text-xs sm:text-sm">
          <span className="flex items-center gap-1.5 sm:gap-2 text-slate-500">
            <div className="p-1 bg-emerald-100 rounded-full">
              <SparklesIcon className="w-3 h-3 sm:w-4 sm:h-4 text-emerald-600" />
            </div>
            Free to join
          </span>
          <span className="w-1 h-1 rounded-full bg-emerald-300"></span>
          <span className="flex items-center gap-1.5 sm:gap-2 text-slate-500">
            <div className="p-1 bg-emerald-100 rounded-full">
              <ShieldCheckIcon className="w-3 h-3 sm:w-4 sm:h-4 text-emerald-600" />
            </div>
            Verified only
          </span>
          <span className="w-1 h-1 rounded-full bg-emerald-300"></span>
          <span className="flex items-center gap-1.5 sm:gap-2 text-slate-500">
            <div className="p-1 bg-emerald-100 rounded-full">
              <ClockIcon className="w-3 h-3 sm:w-4 sm:h-4 text-emerald-600" />
            </div>
            Secure booking
          </span>
        </div>
      </div>
    </div>

    {/* Right Side - 3 Cards */}
    <div className="hidden lg:flex flex-col gap-4 h-full">
      {/* Card 1 - Instant Booking */}
      <Card>
        <div className="flex items-start gap-4">
          <div className="p-3 bg-emerald-100 rounded-xl flex-shrink-0">
            <BoltIcon className="w-5 h-5 text-emerald-700" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-slate-900">Instant Booking</h3>
              <span className="text-xs font-medium text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">30 sec</span>
            </div>
            <p className="text-sm text-slate-600">Book appointments in under 60 seconds with real-time availability</p>
          </div>
        </div>
      </Card>

      {/* Card 2 - Virtual Care */}
      <Card>
        <div className="flex items-start gap-4">
          <div className="p-3 bg-emerald-100 rounded-xl flex-shrink-0">
            <VideoCameraIcon className="w-5 h-5 text-emerald-700" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-slate-900">Virtual Consultations</h3>
              <span className="text-xs font-medium text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">HD</span>
            </div>
            <p className="text-sm text-slate-600">Secure video calls with practitioners from anywhere, anytime</p>
          </div>
        </div>
      </Card>

      {/* Card 3 - Verified Practitioners */}
      <Card>
        <div className="flex items-start gap-4">
          <div className="p-3 bg-emerald-100 rounded-xl flex-shrink-0">
            <ShieldCheckIcon className="w-5 h-5 text-emerald-700" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-slate-900">100% Verified</h3>
              <span className="text-xs font-medium text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">Trusted</span>
            </div>
            <p className="text-sm text-slate-600">All practitioners undergo rigorous credential verification</p>
          </div>
        </div>
      </Card>

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-2 mt-2">
        <div className="bg-emerald-50 rounded-xl p-3 text-center border border-emerald-100">
          <div className="text-base font-bold text-emerald-800">{practitionerCount}+</div>
          <div className="text-xs text-emerald-600">Practitioners</div>
        </div>
        <div className="bg-emerald-50 rounded-xl p-3 text-center border border-emerald-100">
          <div className="text-base font-bold text-emerald-800">{cityCount}+</div>
          <div className="text-xs text-emerald-600">Cities</div>
        </div>
        <div className="bg-emerald-50 rounded-xl p-3 text-center border border-emerald-100">
          <div className="text-base font-bold text-emerald-800">24/7</div>
          <div className="text-xs text-emerald-600">Access</div>
        </div>
      </div>
    </div>
  </div>
)

// Role Badge
const RoleBadge = ({ role }: { role: 'client' | 'practitioner' }) => {
  const roles = {
    client: { icon: HeartIcon, label: 'For Patients' },
    practitioner: { icon: BriefcaseIcon, label: 'For Doctors' }
  }
  
  const Icon = roles[role].icon
  
  return (
    <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-100 text-emerald-700">
      <Icon className="w-4 h-4" />
      <span className="text-sm font-medium">{roles[role].label}</span>
    </div>
  )
}

// Stat Display
const StatDisplay = ({ 
  icon: Icon, 
  value, 
  label
}: { 
  icon: any
  value: string | number
  label: string
}) => (
  <Card interactive={false} className="p-4 md:p-5">
    <div className="flex items-start justify-between mb-2">
      <div className="p-2 bg-emerald-100 rounded-lg">
        <Icon className="w-4 h-4 text-emerald-700" />
      </div>
    </div>
    <div className="text-xl md:text-2xl font-light text-slate-900 mb-0.5">{value}</div>
    <div className="text-xs sm:text-sm text-slate-500 font-light">{label}</div>
  </Card>
)

// Role Card - With login prompt
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
  <Card className="p-6 md:p-7 h-full flex flex-col relative group">
    {/* Blur overlay for login prompt */}
    <div className="absolute inset-0 bg-white/80 backdrop-blur-[2px] rounded-xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10">
      <div className="text-center p-4">
        <LockClosedIcon className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
        <p className="text-sm text-slate-600 font-light mb-3">Sign in to access</p>
        <div className="flex gap-2">
          <Link href="/login">
            <button className="px-4 py-2 bg-emerald-600 text-white text-xs font-medium rounded-lg hover:bg-emerald-700 transition">
              Sign In
            </button>
          </Link>
          <Link href="/register">
            <button className="px-4 py-2 bg-white text-emerald-600 text-xs font-medium rounded-lg border border-emerald-600 hover:bg-emerald-50 transition">
              Sign Up
            </button>
          </Link>
        </div>
      </div>
    </div>

    <div className="relative">
      <div className="flex items-start justify-between mb-4">
        <RoleBadge role={type} />
        <div className="text-2xl">
          {type === 'client' ? '👤' : '👨‍⚕️'}
        </div>
      </div>
      
      <h3 className="text-xl md:text-2xl font-light text-slate-900 mb-2">{title}</h3>
      <p className="text-sm text-slate-500 font-light mb-6 leading-relaxed flex-grow">{description}</p>
      
      <div className="grid grid-cols-2 gap-3 mb-6">
        {metrics.map((metric, idx) => (
          <div key={idx} className="bg-emerald-50 rounded-xl p-3">
            <div className="text-base md:text-lg font-medium text-emerald-800">{metric.value}</div>
            <div className="text-xs text-emerald-600 font-light">{metric.label}</div>
          </div>
        ))}
      </div>
      
      <div className="inline-flex items-center justify-between w-full text-sm font-medium text-slate-400 border-t border-slate-100 pt-4">
        <span>Sign in to {action.toLowerCase()}</span>
        <LockClosedIcon className="w-4 h-4" />
      </div>
    </div>
  </Card>
)

// Practitioner Card - With login prompt
const PractitionerCard = ({ 
  practitioner 
}: { 
  practitioner: Practitioner 
}) => (
  <div className="relative group">
    <Card className="p-5">
      {/* Blur overlay for login prompt */}
      <div className="absolute inset-0 bg-white/80 backdrop-blur-[2px] rounded-xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10">
        <div className="text-center p-4">
          <LockClosedIcon className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
          <p className="text-sm text-slate-600 font-light mb-3">Sign in to view full profile</p>
          <div className="flex gap-2">
            <Link href="/login">
              <button className="px-4 py-2 bg-emerald-600 text-white text-xs font-medium rounded-lg hover:bg-emerald-700 transition">
                Sign In
              </button>
            </Link>
            <Link href="/register">
              <button className="px-4 py-2 bg-white text-emerald-600 text-xs font-medium rounded-lg border border-emerald-600 hover:bg-emerald-50 transition">
                Sign Up
              </button>
            </Link>
          </div>
        </div>
      </div>

      <div className="relative">
        <div className="flex items-start gap-3 mb-3">
          <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center text-emerald-700 font-medium text-base flex-shrink-0">
            {practitioner.first_name?.charAt(0) || 'D'}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1 mb-0.5">
              <h4 className="text-sm font-medium text-slate-900 truncate">
                {practitioner.full_name || `Dr. ${practitioner.first_name} ${practitioner.last_name}`}
              </h4>
              {practitioner.is_verified && (
                <CheckBadgeIcon className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              )}
            </div>
            <p className="text-xs text-slate-500 font-light truncate">
              {practitioner.specialties?.map(s => s.name).join(' • ') || 'Specialist'}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-3 text-xs text-slate-500 mb-3">
          {practitioner.city && (
            <div className="flex items-center gap-1">
              <MapPinIcon className="w-3.5 h-3.5" />
              <span className="font-light truncate">{practitioner.city}</span>
            </div>
          )}
          {practitioner.average_rating ? (
            <div className="flex items-center gap-1">
              <StarIconSolid className="w-3.5 h-3.5 text-amber-400" />
              <span className="font-light">{practitioner.average_rating.toFixed(1)}</span>
            </div>
          ) : (
            <div className="flex items-center gap-1">
              <StarIcon className="w-3.5 h-3.5 text-slate-300" />
              <span className="text-slate-400 font-light">New</span>
            </div>
          )}
        </div>
        
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-400 font-medium">Sign in to view profile</span>
          <LockClosedIcon className="w-3.5 h-3.5 text-slate-400" />
        </div>
      </div>
    </Card>
  </div>
)

// Simple Process Card - Clickable cards horizontally aligned
const SimpleProcessCard = () => (
  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
    {/* Step 1 - Clickable Card */}
    <Link href="#" className="block">
      <Card interactive={true} className="p-6 text-center h-full">
        <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <MagnifyingGlassIcon className="w-8 h-8 text-emerald-700" />
        </div>
        <h4 className="text-lg font-semibold text-slate-900 mb-2">1. Find</h4>
        <p className="text-sm text-slate-500">Search by specialty or location</p>
        <div className="mt-4 text-xs text-emerald-600 font-medium flex items-center justify-center gap-1">
          Learn more <ChevronRightIcon className="w-3 h-3" />
        </div>
      </Card>
    </Link>

    {/* Step 2 - Clickable Card */}
    <Link href="#" className="block">
      <Card interactive={true} className="p-6 text-center h-full">
        <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <CalendarIcon className="w-8 h-8 text-emerald-700" />
        </div>
        <h4 className="text-lg font-semibold text-slate-900 mb-2">2. Book</h4>
        <p className="text-sm text-slate-500">Choose time & confirm</p>
        <div className="mt-4 text-xs text-emerald-600 font-medium flex items-center justify-center gap-1">
          Learn more <ChevronRightIcon className="w-3 h-3" />
        </div>
      </Card>
    </Link>

    {/* Step 3 - Clickable Card */}
    <Link href="#" className="block">
      <Card interactive={true} className="p-6 text-center h-full">
        <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <VideoCameraIcon className="w-8 h-8 text-emerald-700" />
        </div>
        <h4 className="text-lg font-semibold text-slate-900 mb-2">3. Connect</h4>
        <p className="text-sm text-slate-500">Meet via video or in-person</p>
        <div className="mt-4 text-xs text-emerald-600 font-medium flex items-center justify-center gap-1">
          Learn more <ChevronRightIcon className="w-3 h-3" />
        </div>
      </Card>
    </Link>
  </div>
)

// Specialty Card - With login prompt
const SpecialtyCard = ({ specialty }: { specialty: Specialty }) => (
  <div className="relative group">
    <Card className="p-4">
      {/* Blur overlay for login prompt */}
      <div className="absolute inset-0 bg-white/80 backdrop-blur-[2px] rounded-xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10">
        <div className="text-center p-3">
          <LockClosedIcon className="w-6 h-6 text-emerald-600 mx-auto mb-1" />
          <p className="text-xs text-slate-600 font-light mb-2">Sign in to browse</p>
          <Link href="/login">
            <button className="px-3 py-1.5 bg-emerald-600 text-white text-xs font-medium rounded-lg hover:bg-emerald-700 transition">
              Sign In
            </button>
          </Link>
        </div>
      </div>

      <div className="relative">
        <div className="text-sm font-medium text-slate-900 mb-1">{specialty.name}</div>
        {specialty.description && (
          <div className="text-xs text-slate-500 font-light line-clamp-2">
            {specialty.description}
          </div>
        )}
        <div className="mt-2 text-xs text-slate-400 font-medium flex items-center gap-1">
          Sign in to browse <LockClosedIcon className="w-3 h-3" />
        </div>
      </div>
    </Card>
  </div>
)

// Section Header
const SectionHeader = ({ title, subtitle, action }: { title: string; subtitle?: string; action?: React.ReactNode }) => (
  <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-6 md:mb-8 gap-3">
    <div>
      <h2 className="text-2xl md:text-3xl font-light text-slate-900 mb-1">{title}</h2>
      {subtitle && <p className="text-sm md:text-base text-slate-500 font-light">{subtitle}</p>}
    </div>
    {action}
  </div>
)

// Login Prompt Banner
const LoginPromptBanner = () => (
  <div className="bg-gradient-to-r from-emerald-50 to-emerald-100/50 border border-emerald-200 rounded-xl p-5 md:p-6 mb-8">
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-emerald-200 rounded-full">
          <LockClosedIcon className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-700" />
        </div>
        <div>
          <h3 className="text-sm sm:text-base font-medium text-emerald-800">Sign in to book appointments</h3>
          <p className="text-xs sm:text-sm text-emerald-600 font-light">Access practitioner profiles, availability, and instant booking.</p>
        </div>
      </div>
      <div className="flex gap-2 w-full sm:w-auto">
        <Link href="/login" className="flex-1 sm:flex-initial">
          <button className="w-full px-5 py-2 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700 transition text-xs sm:text-sm">
            Sign In
          </button>
        </Link>
        <Link href="/register" className="flex-1 sm:flex-initial">
          <button className="w-full px-5 py-2 bg-white text-emerald-600 font-medium rounded-lg hover:bg-emerald-50 transition text-xs sm:text-sm border border-emerald-600">
            Sign Up
          </button>
        </Link>
      </div>
    </div>
  </div>
)

// ==================== MAIN LANDING PAGE ====================
export default function LandingPage() {
  const [practitioners, setPractitioners] = useState<Practitioner[]>([])
  const [specialties, setSpecialties] = useState<Specialty[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Calculate stats from real data
  const stats = {
    practitionerCount: practitioners.length,
    cityCount: new Set(practitioners.map(p => p.city).filter(Boolean)).size,
    activeNow: Math.round(practitioners.length * 0.3)
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)
        
        // Fetch practitioners
        const practitionersData = await getPractitioners({ verified: true })
        let practitionersList: Practitioner[] = []
        
        if (Array.isArray(practitionersData)) {
          practitionersList = practitionersData
        } else if (practitionersData && 'results' in practitionersData) {
          practitionersList = (practitionersData as PaginatedResponse<Practitioner>).results
        }
        
        setPractitioners(practitionersList.slice(0, 4))
        
        // Fetch specialties
        const specialtiesData = await getSpecialties()
        let specialtiesList: Specialty[] = []
        
        if (Array.isArray(specialtiesData)) {
          specialtiesList = specialtiesData
        } else if (specialtiesData && 'results' in specialtiesData) {
          specialtiesList = (specialtiesData as PaginatedResponse<Specialty>).results
        }
        
        setSpecialties(specialtiesList.slice(0, 4))
        
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
        <div className="flex flex-col items-center gap-3">
          <div className="w-6 h-6 sm:w-8 sm:h-8 border-2 border-emerald-200 border-t-emerald-600 rounded-full animate-spin"></div>
          <p className="text-xs sm:text-sm text-slate-400 font-light">Loading platform data...</p>
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
            <Link href="/" className="text-base sm:text-lg md:text-xl lg:text-2xl font-light tracking-tight text-slate-900">
              Afya<span className="font-medium text-emerald-600">Connect</span>
            </Link>
            
            <nav className="hidden md:flex items-center gap-2">
              <Link href="#practitioners" className="px-3 lg:px-4 py-2 text-sm text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition">
                Practitioners
              </Link>
              <Link href="#specialties" className="px-3 lg:px-4 py-2 text-sm text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition">
                Specialties
              </Link>
              <Link href="#" className="px-3 lg:px-4 py-2 text-sm text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition">
                How it Works
              </Link>
            </nav>
            
            <div className="flex items-center gap-2 sm:gap-3">
              <Link href="/login">
                <button className="px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm text-slate-600 hover:text-slate-900">
                  Sign in
                </button>
              </Link>
              <Link href="/register">
                <button className="px-3 sm:px-4 md:px-5 py-1.5 sm:py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-medium rounded-lg shadow-sm transition">
                  Sign up
                </button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 md:py-12">
        {/* Hero Section */}
        <div className="mb-10 sm:mb-12 md:mb-16">
          <HeroSection 
            practitionerCount={stats.practitionerCount || 0} 
            cityCount={stats.cityCount || 0} 
          />
        </div>

        {/* Login Prompt Banner */}
        <LoginPromptBanner />

        {/* Error Message */}
        {error && (
          <div className="mb-6 sm:mb-8 p-3 sm:p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <p className="text-xs sm:text-sm text-amber-700 font-light">{error}</p>
          </div>
        )}

        {/* Stats Grid */}
        {practitioners.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 mb-10 sm:mb-12 md:mb-16">
            <StatDisplay 
              icon={UserGroupIcon}
              value={stats.practitionerCount}
              label="Verified Practitioners"
            />
            <StatDisplay 
              icon={BuildingOfficeIcon}
              value={stats.cityCount || 1}
              label="Cities Covered"
            />
            <StatDisplay 
              icon={ClockIcon}
              value={`${stats.activeNow}+`}
              label="Active Now"
            />
          </div>
        )}

        {/* Role Cards */}
        <div className="mb-10 sm:mb-12 md:mb-16">
          <SectionHeader 
            title="How would you like to use AfyaConnect?" 
            subtitle="Choose your path to better healthcare"
          />
          <div className="grid md:grid-cols-2 gap-4 sm:gap-6">
            <RoleCard 
              type="client"
              title="Find a Doctor"
              description="Browse verified practitioners, check availability, and book appointments instantly."
              action="Browse Doctors"
              metrics={[
                { label: 'Available Now', value: stats.activeNow.toString() || '0' },
                { label: 'Specialties', value: specialties.length.toString() || '4+' }
              ]}
            />
            <RoleCard 
              type="practitioner"
              title="Join as Practitioner"
              description="Grow your practice by joining our network of trusted healthcare professionals."
              action="Learn More"
              metrics={[
                { label: 'Active Patients', value: '1,000+' },
                { label: 'Platform', value: 'Growing' }
              ]}
            />
          </div>
        </div>

        {/* How It Works - Clickable Cards Horizontally Aligned */}
        <div className="mb-10 sm:mb-12 md:mb-16">
          <SectionHeader 
            title="Simple Process" 
            subtitle="Three steps to better healthcare"
          />
          <SimpleProcessCard />
        </div>

        {/* Featured Practitioners */}
        {practitioners.length > 0 && (
          <div id="practitioners" className="mb-10 sm:mb-12 md:mb-16">
            <SectionHeader 
              title="Featured Practitioners" 
              subtitle="Meet some of our trusted healthcare professionals"
              action={
                <Link href="/login" className="text-xs sm:text-sm text-emerald-600 hover:text-emerald-700 flex items-center gap-1">
                  Sign in to view all
                  <LockClosedIcon className="w-3 h-3 sm:w-4 sm:h-4" />
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
          <div id="specialties" className="mb-10 sm:mb-12 md:mb-16">
            <SectionHeader 
              title="Browse by Specialty" 
              subtitle="Find the right specialist for your needs"
              action={
                <Link href="/login" className="text-xs sm:text-sm text-emerald-600 hover:text-emerald-700 flex items-center gap-1">
                  Sign in to browse
                  <LockClosedIcon className="w-3 h-3 sm:w-4 sm:h-4" />
                </Link>
              }
            />
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
              {specialties.map((specialty) => (
                <SpecialtyCard key={specialty.id} specialty={specialty} />
              ))}
            </div>
          </div>
        )}

        {/* CTA Section */}
        <div className="bg-gradient-to-br from-emerald-600 to-emerald-700 rounded-2xl p-6 sm:p-8 md:p-10 lg:p-12 text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 sm:w-64 md:w-96 h-48 sm:h-64 md:h-96 bg-white rounded-full filter blur-3xl opacity-10 translate-x-48 -translate-y-48"></div>
          <div className="absolute bottom-0 left-0 w-48 sm:w-64 md:w-96 h-48 sm:h-64 md:h-96 bg-white rounded-full filter blur-3xl opacity-10 -translate-x-48 translate-y-48"></div>
          
          <div className="relative">
            <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-light text-white mb-3 sm:mb-4">
              Ready to get started?
            </h2>
            <p className="text-sm sm:text-base md:text-lg text-emerald-100 mb-5 sm:mb-6 md:mb-8 max-w-md mx-auto font-light">
              Join {stats.practitionerCount || 0}+ verified practitioners and thousands of patients today.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
              <Link href="/register" className="w-full sm:w-auto">
                <button className="w-full sm:w-auto px-5 sm:px-6 md:px-8 py-2.5 sm:py-3 md:py-4 bg-white text-emerald-700 font-medium rounded-lg hover:shadow-xl transition text-sm sm:text-base">
                  Create Account
                </button>
              </Link>
              <Link href="/login" className="w-full sm:w-auto">
                <button className="w-full sm:w-auto px-5 sm:px-6 md:px-8 py-2.5 sm:py-3 md:py-4 border border-white text-white font-medium rounded-lg hover:bg-white/10 transition text-sm sm:text-base">
                  Sign In
                </button>
              </Link>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white mt-8 sm:mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-5 sm:py-6 md:py-8">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-3 sm:gap-4">
            <div className="flex items-center gap-3 sm:gap-4 text-xs sm:text-sm text-slate-400 font-light">
              <span>© {PLATFORM.year} {PLATFORM.name}</span>
              <span className="w-1 h-1 rounded-full bg-slate-300"></span>
              <span>v{PLATFORM.version}</span>
            </div>
            <div className="flex gap-4 sm:gap-6 md:gap-8 text-xs sm:text-sm">
              <Link href="/about" className="text-slate-400 hover:text-emerald-600 transition font-light">About</Link>
              <Link href="/privacy" className="text-slate-400 hover:text-emerald-600 transition font-light">Privacy</Link>
              <Link href="/terms" className="text-slate-400 hover:text-emerald-600 transition font-light">Terms</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}