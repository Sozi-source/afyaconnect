'use client'

import { JSX, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import {
  MagnifyingGlassIcon,
  CalendarIcon,
  VideoCameraIcon,
  ChevronRightIcon,
  ArrowRightIcon,
  ClockIcon,
  ShieldCheckIcon,
  UserGroupIcon,
  SparklesIcon,
  HeartIcon,
  BoltIcon,
  ChatBubbleLeftRightIcon,
  DocumentTextIcon,
  GlobeAltIcon,
  DevicePhoneMobileIcon,
  CheckBadgeIcon,
  StarIcon,
  BuildingOfficeIcon
} from '@heroicons/react/24/outline'
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid'


// ==================== SERVICE ICONS ====================
const ServiceIcon = ({ name }: { name: string }) => {
  const icons: { [key: string]: JSX.Element } = {
    'Nutrition & Dietetics': <HeartIcon className="w-6 h-6" />,
    'Caregiving': <UserGroupIcon className="w-6 h-6" />,
    'Physiotherapy': <BoltIcon className="w-6 h-6" />,
    'Nursing': <ShieldCheckIcon className="w-6 h-6" />,
    'General Medicine': <StarIcon className="w-6 h-6" />,
    'Mental Health': <ChatBubbleLeftRightIcon className="w-6 h-6" />,
    'Pediatrics': <HeartIcon className="w-6 h-6" />,
    'Dentistry': <StarIconSolid className="w-6 h-6" />,
    'Pharmacy': <DocumentTextIcon className="w-6 h-6" />,
    'Laboratory': <GlobeAltIcon className="w-6 h-6" />,
    'Radiology': <DevicePhoneMobileIcon className="w-6 h-6" />,
    'Emergency': <BoltIcon className="w-6 h-6" />
  }
  
  return icons[name] || <HeartIcon className="w-6 h-6" />
}

// ==================== CORE COMPONENTS ====================

// Card Component
const Card = ({ 
  children, 
  className = '' 
}: { 
  children: React.ReactNode
  className?: string
}) => (
  <div className={`bg-white border border-slate-200 rounded-xl p-6 ${className}`}>
    {children}
  </div>
)

// Step Card
const StepCard = ({ 
  number, 
  title, 
  description,
  icon: Icon 
}: { 
  number: string
  title: string
  description: string
  icon: any
}) => (
  <Card className="relative overflow-hidden group hover:border-emerald-200 hover:shadow-lg transition-all hover:-translate-y-1">
    <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-50 rounded-full -translate-y-12 translate-x-12 group-hover:scale-150 transition-transform"></div>
    <div className="relative">
      <div className="flex items-center gap-4 mb-4">
        <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-700 font-bold text-xl">
          {number}
        </div>
        <div className="p-2 bg-emerald-50 rounded-lg">
          <Icon className="w-6 h-6 text-emerald-600" />
        </div>
      </div>
      <h3 className="text-xl font-semibold text-slate-900 mb-2">{title}</h3>
      <p className="text-sm text-slate-500 leading-relaxed">{description}</p>
      
      <div className="mt-4 flex items-center gap-1 text-emerald-600 text-sm font-medium">
        <span>Learn more</span>
        <ChevronRightIcon className="w-4 h-4" />
      </div>
    </div>
  </Card>
)

// Service Card
const ServiceCard = ({ 
  name, 
  description,
  practitionerCount 
}: { 
  name: string
  description: string
  practitionerCount: number
}) => (
  <Link href={`/services/${name.toLowerCase().replace(/ & /g, '-').replace(/ /g, '-')}`}>
    <Card className="h-full group hover:border-emerald-200 hover:shadow-lg transition-all cursor-pointer">
      <div className="flex flex-col h-full">
        <div className="flex items-start justify-between mb-4">
          <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-700 group-hover:scale-110 transition-transform">
            <ServiceIcon name={name} />
          </div>
          <span className="text-xs font-medium text-emerald-700 bg-emerald-50 px-2 py-1 rounded-full">
            {practitionerCount}+ practitioners
          </span>
        </div>
        
        <h3 className="text-lg font-semibold text-slate-900 mb-2">{name}</h3>
        <p className="text-sm text-slate-500 mb-4 flex-grow">{description}</p>
        
        <div className="flex items-center justify-between text-sm">
          <span className="text-emerald-600 font-medium">Browse specialists</span>
          <ArrowRightIcon className="w-4 h-4 text-emerald-600 group-hover:translate-x-1 transition-transform" />
        </div>
      </div>
    </Card>
  </Link>
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
  <Card className="text-center hover:border-emerald-200 hover:shadow-md transition-all">
    <div className="w-14 h-14 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
      <Icon className="w-7 h-7 text-emerald-700" />
    </div>
    <h4 className="text-lg font-semibold text-slate-900 mb-2">{title}</h4>
    <p className="text-sm text-slate-500">{description}</p>
  </Card>
)

// Testimonial Card
const TestimonialCard = ({ 
  name, 
  role, 
  comment, 
  rating 
}: { 
  name: string
  role: string
  comment: string
  rating: number
}) => (
  <Card className="hover:border-emerald-200 transition-all">
    <div className="flex items-center gap-1 mb-3">
      {[...Array(5)].map((_, i) => (
        <StarIconSolid 
          key={i} 
          className={`w-4 h-4 ${i < rating ? 'text-amber-400' : 'text-slate-200'}`} 
        />
      ))}
    </div>
    <p className="text-sm text-slate-600 mb-4 italic">"{comment}"</p>
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-700 font-medium">
        {name.charAt(0)}
      </div>
      <div>
        <p className="text-sm font-medium text-slate-900">{name}</p>
        <p className="text-xs text-slate-500">{role}</p>
      </div>
    </div>
  </Card>
)

// Section Header
const SectionHeader = ({ title, subtitle }: { title: string; subtitle?: string }) => (
  <div className="text-center mb-10">
    <h2 className="text-3xl md:text-4xl font-light text-slate-900 mb-3">{title}</h2>
    {subtitle && <p className="text-lg text-slate-500 font-light max-w-2xl mx-auto">{subtitle}</p>}
  </div>
)

// ==================== HOW IT WORKS PAGE ====================
export default function HowItWorksPage() {
  const [activeTab, setActiveTab] = useState('patients')

  // Sample data
  const services = [
    {
      name: 'Nutrition & Dietetics',
      description: 'Personalized nutrition plans and dietary counseling for optimal health and wellness.',
      practitionerCount: 45
    },
    {
      name: 'Caregiving',
      description: 'Professional caregiving services for elderly, disabled, or recovering patients at home.',
      practitionerCount: 38
    },
    {
      name: 'Physiotherapy',
      description: 'Rehabilitation and physical therapy to restore movement and function.',
      practitionerCount: 52
    },
    {
      name: 'Nursing',
      description: 'Skilled nursing care for chronic conditions, post-surgery recovery, and home health.',
      practitionerCount: 67
    },
    {
      name: 'General Medicine',
      description: 'Comprehensive primary care for routine check-ups and common illnesses.',
      practitionerCount: 89
    },
    {
      name: 'Mental Health',
      description: 'Therapy and counseling services for mental wellness and emotional support.',
      practitionerCount: 41
    },
    {
      name: 'Pediatrics',
      description: 'Specialized healthcare for infants, children, and adolescents.',
      practitionerCount: 36
    },
    {
      name: 'Dentistry',
      description: 'Complete dental care including check-ups, cleanings, and treatments.',
      practitionerCount: 29
    }
  ]

  const steps = [
    {
      number: '01',
      title: 'Find the Right Specialist',
      description: 'Browse our wide range of medical services and filter by specialty, location, availability, or language. Read practitioner profiles and patient reviews.',
      icon: MagnifyingGlassIcon
    },
    {
      number: '02',
      title: 'Book Your Appointment',
      description: 'Select a convenient time slot that works for you. Choose between video consultation or in-person visit. Get instant confirmation.',
      icon: CalendarIcon
    },
    {
      number: '03',
      title: 'Connect & Get Care',
      description: 'Join your secure video consultation or visit the clinic. Receive prescriptions, care plans, and follow-up instructions digitally.',
      icon: VideoCameraIcon
    }
  ]

  const features = [
    {
      icon: ClockIcon,
      title: '24/7 Availability',
      description: 'Book appointments anytime, day or night'
    },
    {
      icon: ShieldCheckIcon,
      title: 'Verified Professionals',
      description: 'All practitioners are license-verified'
    },
    {
      icon: VideoCameraIcon,
      title: 'Secure Consultations',
      description: 'End-to-end encrypted video calls'
    },
    {
      icon: DocumentTextIcon,
      title: 'Digital Records',
      description: 'Access your health records anytime'
    }
  ]

  const testimonials = [
    {
      name: 'Sarah Johnson',
      role: 'Patient',
      comment: 'The nutritionist helped me create a sustainable meal plan. I\'ve lost 15 pounds and feel amazing!',
      rating: 5
    },
    {
      name: 'Michael Omondi',
      role: 'Caregiver',
      comment: 'Found an excellent caregiver for my mother through AfyaConnect. Professional and compassionate service.',
      rating: 5
    },
    {
      name: 'Dr. Grace Wangari',
      role: 'Physiotherapist',
      comment: 'The platform makes it easy to connect with patients and manage my practice efficiently.',
      rating: 5
    }
  ]

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
              <Link href="/practitioners" className="px-3 lg:px-4 py-2 text-sm text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition">
                Find Doctors
              </Link>
              <Link href="/services" className="px-3 lg:px-4 py-2 text-sm text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition">
                Services
              </Link>
              <Link href="/how-it-works" className="px-3 lg:px-4 py-2 text-sm text-emerald-600 font-medium border-b-2 border-emerald-600">
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
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* Hero Section */}
        <div className="text-center mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-emerald-100/80 rounded-full mb-6 border border-emerald-200/50 shadow-sm">
            <div className="p-1 bg-emerald-600 rounded-full">
              <SparklesIcon className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-white" />
            </div>
            <span className="text-xs sm:text-sm font-semibold text-emerald-800">Simple, Fast, Secure</span>
          </div>
          
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-slate-900 mb-6">
            How <span className="bg-gradient-to-r from-emerald-600 to-emerald-700 bg-clip-text text-transparent">AfyaConnect</span> Works
          </h1>
          
          <p className="text-lg sm:text-xl text-slate-600 max-w-3xl mx-auto font-light">
            Connect with verified healthcare professionals across multiple specialties — 
            from nutrition and physiotherapy to nursing and caregiving — all from the comfort of your home.
          </p>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16">
          <Card className="text-center p-6">
            <div className="text-3xl font-bold text-emerald-700 mb-2">200+</div>
            <div className="text-sm text-slate-500">Verified Practitioners</div>
          </Card>
          <Card className="text-center p-6">
            <div className="text-3xl font-bold text-emerald-700 mb-2">12+</div>
            <div className="text-sm text-slate-500">Medical Specialties</div>
          </Card>
          <Card className="text-center p-6">
            <div className="text-3xl font-bold text-emerald-700 mb-2">5k+</div>
            <div className="text-sm text-slate-500">Happy Patients</div>
          </Card>
          <Card className="text-center p-6">
            <div className="text-3xl font-bold text-emerald-700 mb-2">24/7</div>
            <div className="text-sm text-slate-500">Booking Available</div>
          </Card>
        </div>

        {/* Step by Step Guide */}
        <SectionHeader 
          title="Three Simple Steps" 
          subtitle="Get the care you need in just a few minutes"
        />
        
        <div className="grid md:grid-cols-3 gap-6 mb-16">
          {steps.map((step, index) => (
            <StepCard key={index} {...step} />
          ))}
        </div>

        {/* Services Grid */}
        <SectionHeader 
          title="Our Medical Services" 
          subtitle="Browse our wide range of healthcare services"
        />
        
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-16">
          {services.map((service, index) => (
            <ServiceCard key={index} {...service} />
          ))}
        </div>

        {/* View All Services Link */}
        <div className="text-center mb-16">
          <Link href="/services">
            <button className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg transition inline-flex items-center gap-2">
              View All Services
              <ArrowRightIcon className="w-4 h-4" />
            </button>
          </Link>
        </div>

        {/* For Patients & Practitioners Tabs */}
        <div className="mb-16">
          <SectionHeader 
            title="For Patients & Practitioners" 
            subtitle="Whether you're seeking care or providing it"
          />
          
          <div className="flex justify-center gap-4 mb-8">
            <button
              onClick={() => setActiveTab('patients')}
              className={`px-6 py-2 rounded-full text-sm font-medium transition ${
                activeTab === 'patients'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-white text-slate-600 hover:bg-emerald-50'
              }`}
            >
              For Patients
            </button>
            <button
              onClick={() => setActiveTab('practitioners')}
              className={`px-6 py-2 rounded-full text-sm font-medium transition ${
                activeTab === 'practitioners'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-white text-slate-600 hover:bg-emerald-50'
              }`}
            >
              For Practitioners
            </button>
          </div>

          <Card className="p-8">
            {activeTab === 'patients' ? (
              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div>
                  <h3 className="text-2xl font-semibold text-slate-900 mb-4">Find the care you need</h3>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-3">
                      <CheckBadgeIcon className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                      <span className="text-slate-600">Browse verified practitioners by specialty, location, or availability</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckBadgeIcon className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                      <span className="text-slate-600">Read reviews and check ratings from other patients</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckBadgeIcon className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                      <span className="text-slate-600">Book appointments instantly with real-time availability</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckBadgeIcon className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                      <span className="text-slate-600">Choose between video consultations or in-person visits</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckBadgeIcon className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                      <span className="text-slate-600">Receive prescriptions and care plans digitally</span>
                    </li>
                  </ul>
                  <Link href="/register">
                    <button className="mt-6 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg transition">
                      Get Started as Patient
                    </button>
                  </Link>
                </div>
                <div className="bg-emerald-50 rounded-xl p-6">
                  <Image 
                    src="/images/patient-consultation.jpg"
                    alt="Patient consultation"
                    width={400}
                    height={300}
                    className="rounded-lg w-full h-auto"
                  />
                </div>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div className="order-2 md:order-1 bg-emerald-50 rounded-xl p-6">
                  <Image 
                    src="/images/practitioner-dashboard.jpg"
                    alt="Practitioner dashboard"
                    width={400}
                    height={300}
                    className="rounded-lg w-full h-auto"
                  />
                </div>
                <div className="order-1 md:order-2">
                  <h3 className="text-2xl font-semibold text-slate-900 mb-4">Grow your practice</h3>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-3">
                      <CheckBadgeIcon className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                      <span className="text-slate-600">Join a network of trusted healthcare professionals</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckBadgeIcon className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                      <span className="text-slate-600">Manage your schedule and appointments easily</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckBadgeIcon className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                      <span className="text-slate-600">Conduct secure video consultations</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckBadgeIcon className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                      <span className="text-slate-600">Receive payments securely and on time</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckBadgeIcon className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                      <span className="text-slate-600">Build your reputation with patient reviews</span>
                    </li>
                  </ul>
                  <Link href="/join-as-practitioner">
                    <button className="mt-6 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg transition">
                      Join as Practitioner
                    </button>
                  </Link>
                </div>
              </div>
            )}
          </Card>
        </div>

        {/* Features Grid */}
        <SectionHeader 
          title="Why Choose AfyaConnect" 
          subtitle="Experience healthcare reimagined"
        />
        
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-16">
          {features.map((feature, index) => (
            <FeatureCard key={index} {...feature} />
          ))}
        </div>

        {/* Testimonials */}
        <SectionHeader 
          title="What Our Users Say" 
          subtitle="Real stories from our community"
        />
        
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-16">
          {testimonials.map((testimonial, index) => (
            <TestimonialCard key={index} {...testimonial} />
          ))}
        </div>

        {/* FAQ Section */}
        <div className="mb-16">
          <SectionHeader 
            title="Frequently Asked Questions" 
            subtitle="Got questions? We've got answers"
          />
          
          <div className="grid md:grid-cols-2 gap-4">
            <Card>
              <h4 className="font-semibold text-slate-900 mb-2">How do I book an appointment?</h4>
              <p className="text-sm text-slate-500">Simply browse practitioners by specialty, select a convenient time slot, and confirm your booking. You'll receive an instant confirmation.</p>
            </Card>
            <Card>
              <h4 className="font-semibold text-slate-900 mb-2">Are the practitioners verified?</h4>
              <p className="text-sm text-slate-500">Yes, all practitioners undergo rigorous credential verification including license checks and background screening.</p>
            </Card>
            <Card>
              <h4 className="font-semibold text-slate-900 mb-2">Can I choose between video and in-person?</h4>
              <p className="text-sm text-slate-500">Absolutely! Each practitioner lists their available consultation modes. You can filter by your preference.</p>
            </Card>
            <Card>
              <h4 className="font-semibold text-slate-900 mb-2">What if I need to cancel?</h4>
              <p className="text-sm text-slate-500">You can cancel or reschedule appointments up to 2 hours before the scheduled time at no cost.</p>
            </Card>
            <Card>
              <h4 className="font-semibold text-slate-900 mb-2">Is my data secure?</h4>
              <p className="text-sm text-slate-500">We use end-to-end encryption for all communications and comply with healthcare data protection standards.</p>
            </Card>
            <Card>
              <h4 className="font-semibold text-slate-900 mb-2">Do you accept insurance?</h4>
              <p className="text-sm text-slate-500">Many of our practitioners accept insurance. Check individual profiles for accepted insurance plans.</p>
            </Card>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-br from-emerald-600 to-emerald-700 rounded-2xl p-8 md:p-12 text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 sm:w-64 md:w-96 h-48 sm:h-64 md:h-96 bg-white rounded-full filter blur-3xl opacity-10 translate-x-48 -translate-y-48"></div>
          <div className="absolute bottom-0 left-0 w-48 sm:w-64 md:w-96 h-48 sm:h-64 md:h-96 bg-white rounded-full filter blur-3xl opacity-10 -translate-x-48 translate-y-48"></div>
          
          <div className="relative">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-light text-white mb-4">
              Ready to start your healthcare journey?
            </h2>
            <p className="text-base sm:text-lg text-emerald-100 mb-6 max-w-2xl mx-auto">
              Join thousands of patients and practitioners who trust AfyaConnect for their healthcare needs.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/register">
                <button className="px-6 py-3 bg-white text-emerald-700 font-medium rounded-lg hover:shadow-xl transition">
                  Create Free Account
                </button>
              </Link>
              <Link href="/practitioners">
                <button className="px-6 py-3 border border-white text-white font-medium rounded-lg hover:bg-white/10 transition">
                  Browse Services
                </button>
              </Link>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white mt-8 sm:mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h4 className="font-medium text-slate-900 mb-4">AfyaConnect</h4>
              <ul className="space-y-2 text-sm text-slate-500">
                <li><Link href="/about" className="hover:text-emerald-600">About Us</Link></li>
                <li><Link href="/how-it-works" className="hover:text-emerald-600">How it Works</Link></li>
                <li><Link href="/contact" className="hover:text-emerald-600">Contact</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-slate-900 mb-4">Services</h4>
              <ul className="space-y-2 text-sm text-slate-500">
                <li><Link href="/services/nutrition" className="hover:text-emerald-600">Nutrition</Link></li>
                <li><Link href="/services/physiotherapy" className="hover:text-emerald-600">Physiotherapy</Link></li>
                <li><Link href="/services/nursing" className="hover:text-emerald-600">Nursing</Link></li>
                <li><Link href="/services/caregiving" className="hover:text-emerald-600">Caregiving</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-slate-900 mb-4">For Practitioners</h4>
              <ul className="space-y-2 text-sm text-slate-500">
                <li><Link href="/join" className="hover:text-emerald-600">Join as Practitioner</Link></li>
                <li><Link href="/practitioner-guide" className="hover:text-emerald-600">Practitioner Guide</Link></li>
                <li><Link href="/faq" className="hover:text-emerald-600">FAQ</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-slate-900 mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-slate-500">
                <li><Link href="/privacy" className="hover:text-emerald-600">Privacy Policy</Link></li>
                <li><Link href="/terms" className="hover:text-emerald-600">Terms of Service</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row justify-between items-center pt-8 border-t border-slate-200 text-xs text-slate-400">
            <span>© {new Date().getFullYear()} AfyaConnect. All rights reserved.</span>
            <span className="mt-2 sm:mt-0">Making healthcare accessible to all</span>
          </div>
        </div>
      </footer>
    </div>
  )
}