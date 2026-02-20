'use client'

import { useState, useEffect } from 'react'
import { apiClient } from '@/app/lib/api' // Changed import
import { Card, CardBody, CardHeader } from '@/app/components/ui/Card'
import { Button } from '@/app/components/ui/Buttons'
import Link from 'next/link'
import { 
  ArrowLeftIcon,
  CalendarIcon,
  ChartBarIcon,
  CurrencyDollarIcon,
  ChevronDownIcon,
  ChevronUpIcon
} from '@heroicons/react/24/outline'
import { motion } from 'framer-motion'

export default function MetricsDetailsPage() {
  const [consultations, setConsultations] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [dateRange, setDateRange] = useState({
    start_date: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0],
    end_date: new Date().toISOString().split('T')[0],
  })
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set())
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    fetchDetails()
  }, [dateRange])

  const fetchDetails = async () => {
    try {
      setLoading(true)
      const data = await apiClient.consultations.getAll({
        start_date: dateRange.start_date,
        end_date: dateRange.end_date
      })
      setConsultations(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Failed to fetch details:', error)
    } finally {
      setLoading(false)
    }
  }

  const toggleRow = (id: number) => {
    const newExpanded = new Set(expandedRows)
    if (newExpanded.has(id)) {
      newExpanded.delete(id)
    } else {
      newExpanded.add(id)
    }
    setExpandedRows(newExpanded)
  }

  // Calculate statistics
  const stats = {
    total: consultations.length,
    completed: consultations.filter(c => c.status === 'completed').length,
    pending: consultations.filter(c => c.status === 'booked').length,
    cancelled: consultations.filter(c => c.status === 'cancelled').length,
    totalRevenue: consultations
      .filter(c => c.status === 'completed')
      .reduce((sum, c) => sum + (parseFloat(c.practitioner?.hourly_rate) || 0), 0),
  }

  const StatCard = ({ title, value, icon: Icon, color }: { title: string; value: string | number; icon: any; color: 'blue' | 'green' | 'yellow' | 'purple' }) => {
    const colors = {
      blue: 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400',
      green: 'bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400',
      yellow: 'bg-yellow-50 text-yellow-600 dark:bg-yellow-900/20 dark:text-yellow-400',
      purple: 'bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400',
    }

    return (
      <Card>
        <CardBody className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">{title}</p>
              <p className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">{value}</p>
            </div>
            <div className={`p-2 sm:p-3 rounded-xl ${colors[color]}`}>
              <Icon className="h-5 w-5 sm:h-6 sm:w-6" />
            </div>
          </div>
        </CardBody>
      </Card>
    )
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <Link href="/dashboard/metrics">
          <Button variant="outline" size="sm" className="!p-2 sm:!px-4">
            <ArrowLeftIcon className="h-5 w-5 sm:mr-2" />
            <span className="hidden sm:inline">Back to Metrics</span>
          </Button>
        </Link>
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
          Detailed Metrics
        </h1>
      </div>

      {/* Date Range Selector */}
      <Card>
        <CardBody className="p-4">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="w-full sm:hidden flex items-center justify-between text-sm font-medium"
          >
            <span>Date Range</span>
            {showFilters ? (
              <ChevronUpIcon className="h-4 w-4 text-gray-500" />
            ) : (
              <ChevronDownIcon className="h-4 w-4 text-gray-500" />
            )}
          </button>

          <div className={`${showFilters ? 'block' : 'hidden'} sm:block mt-3 sm:mt-0`}>
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <div className="flex-1 flex flex-col sm:flex-row gap-2">
                <input
                  type="date"
                  value={dateRange.start_date}
                  onChange={(e) => setDateRange({ ...dateRange, start_date: e.target.value })}
                  className="w-full sm:flex-1 px-3 py-2 text-sm border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                />
                <span className="hidden sm:block text-gray-500">to</span>
                <input
                  type="date"
                  value={dateRange.end_date}
                  onChange={(e) => setDateRange({ ...dateRange, end_date: e.target.value })}
                  className="w-full sm:flex-1 px-3 py-2 text-sm border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                />
              </div>
              <Button size="sm" onClick={fetchDetails} className="w-full sm:w-auto">
                Apply
              </Button>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
        <StatCard title="Total" value={stats.total} icon={CalendarIcon} color="blue" />
        <StatCard title="Completed" value={stats.completed} icon={ChartBarIcon} color="green" />
        <StatCard title="Pending" value={stats.pending} icon={CalendarIcon} color="yellow" />
        <StatCard title="Revenue" value={`KES ${stats.totalRevenue.toLocaleString()}`} icon={CurrencyDollarIcon} color="purple" />
      </div>

      {/* Consultations List */}
      <Card>
        <CardHeader>
          <h2 className="text-lg sm:text-xl font-semibold">Consultation Details</h2>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
            {consultations.length} consultations found
          </p>
        </CardHeader>
        <CardBody className="p-0 sm:p-2">
          {loading ? (
            <div className="p-4 space-y-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
              ))}
            </div>
          ) : (
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {consultations.map((c) => (
                <div key={c.id} className="p-3 sm:p-4">
                  {/* Mobile View */}
                  <div className="block sm:hidden">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">
                        {new Date(c.date).toLocaleDateString()}
                      </span>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        c.status === 'completed' ? 'bg-green-100 text-green-700' :
                        c.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                        'bg-yellow-100 text-yellow-700'
                      }`}>
                        {c.status}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-900 dark:text-white">
                          Dr. {c.practitioner?.first_name} {c.practitioner?.last_name}
                        </p>
                        <p className="text-xs text-gray-500">{c.time}</p>
                      </div>
                      <p className="text-sm font-medium">
                        KES {parseFloat(c.practitioner?.hourly_rate || 0).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  {/* Desktop View */}
                  <div className="hidden sm:flex sm:items-center sm:justify-between">
                    <div className="flex-1 grid grid-cols-4 gap-4">
                      <div className="text-sm">{new Date(c.date).toLocaleDateString()}</div>
                      <div className="text-sm">{c.time}</div>
                      <div className="text-sm">
                        Dr. {c.practitioner?.first_name} {c.practitioner?.last_name}
                      </div>
                      <div>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          c.status === 'completed' ? 'bg-green-100 text-green-700' :
                          c.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                          'bg-yellow-100 text-yellow-700'
                        }`}>
                          {c.status}
                        </span>
                      </div>
                      <div className="text-sm text-right font-medium">
                        KES {parseFloat(c.practitioner?.hourly_rate || 0).toLocaleString()}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  )
}