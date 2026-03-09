// app/components/client/ClientDashboardPage.tsx
'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/app/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  CalendarIcon,
  ClockIcon,
  UserGroupIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowRightIcon,
  VideoCameraIcon,
  DocumentTextIcon,
  BellIcon,
  StarIcon,
  ChartBarIcon,
  ShieldCheckIcon,
  ChatBubbleLeftRightIcon,
  ChevronRightIcon,
  PhoneIcon,
  EnvelopeIcon,
  MapPinIcon
} from '@heroicons/react/24/outline'
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid'
import { Card, CardBody } from '@/app/components/ui/Card'
import { Button } from '@/app/components/ui/Buttons'
import { apiClient } from '@/app/lib/api'
import type { Consultation } from '@/app/types'

// =============================================
// TYPES
// =============================================
interface StatCardProps {
  title: string
  value: string | number
  icon: React.ComponentType<{ className?: string }>
  gradient: string
  delay: number
}

interface UpcomingConsultationCardProps {
  consultation: Consultation
  index: number
}

interface ActivityItemProps {
  activity: Consultation
  index: number
}

interface QuickActionButtonProps {
  href: string
  icon: React.ComponentType<{ className?: string }>
  color: string
  title: string
  description: string
}

interface InsightCardProps {
  title: string
  value: string
  trend: 'positive' | 'increasing' | 'steady' | 'neutral'
  description: string
}

interface EmptyStateProps {
  title: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  action?: { label: string; href: string }
}

// =============================================
// MAIN COMPONENT
// =============================================
export default function ClientDashboardPage() {
  // 1. ALL HOOKS FIRST - UNCONDITIONALLY
  const { user, isAuthenticated, isLoading: authLoading } = useAuth()
  const router = useRouter()
  const [isMounted, setIsMounted] = useState(false)
  const [consultations, setConsultations] = useState<Consultation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [greeting, setGreeting] = useState('')
  const [notifications, setNotifications] = useState(3)

  // Memoized fetch function
  const fetchDashboardData = useCallback(async () => {
    if (!isAuthenticated || !user) return
    
    try {
      setLoading(true)
      const response = await apiClient.consultations.getMyClientConsultations()
      const consultationsArray = Array.isArray(response) ? response : 
        (response && 'results' in response ? (response as any).results : [])
      setConsultations(consultationsArray)
      setError(null)
    } catch (error: any) {
      console.error('Error fetching dashboard data:', error)
      setError(error.message || 'Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }, [isAuthenticated, user])

  // Mount effect
  useEffect(() => {
    setIsMounted(true)
    const hour = new Date().getHours()
    if (hour < 12) setGreeting('Good morning')
    else if (hour < 18) setGreeting('Good afternoon')
    else setGreeting('Good evening')
  }, [])

  // Data fetching effect
  useEffect(() => {
    if (isMounted && isAuthenticated && user) {
      fetchDashboardData()
    }
  }, [isMounted, isAuthenticated, user, fetchDashboardData])

  // Redirect effect
  useEffect(() => {
    if (isMounted && !authLoading && !isAuthenticated) {
      router.push('/login')
    }
  }, [isMounted, authLoading, isAuthenticated, router])

  // 2. EARLY RETURNS (after all hooks)
  if (authLoading || !isMounted) {
    return <DashboardSkeleton />
  }

  if (!isAuthenticated || !user) {
    return null
  }

  if (loading) {
    return <DashboardSkeleton />
  }

  // 3. DERIVED DATA
  const firstName = user?.first_name || user?.email?.split('@')[0] || 'User'
  const safeConsultations = Array.isArray(consultations) ? consultations : []
  
  const stats = {
    total: safeConsultations.length,
    upcoming: safeConsultations.filter(c => c.status === 'booked').length,
    completed: safeConsultations.filter(c => c.status === 'completed').length,
    cancelled: safeConsultations.filter(c => c.status === 'cancelled' || c.status === 'no_show').length,
    completionRate: safeConsultations.length > 0 
      ? Math.round((safeConsultations.filter(c => c.status === 'completed').length / safeConsultations.length) * 100)
      : 0
  }

  const upcomingConsultations = safeConsultations
    .filter(c => c.status === 'booked')
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 3)

  const recentActivity = safeConsultations
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5)

  // 4. RENDER
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      {/* Header - Responsive */}
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-200/60 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            {/* Greeting Section */}
            <div className="flex-1">
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-800">
                <span className="text-slate-500">{greeting}</span>,{' '}
                <span className="text-yellow-600">{firstName}</span>
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5 sm:mt-1 flex items-center gap-1.5">
                <ShieldCheckIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-emerald-500" />
                <span className="truncate">
                  {new Date().toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </span>
              </p>
            </div>

            {/* Action Buttons - Responsive */}
            <div className="flex items-center justify-end gap-2 sm:gap-3">
              {/* Messages - Hidden on smallest screens, shown on sm+ */}
              <Link href="/client/dashboard/messages" className="hidden xs:block">
                <button className="relative p-2 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-full transition-all">
                  <ChatBubbleLeftRightIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                  {notifications > 0 && (
                    <span className="absolute -top-1 -right-1 h-3.5 w-3.5 sm:h-4 sm:w-4 bg-emerald-500 text-white text-[10px] sm:text-xs rounded-full flex items-center justify-center">
                      {notifications}
                    </span>
                  )}
                </button>
              </Link>

              {/* Settings - Always visible */}
              <Link href="/client/dashboard/settings">
                <button className="p-2 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-full transition-all">
                  <BellIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                </button>
              </Link>

              {/* Book Button - Responsive text */}
              <Link href="/client/dashboard/practitioners">
                <Button className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-lg shadow-emerald-200/50 transition-all hover:scale-105 px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm">
                  <CalendarIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" />
                  <span className="hidden xs:inline">Book Consultation</span>
                  <span className="xs:hidden">Book</span>
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6 lg:py-8">
        {/* Error Banner */}
        {error && (
          <div className="mb-4 sm:mb-6 lg:mb-8 bg-rose-50 border border-rose-200 rounded-xl sm:rounded-2xl p-3 sm:p-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <p className="text-xs sm:text-sm text-rose-600 flex items-center">
                <XCircleIcon className="h-4 w-4 sm:h-5 sm:w-5 mr-2 flex-shrink-0" />
                <span className="truncate">{error}</span>
              </p>
              <button 
                onClick={fetchDashboardData}
                className="text-xs sm:text-sm text-rose-600 hover:text-rose-700 font-medium self-end sm:self-auto"
              >
                Try again
              </button>
            </div>
          </div>
        )}

        {/* Stats Grid - Responsive: 2 cols on mobile, 5 on desktop */}
        <section className="mb-6 sm:mb-8">
          <h2 className="sr-only">Statistics Overview</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
            <StatCard
              title="Total"
              value={stats.total}
              icon={DocumentTextIcon}
              gradient="from-blue-600 to-blue-400"
              delay={0}
            />
            <StatCard
              title="Upcoming"
              value={stats.upcoming}
              icon={ClockIcon}
              gradient="from-emerald-600 to-teal-400"
              delay={100}
            />
            <StatCard
              title="Completed"
              value={stats.completed}
              icon={CheckCircleIcon}
              gradient="from-purple-600 to-pink-400"
              delay={200}
            />
            <StatCard
              title="Rate"
              value={`${stats.completionRate}%`}
              icon={ChartBarIcon}
              gradient="from-amber-500 to-orange-400"
              delay={300}
            />
            <StatCard
              title="Cancelled"
              value={stats.cancelled}
              icon={XCircleIcon}
              gradient="from-rose-600 to-red-400"
              delay={400}
            />
          </div>
        </section>

        {/* Main Content Grid - Responsive */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6 sm:space-y-8">
            {/* Upcoming Consultations Card */}
            <Card className="overflow-hidden border-none shadow-lg sm:shadow-xl">
              <div className="bg-gradient-to-r from-emerald-600 to-teal-600 px-4 sm:px-6 py-3 sm:py-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm sm:text-base lg:text-lg font-semibold text-white flex items-center">
                    <VideoCameraIcon className="h-4 w-4 sm:h-5 sm:w-5 mr-1.5 sm:mr-2" />
                    <span className="truncate">Upcoming</span>
                  </h2>
                  {upcomingConsultations.length > 0 && (
                    <Link 
                      href="/client/dashboard/consultations" 
                      className="text-white/90 hover:text-white text-xs sm:text-sm flex items-center gap-1"
                    >
                      <span className="hidden xs:inline">View all</span>
                      <ArrowRightIcon className="h-3 w-3 sm:h-4 sm:w-4" />
                    </Link>
                  )}
                </div>
              </div>
              
              <CardBody className="p-4 sm:p-6">
                {upcomingConsultations.length > 0 ? (
                  <div className="space-y-3 sm:space-y-4">
                    {upcomingConsultations.map((consultation, index) => (
                      <UpcomingConsultationCard 
                        key={consultation.id} 
                        consultation={consultation} 
                        index={index}
                      />
                    ))}
                  </div>
                ) : (
                  <EmptyState
                    title="No upcoming consultations"
                    description="Book your first consultation today."
                    icon={CalendarIcon}
                    action={{ label: "Find Practitioners", href: "/client/dashboard/practitioners" }}
                  />
                )}
              </CardBody>
            </Card>

            {/* Recent Activity Card */}
            <Card className="border-none shadow-lg sm:shadow-xl">
              <CardBody className="p-4 sm:p-6">
                <h2 className="text-sm sm:text-base lg:text-lg font-semibold text-slate-800 mb-3 sm:mb-4 flex items-center">
                  <ClockIcon className="h-4 w-4 sm:h-5 sm:w-5 mr-1.5 sm:mr-2 text-emerald-600" />
                  Recent Activity
                </h2>
                {recentActivity.length > 0 ? (
                  <div className="space-y-2 sm:space-y-3">
                    {recentActivity.map((activity, index) => (
                      <ActivityItem key={activity.id} activity={activity} index={index} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 sm:py-8">
                    <p className="text-xs sm:text-sm text-slate-500">No recent activity</p>
                  </div>
                )}
              </CardBody>
            </Card>
          </div>

          {/* Right Column */}
          <div className="space-y-6 sm:space-y-8">
            {/* Quick Actions Card */}
            <Card className="border-none shadow-lg sm:shadow-xl bg-gradient-to-br from-slate-800 to-slate-900">
              <CardBody className="p-4 sm:p-6">
                <h2 className="text-sm sm:text-base lg:text-lg font-semibold text-white mb-3 sm:mb-4">
                  Quick Actions
                </h2>
                <div className="space-y-2 sm:space-y-3">
                  <QuickActionButton
                    href="/client/dashboard/practitioners"
                    icon={UserGroupIcon}
                    color="from-blue-500 to-blue-600"
                    title="Find Experts"
                    description="Browse specialists"
                  />
                  <QuickActionButton
                    href="/client/dashboard/consultations"
                    icon={CalendarIcon}
                    color="from-emerald-500 to-emerald-600"
                    title="Consultations"
                    description="View history"
                  />
                  <QuickActionButton
                    href="/client/dashboard/messages"
                    icon={ChatBubbleLeftRightIcon}
                    color="from-purple-500 to-purple-600"
                    title="Messages"
                    description="Chat with practitioners"
                  />
                </div>
              </CardBody>
            </Card>

            {/* Health Insights Card */}
            <Card className="border-none shadow-lg sm:shadow-xl">
              <CardBody className="p-4 sm:p-6">
                <h2 className="text-sm sm:text-base lg:text-lg font-semibold text-slate-800 mb-3 sm:mb-4 flex items-center">
                  <StarIcon className="h-4 w-4 sm:h-5 sm:w-5 mr-1.5 sm:mr-2 text-amber-500" />
                  Insights
                </h2>
                <div className="space-y-3 sm:space-y-4">
                  <InsightCard
                    title="Consultation Frequency"
                    value={`${stats.total} total`}
                    trend={stats.total > 5 ? 'increasing' : 'steady'}
                    description="On track with goals"
                  />
                  <InsightCard
                    title="Completion Rate"
                    value={`${stats.completionRate}%`}
                    trend={stats.completionRate > 70 ? 'positive' : 'neutral'}
                    description={stats.completionRate > 70 ? "Excellent!" : "Keep it up"}
                  />
                </div>
              </CardBody>
            </Card>

            {/* Recommended Card */}
            <Card className="border-none shadow-lg sm:shadow-xl bg-gradient-to-br from-amber-50 to-orange-50">
              <CardBody className="p-4 sm:p-6">
                <h2 className="text-sm sm:text-base lg:text-lg font-semibold text-slate-800 mb-2">
                  Recommended
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 mb-3 sm:mb-4">
                  Based on your history
                </p>
                <div className="space-y-3">
                  <div className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 bg-white/60 rounded-lg sm:rounded-xl">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-full flex items-center justify-center text-white font-bold text-xs sm:text-sm">
                      DR
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs sm:text-sm font-medium text-slate-800 truncate">Dr. Sarah Johnson</p>
                      <p className="text-[10px] sm:text-xs text-slate-500 truncate">Cardiologist • 4.9 ⭐</p>
                    </div>
                    <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs px-2 sm:px-3 py-1">
                      Book
                    </Button>
                  </div>
                  <Button 
                    variant="outline" 
                    fullWidth 
                    className="border-amber-200 text-amber-700 hover:bg-amber-50 text-xs sm:text-sm py-2"
                  >
                    View All
                  </Button>
                </div>
              </CardBody>
            </Card>
          </div>
        </div>

        {/* Mobile Scroll Hint */}
        <div className="flex justify-center mt-4 sm:hidden">
          <div className="bg-slate-100 px-3 py-1.5 rounded-full text-[10px] text-slate-500 flex items-center gap-1.5">
            <span className="inline-block w-1 h-1 rounded-full bg-slate-400"></span>
            Scroll for more
            <span className="inline-block w-1 h-1 rounded-full bg-slate-400"></span>
          </div>
        </div>
      </main>
    </div>
  )
}

// =============================================
// HELPER COMPONENTS - Responsive versions
// =============================================

function StatCard({ title, value, icon: Icon, gradient, delay }: StatCardProps) {
  return (
    <div 
      className="animate-fadeIn"
      style={{ animationDelay: `${delay}ms` }}
    >
      <Card className="border-none shadow hover:shadow-md transition-all">
        <CardBody className="p-3 sm:p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-[10px] sm:text-xs font-medium text-slate-500 uppercase tracking-wider">{title}</p>
            <div className={`p-1.5 sm:p-2 rounded-lg bg-gradient-to-br ${gradient} shadow`}>
              <Icon className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
            </div>
          </div>
          <p className="text-base sm:text-lg lg:text-xl font-bold text-slate-800">{value}</p>
          <div className="mt-1 sm:mt-2 h-1 w-full bg-slate-100 rounded-full overflow-hidden">
            <div 
              className={`h-full bg-gradient-to-r ${gradient} rounded-full transition-all duration-1000`}
              style={{ width: typeof value === 'number' ? `${Math.min(100, value)}%` : '100%' }}
            />
          </div>
        </CardBody>
      </Card>
    </div>
  )
}

function UpcomingConsultationCard({ consultation, index }: UpcomingConsultationCardProps) {
  const date = new Date(consultation.date)
  const formattedDate = date.toLocaleDateString('en-US', { 
    weekday: 'short',
    month: 'short', 
    day: 'numeric'
  })

  return (
    <Link 
      href={`/client/dashboard/consultations/${consultation.id}`}
      className="block group animate-slideUp"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <div className="p-3 sm:p-4 bg-gradient-to-r from-slate-50 to-white rounded-lg sm:rounded-xl border border-slate-100 hover:border-emerald-200 hover:shadow transition-all">
        <div className="flex items-start gap-3 sm:gap-4">
          <div className="flex-shrink-0">
            <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-lg sm:rounded-xl flex flex-col items-center justify-center text-white font-bold shadow">
              <span className="text-[10px] sm:text-xs">{date.toLocaleString('default', { month: 'short' })}</span>
              <span className="text-sm sm:text-base leading-tight">{date.getDate()}</span>
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs sm:text-sm font-semibold text-slate-800 group-hover:text-emerald-600 truncate">
              Dr. {consultation.practitioner_name || 'Practitioner'}
            </p>
            <p className="text-[10px] sm:text-xs text-slate-500 mt-1 flex items-center gap-1">
              <ClockIcon className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
              {formattedDate} • {consultation.time?.slice(0,5)}
            </p>
            <div className="flex items-center gap-1 mt-1.5">
              <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[8px] sm:text-xs font-medium bg-blue-50 text-blue-700">
                <VideoCameraIcon className="h-2 w-2 sm:h-3 sm:w-3 mr-0.5" />
                <span className="hidden xs:inline">Video</span>
              </span>
              <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[8px] sm:text-xs font-medium border bg-slate-50 text-slate-700">
                {consultation.status.replace('_', ' ')}
              </span>
            </div>
          </div>
          <ChevronRightIcon className="h-4 w-4 sm:h-5 sm:w-5 text-slate-400 group-hover:text-emerald-500 flex-shrink-0" />
        </div>
      </div>
    </Link>
  )
}

function ActivityItem({ activity, index }: ActivityItemProps) {
  const statusColors: Record<string, string> = {
    booked: 'bg-blue-100 text-blue-700',
    completed: 'bg-emerald-100 text-emerald-700',
    cancelled: 'bg-rose-100 text-rose-700',
    no_show: 'bg-amber-100 text-amber-700',
  }

  const statusColor = statusColors[activity.status] || 'bg-slate-100 text-slate-700'

  return (
    <div 
      className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 rounded-lg sm:rounded-xl hover:bg-slate-50 transition-colors animate-fadeIn"
      style={{ animationDelay: `${index * 50}ms` }}
    >
      <div className={`p-1.5 sm:p-2 rounded-lg ${statusColor.split(' ')[0]}`}>
        <CalendarIcon className="h-3 w-3 sm:h-4 sm:w-4" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs sm:text-sm font-medium text-slate-800 truncate">
          Dr. {activity.practitioner_name || 'Practitioner'}
        </p>
        <p className="text-[10px] sm:text-xs text-slate-500">
          {new Date(activity.date).toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric'
          })}
        </p>
      </div>
      <span className={`text-[8px] sm:text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full font-medium ${statusColor}`}>
        {activity.status.replace('_', ' ')}
      </span>
    </div>
  )
}

function QuickActionButton({ href, icon: Icon, color, title, description }: QuickActionButtonProps) {
  return (
    <Link href={href}>
      <div className="group cursor-pointer">
        <div className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 rounded-lg sm:rounded-xl bg-white/10 hover:bg-white/20 transition-all">
          <div className={`p-1.5 sm:p-2 rounded-lg bg-gradient-to-br ${color} shadow`}>
            <Icon className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs sm:text-sm font-medium text-white">{title}</p>
            <p className="text-[10px] sm:text-xs text-slate-300 truncate">{description}</p>
          </div>
          <ChevronRightIcon className="h-3 w-3 sm:h-4 sm:w-4 text-slate-400 group-hover:text-white" />
        </div>
      </div>
    </Link>
  )
}

function InsightCard({ title, value, trend, description }: InsightCardProps) {
  const trendColors = {
    positive: 'text-emerald-600',
    increasing: 'text-blue-600',
    steady: 'text-amber-600',
    neutral: 'text-slate-600',
  }

  return (
    <div className="p-3 sm:p-4 bg-slate-50 rounded-lg sm:rounded-xl hover:bg-slate-100 transition-colors">
      <p className="text-[10px] sm:text-xs text-slate-500 mb-1">{title}</p>
      <p className="text-base sm:text-lg font-bold text-slate-800 mb-1">{value}</p>
      <p className={`text-[8px] sm:text-xs ${trendColors[trend]}`}>{description}</p>
    </div>
  )
}

function EmptyState({ title, description, icon: Icon, action }: EmptyStateProps) {
  return (
    <div className="text-center py-8 sm:py-12">
      <div className="bg-gradient-to-br from-slate-50 to-white rounded-xl sm:rounded-2xl p-3 sm:p-4 w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-3 sm:mb-4 flex items-center justify-center shadow-inner">
        <Icon className="h-6 w-6 sm:h-8 sm:w-8 text-slate-400" />
      </div>
      <h3 className="text-xs sm:text-sm font-semibold text-slate-800 mb-1 sm:mb-2">{title}</h3>
      <p className="text-[10px] sm:text-xs text-slate-500 mb-4 sm:mb-6 max-w-xs mx-auto px-2">{description}</p>
      {action && (
        <Link href={action.href}>
          <Button className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-lg text-xs sm:text-sm px-4 sm:px-6 py-2">
            {action.label}
          </Button>
        </Link>
      )}
    </div>
  )
}

function DashboardSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6 lg:py-8">
        {/* Header Skeleton */}
        <div className="mb-6 sm:mb-8 animate-pulse">
          <div className="h-6 sm:h-8 w-48 sm:w-64 bg-slate-200 rounded mb-2"></div>
          <div className="h-3 sm:h-4 w-36 sm:w-48 bg-slate-200 rounded"></div>
        </div>

        {/* Stats Grid Skeleton */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 mb-6 sm:mb-8">
          {[...Array(5)].map((_, i) => (
            <Card key={i} className="border-none">
              <CardBody className="p-3 sm:p-4">
                <div className="h-12 sm:h-16 bg-slate-200 rounded animate-pulse"></div>
              </CardBody>
            </Card>
          ))}
        </div>

        {/* Main Content Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Card className="border-none">
              <CardBody className="p-4 sm:p-6">
                <div className="h-5 sm:h-6 w-32 sm:w-48 bg-slate-200 rounded mb-4"></div>
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-16 sm:h-20 bg-slate-100 rounded-lg sm:rounded-xl mb-3 animate-pulse"></div>
                ))}
              </CardBody>
            </Card>
          </div>
          <div className="space-y-6">
            <Card className="border-none">
              <CardBody className="p-4 sm:p-6">
                <div className="h-5 sm:h-6 w-24 sm:w-32 bg-slate-200 rounded mb-4"></div>
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-14 sm:h-16 bg-slate-100 rounded-lg sm:rounded-xl mb-3 animate-pulse"></div>
                ))}
              </CardBody>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

// Add these styles to your global CSS file
const styles = `
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes slideUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes slideDown {
  from { opacity: 0; transform: translateY(-20px); }
  to { opacity: 1; transform: translateY(0); }
}

.animate-fadeIn {
  animation: fadeIn 0.5s ease-out forwards;
  opacity: 0;
}

.animate-slideUp {
  animation: slideUp 0.5s ease-out forwards;
  opacity: 0;
}

.animate-slideDown {
  animation: slideDown 0.3s ease-out forwards;
}
`