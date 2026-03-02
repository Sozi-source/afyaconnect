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
  UserCircleIcon,
  FunnelIcon,
  ChevronDownIcon
} from '@heroicons/react/24/outline'
import { Card, CardBody } from '@/app/components/ui/Card'
import { Button } from '@/app/components/ui/Buttons'
import { apiClient } from '@/app/lib/api'
import { extractResults } from '@/app/lib/utils'
import type { Consultation, ConsultationStatus } from '@/app/types'

export default function PractitionerConsultationsPage() {
  const { user, isAuthenticated, isLoading } = useAuth()
  const router = useRouter()
  const [consultations, setConsultations] = useState<Consultation[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<ConsultationStatus | 'all'>('all')
  const [showFilters, setShowFilters] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login')
      return
    }
    if (isAuthenticated) {
      fetchConsultations()
    }
  }, [isAuthenticated, isLoading, router])

  const fetchConsultations = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const data = await apiClient.consultations.getMyPractitionerConsultations()
      const consultationsList = extractResults<Consultation>(data)
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

  const getStatusConfig = (status: string) => {
    switch(status) {
      case 'booked':
        return {
          bg: 'bg-blue-100',
          text: 'text-blue-800',
          border: 'border-blue-200',
          label: 'Upcoming',
          icon: ClockIcon
        }
      case 'completed':
        return {
          bg: 'bg-green-100',
          text: 'text-green-800',
          border: 'border-green-200',
          label: 'Completed',
          icon: CheckCircleIcon
        }
      case 'cancelled':
        return {
          bg: 'bg-red-100',
          text: 'text-red-800',
          border: 'border-red-200',
          label: 'Cancelled',
          icon: XCircleIcon
        }
      default:
        return {
          bg: 'bg-slate-100',
          text: 'text-slate-800',
          border: 'border-slate-200',
          label: status,
          icon: ClockIcon
        }
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    })
  }

  const formatTime = (timeString: string) => {
    return timeString.slice(0, 5)
  }

  const getInitials = (name: string) => {
    if (!name) return 'CL'
    return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
  }

  // Filter consultations
  const filteredConsultations = consultations.filter(c => {
    const matchesSearch = 
      c.client_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.client_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.id.toString().includes(searchTerm)
    
    const matchesStatus = statusFilter === 'all' || c.status === statusFilter
    
    return matchesSearch && matchesStatus
  })

  // Stats
  const totalCount = consultations.length
  const upcomingCount = consultations.filter(c => c.status === 'booked').length
  const completedCount = consultations.filter(c => c.status === 'completed').length
  const cancelledCount = consultations.filter(c => c.status === 'cancelled').length

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="relative">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-emerald-200 border-t-emerald-600"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <CalendarIcon className="h-5 w-5 text-emerald-600 animate-pulse" />
          </div>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="space-y-4 sm:space-y-5">
      {/* Header with Refresh */}
      <div className="flex items-center justify-between">
        <h1 className="text-lg sm:text-xl font-semibold text-slate-900">Consultations</h1>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition"
        >
          <ArrowPathIcon className={`h-4 w-4 sm:h-5 sm:w-5 ${refreshing ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="border-slate-200">
          <CardBody className="p-3 sm:p-4">
            <p className="text-xs text-slate-500">Total</p>
            <p className="text-lg sm:text-xl font-semibold text-slate-900">{totalCount}</p>
          </CardBody>
        </Card>
        <Card className="border-blue-200 bg-blue-50">
          <CardBody className="p-3 sm:p-4">
            <p className="text-xs text-blue-600">Upcoming</p>
            <p className="text-lg sm:text-xl font-semibold text-blue-700">{upcomingCount}</p>
          </CardBody>
        </Card>
        <Card className="border-green-200 bg-green-50">
          <CardBody className="p-3 sm:p-4">
            <p className="text-xs text-green-600">Completed</p>
            <p className="text-lg sm:text-xl font-semibold text-green-700">{completedCount}</p>
          </CardBody>
        </Card>
        <Card className="border-red-200 bg-red-50">
          <CardBody className="p-3 sm:p-4">
            <p className="text-xs text-red-600">Cancelled</p>
            <p className="text-lg sm:text-xl font-semibold text-red-700">{cancelledCount}</p>
          </CardBody>
        </Card>
      </div>

      {/* Search and Filter */}
      <Card>
        <CardBody className="p-3 sm:p-4">
          {/* Mobile Filter Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="w-full sm:hidden flex items-center justify-between text-sm font-medium text-slate-700 mb-2"
          >
            <span>Search & Filters</span>
            <ChevronDownIcon className={`h-4 w-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
          </button>

          <div className={`${showFilters ? 'block' : 'hidden'} sm:block space-y-3 sm:space-y-0`}>
            {/* Search */}
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search by name, email, or ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>

            {/* Status Filters */}
            <div className="flex flex-wrap gap-2 pt-2">
              <button
                onClick={() => setStatusFilter('all')}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition ${
                  statusFilter === 'all' 
                    ? 'bg-emerald-600 text-white' 
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                All
              </button>
              {(['booked', 'completed', 'cancelled'] as ConsultationStatus[]).map((status) => {
                const config = getStatusConfig(status)
                return (
                  <button
                    key={status}
                    onClick={() => setStatusFilter(status)}
                    className={`px-3 py-1.5 text-xs font-medium rounded-lg transition flex items-center gap-1 ${
                      statusFilter === status 
                        ? `${config.bg} ${config.text} border ${config.border}`
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    <config.icon className="h-3 w-3" />
                    {config.label}
                  </button>
                )
              })}
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 sm:p-4">
          <p className="text-xs sm:text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Consultations List */}
      <div className="space-y-3">
        {loading && !refreshing ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-4 border-emerald-200 border-t-emerald-600"></div>
          </div>
        ) : filteredConsultations.length > 0 ? (
          filteredConsultations.map((consultation, index) => {
            const statusConfig = getStatusConfig(consultation.status)
            const StatusIcon = statusConfig.icon
            
            return (
              <motion.div
                key={consultation.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="hover:shadow-md transition-all">
                  <CardBody className="p-4">
                    {/* Client Info Row */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-white font-semibold text-xs sm:text-sm flex-shrink-0 ${
                          consultation.status === 'booked' ? 'bg-blue-500' :
                          consultation.status === 'completed' ? 'bg-green-500' :
                          'bg-red-500'
                        }`}>
                          {getInitials(consultation.client_name || 'Client')}
                        </div>
                        <div className="min-w-0">
                          <h3 className="text-sm font-medium text-slate-900 truncate">
                            {consultation.client_name || 'Client'}
                          </h3>
                          <p className="text-xs text-slate-500 truncate">{consultation.client_email}</p>
                        </div>
                      </div>
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${statusConfig.bg} ${statusConfig.text} border ${statusConfig.border} flex-shrink-0 ml-2`}>
                        <StatusIcon className="h-3 w-3" />
                        {statusConfig.label}
                      </span>
                    </div>

                    {/* Date/Time Row */}
                    <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm text-slate-600 mb-3">
                      <span className="flex items-center gap-1">
                        <CalendarIcon className="h-3.5 w-3.5 text-slate-400" />
                        {formatDate(consultation.date)}
                      </span>
                      <span className="text-slate-300">•</span>
                      <span className="flex items-center gap-1">
                        <ClockIcon className="h-3.5 w-3.5 text-slate-400" />
                        {formatTime(consultation.time)}
                      </span>
                      <span className="text-slate-300">•</span>
                      <span className="text-xs text-slate-500">
                        {consultation.duration_minutes}min
                      </span>
                    </div>

                    {/* Notes Preview */}
                    {consultation.client_notes && (
                      <p className="text-xs text-slate-600 bg-slate-50 p-2 rounded mb-3 line-clamp-2">
                        📝 {consultation.client_notes}
                      </p>
                    )}

                    {/* Actions */}
                    {consultation.status === 'booked' && (
                      <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-100">
                        <button
                          onClick={() => handleStatusUpdate(consultation.id, 'completed')}
                          className="flex-1 sm:flex-none px-3 py-1.5 text-xs font-medium text-green-700 bg-green-50 rounded-lg hover:bg-green-100 transition border border-green-200"
                        >
                          Complete
                        </button>
                        <button
                          onClick={() => handleStatusUpdate(consultation.id, 'cancelled')}
                          className="flex-1 sm:flex-none px-3 py-1.5 text-xs font-medium text-red-700 bg-red-50 rounded-lg hover:bg-red-100 transition border border-red-200"
                        >
                          Cancel
                        </button>
                        <Link 
                          href={`/practitioner/dashboard/consultations/${consultation.id}`}
                          className="flex-1 sm:flex-none px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-50 rounded-lg hover:bg-slate-100 transition border border-slate-200 text-center"
                        >
                          View Details
                        </Link>
                        <button 
                          onClick={() => window.open(`/call/${consultation.id}`, '_blank')}
                          className="flex-1 sm:flex-none px-3 py-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 rounded-lg hover:bg-emerald-100 transition border border-emerald-200 flex items-center justify-center gap-1"
                        >
                          <VideoCameraIcon className="h-3 w-3" />
                          <span className="hidden xs:inline">Join</span>
                        </button>
                      </div>
                    )}

                    {consultation.status === 'completed' && (
                      <div className="flex gap-2 pt-2 border-t border-slate-100">
                        <Link 
                          href={`/practitioner/dashboard/consultations/${consultation.id}`}
                          className="flex-1 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-50 rounded-lg hover:bg-slate-100 transition border border-slate-200 text-center"
                        >
                          View Details
                        </Link>
                      </div>
                    )}

                    {consultation.status === 'cancelled' && (
                      <div className="flex gap-2 pt-2 border-t border-slate-100">
                        <Link 
                          href={`/practitioner/dashboard/consultations/${consultation.id}`}
                          className="flex-1 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-50 rounded-lg hover:bg-slate-100 transition border border-slate-200 text-center"
                        >
                          View Details
                        </Link>
                      </div>
                    )}
                  </CardBody>
                </Card>
              </motion.div>
            )
          })
        ) : (
          <Card>
            <CardBody className="p-8 sm:p-10 text-center">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CalendarIcon className="h-8 w-8 sm:h-10 sm:w-10 text-slate-400" />
              </div>
              <h3 className="text-base sm:text-lg font-medium text-slate-900 mb-2">No consultations found</h3>
              <p className="text-sm text-slate-500">
                {searchTerm || statusFilter !== 'all' 
                  ? "Try adjusting your search or filters" 
                  : "You don't have any consultations yet"}
              </p>
            </CardBody>
          </Card>
        )}
      </div>

      {/* Results Count */}
      {filteredConsultations.length > 0 && (
        <p className="text-xs text-slate-500 text-center">
          Showing {filteredConsultations.length} of {consultations.length} consultations
        </p>
      )}

      <style jsx>{`
        @media (max-width: 480px) {
          .xs\\:inline {
            display: inline;
          }
        }
      `}</style>
    </div>
  )
}