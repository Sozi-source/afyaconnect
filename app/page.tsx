'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/app/components/ui/Buttons'
import { 
  ArrowRightIcon, 
  ChevronRightIcon,
  UserGroupIcon,
  CalendarIcon,
  ShieldCheckIcon,
  ClockIcon,
  StarIcon,
  MapPinIcon,
  CheckCircleIcon,
  LockClosedIcon
} from '@heroicons/react/24/outline'
import { apiClient } from '@/app/lib/api'
import type { Specialty } from '@/app/types'

export default function LandingPage() {
  const [stats, setStats] = useState({
    practitionerCount: 0,
    consultationCount: 0,
    averageRating: 0,
    cityCount: 0
  })
  const [specialties, setSpecialties] = useState<Specialty[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        
        // Fetch public data only
        const [practitionersData, specialtiesData] = await Promise.all([
          apiClient.practitioners.getAll(),
          apiClient.specialties.getAll()
        ])
        
        const practitionersList = Array.isArray(practitionersData) 
          ? practitionersData 
          : practitionersData?.results || []
        
        // Calculate basic stats (limited info)
        const uniqueCities = new Set(practitionersList.map((p: any) => p.city).filter(Boolean))
        const totalRating = practitionersList.reduce((acc: number, p: any) => acc + (p.average_rating || 0), 0)
        const avgRating = practitionersList.length > 0 ? (totalRating / practitionersList.length) : 0

        setStats({
          practitionerCount: practitionersList.length,
          consultationCount: practitionersList.length * 10, // Estimate
          averageRating: Math.round(avgRating * 10) / 10,
          cityCount: uniqueCities.size
        })

        setSpecialties(specialtiesData.slice(0, 8))
        
      } catch (error) {
        console.error('Error fetching landing page data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-emerald-600"></div>
      </div>
    )
  }

  const statItems = [
    { 
      icon: UserGroupIcon, 
      label: 'Active practitioners', 
      value: stats.practitionerCount.toLocaleString() + '+', 
      color: 'bg-emerald-50 text-emerald-600' 
    },
    { 
      icon: CalendarIcon, 
      label: 'Monthly sessions', 
      value: stats.consultationCount.toLocaleString() + '+', 
      color: 'bg-blue-50 text-blue-600' 
    },
    { 
      icon: StarIcon, 
      label: 'Average rating', 
      value: stats.averageRating.toFixed(1) + '/5', 
      color: 'bg-amber-50 text-amber-600' 
    },
    { 
      icon: MapPinIcon, 
      label: 'Cities covered', 
      value: stats.cityCount.toLocaleString(), 
      color: 'bg-purple-50 text-purple-600' 
    }
  ]

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-md border-b border-gray-100 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="text-xl font-semibold text-gray-900 tracking-tight">
              AfyaConnect
            </Link>
            
            <nav className="hidden md:flex items-center gap-8">
              <Link href="/about" className="text-sm text-gray-600 hover:text-gray-900 transition font-medium">
                About
              </Link>
              <Link href="/contact" className="text-sm text-gray-600 hover:text-gray-900 transition font-medium">
                Contact
              </Link>
            </nav>

            <Link href="/register">
              <button className="px-5 py-2.5 bg-white hover:bg-gray-200 text-gray-700 text-sm font-medium rounded-lg shadow-sm transition">
                Sign up to access
              </button>
            </Link>
          </div>
        </div>
      </header>

      <main className="pt-16">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-b from-white to-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
            <div className="max-w-3xl mx-auto text-center">
              <div className="inline-flex items-center gap-2 bg-gray-100 px-4 py-2 rounded-full mb-8">
                <LockClosedIcon className="w-4 h-4 text-emerald-600" />
                <span className="text-sm font-medium text-gray-700">
                  Private platform • {stats.practitionerCount.toLocaleString()}+ practitioners
                </span>
              </div>
              
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
                Your health journey,<br />
                <span className="text-emerald-600">secured and private</span>
              </h1>
              
              <p className="text-lg text-gray-600 mb-10 max-w-2xl mx-auto">
                AfyaConnect is a private platform for verified health consultations. 
                <span className="font-semibold text-gray-900"> Sign up to access</span> our network of trusted practitioners.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/auth" className="w-full sm:w-auto">
                  <button className="w-full sm:w-auto px-8 py-4 bg-gray-900 hover:bg-gray-800 text-white font-medium rounded-xl shadow-lg hover:shadow-xl transition-all">
                    Create free account
                    <ArrowRightIcon className="inline ml-2 h-4 w-4" />
                  </button>
                </Link>
                <Link href="/about" className="w-full sm:w-auto">
                  <button className="w-full sm:w-auto px-8 py-4 bg-white hover:bg-gray-50 text-gray-700 font-medium rounded-xl border border-gray-200 shadow-sm hover:shadow transition-all">
                    Learn more
                  </button>
                </Link>
              </div>

              {/* Trust indicators */}
              <div className="flex flex-wrap items-center justify-center gap-6 mt-12">
                <div className="flex items-center gap-2">
                  <CheckCircleIcon className="w-5 h-5 text-emerald-500" />
                  <span className="text-sm text-gray-600">Free to join</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircleIcon className="w-5 h-5 text-emerald-500" />
                  <span className="text-sm text-gray-600">Verified only</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircleIcon className="w-5 h-5 text-emerald-500" />
                  <span className="text-sm text-gray-600">Private & secure</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircleIcon className="w-5 h-5 text-emerald-500" />
                  <span className="text-sm text-gray-600">24/7 support</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Cards */}
        <section className="py-16 bg-white border-y border-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-10">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Growing community</h2>
              <p className="text-gray-500">Join thousands of Kenyans accessing quality healthcare</p>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {statItems.map((stat, i) => {
                const Icon = stat.icon
                return (
                  <div key={i} className="bg-white rounded-xl border border-gray-100 p-6 hover:shadow-md transition">
                    <div className={`w-12 h-12 ${stat.color} rounded-lg flex items-center justify-center mb-4`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <div className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</div>
                    <div className="text-sm text-gray-500">{stat.label}</div>
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        {/* How It Works - With Auth Focus */}
        <section className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Get started in minutes</h2>
              <p className="text-gray-600">Simple steps to access our network</p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              {[
                { 
                  step: '01', 
                  title: 'Create free account', 
                  description: 'Sign up with your email. No credit card required.',
                  icon: '🔐'
                },
                { 
                  step: '02', 
                  title: 'Browse practitioners', 
                  description: 'Access our full directory of verified experts after signup.',
                  icon: '👥'
                },
                { 
                  step: '03', 
                  title: 'Book & consult', 
                  description: 'Schedule private sessions that work for you.',
                  icon: '📅'
                }
              ].map((item) => (
                <div key={item.step} className="bg-white rounded-xl p-8 border border-gray-100 shadow-sm hover:shadow-md transition">
                  <div className="text-4xl mb-4">{item.icon}</div>
                  <div className="text-emerald-600 text-sm font-mono mb-2">{item.step}</div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{item.title}</h3>
                  <p className="text-gray-600">{item.description}</p>
                </div>
              ))}
            </div>

            {/* Signup prompt */}
            <div className="text-center mt-12">
              <Link href="/auth">
                <button className="px-8 py-3 bg-gray-900 hover:bg-gray-800 text-white font-medium rounded-lg shadow-md transition">
                  Create your account now
                  <ArrowRightIcon className="inline ml-2 h-4 w-4" />
                </button>
              </Link>
            </div>
          </div>
        </section>

        {/* Specialties Preview - No Links */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <div className="inline-flex items-center gap-2 bg-gray-100 px-3 py-1 rounded-full mb-4">
                <LockClosedIcon className="w-3 h-3 text-gray-500" />
                <span className="text-xs text-gray-600">Available after signup</span>
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Specialties we cover</h2>
              <p className="text-gray-600">Full directory accessible once you join</p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 opacity-75">
              {specialties.map((specialty) => (
                <div 
                  key={specialty.id} 
                  className="bg-gray-50 rounded-xl p-6 border border-gray-100 relative"
                >
                  <div className="absolute top-2 right-2">
                    <LockClosedIcon className="w-4 h-4 text-gray-400" />
                  </div>
                  <div className="text-3xl mb-3">🏥</div>
                  <h3 className="font-semibold text-gray-900 mb-1">
                    {specialty.name}
                  </h3>
                  <p className="text-sm text-gray-500">{specialty.description || 'Specialized care'}</p>
                </div>
              ))}
            </div>

            <div className="text-center mt-10">
              <Link href="/auth">
                <button className="px-6 py-3 bg-white hover:bg-gray-50 text-gray-700 font-medium rounded-lg border border-gray-200 shadow-sm hover:shadow transition">
                  Sign up to browse all
                  <ArrowRightIcon className="inline ml-2 h-4 w-4" />
                </button>
              </Link>
            </div>
          </div>
        </section>

        {/* Private Platform CTA */}
        <section className="py-16 bg-emerald-50">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="inline-flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm mb-6">
              <ShieldCheckIcon className="w-5 h-5 text-emerald-600" />
              <span className="text-sm font-medium text-gray-700">Private & secure platform</span>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Access is exclusive to members</h2>
            <p className="text-gray-600 mb-8 text-lg">
              Practitioner details, availability, and booking are available 
              <span className="font-semibold text-gray-900"> only after creating a free account.</span>
            </p>
            <Link href="/auth">
              <button className="px-8 py-4 bg-gray-900 hover:bg-gray-800 text-white font-medium rounded-xl shadow-lg hover:shadow-xl transition-all">
                Join AfyaConnect today
                <ArrowRightIcon className="inline ml-2 h-4 w-4" />
              </button>
            </Link>
            <p className="text-sm text-gray-500 mt-4">
              Free to join • No credit card • Cancel anytime
            </p>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 mb-12">
            <div className="col-span-2 lg:col-span-1">
              <Link href="/" className="text-xl font-semibold text-white tracking-tight">
                AfyaConnect
              </Link>
              <p className="text-sm text-gray-400 mt-4">
                Private platform for verified health consultations in Kenya.
              </p>
            </div>
            
            {[
              {
                title: 'Platform',
                links: [
                  { label: 'About', href: '/about' },
                  { label: 'How it works', href: '/how-it-works' },
                  { label: 'FAQ', href: '/faq' }
                ]
              },
              {
                title: 'Company',
                links: [
                  { label: 'Contact', href: '/contact' },
                  { label: 'Blog', href: '/blog' },
                  { label: 'Careers', href: '/careers' }
                ]
              },
              {
                title: 'Legal',
                links: [
                  { label: 'Privacy', href: '/privacy' },
                  { label: 'Terms', href: '/terms' }
                ]
              }
            ].map((section) => (
              <div key={section.title}>
                <h4 className="text-sm font-semibold text-white mb-4">{section.title}</h4>
                <ul className="space-y-3">
                  {section.links.map((link) => (
                    <li key={link.label}>
                      <Link href={link.href} className="text-sm text-gray-400 hover:text-white transition">
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          
          <div className="border-t border-gray-800 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-sm text-gray-500">
              © {new Date().getFullYear()} AfyaConnect. Private platform.
            </p>
            <div className="flex gap-6">
              <Link href="/privacy" className="text-sm text-gray-500 hover:text-white">Privacy</Link>
              <Link href="/terms" className="text-sm text-gray-500 hover:text-white">Terms</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}