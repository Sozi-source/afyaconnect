'use client'

import { useState, useEffect } from 'react'
import { apiClient } from '@/app/lib/api' 
import { Card, CardBody } from '@/app/components/ui/Card'
import { Button } from '@/app/components/ui/Buttons'
import Link from 'next/link'
import { CalendarIcon, ClockIcon, ChevronRightIcon } from '@heroicons/react/24/outline'
import { Consultation } from '@/app/types'
import { motion } from 'framer-motion'

export default function ConsultationsPage() {
  const [consultations, setConsultations] = useState<Consultation[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'completed' | 'cancelled'>('all')

  useEffect(() => {
    const fetchConsultations = async () => {
      try {
        const data = await apiClient.consultations.getAll()
        setConsultations(Array.isArray(data) ? data : [])
      } catch (error) {
        console.error('Failed to fetch consultations:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchConsultations()
  }, [])

  const filteredConsultations = consultations.filter(c => {
    if (filter === 'all') return true
    return c.status === filter
  })

  const getStatusColor = (status: string) => {
    const colors = {
      booked: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
      completed: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
      cancelled: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
      no_show: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
    }
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
  }

  if (loading) {
    return (
      <div className="space-y-4 sm:space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="h-8 w-48 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
          <div className="h-10 w-40 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
        </div>
        <div className="grid gap-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-24 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"></div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
            Consultations
          </h1>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-1">
            Manage your consultation appointments
          </p>
        </div>
        <Link href="/dashboard/consultations/create" className="w-full sm:w-auto">
          <Button fullWidth className="sm:w-auto">
            Book New Consultation
          </Button>
        </Link>
      </div>

      {/* Filter Tabs */}
      <div className="flex overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 scrollbar-hide">
        <div className="flex space-x-2">
          {[
            { key: 'all', label: 'All' },
            { key: 'upcoming', label: 'Upcoming' },
            { key: 'completed', label: 'Completed' },
            { key: 'cancelled', label: 'Cancelled' },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key as any)}
              className={`
                px-4 py-2 text-sm font-medium rounded-lg whitespace-nowrap transition-all
                ${filter === tab.key
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700'
                }
              `}
            >
              {tab.label}
              {tab.key !== 'all' && (
                <span className="ml-2 px-1.5 py-0.5 text-xs rounded-full bg-white/20">
                  {consultations.filter(c => c.status === tab.key).length}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Consultations List */}
      <div className="space-y-3 sm:space-y-4">
        {filteredConsultations.map((consultation, index) => (
          <motion.div
            key={consultation.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: Math.min(index * 0.05, 0.5) }}
          >
            <Link href={`/dashboard/consultations/${consultation.id}`}>
              <Card hoverable className="cursor-pointer">
                <CardBody className="p-4 sm:p-5">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-start justify-between sm:justify-start sm:gap-4">
                        <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
                          Dr. {consultation.practitioner?.first_name} {consultation.practitioner?.last_name}
                        </h3>
                        <span className={`sm:hidden px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(consultation.status)}`}>
                          {consultation.status}
                        </span>
                      </div>
                      
                      <div className="flex flex-col xs:flex-row xs:items-center gap-2 xs:gap-4 mt-2">
                        <span className="flex items-center text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                          <CalendarIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1 flex-shrink-0" />
                          {new Date(consultation.date).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </span>
                        <span className="flex items-center text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                          <ClockIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1 flex-shrink-0" />
                          {consultation.time}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-4">
                      <span className={`hidden sm:inline-block px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(consultation.status)}`}>
                        {consultation.status}
                      </span>
                      <ChevronRightIcon className="h-5 w-5 text-gray-400" />
                    </div>
                  </div>
                </CardBody>
              </Card>
            </Link>
          </motion.div>
        ))}

        {filteredConsultations.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12 sm:py-16 bg-white dark:bg-gray-800 rounded-xl shadow-sm"
          >
            <div className="text-5xl sm:text-6xl mb-4">📅</div>
            <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No consultations found
            </h3>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 max-w-sm mx-auto px-4">
              {filter === 'all' 
                ? "You haven't booked any consultations yet."
                : `No ${filter} consultations to display.`}
            </p>
            {filter === 'all' && (
              <Link href="/dashboard/consultations/create" className="inline-block mt-6">
                <Button>
                  Book Your First Consultation
                </Button>
              </Link>
            )}
          </motion.div>
        )}
      </div>
    </div>
  )
}