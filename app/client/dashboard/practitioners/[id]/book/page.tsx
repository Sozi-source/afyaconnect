'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/app/contexts/AuthContext'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import {
  CalendarIcon,
  ClockIcon,
  UserIcon,
  MapPinIcon,
  CurrencyDollarIcon,
  StarIcon,
  ArrowLeftIcon,
  CheckCircleIcon,
  XMarkIcon
} from '@heroicons/react/24/outline'
import { Card, CardBody, CardHeader } from '@/app/components/ui/Card'
import { Button } from '@/app/components/ui/Buttons'
import { apiClient } from '@/app/lib/api'
import { useAvailability } from '@/app/hooks/useAvailability'
import { TimeSlotPicker } from '@/app/components/practitioners/TimeSlotPicker'
import { BookingConfirmationModal } from '@/app/components/booking/BookingConfirmationModal'
import type { Practitioner, TimeSlot } from '@/app/types'

export default function BookConsultationPage() {
  const { id } = useParams()
  const { user, isAuthenticated } = useAuth()
  const router = useRouter()
  const [practitioner, setPractitioner] = useState<Practitioner | null>(null)
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null)
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(true)
  const [isBooking, setIsBooking] = useState(false)  // Changed from booking
  const [showModal, setShowModal] = useState(false)
  const [bookingComplete, setBookingComplete] = useState(false)

  const { fetchTimeSlots, timeSlots, loading: slotsLoading } = useAvailability()

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login')
      return
    }

    if (user?.role === 'practitioner') {
      router.push('/practitioner/dashboard')
      return
    }

    const fetchData = async () => {
      try {
        const data = await apiClient.practitioners.getOne(Number(id))
        setPractitioner(data)
      } catch (error) {
        console.error('Failed to fetch practitioner:', error)
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      fetchData()
    }
  }, [id, isAuthenticated, user, router])

  const handleDateRangeChange = async (startDate: string, endDate: string) => {
    if (practitioner) {
      await fetchTimeSlots(practitioner.id, startDate, endDate)
    }
  }

  const handleSlotSelect = (slot: TimeSlot) => {
    setSelectedSlot(slot)
    setShowModal(true)
  }

  const handleBooking = async () => {
    if (!selectedSlot || !practitioner) return

    setIsBooking(true)  // Changed from setBooking
    try {
      await apiClient.consultations.create({
        practitioner: practitioner.id,
        date: selectedSlot.date,
        time: selectedSlot.start_time,
        duration_minutes: 60,
        client_notes: notes || undefined
      })
      setBookingComplete(true)
      setTimeout(() => {
        router.push('/client/dashboard/consultations')
      }, 2000)
    } catch (error) {
      console.error('Failed to book consultation:', error)
      alert('Failed to book consultation. Please try again.')
    } finally {
      setIsBooking(false)  // Changed from setBooking
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-emerald-200 border-t-emerald-600"></div>
      </div>
    )
  }

  if (!practitioner) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Practitioner not found</p>
        <Link href="/client/dashboard/practitioners" className="inline-block mt-4">
          <Button>Back to Practitioners</Button>
        </Link>
      </div>
    )
  }

  if (bookingComplete) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="max-w-md w-full">
          <CardBody className="p-8 text-center">
            <CheckCircleIcon className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Booking Confirmed!
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Your consultation has been booked successfully
            </p>
            <p className="text-sm text-gray-500 mb-4">
              Redirecting to your consultations...
            </p>
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-emerald-600 mx-auto"></div>
          </CardBody>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Link
        href={`/client/dashboard/practitioners/${practitioner.id}`}
        className="inline-flex items-center text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
      >
        <ArrowLeftIcon className="h-4 w-4 mr-2" />
        Back to Profile
      </Link>

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Book Consultation
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Schedule a session with {practitioner.full_name}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Calendar */}
        <div className="lg:col-span-2">
          <TimeSlotPicker
            practitionerId={practitioner.id}
            practitionerName={practitioner.full_name}
            onDateRangeChange={handleDateRangeChange}
            onSelectSlot={handleSlotSelect}
            selectedSlot={selectedSlot}
          />
        </div>

        {/* Right Column - Practitioner Info */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold dark:text-white">Practitioner Details</h3>
            </CardHeader>
            <CardBody className="p-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-full flex items-center justify-center text-white font-bold">
                  {practitioner.first_name[0]}{practitioner.last_name[0]}
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">
                    {practitioner.full_name}
                  </h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {practitioner.specialties[0]?.name || 'Practitioner'}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <InfoItem icon={MapPinIcon} label="Location" value={practitioner.city} />
                <InfoItem 
                  icon={CurrencyDollarIcon} 
                  label="Rate" 
                  value={`KES ${practitioner.hourly_rate}/hour`} 
                />
                <InfoItem 
                  icon={StarIcon} 
                  label="Experience" 
                  value={`${practitioner.years_of_experience} years`} 
                />
              </div>

              {practitioner.bio && (
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3">
                    {practitioner.bio}
                  </p>
                </div>
              )}
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold dark:text-white">Consultation Notes</h3>
            </CardHeader>
            <CardBody className="p-4">
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Share any specific concerns or topics you'd like to discuss..."
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 dark:bg-gray-800 dark:text-white"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                These notes will be shared with the practitioner
              </p>
            </CardBody>
          </Card>
        </div>
      </div>

      {/* Booking Modal - UPDATED: changed loading to isLoading */}
      <BookingConfirmationModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onConfirm={handleBooking}
        slot={selectedSlot}
        practitionerName={practitioner.full_name}
        isLoading={isBooking}  // Changed from loading to isLoading
      />
    </div>
  )
}

function InfoItem({ icon: Icon, label, value }: any) {
  return (
    <div className="flex items-center gap-2">
      <Icon className="h-4 w-4 text-gray-400" />
      <span className="text-sm text-gray-600 dark:text-gray-400">{label}:</span>
      <span className="text-sm font-medium text-gray-900 dark:text-white">{value}</span>
    </div>
  )
}