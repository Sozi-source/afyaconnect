// app/practitioners/[id]/page.tsx
import { Suspense } from 'react'
import { notFound } from 'next/navigation'
import { Metadata } from 'next'
import { apiClient } from '@/app/lib/api'
import { PractitionerProfile } from '@/app/components/practitioners/PractitionerProfile'
import { BookSlot } from '@/app/components/practitioners/BookSlot'
import { PractitionerReviews } from '@/app/components/practitioners/PractitionerReviews'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function PractitionerPage({ params }: PageProps) {
  const { id } = await params
  const practitionerId = parseInt(id)

  try {
    const practitioner = await apiClient.practitioners.getOne(practitionerId)
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50/30">
        {/* Hero Background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-emerald-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20" />
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-slate-500 mb-6">
            <a href="/" className="hover:text-emerald-600 transition-colors">Home</a>
            <span>›</span>
            <a href="/practitioners" className="hover:text-emerald-600 transition-colors">Practitioners</a>
            <span>›</span>
            <span className="text-slate-800 font-medium">Profile</span>
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
            {/* Left Column - Profile */}
            <div className="lg:col-span-2 space-y-8">
              <Suspense fallback={<ProfileSkeleton />}>
                <PractitionerProfile practitioner={practitioner} />
              </Suspense>

              {/* About Section */}
              <Suspense fallback={<AboutSkeleton />}>
                <AboutSection practitioner={practitioner} />
              </Suspense>

              {/* Credentials & Experience */}
              <Suspense fallback={<CredentialsSkeleton />}>
                <CredentialsSection practitioner={practitioner} />
              </Suspense>

              {/* Reviews Section */}
              <div className="pt-4">
                <Suspense fallback={<ReviewsSkeleton />}>
                  <PractitionerReviews practitionerId={practitionerId} />
                </Suspense>
              </div>
            </div>

            {/* Right Column - Booking (Sticky) */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 space-y-6">
                <Suspense fallback={<BookingSkeleton />}>
                  <BookSlot 
                    practitionerId={practitionerId}
                    onBookingComplete="/client/dashboard/consultations?booked=true"
                  />
                </Suspense>

                {/* Quick Info Card */}
                <QuickInfoCard practitioner={practitioner} />
              </div>
            </div>
          </div>

          {/* Similar Practitioners */}
          <div className="mt-16">
            <Suspense fallback={<SimilarSkeleton />}>
              <SimilarPractitioners 
                practitionerId={practitionerId} 
                specialty={practitioner.specialties?.[0]?.id}
              />
            </Suspense>
          </div>
        </div>
      </div>
    )
  } catch {
    notFound()
  }
}

// ============================================================================
// About Section Component
// ============================================================================
const AboutSection = ({ practitioner }: { practitioner: any }) => (
  <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-slate-200/60 p-6 sm:p-8">
    <h2 className="text-xl font-semibold text-slate-800 mb-4">About</h2>
    <div className="prose prose-slate max-w-none">
      <p className="text-slate-600 leading-relaxed">
        {practitioner.bio || 'No bio provided.'}
      </p>
    </div>
    
    {/* Languages */}
    <div className="mt-6 pt-6 border-t border-slate-200">
      <h3 className="text-sm font-medium text-slate-500 mb-3">Languages</h3>
      <div className="flex flex-wrap gap-2">
        {['English', 'Swahili'].map(lang => (
          <span key={lang} className="px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-sm">
            {lang}
          </span>
        ))}
      </div>
    </div>
  </div>
)

// ============================================================================
// Credentials Section
// ============================================================================
const CredentialsSection = ({ practitioner }: { practitioner: any }) => (
  <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-slate-200/60 p-6 sm:p-8">
    <h2 className="text-xl font-semibold text-slate-800 mb-6">Credentials & Experience</h2>
    
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <h3 className="text-sm font-medium text-slate-500 mb-3">Education</h3>
        <ul className="space-y-3">
          <li className="flex gap-3">
            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full mt-2" />
            <div>
              <p className="font-medium text-slate-800">Bachelor of Medicine</p>
              <p className="text-sm text-slate-500">University of Nairobi • 2015</p>
            </div>
          </li>
        </ul>
      </div>
      
      <div>
        <h3 className="text-sm font-medium text-slate-500 mb-3">Certifications</h3>
        <ul className="space-y-3">
          <li className="flex gap-3">
            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full mt-2" />
            <div>
              <p className="font-medium text-slate-800">Medical License</p>
              <p className="text-sm text-slate-500">Kenya Medical Board • 2024</p>
            </div>
          </li>
        </ul>
      </div>
    </div>
    
    <div className="mt-6 pt-6 border-t border-slate-200">
      <h3 className="text-sm font-medium text-slate-500 mb-3">Specialties</h3>
      <div className="flex flex-wrap gap-2">
        {practitioner.specialties?.map((s: any) => (
          <span key={s.id} className="px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-lg text-sm font-medium">
            {s.name}
          </span>
        ))}
      </div>
    </div>
  </div>
)

// ============================================================================
// Quick Info Card
// ============================================================================
const QuickInfoCard = ({ practitioner }: { practitioner: any }) => (
  <div className="bg-gradient-to-br from-emerald-50 to-blue-50 rounded-2xl p-6 border border-emerald-100/60">
    <h3 className="text-sm font-medium text-slate-500 mb-4">Quick Info</h3>
    <div className="space-y-3 text-sm">
      <div className="flex justify-between">
        <span className="text-slate-600">Experience</span>
        <span className="font-medium text-slate-800">{practitioner.years_of_experience}+ years</span>
      </div>
      <div className="flex justify-between">
        <span className="text-slate-600">Session</span>
        <span className="font-medium text-slate-800">{practitioner.duration_minutes || 60} min</span>
      </div>
      <div className="flex justify-between">
        <span className="text-slate-600">Rate</span>
        <span className="font-medium text-emerald-600">KES {practitioner.hourly_rate}</span>
      </div>
      <div className="flex justify-between">
        <span className="text-slate-600">Location</span>
        <span className="font-medium text-slate-800">{practitioner.city || 'Nairobi'}</span>
      </div>
      <div className="flex justify-between">
        <span className="text-slate-600">Response Time</span>
        <span className="font-medium text-slate-800">&lt; 2 hours</span>
      </div>
    </div>
    
    <div className="mt-4 pt-4 border-t border-emerald-200/50">
      <div className="flex items-center justify-between text-xs">
        <span className="text-slate-500">Verification Status</span>
        <span className="flex items-center gap-1 text-emerald-600">
          <span className="w-2 h-2 bg-emerald-500 rounded-full" />
          {practitioner.is_verified ? 'Verified' : 'Pending'}
        </span>
      </div>
    </div>
  </div>
)

// ============================================================================
// Similar Practitioners
// ============================================================================
const SimilarPractitioners = async ({ practitionerId, specialty }: { practitionerId: number; specialty?: number }) => {
  if (!specialty) return null
  
  const data = await apiClient.practitioners.getAll({ 
    specialty: specialty.toString(),
    verified: true 
  })
  const practitioners = Array.isArray(data) ? data : data.results || []
  const filtered = practitioners.filter(p => p.id !== practitionerId).slice(0, 3)
  
  if (filtered.length === 0) return null
  
  return (
    <div>
      <h2 className="text-xl font-semibold text-slate-800 mb-6">Similar Practitioners</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(p => (
          <a
            key={p.id}
            href={`/practitioners/${p.id}`}
            className="group bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-slate-200 hover:border-emerald-200 hover:shadow-md transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center text-white font-bold">
                {p.first_name?.[0]}{p.last_name?.[0]}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-slate-800 group-hover:text-emerald-600 transition-colors truncate">
                  Dr. {p.first_name} {p.last_name}
                </p>
                <p className="text-xs text-slate-500">{p.specialties?.map(s => s.name).join(', ')}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-emerald-600">KES {p.hourly_rate}</p>
              </div>
            </div>
          </a>
        ))}
      </div>
    </div>
  )
}

// ============================================================================
// Loading Skeletons
// ============================================================================
const ProfileSkeleton = () => (
  <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-slate-200/60 p-6 sm:p-8 animate-pulse">
    <div className="flex flex-col sm:flex-row gap-6">
      <div className="w-28 h-28 bg-slate-200 rounded-2xl" />
      <div className="flex-1 space-y-4">
        <div className="h-8 bg-slate-200 rounded w-2/3" />
        <div className="h-5 bg-slate-200 rounded w-1/3" />
        <div className="flex gap-2">
          <div className="h-6 bg-slate-200 rounded w-20" />
          <div className="h-6 bg-slate-200 rounded w-20" />
        </div>
      </div>
    </div>
  </div>
)

const AboutSkeleton = () => (
  <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-slate-200/60 p-6 sm:p-8 animate-pulse">
    <div className="h-7 bg-slate-200 rounded w-24 mb-4" />
    <div className="space-y-2">
      <div className="h-4 bg-slate-200 rounded w-full" />
      <div className="h-4 bg-slate-200 rounded w-5/6" />
      <div className="h-4 bg-slate-200 rounded w-4/6" />
    </div>
  </div>
)

const CredentialsSkeleton = () => (
  <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-slate-200/60 p-6 sm:p-8 animate-pulse">
    <div className="h-7 bg-slate-200 rounded w-40 mb-6" />
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="space-y-3">
        <div className="h-5 bg-slate-200 rounded w-24" />
        <div className="h-4 bg-slate-200 rounded w-full" />
        <div className="h-4 bg-slate-200 rounded w-5/6" />
      </div>
      <div className="space-y-3">
        <div className="h-5 bg-slate-200 rounded w-24" />
        <div className="h-4 bg-slate-200 rounded w-full" />
        <div className="h-4 bg-slate-200 rounded w-5/6" />
      </div>
    </div>
  </div>
)

const BookingSkeleton = () => (
  <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6 animate-pulse">
    <div className="h-7 bg-slate-200 rounded w-32 mb-4" />
    <div className="space-y-3">
      <div className="h-12 bg-slate-200 rounded" />
      <div className="h-12 bg-slate-200 rounded" />
      <div className="h-12 bg-slate-200 rounded" />
    </div>
  </div>
)

const ReviewsSkeleton = () => (
  <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-slate-200/60 p-6 sm:p-8 animate-pulse">
    <div className="h-7 bg-slate-200 rounded w-32 mb-6" />
    <div className="space-y-4">
      {[...Array(2)].map((_, i) => (
        <div key={i} className="h-24 bg-slate-200 rounded" />
      ))}
    </div>
  </div>
)

const SimilarSkeleton = () => (
  <div className="animate-pulse">
    <div className="h-7 bg-slate-200 rounded w-48 mb-6" />
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="bg-white/80 rounded-xl p-4 border border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-slate-200 rounded-full" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-slate-200 rounded w-3/4" />
              <div className="h-3 bg-slate-200 rounded w-1/2" />
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
)