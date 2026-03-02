'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/app/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  CurrencyDollarIcon,
  BriefcaseIcon,
  AcademicCapIcon,
  PencilIcon,
  ArrowPathIcon,
  CheckCircleIcon,
  XCircleIcon,
  StarIcon,
  ShieldCheckIcon,
  ClockIcon,
  DocumentTextIcon,
  CalendarIcon
} from '@heroicons/react/24/outline'
import { Card, CardBody, CardHeader } from '@/app/components/ui/Card'
import { Button } from '@/app/components/ui/Buttons'
import { apiClient } from '@/app/lib/api'
import { extractResults } from '@/app/lib/utils'
import type { User, UserProfile, Practitioner, Specialty, PractitionerMetrics, ClientMetrics } from '@/app/types'
import { BadgeCheck, BadgeCheckIcon } from 'lucide-react'

// Type guard for practitioner metrics
function isPractitionerMetrics(metrics: PractitionerMetrics | ClientMetrics): metrics is PractitionerMetrics {
  return 'total_earnings' in metrics && 'average_rating' in metrics
}

// Info Item Component
const InfoItem = ({ icon: Icon, label, value, loading = false }: { 
  icon: React.ElementType; 
  label: string; 
  value: string;
  loading?: boolean;
}) => (
  <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200 hover:border-emerald-200 transition-all">
    <div className="p-2 bg-white rounded-lg shadow-sm">
      <Icon className="h-4 w-4 text-emerald-600" />
    </div>
    <div className="min-w-0 flex-1">
      <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">{label}</p>
      {loading ? (
        <div className="h-4 w-24 bg-slate-200 rounded animate-pulse mt-1"></div>
      ) : (
        <p className="text-sm font-semibold text-slate-900 truncate">{value}</p>
      )}
    </div>
  </div>
)

// Stat Card Component
const StatCard = ({ label, value, icon: Icon, color, trend }: { 
  label: string; 
  value: string | number; 
  icon: React.ElementType; 
  color: 'emerald' | 'blue' | 'amber' | 'purple';
  trend?: string;
}) => {
  const colorClasses = {
    emerald: 'bg-emerald-50 text-emerald-600 border-emerald-200',
    blue: 'bg-blue-50 text-blue-600 border-blue-200',
    amber: 'bg-amber-50 text-amber-600 border-amber-200',
    purple: 'bg-purple-50 text-purple-600 border-purple-200',
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 hover:shadow-md transition-all">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">{label}</span>
        <div className={`p-2 rounded-lg ${colorClasses[color]}`}>
          <Icon className="h-4 w-4" />
        </div>
      </div>
      <p className="text-xl font-bold text-slate-900">{value}</p>
      {trend && <p className="text-xs text-emerald-600 mt-1">{trend}</p>}
    </div>
  )
}

// Verification Badge Component
const VerificationBadge = ({ isVerified, status }: { isVerified: boolean; status?: string | null }) => {
  if (isVerified) {
    return (
      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-teal-100 text-teal-800 border border-teal-200">
        <BadgeCheck className="h-3 w-3 mr-1" />
        Verified Practitioner
      </span>
    )
  }

  if (status === 'approved') {
    return (
      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 border border-emerald-200">
        <CheckCircleIcon className="h-3 w-3 mr-1" />
        Application Approved
      </span>
    )
  }

  const statusConfig: Record<string, { text: string; color: string }> = {
    pending: { text: 'Application Under Review', color: 'bg-amber-100 text-amber-800 border-amber-200' },
    draft: { text: 'Complete Application', color: 'bg-slate-100 text-slate-800 border-slate-200' },
    info_needed: { text: 'Action Required', color: 'bg-blue-100 text-blue-800 border-blue-200' },
    rejected: { text: 'Application Rejected', color: 'bg-rose-100 text-rose-800 border-rose-200' },
  }

  const config = status && statusConfig[status] 
    ? statusConfig[status] 
    : { text: 'Pending Verification', color: 'bg-amber-100 text-amber-800 border-amber-200' }

  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${config.color}`}>
      <ClockIcon className="h-3 w-3 mr-1" />
      {config.text}
    </span>
  )
}

export default function PractitionerProfilePage() {
  const { user, isAuthenticated, isLoading: authLoading, refreshUser } = useAuth()
  const router = useRouter()
  const extendedUser = user as User | null
  
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [practitioner, setPractitioner] = useState<Practitioner | null>(null)
  const [specialties, setSpecialties] = useState<Specialty[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [formData, setFormData] = useState({
    phone: '',
    bio: '',
    city: '',
    hourly_rate: '',
    years_of_experience: '',
    selectedSpecialties: [] as number[]
  })
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [applicationStatus, setApplicationStatus] = useState<string | null>(null)
  const [hasApplication, setHasApplication] = useState(false)
  const [stats, setStats] = useState({
    totalConsultations: 0,
    completedConsultations: 0,
    upcomingConsultations: 0,
    averageRating: 0,
    totalReviews: 0,
    totalEarnings: 0
  })

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login')
      return
    }
    
    if (!authLoading && user?.role !== 'practitioner') {
      router.push('/client/dashboard')
      return
    }

    fetchData()
  }, [authLoading, isAuthenticated, user?.role, router])

  // Auto-refresh on visibility change
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && user) {
        fetchData(true)
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [user])

  const fetchData = async (silent = false) => {
    if (!silent) setLoading(true)
    setError(null)

    try {
      // First refresh user data from auth context
      await refreshUser()
      
      // Fetch application status
      if (user?.role === 'practitioner') {
        try {
          const appResponse = await apiClient.practitioners.applications.getStatus()
          setHasApplication(appResponse.hasApplication)
          if (appResponse.hasApplication && appResponse.application) {
            setApplicationStatus(appResponse.application.status)
          }
        } catch (error) {
          console.log('No application found')
        }
      }
      
      // Fetch profile and practitioner data
      const [profileData, specialtiesData, practitionerData] = await Promise.all([
        apiClient.profiles.getMyProfile().catch(() => null),
        apiClient.specialties.getAll(),
        apiClient.practitioners.getMyProfile().catch(() => null)
      ])
      
      setProfile(profileData)
      setSpecialties(specialtiesData)
      setPractitioner(practitionerData)
      
      // Initialize form data
      setFormData({
        phone: profileData?.phone || '',
        bio: practitionerData?.bio || '',
        city: practitionerData?.city || '',
        hourly_rate: practitionerData?.hourly_rate?.toString() || '',
        years_of_experience: practitionerData?.years_of_experience?.toString() || '',
        selectedSpecialties: practitionerData?.specialties?.map(s => s.id) || []
      })

      // Fetch metrics
      try {
        const metricsData = await apiClient.consultations.getMetrics()
        
        if (isPractitionerMetrics(metricsData)) {
          setStats({
            totalConsultations: metricsData.total_consultations || 0,
            completedConsultations: metricsData.completed_consultations || 0,
            upcomingConsultations: metricsData.upcoming_consultations || 0,
            averageRating: metricsData.average_rating || 0,
            totalReviews: metricsData.total_reviews || 0,
            totalEarnings: metricsData.total_earnings || 0
          })
        }
      } catch (error) {
        console.log('No metrics available')
      }
      
    } catch (error) {
      console.error('Failed to fetch profile:', error)
      setError('Failed to load profile')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const handleRefresh = useCallback(async () => {
    setRefreshing(true)
    await fetchData(true)
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSpecialtyToggle = (specialtyId: number) => {
    setFormData(prev => ({
      ...prev,
      selectedSpecialties: prev.selectedSpecialties.includes(specialtyId)
        ? prev.selectedSpecialties.filter(id => id !== specialtyId)
        : [...prev.selectedSpecialties, specialtyId]
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError(null)
    setSuccess(null)

    try {
      // Update profile
      await apiClient.profiles.updateMyProfile({
        phone: formData.phone
      })

      // Update practitioner profile
      if (practitioner) {
        await apiClient.practitioners.updateMyProfile({
          bio: formData.bio,
          city: formData.city,
          hourly_rate: parseFloat(formData.hourly_rate) || 0,
          years_of_experience: parseInt(formData.years_of_experience) || 0,
          specialties: formData.selectedSpecialties
        } as any)
      }
      
      setSuccess('Profile updated successfully')
      setEditMode(false)
      await fetchData(true)
    } catch (error: any) {
      console.error('Failed to update profile:', error)
      setError(error.message || 'Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="relative">
          <div className="animate-spin rounded-full h-14 w-14 border-4 border-emerald-200 border-t-emerald-600"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <UserIcon className="h-5 w-5 text-emerald-600 animate-pulse" />
          </div>
        </div>
      </div>
    )
  }

  if (!isAuthenticated || user?.role !== 'practitioner') {
    return null
  }

  const isVerified = user?.is_verified || false
  const displayName = user.first_name 
    ? `Dr. ${user.first_name} ${user.last_name || ''}`.trim()
    : 'Practitioner'

  return (
    <div className="max-w-6xl mx-auto px-3 sm:px-4 md:px-6 py-4 sm:py-5 md:py-6 space-y-5 sm:space-y-6">
      {/* Header with Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Practice Profile</h1>
          <p className="text-sm text-slate-500 mt-1 flex items-center gap-2">
            <ShieldCheckIcon className="h-4 w-4 text-emerald-500" />
            Manage your professional information and credentials
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="p-2.5 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition"
            title="Refresh profile"
          >
            <ArrowPathIcon className={`h-5 w-5 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
          {!editMode ? (
            <Button
              onClick={() => setEditMode(true)}
              variant="outline"
              className="flex items-center gap-2"
            >
              <PencilIcon className="h-4 w-4" />
              Edit Profile
            </Button>
          ) : (
            <Button
              onClick={() => setEditMode(false)}
              variant="outline"
              className="flex items-center gap-2"
            >
              <XCircleIcon className="h-4 w-4" />
              Cancel
            </Button>
          )}
        </div>
      </div>

      {/* Verification Status Banner */}
      <Card className={`border ${
        isVerified ? 'border-teal-200 bg-gradient-to-r from-teal-50 to-teal-50/30' :
        applicationStatus === 'approved' ? 'border-emerald-200 bg-gradient-to-r from-emerald-50 to-emerald-50/30' :
        'border-amber-200 bg-gradient-to-r from-amber-50 to-amber-50/30'
      }`}>
        <CardBody className="p-5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className={`p-2 rounded-lg ${
                isVerified ? 'bg-teal-100' :
                applicationStatus === 'approved' ? 'bg-emerald-100' :
                'bg-amber-100'
              }`}>
                <ShieldCheckIcon className={`h-5 w-5 ${
                  isVerified ? 'text-teal-600' :
                  applicationStatus === 'approved' ? 'text-emerald-600' :
                  'text-amber-600'
                }`} />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <VerificationBadge isVerified={isVerified} status={applicationStatus} />
                </div>
                <p className="text-sm text-slate-600">
                  {isVerified 
                    ? 'Your account is verified. You can now accept bookings and manage your practice.'
                    : applicationStatus === 'approved'
                      ? 'Your application has been approved! You can now start accepting bookings.'
                      : hasApplication 
                        ? applicationStatus === 'pending' 
                          ? 'Your application is under review. We\'ll notify you once it\'s processed.'
                          : applicationStatus === 'draft'
                            ? 'Please complete your application to get verified.'
                            : applicationStatus === 'info_needed'
                              ? 'Additional information is required. Please check your application.'
                              : applicationStatus === 'rejected'
                                ? 'Your application was not approved. Please review the feedback and reapply.'
                                : 'Complete your application to get verified.'
                        : 'Complete your application to get verified and start accepting bookings.'
                  }
                </p>
              </div>
            </div>
            {!isVerified && applicationStatus === 'approved' && (
              <Link href="/practitioner/dashboard/availability">
                <Button className="bg-emerald-600 hover:bg-emerald-700 text-white whitespace-nowrap">
                  Set Availability
                  <CalendarIcon className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            )}
            {!isVerified && !hasApplication && (
              <Link href="/practitioner/application">
                <Button className="bg-emerald-600 hover:bg-emerald-700 text-white whitespace-nowrap">
                  Start Application
                  <AcademicCapIcon className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            )}
          </div>
        </CardBody>
      </Card>

      {/* Profile Card */}
      <Card>
        <CardBody className="p-5 sm:p-6">
          {editMode ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Info */}
              <div>
                <h3 className="text-lg font-semibold mb-3 text-slate-900">Basic Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={`Dr. ${user?.first_name || ''} ${user?.last_name || ''}`}
                      disabled
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-slate-100 cursor-not-allowed text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      value={user?.email || ''}
                      disabled
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-slate-100 cursor-not-allowed text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="+254 123 456 789"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              {/* Professional Info */}
              <div className="pt-4 border-t border-slate-200">
                <h3 className="text-lg font-semibold mb-3 text-slate-900">Professional Information</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Professional Bio
                    </label>
                    <textarea
                      name="bio"
                      rows={4}
                      value={formData.bio}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      placeholder="Tell clients about your experience and approach..."
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        City
                      </label>
                      <input
                        type="text"
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                        placeholder="Nairobi"
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        Years Experience
                      </label>
                      <input
                        type="number"
                        name="years_of_experience"
                        value={formData.years_of_experience}
                        onChange={handleInputChange}
                        min="0"
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        Hourly Rate (KES)
                      </label>
                      <input
                        type="number"
                        name="hourly_rate"
                        value={formData.hourly_rate}
                        onChange={handleInputChange}
                        min="0"
                        step="100"
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Specialties
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {specialties.map(specialty => (
                        <button
                          key={specialty.id}
                          type="button"
                          onClick={() => handleSpecialtyToggle(specialty.id)}
                          className={`px-3 py-1 rounded-full text-sm transition ${
                            formData.selectedSpecialties.includes(specialty.id)
                              ? 'bg-emerald-600 text-white'
                              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                          }`}
                        >
                          {specialty.name}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Error/Success Messages */}
              {error && (
                <div className="bg-rose-50 border border-rose-200 rounded-lg p-3">
                  <p className="text-sm text-rose-600">{error}</p>
                </div>
              )}
              
              {success && (
                <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3">
                  <p className="text-sm text-emerald-600">{success}</p>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-4">
                <Button
                  type="submit"
                  disabled={saving}
                  variant="primary"
                  className="flex items-center gap-2"
                >
                  {saving ? (
                    <>
                      <ArrowPathIcon className="h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    'Save Changes'
                  )}
                </Button>
              </div>
            </form>
          ) : (
            <div className="space-y-6">
              {/* Profile Header */}
              <div className="flex items-center gap-4 pb-4 border-b border-slate-200">
                <div className="relative">
                  <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                    {user?.first_name?.[0]}{user?.last_name?.[0]}
                  </div>
                  {isVerified && (
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-teal-500 rounded-full border-2 border-white flex items-center justify-center">
                      <CheckCircleIcon className="h-3 w-3 text-white" />
                    </div>
                  )}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900">{displayName}</h2>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-sm text-slate-500">Practitioner</span>
                    <VerificationBadge isVerified={isVerified} status={applicationStatus} />
                  </div>
                </div>
              </div>

              {/* Info Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InfoItem
                  icon={UserIcon}
                  label="Full Name"
                  value={displayName}
                />
                <InfoItem
                  icon={EnvelopeIcon}
                  label="Email"
                  value={user?.email || ''}
                />
                <InfoItem
                  icon={PhoneIcon}
                  label="Phone"
                  value={profile?.phone || 'Not provided'}
                />
                <InfoItem
                  icon={MapPinIcon}
                  label="Location"
                  value={practitioner?.city || 'Not set'}
                />
                <InfoItem
                  icon={BriefcaseIcon}
                  label="Experience"
                  value={practitioner?.years_of_experience ? `${practitioner.years_of_experience} years` : 'Not set'}
                />
                <InfoItem
                  icon={CurrencyDollarIcon}
                  label="Hourly Rate"
                  value={practitioner?.hourly_rate ? `KES ${practitioner.hourly_rate.toLocaleString()}` : 'Not set'}
                />
              </div>

              {/* Bio */}
              {practitioner?.bio && (
                <div className="pt-4 border-t border-slate-200">
                  <h3 className="text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
                    <DocumentTextIcon className="h-4 w-4 text-emerald-500" />
                    About
                  </h3>
                  <p className="text-sm text-slate-600 bg-slate-50 p-3 rounded-lg">{practitioner.bio}</p>
                </div>
              )}

              {/* Specialties */}
              {practitioner?.specialties && practitioner.specialties.length > 0 && (
                <div className="pt-4 border-t border-slate-200">
                  <h3 className="text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
                    <StarIcon className="h-4 w-4 text-emerald-500" />
                    Specialties
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {practitioner.specialties.map(specialty => (
                      <span
                        key={specialty.id}
                        className="px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-sm"
                      >
                        {specialty.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Stats */}
              <div className="mt-6 pt-4 border-t border-slate-200">
                <h3 className="text-lg font-semibold mb-3 text-slate-900">Practice Stats</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <StatCard 
                    label="Total" 
                    value={stats.totalConsultations} 
                    icon={CalendarIcon} 
                    color="emerald" 
                  />
                  <StatCard 
                    label="Completed" 
                    value={stats.completedConsultations} 
                    icon={CheckCircleIcon} 
                    color="blue" 
                  />
                  <StatCard 
                    label="Upcoming" 
                    value={stats.upcomingConsultations} 
                    icon={ClockIcon} 
                    color="amber" 
                  />
                  <StatCard 
                    label="Rating" 
                    value={stats.averageRating.toFixed(1)} 
                    icon={StarIcon} 
                    color="purple"
                    trend={`${stats.totalReviews} reviews`}
                  />
                </div>
              </div>
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  )
}