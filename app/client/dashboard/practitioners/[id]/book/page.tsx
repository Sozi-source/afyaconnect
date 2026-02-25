'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/app/contexts/AuthContext'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  ArrowLeftIcon,
  CalendarIcon,
  ClockIcon,
  UserIcon,
  MapPinIcon,
  CurrencyDollarIcon,
  BriefcaseIcon,
  StarIcon,
  CheckCircleIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline'
import { Card, CardBody } from '@/app/components/ui/Card'
import { Button } from '@/app/components/ui/Buttons'
import { TimeSlotPicker } from '@/app/components/practitioners/TimeSlotPicker'
import { apiClient } from '@/app/lib/api'
import { toast } from 'react-hot-toast'
import type { Practitioner, Availability, TimeSlot } from '@/app/types'

type BookingStep = 'datetime' | 'details' | 'confirmation' | 'success'

export default function BookWithPractitionerPage() {
  const { user, isAuthenticated, isLoading } = useAuth()
  const router = useRouter()
  const params = useParams()
  const practitionerId = params?.id ? parseInt(params.id as string) : null

  const [practitioner, setPractitioner] = useState<Practitioner | null>(null)
  const [availability, setAvailability] = useState<Availability[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentStep, setCurrentStep] = useState<BookingStep>('datetime')
  
  // Booking details
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null)
  const [duration, setDuration] = useState(60)
  const [notes, setNotes] = useState('')
  const [consultationType, setConsultationType] = useState<'video' | 'in-person' | 'phone'>('video')

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login')
      return
    }
    if (practitionerId) {
      fetchData()
    }
  }, [isLoading, isAuthenticated, practitionerId, router])

  const fetchData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Fetch practitioner details
      const practitionerData = await apiClient.practitioners.getOne(practitionerId!)
      setPractitioner(practitionerData)
      
      // Fetch availability
      const availabilityData = await apiClient.availability.getAll(practitionerId!)
      setAvailability(availabilityData)
      
    } catch (error) {
      console.error('Error fetching data:', error)
      setError('Failed to load practitioner information')
    } finally {
      setLoading(false)
    }
  }

  const handleSlotSelect = (date: string, time: string) => {
    // Create a TimeSlot object from the selected date and time
    if (practitioner) {
      const slot: TimeSlot = {
        date,
        start_time: time,
        end_time: '', // This might need to be calculated based on duration
        practitioner_id: practitioner.id,
        practitioner_name: `Dr. ${practitioner.first_name} ${practitioner.last_name}`,
        is_available: true
      }
      setSelectedSlot(slot)
      setCurrentStep('details')
    }
  }

  const handleBack = () => {
    if (currentStep === 'details') {
      setCurrentStep('datetime')
    } else if (currentStep === 'confirmation') {
      setCurrentStep('details')
    }
  }

  const handleContinueToConfirmation = () => {
    setCurrentStep('confirmation')
  }

  const handleConfirmBooking = async () => {
    if (!practitioner || !selectedSlot) return

    try {
      setLoading(true)
      
      await apiClient.consultations.create({
        practitioner: practitioner.id,
        date: selectedSlot.date,
        time: selectedSlot.start_time,
        duration_minutes: duration,
        client_notes: notes.trim() || undefined
      })
      
      setCurrentStep('success')
      toast.success('Consultation booked successfully!')
      
    } catch (error) {
      console.error('Error booking consultation:', error)
      toast.error('Failed to book consultation')
    } finally {
      setLoading(false)
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price)
  }

  if (isLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-emerald-200 border-t-emerald-600"></div>
      </div>
    )
  }

  if (error || !practitioner) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card>
          <CardBody className="p-8 text-center">
            <UserIcon className="h-16 w-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold mb-2">Practitioner Not Found</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {error || 'The practitioner you\'re looking for doesn\'t exist'}
            </p>
            <Link href="/client/dashboard/practitioners">
              <Button>Back to Practitioners</Button>
            </Link>
          </CardBody>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header with Steps */}
      <div className="flex items-center gap-4">
        <Link
          href={`/client/dashboard/practitioners/${practitionerId}`}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition"
        >
          <ArrowLeftIcon className="h-5 w-5 text-gray-600 dark:text-gray-400" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">Book with Dr. {practitioner.first_name} {practitioner.last_name}</h1>
          
          {/* Step Indicator */}
          <div className="flex items-center gap-2 mt-4">
            {['datetime', 'details', 'confirmation'].map((step, index) => {
              const stepNumber = index + 1
              const isActive = currentStep === step
              const isPast = ['datetime', 'details', 'confirmation'].indexOf(currentStep) > index
              
              return (
                <div key={step} className="flex items-center">
                  <div className={`
                    w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
                    ${isActive 
                      ? 'bg-emerald-600 text-white ring-4 ring-emerald-100 dark:ring-emerald-900/30' 
                      : isPast
                        ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400'
                        : 'bg-gray-200 text-gray-500 dark:bg-gray-800 dark:text-gray-500'
                    }
                  `}>
                    {isPast ? <CheckCircleIcon className="h-4 w-4" /> : stepNumber}
                  </div>
                  {index < 2 && (
                    <div className={`
                      w-12 h-0.5 mx-2
                      ${isPast ? 'bg-emerald-500' : 'bg-gray-200 dark:bg-gray-800'}
                    `} />
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Main Content */}
      {currentStep === 'datetime' && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Select Date & Time</h2>
          <TimeSlotPicker
            practitionerId={practitioner.id}
            practitionerName={`Dr. ${practitioner.first_name} ${practitioner.last_name}`}
            onSelectSlot={handleSlotSelect}
            availability={availability}
          />
        </div>
      )}

      {currentStep === 'details' && selectedSlot && (
        <Card>
          <CardBody className="p-6">
            <h2 className="text-lg font-semibold mb-4">Consultation Details</h2>
            
            {/* Selected Slot Summary */}
            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 mb-6">
              <div className="flex items-center gap-3 mb-3">
                <CalendarIcon className="h-5 w-5 text-gray-400" />
                <span className="text-sm">
                  {new Date(selectedSlot.date).toLocaleDateString('en-US', {
                    weekday: 'long',
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <ClockIcon className="h-5 w-5 text-gray-400" />
                <span className="text-sm">{selectedSlot.start_time}</span>
              </div>
            </div>

            {/* Duration Selection */}
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">Duration (minutes)</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[30, 60, 90, 120].map(d => (
                  <button
                    key={d}
                    onClick={() => setDuration(d)}
                    className={`
                      p-3 rounded-lg border-2 transition text-center
                      ${duration === d
                        ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-900/30'
                        : 'border-gray-200 hover:border-emerald-300 dark:border-gray-700 dark:hover:border-emerald-800'
                      }
                    `}
                  >
                    <span className="block text-sm font-medium">{d} min</span>
                    <span className="text-xs text-gray-500">
                      +{formatPrice(practitioner.hourly_rate * d / 60)}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Consultation Type */}
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">Consultation Type</label>
              <div className="grid grid-cols-3 gap-2">
                {(['video', 'in-person', 'phone'] as const).map(type => (
                  <button
                    key={type}
                    onClick={() => setConsultationType(type)}
                    className={`
                      p-3 rounded-lg border-2 capitalize transition
                      ${consultationType === type
                        ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-900/30'
                        : 'border-gray-200 hover:border-emerald-300 dark:border-gray-700 dark:hover:border-emerald-800'
                      }
                    `}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            {/* Notes */}
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">Additional Notes (Optional)</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={4}
                placeholder="Any specific concerns or information to share?"
                className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white dark:bg-gray-900 text-gray-900 dark:text-white resize-none"
              />
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={handleBack}>
                Back
              </Button>
              <Button onClick={handleContinueToConfirmation}>
                Continue to Review
                <ChevronRightIcon className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </CardBody>
        </Card>
      )}

      {currentStep === 'confirmation' && selectedSlot && (
        <Card>
          <CardBody className="p-6">
            <h2 className="text-lg font-semibold mb-4">Confirm Booking</h2>
            
            {/* Booking Summary */}
            <div className="space-y-4 mb-6">
              <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4">
                <h3 className="font-medium mb-3">Booking Summary</h3>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Practitioner:</span>
                    <span className="font-medium">Dr. {practitioner.first_name} {practitioner.last_name}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Date:</span>
                    <span>{new Date(selectedSlot.date).toLocaleDateString('en-US', {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    })}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Time:</span>
                    <span>{selectedSlot.start_time}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Duration:</span>
                    <span>{duration} minutes</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Type:</span>
                    <span className="capitalize">{consultationType}</span>
                  </div>
                  <div className="border-t border-gray-200 dark:border-gray-700 my-2 pt-2">
                    <div className="flex justify-between font-semibold">
                      <span>Total:</span>
                      <span className="text-emerald-600">{formatPrice(practitioner.hourly_rate * duration / 60)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {notes && (
                <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4">
                  <p className="text-sm font-medium mb-2">Your Notes:</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{notes}</p>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={handleBack}>
                Back
              </Button>
              <Button onClick={handleConfirmBooking} disabled={loading}>
                {loading ? 'Booking...' : 'Confirm Booking'}
              </Button>
            </div>
          </CardBody>
        </Card>
      )}

      {currentStep === 'success' && (
        <Card>
          <CardBody className="p-12 text-center">
            <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircleIcon className="h-10 w-10 text-emerald-600 dark:text-emerald-400" />
            </div>
            <h2 className="text-2xl font-bold mb-3">Booking Confirmed!</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-8">
              Your consultation has been scheduled. Check your email for details.
            </p>
            <div className="flex justify-center gap-3">
              <Link href="/client/dashboard/consultations">
                <Button variant="outline">View Consultations</Button>
              </Link>
              <Link href="/client/dashboard/practitioners">
                <Button>Book Another</Button>
              </Link>
            </div>
          </CardBody>
        </Card>
      )}
    </div>
  )
}