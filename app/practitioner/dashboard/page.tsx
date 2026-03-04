'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/app/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import {
  CalendarIcon,
  ClockIcon,
  CurrencyDollarIcon,
  UserGroupIcon,
  ChartBarIcon,
  CheckCircleIcon,
  ArrowRightIcon,
  BellIcon,
  StarIcon,
  SparklesIcon,
  BriefcaseIcon,
  DocumentTextIcon,
  ShieldCheckIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  PencilSquareIcon,
  EyeIcon,
  AcademicCapIcon,
  UserCircleIcon,
  ClipboardDocumentListIcon,
} from '@heroicons/react/24/outline'
import { Card, CardBody, CardHeader } from '@/app/components/ui/Card'
import { Button } from '@/app/components/ui/Buttons'
import { apiClient } from '@/app/lib/api'
import { extractResults } from '@/app/lib/utils'
import type { 
  Consultation, 
  PractitionerMetrics, 
  PractitionerApplication, 
  ApplicationStatus,
  ApplicationStatusResponse 
} from '@/app/types'
import { RefreshCwIcon } from 'lucide-react'

interface ExtendedUser {
  id: number
  email: string
  first_name?: string
  last_name?: string
  role?: string
  is_verified?: boolean
}

// Application Status Card Component
const ApplicationStatusCard = ({ status, application, onRefresh }: { 
  status: ApplicationStatus; 
  application?: PractitionerApplication | null;
  onRefresh?: () => void;
}) => {
  const statusConfig = {
    draft: {
      icon: PencilSquareIcon,
      title: 'Complete Your Application',
      message: 'Finish your application to get verified',
      action: 'Continue Application',
      color: 'slate',
      bg: 'bg-slate-50',
      border: 'border-slate-200',
      text: 'text-slate-700',
      button: 'bg-slate-600 hover:bg-slate-700',
      iconBg: 'bg-slate-100'
    },
    pending: {
      icon: ClockIcon,
      title: 'Application Under Review',
      message: "We're reviewing your information",
      action: 'View Application',
      color: 'amber',
      bg: 'bg-amber-50',
      border: 'border-amber-200',
      text: 'text-amber-700',
      button: 'bg-amber-600 hover:bg-amber-700',
      iconBg: 'bg-amber-100'
    },
    approved: {
      icon: CheckCircleIcon,
      title: 'Application Approved',
      message: 'Your application has been approved',
      action: 'Go to Applications',
      color: 'emerald',
      bg: 'bg-emerald-50',
      border: 'border-emerald-200',
      text: 'text-emerald-700',
      button: 'bg-emerald-600 hover:bg-emerald-700',
      iconBg: 'bg-emerald-100'
    },
    rejected: {
      icon: XCircleIcon,
      title: 'Application Not Approved',
      message: application?.rejection_reason || 'Please review and reapply',
      action: 'View Feedback',
      color: 'rose',
      bg: 'bg-rose-50',
      border: 'border-rose-200',
      text: 'text-rose-700',
      button: 'bg-rose-600 hover:bg-rose-700',
      iconBg: 'bg-rose-100'
    },
    info_needed: {
      icon: InformationCircleIcon,
      title: 'Additional Info Required',
      message: application?.admin_notes || 'Admin requested more details',
      action: 'Update Application',
      color: 'blue',
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      text: 'text-blue-700',
      button: 'bg-blue-600 hover:bg-blue-700',
      iconBg: 'bg-blue-100'
    }
  }

  const config = statusConfig[status] || statusConfig.draft
  const Icon = config.icon

  return (
    <Card className={`border ${config.border} ${config.bg} shadow-md mb-6 relative overflow-hidden`}>
      {/* Decorative accent */}
      <div className={`absolute top-0 left-0 w-1 h-full ${config.button.split(' ')[0]}`}></div>
      <CardBody className="p-4 sm:p-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pl-2">
          <div className="flex items-start gap-4">
            <div className={`p-3 rounded-xl ${config.iconBg} border ${config.border} flex-shrink-0 shadow-sm`}>
              <Icon className={`w-6 h-6 sm:w-7 sm:h-7 ${config.text}`} />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className={`text-base sm:text-lg font-semibold ${config.text} mb-1`}>
                {config.title}
              </h3>
              <p className="text-xs sm:text-sm text-slate-600">
                {config.message}
              </p>
              {status === 'rejected' && application?.rejection_reason && (
                <div className="mt-3 text-xs sm:text-sm text-rose-700 bg-rose-100 p-3 rounded-lg border border-rose-200">
                  <span className="font-semibold block mb-1">Reason for rejection:</span>
                  {application.rejection_reason}
                </div>
              )}
              {status === 'info_needed' && application?.admin_notes && (
                <div className="mt-3 text-xs sm:text-sm text-blue-700 bg-blue-100 p-3 rounded-lg border border-blue-200">
                  <span className="font-semibold block mb-1">Admin notes:</span>
                  {application.admin_notes}
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {onRefresh && (
              <button
                onClick={onRefresh}
                className="p-2 text-slate-500 hover:text-slate-700 hover:bg-white rounded-lg transition"
                title="Refresh status"
              >
                <RefreshCwIcon className="w-4 h-4" />
              </button>
            )}
            <Link 
              href={status === 'draft' || status === 'info_needed' 
                ? '/practitioner/application' 
                : `/practitioner/application/${application?.id || ''}`} 
              className="sm:flex-shrink-0"
            >
              <Button className={`w-full sm:w-auto ${config.button} text-white text-xs sm:text-sm px-5 py-2.5 shadow-sm hover:shadow-md transition-all`}>
                {config.action}
                <ArrowRightIcon className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </CardBody>
    </Card>
  )
}

// Application Start Card (for users with no application)
const ApplicationStartCard = ({ onRefresh }: { onRefresh?: () => void }) => {
  return (
    <Card className="border border-emerald-200 bg-gradient-to-r from-emerald-50 to-emerald-50/30 shadow-md mb-6 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-1 h-full bg-emerald-600"></div>
      <CardBody className="p-4 sm:p-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pl-2">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-xl bg-emerald-100 border border-emerald-200 flex-shrink-0 shadow-sm">
              <ClipboardDocumentListIcon className="w-6 h-6 sm:w-7 sm:h-7 text-emerald-700" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-base sm:text-lg font-semibold text-emerald-800 mb-1">
                Start Your Verification
              </h3>
              <p className="text-xs sm:text-sm text-emerald-700">
                Complete your practitioner application to get verified and start accepting bookings.
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-1 text-xs bg-white px-2 py-1 rounded-full text-emerald-700 border border-emerald-200">
                  <CheckCircleIcon className="h-3 w-3" />
                  Professional details
                </span>
                <span className="inline-flex items-center gap-1 text-xs bg-white px-2 py-1 rounded-full text-emerald-700 border border-emerald-200">
                  <CheckCircleIcon className="h-3 w-3" />
                  Qualifications
                </span>
                <span className="inline-flex items-center gap-1 text-xs bg-white px-2 py-1 rounded-full text-emerald-700 border border-emerald-200">
                  <CheckCircleIcon className="h-3 w-3" />
                  Document upload
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {onRefresh && (
              <button
                onClick={onRefresh}
                className="p-2 text-emerald-600 hover:text-emerald-700 hover:bg-white rounded-lg transition"
                title="Refresh status"
              >
                <RefreshCwIcon className="w-4 h-4" />
              </button>
            )}
            <Link href="/practitioner/application" className="sm:flex-shrink-0">
              <Button className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm px-5 py-2.5 shadow-sm hover:shadow-md transition-all">
                Start Application
                <ArrowRightIcon className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </CardBody>
    </Card>
  )
}

// Main Dashboard Component
export default function PractitionerDashboardPage() {
  const { user, isAuthenticated, isLoading, refreshUser } = useAuth()
  const router = useRouter()
  const extendedUser = user as ExtendedUser | null
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [metrics, setMetrics] = useState<any>(null)
  const [recentConsultations, setRecentConsultations] = useState<Consultation[]>([])
  const [application, setApplication] = useState<PractitionerApplication | null>(null)
  const [applicationStatus, setApplicationStatus] = useState<ApplicationStatus | null>(null)
  const [hasApplication, setHasApplication] = useState(false)

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login')
      return
    }
    if (isAuthenticated) {
      fetchDashboardData()
    }
  }, [isAuthenticated, isLoading, router])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      
      // Fetch application status
      const appStatusResponse: ApplicationStatusResponse = await apiClient.practitioners.applications.getStatus()
      setHasApplication(appStatusResponse.hasApplication)
      
      if (appStatusResponse.hasApplication && appStatusResponse.application) {
        setApplication(appStatusResponse.application)
        setApplicationStatus(appStatusResponse.application.status)
      }
      
      // Fetch consultations
      const consultationsData = await apiClient.consultations.getMyPractitionerConsultations()
      const consultations = extractResults<Consultation>(consultationsData)
      setRecentConsultations(consultations.slice(0, 5))
      
      // Fetch metrics
      try {
        const metricsData = await apiClient.consultations.getMetrics()
        setMetrics(metricsData)
      } catch (error) {
        console.log('No metrics available')
      }
      
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const handleRefresh = useCallback(async () => {
    setRefreshing(true)
    await refreshUser()
    await fetchDashboardData()
  }, [refreshUser])

  if (isLoading || loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="relative">
          <div className="animate-spin rounded-full h-12 w-12 sm:h-14 sm:w-14 border-4 border-emerald-200 border-t-emerald-600"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <SparklesIcon className="h-5 w-5 sm:h-6 sm:w-6 text-emerald-600 animate-pulse" />
          </div>
        </div>
      </div>
    )
  }

  // Show application section if not verified
  const showApplicationSection = !extendedUser?.is_verified

  // Get verification badge configuration
  const getVerificationBadge = () => {
    if (extendedUser?.is_verified) {
      return {
        text: 'Verified Practitioner',
        color: 'bg-teal-100 text-teal-800',
        icon: CheckCircleIcon
      }
    } else {
      let statusText = 'Pending Verification'
      if (hasApplication) {
        if (applicationStatus === 'pending') statusText = 'Application Under Review'
        else if (applicationStatus === 'draft') statusText = 'Complete Application'
        else if (applicationStatus === 'info_needed') statusText = 'Action Required'
        else if (applicationStatus === 'rejected') statusText = 'Application Rejected'
      }
      
      return {
        text: statusText,
        color: 'bg-amber-100 text-amber-800',
        icon: ClockIcon
      }
    }
  }

  const badge = getVerificationBadge()
  const BadgeIcon = badge.icon

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 py-4 sm:py-5 md:py-6 space-y-5 sm:space-y-6">
      {/* Header with Refresh Button */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
            Welcome, <span className='text-teal-600'>{extendedUser?.first_name || 'Practitioner'}</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            {new Date().toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </p>
        </div>
        <div className="flex items-center gap-3">
      </div>
      </div>

      {/* Application Section - Only shown if not verified */}
      {showApplicationSection && (
        <>
          {hasApplication && applicationStatus ? (
            <ApplicationStatusCard 
              status={applicationStatus} 
              application={application}
              onRefresh={handleRefresh}
            />
          ) : (
            <ApplicationStartCard onRefresh={handleRefresh} />
          )}
        </>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <Card>
          <CardBody className="p-4">
            <p className="text-xs text-slate-500">Total</p>
            <p className="text-lg font-semibold text-slate-900">{metrics?.total_consultations || 0}</p>
          </CardBody>
        </Card>
        <Card className="bg-blue-50">
          <CardBody className="p-4">
            <p className="text-xs text-blue-600">Booked</p>
            <p className="text-lg font-semibold text-blue-700">{metrics?.upcoming_consultations || 0}</p>
          </CardBody>
        </Card>
        <Card className="bg-green-50">
          <CardBody className="p-4">
            <p className="text-xs text-green-600">Completed</p>
            <p className="text-lg font-semibold text-green-700">{metrics?.completed_consultations || 0}</p>
          </CardBody>
        </Card>
        <Card className="bg-red-50">
          <CardBody className="p-4">
            <p className="text-xs text-red-600">Cancelled</p>
            <p className="text-lg font-semibold text-red-700">{metrics?.cancelled_consultations || 0}</p>
          </CardBody>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Link href="/practitioner/dashboard/availability">
          <Card className="hover:shadow-md transition cursor-pointer">
            <CardBody className="p-4 text-center">
              <CalendarIcon className="h-6 w-6 mx-auto mb-2 text-emerald-600" />
              <p className="text-sm font-medium">Availability</p>
            </CardBody>
          </Card>
        </Link>
        <Link href="/practitioner/dashboard/profile">
          <Card className="hover:shadow-md transition cursor-pointer">
            <CardBody className="p-4 text-center">
              <UserCircleIcon className="h-6 w-6 mx-auto mb-2 text-blue-600" />
              <p className="text-sm font-medium">Profile</p>
            </CardBody>
          </Card>
        </Link>
        {showApplicationSection && (
          <Link href="/practitioner/application">
            <Card className="hover:shadow-md transition cursor-pointer border-2 border-emerald-200 bg-emerald-50">
              <CardBody className="p-4 text-center">
                <ClipboardDocumentListIcon className="h-6 w-6 mx-auto mb-2 text-emerald-600" />
                <p className="text-sm font-medium text-emerald-700">Application</p>
                {!hasApplication && (
                  <span className="text-xs text-emerald-600 font-medium">Start →</span>
                )}
                {hasApplication && applicationStatus && (
                  <span className={`text-xs mt-1 px-2 py-0.5 rounded-full inline-block ${
                    applicationStatus === 'pending' ? 'bg-amber-100 text-amber-700' :
                    applicationStatus === 'draft' ? 'bg-slate-100 text-slate-700' :
                    applicationStatus === 'info_needed' ? 'bg-blue-100 text-blue-700' :
                    applicationStatus === 'rejected' ? 'bg-red-100 text-red-700' :
                    'bg-green-100 text-green-700'
                  }`}>
                    {applicationStatus.replace('_', ' ')}
                  </span>
                )}
              </CardBody>
            </Card>
          </Link>
        )}
        <Link href="/practitioner/dashboard/earnings">
          <Card className="hover:shadow-md transition cursor-pointer">
            <CardBody className="p-4 text-center">
              <CurrencyDollarIcon className="h-6 w-6 mx-auto mb-2 text-purple-600" />
              <p className="text-sm font-medium">Earnings</p>
            </CardBody>
          </Card>
        </Link>
      </div>

      {/* Consultations Section */}
      <Card>
        <CardHeader className="border-b border-slate-200 px-4 sm:px-6 py-3 sm:py-4">
          <h2 className="text-base sm:text-lg font-semibold text-slate-900">Your Consultations</h2>
        </CardHeader>
        <CardBody className="p-4 sm:p-6">
          {recentConsultations.length > 0 ? (
            <div className="space-y-3">
              {recentConsultations.map((consultation) => (
                <Link 
                  key={consultation.id}
                  href={`/practitioner/dashboard/consultations/${consultation.id}`}
                  className="block p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm font-medium">{consultation.client_name || 'Client'}</p>
                      <p className="text-xs text-slate-500">
                        {new Date(consultation.date).toLocaleDateString()} at {consultation.time.slice(0,5)}
                      </p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      consultation.status === 'booked' ? 'bg-blue-100 text-blue-700' :
                      consultation.status === 'completed' ? 'bg-green-100 text-green-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {consultation.status}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <CalendarIcon className="h-12 w-12 text-slate-300 mx-auto mb-3" />
              <p className="text-sm text-slate-500">No consultations found.</p>
              <p className="text-xs text-slate-400 mt-1">
                When clients book appointments, they will appear here.
              </p>
              {!extendedUser?.is_verified && (
                <div className="mt-4">
                  <Link href="/practitioner/application">
                    <Button size="sm" className="bg-emerald-600 text-white">
                      Complete Verification to Start
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          )}
        </CardBody>
      </Card>

      {/* Side Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card>
          <CardBody className="p-4">
            <h3 className="text-sm font-medium mb-2">Set Your Availability</h3>
            <p className="text-xs text-slate-500 mb-3">Manage your working hours</p>
            <Link href="/practitioner/dashboard/availability">
              <Button variant="outline" size="sm" className="w-full">
                Manage Schedule
              </Button>
            </Link>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="p-4 mb-3">
            <h3 className="text-sm font-medium mb-2">View Reviews</h3>
            <p className="text-xs text-slate-500 mb-3">See what clients are saying</p>
            <Link href="/practitioner/dashboard/reviews">
              <Button variant="outline" size="sm" className="w-full">
                View Reviews
              </Button>
            </Link>
          </CardBody>
        </Card>
      </div>
    </div>
  )
}