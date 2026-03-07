// app/components/practitioner/profile/PractitionerProfilePage.tsx
'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/app/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
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
  CalendarIcon,
  XMarkIcon,
  SparklesIcon
} from '@heroicons/react/24/outline'
import { Card, CardBody } from '@/app/components/ui/Card'
import { Button } from '@/app/components/ui/Buttons'
import { apiClient } from '@/app/lib/api'
import { extractResults } from '@/app/lib/utils'
import type { User, UserProfile, Practitioner, Specialty, PractitionerMetrics, ClientMetrics } from '@/app/types'

// Type guard for practitioner metrics
function isPractitionerMetrics(metrics: PractitionerMetrics | ClientMetrics): metrics is PractitionerMetrics {
  return 'total_earnings' in metrics && 'average_rating' in metrics
}

// Mobile Edit Menu Component
const MobileEditMenu = ({ isOpen, onClose, children }: { isOpen: boolean; onClose: () => void; children: React.ReactNode }) => {
  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 lg:hidden">
        <div className="fixed inset-0 bg-black/50" onClick={onClose} />
        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="fixed bottom-0 left-0 right-0 bg-white rounded-t-2xl shadow-xl max-h-[90vh] overflow-y-auto"
        >
          <div className="sticky top-0 bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-900">Edit Profile</h3>
            <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg">
              <XMarkIcon className="h-5 w-5 text-slate-600" />
            </button>
          </div>
          <div className="p-4">
            {children}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}

// Info Item Component - Mobile optimized
const InfoItem = ({ icon: Icon, label, value, loading = false }: { 
  icon: React.ElementType; 
  label: string; 
  value: string;
  loading?: boolean;
}) => (
  <div className="flex items-start gap-2 p-2.5 sm:p-3 bg-slate-50 rounded-lg border border-slate-200 hover:border-emerald-200 transition-all">
    <div className="p-1.5 bg-white rounded-lg shadow-sm flex-shrink-0">
      <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-emerald-600" />
    </div>
    <div className="min-w-0 flex-1">
      <p className="text-[9px] sm:text-xs font-medium text-slate-500 uppercase tracking-wider">{label}</p>
      {loading ? (
        <div className="h-3 sm:h-4 w-16 sm:w-24 bg-slate-200 rounded animate-pulse mt-0.5"></div>
      ) : (
        <p className="text-xs sm:text-sm font-semibold text-slate-900 truncate">{value}</p>
      )}
    </div>
  </div>
)

// Stat Card Component - Mobile optimized
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
    <div className="bg-white rounded-lg sm:rounded-xl border border-slate-200 p-2.5 sm:p-3 hover:shadow-md transition-all">
      <div className="flex items-center justify-between mb-1 sm:mb-2">
        <span className="text-[9px] sm:text-xs font-medium text-slate-500 uppercase tracking-wider truncate pr-1">{label}</span>
        <div className={`p-1 sm:p-1.5 rounded-lg ${colorClasses[color]} flex-shrink-0`}>
          <Icon className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
        </div>
      </div>
      <p className="text-sm sm:text-base font-bold text-slate-900 truncate">{value}</p>
      {trend && <p className="text-[8px] sm:text-xs text-emerald-600 mt-0.5 truncate">{trend}</p>}
    </div>
  )
}

// Simplified Verification Badge - Shows only verification status
const VerificationBadge = ({ isVerified }: { isVerified: boolean }) => {
  if (isVerified) {
    return (
      <span className="inline-flex items-center px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-[9px] sm:text-xs font-medium bg-teal-100 text-teal-800 border border-teal-200">
        <CheckCircleIcon className="h-2.5 w-2.5 sm:h-3 sm:w-3 mr-0.5 sm:mr-1" />
        <span className="hidden xs:inline">Verified</span>
        <span className="xs:hidden">✓</span>
      </span>
    )
  }

  return (
    <span className="inline-flex items-center px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-[9px] sm:text-xs font-medium bg-amber-100 text-amber-800 border border-amber-200">
      <ClockIcon className="h-2.5 w-2.5 sm:h-3 sm:w-3 mr-0.5 sm:mr-1" />
      <span className="hidden xs:inline">Not Verified</span>
      <span className="xs:hidden">!</span>
    </span>
  )
}

// Color mapping objects for static classes
const bannerColors = {
  teal: 'border-teal-200 bg-gradient-to-r from-teal-50 to-teal-50/30',
  emerald: 'border-emerald-200 bg-gradient-to-r from-emerald-50 to-emerald-50/30',
  amber: 'border-amber-200 bg-gradient-to-r from-amber-50 to-amber-50/30',
  slate: 'border-slate-200 bg-gradient-to-r from-slate-50 to-slate-50/30',
  blue: 'border-blue-200 bg-gradient-to-r from-blue-50 to-blue-50/30',
  rose: 'border-rose-200 bg-gradient-to-r from-rose-50 to-rose-50/30',
}

const iconBgColors = {
  teal: 'bg-teal-100',
  emerald: 'bg-emerald-100',
  amber: 'bg-amber-100',
  slate: 'bg-slate-100',
  blue: 'bg-blue-100',
  rose: 'bg-rose-100',
}

const iconTextColors = {
  teal: 'text-teal-600',
  emerald: 'text-emerald-600',
  amber: 'text-amber-600',
  slate: 'text-slate-600',
  blue: 'text-blue-600',
  rose: 'text-rose-600',
}

export default function PractitionerProfilePage() {
  // ========== 1. ALL HOOKS FIRST ==========
  const { user, isAuthenticated, isLoading: authLoading, refreshUser } = useAuth()
  const router = useRouter()
  const [isMounted, setIsMounted] = useState(false)
  const [mobileEditOpen, setMobileEditOpen] = useState(false)
  
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

  // ========== 2. FUNCTION DEFINITIONS (before useEffect) ==========
  const fetchData = async (silent = false) => {
    if (!silent) setLoading(true)
    setError(null)

    try {
      await refreshUser()
      
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
      
      const [profileData, specialtiesData, practitionerData] = await Promise.all([
        apiClient.profiles.getMyProfile().catch(() => null),
        apiClient.specialties.getAll(),
        apiClient.practitioners.getMyProfile().catch(() => null)
      ])
      
      setProfile(profileData)
      setSpecialties(specialtiesData)
      setPractitioner(practitionerData)
      
      setFormData({
        phone: profileData?.phone || '',
        bio: practitionerData?.bio || '',
        city: practitionerData?.city || '',
        hourly_rate: practitionerData?.hourly_rate?.toString() || '',
        years_of_experience: practitionerData?.years_of_experience?.toString() || '',
        selectedSpecialties: practitionerData?.specialties?.map(s => s.id) || []
      })

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
      await apiClient.profiles.updateMyProfile({
        phone: formData.phone
      })

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
      setMobileEditOpen(false)
      await fetchData(true)
    } catch (error: any) {
      console.error('Failed to update profile:', error)
      setError(error.message || 'Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  const getApplicationMessage = () => {
    if (isVerified) {
      return {
        title: 'Verified Practitioner',
        message: 'Your account is verified. You can accept bookings and manage your practice.',
        icon: ShieldCheckIcon,
        color: 'teal' as const
      }
    }
    
    if (applicationStatus === 'approved') {
      return {
        title: 'Application Approved',
        message: 'Your application has been approved! You can now start accepting bookings.',
        icon: CheckCircleIcon,
        color: 'emerald' as const
      }
    }
    
    if (hasApplication && applicationStatus) {
      const messages: Record<string, { title: string; message: string; icon: any; color: 'amber' | 'slate' | 'blue' | 'rose' }> = {
        pending: {
          title: 'Application Under Review',
          message: 'Your application is under review. We\'ll notify you once it\'s processed.',
          icon: ClockIcon,
          color: 'amber'
        },
        draft: {
          title: 'Complete Your Application',
          message: 'Please complete your application to get verified.',
          icon: PencilIcon,
          color: 'slate'
        },
        info_needed: {
          title: 'Additional Information Required',
          message: 'Please check your application and provide the requested information.',
          icon: AcademicCapIcon,
          color: 'blue'
        },
        rejected: {
          title: 'Application Not Approved',
          message: 'Your application was not approved. Please review the feedback and reapply.',
          icon: XCircleIcon,
          color: 'rose'
        }
      }
      
      if (applicationStatus in messages) {
        return messages[applicationStatus as keyof typeof messages]
      }
    }
    
    return {
      title: 'Start Your Application',
      message: 'Complete your application to get verified and start accepting bookings.',
      icon: AcademicCapIcon,
      color: 'blue' as const
    }
  }

  // ========== 3. USEFFECT HOOKS ==========
  useEffect(() => {
    setIsMounted(true)
  }, [])

  useEffect(() => {
    if (isMounted) {
      fetchData()
    }
  }, [isMounted])

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && user) {
        fetchData(true)
      }
    }
    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [user])

  // ========== 4. EARLY RETURNS ==========
  if (authLoading || !isMounted) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] px-4">
        <div className="relative">
          <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-3 border-emerald-200 border-t-emerald-600"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <UserIcon className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-600 animate-pulse" />
          </div>
        </div>
      </div>
    )
  }

  if (!isAuthenticated || !user) {
    router.push('/login')
    return null
  }

  if (user?.role !== 'practitioner') {
    router.push('/client/dashboard')
    return null
  }

  // ========== 5. LOADING STATE ==========
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] px-4">
        <div className="relative">
          <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-3 border-emerald-200 border-t-emerald-600"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <UserIcon className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-600 animate-pulse" />
          </div>
        </div>
      </div>
    )
  }

  const isVerified = user?.is_verified || false
  const displayName = user.first_name 
    ? `Dr. ${user.first_name} ${user.last_name || ''}`.trim()
    : 'Practitioner'

  const appMessage = getApplicationMessage()
  const AppIcon = appMessage.icon

  // Desktop edit form
  const DesktopEditForm = () => (
    <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
      <div>
        <h3 className="text-sm sm:text-base font-semibold mb-2 sm:mb-3 text-slate-900">Basic Information</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <div>
            <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1">
              Full Name
            </label>
            <input
              type="text"
              value={`Dr. ${user?.first_name || ''} ${user?.last_name || ''}`}
              disabled
              className="w-full px-2.5 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm border border-slate-300 rounded-lg bg-slate-100 cursor-not-allowed text-slate-900"
            />
          </div>

          <div>
            <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1">
              Email
            </label>
            <input
              type="email"
              value={user?.email || ''}
              disabled
              className="w-full px-2.5 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm border border-slate-300 rounded-lg bg-slate-100 cursor-not-allowed text-slate-900"
            />
          </div>

          <div>
            <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1">
              Phone Number
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              placeholder="+254 123 456 789"
              className="w-full px-2.5 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      <div className="pt-3 sm:pt-4 border-t border-slate-200">
        <h3 className="text-sm sm:text-base font-semibold mb-2 sm:mb-3 text-slate-900">Professional Information</h3>
        <div className="space-y-3 sm:space-y-4">
          <div>
            <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1">
              Professional Bio
            </label>
            <textarea
              name="bio"
              rows={3}
              value={formData.bio}
              onChange={handleInputChange}
              className="w-full px-2.5 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              placeholder="Tell clients about your experience..."
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1">
                City
              </label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleInputChange}
                placeholder="Nairobi"
                className="w-full px-2.5 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1">
                Years Exp
              </label>
              <input
                type="number"
                name="years_of_experience"
                value={formData.years_of_experience}
                onChange={handleInputChange}
                min="0"
                className="w-full px-2.5 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1">
                Rate (KES)
              </label>
              <input
                type="number"
                name="hourly_rate"
                value={formData.hourly_rate}
                onChange={handleInputChange}
                min="0"
                step="100"
                className="w-full px-2.5 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1">
              Specialties
            </label>
            <div className="flex flex-wrap gap-1.5">
              {specialties.map(specialty => (
                <button
                  key={specialty.id}
                  type="button"
                  onClick={() => handleSpecialtyToggle(specialty.id)}
                  className={`px-2 py-1 sm:px-2.5 sm:py-1 rounded-full text-[10px] sm:text-xs transition ${
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

      {error && (
        <div className="bg-rose-50 border border-rose-200 rounded-lg p-2 sm:p-3">
          <p className="text-xs sm:text-sm text-rose-600">{error}</p>
        </div>
      )}
      
      {success && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-2 sm:p-3">
          <p className="text-xs sm:text-sm text-emerald-600">{success}</p>
        </div>
      )}

      <div className="flex justify-end gap-2 pt-3">
        <Button
          type="submit"
          disabled={saving}
          variant="primary"
          className="flex items-center gap-1.5 text-xs sm:text-sm px-3 sm:px-4 py-1.5 sm:py-2"
        >
          {saving ? (
            <>
              <ArrowPathIcon className="h-3 w-3 sm:h-4 sm:w-4 animate-spin" />
              <span>Saving...</span>
            </>
          ) : (
            'Save Changes'
          )}
        </Button>
      </div>
    </form>
  )

  return (
    <div className="max-w-6xl mx-auto px-3 sm:px-4 md:px-6 py-3 sm:py-4 md:py-6 space-y-4 sm:space-y-5 md:space-y-6">
      {/* Header with Actions */}
      <div className="flex flex-col xs:flex-row xs:items-center xs:justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-slate-900 truncate">Practice Profile</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5 flex items-center gap-1.5">
            <ShieldCheckIcon className="h-3.5 w-3.5 text-emerald-500 flex-shrink-0" />
            <span className="truncate">Manage your professional information</span>
          </p>
        </div>
        <div className="flex items-center gap-2 self-end xs:self-auto">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition"
            title="Refresh profile"
          >
            <ArrowPathIcon className={`h-4 w-4 sm:h-5 sm:w-5 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
          {!editMode ? (
            <>
              <Button
                onClick={() => setEditMode(true)}
                variant="outline"
                className="hidden sm:flex items-center gap-1.5 text-xs sm:text-sm px-3 sm:px-4 py-1.5 sm:py-2"
              >
                <PencilIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                Edit Profile
              </Button>
              <Button
                onClick={() => setMobileEditOpen(true)}
                variant="outline"
                className="sm:hidden flex items-center gap-1 px-3 py-2 text-xs"
              >
                <PencilIcon className="h-3.5 w-3.5" />
                Edit
              </Button>
            </>
          ) : (
            <Button
              onClick={() => setEditMode(false)}
              variant="outline"
              className="hidden sm:flex items-center gap-1.5 text-xs sm:text-sm"
            >
              <XCircleIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              Cancel
            </Button>
          )}
        </div>
      </div>

      {/* Single Application Status Banner */}
      <Card className={bannerColors[appMessage.color]}>
        <CardBody className="p-3 sm:p-4">
          <div className="flex flex-col xs:flex-row xs:items-center xs:justify-between gap-3">
            <div className="flex items-start gap-2 min-w-0">
              <div className={`p-1.5 sm:p-2 rounded-lg ${iconBgColors[appMessage.color]} flex-shrink-0`}>
                <AppIcon className={`h-4 w-4 sm:h-5 sm:w-5 ${iconTextColors[appMessage.color]}`} />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className={`text-xs sm:text-sm font-semibold ${iconTextColors[appMessage.color]} mb-0.5`}>
                  {appMessage.title}
                </h3>
                <p className="text-[10px] sm:text-xs text-slate-600 line-clamp-2">
                  {appMessage.message}
                </p>
              </div>
            </div>
            {!isVerified && applicationStatus === 'approved' && (
              <Link href="/practitioner/dashboard/availability" className="w-full xs:w-auto">
                <Button className="w-full xs:w-auto bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm px-3 py-2">
                  <CalendarIcon className="h-3.5 w-3.5 mr-1.5" />
                  <span className="hidden xs:inline">Set Availability</span>
                  <span className="xs:hidden">Setup</span>
                </Button>
              </Link>
            )}
            {!isVerified && !hasApplication && (
              <Link href="/practitioner/application" className="w-full xs:w-auto">
                <Button className="w-full xs:w-auto bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm px-3 py-2">
                  <AcademicCapIcon className="h-3.5 w-3.5 mr-1.5" />
                  <span className="hidden xs:inline">Start Application</span>
                  <span className="xs:hidden">Apply</span>
                </Button>
              </Link>
            )}
          </div>
        </CardBody>
      </Card>

      {/* Profile Card */}
      <Card>
        <CardBody className="p-3 sm:p-4 md:p-5">
          {editMode ? (
            <div className="hidden sm:block">
              <DesktopEditForm />
            </div>
          ) : (
            <div className="space-y-4 sm:space-y-5">
              {/* Profile Header */}
              <div className="flex items-center gap-3 sm:gap-4 pb-3 sm:pb-4 border-b border-slate-200">
                <div className="relative flex-shrink-0">
                  <div className="w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-full flex items-center justify-center text-white text-lg sm:text-xl md:text-2xl font-bold">
                    {user?.first_name?.[0]}{user?.last_name?.[0]}
                  </div>
                  {isVerified && (
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 sm:w-5 sm:h-5 bg-teal-500 rounded-full border-2 border-white flex items-center justify-center">
                      <CheckCircleIcon className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-white" />
                    </div>
                  )}
                </div>
                <div className="min-w-0">
                  <h2 className="text-base sm:text-lg md:text-xl font-bold text-slate-900 truncate">{displayName}</h2>
                  <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                    <span className="text-[10px] sm:text-xs text-slate-500">Practitioner</span>
                    <VerificationBadge isVerified={isVerified} />
                  </div>
                </div>
              </div>

              {/* Info Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                <InfoItem icon={UserIcon} label="Full Name" value={displayName} />
                <InfoItem icon={EnvelopeIcon} label="Email" value={user?.email || ''} />
                <InfoItem icon={PhoneIcon} label="Phone" value={profile?.phone || 'Not provided'} />
                <InfoItem icon={MapPinIcon} label="Location" value={practitioner?.city || 'Not set'} />
                <InfoItem icon={BriefcaseIcon} label="Experience" value={practitioner?.years_of_experience ? `${practitioner.years_of_experience} years` : 'Not set'} />
                <InfoItem icon={CurrencyDollarIcon} label="Hourly Rate" value={practitioner?.hourly_rate ? `KES ${practitioner.hourly_rate.toLocaleString()}` : 'Not set'} />
              </div>

              {/* Bio */}
              {practitioner?.bio && (
                <div className="pt-3 sm:pt-4 border-t border-slate-200">
                  <h3 className="text-xs sm:text-sm font-medium text-slate-700 mb-1.5 flex items-center gap-1.5">
                    <DocumentTextIcon className="h-3.5 w-3.5 text-emerald-500" />
                    About
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 bg-slate-50 p-2 sm:p-3 rounded-lg">{practitioner.bio}</p>
                </div>
              )}

              {/* Specialties */}
              {practitioner?.specialties && practitioner.specialties.length > 0 && (
                <div className="pt-3 sm:pt-4 border-t border-slate-200">
                  <h3 className="text-xs sm:text-sm font-medium text-slate-700 mb-1.5 flex items-center gap-1.5">
                    <StarIcon className="h-3.5 w-3.5 text-emerald-500" />
                    Specialties
                  </h3>
                  <div className="flex flex-wrap gap-1.5">
                    {practitioner.specialties.map(specialty => (
                      <span key={specialty.id} className="px-2 py-0.5 sm:px-2.5 sm:py-1 bg-emerald-100 text-emerald-800 rounded-full text-[10px] sm:text-xs">
                        {specialty.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Stats */}
              <div className="mt-4 sm:mt-5 pt-3 sm:pt-4 border-t border-slate-200">
                <h3 className="text-sm sm:text-base font-semibold mb-2 sm:mb-3 text-slate-900">Practice Stats</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
                  <StatCard label="Total" value={stats.totalConsultations} icon={CalendarIcon} color="emerald" />
                  <StatCard label="Completed" value={stats.completedConsultations} icon={CheckCircleIcon} color="blue" />
                  <StatCard label="Upcoming" value={stats.upcomingConsultations} icon={ClockIcon} color="amber" />
                  <StatCard label="Rating" value={stats.averageRating.toFixed(1)} icon={StarIcon} color="purple" trend={`${stats.totalReviews} reviews`} />
                </div>
              </div>
            </div>
          )}
        </CardBody>
      </Card>

      {/* Mobile Edit Menu */}
      <MobileEditMenu isOpen={mobileEditOpen} onClose={() => setMobileEditOpen(false)}>
        <DesktopEditForm />
      </MobileEditMenu>

      {/* Mobile Scroll Hint */}
      <div className="flex justify-center mt-2 sm:hidden">
        <div className="bg-slate-100 px-2 py-1 rounded-full text-[8px] text-slate-500 flex items-center gap-1">
          <span className="inline-block w-1 h-1 rounded-full bg-slate-400"></span>
          Scroll for more
          <span className="inline-block w-1 h-1 rounded-full bg-slate-400"></span>
        </div>
      </div>
    </div>
  )
}