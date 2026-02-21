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
  CheckCircleIcon,
  XCircleIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline'
import { Card, CardBody } from '@/app/components/ui/Card'
import { Button } from '@/app/components/ui/Buttons'
import { apiClient } from '@/app/lib/api'
import type { Consultation } from '@/app/types'

interface ExtendedUser {
  id: number
  email: string
  first_name?: string
  last_name?: string
  role?: string
}

export default function ConsultationsPage() {
  const { user, isAuthenticated } = useAuth()
  const router = useRouter()
  const extendedUser = user as ExtendedUser | null
  const [consultations, setConsultations] = useState<Consultation[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'completed' | 'cancelled'>('upcoming')

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login')
      return
    }
    fetchConsultations()
  }, [isAuthenticated, router])

  const fetchConsultations = async () => {
    try {
      setLoading(true)
      // Mock data - replace with API call
      const mockData: Consultation[] = [
        {
          id: 1,
          client: 101,
          client_name: 'Mary Wanjiku',
          practitioner: 201,
          practitioner_name: 'Dr. James Omondi',
          date: '2024-02-22',
          time: '10:00:00',
          status: 'booked',
          duration_minutes: 60,
          client_notes: 'First consultation about nutrition plan',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: 2,
          client: 102,
          client_name: 'John Kipchoge',
          practitioner: 201,
          practitioner_name: 'Dr. James Omondi',
          date: '2024-02-23',
          time: '14:30:00',
          status: 'booked',
          duration_minutes: 45,
          client_notes: 'Follow-up session',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: 3,
          client: 103,
          client_name: 'Sarah Kimani',
          practitioner: 202,
          practitioner_name: 'Dr. Jane Akinyi',
          date: '2024-02-20',
          time: '09:00:00',
          status: 'completed',
          duration_minutes: 60,
          client_notes: 'Initial consultation',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
      ]
      setConsultations(mockData)
    } catch (error) {
      console.error('Error fetching consultations:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredConsultations = consultations.filter(c => {
    if (filter === 'all') return true
    if (filter === 'upcoming') return c.status === 'booked'
    if (filter === 'completed') return c.status === 'completed'
    if (filter === 'cancelled') return c.status === 'cancelled'
    return true
  })

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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-emerald-200 border-t-emerald-600"></div>
      </div>
    )
  }

  const isPractitioner = extendedUser?.role === 'practitioner'

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Consultations</h1>
          <p className="text-gray-600 dark:text-gray-400">
            {isPractitioner ? 'Manage your appointments' : 'Your consultation schedule'}
          </p>
        </div>
        {!isPractitioner && (
          <Link href="/dashboard/practitioners">
            <Button className="bg-emerald-600 hover:bg-emerald-700 text-white">
              Book New Consultation
            </Button>
          </Link>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 gap-2">
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
        {filteredConsultations.map((consultation, index) => (
          <motion.div
            key={consultation.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <Link href={`/dashboard/consultations/${consultation.id}`}>
              <Card hoverable>
                <CardBody className="p-4">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-full flex items-center justify-center text-white font-bold">
                        {isPractitioner 
                          ? consultation.client_name?.[0] 
                          : consultation.practitioner_name?.[0]}
                      </div>
                      <div>
                        <h3 className="font-semibold">
                          {isPractitioner ? consultation.client_name : consultation.practitioner_name}
                        </h3>
                        <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                          <span className="flex items-center">
                            <CalendarIcon className="h-3 w-3 mr-1" />
                            {new Date(consultation.date).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric'
                            })}
                          </span>
                          <span className="flex items-center">
                            <ClockIcon className="h-3 w-3 mr-1" />
                            {consultation.time.slice(0,5)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(consultation.status)}`}>
                        {getStatusText(consultation.status)}
                      </span>
                      <div className="flex gap-2">
                        {consultation.status === 'booked' && (
                          <>
                            <button className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200">
                              <VideoCameraIcon className="h-4 w-4 text-gray-600 dark:text-gray-300" />
                            </button>
                            <button className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200">
                              <PhoneIcon className="h-4 w-4 text-gray-600 dark:text-gray-300" />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {consultation.client_notes && (
                    <p className="mt-3 text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 p-2 rounded">
                      📝 {consultation.client_notes}
                    </p>
                  )}
                </CardBody>
              </Card>
            </Link>
          </motion.div>
        ))}

        {filteredConsultations.length === 0 && (
          <div className="text-center py-12">
            <div className="text-5xl mb-4">📅</div>
            <h3 className="text-lg font-semibold mb-2">No consultations found</h3>
            <p className="text-sm text-gray-500">
              {filter === 'upcoming' 
                ? "You don't have any upcoming consultations"
                : `No ${filter} consultations to display`}
            </p>
            {!isPractitioner && filter === 'upcoming' && (
              <Link href="/dashboard/practitioners" className="inline-block mt-4">
                <Button className="bg-emerald-600 hover:bg-emerald-700 text-white">
                  Find a Practitioner
                </Button>
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  )
}