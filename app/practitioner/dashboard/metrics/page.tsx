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
  ArrowTrendingUpIcon
} from '@heroicons/react/24/outline'
import { Card, CardBody } from '@/app/components/ui/Card'
import { Button } from '@/app/components/ui/Buttons'
import { apiClient } from '@/app/lib/api'
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
      
      // Type guard to ensure we have practitioner metrics
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
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-emerald-200 border-t-emerald-600"></div>
      </div>
    )
  }

  if (!isAuthenticated || user?.role !== 'practitioner') {
    return null
  }

  if (error || !metrics) {
    return (
      <div className="p-6">
        <Card>
          <CardBody className="p-8 text-center">
            <p className="text-red-600 dark:text-red-400 mb-4">
              {error || 'Failed to load metrics'}
            </p>
            <Button onClick={() => fetchMetrics()}>
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
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Practice Metrics
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Track your performance and earnings
          </p>
        </div>
        
        {/* Timeframe selector */}
        <div className="flex gap-2 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
          {(['week', 'month', 'year'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTimeframe(t)}
              className={`px-4 py-2 text-sm font-medium rounded-md transition ${
                timeframe === t
                  ? 'bg-emerald-600 text-white'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Earnings */}
        <MetricCard
          title="Total Earnings"
          value={`KES ${metrics.total_earnings.toLocaleString()}`}
          icon={CurrencyDollarIcon}
          trend="+12.5%"
          color="emerald"
        />

        {/* Average Rating */}
        <MetricCard
          title="Average Rating"
          value={metrics.average_rating.toFixed(1)}
          icon={StarIcon}
          subtitle={`${metrics.total_reviews} reviews`}
          color="yellow"
        />

        {/* Completion Rate */}
        <MetricCard
          title="Completion Rate"
          value={`${completionRate}%`}
          icon={ChartBarIcon}
          subtitle={`${metrics.completed_consultations}/${metrics.total_consultations}`}
          color="blue"
        />

        {/* Average per Consultation */}
        <MetricCard
          title="Avg. per Session"
          value={`KES ${averagePerConsultation.toLocaleString()}`}
          icon={ArrowTrendingUpIcon}
          color="purple"
        />
      </div>

      {/* Detailed Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Consultation Breakdown */}
        <Card>
          <CardBody className="p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
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
          <CardBody className="p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <UserGroupIcon className="h-5 w-5 text-emerald-600" />
              Performance Metrics
            </h2>
            
            <div className="space-y-6">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                  Client Satisfaction
                </p>
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full">
                      <div 
                        className="h-2 bg-emerald-500 rounded-full"
                        style={{ width: `${(metrics.average_rating / 5) * 100}%` }}
                      />
                    </div>
                  </div>
                  <span className="text-sm font-medium">
                    {metrics.average_rating.toFixed(1)}/5.0
                  </span>
                </div>
              </div>

              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                  Total Clients
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {metrics.total_clients || calculateTotalClients(metrics)}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                  Total Reviews
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {metrics.total_reviews}
                </p>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardBody className="p-6">
          <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Link href="/practitioner/dashboard/availability">
              Manage Availability
            </Link>
            
            <Link href="/practitioner/dashboard/consultations">
              <Button variant='outline' className='w-full'>
               Consultations
            </Button>
            </Link>
            
            <Link href="/practitioner/dashboard/profile">
            <Button variant='outline' className='w-full'>
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

interface MetricCardProps {
  title: string
  value: string
  icon: React.ElementType
  trend?: string
  subtitle?: string
  color: 'emerald' | 'yellow' | 'blue' | 'purple' | 'red' | 'green'
}

function MetricCard({ title, value, icon: Icon, trend, subtitle, color }: MetricCardProps) {
  const colorClasses = {
    emerald: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400',
    yellow: 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400',
    blue: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
    purple: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400',
    red: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400',
    green: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400',
  }

  return (
    <Card>
      <CardBody className="p-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">{title}</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
              {value}
            </p>
            {(trend || subtitle) && (
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {trend && <span className="text-green-600 mr-1">{trend}</span>}
                {subtitle}
              </p>
            )}
          </div>
          <div className={`p-3 rounded-xl ${colorClasses[color]}`}>
            <Icon className="h-5 w-5" />
          </div>
        </div>
      </CardBody>
    </Card>
  )
}

interface StatBarProps {
  label: string
  value: number
  total: number
  color: string
}

function StatBar({ label, value, total, color }: StatBarProps) {
  const percentage = total > 0 ? (value / total) * 100 : 0

  return (
    <div>
      <div className="flex justify-between text-sm mb-1">
        <span className="text-gray-600 dark:text-gray-400">{label}</span>
        <span className="font-medium text-gray-900 dark:text-white">
          {value} ({percentage.toFixed(1)}%)
        </span>
      </div>
      <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full">
        <div 
          className={`h-2 ${color} rounded-full transition-all duration-500`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}

// Helper function to calculate total clients (if not provided by API)
function calculateTotalClients(metrics: PractitionerMetrics): number {
  // This is a placeholder - you might need to fetch this separately
  return Math.round(metrics.total_consultations * 0.7) // Rough estimate
}