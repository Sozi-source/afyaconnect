'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/app/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { 
  CalendarIcon,
  ClockIcon,
  VideoCameraIcon,
  PhoneIcon,
  UserIcon,
  ArrowPathIcon,
  CurrencyDollarIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline'
import { Card, CardBody } from '@/app/components/ui/Card'
import { Button } from '@/app/components/ui/Buttons'
import { apiClient } from '@/app/lib/api'
import type { Consultation } from '@/app/types'

export default function PractitionerConsultationsPage() {
  const { user, isAuthenticated } = useAuth()
  const router = useRouter()
  const [consultations, setConsultations] = useState<Consultation[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'completed' | 'cancelled'>('upcoming')
  const [error, setError] = useState<string | null>(null)
  const [stats, setStats] = useState({
    totalEarnings: 0,
    completedCount: 0,
    upcomingCount: 0,
    totalConsultations: 0
  })

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login')
      return
    }
    fetchConsultations()
  }, [isAuthenticated, router, filter])

  const fetchConsultations = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Build filters
      const filters: any = {
        practitioner: user?.id
      }
      if (filter !== 'all') {
        filters.status = filter === 'upcoming' ? 'booked' : filter
      }
      
      const data = await apiClient.consultations.getAll(filters)
      
      // Handle paginated response
      let consultationsList: Consultation[] = []
      if (data && typeof data === 'object' && 'results' in data) {
        consultationsList = data.results
      } else if (Array.isArray(data)) {
        consultationsList = data
      }
      
      setConsultations(consultationsList)
      
      // Calculate stats
      const completed = consultationsList.filter(c => c.status === 'completed').length
      const upcoming = consultationsList.filter(c => c.status === 'booked').length
      const totalEarnings = consultationsList
        .filter(c => c.status === 'completed')
        .reduce((sum, c) => sum + (c.price || 500), 0)
      
      setStats({
        totalEarnings,
        completedCount: completed,
        upcomingCount: upcoming,
        totalConsultations: consultationsList.length
      })
      
    } catch (error: any) {
      console.error('Error fetching consultations:', error)
      setError(error.message || 'Failed to load consultations')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    await fetchConsultations()
  }

  const handleStatusUpdate = async (consultationId: number, newStatus: string) => {
    try {
      await apiClient.consultations.updateStatus(consultationId, newStatus)
      await fetchConsultations()
    } catch (error) {
      console.error('Failed to update status:', error)
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

  const getStatusText = (status: string) => {
    switch(status) {
      case 'booked': return 'Upcoming'
      case 'completed': return 'Completed'
      case 'cancelled': return 'Cancelled'
      default: return status
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const formatTime = (timeString: string) => {
    if (timeString.includes('T')) {
      return new Date(timeString).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
      })
    }
    return timeString.slice(0,5)
  }

  if (loading && !refreshing) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-emerald-200 border-t-emerald-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Practice Schedule</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage your appointments and track your practice
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={handleRefresh}
            disabled={refreshing}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <ArrowPathIcon className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card>
          <CardBody className="p-4">
            <p className="text-sm text-gray-500">Total</p>
            <p className="text-2xl font-bold">{stats.totalConsultations}</p>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="p-4">
            <p className="text-sm text-gray-500">Upcoming</p>
            <p className="text-2xl font-bold text-blue-600">{stats.upcomingCount}</p>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="p-4">
            <p className="text-sm text-gray-500">Completed</p>
            <p className="text-2xl font-bold text-green-600">{stats.completedCount}</p>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="p-4">
            <p className="text-sm text-gray-500">Total Earnings</p>
            <p className="text-2xl font-bold text-emerald-600">KES {stats.totalEarnings}</p>
          </CardBody>
        </Card>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex overflow-x-auto pb-2 gap-2">
        {['upcoming', 'completed', 'cancelled', 'all'].map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab as any)}
            className={`px-4 py-2 text-sm font-medium rounded-lg whitespace-nowrap transition ${
              filter === tab
                ? 'bg-emerald-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400'
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Consultations List */}
      <div className="space-y-3">
        {consultations.length > 0 ? (
          consultations.map((consultation, index) => (
            <motion.div
              key={consultation.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card>
                <CardBody className="p-4">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-full flex items-center justify-center text-white font-bold">
                        {consultation.client_name?.[0] || 'C'}
                      </div>
                      <div>
                        <h3 className="font-semibold">
                          {consultation.client_name || 'Client'}
                        </h3>
                        <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                          <span className="flex items-center">
                            <CalendarIcon className="h-3 w-3 mr-1" />
                            {formatDate(consultation.date)}
                          </span>
                          <span className="flex items-center">
                            <ClockIcon className="h-3 w-3 mr-1" />
                            {formatTime(consultation.time)}
                          </span>
                          <span className="text-xs text-gray-400">
                            ({consultation.duration_minutes} min)
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(consultation.status)}`}>
                        {getStatusText(consultation.status)}
                      </span>
                      {consultation.status === 'completed' && (
                        <span className="flex items-center text-xs text-emerald-600">
                          <CurrencyDollarIcon className="h-3 w-3 mr-1" />
                          KES {consultation.price || '500'}
                        </span>
                      )}
                      {consultation.status === 'booked' && (
                        <div className="flex gap-2">
                          <button className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200">
                            <VideoCameraIcon className="h-4 w-4 text-gray-600 dark:text-gray-300" />
                          </button>
                          <button className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200">
                            <PhoneIcon className="h-4 w-4 text-gray-600 dark:text-gray-300" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {consultation.client_notes && (
                    <p className="mt-3 text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 p-2 rounded">
                      📝 Client note: {consultation.client_notes}
                    </p>
                  )}

                  {/* Status Update Actions (only for booked consultations) */}
                  {consultation.status === 'booked' && (
                    <div className="mt-3 flex gap-2 justify-end">
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-green-600 border-green-600"
                        onClick={() => handleStatusUpdate(consultation.id, 'completed')}
                      >
                        <CheckCircleIcon className="h-4 w-4 mr-1" />
                        Mark Completed
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-red-600 border-red-600"
                        onClick={() => handleStatusUpdate(consultation.id, 'cancelled')}
                      >
                        <XCircleIcon className="h-4 w-4 mr-1" />
                        Cancel
                      </Button>
                    </div>
                  )}
                </CardBody>
              </Card>
            </motion.div>
          ))
        ) : (
          <EmptyState filter={filter} />
        )}
      </div>
    </div>
  )
}

function EmptyState({ filter }: { filter: string }) {
  return (
    <div className="text-center py-12">
      <div className="text-5xl mb-4">📅</div>
      <h3 className="text-lg font-semibold mb-2">No consultations found</h3>
      <p className="text-sm text-gray-500">
        {filter === 'upcoming' 
          ? "You don't have any upcoming appointments"
          : `No ${filter} consultations to display`}
      </p>
      {filter === 'upcoming' && (
        <Link href="/practitioner/dashboard/availability" className="inline-block mt-4">
          <Button className="bg-emerald-600 hover:bg-emerald-700 text-white">
            Set Your Availability
          </Button>
        </Link>
      )}
    </div>
  )
}