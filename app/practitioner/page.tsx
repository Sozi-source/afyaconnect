// app/components/practitioner/dashboard/PractitionerDashboardPage.tsx
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
  UserCircleIcon,
  ChevronRightIcon,
  XMarkIcon
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
import { MenuIcon } from 'lucide-react'

interface ExtendedUser {
  id: number
  email: string
  first_name?: string
  last_name?: string
  role?: string
  is_verified?: boolean
}

type StatColor = 'emerald' | 'blue' | 'purple' | 'amber'

// Mobile Menu Component
const MobileMenu = ({ isOpen, onClose, children }: { isOpen: boolean; onClose: () => void; children: React.ReactNode }) => {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      <div className="fixed right-0 top-0 bottom-0 w-64 bg-white shadow-xl p-4 overflow-y-auto">
        <div className="flex justify-end mb-4">
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg">
            <XMarkIcon className="h-5 w-5 text-slate-600" />
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}

// Application Status Card Component - Enhanced for mobile
const ApplicationStatusCard = ({ status, application }: { status: ApplicationStatus; application?: PractitionerApplication | null }) => {
  const statusConfig = {
    draft: {
      icon: PencilSquareIcon,
      title: 'Complete Your Application',
      message: 'Finish your application to get verified',
      action: 'Continue',
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
      action: 'View',
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
      action: 'Update',
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
    <Card className={`border ${config.border} ${config.bg} shadow-sm mb-4 relative overflow-hidden`}>
      <div className={`absolute top-0 left-0 w-1 h-full ${config.button.split(' ')[0]}`}></div>
      <CardBody className="p-3 sm:p-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pl-2">
          <div className="flex items-start gap-3">
            <div className={`p-2 rounded-lg ${config.iconBg} border ${config.border} flex-shrink-0`}>
              <Icon className={`w-5 h-5 sm:w-6 sm:h-6 ${config.text}`} />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className={`text-sm sm:text-base font-semibold ${config.text} mb-0.5`}>
                {config.title}
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 line-clamp-2">
                {config.message}
              </p>
              {status === 'rejected' && application?.rejection_reason && (
                <div className="mt-2 text-xs text-rose-700 bg-rose-100 p-2 rounded-lg border border-rose-200">
                  <span className="font-semibold block mb-0.5">Reason:</span>
                  <span className="line-clamp-3">{application.rejection_reason}</span>
                </div>
              )}
              {status === 'info_needed' && application?.admin_notes && (
                <div className="mt-2 text-xs text-blue-700 bg-blue-100 p-2 rounded-lg border border-blue-200">
                  <span className="font-semibold block mb-0.5">Admin notes:</span>
                  <span className="line-clamp-3">{application.admin_notes}</span>
                </div>
              )}
            </div>
          </div>
          <Link 
            href={status === 'draft' || status === 'info_needed' 
              ? '/practitioner/application' 
              : `/practitioner/application/${application?.id || ''}`} 
            className="sm:flex-shrink-0 w-full sm:w-auto"
          >
            <Button className={`w-full sm:w-auto ${config.button} text-white text-xs px-4 py-2 shadow-sm`}>
              {config.action}
              <ArrowRightIcon className="w-3.5 h-3.5 ml-1.5" />
            </Button>
          </Link>
        </div>
      </CardBody>
    </Card>
  )
}

// Stat Card Component - Mobile optimized
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
      <CardBody className="p-3 sm:p-4">
        <div className="flex items-center justify-between mb-1.5 sm:mb-2">
          <p className="text-[10px] sm:text-xs text-slate-500 uppercase tracking-wider truncate pr-2">{title}</p>
          <div className={`w-6 h-6 sm:w-7 sm:h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${colorClasses[color]}`}>
            <Icon className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
          </div>
        </div>
        <p className="text-base sm:text-lg font-semibold text-slate-800 truncate">{value}</p>
        {trend && (
          <p className="text-[9px] sm:text-xs text-emerald-600 mt-1 flex items-center gap-1">
            <span className="inline-block w-1 h-1 rounded-full bg-emerald-400"></span>
            <span className="truncate">{trend}</span>
          </p>
        )}
        {subtitle && (
          <p className="text-[9px] sm:text-xs text-slate-500 mt-1 truncate">{subtitle}</p>
        )}
      </CardBody>
    </Card>
  )
}

// Quick Action Card - Mobile optimized
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
        <CardBody className="p-3 sm:p-4">
          <div className={`w-8 h-8 sm:w-9 sm:h-9 rounded-lg flex items-center justify-center mb-2 transition-all duration-300 ${colorClasses[color]}`}>
            <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          </div>
          <h3 className="text-xs sm:text-sm font-medium text-slate-800 group-hover:text-emerald-600 transition-colors line-clamp-1">
            {title}
          </h3>
          <p className="text-[10px] sm:text-xs text-slate-500 mt-0.5 line-clamp-2">{description}</p>
        </CardBody>
      </Card>
    </Link>
  )
}

// Review Card Component - Mobile optimized
const ReviewCard = ({ review }: { review: any }) => (
  <div className="flex items-start gap-2 p-2 sm:p-3 bg-slate-50 rounded-lg hover:bg-emerald-50/50 transition-colors border border-transparent hover:border-emerald-200">
    <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-full flex items-center justify-center text-white text-[10px] sm:text-xs font-bold shadow-sm flex-shrink-0">
      {review.client_name?.split(' ').map((n: string) => n[0]).join('') || 'U'}
    </div>
    <div className="flex-1 min-w-0">
      <div className="flex flex-col xs:flex-row xs:items-center xs:justify-between gap-1">
        <p className="text-[10px] sm:text-xs font-medium text-slate-800 truncate">{review.client_name || 'Anonymous'}</p>
        <div className="flex gap-0.5">
          {[1,2,3,4,5].map(star => (
            <StarIcon 
              key={star} 
              className={`h-2 w-2 sm:h-2.5 sm:w-2.5 ${
                star <= review.rating ? 'text-amber-400 fill-current' : 'text-slate-300'
              }`} 
            />
          ))}
        </div>
      </div>
      <p className="text-[9px] sm:text-xs text-slate-600 mt-1 line-clamp-2">
        "{review.comment || 'No comment'}"
      </p>
      <p className="text-[8px] sm:text-[10px] text-slate-400 mt-1">
        {review.created_at ? new Date(review.created_at).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric'
        }) : ''}
      </p>
    </div>
  </div>
)

export default function PractitionerDashboardPage() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth()
  const router = useRouter()
  const [isMounted, setIsMounted] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
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
    setIsMounted(true)
  }, [])

  if (authLoading || !isMounted) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-3 border-emerald-200 border-t-emerald-600"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-emerald-600 rounded-full animate-pulse"></div>
            </div>
          </div>
          <p className="text-xs sm:text-sm text-slate-500">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated || !user) {
    router.push('/login')
    return null
  }

  if (extendedUser?.role !== 'practitioner') {
    router.push('/client/dashboard')
    return null
  }

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      
      const appStatusResponse: ApplicationStatusResponse = await apiClient.practitioners.applications.getStatus()
      setHasApplication(appStatusResponse.hasApplication)
      
      if (appStatusResponse.hasApplication && appStatusResponse.application) {
        setApplication(appStatusResponse.application)
        setApplicationStatus(appStatusResponse.application.status)
      }
      
      const consultationsData = await apiClient.consultations.getMyPractitionerConsultations()
      const consultations = extractResults<Consultation>(consultationsData)
      
      const total = consultations.length
      const upcoming = consultations.filter(c => c.status === 'booked').length
      const completed = consultations.filter(c => c.status === 'completed').length
      const cancelled = consultations.filter(c => c.status === 'cancelled').length
      
      const uniqueClients = new Set(consultations.map(c => c.client)).size
      
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
      
      try {
        const reviewsData = await apiClient.reviews.getByPractitioner(extendedUser?.id || 0)
        setRecentReviews(reviewsData.slice(0, 3))
      } catch (error) {
        console.log('No reviews available')
      }

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
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-3 border-emerald-200 border-t-emerald-600"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-emerald-600 rounded-full animate-pulse"></div>
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

  const showApplicationCard = hasApplication && 
    applicationStatus && 
    applicationStatus !== 'approved' && 
    !extendedUser?.is_verified

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

  // Quick actions for mobile menu
  const mobileQuickActions = [
    { href: '/practitioner/dashboard/availability', icon: ClockIcon, title: 'Availability' },
    { href: '/practitioner/dashboard/consultations', icon: CalendarIcon, title: 'Schedule' },
    { href: '/practitioner/dashboard/earnings', icon: ChartBarIcon, title: 'Earnings' },
    { href: '/practitioner/application', icon: DocumentTextIcon, title: 'Application' },
    { href: '/practitioner/dashboard/notifications', icon: BellIcon, title: 'Notifications', badge: unreadNotifications },
    { href: '/practitioner/dashboard/settings', icon: UserCircleIcon, title: 'Settings' },
  ]

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 py-3 sm:py-4 md:py-6 space-y-4 sm:space-y-5 md:space-y-6 overflow-x-hidden">
      {/* Mobile Header with Menu Button */}
      <div className="flex items-center justify-between lg:hidden mb-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
            {extendedUser?.first_name?.[0]}{extendedUser?.last_name?.[0]}
          </div>
          <div>
            <p className="text-xs text-slate-500">Welcome back</p>
            <p className="text-sm font-semibold text-slate-800">Dr. {extendedUser?.first_name}</p>
          </div>
        </div>
        <button 
          onClick={() => setMobileMenuOpen(true)}
          className="p-2 hover:bg-slate-100 rounded-lg"
        >
          <MenuIcon className="h-5 w-5 text-slate-600" />
        </button>
      </div>

      {/* Mobile Menu */}
      <MobileMenu isOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)}>
        <div className="space-y-3">
          <div className="pb-3 border-b border-slate-200">
            <p className="text-xs font-medium text-slate-400 mb-2">Quick Actions</p>
            {mobileQuickActions.map((action) => (
              <Link
                key={action.href}
                href={action.href}
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between p-2 hover:bg-slate-50 rounded-lg"
              >
                <div className="flex items-center gap-2">
                  <action.icon className="h-4 w-4 text-slate-500" />
                  <span className="text-sm text-slate-700">{action.title}</span>
                </div>
                {action.badge && action.badge > 0 && (
                  <span className="bg-rose-500 text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center">
                    {action.badge}
                  </span>
                )}
              </Link>
            ))}
          </div>
          <div className="pt-2">
            <p className="text-xs text-slate-400 mb-2">Account</p>
            <div className="p-3 bg-slate-50 rounded-lg">
              <p className="text-xs font-medium text-slate-800">{extendedUser?.email}</p>
              <p className="text-[10px] text-slate-500 mt-1">
                {extendedUser?.is_verified ? '✓ Verified' : '○ Not verified'}
              </p>
            </div>
          </div>
        </div>
      </MobileMenu>

      {/* Desktop Header - Hidden on mobile */}
      <div className="hidden lg:flex lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2 text-emerald-600 mb-2">
            <SparklesIcon className="h-4 w-4 flex-shrink-0" />
            <span className="text-xs font-medium uppercase tracking-wider">Practice Overview</span>
          </div>
          
          <div className={`inline-flex items-center gap-3 ${welcomeMsg.bg} px-4 py-2 rounded-lg mb-2`}>
            <div className={`p-2 rounded-full ${welcomeMsg.bg} border-2 border-white shadow-sm`}>
              <WelcomeIcon className={`h-5 w-5 ${welcomeMsg.color}`} />
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-slate-800">
                Dr. {extendedUser?.first_name || 'Practitioner'}
              </h1>
              <p className={`text-sm font-medium ${welcomeMsg.color}`}>
                {welcomeMsg.title}
              </p>
            </div>
          </div>
          
          <p className="text-sm text-slate-500 mt-2 flex items-center gap-2">
            <ShieldCheckIcon className="h-3.5 w-3.5 text-emerald-500" />
            {extendedUser?.is_verified ? (
              <span>✓ Verified account · Accepting new patients</span>
            ) : hasApplication ? (
              <span>⏳ {applicationStatus?.replace('_', ' ')} · Complete verification to start</span>
            ) : (
              <span>📝 Not verified · Start your application today</span>
            )}
          </p>
        </div>
        
        <div className="flex gap-3">
          <Link href="/practitioner/dashboard/notifications" className="relative">
            <Button variant="outline" className="px-4 py-2 text-sm border-slate-200 hover:bg-slate-50">
              <BellIcon className="h-4 w-4 mr-2" />
              Notifications
              {unreadNotifications > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white text-[10px] rounded-full flex items-center justify-center animate-pulse">
                  {unreadNotifications}
                </span>
              )}
            </Button>
          </Link>
          <Link href="/practitioner/dashboard/availability">
            <Button className="bg-emerald-600 hover:bg-emerald-700 text-white text-sm px-4 py-2 shadow-sm">
              <ClockIcon className="h-4 w-4 mr-2" />
              Set Availability
            </Button>
          </Link>
        </div>
      </div>

      {/* Application Status Banner */}
      {showApplicationCard && applicationStatus && (
        <ApplicationStatusCard status={applicationStatus} application={application} />
      )}

      {/* Stats Grid - Responsive columns */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
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

      {/* Quick Actions - Responsive grid */}
      <div>
        <h2 className="text-sm sm:text-base font-semibold text-slate-800 mb-2 sm:mb-3 px-1">Quick Actions</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
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
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-5">
        {/* Left Column - Schedule & Activity */}
        <div className="lg:col-span-2 space-y-4 sm:space-y-5">
          {/* Today's Schedule */}
          <Card className="border-slate-200/60 shadow-sm">
            <CardBody className="p-3 sm:p-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h2 className="text-sm sm:text-base font-semibold text-slate-800">Today's Schedule</h2>
                  <p className="text-xs text-slate-500 mt-0.5">Your upcoming appointments</p>
                </div>
                <Link href="/practitioner/dashboard/consultations" className="text-xs text-emerald-600 hover:text-emerald-700 flex items-center gap-1">
                  View all
                  <ArrowRightIcon className="h-3 w-3" />
                </Link>
              </div>
              
              {upcomingConsultations.length > 0 ? (
                <div className="space-y-2">
                  {upcomingConsultations.map((item) => (
                    <Link 
                      key={item.id} 
                      href={`/practitioner/dashboard/consultations/${item.id}`}
                      className="block p-2 sm:p-3 bg-slate-50 rounded-lg hover:bg-emerald-50/50 transition-colors border border-transparent hover:border-emerald-200"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full flex-shrink-0"></div>
                          <div className="min-w-0">
                            <p className="text-xs font-medium text-slate-800 truncate">{item.client}</p>
                            <p className="text-[10px] text-slate-500">{item.type}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 text-right flex-shrink-0">
                          <div>
                            <p className="text-xs font-medium text-slate-800">{item.time}</p>
                            <p className="text-[9px] text-slate-500">{item.date}</p>
                          </div>
                          <ChevronRightIcon className="h-3 w-3 text-slate-400" />
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6">
                  <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <CalendarIcon className="h-5 w-5 text-slate-400" />
                  </div>
                  <p className="text-xs text-slate-500">No upcoming consultations</p>
                  <Link href="/practitioner/dashboard/availability" className="mt-2 inline-block">
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
            <CardBody className="p-3 sm:p-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h2 className="text-sm sm:text-base font-semibold text-slate-800">Recent Reviews</h2>
                  <p className="text-xs text-slate-500 mt-0.5">What clients are saying</p>
                </div>
                <Link href="/practitioner/dashboard/reviews" className="text-xs text-emerald-600 hover:text-emerald-700 flex items-center gap-1">
                  View all
                  <ArrowRightIcon className="h-3 w-3" />
                </Link>
              </div>
              
              {recentReviews.length > 0 ? (
                <div className="space-y-2">
                  {recentReviews.map((review) => (
                    <ReviewCard key={review.id} review={review} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-6">
                  <StarIcon className="h-8 w-8 text-slate-300 mx-auto mb-2" />
                  <p className="text-xs text-slate-500">No reviews yet</p>
                  <p className="text-[9px] text-slate-400 mt-1">Reviews appear after completed consultations</p>
                </div>
              )}
            </CardBody>
          </Card>
        </div>

        {/* Right Column - Summary & Notifications */}
        <div className="space-y-4 sm:space-y-5">
          {/* Weekly Summary */}
          <Card className="border-slate-200/60 shadow-sm">
            <CardBody className="p-3 sm:p-4">
              <h2 className="text-sm sm:text-base font-semibold text-slate-800 mb-3">Weekly Summary</h2>
              <div className="space-y-2.5">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-slate-500">Completed</span>
                  <span className="text-sm font-semibold text-slate-800">{metrics?.completed_consultations || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-slate-500">Upcoming</span>
                  <span className="text-sm font-semibold text-emerald-600">{metrics?.upcoming_consultations || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-slate-500">Cancelled</span>
                  <span className="text-sm font-semibold text-rose-600">{metrics?.cancelled_consultations || 0}</span>
                </div>
                <div className="pt-2.5 mt-2 border-t border-slate-200">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-medium text-slate-600">Earnings this week</span>
                    <span className="text-sm font-bold text-emerald-600">
                      KES {(metrics?.total_earnings || 0).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center mt-1.5">
                    <span className="text-xs text-slate-500">Completion rate</span>
                    <span className="text-xs font-medium text-slate-800">{metrics?.completion_rate?.toFixed(1)}%</span>
                  </div>
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Verification Status Card */}
          <Card className="border-slate-200/60 shadow-sm bg-gradient-to-br from-emerald-50 to-emerald-50/30">
            <CardBody className="p-3 sm:p-4">
              <div className="flex items-center gap-2 mb-3">
                <div className="p-1.5 bg-emerald-100 rounded-lg">
                  <ShieldCheckIcon className="h-4 w-4 text-emerald-600" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-slate-800">Verification Status</h3>
                  <p className="text-xs text-slate-600">
                    {extendedUser?.is_verified ? 'Verified Practitioner' : 'Pending Verification'}
                  </p>
                </div>
              </div>
              
              {!extendedUser?.is_verified && hasApplication && applicationStatus && (
                <div className="mt-2 space-y-2">
                  <div className={`p-2 rounded-lg border ${
                    applicationStatus === 'pending' ? 'bg-amber-50 border-amber-200' :
                    applicationStatus === 'draft' ? 'bg-slate-50 border-slate-200' :
                    applicationStatus === 'info_needed' ? 'bg-blue-50 border-blue-200' :
                    applicationStatus === 'rejected' ? 'bg-rose-50 border-rose-200' :
                    'bg-emerald-50 border-emerald-200'
                  }`}>
                    <div className="flex items-center gap-1.5 text-xs">
                      {applicationStatus === 'pending' && (
                        <>
                          <ClockIcon className="h-3.5 w-3.5 text-amber-500" />
                          <span className="text-slate-700">Under review</span>
                        </>
                      )}
                      {applicationStatus === 'draft' && (
                        <>
                          <PencilSquareIcon className="h-3.5 w-3.5 text-slate-500" />
                          <span className="text-slate-700">Complete application</span>
                        </>
                      )}
                      {applicationStatus === 'info_needed' && (
                        <>
                          <InformationCircleIcon className="h-3.5 w-3.5 text-blue-500" />
                          <span className="text-slate-700">Info required</span>
                        </>
                      )}
                      {applicationStatus === 'rejected' && (
                        <>
                          <XCircleIcon className="h-3.5 w-3.5 text-rose-500" />
                          <span className="text-slate-700">Rejected</span>
                        </>
                      )}
                    </div>
                  </div>
                  <Link href="/practitioner/application">
                    <Button variant="outline" className="w-full text-xs border-emerald-200 text-emerald-700 hover:bg-emerald-50 py-2">
                      View Details
                      <ArrowRightIcon className="w-3 h-3 ml-1" />
                    </Button>
                  </Link>
                </div>
              )}
              
              {!hasApplication && !extendedUser?.is_verified && (
                <div className="mt-2">
                  <Link href="/practitioner/application">
                    <Button className="w-full bg-emerald-600 text-white text-xs py-2 shadow-sm">
                      <AcademicCapIcon className="w-3.5 h-3.5 mr-1.5" />
                      Start Application
                    </Button>
                  </Link>
                  <p className="text-[9px] text-slate-500 text-center mt-1.5">
                    Get verified to accept bookings
                  </p>
                </div>
              )}

              {extendedUser?.is_verified && (
                <div className="mt-2 p-2 bg-emerald-100 rounded-lg border border-emerald-200">
                  <div className="flex items-center gap-1.5 text-xs text-emerald-700">
                    <CheckCircleIcon className="h-3.5 w-3.5" />
                    <span>Verified and active</span>
                  </div>
                </div>
              )}
            </CardBody>
          </Card>
        </div>
      </div>

      {/* Mobile Scroll Hint */}
      <div className="flex justify-center mt-3 sm:hidden">
        <div className="bg-slate-100 px-2.5 py-1 rounded-full text-[9px] text-slate-500 flex items-center gap-1">
          <span className="inline-block w-1 h-1 rounded-full bg-slate-400"></span>
          Swipe for more
          <span className="inline-block w-1 h-1 rounded-full bg-slate-400"></span>
        </div>
      </div>

      {/* Custom breakpoint for extra small screens */}
      <style jsx>{`
        @media (max-width: 380px) {
          .grid-cols-2 {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }
      `}</style>
    </div>
  )
}