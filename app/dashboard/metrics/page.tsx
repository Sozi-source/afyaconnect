'use client'

import { useState, useEffect } from 'react'
import { metricsApi, consultationsApi } from '@/app/lib/api'
import { Card, CardBody, CardHeader } from '@/app/components/ui/Card'
import { Button } from '@/app/components/ui/Buttons'
import { useAuth } from '@/app/contexts/AuthContext'
import { 
  CalendarIcon, 
  ChartBarIcon, 
  UserGroupIcon, 
  StarIcon,
  CurrencyDollarIcon,
  ArrowTrendingUpIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline'
import Link from 'next/link'
import { motion } from 'framer-motion'

interface ClientMetrics {
  total_consultations: number
  completed: number
  pending: number
  cancelled: number
  total_spent: number
}

interface PractitionerMetrics {
  total_consultations: number
  completed: number
  pending: number
  cancelled: number
  total_earned: number
}

interface MetricsResponse {
  as_client: ClientMetrics
  as_practitioner: PractitionerMetrics
}

interface DateRange {
  start_date: string
  end_date: string
}

export default function MetricsPage() {
  const { user } = useAuth()
  const [metrics, setMetrics] = useState<MetricsResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [dateRange, setDateRange] = useState<DateRange>({
    start_date: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0],
    end_date: new Date().toISOString().split('T')[0],
  })
  const [view, setView] = useState<'client' | 'practitioner'>('client')
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    fetchMetrics()
  }, [dateRange])

  const fetchMetrics = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await metricsApi.getDashboard({
        start_date: dateRange.start_date,
        end_date: dateRange.end_date
      })
      setMetrics(data)
    } catch (err: any) {
      console.error('Failed to fetch metrics:', err)
      setError(err.response?.data?.message || 'Failed to load metrics')
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    await fetchMetrics()
    setRefreshing(false)
  }

  const handleDateRangeChange = (type: 'start' | 'end', value: string) => {
    setDateRange(prev => ({
      ...prev,
      [type === 'start' ? 'start_date' : 'end_date']: value
    }))
  }

  // Get current view metrics with proper typing
  const currentMetrics = view === 'client' 
    ? metrics?.as_client 
    : metrics?.as_practitioner

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Analytics & Metrics</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Track your performance and consultation statistics
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            onClick={handleRefresh}
            disabled={refreshing}
          >
            <ArrowPathIcon className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </Button>
        </div>
      </div>

      {/* View Toggle and Date Range */}
      <Card>
        <CardBody>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center space-x-2 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg w-fit">
              <button
                onClick={() => setView('client')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition ${
                  view === 'client'
                    ? 'bg-white dark:bg-gray-700 text-primary-600 dark:text-primary-400 shadow'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                }`}
              >
                As Client
              </button>
              <button
                onClick={() => setView('practitioner')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition ${
                  view === 'practitioner'
                    ? 'bg-white dark:bg-gray-700 text-primary-600 dark:text-primary-400 shadow'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                }`}
              >
                As Practitioner
              </button>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="date"
                value={dateRange.start_date}
                onChange={(e) => handleDateRangeChange('start', e.target.value)}
                className="px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700"
              />
              <span className="text-gray-500">to</span>
              <input
                type="date"
                value={dateRange.end_date}
                onChange={(e) => handleDateRangeChange('end', e.target.value)}
                className="px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700"
              />
            </div>
          </div>
        </CardBody>
      </Card>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardBody>
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-4"></div>
                  <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      ) : currentMetrics ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="space-y-6"
        >
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <MetricCard
              title="Total Consultations"
              value={currentMetrics.total_consultations}
              icon={CalendarIcon}
              color="blue"
              trend={+12}
            />
            <MetricCard
              title="Completed"
              value={currentMetrics.completed}
              icon={CheckCircleIcon}
              color="green"
              trend={+8}
            />
            <MetricCard
              title="Pending"
              value={currentMetrics.pending}
              icon={ClockIcon}
              color="yellow"
            />
            <MetricCard
              title="Cancelled"
              value={currentMetrics.cancelled}
              icon={XCircleIcon}
              color="red"
              trend={-2}
            />
          </div>

          {/* Financial Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold">Financial Summary</h3>
              </CardHeader>
              <CardBody>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="flex items-center">
                      <CurrencyDollarIcon className="h-8 w-8 text-green-500 mr-3" />
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {view === 'client' ? 'Total Spent' : 'Total Earned'}
                        </p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">
                          KES {view === 'client' 
                            ? (currentMetrics as ClientMetrics).total_spent?.toLocaleString() 
                            : (currentMetrics as PractitionerMetrics).total_earned?.toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <ArrowTrendingUpIcon className="h-5 w-5 text-green-500" />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <p className="text-sm text-blue-600 dark:text-blue-400">Average per Consultation</p>
                      <p className="text-lg font-semibold text-blue-700 dark:text-blue-300">
                        KES {currentMetrics.completed > 0 
                          ? (view === 'client' 
                              ? ((currentMetrics as ClientMetrics).total_spent / currentMetrics.completed).toFixed(0)
                              : ((currentMetrics as PractitionerMetrics).total_earned / currentMetrics.completed).toFixed(0))
                          : 0}
                      </p>
                    </div>
                    <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                      <p className="text-sm text-purple-600 dark:text-purple-400">Completion Rate</p>
                      <p className="text-lg font-semibold text-purple-700 dark:text-purple-300">
                        {currentMetrics.total_consultations > 0
                          ? ((currentMetrics.completed / currentMetrics.total_consultations) * 100).toFixed(1)
                          : 0}%
                      </p>
                    </div>
                  </div>
                </div>
              </CardBody>
            </Card>

            {/* Performance Chart Placeholder */}
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold">Performance Overview</h3>
              </CardHeader>
              <CardBody>
                <div className="h-64 flex items-center justify-center bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <p className="text-gray-500 dark:text-gray-400">Chart visualization coming soon</p>
                </div>
              </CardBody>
            </Card>
          </div>

          {/* Recent Activity */}
          <RecentActivity />
        </motion.div>
      ) : null}
    </div>
  )
}

interface MetricCardProps {
  title: string
  value: number
  icon: React.ElementType
  color: 'blue' | 'green' | 'yellow' | 'red' | 'purple'
  trend?: number
}

function MetricCard({ title, value, icon: Icon, color, trend }: MetricCardProps) {
  const colors = {
    blue: 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400',
    green: 'bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400',
    yellow: 'bg-yellow-50 text-yellow-600 dark:bg-yellow-900/20 dark:text-yellow-400',
    red: 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400',
    purple: 'bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400',
  }

  return (
    <Card>
      <CardBody>
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</p>
          <div className={`p-2 rounded-lg ${colors[color]}`}>
            <Icon className="h-5 w-5" />
          </div>
        </div>
        <div className="flex items-end justify-between">
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
          {trend !== undefined && (
            <span className={`text-sm font-medium ${trend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {trend > 0 ? '+' : ''}{trend}%
            </span>
          )}
        </div>
      </CardBody>
    </Card>
  )
}

function RecentActivity() {
  const [recentActivity, setRecentActivity] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchRecent = async () => {
      try {
        const consultations = await consultationsApi.getAll({ ordering: '-created_at', limit: 5 })
        setRecentActivity(Array.isArray(consultations) ? consultations : consultations.results || [])
      } catch (error) {
        console.error('Failed to fetch recent activity:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchRecent()
  }, [])

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold">Recent Activity</h3>
        </CardHeader>
        <CardBody>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="animate-pulse h-12 bg-gray-200 dark:bg-gray-700 rounded"></div>
            ))}
          </div>
        </CardBody>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <h3 className="text-lg font-semibold">Recent Activity</h3>
      </CardHeader>
      <CardBody>
        <div className="space-y-3">
          {recentActivity.length > 0 ? (
            recentActivity.map((item: any) => (
              <Link
                key={item.id}
                href={`/dashboard/consultations/${item.id}`}
                className="block p-3 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      Consultation with Dr. {item.practitioner?.first_name} {item.practitioner?.last_name}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {new Date(item.date).toLocaleDateString()} at {item.time}
                    </p>
                  </div>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    item.status === 'completed' ? 'bg-green-100 text-green-700' :
                    item.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                    'bg-yellow-100 text-yellow-700'
                  }`}>
                    {item.status}
                  </span>
                </div>
              </Link>
            ))
          ) : (
            <p className="text-center text-gray-500 dark:text-gray-400 py-4">
              No recent activity
            </p>
          )}
        </div>
      </CardBody>
    </Card>
  )
}