'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/app/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  CurrencyDollarIcon,
  CalendarIcon,
  StarIcon,
  UserGroupIcon,
  ChartBarIcon,
  ArrowTrendingUpIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline'
import { Card, CardBody, CardHeader } from '@/app/components/ui/Card'
import { Button } from '@/app/components/ui/Buttons'
import { apiClient } from '@/app/lib/api'
import { extractResults } from '@/app/lib/utils'
import type { PractitionerMetrics } from '@/app/types'
import Link from 'next/link'

export default function PractitionerMetricsPage() {
  const { user, isAuthenticated, isLoading } = useAuth()
  const router = useRouter()
  const [metrics, setMetrics] = useState<PractitionerMetrics | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [timeframe, setTimeframe] = useState<'week' | 'month' | 'year'>('month')

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login')
      return
    }
    
    if (!isLoading && user?.role !== 'practitioner') {
      router.push('/client/dashboard')
      return
    }

    fetchMetrics()
  }, [isLoading, isAuthenticated, user, router, timeframe])

  const fetchMetrics = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const data = await apiClient.consultations.getMetrics()
      
      if ('total_earnings' in data && 'average_rating' in data) {
        setMetrics(data as PractitionerMetrics)
      } else {
        setError('Invalid metrics data received')
      }
      
    } catch (error: any) {
      console.error('Error fetching metrics:', error)
      setError(error.message || 'Failed to load metrics')
    } finally {
      setLoading(false)
    }
  }

  if (isLoading || loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="relative">
          <div className="animate-spin rounded-full h-12 w-12 sm:h-14 sm:w-14 border-4 border-emerald-200 border-t-emerald-600"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <ChartBarIcon className="h-5 w-5 sm:h-6 sm:w-6 text-emerald-600 animate-pulse" />
          </div>
        </div>
      </div>
    )
  }

  if (!isAuthenticated || user?.role !== 'practitioner') {
    return null
  }

  if (error || !metrics) {
    return (
      <div className="p-4 sm:p-6">
        <Card>
          <CardBody className="p-6 sm:p-8 text-center">
            <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <XCircleIcon className="h-7 w-7 text-red-600" />
            </div>
            <p className="text-sm sm:text-base text-red-600 mb-4">
              {error || 'Failed to load metrics'}
            </p>
            <Button onClick={() => fetchMetrics()} className="mx-auto">
              Try Again
            </Button>
          </CardBody>
        </Card>
      </div>
    )
  }

  // Calculate derived metrics
  const completionRate = metrics.total_consultations > 0 
    ? Math.round((metrics.completed_consultations / metrics.total_consultations) * 100)
    : 0
    
  const averagePerConsultation = metrics.completed_consultations > 0
    ? Math.round(metrics.total_earnings / metrics.completed_consultations)
    : 0

  return (
    <div className="space-y-5 sm:space-y-6 p-3 sm:p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Practice Metrics</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Track your performance and earnings
          </p>
        </div>
        
        {/* Timeframe selector */}
        <div className="flex gap-2 bg-slate-100 p-1 rounded-lg w-fit">
          {(['week', 'month', 'year'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTimeframe(t)}
              className={`px-3 sm:px-4 py-1.5 text-xs sm:text-sm font-medium rounded-md transition ${
                timeframe === t
                  ? 'bg-emerald-600 text-white'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Earnings"
          value={`KES ${metrics.total_earnings.toLocaleString()}`}
          icon={CurrencyDollarIcon}
          trend="+12.5%"
          color="emerald"
        />
        <MetricCard
          title="Average Rating"
          value={metrics.average_rating.toFixed(1)}
          icon={StarIcon}
          subtitle={`${metrics.total_reviews} reviews`}
          color="yellow"
        />
        <MetricCard
          title="Completion Rate"
          value={`${completionRate}%`}
          icon={ChartBarIcon}
          subtitle={`${metrics.completed_consultations}/${metrics.total_consultations}`}
          color="blue"
        />
        <MetricCard
          title="Avg. per Session"
          value={`KES ${averagePerConsultation.toLocaleString()}`}
          icon={ArrowTrendingUpIcon}
          color="purple"
        />
      </div>

      {/* Detailed Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6">
        {/* Consultation Breakdown */}
        <Card>
          <CardBody className="p-5 sm:p-6">
            <h2 className="text-base sm:text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <CalendarIcon className="h-5 w-5 text-emerald-600" />
              Consultation Breakdown
            </h2>
            
            <div className="space-y-4">
              <StatBar
                label="Total Consultations"
                value={metrics.total_consultations}
                total={metrics.total_consultations}
                color="bg-blue-500"
              />
              <StatBar
                label="Completed"
                value={metrics.completed_consultations}
                total={metrics.total_consultations}
                color="bg-green-500"
              />
              <StatBar
                label="Upcoming"
                value={metrics.upcoming_consultations}
                total={metrics.total_consultations}
                color="bg-emerald-500"
              />
              <StatBar
                label="Cancelled"
                value={metrics.cancelled_consultations}
                total={metrics.total_consultations}
                color="bg-red-500"
              />
            </div>
          </CardBody>
        </Card>

        {/* Performance Metrics */}
        <Card>
          <CardBody className="p-5 sm:p-6">
            <h2 className="text-base sm:text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <UserGroupIcon className="h-5 w-5 text-emerald-600" />
              Performance Metrics
            </h2>
            
            <div className="space-y-5">
              <div>
                <p className="text-xs sm:text-sm text-slate-500 mb-2">Client Satisfaction</p>
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <div className="h-2 bg-slate-200 rounded-full">
                      <div 
                        className="h-2 bg-emerald-500 rounded-full transition-all duration-500"
                        style={{ width: `${(metrics.average_rating / 5) * 100}%` }}
                      />
                    </div>
                  </div>
                  <span className="text-xs sm:text-sm font-medium text-slate-900">
                    {metrics.average_rating.toFixed(1)}/5.0
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-slate-500 mb-1">Total Clients</p>
                  <p className="text-xl font-bold text-slate-900">
                    {metrics.total_clients || Math.round(metrics.total_consultations * 0.7)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-1">Total Reviews</p>
                  <p className="text-xl font-bold text-slate-900">{metrics.total_reviews}</p>
                </div>
              </div>

              <div>
                <p className="text-xs text-slate-500 mb-2">Hourly Rate</p>
                <p className="text-lg font-semibold text-slate-900">
                  KES {(metrics.total_earnings / (metrics.completed_consultations || 1) / 1.5).toFixed(0)}/hr
                </p>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardBody className="p-5 sm:p-6">
          <h2 className="text-base sm:text-lg font-semibold text-slate-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Link href="/practitioner/dashboard/availability">
              <Button variant="outline" className="w-full text-xs sm:text-sm">
                <CalendarIcon className="h-4 w-4 mr-2" />
                Manage Availability
              </Button>
            </Link>
            <Link href="/practitioner/dashboard/consultations">
              <Button variant="outline" className="w-full text-xs sm:text-sm">
                <ClockIcon className="h-4 w-4 mr-2" />
                View Consultations
              </Button>
            </Link>
            <Link href="/practitioner/dashboard/profile">
              <Button variant="outline" className="w-full text-xs sm:text-sm">
                <UserGroupIcon className="h-4 w-4 mr-2" />
                Update Profile
              </Button>
            </Link>
          </div>
        </CardBody>
      </Card>
    </div>
  )
}

// Helper Components

function MetricCard({ title, value, icon: Icon, trend, subtitle, color }: { 
  title: string; 
  value: string; 
  icon: React.ElementType; 
  trend?: string; 
  subtitle?: string; 
  color: 'emerald' | 'yellow' | 'blue' | 'purple' 
}) {
  const colorClasses = {
    emerald: 'bg-emerald-100 text-emerald-600',
    yellow: 'bg-yellow-100 text-yellow-600',
    blue: 'bg-blue-100 text-blue-600',
    purple: 'bg-purple-100 text-purple-600',
  }

  return (
    <Card>
      <CardBody className="p-5">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs text-slate-500 mb-1">{title}</p>
            <p className="text-xl sm:text-2xl font-bold text-slate-900">{value}</p>
            {(trend || subtitle) && (
              <p className="text-xs text-slate-500 mt-2">
                {trend && <span className="text-emerald-600 mr-2">{trend}</span>}
                {subtitle}
              </p>
            )}
          </div>
          <div className={`p-2 sm:p-3 rounded-xl ${colorClasses[color]}`}>
            <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
          </div>
        </div>
      </CardBody>
    </Card>
  )
}

function StatBar({ label, value, total, color }: { label: string; value: number; total: number; color: string }) {
  const percentage = total > 0 ? (value / total) * 100 : 0

  return (
    <div>
      <div className="flex justify-between text-xs sm:text-sm mb-1">
        <span className="text-slate-600">{label}</span>
        <span className="font-medium text-slate-900">
          {value} ({percentage.toFixed(1)}%)
        </span>
      </div>
      <div className="h-2 bg-slate-200 rounded-full">
        <div 
          className={`h-2 ${color} rounded-full transition-all duration-500`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}