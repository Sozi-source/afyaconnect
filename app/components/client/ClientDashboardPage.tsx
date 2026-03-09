'use client'

import { useState, useEffect } from 'react'
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
  ChevronRightIcon
} from '@heroicons/react/24/outline'
import { Card, CardBody } from '@/app/components/ui/Card'
import { Button } from '@/app/components/ui/Buttons'
import { apiClient } from '@/app/lib/api'
import type { Consultation } from '@/app/types'

// Add these animations to your global CSS file
const animations = `
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

export default function ClientDashboardPage() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth()
  const router = useRouter()
  const [isMounted, setIsMounted] = useState(false)
  const [consultations, setConsultations] = useState<Consultation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [greeting, setGreeting] = useState('')

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      const response = await apiClient.consultations.getMyClientConsultations()
      const consultationsArray = Array.isArray(response) ? response : 
        (response && 'results' in response ? (response as any).results : [])
      setConsultations(consultationsArray)
    } catch (error: any) {
      console.error('Error fetching dashboard data:', error)
      setError(error.message || 'Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    setIsMounted(true)
    const hour = new Date().getHours()
    if (hour < 12) setGreeting('Good morning')
    else if (hour < 18) setGreeting('Good afternoon')
    else setGreeting('Good evening')
  }, [])

  useEffect(() => {
    if (isAuthenticated && user && isMounted) {
      fetchDashboardData()
    }
  }, [isAuthenticated, user, isMounted])

  if (authLoading || !isMounted || loading) {
    return <DashboardSkeleton />
  }

  if (!isAuthenticated || !user) {
    router.push('/login')
    return null
  }

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                {greeting}, {firstName}
              </h1>
              <p className="text-slate-500 mt-1 flex items-center gap-2">
                <ShieldCheckIcon className="h-4 w-4 text-emerald-500" />
                Your health journey at a glance
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors relative">
                <BellIcon className="h-5 w-5" />
                <span className="absolute top-1 right-1 h-2 w-2 bg-rose-500 rounded-full"></span>
              </button>
              <Link href="/client/dashboard/practitioners">
                <Button className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-lg shadow-emerald-200">
                  <CalendarIcon className="h-4 w-4 mr-2" />
                  Book Consultation
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-8 bg-rose-50 border border-rose-200 rounded-2xl p-4 animate-slideDown">
            <p className="text-sm text-rose-600 flex items-center">
              <XCircleIcon className="h-5 w-5 mr-2" />
              {error}
            </p>
          </div>
        )}

        {/* Stats Grid - Fixed animation implementation */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
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
            title="Completion Rate"
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

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="overflow-hidden border-none shadow-xl shadow-slate-200/50">
              <div className="bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-white flex items-center">
                    <VideoCameraIcon className="h-5 w-5 mr-2" />
                    Upcoming Consultations
                  </h2>
                  {upcomingConsultations.length > 0 && (
                    <Link 
                      href="/client/dashboard/consultations" 
                      className="text-white/90 hover:text-white text-sm flex items-center gap-1 transition-colors"
                    >
                      View all <ArrowRightIcon className="h-4 w-4" />
                    </Link>
                  )}
                </div>
              </div>
              
              <CardBody className="p-6">
                {upcomingConsultations.length > 0 ? (
                  <div className="space-y-4">
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
                    description="Ready to start your health journey? Book your first consultation today."
                    icon={CalendarIcon}
                    action={{ label: "Find Practitioners", href: "/client/dashboard/practitioners" }}
                  />
                )}
              </CardBody>
            </Card>

            {/* Recent Activity */}
            <Card className="border-none shadow-xl shadow-slate-200/50">
              <CardBody className="p-6">
                <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center">
                  <ClockIcon className="h-5 w-5 mr-2 text-emerald-600" />
                  Recent Activity
                </h2>
                {recentActivity.length > 0 ? (
                  <div className="space-y-3">
                    {recentActivity.map((activity, index) => (
                      <ActivityItem key={activity.id} activity={activity} index={index} />
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-500 text-center py-8">No recent activity</p>
                )}
              </CardBody>
            </Card>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card className="border-none shadow-xl shadow-slate-200/50 bg-gradient-to-br from-slate-800 to-slate-900">
              <CardBody className="p-6">
                <h2 className="text-lg font-semibold text-white mb-4">Quick Actions</h2>
                <div className="space-y-3">
                  <QuickActionButton
                    href="/client/dashboard/practitioners"
                    icon={UserGroupIcon}
                    color="from-blue-500 to-blue-600"
                    title="Find Practitioners"
                    description="Browse available specialists"
                  />
                  <QuickActionButton
                    href="/client/dashboard/consultations"
                    icon={CalendarIcon}
                    color="from-emerald-500 to-emerald-600"
                    title="View Consultations"
                    description="Check your appointment history"
                  />
                  <QuickActionButton
                    href="/client/dashboard/messages"
                    icon={ChatBubbleLeftRightIcon}
                    color="from-purple-500 to-purple-600"
                    title="Messages"
                    description="Chat with your practitioner"
                  />
                </div>
              </CardBody>
            </Card>

            {/* Health Insights */}
            <Card className="border-none shadow-xl shadow-slate-200/50">
              <CardBody className="p-6">
                <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center">
                  <StarIcon className="h-5 w-5 mr-2 text-amber-500" />
                  Health Insights
                </h2>
                <div className="space-y-4">
                  <InsightCard
                    title="Consultation Frequency"
                    value={`${stats.total} total`}
                    trend={stats.total > 5 ? 'increasing' : 'steady'}
                    description="You're on track with your health goals"
                  />
                  <InsightCard
                    title="Completion Rate"
                    value={`${stats.completionRate}%`}
                    trend={stats.completionRate > 70 ? 'positive' : 'neutral'}
                    description={stats.completionRate > 70 ? "Excellent follow-through!" : "Keep up the good work"}
                  />
                </div>
              </CardBody>
            </Card>

            {/* Recommended Practitioners */}
            <Card className="border-none shadow-xl shadow-slate-200/50 bg-gradient-to-br from-amber-50 to-orange-50">
              <CardBody className="p-6">
                <h2 className="text-lg font-semibold text-slate-800 mb-3">Recommended for You</h2>
                <p className="text-sm text-slate-600 mb-4">Based on your consultation history</p>
                <Button 
                  variant="outline" 
                  fullWidth 
                  className="border-amber-200 text-amber-700 hover:bg-amber-50"
                >
                  View Recommendations
                </Button>
              </CardBody>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

// Fixed Stat Card - removed style prop from Card component
function StatCard({ title, value, icon: Icon, gradient, delay }: { 
  title: string; 
  value: string | number; 
  icon: any; 
  gradient: string;
  delay: number;
}) {
  return (
    <div 
      className="animate-fadeIn"
      style={{ animationDelay: `${delay}ms` }}
    >
      <Card className="border-none shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
        <CardBody className="p-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">{title}</p>
            <div className={`p-2.5 rounded-xl bg-gradient-to-br ${gradient} shadow-lg`}>
              <Icon className="h-4 w-4 text-white" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-800">{value}</p>
          <div className="mt-2 h-1 w-full bg-slate-100 rounded-full overflow-hidden">
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

// Upcoming Consultation Card
function UpcomingConsultationCard({ consultation, index }: { consultation: Consultation; index: number }) {
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
      <div className="relative p-4 bg-gradient-to-r from-slate-50 to-white rounded-xl border border-slate-100 hover:border-emerald-200 hover:shadow-md transition-all duration-300">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0">
            <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center text-white font-bold shadow-lg">
              {date.getDate()}
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-slate-800 group-hover:text-emerald-600 transition-colors">
              Dr. {consultation.practitioner_name || 'Practitioner'}
            </p>
            <p className="text-sm text-slate-500 mt-1">
              {formattedDate} • {consultation.time?.slice(0,5)}
            </p>
            <div className="flex items-center gap-2 mt-2">
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
                <VideoCameraIcon className="h-3 w-3 mr-1" />
                Video Call
              </span>
            </div>
          </div>
          <ChevronRightIcon className="h-5 w-5 text-slate-400 group-hover:text-emerald-500 group-hover:translate-x-1 transition-all" />
        </div>
      </div>
    </Link>
  )
}

// Activity Item
function ActivityItem({ activity, index }: { activity: Consultation; index: number }) {
  const statusColors = {
    booked: 'bg-blue-100 text-blue-700',
    completed: 'bg-emerald-100 text-emerald-700',
    cancelled: 'bg-rose-100 text-rose-700',
    no_show: 'bg-amber-100 text-amber-700',
  }

  const statusColor = statusColors[activity.status as keyof typeof statusColors] || 'bg-slate-100 text-slate-700'

  return (
    <div 
      className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors animate-fadeIn"
      style={{ animationDelay: `${index * 50}ms` }}
    >
      <div className={`p-2 rounded-lg ${statusColor.split(' ')[0]}`}>
        <CalendarIcon className="h-4 w-4" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-slate-800">
          Consultation with Dr. {activity.practitioner_name || 'Practitioner'}
        </p>
        <p className="text-xs text-slate-500">
          {new Date(activity.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
        </p>
      </div>
      <span className={`text-xs px-2 py-1 rounded-full font-medium ${statusColor}`}>
        {activity.status.replace('_', ' ')}
      </span>
    </div>
  )
}

// Quick Action Button
function QuickActionButton({ href, icon: Icon, color, title, description }: {
  href: string;
  icon: any;
  color: string;
  title: string;
  description: string;
}) {
  return (
    <Link href={href}>
      <div className="group cursor-pointer">
        <div className="flex items-center gap-3 p-3 rounded-xl bg-white/10 hover:bg-white/20 transition-all duration-300">
          <div className={`p-2.5 rounded-lg bg-gradient-to-br ${color} shadow-lg`}>
            <Icon className="h-5 w-5 text-white" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-white">{title}</p>
            <p className="text-xs text-slate-300">{description}</p>
          </div>
          <ChevronRightIcon className="h-4 w-4 text-slate-400 group-hover:text-white group-hover:translate-x-1 transition-all" />
        </div>
      </div>
    </Link>
  )
}

// Insight Card
function InsightCard({ title, value, trend, description }: {
  title: string;
  value: string;
  trend: 'positive' | 'increasing' | 'steady' | 'neutral';
  description: string;
}) {
  const trendColors = {
    positive: 'text-emerald-600',
    increasing: 'text-blue-600',
    steady: 'text-amber-600',
    neutral: 'text-slate-600',
  }

  return (
    <div className="p-4 bg-slate-50 rounded-xl">
      <p className="text-xs text-slate-500 mb-1">{title}</p>
      <p className="text-xl font-bold text-slate-800 mb-1">{value}</p>
      <p className={`text-xs ${trendColors[trend]}`}>{description}</p>
    </div>
  )
}

// Empty State
function EmptyState({ title, description, icon: Icon, action }: { 
  title: string; 
  description: string; 
  icon: any; 
  action?: { label: string; href: string } 
}) {
  return (
    <div className="text-center py-12">
      <div className="bg-gradient-to-br from-slate-50 to-white rounded-2xl p-4 w-20 h-20 mx-auto mb-4 flex items-center justify-center shadow-inner">
        <Icon className="h-8 w-8 text-slate-400" />
      </div>
      <h3 className="text-sm font-semibold text-slate-800 mb-2">{title}</h3>
      <p className="text-sm text-slate-500 mb-6 max-w-xs mx-auto">{description}</p>
      {action && (
        <Link href={action.href}>
          <Button className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-lg shadow-emerald-200">
            {action.label}
          </Button>
        </Link>
      )}
    </div>
  )
}

// Loading Skeleton
function DashboardSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Skeleton */}
        <div className="mb-8 animate-pulse">
          <div className="h-8 w-64 bg-slate-200 rounded-lg mb-2"></div>
          <div className="h-4 w-48 bg-slate-200 rounded-lg"></div>
        </div>

        {/* Stats Grid Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          {[...Array(5)].map((_, i) => (
            <Card key={i} className="border-none">
              <CardBody className="p-5">
                <div className="h-16 bg-slate-200 rounded-lg animate-pulse"></div>
              </CardBody>
            </Card>
          ))}
        </div>

        {/* Main Content Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Card className="border-none">
              <CardBody className="p-6">
                <div className="h-6 w-48 bg-slate-200 rounded mb-4"></div>
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-20 bg-slate-100 rounded-xl mb-3 animate-pulse"></div>
                ))}
              </CardBody>
            </Card>
          </div>
          <div className="space-y-6">
            <Card className="border-none">
              <CardBody className="p-6">
                <div className="h-6 w-32 bg-slate-200 rounded mb-4"></div>
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-16 bg-slate-100 rounded-xl mb-3 animate-pulse"></div>
                ))}
              </CardBody>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}