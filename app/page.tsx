'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/app/components/ui/Buttons'
import { 
  ArrowRightIcon, 
  UserGroupIcon,
  CalendarIcon,
  ShieldCheckIcon,
  StarIcon,
  MapPinIcon,
  LockClosedIcon,
  DevicePhoneMobileIcon,
  ComputerDesktopIcon,
  ClockIcon,
  CheckBadgeIcon,
  EnvelopeIcon
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
        
        const [practitionersData, specialtiesData] = await Promise.all([
          apiClient.practitioners.getAll(),
          apiClient.specialties.getAll()
        ])
        
        const practitionersList = Array.isArray(practitionersData) 
          ? practitionersData 
          : practitionersData?.results || []
        
        const uniqueCities = new Set(practitionersList.map((p: any) => p.city).filter(Boolean))
        const totalRating = practitionersList.reduce((acc: number, p: any) => acc + (p.average_rating || 0), 0)
        const avgRating = practitionersList.length > 0 ? (totalRating / practitionersList.length) : 0

        setStats({
          practitionerCount: practitionersList.length,
          consultationCount: practitionersList.length * 10,
          averageRating: Math.round(avgRating * 10) / 10,
          cityCount: uniqueCities.size
        })

        setSpecialties(specialtiesData.slice(0, 6))
        
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
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-emerald-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header - System bar style */}
      <header className="fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between h-14">
            <div className="flex items-center gap-8">
              <Link href="/" className="font-semibold text-gray-900">
                AfyaConnect
              </Link>
              <nav className="hidden md:flex items-center gap-6">
                <Link href="/about" className="text-sm text-gray-500 hover:text-gray-900">
                  About
                </Link>
                <Link href="/contact" className="text-sm text-gray-500 hover:text-gray-900">
                  Contact
                </Link>
              </nav>
            </div>
            
            <div className="flex items-center gap-3">
              <Link href="/login">
                <button className="px-4 py-1.5 text-sm text-gray-600 hover:text-gray-900">
                  Sign in
                </button>
              </Link>
              <Link href="/register">
                <button className="px-4 py-1.5 bg-gray-900 hover:bg-gray-800 text-white text-sm font-medium rounded-md transition">
                  Sign up
                </button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="pt-14">
        {/* Hero - Clean system UI */}
        <section className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-6 py-16 md:py-20">
            <div className="max-w-3xl">
              <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
                <ShieldCheckIcon className="w-4 h-4" />
                <span>Verified practitioner network</span>
              </div>
              
              <h1 className="text-4xl md:text-5xl font-light text-gray-900 mb-4 tracking-tight">
                Private health platform
              </h1>
              
              <p className="text-lg text-gray-500 mb-8 max-w-xl">
                Access verified practitioners. Book consultations securely.
                <span className="block text-gray-900 font-medium mt-2">
                  {stats.practitionerCount.toLocaleString()}+ practitioners · {stats.cityCount} cities
                </span>
              </p>
              
              <div className="flex gap-3">
                <Link href="/register">
                  <button className="px-6 py-2.5 bg-gray-900 hover:bg-gray-800 text-white text-sm font-medium rounded-md transition">
                    Create account
                  </button>
                </Link>
                <Link href="/about">
                  <button className="px-6 py-2.5 border border-gray-200 hover:border-gray-300 text-gray-600 hover:text-gray-900 text-sm font-medium rounded-md transition bg-white">
                    How it works
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Stats - Clean cards */}
        <section className="bg-gray-50 border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-6 py-12">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'Practitioners', value: stats.practitionerCount.toLocaleString(), icon: UserGroupIcon },
                { label: 'Cities', value: stats.cityCount.toLocaleString(), icon: MapPinIcon },
                { label: 'Monthly sessions', value: stats.consultationCount.toLocaleString(), icon: CalendarIcon },
                { label: 'Rating', value: stats.averageRating.toFixed(1), icon: StarIcon, suffix: '/5' }
              ].map((stat, i) => {
                const Icon = stat.icon
                return (
                  <div key={i} className="bg-white rounded-lg border border-gray-200 p-5">
                    <div className="flex items-center gap-3 mb-2">
                      <Icon className="w-5 h-5 text-gray-400" />
                      <span className="text-xs text-gray-500">{stat.label}</span>
                    </div>
                    <div className="text-2xl font-light text-gray-900">
                      {stat.value}{stat.suffix}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        {/* Access control notice */}
        <section className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-6 py-8">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-3">
                <LockClosedIcon className="w-5 h-5 text-gray-400" />
                <span className="text-sm text-gray-600">
                  Full directory and booking access requires account
                </span>
              </div>
              <Link href="/register">
                <button className="text-sm text-emerald-600 hover:text-emerald-700 font-medium">
                  Sign up free →
                </button>
              </Link>
            </div>
          </div>
        </section>

        {/* Specialties grid - Locked preview */}
        <section className="bg-gray-50 border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-6 py-12">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-lg font-medium text-gray-900">Specialties</h2>
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <LockClosedIcon className="w-3 h-3" />
                <span>sign up to access all</span>
              </div>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
              {specialties.map((specialty) => (
                <div 
                  key={specialty.id} 
                  className="bg-white rounded-lg border border-gray-200 p-4 relative group"
                >
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition">
                    <LockClosedIcon className="w-3 h-3 text-gray-300" />
                  </div>
                  <div className="text-sm font-medium text-gray-900 mb-1">{specialty.name}</div>
                  <div className="text-xs text-gray-400">12 practitioners</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How it works - Minimal */}
        <section className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-6 py-12">
            <h2 className="text-lg font-medium text-gray-900 mb-6">Simple setup</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {[
                { step: '1', title: 'Sign up', desc: 'Free account in 30 seconds' },
                { step: '2', title: 'Browse', desc: 'Access full directory' },
                { step: '3', title: 'Book', desc: 'Schedule consultation' }
              ].map((item) => (
                <div key={item.step} className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-md bg-gray-100 flex items-center justify-center text-sm text-gray-500">
                    {item.step}
                  </div>
                  <div>
                    <div className="font-medium text-gray-900 mb-1">{item.title}</div>
                    <div className="text-sm text-gray-500">{item.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* System features */}
        <section className="bg-gray-50 border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-6 py-12">
            <div className="grid md:grid-cols-4 gap-6">
              {[
                { icon: CheckBadgeIcon, label: 'Verified practitioners' },
                { icon: ShieldCheckIcon, label: 'Secure platform' },
                { icon: ClockIcon, label: '24/7 availability' },
                { icon: DevicePhoneMobileIcon, label: 'Mobile friendly' }
              ].map((feature, i) => {
                const Icon = feature.icon
                return (
                  <div key={i} className="flex items-center gap-3">
                    <Icon className="w-5 h-5 text-gray-400" />
                    <span className="text-sm text-gray-600">{feature.label}</span>
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        {/* CTA - Clean */}
        <section className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-6 py-16">
            <div className="flex flex-col items-center text-center">
              <h2 className="text-2xl font-light text-gray-900 mb-2">
                Join the network
              </h2>
              <p className="text-gray-500 mb-6">
                {stats.practitionerCount.toLocaleString()} practitioners · {stats.cityCount} cities
              </p>
              <Link href="/register">
                <button className="px-6 py-2.5 bg-gray-900 hover:bg-gray-800 text-white text-sm font-medium rounded-md transition">
                  Create free account
                </button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer - Minimal */}
      <footer className="bg-white">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-sm text-gray-400">
              © 2024 AfyaConnect
            </div>
            <div className="flex gap-6">
              <Link href="/privacy" className="text-sm text-gray-400 hover:text-gray-600">
                Privacy
              </Link>
              <Link href="/terms" className="text-sm text-gray-400 hover:text-gray-600">
                Terms
              </Link>
              <Link href="/contact" className="text-sm text-gray-400 hover:text-gray-600">
                Contact
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}