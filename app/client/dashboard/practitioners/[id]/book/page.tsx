// app/client/dashboard/consultations/book/[id]/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/app/contexts/AuthContext'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
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
  ChevronRightIcon,
  VideoCameraIcon,
  PhoneIcon,
  ChatBubbleLeftIcon
} from '@heroicons/react/24/outline'
import { Card, CardBody, CardHeader } from '@/app/components/ui/Card'
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
      
      const [practitionerData, availabilityData] = await Promise.all([
        apiClient.practitioners.getOne(practitionerId!),
        apiClient.availability.getAll(practitionerId!)
      ])
      
      setPractitioner(practitionerData)
      setAvailability(availabilityData)
      
    } catch (error) {
      console.error('Error fetching data:', error)
      setError('Failed to load practitioner information')
    } finally {
      setLoading(false)
    }
  }

  const handleSlotSelect = (date: string, time: string) => {
    if (practitioner) {
      const slot: TimeSlot = {
        date,
        start_time: time,
        end_time: '',
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
      
      setTimeout(() => {
        router.push('/client/dashboard/consultations')
      }, 3000)
      
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
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-200 border-t-primary-600"></div>
      </div>
    )
  }

  if (error || !practitioner) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] p-4">
        <Card className="max-w-md w-full border-neutral-200">
          <CardBody className="p-8 text-center">
            <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <UserIcon className="h-8 w-8 text-neutral-400" />
            </div>
            <h3 className="text-lg font-semibold text-neutral-900 mb-2">Practitioner Not Found</h3>
            <p className="text-sm text-neutral-500 mb-6">
              {error || "The practitioner you're looking for doesn't exist"}
            </p>
            <Link href="/client/dashboard/practitioners">
              <Button>Back to Practitioners</Button>
            </Link>
          </CardBody>
        </Card>
      </div>
    )
  }

  const steps = [
    { key: 'datetime', label: 'Select Time' },
    { key: 'details', label: 'Details' },
    { key: 'confirmation', label: 'Confirm' }
  ]

  return (
    <div className="max-w-4xl mx-auto space-y-6 px-4 py-4 sm:py-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href={`/client/dashboard/practitioners/${practitionerId}`}
          className="p-2 hover:bg-neutral-100 rounded-lg transition"
        >
          <ArrowLeftIcon className="h-5 w-5 text-neutral-500" />
        </Link>
        <div className="flex-1">
          <h1 className="text-xl sm:text-2xl font-bold text-neutral-900">
            Book with Dr. {practitioner.first_name} {practitioner.last_name}
          </h1>
          
          {/* Step Progress */}
          <div className="flex items-center gap-2 mt-4">
            {steps.map((step, index) => {
              const stepIndex = steps.findIndex(s => s.key === currentStep)
              const isActive = step.key === currentStep
              const isPast = index < stepIndex
              
              return (
                <div key={step.key} className="flex items-center">
                  <div className={`
                    w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all
                    ${isActive 
                      ? 'bg-primary-600 text-white ring-4 ring-primary-100' 
                      : isPast
                        ? 'bg-primary-100 text-primary-700'
                        : 'bg-neutral-100 text-neutral-400'
                    }
                  `}>
                    {isPast ? <CheckCircleIcon className="h-4 w-4" /> : index + 1}
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`w-12 h-0.5 mx-2 ${
                      index < stepIndex ? 'bg-primary-500' : 'bg-neutral-200'
                    }`} />
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <AnimatePresence mode="wait">
        {currentStep === 'datetime' && (
          <motion.div
            key="datetime"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            <h2 className="text-lg font-semibold text-neutral-900">Select Date & Time</h2>
            <TimeSlotPicker
              practitionerId={practitioner.id}
              practitionerName={`Dr. ${practitioner.first_name} ${practitioner.last_name}`}
              onSelectSlot={handleSlotSelect}
              availability={availability}
            />
          </motion.div>
        )}

        {currentStep === 'details' && selectedSlot && (
          <motion.div
            key="details"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <Card className="border-neutral-200">
              <CardBody className="p-6">
                <h2 className="text-lg font-semibold text-neutral-900 mb-4">Consultation Details</h2>
                
                {/* Selected Slot Summary */}
                <div className="bg-primary-50 rounded-xl p-4 mb-6">
                  <div className="flex items-center gap-3 text-primary-700">
                    <CalendarIcon className="h-5 w-5" />
                    <span className="text-sm font-medium">
                      {new Date(selectedSlot.date).toLocaleDateString('en-US', {
                        weekday: 'long',
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 mt-2 text-primary-700">
                    <ClockIcon className="h-5 w-5" />
                    <span className="text-sm font-medium">{selectedSlot.start_time}</span>
                  </div>
                </div>

                {/* Duration Selection */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-neutral-700 mb-3">
                    Duration
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {[30, 60, 90, 120].map(d => (
                      <button
                        key={d}
                        onClick={() => setDuration(d)}
                        className={`
                          p-4 rounded-xl border-2 transition-all text-center
                          ${duration === d
                            ? 'border-primary-600 bg-primary-50'
                            : 'border-neutral-200 hover:border-primary-300 bg-white'
                          }
                        `}
                      >
                        <span className="block text-sm font-medium text-neutral-900">{d} min</span>
                        <span className="text-xs text-neutral-500 mt-1 block">
                          {formatPrice(practitioner.hourly_rate * d / 60)}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Consultation Type */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-neutral-700 mb-3">
                    Consultation Type
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { type: 'video', icon: VideoCameraIcon, label: 'Video' },
                      { type: 'in-person', icon: MapPinIcon, label: 'In Person' },
                      { type: 'phone', icon: PhoneIcon, label: 'Phone' }
                    ].map(({ type, icon: Icon, label }) => (
                      <button
                        key={type}
                        onClick={() => setConsultationType(type as any)}
                        className={`
                          p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2
                          ${consultationType === type
                            ? 'border-primary-600 bg-primary-50'
                            : 'border-neutral-200 hover:border-primary-300 bg-white'
                          }
                        `}
                      >
                        <Icon className={`h-5 w-5 ${
                          consultationType === type ? 'text-primary-600' : 'text-neutral-400'
                        }`} />
                        <span className="text-xs font-medium text-neutral-700">{label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Notes */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-neutral-700 mb-3">
                    Additional Notes
                  </label>
                  <div className="relative">
                    <ChatBubbleLeftIcon className="absolute left-3 top-3 h-5 w-5 text-neutral-400" />
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      rows={4}
                      placeholder="Any specific concerns or information to share?"
                      className="w-full pl-10 pr-4 py-3 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white text-neutral-900 placeholder-neutral-400 resize-none"
                    />
                  </div>
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-3 pt-4 border-t border-neutral-200">
                  <Button variant="outline" onClick={handleBack} className="border-neutral-200">
                    Back
                  </Button>
                  <Button onClick={handleContinueToConfirmation} className="bg-primary-600 hover:bg-primary-700 text-white">
                    Continue to Review
                    <ChevronRightIcon className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </CardBody>
            </Card>
          </motion.div>
        )}

        {currentStep === 'confirmation' && selectedSlot && (
          <motion.div
            key="confirmation"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <Card className="border-neutral-200">
              <CardBody className="p-6">
                <h2 className="text-lg font-semibold text-neutral-900 mb-4">Confirm Booking</h2>
                
                {/* Booking Summary */}
                <div className="space-y-4 mb-6">
                  <div className="bg-neutral-50 rounded-xl p-6">
                    <h3 className="font-medium text-neutral-900 mb-4">Booking Summary</h3>
                    
                    <div className="space-y-3">
                      <SummaryRow 
                        label="Practitioner" 
                        value={`Dr. ${practitioner.first_name} ${practitioner.last_name}`} 
                      />
                      <SummaryRow 
                        label="Date" 
                        value={new Date(selectedSlot.date).toLocaleDateString('en-US', {
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })} 
                      />
                      <SummaryRow label="Time" value={selectedSlot.start_time} />
                      <SummaryRow label="Duration" value={`${duration} minutes`} />
                      <SummaryRow label="Type" value={consultationType} capitalize />
                      <SummaryRow 
                        label="Total" 
                        value={formatPrice(practitioner.hourly_rate * duration / 60)}
                        highlight 
                      />
                    </div>
                  </div>

                  {notes && (
                    <div className="bg-neutral-50 rounded-xl p-4">
                      <p className="text-sm font-medium text-neutral-700 mb-2">Your Notes:</p>
                      <p className="text-sm text-neutral-600">{notes}</p>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-3 pt-4 border-t border-neutral-200">
                  <Button variant="outline" onClick={handleBack} className="border-neutral-200">
                    Back
                  </Button>
                  <Button 
                    onClick={handleConfirmBooking} 
                    disabled={loading}
                    className="bg-primary-600 hover:bg-primary-700 text-white min-w-[120px]"
                  >
                    {loading ? 'Booking...' : 'Confirm Booking'}
                  </Button>
                </div>
              </CardBody>
            </Card>
          </motion.div>
        )}

        {currentStep === 'success' && (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <Card className="border-neutral-200">
              <CardBody className="py-12 px-6 text-center">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircleIcon className="h-10 w-10 text-green-600" />
                </div>
                <h2 className="text-2xl font-bold text-neutral-900 mb-3">Booking Confirmed!</h2>
                <p className="text-neutral-500 mb-8 max-w-md mx-auto">
                  Your consultation has been scheduled. You'll receive a confirmation email with all the details.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Link href="/client/dashboard/consultations">
                    <Button variant="outline" className="border-neutral-200">
                      View Consultations
                    </Button>
                  </Link>
                  <Link href="/client/dashboard/practitioners">
                    <Button className="bg-primary-600 hover:bg-primary-700 text-white">
                      Book Another
                    </Button>
                  </Link>
                </div>
              </CardBody>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function SummaryRow({ label, value, capitalize = false, highlight = false }: { 
  label: string; 
  value: string; 
  capitalize?: boolean;
  highlight?: boolean;
}) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-neutral-500">{label}:</span>
      <span className={`font-medium ${highlight ? 'text-primary-600 text-base' : 'text-neutral-900'} ${capitalize ? 'capitalize' : ''}`}>
        {value}
      </span>
    </div>
  )
}