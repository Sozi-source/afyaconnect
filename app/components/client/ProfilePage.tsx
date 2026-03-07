// app/components/client/dashboard/profile/ProfilePage.tsx
'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/app/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  BriefcaseIcon,
  PencilIcon,
  CheckCircleIcon,
  SparklesIcon,
  CalendarIcon,
  ClockIcon,
  StarIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline'
import { Card, CardBody } from '@/app/components/ui/Card'
import { Button } from '@/app/components/ui/Buttons'
import { apiClient } from '@/app/lib/api'
import { extractResults } from '@/app/lib/utils'
import type { UserProfile, ClientMetrics, Consultation } from '@/app/types'

export default function ProfilePage() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth()
  const router = useRouter()
  const [isMounted, setIsMounted] = useState(false)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [metrics, setMetrics] = useState<ClientMetrics | null>(null)
  const [recentActivity, setRecentActivity] = useState<Consultation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  if (authLoading || !isMounted) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-200 border-t-primary-600"></div>
      </div>
    )
  }

  if (!isAuthenticated || !user) {
    router.push('/login')
    return null
  }

  useEffect(() => {
    fetchProfileData()
  }, [])

  const fetchProfileData = async () => {
    try {
      setLoading(true)
      
      const [profileData, consultationsData] = await Promise.all([
        apiClient.profiles.getMyProfile(),
        apiClient.consultations.getMyClientConsultations().catch(() => [])
      ])
      
      setProfile(profileData)
      
      const consultations = extractResults<Consultation>(consultationsData)
      setRecentActivity(consultations.slice(0, 3))
      
      const completed = consultations.filter((c: Consultation) => c.status === 'completed')
      const upcoming = consultations.filter((c: Consultation) => c.status === 'booked')
      const cancelled = consultations.filter((c: Consultation) => c.status === 'cancelled')
      
      const totalSpent = completed.reduce((sum: number, c: Consultation) => sum + (c.price || 500), 0)
      const pendingReviews = completed.filter((c: Consultation) => !c.has_review).length

      setMetrics({
        total_consultations: consultations.length,
        completed_consultations: completed.length,
        upcoming_consultations: upcoming.length,
        cancelled_consultations: cancelled.length,
        total_spent: totalSpent,
        pending_reviews: pendingReviews
      })
      
    } catch (error) {
      console.error('Failed to fetch profile:', error)
      setError('Failed to load profile')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-200 border-t-primary-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] p-4">
        <Card className="max-w-md w-full border-neutral-200">
          <CardBody className="p-6 sm:p-8 text-center">
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <UserIcon className="h-8 w-8 text-red-500" />
            </div>
            <h3 className="text-lg font-semibold text-neutral-900 mb-2">Error Loading Profile</h3>
            <p className="text-neutral-500 mb-6 text-sm">{error}</p>
            <Button onClick={fetchProfileData} className="bg-primary-600 hover:bg-primary-700 text-white w-full sm:w-auto">
              Try Again
            </Button>
          </CardBody>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Header Section */}
      <div className="bg-white border-b border-neutral-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 text-primary-600">
                <SparklesIcon className="h-5 w-5" />
                <span className="text-xs font-medium uppercase tracking-wider hidden sm:inline">Profile</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-light text-neutral-800">
                My <span className="font-semibold text-primary-600">Profile</span>
              </h1>
            </div>
            <Link href="/client/dashboard/profile/edit" className="w-full sm:w-auto">
              <Button variant="outline" className="w-full sm:w-auto border-neutral-200 text-neutral-600 hover:bg-neutral-50">
                <PencilIcon className="h-4 w-4 mr-2" />
                <span className="sm:inline">Edit Profile</span>
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Profile Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Profile Card */}
            <Card className="border-neutral-200 overflow-hidden">
              <CardBody className="p-0">
                {/* Cover Photo Placeholder */}
                <div className="h-24 sm:h-32 bg-gradient-to-r from-primary-500 to-primary-600"></div>
                
                {/* Profile Header */}
                <div className="px-4 sm:px-6 pb-6">
                  <div className="flex flex-col sm:flex-row sm:items-end gap-4 -mt-12 sm:-mt-16 mb-4">
                    <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full border-4 border-white bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center text-white text-2xl sm:text-3xl font-bold shadow-lg mx-auto sm:mx-0">
                      {user?.first_name?.[0]}{user?.last_name?.[0]}
                    </div>
                    <div className="text-center sm:text-left sm:pb-2 flex-1">
                      <h2 className="text-xl sm:text-2xl font-bold text-neutral-900">
                        {user?.first_name} {user?.last_name}
                      </h2>
                      <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mt-2">
                        <span className="text-sm text-neutral-500">Client</span>
                        <span className="w-1 h-1 bg-neutral-300 rounded-full"></span>
                        <span className="text-sm text-primary-600 flex items-center">
                          <CheckCircleIcon className="h-4 w-4 mr-1" />
                          Active Account
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Info Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <InfoItem icon={EnvelopeIcon} label="Email" value={user?.email || ''} />
                    <InfoItem icon={PhoneIcon} label="Phone" value={profile?.phone || 'Not provided'} />
                    <InfoItem icon={MapPinIcon} label="City" value={profile?.city || 'Not provided'} />
                    <InfoItem icon={CalendarIcon} label="Member Since" value="2024" />
                  </div>

                  {/* Bio */}
                  {profile?.bio && (
                    <div className="mt-4 p-4 bg-neutral-50 rounded-xl">
                      <p className="text-sm text-neutral-600 italic leading-relaxed">"{profile.bio}"</p>
                    </div>
                  )}
                </div>
              </CardBody>
            </Card>

            {/* Recent Activity Card */}
            <Card className="border-neutral-200">
              <CardHeader className="border-b border-neutral-200 px-4 sm:px-6 py-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-semibold text-neutral-900">Recent Activity</h3>
                  <Link href="/client/dashboard/consultations" className="text-sm text-primary-600 hover:text-primary-700 flex items-center gap-1">
                    View All <ArrowRightIcon className="h-4 w-4" />
                  </Link>
                </div>
              </CardHeader>
              <CardBody className="p-4 sm:p-6">
                {recentActivity.length > 0 ? (
                  <div className="space-y-3">
                    {recentActivity.map((activity) => (
                      <ActivityItem key={activity.id} consultation={activity} />
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-neutral-500 text-center py-4">No recent activity</p>
                )}
              </CardBody>
            </Card>
          </div>

          {/* Right Column - Stats & Quick Actions */}
          <div className="space-y-6">
            {/* Stats Card */}
            {metrics && (
              <Card className="border-neutral-200 sticky top-24">
                <CardHeader className="border-b border-neutral-200 px-4 sm:px-6 py-4">
                  <h3 className="text-base font-semibold text-neutral-900">Activity Summary</h3>
                </CardHeader>
                <CardBody className="p-4 sm:p-6">
                  <div className="space-y-4">
                    <StatRow label="Total Consultations" value={metrics.total_consultations} />
                    <StatRow label="Completed" value={metrics.completed_consultations} />
                    <StatRow label="Upcoming" value={metrics.upcoming_consultations} />
                    <StatRow label="Pending Reviews" value={metrics.pending_reviews} />
                    
                    <div className="pt-4 border-t border-neutral-200">
                      <StatRow 
                        label="Total Spent" 
                        value={`KES ${metrics.total_spent?.toLocaleString() || 0}`} 
                        highlight 
                      />
                    </div>
                  </div>
                </CardBody>
              </Card>
            )}

            {/* Quick Actions Card */}
            <Card className="border-neutral-200">
              <CardHeader className="border-b border-neutral-200 px-4 sm:px-6 py-4">
                <h3 className="text-base font-semibold text-neutral-900">Quick Actions</h3>
              </CardHeader>
              <CardBody className="p-4 sm:p-6">
                <div className="grid grid-cols-1 gap-2">
                  <Link href="/client/dashboard/practitioners">
                    <Button variant="outline" fullWidth className="justify-start text-neutral-700 hover:bg-primary-50 hover:border-primary-200">
                      <UserIcon className="h-5 w-5 mr-3 text-primary-600" />
                      Find Practitioners
                    </Button>
                  </Link>
                  <Link href="/client/dashboard/consultations">
                    <Button variant="outline" fullWidth className="justify-start text-neutral-700 hover:bg-primary-50 hover:border-primary-200">
                      <CalendarIcon className="h-5 w-5 mr-3 text-primary-600" />
                      View Consultations
                    </Button>
                  </Link>
                  {metrics?.pending_reviews && metrics.pending_reviews > 0 && (
                    <Link href="/client/dashboard/reviews/create">
                      <Button variant="outline" fullWidth className="justify-start text-neutral-700 hover:bg-primary-50 hover:border-primary-200">
                        <StarIcon className="h-5 w-5 mr-3 text-primary-600" />
                        Write Reviews ({metrics.pending_reviews})
                      </Button>
                    </Link>
                  )}
                </div>
              </CardBody>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

// Card Header Component
function CardHeader({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={className}>{children}</div>
}

// Info Item Component (Responsive)
function InfoItem({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3 p-3 bg-neutral-50 rounded-xl hover:bg-neutral-100 transition-colors">
      <Icon className="h-5 w-5 text-neutral-400 mt-0.5 flex-shrink-0" />
      <div className="min-w-0 flex-1">
        <p className="text-xs text-neutral-500 mb-0.5">{label}</p>
        <p className="text-sm font-medium text-neutral-900 break-words truncate">{value}</p>
      </div>
    </div>
  )
}

// Activity Item Component
function ActivityItem({ consultation }: { consultation: Consultation }) {
  const getStatusColor = (status: string) => {
    switch(status) {
      case 'booked': return 'bg-blue-100 text-blue-700'
      case 'completed': return 'bg-green-100 text-green-700'
      case 'cancelled': return 'bg-red-100 text-red-700'
      default: return 'bg-neutral-100 text-neutral-700'
    }
  }

  return (
    <Link href={`/client/dashboard/consultations/${consultation.id}`}>
      <div className="flex items-center justify-between p-3 bg-neutral-50 rounded-xl hover:bg-neutral-100 transition-colors cursor-pointer">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div className="p-2 bg-white rounded-lg flex-shrink-0">
            <ClockIcon className="h-4 w-4 text-primary-600" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-neutral-900 truncate">
              Dr. {consultation.practitioner_name || 'Consultation'}
            </p>
            <p className="text-xs text-neutral-500 mt-0.5">
              {new Date(consultation.date).toLocaleDateString('en-US', { 
                month: 'short', 
                day: 'numeric' 
              })} at {consultation.time?.slice(0,5)}
            </p>
          </div>
        </div>
        <span className={`px-2 py-1 rounded-full text-xs font-medium flex-shrink-0 ${getStatusColor(consultation.status)}`}>
          {consultation.status}
        </span>
      </div>
    </Link>
  )
}

// Stat Row Component
function StatRow({ label, value, highlight = false }: { label: string; value: string | number; highlight?: boolean }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-neutral-600">{label}</span>
      <span className={`font-semibold ${highlight ? 'text-primary-600 text-base' : 'text-neutral-900'}`}>
        {value}
      </span>
    </div>
  )
}

// Keep the StatBadge for backward compatibility
function StatBadge({ label, value, color }: { label: string; value: number; color: string }) {
  const colors: Record<string, string> = {
    primary: 'bg-primary-50 text-primary-700',
    blue: 'bg-blue-50 text-blue-700',
    green: 'bg-green-50 text-green-700',
    amber: 'bg-amber-50 text-amber-700',
  }
  return (
    <div className={`p-4 rounded-xl text-center ${colors[color]}`}>
      <p className="text-xl font-semibold">{value}</p>
      <p className="text-xs mt-1">{label}</p>
    </div>
  )
}
