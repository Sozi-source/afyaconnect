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
  DocumentTextIcon,
  UserGroupIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon
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
    booked: consultations.filter(c => c.status === 'booked').length,
    cancelled: consultations.filter(c => c.status === 'cancelled').length,
    totalRevenue: consultations
      .filter(c => c.status === 'completed')
      .reduce((sum, c) => sum + (parseFloat(c.practitioner?.hourly_rate) || 0), 0),
    totalHours: consultations
      .filter(c => c.status === 'completed')
      .reduce((sum, c) => sum + (c.duration_minutes || 60), 0) / 60,
  }

  const StatCard = ({ title, value, icon: Icon, color, subtitle }: { 
    title: string; 
    value: string | number; 
    icon: any; 
    color: 'blue' | 'green' | 'yellow' | 'purple' | 'red';
    subtitle?: string;
  }) => {
    const colors = {
      blue: 'bg-blue-50 text-blue-600 border-blue-200',
      green: 'bg-green-50 text-green-600 border-green-200',
      yellow: 'bg-yellow-50 text-yellow-600 border-yellow-200',
      purple: 'bg-purple-50 text-purple-600 border-purple-200',
      red: 'bg-red-50 text-red-600 border-red-200',
    }

    return (
      <Card>
        <CardBody className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-500 mb-1">{title}</p>
              <p className="text-lg sm:text-xl font-bold text-slate-900">{value}</p>
              {subtitle && <p className="text-xs text-slate-500 mt-1">{subtitle}</p>}
            </div>
            <div className={`p-2 sm:p-3 rounded-xl border ${colors[color]}`}>
              <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
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
        <Link href="/practitioner/dashboard/metrics">
          <Button variant="outline" size="sm" className="!p-2 sm:!px-4">
            <ArrowLeftIcon className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">Back to Metrics</span>
          </Button>
        </Link>
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Detailed Metrics</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">In-depth analysis of your practice performance</p>
        </div>
      </div>

      {/* Date Range Selector */}
      <Card>
        <CardBody className="p-4">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="w-full sm:hidden flex items-center justify-between text-sm font-medium text-slate-700"
          >
            <span className="flex items-center gap-2">
              <FunnelIcon className="h-4 w-4" />
              Date Range
            </span>
            {showFilters ? (
              <ChevronUpIcon className="h-4 w-4" />
            ) : (
              <ChevronDownIcon className="h-4 w-4" />
            )}
          </button>

          <div className={`${showFilters ? 'block' : 'hidden'} sm:block mt-3 sm:mt-0`}>
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <div className="flex-1 flex flex-col sm:flex-row gap-2">
                <div className="relative flex-1">
                  <CalendarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="date"
                    value={dateRange.start_date}
                    onChange={(e) => setDateRange({ ...dateRange, start_date: e.target.value })}
                    className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <span className="hidden sm:block text-slate-500 self-center">to</span>
                <div className="relative flex-1">
                  <CalendarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="date"
                    value={dateRange.end_date}
                    onChange={(e) => setDateRange({ ...dateRange, end_date: e.target.value })}
                    className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>
              <Button size="sm" onClick={fetchDetails} className="w-full sm:w-auto">
                Apply
              </Button>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
        <StatCard title="Total" value={stats.total} icon={DocumentTextIcon} color="blue" />
        <StatCard title="Completed" value={stats.completed} icon={CheckCircleIcon} color="green" />
        <StatCard title="Booked" value={stats.booked} icon={CalendarIcon} color="yellow" />
        <StatCard title="Cancelled" value={stats.cancelled} icon={XCircleIcon} color="red" />
        <StatCard 
          title="Revenue" 
          value={`KES ${stats.totalRevenue.toLocaleString()}`} 
          icon={CurrencyDollarIcon} 
          color="purple"
          subtitle={`${stats.totalHours.toFixed(1)} hours`}
        />
      </div>

      {/* Consultations List */}
      <Card>
        <CardHeader className="border-b border-slate-200 px-4 sm:px-6 py-3 sm:py-4">
          <h2 className="text-base sm:text-lg font-semibold text-slate-900">Consultation Details</h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            {consultations.length} consultations found in selected period
          </p>
        </CardHeader>
        <CardBody className="p-0">
          {loading ? (
            <div className="p-6 space-y-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-12 sm:h-14 bg-slate-200 rounded-lg animate-pulse"></div>
              ))}
            </div>
          ) : consultations.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-14 h-14 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <DocumentTextIcon className="h-7 w-7 text-slate-400" />
              </div>
              <p className="text-sm text-slate-500">No consultations found</p>
              <p className="text-xs text-slate-400 mt-1">Try adjusting your date range</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-200">
              {consultations.map((c) => (
                <div key={c.id} className="p-3 sm:p-4 hover:bg-slate-50 transition">
                  {/* Mobile View */}
                  <div className="block sm:hidden">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${
                          c.status === 'completed' ? 'bg-green-500' :
                          c.status === 'booked' ? 'bg-blue-500' :
                          'bg-red-500'
                        }`}></div>
                        <span className="text-xs font-medium text-slate-900">
                          {new Date(c.date).toLocaleDateString()}
                        </span>
                      </div>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        c.status === 'completed' ? 'bg-green-100 text-green-700' :
                        c.status === 'booked' ? 'bg-blue-100 text-blue-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {c.status}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-slate-900">
                          Dr. {c.practitioner?.first_name} {c.practitioner?.last_name}
                        </p>
                        <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                          <ClockIcon className="h-3 w-3" />
                          {c.time?.slice(0,5)} · {c.duration_minutes || 60}min
                        </p>
                      </div>
                      <p className="text-sm font-semibold text-emerald-600">
                        KES {parseFloat(c.practitioner?.hourly_rate || 0).toLocaleString()}
                      </p>
                    </div>
                    {c.client_notes && (
                      <p className="text-xs text-slate-600 bg-slate-50 p-2 rounded mt-2 line-clamp-2">
                        📝 {c.client_notes}
                      </p>
                    )}
                  </div>

                  {/* Desktop View */}
                  <div className="hidden sm:flex sm:items-center sm:justify-between">
                    <div className="flex-1 grid grid-cols-6 gap-4 items-center">
                      <div className="col-span-1 text-sm text-slate-900">
                        {new Date(c.date).toLocaleDateString()}
                      </div>
                      <div className="col-span-1 text-sm text-slate-600">
                        {c.time?.slice(0,5)}
                      </div>
                      <div className="col-span-2 text-sm text-slate-900 truncate">
                        Dr. {c.practitioner?.first_name} {c.practitioner?.last_name}
                      </div>
                      <div className="col-span-1">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          c.status === 'completed' ? 'bg-green-100 text-green-700' :
                          c.status === 'booked' ? 'bg-blue-100 text-blue-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {c.status}
                        </span>
                      </div>
                      <div className="col-span-1 text-sm text-right font-medium text-emerald-600">
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