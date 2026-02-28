// app/client/dashboard/profile/page.tsx
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
  CalendarIcon,
  StarIcon,
  SparklesIcon
} from '@heroicons/react/24/outline'
import { Card, CardBody } from '@/app/components/ui/Card'
import { Button } from '@/app/components/ui/Buttons'
import { apiClient } from '@/app/lib/api'
import { extractResults } from '@/app/lib/utils'
import type { UserProfile, ClientMetrics, Consultation } from '@/app/types'  // ✅ Added Consultation here

export default function ClientProfilePage() {
  const { user, isAuthenticated, refreshUserProfile } = useAuth()
  const router = useRouter()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [metrics, setMetrics] = useState<ClientMetrics | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login')
      return
    }
    fetchProfileData()
  }, [isAuthenticated, router])

  const fetchProfileData = async () => {
    try {
      setLoading(true)
      
      const [profileData, consultationsData] = await Promise.all([
        apiClient.profiles.getMyProfile(),
        apiClient.consultations.getMyClientConsultations().catch(() => [])
      ])
      
      setProfile(profileData)
      
      // Extract consultations array properly
      const consultations = extractResults<Consultation>(consultationsData)
      
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
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-teal-200 border-t-teal-600"></div>
          <p className="text-sm text-slate-500">Loading profile...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-4">
        <Card className="max-w-md w-full border-slate-200">
          <CardBody className="p-8 text-center">
            <div className="w-16 h-16 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <UserIcon className="h-8 w-8 text-rose-500" />
            </div>
            <p className="text-slate-500 mb-6">{error}</p>
            <Button onClick={fetchProfileData} className="bg-teal-600 hover:bg-teal-700 text-white">
              Try Again
            </Button>
          </CardBody>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white py-6 sm:py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 text-teal-600 mb-1">
              <SparklesIcon className="h-4 w-4" />
              <span className="text-xs font-medium uppercase tracking-wider">Profile</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-light text-slate-800">
              My <span className="font-semibold text-teal-600">Profile</span>
            </h1>
          </div>
          <Link href="/client/dashboard/profile/edit" className="w-full sm:w-auto">
            <Button
              variant="outline"
              className="w-full sm:w-auto border-slate-200 text-slate-600 hover:bg-slate-50 flex items-center justify-center gap-2"
            >
              <PencilIcon className="h-4 w-4" />
              Edit Profile
            </Button>
          </Link>
        </div>

        {/* Profile Card */}
        <Card className="border-slate-200/60 shadow-sm">
          <CardBody className="p-6 sm:p-8">
            <div className="space-y-8">
              {/* Profile Header */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-6 pb-8 border-b border-slate-200">
                <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-teal-500 to-teal-600 rounded-full flex items-center justify-center text-white text-2xl sm:text-3xl font-bold shadow-sm mx-auto sm:mx-0">
                  {user?.first_name?.[0]}{user?.last_name?.[0]}
                </div>
                <div className="text-center sm:text-left">
                  <h2 className="text-xl sm:text-2xl font-semibold text-slate-800">
                    {user?.first_name} {user?.last_name}
                  </h2>
                  <div className="flex items-center justify-center sm:justify-start gap-2 mt-2">
                    <span className="text-sm text-slate-500">Client</span>
                    <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                    <span className="text-sm text-teal-600 flex items-center">
                      <CheckCircleIcon className="h-4 w-4 mr-1" />
                      Active
                    </span>
                  </div>
                </div>
              </div>

              {/* Profile Info Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <InfoItem
                  icon={UserIcon}
                  label="Full Name"
                  value={`${user?.first_name || ''} ${user?.last_name || ''}`}
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
                  label="City"
                  value={profile?.city || 'Not provided'}
                />
              </div>

              {/* Stats Summary */}
              {metrics && (
                <div className="mt-6 pt-6 border-t border-slate-200">
                  <h3 className="text-base font-semibold text-slate-800 mb-4">
                    Activity Summary
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <StatBadge 
                      label="Total" 
                      value={metrics.total_consultations} 
                      color="teal"
                    />
                    <StatBadge 
                      label="Upcoming" 
                      value={metrics.upcoming_consultations} 
                      color="blue"
                    />
                    <StatBadge 
                      label="Completed" 
                      value={metrics.completed_consultations} 
                      color="green"
                    />
                    <StatBadge 
                      label="Reviews" 
                      value={metrics.pending_reviews} 
                      color="amber"
                    />
                  </div>
                </div>
              )}
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  )
}

// Info Item Component
function InfoItem({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3 p-4 bg-slate-50 rounded-xl">
      <Icon className="h-5 w-5 text-slate-400 mt-0.5 flex-shrink-0" />
      <div className="min-w-0 flex-1">
        <p className="text-xs text-slate-500">{label}</p>
        <p className="text-sm font-medium text-slate-800 break-words">{value}</p>
      </div>
    </div>
  )
}

// Stat Badge Component
function StatBadge({ label, value, color }: { label: string; value: number; color: string }) {
  const colors = {
    teal: 'bg-teal-50 text-teal-700',
    blue: 'bg-blue-50 text-blue-700',
    green: 'bg-green-50 text-green-700',
    amber: 'bg-amber-50 text-amber-700',
  }

  return (
    <div className={`p-4 rounded-xl text-center ${colors[color as keyof typeof colors]}`}>
      <p className="text-xl font-semibold">{value}</p>
      <p className="text-xs mt-1">{label}</p>
    </div>
  )
}