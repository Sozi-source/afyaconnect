'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/app/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  CalendarIcon,
  ClockIcon,
  VideoCameraIcon,
  PhoneIcon,
  ArrowPathIcon,
  CheckCircleIcon,
  XCircleIcon,
  MagnifyingGlassIcon,
  UserIcon
} from '@heroicons/react/24/outline'
import { Card, CardBody } from '@/app/components/ui/Card'
import { Button } from '@/app/components/ui/Buttons'
import { apiClient } from '@/app/lib/api'
import type { Consultation, ConsultationStatus } from '@/app/types'

type FilterType = 'all' | 'upcoming' | 'completed' | 'cancelled'

export default function PractitionerConsultationsPage() {
  const { user, isAuthenticated, isLoading } = useAuth()
  const router = useRouter()
  const [consultations, setConsultations] = useState<Consultation[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [filter, setFilter] = useState<FilterType>('upcoming')
  const [searchTerm, setSearchTerm] = useState('')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login')
      return
    }
    if (isAuthenticated) {
      fetchConsultations()
    }
  }, [isAuthenticated, isLoading, router, filter])

  const fetchConsultations = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const filters: Record<string, any> = {}
      if (filter !== 'all') {
        filters.status = filter === 'upcoming' ? 'booked' : filter
      }
      
      const data = await apiClient.consultations.getMyPractitionerConsultations(filters)
      
      let consultationsList: Consultation[] = []
      if (data && typeof data === 'object') {
        if ('results' in data && Array.isArray(data.results)) {
          consultationsList = data.results
        } else if (Array.isArray(data)) {
          consultationsList = data
        }
      }
      
      setConsultations(consultationsList)
      
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

  const handleStatusUpdate = async (consultationId: number, newStatus: ConsultationStatus) => {
    try {
      await apiClient.consultations.updateStatus(consultationId, newStatus)
      await fetchConsultations()
    } catch (error) {
      console.error('Failed to update status:', error)
    }
  }

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'booked':
        return 'bg-blue-50 text-blue-700 ring-1 ring-blue-200'
      case 'completed':
        return 'bg-green-50 text-green-700 ring-1 ring-green-200'
      case 'cancelled':
        return 'bg-red-50 text-red-700 ring-1 ring-red-200'
      default:
        return 'bg-gray-50 text-gray-700 ring-1 ring-gray-200'
    }
  }

  const getStatusLabel = (status: string) => {
    switch(status) {
      case 'booked': return 'Upcoming'
      case 'completed': return 'Completed'
      case 'cancelled': return 'Cancelled'
      default: return status
    }
  }

  const formatDateTime = (date: string, time: string) => {
    const dateObj = new Date(date)
    const formattedDate = dateObj.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    })
    return { date: formattedDate, time: time.slice(0, 5) }
  }

  const getInitials = (name: string) => {
    if (!name) return 'CL'
    return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
  }

  // Calculate stats
  const totalCount = consultations.length
  const upcomingCount = consultations.filter(c => c.status === 'booked').length
  const completedCount = consultations.filter(c => c.status === 'completed').length

  // Filter consultations based on search
  const filteredConsultations = consultations.filter(c => 
    c.client_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.client_email?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-emerald-200 border-t-emerald-600"></div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">Consultations</h1>
          <p className="text-sm text-gray-500 mt-1">Manage your appointments</p>
        </div>
        
        <Button
          onClick={handleRefresh}
          disabled={refreshing}
          variant="outline"
          size="sm"
          className="flex items-center gap-2 border-gray-200"
        >
          <ArrowPathIcon className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          <span className="hidden sm:inline">{refreshing ? 'Refreshing...' : 'Refresh'}</span>
        </Button>
      </div>

      {/* Stats - Clean, minimal cards */}
      <div className="grid grid-cols-3 gap-3 sm:gap-4 mb-6">
        <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
          <p className="text-xs text-gray-500 mb-1">Total</p>
          <p className="text-lg sm:text-xl font-semibold text-gray-900">{totalCount}</p>
        </div>
        <div className="bg-blue-50 rounded-lg p-3 sm:p-4">
          <p className="text-xs text-blue-600 mb-1">Upcoming</p>
          <p className="text-lg sm:text-xl font-semibold text-blue-700">{upcomingCount}</p>
        </div>
        <div className="bg-green-50 rounded-lg p-3 sm:p-4">
          <p className="text-xs text-green-600 mb-1">Completed</p>
          <p className="text-lg sm:text-xl font-semibold text-green-700">{completedCount}</p>
        </div>
      </div>

      {/* Error Message */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="bg-red-50 border border-red-200 rounded-lg p-3 mb-6"
          >
            <p className="text-sm text-red-600">{error}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Filters & Search */}
      <div className="space-y-3 mb-6">
        {/* Filter Tabs */}
        <div className="flex gap-1 p-1 bg-gray-50 rounded-lg w-fit">
          {(['upcoming', 'completed', 'cancelled', 'all'] as FilterType[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-3 py-1.5 text-xs sm:text-sm font-medium rounded-md transition ${
                filter === tab
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Search Bar */}
        <div className="relative">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by client name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
          />
        </div>
      </div>

      {/* Consultations List */}
      <div className="space-y-2">
        <AnimatePresence mode="popLayout">
          {loading && !refreshing ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-4 border-emerald-200 border-t-emerald-600"></div>
            </div>
          ) : filteredConsultations.length > 0 ? (
            filteredConsultations.map((consultation, index) => {
              const { date, time } = formatDateTime(consultation.date, consultation.time)
              
              return (
                <motion.div
                  key={consultation.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ delay: index * 0.02 }}
                  layout
                >
                  <Card className="border border-gray-100">
                    <CardBody className="p-4">
                      {/* Mobile Layout */}
                      <div className="sm:hidden space-y-3">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-xs font-medium text-gray-600">
                              {getInitials(consultation.client_name || 'Client')}
                            </div>
                            <div>
                              <h3 className="text-sm font-medium text-gray-900">
                                {consultation.client_name || 'Client'}
                              </h3>
                              <p className="text-xs text-gray-500">{consultation.client_email}</p>
                            </div>
                          </div>
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadge(consultation.status)}`}>
                            {getStatusLabel(consultation.status)}
                          </span>
                        </div>

                        <div className="flex items-center gap-3 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <CalendarIcon className="h-3 w-3" />
                            {date}
                          </span>
                          <span className="flex items-center gap-1">
                            <ClockIcon className="h-3 w-3" />
                            {time}
                          </span>
                          <span>{consultation.duration_minutes}min</span>
                        </div>

                        {consultation.status === 'booked' && (
                          <div className="flex gap-2 pt-1">
                            <button className="flex-1 py-2 bg-gray-50 text-gray-700 rounded-lg text-xs font-medium flex items-center justify-center gap-1">
                              <VideoCameraIcon className="h-3 w-3" />
                              Video
                            </button>
                            <button className="flex-1 py-2 bg-gray-50 text-gray-700 rounded-lg text-xs font-medium flex items-center justify-center gap-1">
                              <PhoneIcon className="h-3 w-3" />
                              Call
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Desktop Layout */}
                      <div className="hidden sm:flex sm:items-center sm:justify-between">
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-xs font-medium text-gray-600 flex-shrink-0">
                            {getInitials(consultation.client_name || 'Client')}
                          </div>
                          <div className="min-w-0">
                            <h3 className="text-sm font-medium text-gray-900 truncate">
                              {consultation.client_name || 'Client'}
                            </h3>
                            <p className="text-xs text-gray-500 truncate">{consultation.client_email}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-4 flex-1 justify-center">
                          <div className="flex items-center gap-3 text-sm text-gray-500">
                            <span className="flex items-center gap-1">
                              <CalendarIcon className="h-4 w-4" />
                              {date}
                            </span>
                            <span className="flex items-center gap-1">
                              <ClockIcon className="h-4 w-4" />
                              {time}
                            </span>
                            <span className="text-xs text-gray-400">{consultation.duration_minutes}min</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 flex-1 justify-end">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadge(consultation.status)}`}>
                            {getStatusLabel(consultation.status)}
                          </span>
                          
                          {consultation.status === 'booked' && (
                            <>
                              <button className="p-1.5 hover:bg-gray-50 rounded-lg transition" title="Video call">
                                <VideoCameraIcon className="h-4 w-4 text-gray-500" />
                              </button>
                              <button className="p-1.5 hover:bg-gray-50 rounded-lg transition" title="Phone call">
                                <PhoneIcon className="h-4 w-4 text-gray-500" />
                              </button>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Client Notes */}
                      {consultation.client_notes && (
                        <p className="mt-3 text-xs text-gray-500 bg-gray-50 p-2 rounded">
                          📝 {consultation.client_notes}
                        </p>
                      )}

                      {/* Status Update Actions */}
                      {consultation.status === 'booked' && (
                        <div className="mt-3 flex gap-2 justify-end border-t border-gray-100 pt-3">
                          <button
                            onClick={() => handleStatusUpdate(consultation.id, 'completed')}
                            className="px-3 py-1.5 text-xs font-medium text-green-700 bg-green-50 rounded-lg hover:bg-green-100 transition"
                          >
                            Mark completed
                          </button>
                          <button
                            onClick={() => handleStatusUpdate(consultation.id, 'cancelled')}
                            className="px-3 py-1.5 text-xs font-medium text-red-700 bg-red-50 rounded-lg hover:bg-red-100 transition"
                          >
                            Cancel
                          </button>
                        </div>
                      )}
                    </CardBody>
                  </Card>
                </motion.div>
              )
            })
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
            >
              <div className="text-4xl mb-3">📅</div>
              <h3 className="text-sm font-medium text-gray-900 mb-1">No consultations found</h3>
              <p className="text-xs text-gray-500">
                {searchTerm 
                  ? "No results match your search" 
                  : filter === 'upcoming' 
                    ? "You don't have any upcoming appointments"
                    : `No ${filter} consultations`}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}