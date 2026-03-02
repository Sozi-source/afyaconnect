'use client'

import { useAuth } from '@/app/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
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
  UserCircleIcon
} from '@heroicons/react/24/outline'
import { Card, CardBody } from '@/app/components/ui/Card'
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

interface ExtendedUser {
  id: number
  email: string
  first_name?: string
  last_name?: string
  role?: string
  is_verified?: boolean
}

type StatColor = 'emerald' | 'blue' | 'purple' | 'amber'

// Application Status Card Component - Enhanced visibility
const ApplicationStatusCard = ({ status, application }: { status: ApplicationStatus; application?: PractitionerApplication | null }) => {
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
      action: 'Go to Dashboard',
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
      </CardBody>
    </Card>
  )
}

// Stat Card Component
const StatCard = ({ title, value, icon: Icon, trend, subtitle, color }: { 
  title: string
  value: string | number
  icon: React.ElementType
  trend?: string
  subtitle?: string
  color: StatColor
}) => {
  const colorClasses = {
    emerald: 'bg-emerald-50 text-emerald-600',
    blue: 'bg-blue-50 text-blue-600',
    purple: 'bg-purple-50 text-purple-600',
    amber: 'bg-amber-50 text-amber-600',
  }

  return (
    <Card className="border-slate-200/60 shadow-sm hover:shadow-md transition-all">
      <CardBody className="p-4 sm:p-5">
        <div className="flex items-center justify-between mb-2 sm:mb-3">
          <p className="text-[10px] sm:text-xs text-slate-500 uppercase tracking-wider truncate">{title}</p>
          <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${colorClasses[color]}`}>
            <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          </div>
        </div>
        <p className="text-lg sm:text-xl font-semibold text-slate-800 truncate">{value}</p>
        {trend && (
          <p className="text-[10px] sm:text-xs text-emerald-600 mt-1 flex items-center gap-1">
            <span className="inline-block w-1 h-1 rounded-full bg-emerald-400"></span>
            {trend}
          </p>
        )}
        {subtitle && (
          <p className="text-[10px] sm:text-xs text-slate-500 mt-1 truncate">{subtitle}</p>
        )}
      </CardBody>
    </Card>
  )
}

// Quick Action Card
const QuickActionCard = ({ href, icon: Icon, title, description, color }: { 
  href: string
  icon: React.ElementType
  title: string
  description: string
  color: StatColor
}) => {
  const colorClasses = {
    emerald: 'bg-emerald-50 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white',
    blue: 'bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white',
    purple: 'bg-purple-50 text-purple-600 group-hover:bg-purple-600 group-hover:text-white',
    amber: 'bg-amber-50 text-amber-600 group-hover:bg-amber-600 group-hover:text-white',
  }

  return (
    <Link href={href} className="block group">
      <Card className="border-slate-200/60 shadow-sm hover:shadow-md hover:border-emerald-200 transition-all cursor-pointer h-full">
        <CardBody className="p-4 sm:p-5">
          <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center mb-3 transition-all duration-300 ${colorClasses[color]}`}>
            <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
          </div>
          <h3 className="text-sm sm:text-base font-medium text-slate-800 group-hover:text-emerald-600 transition-colors">
            {title}
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 line-clamp-2">{description}</p>
        </CardBody>
      </Card>
    </Link>
  )
}

// Review Card Component
const ReviewCard = ({ review }: { review: any }) => (
  <div className="flex items-start gap-3 p-3 sm:p-4 bg-slate-50 rounded-xl hover:bg-emerald-50/50 transition-colors border border-transparent hover:border-emerald-200">
    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-sm flex-shrink-0">
      {review.client_name?.split(' ').map((n: string) => n[0]).join('') || 'U'}
    </div>
    <div className="flex-1 min-w-0">
      <div className="flex flex-col xs:flex-row xs:items-center xs:justify-between gap-1 xs:gap-2">
        <p className="text-xs sm:text-sm font-medium text-slate-800 truncate">{review.client_name || 'Anonymous'}</p>
        <div className="flex">
          {[1,2,3,4,5].map(star => (
            <StarIcon 
              key={star} 
              className={`h-2.5 w-2.5 sm:h-3 sm:w-3 ${
                star <= review.rating ? 'text-amber-400 fill-current' : 'text-slate-300'
              }`} 
            />
          ))}
        </div>
      </div>
      <p className="text-xs sm:text-sm text-slate-600 mt-2 line-clamp-2">
        "{review.comment || 'No comment'}"
      </p>
      <p className="text-[10px] sm:text-xs text-slate-400 mt-2">
        {review.created_at ? new Date(review.created_at).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric'
        }) : ''}
      </p>
    </div>
  </div>
)

export default function PractitionerDashboardPage() {
  const { user, isAuthenticated } = useAuth()
  const router = useRouter()
  const extendedUser = user as ExtendedUser | null
  const [loading, setLoading] = useState(true)
  const [metrics, setMetrics] = useState<PractitionerMetrics | null>(null)
  const [recentConsultations, setRecentConsultations] = useState<Consultation[]>([])
  const [recentReviews, setRecentReviews] = useState<any[]>([])
  const [application, setApplication] = useState<PractitionerApplication | null>(null)
  const [applicationStatus, setApplicationStatus] = useState<ApplicationStatus | null>(null)
  const [hasApplication, setHasApplication] = useState(false)
  const [notifications, setNotifications] = useState<any[]>([])

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login')
      return
    }
    
    if (extendedUser?.role !== 'practitioner') {
      router.push('/client/dashboard')
      return
    }

    fetchDashboardData()
  }, [isAuthenticated, extendedUser, router])

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
      
      // Calculate metrics
      const total = consultations.length
      const upcoming = consultations.filter(c => c.status === 'booked').length
      const completed = consultations.filter(c => c.status === 'completed').length
      const cancelled = consultations.filter(c => c.status === 'cancelled').length
      
      const uniqueClients = new Set(consultations.map(c => c.client)).size
      
      // Calculate earnings (estimate based on hourly rate)
      let hourlyRate = 2500
      try {
        const practitionerProfile = await apiClient.practitioners.getMyProfile()
        hourlyRate = practitionerProfile?.hourly_rate || 2500
      } catch (error) {
        console.log('Using default hourly rate')
      }
      
      const totalEarnings = completed * hourlyRate
      const pendingEarnings = upcoming * hourlyRate

      setMetrics({
        total_consultations: total,
        completed_consultations: completed,
        upcoming_consultations: upcoming,
        cancelled_consultations: cancelled,
        total_earnings: totalEarnings,
        average_rating: 4.8,
        total_reviews: 0,
        completion_rate: total > 0 ? (completed / total) * 100 : 0,
        total_clients: uniqueClients
      })

      setRecentConsultations(consultations.slice(0, 5))
      
      // Fetch reviews if available
      try {
        const reviewsData = await apiClient.reviews.getByPractitioner(extendedUser?.id || 0)
        setRecentReviews(reviewsData.slice(0, 3))
      } catch (error) {
        console.log('No reviews available')
      }

      // Fetch notifications
      try {
        const notifs = await apiClient.notifications.getAll()
        setNotifications(notifs.slice(0, 3))
      } catch (error) {
        console.log('No notifications available')
      }

    } catch (error) {
      console.error('Error fetching practice data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-12 w-12 sm:h-14 sm:w-14 border-4 border-emerald-200 border-t-emerald-600"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 bg-emerald-600 rounded-full animate-pulse"></div>
            </div>
          </div>
          <p className="text-xs sm:text-sm text-slate-500">Loading practice dashboard...</p>
        </div>
      </div>
    )
  }

  const upcomingConsultations = recentConsultations
    .filter(c => c.status === 'booked')
    .slice(0, 3)
    .map(c => ({
      id: c.id,
      client: c.client_name || 'Client',
      time: c.time?.slice(0,5) || '--:--',
      date: new Date(c.date).toLocaleDateString('en-US', { 
        weekday: 'short', 
        month: 'short', 
        day: 'numeric' 
      }),
      type: c.duration_minutes === 60 ? 'Consultation' : 'Follow-up'
    }))

  const unreadNotifications = notifications.filter(n => !n.is_read).length

  // Determine if we should show application card
  const showApplicationCard = hasApplication && 
    applicationStatus && 
    applicationStatus !== 'approved' && 
    !extendedUser?.is_verified

  // Get welcome message based on verification status
  const getWelcomeMessage = () => {
    if (extendedUser?.is_verified) {
      return {
        title: 'Verified Practitioner',
        subtitle: 'You can accept bookings and manage your practice',
        color: 'text-emerald-600',
        bg: 'bg-emerald-50',
        icon: CheckCircleIcon
      }
    } else if (hasApplication) {
      return {
        title: 'Application in Progress',
        subtitle: `Status: ${applicationStatus?.replace('_', ' ') || 'pending'}`,
        color: 'text-amber-600',
        bg: 'bg-amber-50',
        icon: ClockIcon
      }
    } else {
      return {
        title: 'Complete Your Profile',
        subtitle: 'Start your application to get verified',
        color: 'text-blue-600',
        bg: 'bg-blue-50',
        icon: AcademicCapIcon
      }
    }
  }

  const welcomeMsg = getWelcomeMessage()
  const WelcomeIcon = welcomeMsg.icon

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 py-4 sm:py-5 md:py-6 space-y-5 sm:space-y-6 md:space-y-8 overflow-x-hidden">
      {/* Application Status Banner - Enhanced visibility */}
      {showApplicationCard && applicationStatus && (
        <ApplicationStatusCard status={applicationStatus} application={application} />
      )}

      {/* Header Section with Color-Coded Welcome */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2 text-emerald-600 mb-2">
            <SparklesIcon className="h-4 w-4 flex-shrink-0" />
            <span className="text-[10px] sm:text-xs font-medium uppercase tracking-wider">Practice Overview</span>
          </div>
          
          {/* Welcome message with colored background */}
          <div className={`inline-flex items-center gap-3 ${welcomeMsg.bg} px-4 py-2 rounded-lg mb-2`}>
            <div className={`p-2 rounded-full ${welcomeMsg.bg} border-2 border-white shadow-sm`}>
              <WelcomeIcon className={`h-5 w-5 ${welcomeMsg.color}`} />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl md:text-3xl font-semibold text-slate-800">
                Dr. {extendedUser?.first_name || 'Practitioner'}
              </h1>
              <p className={`text-xs sm:text-sm font-medium ${welcomeMsg.color}`}>
                {welcomeMsg.title}
              </p>
            </div>
          </div>
          
          <p className="text-xs sm:text-sm text-slate-500 mt-2 flex items-center gap-2 flex-wrap">
            <ShieldCheckIcon className="h-3.5 w-3.5 text-emerald-500 flex-shrink-0" />
            {extendedUser?.is_verified ? (
              <span>✓ Verified account · Accepting new patients</span>
            ) : hasApplication ? (
              <span>⏳ {applicationStatus?.replace('_', ' ')} · Complete verification to start</span>
            ) : (
              <span>📝 Not verified · Start your application today</span>
            )}
          </p>
        </div>
        
        <div className="flex flex-col xs:flex-row gap-2 sm:gap-3">
          <Link href="/practitioner/dashboard/notifications" className="relative inline-block">
            <Button variant="outline" className="px-3 py-2 text-xs sm:text-sm border-slate-200 hover:bg-slate-50">
              <BellIcon className="h-4 w-4 mr-1.5" />
              Notifications
              {unreadNotifications > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white text-[10px] rounded-full flex items-center justify-center animate-pulse">
                  {unreadNotifications}
                </span>
              )}
            </Button>
          </Link>
          <Link href="/practitioner/dashboard/availability">
            <Button className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm px-4 py-2 shadow-sm shadow-emerald-200/50 w-full xs:w-auto">
              <ClockIcon className="h-4 w-4 mr-1.5 flex-shrink-0" />
              Set Availability
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard
          title="Total Earnings"
          value={`KES ${metrics?.total_earnings?.toLocaleString() || 0}`}
          icon={CurrencyDollarIcon}
          trend="+12% this month"
          color="emerald"
        />
        <StatCard
          title="Consultations"
          value={metrics?.total_consultations || 0}
          icon={CalendarIcon}
          subtitle={`${metrics?.upcoming_consultations || 0} upcoming`}
          color="blue"
        />
        <StatCard
          title="Clients"
          value={metrics?.total_clients || 0}
          icon={UserGroupIcon}
          trend="+3 new this month"
          color="purple"
        />
        <StatCard
          title="Rating"
          value={metrics?.average_rating?.toFixed(1) || '0.0'}
          icon={StarIcon}
          subtitle={`${metrics?.total_reviews || 0} reviews`}
          color="amber"
        />
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-base sm:text-lg font-semibold text-slate-800 mb-3 sm:mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
          <QuickActionCard
            href="/practitioner/dashboard/availability"
            icon={ClockIcon}
            title="Manage Hours"
            description="Set your availability"
            color="emerald"
          />
          <QuickActionCard
            href="/practitioner/dashboard/consultations"
            icon={CalendarIcon}
            title="Consultations"
            description="View schedule"
            color="blue"
          />
          <QuickActionCard
            href="/practitioner/dashboard/earnings"
            icon={ChartBarIcon}
            title="Earnings"
            description="Track income"
            color="purple"
          />
          <QuickActionCard
            href={!hasApplication 
              ? '/practitioner/application' 
              : applicationStatus === 'draft' || applicationStatus === 'info_needed'
                ? '/practitioner/application'
                : `/practitioner/application/${application?.id || ''}`}
            icon={DocumentTextIcon}
            title="Application"
            description={!hasApplication 
              ? 'Start verification' 
              : applicationStatus === 'approved' 
                ? 'View status' 
                : applicationStatus === 'pending'
                  ? 'Under review'
                  : 'Complete verification'}
            color="amber"
          />
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 sm:gap-6">
        {/* Left Column - Schedule & Activity */}
        <div className="lg:col-span-2 space-y-5 sm:space-y-6">
          {/* Today's Schedule */}
          <Card className="border-slate-200/60 shadow-sm">
            <CardBody className="p-4 sm:p-5 md:p-6">
              <div className="flex flex-col xs:flex-row xs:items-center xs:justify-between gap-2 mb-4">
                <div>
                  <h2 className="text-base sm:text-lg font-semibold text-slate-800">Today's Schedule</h2>
                  <p className="text-xs sm:text-sm text-slate-500 mt-1">Your upcoming appointments</p>
                </div>
                <Link href="/practitioner/dashboard/consultations" className="text-xs sm:text-sm text-emerald-600 hover:text-emerald-700 flex items-center gap-1 self-start xs:self-auto">
                  View all
                  <ArrowRightIcon className="h-3.5 w-3.5" />
                </Link>
              </div>
              
              {upcomingConsultations.length > 0 ? (
                <div className="space-y-2 sm:space-y-3">
                  {upcomingConsultations.map((item) => (
                    <Link 
                      key={item.id} 
                      href={`/practitioner/dashboard/consultations/${item.id}`}
                      className="block p-3 sm:p-4 bg-slate-50 rounded-xl hover:bg-emerald-50/50 transition-colors border border-transparent hover:border-emerald-200"
                    >
                      <div className="flex flex-col xs:flex-row xs:items-center xs:justify-between gap-2 xs:gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full flex-shrink-0"></div>
                          <div className="min-w-0">
                            <p className="text-xs sm:text-sm font-medium text-slate-800 truncate">{item.client}</p>
                            <p className="text-[10px] sm:text-xs text-slate-500 truncate">{item.type}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 xs:gap-4 text-right ml-4 xs:ml-0">
                          <div>
                            <p className="text-xs sm:text-sm font-medium text-slate-800">{item.time}</p>
                            <p className="text-[10px] sm:text-xs text-slate-500">{item.date}</p>
                          </div>
                          <ArrowRightIcon className="h-3.5 w-3.5 text-slate-400" />
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 sm:py-10">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <CalendarIcon className="h-6 w-6 sm:h-7 sm:w-7 text-slate-400" />
                  </div>
                  <p className="text-xs sm:text-sm text-slate-500">No upcoming consultations</p>
                  <Link href="/practitioner/dashboard/availability" className="mt-3 inline-block">
                    <Button size="sm" className="bg-emerald-600 text-white text-xs px-3 py-1.5">
                      Set Availability
                    </Button>
                  </Link>
                </div>
              )}
            </CardBody>
          </Card>

          {/* Recent Reviews */}
          <Card className="border-slate-200/60 shadow-sm">
            <CardBody className="p-4 sm:p-5 md:p-6">
              <div className="flex flex-col xs:flex-row xs:items-center xs:justify-between gap-2 mb-4">
                <div>
                  <h2 className="text-base sm:text-lg font-semibold text-slate-800">Recent Reviews</h2>
                  <p className="text-xs sm:text-sm text-slate-500 mt-1">What clients are saying</p>
                </div>
                <Link href="/practitioner/dashboard/reviews" className="text-xs sm:text-sm text-emerald-600 hover:text-emerald-700 flex items-center gap-1 self-start xs:self-auto">
                  View all
                  <ArrowRightIcon className="h-3.5 w-3.5" />
                </Link>
              </div>
              
              {recentReviews.length > 0 ? (
                <div className="space-y-3 sm:space-y-4">
                  {recentReviews.map((review) => (
                    <ReviewCard key={review.id} review={review} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 sm:py-10">
                  <StarIcon className="h-10 w-10 sm:h-12 sm:w-12 text-slate-300 mx-auto mb-3" />
                  <p className="text-xs sm:text-sm text-slate-500">No reviews yet</p>
                  <p className="text-[10px] sm:text-xs text-slate-400 mt-1">Reviews appear after completed consultations</p>
                </div>
              )}
            </CardBody>
          </Card>
        </div>

        {/* Right Column - Summary & Notifications */}
        <div className="space-y-5 sm:space-y-6">
          {/* Weekly Summary */}
          <Card className="border-slate-200/60 shadow-sm h-full">
            <CardBody className="p-4 sm:p-5 md:p-6">
              <h2 className="text-base sm:text-lg font-semibold text-slate-800 mb-4">Weekly Summary</h2>
              <div className="space-y-3 sm:space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-xs sm:text-sm text-slate-500">Completed</span>
                  <span className="text-sm sm:text-base font-semibold text-slate-800">{metrics?.completed_consultations || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs sm:text-sm text-slate-500">Upcoming</span>
                  <span className="text-sm sm:text-base font-semibold text-emerald-600">{metrics?.upcoming_consultations || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs sm:text-sm text-slate-500">Cancelled</span>
                  <span className="text-sm sm:text-base font-semibold text-rose-600">{metrics?.cancelled_consultations || 0}</span>
                </div>
                <div className="pt-3 sm:pt-4 mt-2 border-t border-slate-200">
                  <div className="flex justify-between items-center">
                    <span className="text-xs sm:text-sm font-medium text-slate-600">Earnings this week</span>
                    <span className="text-base sm:text-lg font-bold text-emerald-600">
                      KES {(metrics?.total_earnings || 0).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-xs sm:text-sm text-slate-500">Completion rate</span>
                    <span className="text-sm font-medium text-slate-800">{metrics?.completion_rate?.toFixed(1)}%</span>
                  </div>
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Quick Stats Card - Application Status */}
          <Card className="border-slate-200/60 shadow-sm bg-gradient-to-br from-emerald-50 to-emerald-50/30">
            <CardBody className="p-4 sm:p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-emerald-100 rounded-lg">
                  <ShieldCheckIcon className="h-5 w-5 text-emerald-600" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-slate-800">Verification Status</h3>
                  <p className="text-xs text-slate-600">
                    {extendedUser?.is_verified ? 'Verified Practitioner' : 'Pending Verification'}
                  </p>
                </div>
              </div>
              
              {!extendedUser?.is_verified && hasApplication && applicationStatus && (
                <div className="mt-3 space-y-2">
                  <div className={`p-3 rounded-lg border ${
                    applicationStatus === 'pending' ? 'bg-amber-50 border-amber-200' :
                    applicationStatus === 'draft' ? 'bg-slate-50 border-slate-200' :
                    applicationStatus === 'info_needed' ? 'bg-blue-50 border-blue-200' :
                    applicationStatus === 'rejected' ? 'bg-rose-50 border-rose-200' :
                    'bg-emerald-50 border-emerald-200'
                  }`}>
                    <div className="flex items-center gap-2 text-xs">
                      {applicationStatus === 'pending' && (
                        <>
                          <ClockIcon className="h-4 w-4 text-amber-500" />
                          <span className="text-slate-700 font-medium">Application under review</span>
                        </>
                      )}
                      {applicationStatus === 'draft' && (
                        <>
                          <PencilSquareIcon className="h-4 w-4 text-slate-500" />
                          <span className="text-slate-700 font-medium">Complete your application</span>
                        </>
                      )}
                      {applicationStatus === 'info_needed' && (
                        <>
                          <InformationCircleIcon className="h-4 w-4 text-blue-500" />
                          <span className="text-slate-700 font-medium">Additional info required</span>
                        </>
                      )}
                      {applicationStatus === 'rejected' && (
                        <>
                          <XCircleIcon className="h-4 w-4 text-rose-500" />
                          <span className="text-slate-700 font-medium">Application rejected</span>
                        </>
                      )}
                    </div>
                  </div>
                  <Link href="/practitioner/application">
                    <Button variant="outline" className="w-full text-xs border-emerald-200 text-emerald-700 hover:bg-emerald-50">
                      View Application Details
                      <ArrowRightIcon className="w-3.5 h-3.5 ml-1.5" />
                    </Button>
                  </Link>
                </div>
              )}
              
              {!hasApplication && !extendedUser?.is_verified && (
                <div className="mt-3">
                  <Link href="/practitioner/application">
                    <Button className="w-full bg-emerald-600 text-white text-xs py-2.5 shadow-sm hover:shadow-md transition-all">
                      <AcademicCapIcon className="w-4 h-4 mr-2" />
                      Start Application
                      <ArrowRightIcon className="w-3.5 h-3.5 ml-2" />
                    </Button>
                  </Link>
                  <p className="text-[10px] text-slate-500 text-center mt-2">
                    Get verified to start accepting bookings
                  </p>
                </div>
              )}

              {extendedUser?.is_verified && (
                <div className="mt-3 p-3 bg-emerald-100 rounded-lg border border-emerald-200">
                  <div className="flex items-center gap-2 text-xs text-emerald-700">
                    <CheckCircleIcon className="h-4 w-4" />
                    <span className="font-medium">Your account is verified and active</span>
                  </div>
                </div>
              )}
            </CardBody>
          </Card>
        </div>
      </div>

      {/* Mobile Scroll Hint */}
      <div className="flex justify-center mt-4 sm:hidden">
        <div className="bg-slate-100 px-3 py-1.5 rounded-full text-[10px] text-slate-500 flex items-center gap-1.5">
          <span className="inline-block w-1 h-1 rounded-full bg-slate-400"></span>
          Swipe for more options
          <span className="inline-block w-1 h-1 rounded-full bg-slate-400"></span>
        </div>
      </div>

      <style jsx>{`
        @media (max-width: 480px) {
          .xs\\:grid-cols-2 {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }
      `}</style>
    </div>
  )
}