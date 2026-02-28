// app/client/dashboard/metrics/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/app/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  ChartBarIcon,
  CalendarIcon,
  ClockIcon,
  UserGroupIcon,
  StarIcon,
  CurrencyDollarIcon,
  ArrowLeftIcon,
  CheckCircleIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline'
import { Card, CardBody, CardHeader } from '@/app/components/ui/Card'
import { Button } from '@/app/components/ui/Buttons'
import { apiClient } from '@/app/lib/api'
import type { Consultation, ClientMetrics } from '@/app/types'
import { TrendingDownIcon, TrendingUpIcon } from 'lucide-react'

export default function ClientMetricsPage() {
  const { user, isAuthenticated, isLoading } = useAuth()
  const router = useRouter()
  const [metrics, setMetrics] = useState<ClientMetrics | null>(null)
  const [recentActivity, setRecentActivity] = useState<Consultation[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login')
      return
    }

    if (!isLoading && user?.role !== 'client') {
      router.push('/practitioner/dashboard')
      return
    }

    if (isAuthenticated) {
      fetchMetrics()
    }
  }, [isLoading, isAuthenticated, user, router])

  const fetchMetrics = async () => {
    setLoading(true)
    try {
      const consultations = await apiClient.consultations.getMyClientConsultations()
      
      const completed = consultations.filter(c => c.status === 'completed')
      const upcoming = consultations.filter(c => c.status === 'booked')
      const cancelled = consultations.filter(c => c.status === 'cancelled')
      
      const totalSpent = completed.reduce((sum, c) => sum + (c.price || 500), 0)
      const pendingReviews = completed.filter(c => !c.has_review).length

      const clientMetrics: ClientMetrics = {
        total_consultations: consultations.length,
        completed_consultations: completed.length,
        upcoming_consultations: upcoming.length,
        cancelled_consultations: cancelled.length,
        total_spent: totalSpent,
        pending_reviews: pendingReviews
      }

      setMetrics(clientMetrics)
      setRecentActivity(consultations.slice(0, 5))
      
    } catch (error) {
      console.error('Error fetching metrics:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'booked': return 'bg-blue-50 text-blue-700'
      case 'completed': return 'bg-green-50 text-green-700'
      case 'cancelled': return 'bg-red-50 text-red-700'
      default: return 'bg-neutral-100 text-neutral-700'
    }
  }

  if (isLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-200 border-t-primary-600"></div>
      </div>
    )
  }

  if (!isAuthenticated || user?.role !== 'client') {
    return null
  }

  const completionRate = metrics?.total_consultations 
    ? Math.round((metrics.completed_consultations / metrics.total_consultations) * 100)
    : 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/client/dashboard">
          <Button variant="outline" size="sm" className="!p-2 border-neutral-200">
            <ArrowLeftIcon className="h-5 w-5 text-neutral-600" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Your Health Metrics</h1>
          <p className="text-neutral-500 mt-1">Track your consultation history and progress</p>
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Consultations"
          value={metrics?.total_consultations || 0}
          icon={CalendarIcon}
          color="blue"
        />
        <MetricCard
          title="Completed"
          value={metrics?.completed_consultations || 0}
          icon={CheckCircleIcon}
          color="green"
        />
        <MetricCard
          title="Upcoming"
          value={metrics?.upcoming_consultations || 0}
          icon={ClockIcon}
          color="purple"
        />
        <MetricCard
          title="Total Spent"
          value={`KES ${metrics?.total_spent?.toLocaleString() || 0}`}
          icon={CurrencyDollarIcon}
          color="emerald"
        />
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-neutral-200">
          <CardBody className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-500">Completion Rate</p>
                <p className="text-3xl font-bold text-neutral-900 mt-2">{completionRate}%</p>
              </div>
              <div className="p-3 bg-emerald-50 rounded-xl">
                <TrendingUpIcon className="h-6 w-6 text-emerald-600" />
              </div>
            </div>
          </CardBody>
        </Card>

        <Card className="border-neutral-200">
          <CardBody className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-500">Cancelled</p>
                <p className="text-3xl font-bold text-neutral-900 mt-2">{metrics?.cancelled_consultations || 0}</p>
              </div>
              <div className="p-3 bg-red-50 rounded-xl">
                <TrendingDownIcon className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </CardBody>
        </Card>

        <Card className="border-neutral-200">
          <CardBody className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-500">Pending Reviews</p>
                <p className="text-3xl font-bold text-neutral-900 mt-2">{metrics?.pending_reviews || 0}</p>
              </div>
              <div className="p-3 bg-amber-50 rounded-xl">
                <StarIcon className="h-6 w-6 text-amber-600" />
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card className="border-neutral-200">
        <CardHeader>
          <h3 className="text-lg font-semibold text-neutral-900">Recent Activity</h3>
        </CardHeader>
        <CardBody className="p-4">
          {recentActivity.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-neutral-500">No recent activity</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentActivity.map((activity, index) => (
                <motion.div
                  key={activity.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-center justify-between p-4 bg-neutral-50 rounded-xl hover:bg-neutral-100 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${
                      activity.status === 'completed' ? 'bg-green-500' :
                      activity.status === 'booked' ? 'bg-blue-500' : 'bg-red-500'
                    }`} />
                    <div>
                      <p className="text-sm font-medium text-neutral-900">
                        Dr. {activity.practitioner_name || 'Consultation'}
                      </p>
                      <p className="text-xs text-neutral-500 mt-1">
                        {new Date(activity.date).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric'
                        })} at {activity.time?.slice(0,5)}
                      </p>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(activity.status)}`}>
                    {activity.status}
                  </span>
                </motion.div>
              ))}
            </div>
          )}
        </CardBody>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link href="/client/dashboard/consultations/book">
          <Card hoverable className="border-neutral-200 hover:border-primary-200 transition-all">
            <CardBody className="p-6 flex items-center gap-4">
              <div className="p-3 bg-primary-50 rounded-xl">
                <CalendarIcon className="h-6 w-6 text-primary-600" />
              </div>
              <div>
                <h3 className="font-semibold text-neutral-900">Book a Consultation</h3>
                <p className="text-sm text-neutral-500 mt-1">Schedule a session with a practitioner</p>
              </div>
            </CardBody>
          </Card>
        </Link>

        <Link href="/client/dashboard/reviews/create">
          <Card hoverable className="border-neutral-200 hover:border-primary-200 transition-all">
            <CardBody className="p-6 flex items-center gap-4">
              <div className="p-3 bg-purple-50 rounded-xl">
                <StarIcon className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <h3 className="font-semibold text-neutral-900">Write a Review</h3>
                <p className="text-sm text-neutral-500 mt-1">Share your experience</p>
              </div>
            </CardBody>
          </Card>
        </Link>
      </div>
    </div>
  )
}

interface MetricCardProps {
  title: string
  value: string | number
  icon: React.ElementType
  color: 'blue' | 'green' | 'purple' | 'emerald' | 'red' | 'amber'
}

function MetricCard({ title, value, icon: Icon, color }: MetricCardProps) {
  const colorClasses: Record<string, string> = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    purple: 'bg-purple-50 text-purple-600',
    emerald: 'bg-emerald-50 text-emerald-600',
    red: 'bg-red-50 text-red-600',
    amber: 'bg-amber-50 text-amber-600',
  }

  return (
    <Card className="border-neutral-200">
      <CardBody className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-neutral-500">{title}</p>
            <p className="text-2xl font-bold text-neutral-900 mt-2">{value}</p>
          </div>
          <div className={`p-3 rounded-xl ${colorClasses[color]}`}>
            <Icon className="h-5 w-5" />
          </div>
        </div>
      </CardBody>
    </Card>
  )
}