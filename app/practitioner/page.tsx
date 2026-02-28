'use client'

import { useAuth } from '@/app/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
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
  BriefcaseIcon
} from '@heroicons/react/24/outline'
import { Card, CardBody } from '@/app/components/ui/Card'
import { Button } from '@/app/components/ui/Buttons'
import { apiClient } from '@/app/lib/api'
import { extractResults } from '@/app/lib/utils'
import type { Consultation, PractitionerMetrics } from '@/app/types'

interface ExtendedUser {
  id: number
  email: string
  first_name?: string
  last_name?: string
  role?: string
  is_verified?: boolean
}

type StatColor = 'teal' | 'blue' | 'purple' | 'amber'

export default function PractitionerDashboardPage() {
  const { user, isAuthenticated } = useAuth()
  const router = useRouter()
  const extendedUser = user as ExtendedUser | null
  const [loading, setLoading] = useState(true)
  const [metrics, setMetrics] = useState<PractitionerMetrics | null>(null)
  const [recentConsultations, setRecentConsultations] = useState<Consultation[]>([])
  const [recentReviews, setRecentReviews] = useState<any[]>([])

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
      
      // Fetch consultations for this practitioner
      const consultationsData = await apiClient.consultations.getMyPractitionerConsultations()
      const consultations = extractResults<Consultation>(consultationsData)
      
      // Calculate metrics
      const total = consultations.length
      const upcoming = consultations.filter(c => c.status === 'booked').length
      const completed = consultations.filter(c => c.status === 'completed').length
      const cancelled = consultations.filter(c => c.status === 'cancelled').length
      
      // Calculate unique clients
      const uniqueClients = new Set(consultations.map(c => c.client)).size
      
      // Mock earnings for now (replace with actual API)
      const totalEarnings = completed * 2500 // Example rate
      const pendingEarnings = upcoming * 2500

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
      
      // Mock recent reviews (replace with actual API)
      setRecentReviews([
        {
          id: 1,
          client_name: 'Mary Wanjiku',
          rating: 5,
          comment: 'Very knowledgeable and helpful. Great session!',
          created_at: new Date(Date.now() - 2 * 86400000).toISOString()
        },
        {
          id: 2,
          client_name: 'John Omondi',
          rating: 5,
          comment: 'Excellent consultation, very thorough.',
          created_at: new Date(Date.now() - 5 * 86400000).toISOString()
        },
        {
          id: 3,
          client_name: 'Sarah Kimani',
          rating: 4,
          comment: 'Good advice, looking forward to follow-up.',
          created_at: new Date(Date.now() - 7 * 86400000).toISOString()
        }
      ])

    } catch (error) {
      console.error('Error fetching practice data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-teal-200 border-t-teal-600"></div>
          <p className="text-sm text-slate-500">Loading practice dashboard...</p>
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
      date: new Date(c.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
      type: c.duration_minutes === 60 ? 'Consultation' : 'Follow-up'
    }))

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-teal-600 mb-1">
            <SparklesIcon className="h-4 w-4" />
            <span className="text-xs font-medium uppercase tracking-wider">Practice Overview</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-light text-slate-800">
            Welcome back, <span className="font-semibold text-teal-600">Dr. {extendedUser?.first_name}</span>
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Here's what's happening with your practice
          </p>
        </div>
        <Link href="/practitioner/dashboard/availability">
          <Button className="bg-teal-600 hover:bg-teal-700 text-white shadow-sm shadow-teal-200/50">
            <ClockIcon className="h-4 w-4 mr-2" />
            Set Availability
          </Button>
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Earnings"
          value={`KES ${metrics?.total_earnings?.toLocaleString() || 0}`}
          icon={CurrencyDollarIcon}
          trend="+12%"
          color="teal"
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
          trend="+3"
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
        <h2 className="text-lg font-semibold text-slate-800 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <QuickActionCard
            href="/practitioner/dashboard/availability"
            icon={ClockIcon}
            title="Manage Hours"
            description="Set your availability"
            color="teal"
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
            href="/practitioner/dashboard/profile"
            icon={BriefcaseIcon}
            title="Profile"
            description="Update your info"
            color="amber"
          />
        </div>
      </div>

      {/* Today's Schedule */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upcoming Consultations */}
        <div className="lg:col-span-2">
          <Card className="border-slate-200/60 shadow-sm">
            <CardBody className="p-6">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h2 className="text-lg font-semibold text-slate-800">Today's Schedule</h2>
                  <p className="text-sm text-slate-500 mt-1">Your upcoming appointments</p>
                </div>
                <Link href="/practitioner/dashboard/consultations" className="text-sm text-teal-600 hover:text-teal-700 flex items-center gap-1">
                  View all
                  <ArrowRightIcon className="h-4 w-4" />
                </Link>
              </div>
              
              {upcomingConsultations.length > 0 ? (
                <div className="space-y-3">
                  {upcomingConsultations.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg hover:bg-teal-50 transition-colors border border-transparent hover:border-teal-200">
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-teal-500 rounded-full" />
                        <div>
                          <p className="text-sm font-medium text-slate-800">{item.client}</p>
                          <p className="text-xs text-slate-500">{item.type}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-slate-800">{item.time}</p>
                        <p className="text-xs text-slate-500">{item.date}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <CalendarIcon className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                  <p className="text-sm text-slate-500">No upcoming consultations</p>
                </div>
              )}
            </CardBody>
          </Card>
        </div>

        {/* Weekly Summary */}
        <div className="lg:col-span-1">
          <Card className="border-slate-200/60 shadow-sm h-full">
            <CardBody className="p-6">
              <h2 className="text-lg font-semibold text-slate-800 mb-4">Weekly Summary</h2>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-500">Completed</span>
                  <span className="font-semibold text-slate-800">{metrics?.completed_consultations || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-500">Upcoming</span>
                  <span className="font-semibold text-teal-600">{metrics?.upcoming_consultations || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-500">Cancelled</span>
                  <span className="font-semibold text-rose-600">{metrics?.cancelled_consultations || 0}</span>
                </div>
                <div className="pt-4 mt-2 border-t border-slate-200">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-slate-600">Earnings this week</span>
                    <span className="font-bold text-teal-600 text-lg">
                      KES {(metrics?.total_earnings || 0).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>

      {/* Recent Reviews */}
      <Card className="border-slate-200/60 shadow-sm">
        <CardBody className="p-6">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h2 className="text-lg font-semibold text-slate-800">Recent Reviews</h2>
              <p className="text-sm text-slate-500 mt-1">What clients are saying</p>
            </div>
            <Link href="/practitioner/dashboard/reviews" className="text-sm text-teal-600 hover:text-teal-700 flex items-center gap-1">
              View all
              <ArrowRightIcon className="h-4 w-4" />
            </Link>
          </div>
          
          <div className="space-y-4">
            {recentReviews.map((review) => (
              <div key={review.id} className="flex items-start gap-3 p-4 bg-slate-50 rounded-lg hover:bg-teal-50 transition-colors">
                <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-teal-600 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-sm">
                  {review.client_name.split(' ').map((n: string) => n[0]).join('')}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-slate-800">{review.client_name}</p>
                    <div className="flex">
                      {[1,2,3,4,5].map(star => (
                        <StarIcon 
                          key={star} 
                          className={`h-3 w-3 ${
                            star <= review.rating ? 'text-amber-400 fill-current' : 'text-slate-300'
                          }`} 
                        />
                      ))}
                    </div>
                  </div>
                  <p className="text-sm text-slate-600 mt-2">
                    "{review.comment}"
                  </p>
                  <p className="text-xs text-slate-400 mt-2">
                    {new Date(review.created_at).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardBody>
      </Card>
    </div>
  )
}

// Stat Card Component with proper typing
function StatCard({ title, value, icon: Icon, trend, subtitle, color }: { 
  title: string
  value: string | number
  icon: React.ElementType
  trend?: string
  subtitle?: string
  color: 'teal' | 'blue' | 'purple' | 'amber'  // ✅ Proper union type
}) {
  const colorClasses = {
    teal: 'bg-teal-50 text-teal-600',
    blue: 'bg-blue-50 text-blue-600',
    purple: 'bg-purple-50 text-purple-600',
    amber: 'bg-amber-50 text-amber-600',
  }

  return (
    <Card className="border-slate-200/60 shadow-sm hover:shadow-md transition-all">
      <CardBody className="p-5">
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs text-slate-500 uppercase tracking-wider">{title}</p>
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${colorClasses[color]}`}>
            <Icon className="h-4 w-4" />
          </div>
        </div>
        <p className="text-xl font-semibold text-slate-800">{value}</p>
        {trend && (
          <p className="text-xs text-teal-600 mt-1">{trend} vs last month</p>
        )}
        {subtitle && (
          <p className="text-xs text-slate-500 mt-1">{subtitle}</p>
        )}
      </CardBody>
    </Card>
  )
}

// Quick Action Card with proper typing
function QuickActionCard({ href, icon: Icon, title, description, color }: { 
  href: string
  icon: React.ElementType
  title: string
  description: string
  color: 'teal' | 'blue' | 'purple' | 'amber'  // ✅ Proper union type
}) {
  const colorClasses = {
    teal: 'bg-teal-50 text-teal-600',
    blue: 'bg-blue-50 text-blue-600',
    purple: 'bg-purple-50 text-purple-600',
    amber: 'bg-amber-50 text-amber-600',
  }

  return (
    <Link href={href}>
      <Card className="border-slate-200/60 shadow-sm hover:shadow-md hover:border-teal-200 transition-all cursor-pointer">
        <CardBody className="p-4">
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${colorClasses[color]}`}>
            <Icon className="h-5 w-5" />
          </div>
          <h3 className="text-sm font-medium text-slate-800">{title}</h3>
          <p className="text-xs text-slate-500 mt-1">{description}</p>
        </CardBody>
      </Card>
    </Link>
  )
}