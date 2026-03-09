// app/practitioner/dashboard/profile/page.tsx
'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/app/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { 
  ArrowLeftIcon,
  PencilIcon,
  ArrowPathIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  UserCircleIcon,
  SparklesIcon
} from '@heroicons/react/24/outline'
import { apiClient } from '@/app/lib/api'
import { PractitionerProfile } from '@/app/components/practitioners/PractitionerProfile'
import { ApplicationStatus } from '@/app/components/practitioners/ApplicationStatus'
import { Button } from '@/app/components/ui/Buttons'
import { Card, CardBody } from '@/app/components/ui/Card'
import type { Practitioner, UserProfile } from '@/app/types'

export default function PractitionerProfilePage() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth()
  const router = useRouter()
  
  const [practitioner, setPractitioner] = useState<Practitioner | null>(null)
  const [applicationStatus, setApplicationStatus] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Fetch practitioner profile
      const practitionerData = await apiClient.practitioners.getMyProfile()
      
      // MERGE user data from auth context into practitioner data
      // This ensures names are always available
      const enrichedPractitioner = {
        ...practitionerData,
        // Use practitioner data first, fallback to user data from auth
        first_name: practitionerData.first_name || user?.first_name || '',
        last_name: practitionerData.last_name || user?.last_name || '',
        email: practitionerData.email || user?.email || '',
      }
      
      console.log('Enriched practitioner data:', enrichedPractitioner)
      setPractitioner(enrichedPractitioner)
      
      // Fetch application status if not verified
      if (!practitionerData.is_verified) {
        try {
          const statusData = await apiClient.practitioners.applications.getStatus()
          if (statusData.hasApplication && statusData.application) {
            setApplicationStatus(statusData.application)
          }
        } catch (err) {
          console.error('Failed to fetch application status:', err)
        }
      }
      
    } catch (err: any) {
      console.error('Failed to fetch profile:', err)
      setError(err.response?.data?.message || 'Unable to load profile')
    } finally {
      setLoading(false)
    }
  }, [user]) // Add user as dependency

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login')
      return
    }

    if (!authLoading && user?.role !== 'practitioner') {
      router.push('/client/dashboard')
      return
    }

    if (isAuthenticated && user) {
      fetchData()
    }
  }, [isAuthenticated, user, authLoading, router, fetchData, refreshKey])

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1)
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50/30 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin mx-auto" />
            <UserCircleIcon className="w-6 h-6 text-emerald-600 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
          </div>
          <p className="mt-4 text-sm text-slate-500 animate-pulse">Loading your profile...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50/30 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <Card className="border-red-200">
            <CardBody className="p-8 text-center">
              <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <ExclamationTriangleIcon className="w-8 h-8 text-red-500" />
              </div>
              <h2 className="text-xl font-semibold text-slate-800 mb-2">Unable to Load Profile</h2>
              <p className="text-slate-500 mb-6">{error}</p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button onClick={handleRefresh} className="bg-emerald-600 hover:bg-emerald-700 text-white">
                  <ArrowPathIcon className="w-4 h-4 mr-2" />
                  Try Again
                </Button>
                <Link href="/practitioner/dashboard">
                  <Button variant="outline" className="border-slate-200">
                    Back to Dashboard
                  </Button>
                </Link>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    )
  }

  if (!practitioner) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50/30 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <Card className="border-amber-200">
            <CardBody className="p-8 text-center">
              <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <UserCircleIcon className="w-8 h-8 text-amber-500" />
              </div>
              <h2 className="text-xl font-semibold text-slate-800 mb-2">No Profile Found</h2>
              <p className="text-slate-500 mb-6">
                You haven't completed your practitioner profile yet.
              </p>
              <Link href="/practitioner/application">
                <Button className="bg-emerald-600 hover:bg-emerald-700 text-white">
                  Complete Your Profile
                </Button>
              </Link>
            </CardBody>
          </Card>
        </div>
      </div>
    )
  }

  // Determine application status
  let applicationStatusType: 'draft' | 'pending' | 'approved' | 'rejected' | 'info_needed' = 'pending'
  
  if (applicationStatus) {
    applicationStatusType = applicationStatus.status
  } else if (!practitioner.is_verified) {
    applicationStatusType = 'pending'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50/30 py-6 sm:py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        {/* Header with Navigation */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div className="flex items-center gap-4">
            <Link
              href="/practitioner/dashboard"
              className="p-2 hover:bg-white rounded-lg transition-colors"
            >
              <ArrowLeftIcon className="h-5 w-5 text-slate-600" />
            </Link>
            <div>
              <div className="flex items-center gap-2 text-emerald-600 mb-1">
                <SparklesIcon className="h-4 w-4" />
                <span className="text-xs font-medium uppercase tracking-wider">Professional</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-light text-slate-800">
                My <span className="font-semibold text-emerald-600">Profile</span>
              </h1>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              className="flex items-center gap-2 border-slate-200 hover:border-emerald-300 hover:bg-emerald-50"
            >
              <ArrowPathIcon className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Refresh</span>
            </Button>
            
            <Link href="/practitioner/dashboard/profile/edit">
              <Button className="bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-2">
                <PencilIcon className="w-4 h-4" />
                <span>Edit Profile</span>
              </Button>
            </Link>
          </div>
        </div>

        {/* Profile Views Counter */}
        <div className="mb-6 flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full border border-slate-200">
            <UserCircleIcon className="w-5 h-5 text-emerald-600" />
            <span className="text-slate-600">Profile views:</span>
            <span className="font-semibold text-emerald-600">0</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            <span className="text-xs text-slate-500">
              {practitioner.is_verified ? 'Public profile is live' : 'Profile pending verification'}
            </span>
          </div>
        </div>

        {/* Application Status Component */}
        {!practitioner.is_verified && applicationStatus && (
          <ApplicationStatus
            status={applicationStatusType}
            professionalTitle={applicationStatus?.professional_title}
            submittedAt={applicationStatus?.submitted_at}
            canEdit={applicationStatusType === 'draft' || applicationStatusType === 'info_needed'}
            rejectionReason={applicationStatus?.rejection_reason}
          />
        )}

        {/* Simple status if no application details but not verified */}
        {!practitioner.is_verified && !applicationStatus && (
          <div className="mb-6 bg-amber-50 border border-amber-200 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-amber-100 rounded-lg">
                <ExclamationTriangleIcon className="w-5 h-5 text-amber-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-medium text-amber-800">Profile Not Verified</h3>
                <p className="text-xs text-amber-700 mt-1">
                  Your profile is pending verification. This usually takes 1-2 business days.
                </p>
              </div>
              <Link href="/practitioner/application/status">
                <Button variant="outline" size="sm" className="border-amber-300 text-amber-700 hover:bg-amber-100">
                  Check Status
                </Button>
              </Link>
            </div>
          </div>
        )}

        {/* Verified Status */}
        {practitioner.is_verified && (
          <div className="mb-6 bg-emerald-50 border border-emerald-200 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-emerald-100 rounded-lg">
                <CheckCircleIcon className="w-5 h-5 text-emerald-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-medium text-emerald-800">Profile Verified</h3>
                <p className="text-xs text-emerald-700 mt-1">
                  Your profile is verified and visible to patients.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Main Profile Component - with enriched data */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <PractitionerProfile 
            practitioner={practitioner}
          />
        </motion.div>

        {/* Quick Actions */}
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Link href="/practitioner/dashboard/availability">
            <Card className="border-slate-200 hover:border-emerald-200 hover:shadow-md transition-all cursor-pointer group">
              <CardBody className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-emerald-100 rounded-lg group-hover:bg-emerald-200 transition-colors">
                    <SparklesIcon className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div>
                    <p className="font-medium text-slate-800">Set Availability</p>
                    <p className="text-xs text-slate-500">Manage your schedule</p>
                  </div>
                </div>
              </CardBody>
            </Card>
          </Link>

          <Link href="/practitioner/dashboard/reviews">
            <Card className="border-slate-200 hover:border-emerald-200 hover:shadow-md transition-all cursor-pointer group">
              <CardBody className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-emerald-100 rounded-lg group-hover:bg-emerald-200 transition-colors">
                    <SparklesIcon className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div>
                    <p className="font-medium text-slate-800">View Reviews</p>
                    <p className="text-xs text-slate-500">See patient feedback</p>
                  </div>
                </div>
              </CardBody>
            </Card>
          </Link>

          <Link href="/practitioner/dashboard/consultations">
            <Card className="border-slate-200 hover:border-emerald-200 hover:shadow-md transition-all cursor-pointer group">
              <CardBody className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-emerald-100 rounded-lg group-hover:bg-emerald-200 transition-colors">
                    <SparklesIcon className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div>
                    <p className="font-medium text-slate-800">Consultations</p>
                    <p className="text-xs text-slate-500">Manage appointments</p>
                  </div>
                </div>
              </CardBody>
            </Card>
          </Link>
        </div>
      </div>
    </div>
  )
}