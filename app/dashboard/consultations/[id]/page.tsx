'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { consultationsApi } from '@/app/lib/api'
import { Button } from '@/app/components/ui/Buttons'
import { Card, CardBody, CardHeader } from '@/app/components/ui/Card'
import { CalendarIcon, ClockIcon, UserIcon, ChevronLeftIcon } from '@heroicons/react/24/outline'
import Link from 'next/link'
import { Consultation } from '@/app/types'
import { motion } from 'framer-motion'

export default function ConsultationDetailPage() {
  const params = useParams()
  const router = useRouter()
  const id = parseInt(params.id as string)
  
  const [consultation, setConsultation] = useState<Consultation | null>(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [showActions, setShowActions] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const consultationData = await consultationsApi.getOne(id)
        setConsultation(consultationData)
      } catch (error) {
        console.error('Failed to fetch consultation:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [id])

  const updateStatus = async (status: Consultation['status']) => {
    if (!consultation) return
    setUpdating(true)
    try {
      const updated = await consultationsApi.updateStatus(id, status)
      setConsultation(updated)
    } catch (error) {
      console.error('Failed to update status:', error)
    } finally {
      setUpdating(false)
      setShowActions(false)
    }
  }

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
        <div className="flex items-center gap-4">
          <div className="h-10 w-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
          <div className="h-8 w-48 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
        </div>
        <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse"></div>
      </div>
    )
  }

  if (!consultation) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold">Consultation not found</h2>
        <Button onClick={() => router.back()} className="mt-4">
          Go Back
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header with back button */}
      <div className="flex items-center gap-4">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => router.back()}
          className="!p-2 sm:!px-4"
        >
          <ChevronLeftIcon className="h-5 w-5 sm:mr-2" />
          <span className="hidden sm:inline">Back</span>
        </Button>
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
          Consultation Details
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-4 sm:space-y-6">
          {/* Appointment Info Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <Card>
              <CardHeader>
                <h2 className="text-lg sm:text-xl font-semibold">Appointment Information</h2>
              </CardHeader>
              <CardBody className="p-4 sm:p-6">
                <div className="space-y-3 sm:space-y-4">
                  <div className="flex items-start gap-3">
                    <UserIcon className="h-5 w-5 text-gray-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Practitioner</p>
                      <p className="text-base sm:text-lg font-medium text-gray-900 dark:text-white">
                        Dr. {consultation.practitioner?.first_name} {consultation.practitioner?.last_name}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <CalendarIcon className="h-5 w-5 text-gray-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Date</p>
                      <p className="text-base font-medium text-gray-900 dark:text-white">
                        {new Date(consultation.date).toLocaleDateString('en-US', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <ClockIcon className="h-5 w-5 text-gray-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Time</p>
                      <p className="text-base font-medium text-gray-900 dark:text-white">
                        {consultation.time} 
                        {consultation.duration_minutes && ` (${consultation.duration_minutes} minutes)`}
                      </p>
                    </div>
                  </div>

                  <div className="pt-2">
                    <span className={`inline-block px-3 py-1.5 rounded-full text-sm font-medium ${getStatusColor(consultation.status)}`}>
                      Status: {consultation.status.charAt(0).toUpperCase() + consultation.status.slice(1)}
                    </span>
                  </div>
                </div>
              </CardBody>
            </Card>
          </motion.div>

          {/* Notes Card */}
          {consultation.client_notes && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
            >
              <Card>
                <CardHeader>
                  <h2 className="text-lg sm:text-xl font-semibold">Your Notes</h2>
                </CardHeader>
                <CardBody className="p-4 sm:p-6">
                  <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300 whitespace-pre-line">
                    {consultation.client_notes}
                  </p>
                </CardBody>
              </Card>
            </motion.div>
          )}
        </div>

        {/* Sidebar - Actions */}
        <div className="space-y-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold">Actions</h3>
              </CardHeader>
              <CardBody className="p-4">
                <div className="space-y-2">
                  {consultation.status === 'booked' && (
                    <>
                      <Button 
                        fullWidth 
                        onClick={() => updateStatus('completed')}
                        disabled={updating}
                      >
                        Mark as Completed
                      </Button>
                      <Button 
                        variant="outline" 
                        fullWidth
                        onClick={() => updateStatus('cancelled')}
                        disabled={updating}
                      >
                        Cancel Consultation
                      </Button>
                    </>
                  )}
                  <Link href={`/dashboard/reviews/create?consultation=${consultation.id}`}>
                    <Button variant="outline" fullWidth>
                      Write a Review
                    </Button>
                  </Link>
                </div>
              </CardBody>
            </Card>
          </motion.div>

          {/* Practitioner Info Card */}
          {consultation.practitioner && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.3 }}
            >
              <Card>
                <CardHeader>
                  <h3 className="text-lg font-semibold">Practitioner Info</h3>
                </CardHeader>
                <CardBody className="p-4">
                  <div className="space-y-3">
                    <p className="text-sm">
                      <span className="text-gray-500 dark:text-gray-400">Email: </span>
                      <a href={`mailto:${consultation.practitioner.email}`} className="text-blue-600 hover:underline">
                        {consultation.practitioner.email}
                      </a>
                    </p>
                    {consultation.practitioner.phone && (
                      <p className="text-sm">
                        <span className="text-gray-500 dark:text-gray-400">Phone: </span>
                        <a href={`tel:${consultation.practitioner.phone}`} className="text-blue-600 hover:underline">
                          {consultation.practitioner.phone}
                        </a>
                      </p>
                    )}
                  </div>
                </CardBody>
              </Card>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  )
}