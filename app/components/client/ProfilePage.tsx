// app/components/client/dashboard/profile/ProfilePage.tsx
'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
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
  ArrowRightIcon,
  XCircleIcon
} from '@heroicons/react/24/outline'
import { Card, CardBody } from '@/app/components/ui/Card'
import { Button } from '@/app/components/ui/Buttons'
import { apiClient } from '@/app/lib/api'
import { extractResults } from '@/app/lib/utils'
import type { UserProfile, ClientMetrics, Consultation } from '@/app/types'

export default function ProfilePage() {
  // =============================================
  // 1. ALL HOOKS FIRST - UNCONDITIONALLY
  // =============================================
  const { user, isAuthenticated, isLoading: authLoading } = useAuth()
  const router = useRouter()
  const [isMounted, setIsMounted] = useState(false)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [metrics, setMetrics] = useState<ClientMetrics | null>(null)
  const [recentActivity, setRecentActivity] = useState<Consultation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Memoized fetch function
  const fetchProfileData = useCallback(async () => {
    if (!isAuthenticated || !user || !isMounted) return
    
    try {
      setLoading(true)
      setError(null)
      
      const [profileData, consultationsData] = await Promise.all([
        apiClient.profiles.getMyProfile(),
        apiClient.consultations.getMyClientConsultations().catch(() => ({ results: [] }))
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
  }, [isAuthenticated, user, isMounted])

  // Mount effect
  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Data fetching effect
  useEffect(() => {
    if (isMounted && isAuthenticated && user) {
      fetchProfileData()
    }
  }, [isMounted, isAuthenticated, user, fetchProfileData])

  // Redirect effect
  useEffect(() => {
    if (isMounted && !authLoading && !isAuthenticated) {
      router.push('/login')
    }
  }, [isMounted, authLoading, isAuthenticated, router])

  // =============================================
  // 2. EARLY RETURNS (after all hooks)
  // =============================================
  if (authLoading || !isMounted) {
    return <LoadingSkeleton />
  }

  if (!isAuthenticated || !user) {
    return null // Redirect happens in useEffect
  }

  if (loading) {
    return <LoadingSkeleton />
  }

  if (error) {
    return <ErrorState error={error} onRetry={fetchProfileData} />
  }

  // =============================================
  // 3. RENDER COMPONENT
  // =============================================
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Header Section */}
      <div className="bg-white border-b border-neutral-200 sticky top-0 z-10 backdrop-blur-sm bg-white/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 text-teal-600">
                <SparklesIcon className="h-5 w-5" />
                <span className="text-xs font-medium uppercase tracking-wider hidden sm:inline">Profile</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-light text-neutral-800">
                My <span className="font-semibold text-teal-600">Profile</span>
              </h1>
            </div>
            <Link href="/client/dashboard/profile/edit">
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
            <ProfileCard 
              user={user} 
              profile={profile} 
            />

            {/* Recent Activity Card */}
            <RecentActivityCard activities={recentActivity} />
          </div>

          {/* Right Column - Stats & Quick Actions */}
          <div className="space-y-6">
            {/* Stats Card */}
            {metrics && <StatsCard metrics={metrics} />}

            {/* Quick Actions Card */}
            <QuickActionsCard pendingReviews={metrics?.pending_reviews || 0} />
          </div>
        </div>
      </div>
    </div>
  )
}

// =============================================
// HELPER COMPONENTS
// =============================================

function ProfileCard({ user, profile }: { 
  user: any; 
  profile: UserProfile | null;
}) {
  // Format join date safely
  const joinDate = useMemo(() => {
    // If user has a created_at property, use it, otherwise use current year
    if (user?.created_at) {
      try {
        return new Date(user.created_at).toLocaleDateString('en-US', { 
          month: 'long', 
          year: 'numeric' 
        })
      } catch {
        return '2024'
      }
    }
    return '2024'
  }, [user])

  return (
    <Card className="border-neutral-200 overflow-hidden">
      <CardBody className="p-0">
        {/* Cover Photo */}
        <div className="h-24 sm:h-32 bg-gradient-to-r from-teal-500 to-teal-600"></div>
        
        {/* Profile Header */}
        <div className="px-4 sm:px-6 pb-6">
          <div className="flex flex-col sm:flex-row sm:items-end gap-4 -mt-12 sm:-mt-16 mb-4">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full border-4 border-white bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center text-white text-2xl sm:text-3xl font-bold shadow-lg mx-auto sm:mx-0">
              {user?.first_name?.[0]}{user?.last_name?.[0]}
            </div>
            <div className="text-center sm:text-left sm:pb-2 flex-1">
              <h2 className="text-xl sm:text-2xl font-bold text-neutral-900">
                {user?.first_name} {user?.last_name}
              </h2>
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mt-2">
                <span className="text-sm text-neutral-500">Client</span>
                <span className="w-1 h-1 bg-neutral-300 rounded-full"></span>
                <span className="text-sm text-teal-600 flex items-center">
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
            <InfoItem icon={CalendarIcon} label="Member Since" value={joinDate} />
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
  )
}

function RecentActivityCard({ activities }: { activities: Consultation[] }) {
  const getStatusColor = (status: string) => {
    switch(status) {
      case 'booked': return 'bg-blue-100 text-blue-700'
      case 'completed': return 'bg-emerald-100 text-emerald-700'
      case 'cancelled': return 'bg-rose-100 text-rose-700'
      default: return 'bg-neutral-100 text-neutral-700'
    }
  }

  return (
    <Card className="border-neutral-200">
      <div className="border-b border-neutral-200 px-4 sm:px-6 py-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold text-neutral-900">Recent Activity</h3>
          <Link href="/client/dashboard/consultations" className="text-sm text-teal-600 hover:text-teal-700 flex items-center gap-1">
            View All <ArrowRightIcon className="h-4 w-4" />
          </Link>
        </div>
      </div>
      <CardBody className="p-4 sm:p-6">
        {activities.length > 0 ? (
          <div className="space-y-3">
            {activities.map((activity) => (
              <Link key={activity.id} href={`/client/dashboard/consultations/${activity.id}`}>
                <div className="flex items-center justify-between p-3 bg-neutral-50 rounded-xl hover:bg-neutral-100 transition-colors cursor-pointer group">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="p-2 bg-white rounded-lg flex-shrink-0 group-hover:bg-teal-50 transition-colors">
                      <ClockIcon className="h-4 w-4 text-teal-600" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-neutral-900 truncate">
                        Dr. {activity.practitioner_name || 'Consultation'}
                      </p>
                      <p className="text-xs text-neutral-500 mt-0.5">
                        {new Date(activity.date).toLocaleDateString('en-US', { 
                          month: 'short', 
                          day: 'numeric' 
                        })} at {activity.time?.slice(0,5)}
                      </p>
                    </div>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium flex-shrink-0 ${getStatusColor(activity.status)}`}>
                    {activity.status}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-sm text-neutral-500 text-center py-4">No recent activity</p>
        )}
      </CardBody>
    </Card>
  )
}

function StatsCard({ metrics }: { metrics: ClientMetrics }) {
  return (
    <Card className="border-neutral-200 sticky top-24">
      <div className="border-b border-neutral-200 px-4 sm:px-6 py-4">
        <h3 className="text-base font-semibold text-neutral-900">Activity Summary</h3>
      </div>
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
  )
}

function QuickActionsCard({ pendingReviews }: { pendingReviews: number }) {
  return (
    <Card className="border-neutral-200">
      <div className="border-b border-neutral-200 px-4 sm:px-6 py-4">
        <h3 className="text-base font-semibold text-neutral-900">Quick Actions</h3>
      </div>
      <CardBody className="p-4 sm:p-6">
        <div className="grid grid-cols-1 gap-2">
          <Link href="/client/dashboard/practitioners">
            <Button variant="outline" fullWidth className="justify-start text-neutral-700 hover:bg-teal-50 hover:border-teal-200">
              <UserIcon className="h-5 w-5 mr-3 text-teal-600" />
              Find Practitioners
            </Button>
          </Link>
          <Link href="/client/dashboard/consultations">
            <Button variant="outline" fullWidth className="justify-start text-neutral-700 hover:bg-teal-50 hover:border-teal-200">
              <CalendarIcon className="h-5 w-5 mr-3 text-teal-600" />
              View Consultations
            </Button>
          </Link>
          {pendingReviews > 0 && (
            <Link href="/client/dashboard/reviews/create">
              <Button variant="outline" fullWidth className="justify-start text-neutral-700 hover:bg-teal-50 hover:border-teal-200 relative">
                <StarIcon className="h-5 w-5 mr-3 text-teal-600" />
                Write Reviews
                <span className="ml-auto bg-amber-100 text-amber-700 text-xs px-2 py-0.5 rounded-full">
                  {pendingReviews}
                </span>
              </Button>
            </Link>
          )}
        </div>
      </CardBody>
    </Card>
  )
}

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

function StatRow({ label, value, highlight = false }: { label: string; value: string | number; highlight?: boolean }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-neutral-600">{label}</span>
      <span className={`font-semibold ${highlight ? 'text-teal-600 text-base' : 'text-neutral-900'}`}>
        {value}
      </span>
    </div>
  )
}

function LoadingSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white py-6 sm:py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Skeleton */}
        <div className="mb-8 animate-pulse">
          <div className="h-4 w-24 bg-slate-200 rounded mb-2"></div>
          <div className="h-8 w-48 bg-slate-200 rounded"></div>
        </div>

        {/* Content Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card className="border-neutral-200">
              <CardBody className="p-6">
                <div className="h-24 bg-slate-200 rounded mb-4"></div>
                <div className="flex gap-4 mb-4">
                  <div className="w-20 h-20 bg-slate-200 rounded-full"></div>
                  <div className="flex-1">
                    <div className="h-6 w-32 bg-slate-200 rounded mb-2"></div>
                    <div className="h-4 w-24 bg-slate-200 rounded"></div>
                  </div>
                </div>
              </CardBody>
            </Card>
          </div>
          <div className="space-y-6">
            <Card className="border-neutral-200">
              <CardBody className="p-6">
                <div className="h-32 bg-slate-200 rounded"></div>
              </CardBody>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

function ErrorState({ error, onRetry }: { error: string; onRetry: () => void }) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex items-center justify-center p-4">
      <Card className="max-w-md w-full border-neutral-200">
        <CardBody className="p-8 text-center">
          <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <XCircleIcon className="h-8 w-8 text-red-500" />
          </div>
          <h2 className="text-xl font-semibold text-slate-800 mb-2">Unable to Load Profile</h2>
          <p className="text-slate-500 mb-6">{error}</p>
          <Button onClick={onRetry} className="bg-teal-600 hover:bg-teal-700 text-white">
            Try Again
          </Button>
        </CardBody>
      </Card>
    </div>
  )
}