// app/components/client/dashboard/consultations/ConsultationsPage.tsx
'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  CalendarIcon,
  ClockIcon,
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
import { extractResults } from '@/app/lib/utils'
import type { Consultation } from '@/app/types'

type TabType = 'upcoming' | 'completed' | 'cancelled' | 'all'

export default function ConsultationsPage() {
  // =============================================
  // 1. ALL HOOKS FIRST - UNCONDITIONALLY
  // =============================================
  const { user, isAuthenticated, isLoading: authLoading } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isMounted, setIsMounted] = useState(false)
  const [consultations, setConsultations] = useState<Consultation[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<TabType>('upcoming')
  const [searchTerm, setSearchTerm] = useState('')
  const [error, setError] = useState<string | null>(null)

  // Memoized fetch function
  const fetchConsultations = useCallback(async () => {
    if (!isAuthenticated || !user || !isMounted) return
    
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
  }, [isAuthenticated, user, isMounted])

  // Mount effect
  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Data fetching effect
  useEffect(() => {
    if (isMounted && isAuthenticated && user) {
      fetchConsultations()
    }
  }, [isMounted, isAuthenticated, user, fetchConsultations])

  // Redirect effect
  useEffect(() => {
    if (isMounted && !authLoading && !isAuthenticated) {
      router.push('/login')
    }
  }, [isMounted, authLoading, isAuthenticated, router])

  // Memoized filtered consultations
  const filteredConsultations = useMemo(() => 
    consultations.filter(c => {
      if (activeTab === 'upcoming' && c.status !== 'booked') return false
      if (activeTab === 'completed' && c.status !== 'completed') return false
      if (activeTab === 'cancelled' && c.status !== 'cancelled') return false
      if (searchTerm) {
        return c.practitioner_name?.toLowerCase().includes(searchTerm.toLowerCase())
      }
      return true
    }),
    [consultations, activeTab, searchTerm]
  )

  // Memoized status badge styles
  const getStatusBadge = useCallback((status: string) => {
    const styles = {
      booked: 'bg-blue-50 text-blue-700 border-blue-200',
      completed: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      cancelled: 'bg-rose-50 text-rose-700 border-rose-200',
      no_show: 'bg-amber-50 text-amber-700 border-amber-200'
    }
    return styles[status as keyof typeof styles] || 'bg-slate-50 text-slate-700 border-slate-200'
  }, [])

  // =============================================
  // 2. EARLY RETURNS (after all hooks)
  // =============================================
  if (authLoading || !isMounted) {
    return <LoadingSkeleton />
  }

  if (!isAuthenticated || !user) {
    return null // Redirect happens in useEffect
  }

  if (loading) {
    return <LoadingSkeleton />
  }

  if (error) {
    return <ErrorState error={error} onRetry={fetchConsultations} />
  }

  // =============================================
  // 3. RENDER COMPONENT
  // =============================================
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white py-6 sm:py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 text-teal-600 mb-1">
              <SparklesIcon className="h-4 w-4" />
              <span className="text-xs font-medium uppercase">Appointments</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-light text-slate-800">
              My <span className="font-semibold text-teal-600">Consultations</span>
            </h1>
          </div>
          <Link href="/client/dashboard/consultations/book">
            <Button className="bg-teal-600 hover:bg-teal-700 text-white">
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
            className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500"
          />
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-2 mb-6 border-b border-slate-200 pb-3">
          {(['upcoming', 'completed', 'cancelled', 'all'] as TabType[]).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-all ${
                activeTab === tab 
                  ? 'bg-teal-600 text-white shadow-md' 
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {tab} {tab !== 'all' && `(${consultations.filter(c => 
                tab === 'upcoming' ? c.status === 'booked' :
                tab === 'completed' ? c.status === 'completed' :
                c.status === 'cancelled'
              ).length})`}
            </button>
          ))}
        </div>

        {/* Consultations List */}
        {filteredConsultations.length === 0 ? (
          <EmptyState 
            type={activeTab} 
            onAction={() => activeTab === 'upcoming' && router.push('/client/dashboard/consultations/book')}
          />
        ) : (
          <div className="space-y-4">
            {filteredConsultations.map((consultation, index) => (
              <ConsultationCard 
                key={consultation.id} 
                consultation={consultation} 
                index={index}
                statusBadge={getStatusBadge(consultation.status)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// =============================================
// HELPER COMPONENTS
// =============================================

function ConsultationCard({ consultation, index, statusBadge }: { 
  consultation: Consultation; 
  index: number;
  statusBadge: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <Link href={`/client/dashboard/consultations/${consultation.id}`}>
        <Card className="border-slate-200 hover:border-teal-200 hover:shadow-md transition-all group">
          <CardBody className="p-5">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-teal-600 rounded-full flex items-center justify-center text-white font-bold shadow-sm">
                  {consultation.practitioner_name?.[0] || 'DR'}
                </div>
                <div>
                  <h3 className="font-semibold text-slate-800 group-hover:text-teal-600 transition-colors">
                    Dr. {consultation.practitioner_name || 'Practitioner'}
                  </h3>
                  <div className="flex flex-wrap items-center gap-3 text-sm text-slate-500 mt-1">
                    <span className="flex items-center gap-1">
                      <CalendarIcon className="h-4 w-4" />
                      {new Date(consultation.date).toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </span>
                    <span className="flex items-center gap-1">
                      <ClockIcon className="h-4 w-4" />
                      {consultation.time?.slice(0,5)}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className={`px-3 py-1 rounded-full text-xs font-medium border ${statusBadge}`}>
                  {consultation.status.replace('_', ' ')}
                </span>
                <ChevronRightIcon className="h-5 w-5 text-slate-300 group-hover:text-teal-500 group-hover:translate-x-1 transition-all" />
              </div>
            </div>
          </CardBody>
        </Card>
      </Link>
    </motion.div>
  )
}

function EmptyState({ type, onAction }: { type: string; onAction?: () => void }) {
  const messages = {
    upcoming: {
      title: 'No upcoming consultations',
      description: 'Ready to start your health journey? Book your first consultation today.',
      action: 'Book Consultation'
    },
    completed: {
      title: 'No completed consultations',
      description: 'Your completed consultations will appear here.',
      action: 'Browse Practitioners'
    },
    cancelled: {
      title: 'No cancelled consultations',
      description: 'Your cancelled consultations will appear here.',
      action: 'Book Now'
    },
    all: {
      title: 'No consultations yet',
      description: 'Book your first consultation to get started.',
      action: 'Book Consultation'
    }
  }

  const message = messages[type as keyof typeof messages] || messages.all

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-center py-16 bg-white rounded-2xl border border-slate-200 shadow-sm"
    >
      <div className="w-20 h-20 bg-teal-50 rounded-full flex items-center justify-center mx-auto mb-4">
        <CalendarIcon className="h-8 w-8 text-teal-400" />
      </div>
      <h3 className="text-lg font-semibold text-slate-800 mb-2">{message.title}</h3>
      <p className="text-sm text-slate-500 mb-6 max-w-sm mx-auto px-4">{message.description}</p>
      {onAction && (
        <Button onClick={onAction} className="bg-teal-600 hover:bg-teal-700 text-white">
          {message.action}
        </Button>
      )}
    </motion.div>
  )
}

function LoadingSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white py-6 sm:py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Header Skeleton */}
        <div className="mb-8 animate-pulse">
          <div className="h-4 w-24 bg-slate-200 rounded mb-2"></div>
          <div className="h-8 w-48 bg-slate-200 rounded"></div>
        </div>

        {/* Search Skeleton */}
        <div className="mb-6 animate-pulse">
          <div className="h-12 bg-slate-200 rounded-xl"></div>
        </div>

        {/* Tabs Skeleton */}
        <div className="flex gap-2 mb-6 animate-pulse">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-10 w-24 bg-slate-200 rounded-lg"></div>
          ))}
        </div>

        {/* Cards Skeleton */}
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="border-slate-200">
              <CardBody className="p-5">
                <div className="h-16 bg-slate-200 rounded animate-pulse"></div>
              </CardBody>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}

function ErrorState({ error, onRetry }: { error: string; onRetry: () => void }) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex items-center justify-center p-4">
      <Card className="max-w-md w-full border-neutral-200">
        <CardBody className="p-8 text-center">
          <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <XCircleIcon className="h-8 w-8 text-red-500" />
          </div>
          <h2 className="text-xl font-semibold text-slate-800 mb-2">Unable to Load Consultations</h2>
          <p className="text-slate-500 mb-6">{error}</p>
          <Button onClick={onRetry} className="bg-teal-600 hover:bg-teal-700 text-white">
            Try Again
          </Button>
        </CardBody>
      </Card>
    </div>
  )
}