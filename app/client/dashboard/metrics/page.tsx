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
} from '@heroicons/react/24/outline'
import { Card, CardBody, CardHeader } from '@/app/components/ui/Card'
import { Button } from '@/app/components/ui/Buttons'
import { apiClient } from '@/app/lib/api'
import type { Consultation, PractitionerMetrics, ClientMetrics } from '@/app/types'
import { TrendingDownIcon, TrendingUp, TrendingUpIcon } from 'lucide-react'

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
      // Get consultations for this client
      const consultations = await apiClient.consultations.getMyClientConsultations()
      
      // Calculate client metrics
      const completed = consultations.filter(c => c.status === 'completed')
      const upcoming = consultations.filter(c => c.status === 'booked')
      const cancelled = consultations.filter(c => c.status === 'cancelled')
      
      const totalSpent = completed.reduce((sum, c) => sum + (c.price || 500), 0)
      const pendingReviews = completed.filter(c => !c.has_review).length

      const clientMetrics: ClientMetrics = {
        total_consultations: consultations.length,
        completed: completed.length,
        pending: upcoming.length,
        cancelled: cancelled.length,
        total_spent: totalSpent,
        upcoming: upcoming.length,
        pending_reviews: pendingReviews
      }

      setMetrics(clientMetrics)
      
      // Get recent activity (last 5 consultations)
      setRecentActivity(consultations.slice(0, 5))
      
    } catch (error) {
      console.error('Error fetching metrics:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'booked': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
      case 'completed': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
      case 'cancelled': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
      default: return 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
    }
  }

  if (isLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-emerald-200 border-t-emerald-600"></div>
      </div>
    )
  }

  if (!isAuthenticated || user?.role !== 'client') {
    return null
  }

  const completionRate = metrics?.total_consultations 
    ? ((metrics.completed / metrics.total_consultations) * 100).toFixed(1) 
    : '0'

  return (
    <div className="space-y-6">
      {/* Header with Back Button */}
      <div className="flex items-center gap-4">
        <Link href="/client/dashboard">
          <Button variant="outline" size="sm" className="!p-2">
            <ArrowLeftIcon className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Your Health Metrics</h1>
          <p className="text-gray-600 dark:text-gray-400">Track your consultation history and progress</p>
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Consultations"
          value={metrics?.total_consultations || 0}
          icon={CalendarIcon}
          color="blue"
        />
        <MetricCard
          title="Completed"
          value={metrics?.completed || 0}
          icon={CheckCircleIcon}
          color="green"
        />
        <MetricCard
          title="Upcoming"
          value={metrics?.upcoming || 0}
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
        <Card>
          <CardBody className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Completion Rate</p>
                <p className="text-2xl font-bold mt-1">{completionRate}%</p>
              </div>
              <div className="p-3 bg-emerald-100 rounded-xl">
                <TrendingUpIcon className="h-5 w-5 text-emerald-600" />
              </div>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Cancelled</p>
                <p className="text-2xl font-bold mt-1">{metrics?.cancelled || 0}</p>
              </div>
              <div className="p-3 bg-red-100 rounded-xl">
                <TrendingDownIcon className="h-5 w-5 text-red-600" />
              </div>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Pending Reviews</p>
                <p className="text-2xl font-bold mt-1">{metrics?.pending_reviews || 0}</p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-xl">
                <StarIcon className="h-5 w-5 text-yellow-600" />
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold">Recent Activity</h3>
        </CardHeader>
        <CardBody className="p-4">
          {recentActivity.length === 0 ? (
            <p className="text-center text-gray-500 py-4">No recent activity</p>
          ) : (
            <div className="space-y-3">
              {recentActivity.map((activity, index) => (
                <motion.div
                  key={activity.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${
                      activity.status === 'completed' ? 'bg-green-500' :
                      activity.status === 'booked' ? 'bg-blue-500' : 'bg-red-500'
                    }`} />
                    <div>
                      <p className="text-sm font-medium">
                        Dr. {activity.practitioner_name || 'Unknown'}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(activity.date).toLocaleDateString()} at {activity.time}
                      </p>
                    </div>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(activity.status)}`}>
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
          <Card hoverable>
            <CardBody className="p-4 flex items-center gap-3">
              <div className="p-3 bg-emerald-100 rounded-xl">
                <CalendarIcon className="h-6 w-6 text-emerald-600" />
              </div>
              <div>
                <h3 className="font-semibold">Book a Consultation</h3>
                <p className="text-sm text-gray-500">Schedule a session with a practitioner</p>
              </div>
            </CardBody>
          </Card>
        </Link>

        <Link href="/client/dashboard/reviews/create">
          <Card hoverable>
            <CardBody className="p-4 flex items-center gap-3">
              <div className="p-3 bg-purple-100 rounded-xl">
                <StarIcon className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <h3 className="font-semibold">Write a Review</h3>
                <p className="text-sm text-gray-500">Share your experience</p>
              </div>
            </CardBody>
          </Card>
        </Link>
      </div>
    </div>
  )
}

function MetricCard({ title, value, icon: Icon, color }: any) {
  const colorClasses = {
    blue: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
    green: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400',
    purple: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400',
    emerald: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400',
    red: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400',
    yellow: 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400',
  }

  return (
    <Card>
      <CardBody className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">{title}</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{value}</p>
          </div>
          <div className={`p-3 rounded-xl`}>
            <Icon className="h-5 w-5" />
          </div>
        </div>
      </CardBody>
    </Card>
  )
}

// Missing CheckCircleIcon import - add this
function CheckCircleIcon(props: any) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  )
}