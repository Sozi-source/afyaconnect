'use client'

import { useState, useEffect } from 'react'
import { apiClient } from '@/app/lib/api' 
import { Card, CardBody, CardHeader } from '@/app/components/ui/Card'
import { Button } from '@/app/components/ui/Buttons'
import Link from 'next/link'
import { 
  CalendarIcon, 
  ChartBarIcon, 
  UserGroupIcon, 
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  CurrencyDollarIcon,
  ArrowPathIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline'
import { motion } from 'framer-motion'

interface MetricsResponse {
  as_client: {
    total_consultations: number
    completed: number
    pending: number
    cancelled: number
    total_spent: number
  }
  as_practitioner: {
    total_consultations: number
    completed: number
    pending: number
    cancelled: number
    total_earned: number
  }
}

export default function MetricsPage() {
  const [metrics, setMetrics] = useState<MetricsResponse | null>(null)
  const [recentActivity, setRecentActivity] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [view, setView] = useState<'client' | 'practitioner'>('client')
  const [dateRange, setDateRange] = useState({
    start_date: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0],
    end_date: new Date().toISOString().split('T')[0],
  })
  const [showDatePicker, setShowDatePicker] = useState(false)

  useEffect(() => {
    fetchData()
  }, [dateRange])

  const fetchData = async () => {
    try {
      setLoading(true)
      
      // Get metrics
      const metricsData = await apiClient.consultations.getMetrics()
      setMetrics(metricsData)
      
      // Get recent activity
      const recentData = await apiClient.consultations.getAll({ 
        ordering: '-created_at' 
      })
      setRecentActivity(Array.isArray(recentData) ? recentData.slice(0, 5) : [])
      
    } catch (error) {
      console.error('Failed to fetch metrics:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    await fetchData()
    setRefreshing(false)
  }

  const currentMetrics = view === 'client' 
    ? metrics?.as_client 
    : metrics?.as_practitioner

  type ColorKey = 'blue' | 'green' | 'yellow' | 'red' | 'purple'
  
  const StatCard = ({ title, value, icon: Icon, color }: { title: string; value: any; icon: any; color: ColorKey }) => {
    const colors: Record<ColorKey, string> = {
      blue: 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400',
      green: 'bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400',
      yellow: 'bg-yellow-50 text-yellow-600 dark:bg-yellow-900/20 dark:text-yellow-400',
      red: 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400',
      purple: 'bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400',
    }

    return (
      <Card>
        <CardBody className="p-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-1">{title}</p>
              <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
            </div>
            <div className={`p-2 sm:p-3 rounded-xl ${colors[color]}`}>
              <Icon className="h-5 w-5 sm:h-6 sm:w-6" />
            </div>
          </div>
        </CardBody>
      </Card>
    )
  }

  if (loading) {
    return (
      <div className="space-y-4 sm:space-y-6">
        <div className="h-8 w-48 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse"></div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
            Analytics & Metrics
          </h1>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-1">
            Track your performance and consultation statistics
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            onClick={handleRefresh}
            disabled={refreshing}
            className="!px-3 sm:!px-4"
          >
            <ArrowPathIcon className={`h-4 w-4 sm:mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </Button>
          <button
            onClick={() => setShowDatePicker(!showDatePicker)}
            className="lg:hidden p-2 bg-gray-100 dark:bg-gray-800 rounded-lg"
          >
            <CalendarIcon className="h-5 w-5 text-gray-600 dark:text-gray-400" />
          </button>
        </div>
      </div>

      {/* View Toggle and Date Range */}
      <Card>
        <CardBody className="p-3 sm:p-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center space-x-2 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg w-fit">
              <button
                onClick={() => setView('client')}
                className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition ${
                  view === 'client'
                    ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                }`}
              >
                As Client
              </button>
              <button
                onClick={() => setView('practitioner')}
                className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition ${
                  view === 'practitioner'
                    ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                }`}
              >
                As Practitioner
              </button>
            </div>

            {/* Desktop Date Picker */}
            <div className="hidden sm:flex items-center gap-2">
              <input
                type="date"
                value={dateRange.start_date}
                onChange={(e) => setDateRange({ ...dateRange, start_date: e.target.value })}
                className="px-3 py-2 text-sm border rounded-lg dark:bg-gray-700 dark:border-gray-600"
              />
              <span className="text-gray-500">to</span>
              <input
                type="date"
                value={dateRange.end_date}
                onChange={(e) => setDateRange({ ...dateRange, end_date: e.target.value })}
                className="px-3 py-2 text-sm border rounded-lg dark:bg-gray-700 dark:border-gray-600"
              />
            </div>
          </div>

          {/* Mobile Date Picker */}
          {showDatePicker && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="sm:hidden mt-3 pt-3 border-t border-gray-200 dark:border-gray-700"
            >
              <div className="flex flex-col gap-2">
                <input
                  type="date"
                  value={dateRange.start_date}
                  onChange={(e) => setDateRange({ ...dateRange, start_date: e.target.value })}
                  className="w-full px-3 py-2 text-sm border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                />
                <span className="text-center text-gray-500">to</span>
                <input
                  type="date"
                  value={dateRange.end_date}
                  onChange={(e) => setDateRange({ ...dateRange, end_date: e.target.value })}
                  className="w-full px-3 py-2 text-sm border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                />
              </div>
            </motion.div>
          )}
        </CardBody>
      </Card>

      {currentMetrics && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="space-y-4 sm:space-y-6"
        >
          {/* Key Metrics */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
            <StatCard
              title="Total"
              value={currentMetrics.total_consultations}
              icon={CalendarIcon}
              color="blue"
            />
            <StatCard
              title="Completed"
              value={currentMetrics.completed}
              icon={CheckCircleIcon}
              color="green"
            />
            <StatCard
              title="Pending"
              value={currentMetrics.pending}
              icon={ClockIcon}
              color="yellow"
            />
            <StatCard
              title="Cancelled"
              value={currentMetrics.cancelled}
              icon={XCircleIcon}
              color="red"
            />
          </div>

          {/* Financial Summary */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold">Financial Summary</h3>
              </CardHeader>
              <CardBody className="p-4 sm:p-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 sm:p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                    <div className="flex items-center gap-3">
                      <CurrencyDollarIcon className="h-6 w-6 sm:h-8 sm:w-8 text-green-500" />
                      <div>
                        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                          {view === 'client' ? 'Total Spent' : 'Total Earned'}
                        </p>
                        <p className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white">
                          KES {view === 'client' 
                            ? (currentMetrics as any).total_spent?.toLocaleString() 
                            : (currentMetrics as any).total_earned?.toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500">Avg per consult</p>
                      <p className="text-sm font-medium">
                        KES {currentMetrics.completed > 0 
                          ? Math.round((view === 'client' 
                              ? (currentMetrics as any).total_spent 
                              : (currentMetrics as any).total_earned) / currentMetrics.completed).toLocaleString()
                          : 0}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                      <p className="text-xs text-blue-600 dark:text-blue-400">Completion Rate</p>
                      <p className="text-lg font-semibold text-blue-700 dark:text-blue-300">
                        {currentMetrics.total_consultations > 0
                          ? ((currentMetrics.completed / currentMetrics.total_consultations) * 100).toFixed(1)
                          : 0}%
                      </p>
                    </div>
                    <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-xl">
                      <p className="text-xs text-purple-600 dark:text-purple-400">Cancellation Rate</p>
                      <p className="text-lg font-semibold text-purple-700 dark:text-purple-300">
                        {currentMetrics.total_consultations > 0
                          ? ((currentMetrics.cancelled / currentMetrics.total_consultations) * 100).toFixed(1)
                          : 0}%
                      </p>
                    </div>
                  </div>
                </div>
              </CardBody>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Recent Activity</h3>
                  <Link href="/dashboard/consultations" className="text-sm text-blue-600 hover:text-blue-700 flex items-center">
                    View all
                    <ChevronRightIcon className="h-4 w-4 ml-1" />
                  </Link>
                </div>
              </CardHeader>
              <CardBody className="p-4">
                <div className="space-y-2">
                  {recentActivity.length > 0 ? (
                    recentActivity.map((item: any) => (
                      <Link
                        key={item.id}
                        href={`/dashboard/consultations/${item.id}`}
                        className="block p-2 sm:p-3 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white">
                              Dr. {item.practitioner?.first_name} {item.practitioner?.last_name}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {new Date(item.date).toLocaleDateString()}
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
                    <p className="text-center text-gray-500 dark:text-gray-400 py-4 text-sm">
                      No recent activity
                    </p>
                  )}
                </div>
              </CardBody>
            </Card>
          </div>

          {/* Quick Links */}
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            <Link href="/dashboard/metrics/details">
              <Card hoverable className="text-center p-4">
                <ChartBarIcon className="h-6 w-6 sm:h-8 sm:w-8 mx-auto mb-2 text-blue-500" />
                <h4 className="text-xs sm:text-sm font-medium">Detailed Metrics</h4>
                <p className="text-xs text-gray-500">View all consultations</p>
              </Card>
            </Link>
            <Link href="/dashboard/metrics/practitioners">
              <Card hoverable className="text-center p-4">
                <UserGroupIcon className="h-6 w-6 sm:h-8 sm:w-8 mx-auto mb-2 text-green-500" />
                <h4 className="text-xs sm:text-sm font-medium">Practitioners</h4>
                <p className="text-xs text-gray-500">Performance by practitioner</p>
              </Card>
            </Link>
          </div>
        </motion.div>
      )}
    </div>
  )
}