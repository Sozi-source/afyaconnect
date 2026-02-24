'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  CalendarIcon,
  ClockIcon,
  UserIcon,
  MapPinIcon,
  CurrencyDollarIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon as PendingIcon
} from '@heroicons/react/24/outline'
import { useAuth } from '@/app/contexts/AuthContext'
import { Card, CardBody } from '@/app/components/ui/Card'
import { Button } from '@/app/components/ui/Buttons'
import { apiClient } from '@/app/lib/api'
import type { Consultation } from '@/app/types'

type TabType = 'upcoming' | 'completed' | 'cancelled' | 'all'

export default function ClientConsultationsPage() {
  const { isAuthenticated } = useAuth()
  const [consultations, setConsultations] = useState<Consultation[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<TabType>('upcoming')

  useEffect(() => {
    if (isAuthenticated) {
      fetchConsultations()
    }
  }, [isAuthenticated])

  const fetchConsultations = async () => {
    try {
      setLoading(true)
      const data = await apiClient.consultations.getMyClientConsultations()
      setConsultations(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Error fetching consultations:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredConsultations = consultations.filter(c => {
    if (activeTab === 'all') return true
    return c.status === activeTab
  })

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'upcoming':
        return <CalendarIcon className="h-5 w-5 text-blue-500" />
      case 'completed':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />
      case 'cancelled':
        return <XCircleIcon className="h-5 w-5 text-red-500" />
      default:
        return <ClockIcon className="h-5 w-5 text-gray-500" />
    }
  }

  const getStatusBadge = (status: string) => {
    const styles = {
      upcoming: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
      completed: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
      cancelled: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
    }
    return styles[status as keyof typeof styles] || 'bg-gray-100 text-gray-700'
  }

  const formatDate = (date: string, time: string) => {
    return new Date(`${date}T${time}`).toLocaleString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric'
    })
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-4 sm:py-6 lg:py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
              My Consultations
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Manage and track all your consultations
            </p>
          </div>
          <Link href="/client/dashboard/consultations/book">
            <Button>
              <CalendarIcon className="h-4 w-4 mr-2" />
              Book a Consultation
            </Button>
          </Link>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-2 mb-6">
          {(['upcoming', 'completed', 'cancelled', 'all'] as TabType[]).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`
                px-4 py-2 rounded-lg text-sm font-medium capitalize transition
                ${activeTab === tab
                  ? 'bg-emerald-600 text-white'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }
              `}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Consultations List */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
          </div>
        ) : filteredConsultations.length === 0 ? (
          <Card>
            <CardBody className="p-12 text-center">
              <CalendarIcon className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                No {activeTab !== 'all' ? activeTab : ''} consultations
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                {activeTab === 'upcoming' 
                  ? "You don't have any upcoming consultations. Book one now!"
                  : `You don't have any ${activeTab} consultations yet.`}
              </p>
              {activeTab === 'upcoming' && (
                <Link href="/client/dashboard/consultations/book">
                  <Button>Book a Consultation</Button>
                </Link>
              )}
            </CardBody>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredConsultations.map(consultation => (
              <motion.div
                key={consultation.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Link href={`/client/dashboard/consultations/${consultation.id}`}>
                  <Card hoverable>
                    <CardBody className="p-4 sm:p-6">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div className="flex items-start gap-4">
                          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                            {consultation.practitioner_name?.split(' ').map(n => n[0]).join('') || 'DR'}
                          </div>
                          
                          <div>
                            <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                              Dr. {consultation.practitioner_name}
                            </h3>
                            <div className="flex flex-wrap items-center gap-3 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                              <span className="flex items-center gap-1">
                                <CalendarIcon className="h-4 w-4" />
                                {formatDate(consultation.date, consultation.time)}
                              </span>
                              <span className="flex items-center gap-1">
                                <ClockIcon className="h-4 w-4" />
                                {consultation.duration_minutes} min
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 ml-14 sm:ml-0">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(consultation.status)}`}>
                            {consultation.status.charAt(0).toUpperCase() + consultation.status.slice(1)}
                          </span>
                          <CurrencyDollarIcon className="h-5 w-5 text-gray-400" />
                        </div>
                      </div>

                      {consultation.client_notes && (
                        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            <span className="font-medium">Notes:</span> {consultation.client_notes}
                          </p>
                        </div>
                      )}
                    </CardBody>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}