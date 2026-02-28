'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { 
  ArrowRightIcon, 
  ShieldCheckIcon,
  HeartIcon,
  GlobeAltIcon,
  SparklesIcon,
  EnvelopeIcon,
  MapPinIcon
} from '@heroicons/react/24/outline'
import { apiClient } from '@/app/lib/api'

export default function AboutPage() {
  const [practitionerCount, setPractitionerCount] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const practitionersData = await apiClient.practitioners.getAll()
        const practitionersList = Array.isArray(practitionersData) 
          ? practitionersData 
          : practitionersData?.results || []
        
        setPractitionerCount(practitionersList.length)
      } catch (error) {
        console.error('Error fetching stats:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  const values = [
    {
      icon: ShieldCheckIcon,
      title: 'Verified practitioners',
      description: 'Every health expert on our platform undergoes credential verification.'
    },
    {
      icon: HeartIcon,
      title: 'Patient-centered',
      description: 'We prioritize your health journey with compassionate attention.'
    },
    {
      icon: GlobeAltIcon,
      title: 'Accessible',
      description: 'Connect with practitioners online or in-person across Kenya.'
    },
    {
      icon: SparklesIcon,
      title: 'Quality focused',
      description: 'We maintain standards through continuous feedback.'
    }
  ]

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-emerald-600"></div>
      </div>
    )
  }

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
              <Link href="/about" className="text-sm text-emerald-600 font-medium">
                About
              </Link>
              <Link href="/contact" className="text-sm text-gray-600 hover:text-gray-900 transition font-medium">
                Contact
              </Link>
            </nav>

            <Link href="/auth">
              <button className="px-5 py-2.5 bg-gray-900 hover:bg-gray-800 text-white text-sm font-medium rounded-lg shadow-sm transition">
                Get started
              </button>
            </Link>
          </div>
        </div>
      </header>

      <main className="pt-16">
        {/* Hero */}
        <section className="bg-gray-50 border-b border-gray-100">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-24 text-center">
            <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
              Connecting Kenyans with <br />
              <span className="text-emerald-600">trusted health practitioners</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              AfyaConnect launched in 2024 to make quality healthcare accessible to every Kenyan.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/auth">
                <button className="px-8 py-4 bg-gray-900 hover:bg-gray-800 text-white font-medium rounded-xl shadow-lg hover:shadow-xl transition-all">
                  Join AfyaConnect
                  <ArrowRightIcon className="inline ml-2 h-4 w-4" />
                </button>
              </Link>
            </div>
          </div>
        </section>

        {/* Stats - Only real data */}
        {practitionerCount !== null && (
          <section className="py-16 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-1 gap-6 text-center">
                <div>
                  <div className="text-4xl font-bold text-emerald-600 mb-2">
                    {practitionerCount}+
                  </div>
                  <div className="text-sm text-gray-500">Verified practitioners on our platform</div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Story */}
        <section className="py-20 bg-gray-50">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">Our story</h2>
            <div className="prose prose-lg mx-auto text-gray-600">
              <p className="mb-4">
                AfyaConnect was created to address a simple problem: Kenyans struggle to find trusted health practitioners. Long waiting times, limited information, and uncertainty about credentials make healthcare access unnecessarily difficult.
              </p>
              <p className="mb-4">
                Our platform connects patients with verified nutritionists, physiotherapists, and wellness experts. Every practitioner on AfyaConnect undergoes credential verification before they can offer consultations.
              </p>
              <p>
                We're building Kenya's most trusted directory of health professionals, making quality care accessible whether you're in Nairobi or a rural village.
              </p>
            </div>
          </div>
        </section>

        {/* Values */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">Our values</h2>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {values.map((value, i) => {
                const Icon = value.icon
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="bg-gray-50 rounded-xl p-6 border border-gray-100"
                  >
                    <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center mb-4">
                      <Icon className="w-6 h-6 text-emerald-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{value.title}</h3>
                    <p className="text-sm text-gray-600">{value.description}</p>
                  </motion.div>
                )
              })}
            </div>
          </div>
        </section>

        {/* Contact CTA */}
        <section className="py-16 bg-emerald-600">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold text-white mb-4">Questions?</h2>
            <p className="text-emerald-100 mb-8 text-lg">
              We're here to help you find the right practitioner.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/contact">
                <button className="px-8 py-4 bg-white hover:bg-gray-100 text-gray-900 font-medium rounded-xl shadow-lg hover:shadow-xl transition-all">
                  Contact us
                  <ArrowRightIcon className="inline ml-2 h-4 w-4" />
                </button>
              </Link>
              <Link href="/auth">
                <button className="px-8 py-4 bg-emerald-700 hover:bg-emerald-800 text-white font-medium rounded-xl border border-emerald-500 transition">
                  Create account
                </button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div>
              <h4 className="text-sm font-semibold text-white mb-4">Platform</h4>
              <ul className="space-y-2">
                <li><Link href="/about" className="text-sm text-gray-400 hover:text-white">About</Link></li>
                <li><Link href="/how-it-works" className="text-sm text-gray-400 hover:text-white">How it works</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white mb-4">Legal</h4>
              <ul className="space-y-2">
                <li><Link href="/privacy" className="text-sm text-gray-400 hover:text-white">Privacy</Link></li>
                <li><Link href="/terms" className="text-sm text-gray-400 hover:text-white">Terms</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white mb-4">Connect</h4>
              <ul className="space-y-2">
                <li><Link href="/contact" className="text-sm text-gray-400 hover:text-white">Contact</Link></li>
                <li><a href="mailto:hello@afyaconnect.com" className="text-sm text-gray-400 hover:text-white">hello@afyaconnect.com</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white mb-4">Location</h4>
              <p className="text-sm text-gray-400">Nairobi, Kenya</p>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-sm text-gray-500">
            © {new Date().getFullYear()} AfyaConnect
          </div>
        </div>
      </footer>
    </div>
  )
}