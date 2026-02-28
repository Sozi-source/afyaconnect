'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  CalendarIcon,
  ClockIcon,
  UserIcon,
  MapPinIcon,
  CurrencyDollarIcon,
  CheckCircleIcon,
  XCircleIcon,
  MagnifyingGlassIcon,
  SparklesIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline'
import { useAuth } from '@/app/contexts/AuthContext'
import { Card, CardBody } from '@/app/components/ui/Card'
import { Button } from '@/app/components/ui/Buttons'
import { apiClient } from '@/app/lib/api'
import { extractResults, formatDate, formatTime } from '@/app/lib/utils'
import type { Consultation } from '@/app/types'

type TabType = 'upcoming' | 'completed' | 'cancelled' | 'all'

export default function ClientConsultationsPage() {
  const { isAuthenticated } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const successParam = searchParams.get('success')
  const cancelledParam = searchParams.get('cancelled')
  
  const [consultations, setConsultations] = useState<Consultation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<TabType>('upcoming')
  const [searchTerm, setSearchTerm] = useState('')
  const [showSuccess, setShowSuccess] = useState(false)
  const [showCancelledSuccess, setShowCancelledSuccess] = useState(false)
  const [updatingId, setUpdatingId] = useState<number | null>(null)

  useEffect(() => {
    if (isAuthenticated) {
      fetchConsultations()
    }
  }, [isAuthenticated])

  useEffect(() => {
    if (successParam === 'true') {
      setShowSuccess(true)
      setTimeout(() => setShowSuccess(false), 5000)
    }
    if (cancelledParam === 'true') {
      setShowCancelledSuccess(true)
      setTimeout(() => setShowCancelledSuccess(false), 5000)
    }
  }, [successParam, cancelledParam])

  const fetchConsultations = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await apiClient.consultations.getMyClientConsultations()
      const consultationsList = extractResults<Consultation>(data)
      setConsultations(consultationsList)
    } catch (error) {
      console.error('Error fetching consultations:', error)
      setError('Failed to load consultations')
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = async (id: number, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (!confirm('Cancel this consultation?')) return
    
    setUpdatingId(id)
    try {
      await apiClient.consultations.updateStatus(id, 'cancelled')
      setConsultations(prev => 
        prev.map(c => c.id === id ? { ...c, status: 'cancelled' } : c)
      )
      await fetchConsultations()
      router.push('/client/dashboard/consultations?cancelled=true')
    } catch (error) {
      console.error('Failed to cancel consultation:', error)
      alert('Failed to cancel consultation.')
    } finally {
      setUpdatingId(null)
    }
  }

  const handleReschedule = (id: number, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    router.push(`/client/dashboard/consultations/reschedule/${id}`)
  }

  const handleWriteReview = (id: number, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    router.push(`/client/dashboard/reviews/book?consultation=${id}`)
  }

  const filteredConsultations = consultations.filter(c => {
    if (activeTab === 'upcoming' && c.status !== 'booked') return false
    if (activeTab === 'completed' && c.status !== 'completed') return false
    if (activeTab === 'cancelled' && c.status !== 'cancelled') return false
    
    if (searchTerm) {
      const practitionerName = c.practitioner_name?.toLowerCase() || ''
      return practitionerName.includes(searchTerm.toLowerCase())
    }
    return true
  })

  const sortedConsultations = [...filteredConsultations].sort((a, b) => {
    const dateA = new Date(`${a.date}T${a.time || '00:00'}`)
    const dateB = new Date(`${b.date}T${b.time || '00:00'}`)
    return activeTab === 'upcoming' 
      ? dateA.getTime() - dateB.getTime() 
      : dateB.getTime() - dateA.getTime()
  })

  const getStatusBadge = (status: string) => {
    const styles = {
      booked: 'bg-blue-50 text-blue-700 border border-blue-200',
      completed: 'bg-green-50 text-green-700 border border-green-200',
      cancelled: 'bg-red-50 text-red-700 border border-red-200'
    }
    return styles[status as keyof typeof styles] || 'bg-slate-50 text-slate-600 border border-slate-200'
  }

  const getTabCount = (tab: TabType) => {
    if (tab === 'all') return consultations.length
    return consultations.filter(c => 
      tab === 'upcoming' ? c.status === 'booked' :
      tab === 'completed' ? c.status === 'completed' :
      c.status === 'cancelled'
    ).length
  }

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-teal-200 border-t-teal-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-4">
        <Card className="max-w-md w-full border-slate-200">
          <CardBody className="p-8 text-center">
            <XCircleIcon className="h-12 w-12 text-rose-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-800 mb-2">Something went wrong</h3>
            <p className="text-slate-500 mb-6">{error}</p>
            <Button onClick={fetchConsultations} className="bg-teal-600 hover:bg-teal-700 text-white">
              Try Again
            </Button>
          </CardBody>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white py-6 sm:py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Success Messages */}
        <AnimatePresence>
          {showSuccess && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-6 bg-teal-50 border border-teal-200 rounded-xl p-4 flex items-center gap-3 shadow-sm"
            >
              <CheckCircleIcon className="h-5 w-5 text-teal-600" />
              <div>
                <p className="font-medium text-teal-800">Booking confirmed!</p>
                <p className="text-sm text-teal-600">Your consultation has been scheduled.</p>
              </div>
            </motion.div>
          )}

          {showCancelledSuccess && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-6 bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center gap-3 shadow-sm"
            >
              <CheckCircleIcon className="h-5 w-5 text-amber-600" />
              <div>
                <p className="font-medium text-amber-800">Consultation cancelled</p>
                <p className="text-sm text-amber-600">Your consultation has been cancelled.</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 text-teal-600 mb-1">
              <SparklesIcon className="h-4 w-4" />
              <span className="text-xs font-medium uppercase tracking-wider">Appointments</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-light text-slate-800">
              My <span className="font-semibold text-teal-600">Consultations</span>
            </h1>
          </div>
          <Link href="/client/dashboard/consultations/book">
            <Button className="bg-teal-600 hover:bg-teal-700 text-white shadow-sm shadow-teal-200/50">
              <CalendarIcon className="h-4 w-4 mr-2" />
              Book Consultation
            </Button>
          </Link>
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search by practitioner name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl bg-white text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/30"
          />
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-2 mb-6 border-b border-slate-200 pb-3">
          {(['upcoming', 'completed', 'cancelled', 'all'] as TabType[]).map(tab => {
            const count = getTabCount(tab)
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`
                  px-4 py-2 rounded-lg text-sm font-medium capitalize transition-all
                  ${activeTab === tab
                    ? 'bg-teal-600 text-white shadow-sm'
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                  }
                `}
              >
                {tab}
                {count > 0 && (
                  <span className={`ml-2 text-xs px-1.5 py-0.5 rounded-full ${
                    activeTab === tab ? 'bg-white/20' : 'bg-slate-200 text-slate-700'
                  }`}>
                    {count}
                  </span>
                )}
              </button>
            )
          })}
        </div>

        {/* Consultations List */}
        {sortedConsultations.length === 0 ? (
          <Card className="border-slate-200">
            <CardBody className="py-16 text-center">
              <div className="w-20 h-20 bg-teal-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <CalendarIcon className="h-8 w-8 text-teal-400" />
              </div>
              <h3 className="text-lg font-semibold text-slate-800 mb-2">
                No {activeTab === 'all' ? '' : activeTab} consultations
              </h3>
              <p className="text-slate-500 mb-6 max-w-sm mx-auto">
                {activeTab === 'upcoming' && "You don't have any upcoming consultations."}
                {activeTab === 'completed' && "You haven't completed any consultations yet."}
                {activeTab === 'cancelled' && "No cancelled consultations found."}
                {activeTab === 'all' && "You haven't booked any consultations yet."}
              </p>
              {(activeTab === 'upcoming' || activeTab === 'all') && (
                <Link href="/client/dashboard/consultations/book">
                  <Button className="bg-teal-600 hover:bg-teal-700 text-white shadow-sm">
                    Book Your First Consultation
                  </Button>
                </Link>
              )}
            </CardBody>
          </Card>
        ) : (
          <div className="space-y-4">
            {sortedConsultations.map(consultation => {
              const isUpdating = updatingId === consultation.id
              
              return (
                <motion.div
                  key={consultation.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <Card className="border-slate-200 hover:border-teal-200 transition-all">
                    <CardBody className="p-5">
                      <Link href={`/client/dashboard/consultations/${consultation.id}`}>
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                          <div className="flex items-start gap-4 flex-1">
                            <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-teal-600 rounded-full flex items-center justify-center text-white font-bold shadow-sm flex-shrink-0">
                              {consultation.practitioner_name?.split(' ').map(n => n[0]).join('') || 'DR'}
                            </div>
                            
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1 flex-wrap">
                                <h3 className="font-semibold text-slate-800">
                                  Dr. {consultation.practitioner_name || 'Unknown'}
                                </h3>
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(consultation.status)}`}>
                                  {consultation.status}
                                </span>
                              </div>
                              
                              <div className="flex flex-wrap items-center gap-3 text-sm text-slate-500">
                                <span className="flex items-center gap-1">
                                  <CalendarIcon className="h-4 w-4 text-slate-400" />
                                  {new Date(consultation.date).toLocaleDateString('en-US', {
                                    month: 'short', day: 'numeric'
                                  })} at {consultation.time?.slice(0,5)}
                                </span>
                                <span className="flex items-center gap-1">
                                  <ClockIcon className="h-4 w-4 text-slate-400" />
                                  {consultation.duration_minutes} min
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex items-center gap-2 ml-10 sm:ml-0" onClick={(e) => e.preventDefault()}>
                            {consultation.status === 'booked' && (
                              <>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={(e) => handleReschedule(consultation.id, e)}
                                  disabled={isUpdating}
                                  className="border-slate-200 text-slate-600 hover:bg-slate-50"
                                >
                                  Reschedule
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="border-rose-200 text-rose-600 hover:bg-rose-50"
                                  onClick={(e) => handleCancel(consultation.id, e)}
                                  disabled={isUpdating}
                                  isLoading={isUpdating}
                                >
                                  {isUpdating ? '...' : 'Cancel'}
                                </Button>
                              </>
                            )}
                            
                            {consultation.status === 'completed' && !consultation.has_review && (
                              <Button
                                size="sm"
                                onClick={(e) => handleWriteReview(consultation.id, e)}
                                className="bg-teal-600 hover:bg-teal-700 text-white"
                              >
                                Write Review
                              </Button>
                            )}
                            
                            {consultation.status === 'completed' && consultation.has_review && (
                              <span className="text-sm text-teal-600 flex items-center gap-1">
                                <CheckCircleIcon className="h-4 w-4" />
                                Reviewed
                              </span>
                            )}
                            
                            <ChevronRightIcon className="h-5 w-5 text-slate-300 group-hover:text-teal-600 transition-colors" />
                          </div>
                        </div>

                        {consultation.client_notes && (
                          <div className="mt-4 pt-3 border-t border-slate-100">
                            <p className="text-sm text-slate-500 italic">
                              "{consultation.client_notes}"
                            </p>
                          </div>
                        )}
                      </Link>
                    </CardBody>
                  </Card>
                </motion.div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}