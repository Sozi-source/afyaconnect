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
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline'
import { apiClient } from '@/app/lib/api'
import type { Consultation, ConsultationStatus } from '@/app/types'

export default function PractitionerConsultationsPage() {
  const { user, isAuthenticated, isLoading } = useAuth()
  const router = useRouter()
  const [consultations, setConsultations] = useState<Consultation[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
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
  }, [isAuthenticated, isLoading, router])

  const fetchConsultations = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const data = await apiClient.consultations.getMyPractitionerConsultations()
      
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

  const getStatusStyles = (status: string) => {
    switch(status) {
      case 'booked':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    })
  }

  const formatTime = (timeString: string) => {
    return timeString.slice(0, 5)
  }

  const getInitials = (name: string) => {
    if (!name) return 'CL'
    return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
  }

  const totalCount = consultations.length
  const upcomingCount = consultations.filter(c => c.status === 'booked').length
  const completedCount = consultations.filter(c => c.status === 'completed').length

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
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 py-4 sm:py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-semibold text-gray-900">Consultations</h1>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="p-2 text-gray-600 hover:bg-gray-100 rounded-full transition"
          >
            <ArrowPathIcon className={`h-5 w-5 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-2 mb-5">
          <div className="bg-white rounded-lg p-3 text-center shadow-sm">
            <p className="text-xs text-gray-500">Total</p>
            <p className="text-lg font-semibold text-gray-900">{totalCount}</p>
          </div>
          <div className="bg-blue-50 rounded-lg p-3 text-center shadow-sm">
            <p className="text-xs text-blue-600">Upcoming</p>
            <p className="text-lg font-semibold text-blue-700">{upcomingCount}</p>
          </div>
          <div className="bg-green-50 rounded-lg p-3 text-center shadow-sm">
            <p className="text-xs text-green-600">Completed</p>
            <p className="text-lg font-semibold text-green-700">{completedCount}</p>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* Search */}
        <div className="relative mb-5">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
          />
        </div>

        {/* Consultations List */}
        <div className="space-y-3">
          {loading && !refreshing ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-4 border-emerald-200 border-t-emerald-600"></div>
            </div>
          ) : filteredConsultations.length > 0 ? (
            filteredConsultations.map((consultation, index) => (
              <motion.div
                key={consultation.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
                  {/* Client Info Row */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-700 font-semibold text-sm">
                        {getInitials(consultation.client_name || 'Client')}
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">
                          {consultation.client_name || 'Client'}
                        </h3>
                        <p className="text-xs text-gray-500">{consultation.client_email}</p>
                      </div>
                    </div>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getStatusStyles(consultation.status)}`}>
                      {consultation.status === 'booked' ? 'Upcoming' : 
                       consultation.status === 'completed' ? 'Completed' : 'Cancelled'}
                    </span>
                  </div>

                  {/* Date/Time Row */}
                  <div className="flex items-center gap-3 text-sm text-gray-600 mb-3">
                    <span className="flex items-center gap-1">
                      <CalendarIcon className="h-4 w-4 text-gray-400" />
                      {formatDate(consultation.date)}
                    </span>
                    <span className="flex items-center gap-1">
                      <ClockIcon className="h-4 w-4 text-gray-400" />
                      {formatTime(consultation.time)}
                    </span>
                    <span className="text-xs text-gray-400">
                      {consultation.duration_minutes}min
                    </span>
                  </div>

                  {/* Notes */}
                  {consultation.client_notes && (
                    <p className="text-xs text-gray-600 bg-gray-50 p-2 rounded mb-3">
                      📝 {consultation.client_notes}
                    </p>
                  )}

                  {/* Actions */}
                  {consultation.status === 'booked' && (
                    <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-100">
                      <button
                        onClick={() => handleStatusUpdate(consultation.id, 'completed')}
                        className="flex-1 sm:flex-none px-3 py-2 text-xs font-medium text-green-700 bg-green-50 rounded-lg hover:bg-green-100 transition"
                      >
                        Complete
                      </button>
                      <button
                        onClick={() => handleStatusUpdate(consultation.id, 'cancelled')}
                        className="flex-1 sm:flex-none px-3 py-2 text-xs font-medium text-red-700 bg-red-50 rounded-lg hover:bg-red-100 transition"
                      >
                        Cancel
                      </button>
                      <button className="flex-1 sm:flex-none px-3 py-2 text-xs font-medium text-gray-700 bg-gray-50 rounded-lg hover:bg-gray-100 transition flex items-center justify-center gap-1">
                        <VideoCameraIcon className="h-3 w-3" />
                        <span className="hidden sm:inline">Video</span>
                      </button>
                      <button className="flex-1 sm:flex-none px-3 py-2 text-xs font-medium text-gray-700 bg-gray-50 rounded-lg hover:bg-gray-100 transition flex items-center justify-center gap-1">
                        <PhoneIcon className="h-3 w-3" />
                        <span className="hidden sm:inline">Call</span>
                      </button>
                    </div>
                  )}
                </div>
              </motion.div>
            ))
          ) : (
            <div className="bg-white rounded-lg p-8 text-center shadow-sm border border-gray-100">
              <div className="text-5xl mb-3">📅</div>
              <h3 className="text-base font-medium text-gray-900 mb-1">No consultations</h3>
              <p className="text-sm text-gray-500">
                {searchTerm 
                  ? "No matches found" 
                  : "No consultations to display"}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}