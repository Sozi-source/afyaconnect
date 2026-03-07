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
  SparklesIcon
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
          <CardBody className="p-8 text-center">
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <UserIcon className="h-8 w-8 text-red-500" />
            </div>
            <p className="text-neutral-500 mb-6">{error}</p>
            <Button onClick={fetchProfileData} className="bg-primary-600 hover:bg-primary-700 text-white">
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
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 text-primary-600 mb-1">
              <SparklesIcon className="h-4 w-4" />
              <span className="text-xs font-medium uppercase tracking-wider">Profile</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-light text-neutral-800">
              My <span className="font-semibold text-primary-600">Profile</span>
            </h1>
          </div>
          <Link href="/client/dashboard/profile/edit">
            <Button variant="outline" className="border-neutral-200 text-neutral-600 hover:bg-neutral-50">
              <PencilIcon className="h-4 w-4 mr-2" />
              Edit Profile
            </Button>
          </Link>
        </div>

        <Card className="border-neutral-200">
          <CardBody className="p-6 sm:p-8">
            <div className="space-y-8">
              <div className="flex flex-col sm:flex-row sm:items-center gap-6 pb-8 border-b border-neutral-200">
                <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center text-white text-2xl sm:text-3xl font-bold shadow-sm mx-auto sm:mx-0">
                  {user?.first_name?.[0]}{user?.last_name?.[0]}
                </div>
                <div className="text-center sm:text-left">
                  <h2 className="text-xl sm:text-2xl font-semibold text-neutral-800">
                    {user?.first_name} {user?.last_name}
                  </h2>
                  <div className="flex items-center justify-center sm:justify-start gap-2 mt-2">
                    <span className="text-sm text-neutral-500">Client</span>
                    <span className="w-1 h-1 bg-neutral-300 rounded-full"></span>
                    <span className="text-sm text-primary-600 flex items-center">
                      <CheckCircleIcon className="h-4 w-4 mr-1" />
                      Active
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <InfoItem icon={UserIcon} label="Full Name" value={`${user?.first_name || ''} ${user?.last_name || ''}`} />
                <InfoItem icon={EnvelopeIcon} label="Email" value={user?.email || ''} />
                <InfoItem icon={PhoneIcon} label="Phone" value={profile?.phone || 'Not provided'} />
                <InfoItem icon={MapPinIcon} label="City" value={profile?.city || 'Not provided'} />
              </div>

              {profile?.bio && (
                <div className="p-4 bg-neutral-50 rounded-xl">
                  <p className="text-sm text-neutral-600 italic">"{profile.bio}"</p>
                </div>
              )}

              {metrics && (
                <div className="pt-6 border-t border-neutral-200">
                  <h3 className="text-base font-semibold text-neutral-800 mb-4">Activity Summary</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <StatBadge label="Total" value={metrics.total_consultations} color="primary" />
                    <StatBadge label="Upcoming" value={metrics.upcoming_consultations} color="blue" />
                    <StatBadge label="Completed" value={metrics.completed_consultations} color="green" />
                    <StatBadge label="Reviews" value={metrics.pending_reviews} color="amber" />
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

function InfoItem({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3 p-4 bg-neutral-50 rounded-xl">
      <Icon className="h-5 w-5 text-neutral-400 mt-0.5 flex-shrink-0" />
      <div className="min-w-0 flex-1">
        <p className="text-xs text-neutral-500">{label}</p>
        <p className="text-sm font-medium text-neutral-800 break-words">{value}</p>
      </div>
    </div>
  )
}

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