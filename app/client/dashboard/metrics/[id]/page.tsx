// app/client/dashboard/metrics/details/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { apiClient } from '@/app/lib/api'
import { Card, CardBody, CardHeader } from '@/app/components/ui/Card'
import { Button } from '@/app/components/ui/Buttons'
import Link from 'next/link'
import { 
  ArrowLeftIcon,
  CalendarIcon,
  ChartBarIcon,
  CurrencyDollarIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  FunnelIcon,
  XMarkIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon
} from '@heroicons/react/24/outline'
import { motion, AnimatePresence } from 'framer-motion'

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

  const stats = {
    total: consultations.length,
    completed: consultations.filter(c => c.status === 'completed').length,
    pending: consultations.filter(c => c.status === 'booked').length,
    cancelled: consultations.filter(c => c.status === 'cancelled').length,
    totalRevenue: consultations
      .filter(c => c.status === 'completed')
      .reduce((sum, c) => sum + (parseFloat(c.practitioner?.hourly_rate) || 0), 0),
  }

  const getStatusIcon = (status: string) => {
    switch(status) {
      case 'completed':
        return <CheckCircleIcon className="h-4 w-4 text-green-600" />
      case 'cancelled':
        return <XCircleIcon className="h-4 w-4 text-red-600" />
      case 'booked':
        return <ClockIcon className="h-4 w-4 text-blue-600" />
      default:
        return null
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <Link href="/client/dashboard/metrics">
          <Button variant="outline" size="sm" className="!p-2 border-neutral-200">
            <ArrowLeftIcon className="h-5 w-5 text-neutral-600" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Detailed Metrics</h1>
          <p className="text-neutral-500 mt-1">View and filter your consultation history</p>
        </div>
      </div>

      {/* Date Range Selector */}
      <Card className="border-neutral-200">
        <CardBody className="p-4">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="w-full sm:hidden flex items-center justify-between text-sm font-medium text-neutral-700"
          >
            <span>Date Range</span>
            {showFilters ? (
              <ChevronUpIcon className="h-4 w-4 text-neutral-500" />
            ) : (
              <ChevronDownIcon className="h-4 w-4 text-neutral-500" />
            )}
          </button>

          <div className={`${showFilters ? 'block' : 'hidden'} sm:block mt-4 sm:mt-0`}>
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <div className="flex-1 flex flex-col sm:flex-row gap-2">
                <input
                  type="date"
                  value={dateRange.start_date}
                  onChange={(e) => setDateRange({ ...dateRange, start_date: e.target.value })}
                  className="w-full px-4 py-2.5 text-sm border border-neutral-200 rounded-xl bg-white text-neutral-900 focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                <span className="hidden sm:block text-neutral-400 self-center">to</span>
                <input
                  type="date"
                  value={dateRange.end_date}
                  onChange={(e) => setDateRange({ ...dateRange, end_date: e.target.value })}
                  className="w-full px-4 py-2.5 text-sm border border-neutral-200 rounded-xl bg-white text-neutral-900 focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <Button 
                size="sm" 
                onClick={fetchDetails} 
                className="w-full sm:w-auto bg-primary-600 hover:bg-primary-700 text-white"
              >
                Apply
              </Button>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total" value={stats.total} icon={CalendarIcon} color="blue" />
        <StatCard title="Completed" value={stats.completed} icon={ChartBarIcon} color="green" />
        <StatCard title="Pending" value={stats.pending} icon={ClockIcon} color="amber" />
        <StatCard title="Revenue" value={`KES ${stats.totalRevenue.toLocaleString()}`} icon={CurrencyDollarIcon} color="purple" />
      </div>

      {/* Consultations List */}
      <Card className="border-neutral-200">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-neutral-900">Consultation Details</h2>
              <p className="text-sm text-neutral-500 mt-1">{consultations.length} consultations found</p>
            </div>
          </div>
        </CardHeader>
        <CardBody className="p-0">
          {loading ? (
            <div className="p-6 space-y-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-16 bg-neutral-100 rounded-xl animate-pulse"></div>
              ))}
            </div>
          ) : consultations.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CalendarIcon className="h-8 w-8 text-neutral-400" />
              </div>
              <p className="text-neutral-500">No consultations found for this period</p>
              <p className="text-sm text-neutral-400 mt-2">Try adjusting your date range</p>
            </div>
          ) : (
            <div className="divide-y divide-neutral-200">
              {consultations.map((c) => (
                <motion.div 
                  key={c.id} 
                  className="p-4 hover:bg-neutral-50 transition-colors"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  {/* Mobile View */}
                  <div className="block sm:hidden">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(c.status)}
                        <span className="text-sm font-medium text-neutral-900">
                          {new Date(c.date).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric'
                          })}
                        </span>
                      </div>
                      <StatusBadge status={c.status} />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-neutral-900">
                          Dr. {c.practitioner?.first_name} {c.practitioner?.last_name}
                        </p>
                        <p className="text-xs text-neutral-500 mt-1">{c.time?.slice(0,5)}</p>
                      </div>
                      <p className="text-sm font-medium text-primary-600">
                        KES {parseFloat(c.practitioner?.hourly_rate || 0).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  {/* Desktop View */}
                  <div className="hidden sm:flex sm:items-center sm:justify-between">
                    <div className="flex-1 grid grid-cols-5 gap-4 items-center">
                      <div className="flex items-center gap-2 text-sm text-neutral-900">
                        {getStatusIcon(c.status)}
                        <span>
                          {new Date(c.date).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </span>
                      </div>
                      <div className="text-sm text-neutral-600">{c.time?.slice(0,5)}</div>
                      <div className="text-sm text-neutral-900">
                        Dr. {c.practitioner?.first_name} {c.practitioner?.last_name}
                      </div>
                      <div>
                        <StatusBadge status={c.status} />
                      </div>
                      <div className="text-sm font-medium text-primary-600 text-right">
                        KES {parseFloat(c.practitioner?.hourly_rate || 0).toLocaleString()}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  )
}

function StatCard({ title, value, icon: Icon, color }: { title: string; value: string | number; icon: any; color: string }) {
  const colors = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    amber: 'bg-amber-50 text-amber-600',
    purple: 'bg-purple-50 text-purple-600',
  }

  return (
    <Card className="border-neutral-200">
      <CardBody className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-neutral-500">{title}</p>
            <p className="text-2xl font-bold text-neutral-900 mt-2">{value}</p>
          </div>
          <div className={`p-3 rounded-xl ${colors[color as keyof typeof colors]}`}>
            <Icon className="h-5 w-5" />
          </div>
        </div>
      </CardBody>
    </Card>
  )
}

function StatusBadge({ status }: { status: string }) {
  const styles = {
    booked: 'bg-blue-50 text-blue-700 border border-blue-200',
    completed: 'bg-green-50 text-green-700 border border-green-200',
    cancelled: 'bg-red-50 text-red-700 border border-red-200',
    'no_show': 'bg-amber-50 text-amber-700 border border-amber-200'
  }

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-medium ${styles[status as keyof typeof styles] || 'bg-neutral-100 text-neutral-700 border border-neutral-200'}`}>
      {status}
    </span>
  )
}