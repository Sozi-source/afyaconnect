'use client'

import Link from 'next/link'
import { 
  ArrowRightIcon,
  CheckCircleIcon,
  UserGroupIcon,
  CalendarIcon,
  ShieldCheckIcon,
  SparklesIcon,
  PhoneIcon,
  EnvelopeIcon,
  MapPinIcon
} from '@heroicons/react/24/outline'

export default function LandingPage() {
  const features = [
    {
      icon: UserGroupIcon,
      title: 'Verified Experts',
      description: 'All practitioners are thoroughly vetted and verified for your peace of mind.'
    },
    {
      icon: CalendarIcon,
      title: 'Easy Booking',
      description: 'Schedule consultations at your convenience with our simple booking system.'
    },
    {
      icon: ShieldCheckIcon,
      title: 'Secure Platform',
      description: 'Your data and privacy are protected with enterprise-grade security.'
    }
  ]

  const stats = [
    { value: '500+', label: 'Verified Experts' },
    { value: '10k+', label: 'Happy Clients' },
    { value: '15+', label: 'Specialties' },
    { value: '24/7', label: 'Support' },
  ]

  const specialties = [
    'Clinical Nutritionist',
    'Registered Dietitian', 
    'Physiotherapist',
    'Mental Health Counselor',
    'General Practitioner',
    'Sports Medicine',
    'Pediatric Nutrition',
    'Wellness Coach'
  ]

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 bg-white/80 dark:bg-gray-950/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">MC</span>
              </div>
              <span className="text-lg font-bold text-gray-900 dark:text-white">
                Medi<span className="text-emerald-600">Connect</span>
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <Link href="#features" className="text-sm text-gray-600 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition">
                Features
              </Link>
              <Link href="#how-it-works" className="text-sm text-gray-600 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition">
                How it Works
              </Link>
              <Link href="#specialties" className="text-sm text-gray-600 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition">
                Specialties
              </Link>
              <Link href="#contact" className="text-sm text-gray-600 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition">
                Contact
              </Link>
            </div>

            {/* Auth Buttons */}
            <div className="flex items-center space-x-3">
              <Link 
                href="/login" 
                className="text-sm text-gray-600 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                className="px-4 py-2 text-sm bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-24 pb-16 sm:pt-32 sm:pb-20 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 rounded-full px-4 py-2 mb-6">
              <SparklesIcon className="h-4 w-4 mr-2" />
              <span className="text-sm font-medium">Your health journey starts here</span>
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-6">
              Connect with Kenya's Best
              <span className="text-emerald-600 block mt-2">Health Practitioners</span>
            </h1>
            
            <p className="text-lg text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
              Find and book consultations with verified nutritionists, dietitians, physiotherapists, 
              and other health experts. All in one secure platform.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <Link href="/register">
                <button className="px-8 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors font-medium flex items-center justify-center w-full sm:w-auto">
                  Find Your Expert
                  <ArrowRightIcon className="ml-2 h-4 w-4" />
                </button>
              </Link>
              <Link href="#how-it-works">
                <button className="px-8 py-3 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors font-medium w-full sm:w-auto">
                  Learn More
                </button>
              </Link>
            </div>

            {/* Trust Indicators */}
            <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-gray-500 dark:text-gray-400">
              <div className="flex items-center">
                <CheckCircleIcon className="h-5 w-5 text-emerald-500 mr-2" />
                <span>500+ Experts</span>
              </div>
              <div className="flex items-center">
                <CheckCircleIcon className="h-5 w-5 text-emerald-500 mr-2" />
                <span>Verified Only</span>
              </div>
              <div className="flex items-center">
                <CheckCircleIcon className="h-5 w-5 text-emerald-500 mr-2" />
                <span>Secure Platform</span>
              </div>
            </div>
          </div>
        </div>

        {/* Decorative Background */}
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-emerald-200 dark:bg-emerald-900/20 rounded-full blur-3xl opacity-30" />
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-teal-200 dark:bg-teal-900/20 rounded-full blur-3xl opacity-30" />
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-16 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Why Choose MediConnect
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              We make it easy to find and connect with the right health expert for your needs
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl flex items-center justify-center mb-4">
                  <feature.icon className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-12">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</div>
                <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Simple, Fast, and Secure
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Get the care you need in three easy steps
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3].map((step) => (
              <div key={step} className="relative">
                <div className="flex flex-col items-center text-center">
                  <span className="text-5xl font-bold text-emerald-200 dark:text-emerald-900/30 mb-4">
                    {step}
                  </span>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    {step === 1 && 'Create Account'}
                    {step === 2 && 'Find Your Expert'}
                    {step === 3 && 'Book & Connect'}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    {step === 1 && 'Sign up for free in under 2 minutes'}
                    {step === 2 && 'Browse verified practitioners by specialty'}
                    {step === 3 && 'Schedule and attend your consultation'}
                  </p>
                </div>
                {step < 3 && (
                  <div className="hidden md:block absolute top-1/3 -right-4 w-8 h-0.5 bg-gray-300 dark:bg-gray-700" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Specialties Section */}
      <section id="specialties" className="py-16 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Browse by Specialty
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Find experts across various health and wellness domains
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {specialties.map((specialty, index) => (
              <div
                key={index}
                className="bg-white dark:bg-gray-800 p-4 rounded-xl text-center hover:shadow-md transition-shadow border border-gray-100 dark:border-gray-700 group cursor-default"
              >
                <div className="text-3xl mb-2 opacity-50 group-hover:opacity-100 transition-opacity">⚕️</div>
                <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                  {specialty}
                </h3>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* For Practitioners Section */}
      <section id="practitioners" className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-3xl p-8 md:p-12 text-white">
            <div className="max-w-2xl">
              <h2 className="text-3xl font-bold mb-4">
                Are You a Health Practitioner?
              </h2>
              <p className="text-emerald-100 mb-6 text-lg">
                Join our platform to grow your practice, reach more clients, and manage your consultations efficiently.
              </p>
              <Link href="/register?role=practitioner">
                <button className="px-6 py-3 bg-white text-emerald-600 rounded-xl hover:bg-gray-100 transition-colors font-medium">
                  Apply as Practitioner
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                Get in Touch
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-400 mb-6">
                Have questions? We're here to help. Reach out to our support team.
              </p>
              
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center">
                    <EnvelopeIcon className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Email</p>
                    <a href="mailto:support@mediconnect.com" className="text-gray-900 dark:text-white hover:text-emerald-600 transition">
                      support@mediconnect.com
                    </a>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center">
                    <PhoneIcon className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Phone</p>
                    <a href="tel:+254712345678" className="text-gray-900 dark:text-white hover:text-emerald-600 transition">
                      +254 712 345 678
                    </a>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center">
                    <MapPinIcon className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Office</p>
                    <p className="text-gray-900 dark:text-white">
                      Nairobi, Kenya
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Form Placeholder */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Send us a Message
              </h3>
              <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
                <div>
                  <input
                    type="text"
                    placeholder="Your Name"
                    className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <input
                    type="email"
                    placeholder="Your Email"
                    className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <textarea
                    rows={4}
                    placeholder="Your Message"
                    className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                >
                  Send Message
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-emerald-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Start Your Health Journey?
          </h2>
          <p className="text-lg text-emerald-100 mb-8">
            Join thousands of Kenyans who've found their perfect health partner
          </p>
          <Link href="/register">
            <button className="px-8 py-3 bg-white text-emerald-600 rounded-xl hover:bg-gray-100 transition-colors font-medium">
              Create Free Account
            </button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white dark:bg-gray-950 border-t border-gray-200 dark:border-gray-800 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-6 h-6 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-lg" />
                <span className="text-sm font-semibold text-gray-900 dark:text-white">MediConnect</span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Connecting you with Kenya's best health practitioners.
              </p>
            </div>
            
            <div>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">For Clients</h3>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <li><Link href="/practitioners" className="hover:text-emerald-600 transition">Find Experts</Link></li>
                <li><Link href="#how-it-works" className="hover:text-emerald-600 transition">How it Works</Link></li>
                <li><Link href="/faq" className="hover:text-emerald-600 transition">FAQ</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">For Practitioners</h3>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <li><Link href="/register?role=practitioner" className="hover:text-emerald-600 transition">Join as Practitioner</Link></li>
                <li><Link href="/pricing" className="hover:text-emerald-600 transition">Pricing</Link></li>
                <li><Link href="/resources" className="hover:text-emerald-600 transition">Resources</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Company</h3>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <li><Link href="/about" className="hover:text-emerald-600 transition">About Us</Link></li>
                <li><Link href="#contact" className="hover:text-emerald-600 transition">Contact</Link></li>
                <li><Link href="/privacy" className="hover:text-emerald-600 transition">Privacy Policy</Link></li>
              </ul>
            </div>
          </div>

          <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-800 text-center text-sm text-gray-500">
            <p>© {new Date().getFullYear()} MediConnect. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}