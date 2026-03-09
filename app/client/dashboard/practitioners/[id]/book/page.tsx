// app/client/dashboard/practitioners/book/[id]/page.tsx
'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
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
  CheckCircleIcon,
  ChevronRightIcon,
  VideoCameraIcon,
  PhoneIcon,
  ChatBubbleLeftIcon,
  SparklesIcon,
  XMarkIcon
} from '@heroicons/react/24/outline'
import { Card, CardBody } from '@/app/components/ui/Card'
import { Button } from '@/app/components/ui/Buttons'
import { apiClient } from '@/app/lib/api'
import { toast } from 'react-hot-toast'
import type { Practitioner, Availability } from '@/app/types'
import { ChevronLeftIcon } from 'lucide-react'

// ============================================================================
// Types
// ============================================================================
type BookingStep = 'datetime' | 'details' | 'confirmation' | 'success'
type ConsultationType = 'video' | 'in-person' | 'phone'

// ============================================================================
// Helper Functions
// ============================================================================
const formatPrice = (price: number) => {
  return new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency: 'KES',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(price)
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  })
}

const formatTime = (time: string) => {
  return new Date(`2000-01-01T${time}`).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  })
}

const getDayName = (day: number) => {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  return days[day]
}

// ============================================================================
// Step Indicator
// ============================================================================
const StepIndicator = ({ currentStep }: { currentStep: BookingStep }) => {
  const steps = [
    { key: 'datetime', label: 'Select Time', icon: ClockIcon },
    { key: 'details', label: 'Details', icon: ChatBubbleLeftIcon },
    { key: 'confirmation', label: 'Confirm', icon: CheckCircleIcon }
  ]
  
  const currentIndex = steps.findIndex(s => s.key === currentStep)
  
  return (
    <div className="flex items-center justify-between max-w-md mx-auto mb-8">
      {steps.map((step, index) => {
        const Icon = step.icon
        const isActive = step.key === currentStep
        const isPast = index < currentIndex
        
        return (
          <div key={step.key} className="flex items-center flex-1">
            <div className="flex flex-col items-center">
              <div className={`
                w-10 h-10 rounded-full flex items-center justify-center transition-all
                ${isActive 
                  ? 'bg-emerald-600 text-white ring-4 ring-emerald-100' 
                  : isPast
                    ? 'bg-emerald-100 text-emerald-700'
                    : 'bg-slate-100 text-slate-400'
                }
              `}>
                {isPast ? <CheckCircleIcon className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
              </div>
              <span className={`
                text-xs mt-2
                ${isActive ? 'text-emerald-600 font-medium' : 'text-slate-500'}
              `}>
                {step.label}
              </span>
            </div>
            {index < steps.length - 1 && (
              <div className={`flex-1 h-0.5 mx-4 ${
                index < currentIndex ? 'bg-emerald-500' : 'bg-slate-200'
              }`} />
            )}
          </div>
        )
      })}
    </div>
  )
}

// ============================================================================
// Date Picker Component
// ============================================================================
const DatePicker = ({ 
  selectedDate, 
  onSelectDate,
  availability 
}: { 
  selectedDate: string | null
  onSelectDate: (date: string) => void
  availability: Availability[]
}) => {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  
  // Generate available dates from weekly slots
  const availableDates = useMemo(() => {
    const dates = new Set<string>()
    const today = new Date()
    const next60Days = new Date()
    next60Days.setDate(today.getDate() + 60)

    availability.forEach(slot => {
      if (slot.recurrence_type === 'weekly' && slot.day_of_week !== null) {
        for (let d = new Date(today); d <= next60Days; d.setDate(d.getDate() + 1)) {
          if (d.getDay() === slot.day_of_week) {
            dates.add(d.toISOString().split('T')[0])
          }
        }
      } else if (slot.specific_date) {
        dates.add(slot.specific_date)
      }
    })

    return dates
  }, [availability])

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    
    const days: (Date | null)[] = []
    for (let i = 0; i < firstDay.getDay(); i++) days.push(null)
    for (let d = 1; d <= lastDay.getDate(); d++) days.push(new Date(year, month, d))
    return days
  }

  const isDateAvailable = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0]
    return availableDates.has(dateStr)
  }

  const isPastDate = (date: Date) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return date < today
  }

  const days = getDaysInMonth(currentMonth)
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]

  return (
    <Card className="border-slate-200">
      <CardBody className="p-5">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => setCurrentMonth(new Date(currentMonth.setMonth(currentMonth.getMonth() - 1)))}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <ChevronLeftIcon className="h-5 w-5" />
          </button>
          <h3 className="font-semibold">
            {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
          </h3>
          <button
            onClick={() => setCurrentMonth(new Date(currentMonth.setMonth(currentMonth.getMonth() + 1)))}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <ChevronRightIcon className="h-5 w-5" />
          </button>
        </div>
        
        <div className="grid grid-cols-7 gap-1 mb-2">
          {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
            <div key={day} className="text-center text-xs font-medium text-slate-400 py-2">
              {day}
            </div>
          ))}
        </div>
        
        <div className="grid grid-cols-7 gap-1">
          {days.map((day, index) => {
            if (!day) {
              return <div key={`empty-${index}`} className="aspect-square" />
            }
            
            const dateStr = day.toISOString().split('T')[0]
            const isAvailable = isDateAvailable(day)
            const isPast = isPastDate(day)
            const isSelected = selectedDate === dateStr
            
            return (
              <button
                key={dateStr}
                onClick={() => isAvailable && !isPast && onSelectDate(dateStr)}
                disabled={!isAvailable || isPast}
                className={`
                  aspect-square rounded-lg text-sm font-medium transition-all
                  ${isSelected 
                    ? 'bg-emerald-600 text-white shadow-md' 
                    : isAvailable && !isPast
                      ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 cursor-pointer'
                      : 'bg-slate-50 text-slate-300 cursor-not-allowed'}
                `}
              >
                {day.getDate()}
              </button>
            )
          })}
        </div>
        
        <div className="mt-4 flex items-center gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-emerald-50 rounded" />
            <span>Available</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-emerald-600 rounded" />
            <span>Selected</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-slate-50 rounded" />
            <span>Unavailable</span>
          </div>
        </div>

        {/* Debug Info - Remove in production */}
        <div className="mt-4 p-2 bg-slate-100 rounded text-xs">
          <p>Total Slots: {availability.length}</p>
          <p>Available Dates: {availableDates.size}</p>
        </div>
      </CardBody>
    </Card>
  )
}

// ============================================================================
// Time Slot Picker
// ============================================================================
const TimeSlotPicker = ({ 
  date,
  availability,
  selectedTime,
  onSelectTime
}: { 
  date: string
  availability: Availability[]
  selectedTime: string | null
  onSelectTime: (time: string) => void
}) => {
  const timeSlots = useMemo(() => {
    const selectedDate = new Date(date)
    
    return availability
      .filter(slot => {
        if (slot.recurrence_type === 'weekly' && slot.day_of_week !== null) {
          return selectedDate.getDay() === slot.day_of_week
        }
        if (slot.specific_date) {
          return slot.specific_date === date
        }
        return false
      })
      .map(slot => ({
        id: slot.id,
        time: slot.start_time.slice(0, 5),
        endTime: slot.end_time?.slice(0, 5)
      }))
      .sort((a, b) => a.time.localeCompare(b.time))
  }, [date, availability])

  if (timeSlots.length === 0) {
    return (
      <Card className="border-slate-200">
        <CardBody className="p-8 text-center">
          <ClockIcon className="h-12 w-12 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500">No times available for this date</p>
        </CardBody>
      </Card>
    )
  }

  return (
    <Card className="border-slate-200">
      <CardBody className="p-5">
        <h3 className="font-semibold text-slate-800 mb-4">Available Times</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {timeSlots.map(slot => (
            <button
              key={slot.id}
              onClick={() => onSelectTime(slot.time)}
              className={`
                p-3 rounded-lg text-sm font-medium transition-all
                ${selectedTime === slot.time
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                }
              `}
            >
              {formatTime(slot.time)}
            </button>
          ))}
        </div>
      </CardBody>
    </Card>
  )
}

// ============================================================================
// Summary Row
// ============================================================================
const SummaryRow = ({ label, value, capitalize = false, highlight = false }: { 
  label: string
  value: string
  capitalize?: boolean
  highlight?: boolean
}) => (
  <div className="flex justify-between items-center py-2">
    <span className="text-sm text-slate-500">{label}</span>
    <span className={`
      text-sm font-medium
      ${highlight ? 'text-emerald-600 text-base' : 'text-slate-800'}
      ${capitalize ? 'capitalize' : ''}
    `}>
      {value}
    </span>
  </div>
)

// ============================================================================
// Main Component
// ============================================================================
export default function ClientBookPage() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth()
  const router = useRouter()
  const params = useParams()
  const practitionerId = params?.id ? parseInt(params.id as string) : null

  const [practitioner, setPractitioner] = useState<Practitioner | null>(null)
  const [availability, setAvailability] = useState<Availability[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentStep, setCurrentStep] = useState<BookingStep>('datetime')
  
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [selectedTime, setSelectedTime] = useState<string | null>(null)
  const [duration, setDuration] = useState(60)
  const [notes, setNotes] = useState('')
  const [consultationType, setConsultationType] = useState<ConsultationType>('video')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login')
      return
    }
    if (practitionerId) {
      fetchData()
    }
  }, [authLoading, isAuthenticated, practitionerId])

  const fetchData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const [practitionerData, availabilityData] = await Promise.all([
        apiClient.practitioners.getOne(practitionerId!),
        apiClient.practitioners.getAvailability(practitionerId!)
      ])
      
      setPractitioner(practitionerData)
      
      // Parse availability
      const slots = Array.isArray(availabilityData) 
        ? availabilityData 
        : (availabilityData?.results || [])
      
      console.log(`📦 Found ${slots.length} availability slots`)
      setAvailability(slots)
      
    } catch (error) {
      console.error('Error fetching data:', error)
      setError('Failed to load practitioner information')
    } finally {
      setLoading(false)
    }
  }

  const handleBack = () => {
    if (currentStep === 'details') {
      setCurrentStep('datetime')
    } else if (currentStep === 'confirmation') {
      setCurrentStep('details')
    }
  }

  const handleConfirmBooking = async () => {
    if (!practitioner || !selectedDate || !selectedTime) return

    setIsSubmitting(true)
    
    try {
      await apiClient.consultations.create({
        practitioner: practitioner.id,
        date: selectedDate,
        time: selectedTime,
        duration_minutes: duration,
        client_notes: notes.trim() || undefined
      })
      
      setCurrentStep('success')
      toast.success('Consultation booked successfully!')
      
      setTimeout(() => {
        router.push('/client/dashboard/consultations')
      }, 3000)
      
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to book consultation')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-emerald-200 border-t-emerald-600" />
      </div>
    )
  }

  if (error || !practitioner) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex items-center justify-center p-4">
        <Card className="max-w-md">
          <CardBody className="p-8 text-center">
            <XMarkIcon className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Error</h3>
            <p className="text-slate-500 mb-6">{error || 'Practitioner not found'}</p>
            <Link href="/client/dashboard/practitioners">
              <Button>Back to Practitioners</Button>
            </Link>
          </CardBody>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white py-6 sm:py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Link
            href={`/client/dashboard/practitioners/${practitionerId}`}
            className="p-2 hover:bg-slate-100 rounded-lg transition"
          >
            <ArrowLeftIcon className="h-5 w-5 text-slate-600" />
          </Link>
          <div>
            <div className="flex items-center gap-2 text-emerald-600 mb-1">
              <SparklesIcon className="h-4 w-4" />
              <span className="text-xs font-medium uppercase">New Booking</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-light text-slate-800">
              Book with <span className="font-semibold text-emerald-600">
                Dr. {practitioner.first_name} {practitioner.last_name}
              </span>
            </h1>
          </div>
        </div>

        <StepIndicator currentStep={currentStep} />

        <AnimatePresence mode="wait">
          {currentStep === 'datetime' && (
            <motion.div
              key="datetime"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <h2 className="text-lg font-semibold text-slate-800">Select Date & Time</h2>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <DatePicker
                  selectedDate={selectedDate}
                  onSelectDate={setSelectedDate}
                  availability={availability}
                />
                
                {selectedDate && (
                  <TimeSlotPicker
                    date={selectedDate}
                    availability={availability}
                    selectedTime={selectedTime}
                    onSelectTime={setSelectedTime}
                  />
                )}
              </div>

              {selectedDate && selectedTime && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex justify-end"
                >
                  <Button
                    onClick={() => setCurrentStep('details')}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white px-8"
                  >
                    Continue to Details
                    <ChevronRightIcon className="h-4 w-4 ml-2" />
                  </Button>
                </motion.div>
              )}
            </motion.div>
          )}

          {currentStep === 'details' && selectedDate && selectedTime && (
            <motion.div
              key="details"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <Card>
                <CardBody className="p-6">
                  <h2 className="text-lg font-semibold mb-4">Consultation Details</h2>
                  
                  <div className="bg-emerald-50 rounded-xl p-4 mb-6">
                    <div className="flex items-center gap-3 text-emerald-700">
                      <CalendarIcon className="h-5 w-5" />
                      <span className="text-sm font-medium">{formatDate(selectedDate)}</span>
                    </div>
                    <div className="flex items-center gap-3 mt-2 text-emerald-700">
                      <ClockIcon className="h-5 w-5" />
                      <span className="text-sm font-medium">{formatTime(selectedTime)}</span>
                    </div>
                  </div>

                  <div className="mb-6">
                    <label className="block text-sm font-medium text-slate-700 mb-3">Duration</label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {[30, 60, 90, 120].map(d => (
                        <button
                          key={d}
                          onClick={() => setDuration(d)}
                          className={`
                            p-4 rounded-xl border-2 transition-all text-center
                            ${duration === d
                              ? 'border-emerald-600 bg-emerald-50'
                              : 'border-slate-200 hover:border-emerald-300'
                            }
                          `}
                        >
                          <span className="block text-sm font-medium">{d} min</span>
                          <span className="text-xs text-slate-500 mt-1">
                            {formatPrice(practitioner.hourly_rate * d / 60)}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="mb-6">
                    <label className="block text-sm font-medium text-slate-700 mb-3">Type</label>
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { type: 'video', icon: VideoCameraIcon, label: 'Video' },
                        { type: 'in-person', icon: MapPinIcon, label: 'In Person' },
                        { type: 'phone', icon: PhoneIcon, label: 'Phone' }
                      ].map(({ type, icon: Icon, label }) => (
                        <button
                          key={type}
                          onClick={() => setConsultationType(type as ConsultationType)}
                          className={`
                            p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2
                            ${consultationType === type
                              ? 'border-emerald-600 bg-emerald-50'
                              : 'border-slate-200 hover:border-emerald-300'
                            }
                          `}
                        >
                          <Icon className={`h-5 w-5 ${
                            consultationType === type ? 'text-emerald-600' : 'text-slate-400'
                          }`} />
                          <span className="text-xs font-medium">{label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="mb-6">
                    <label className="block text-sm font-medium text-slate-700 mb-3">Notes</label>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      rows={4}
                      placeholder="Any specific concerns?"
                      className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div className="flex justify-end gap-3 pt-4 border-t">
                    <Button variant="outline" onClick={handleBack}>Back</Button>
                    <Button 
                      onClick={() => setCurrentStep('confirmation')}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white"
                    >
                      Continue to Review
                    </Button>
                  </div>
                </CardBody>
              </Card>
            </motion.div>
          )}

          {currentStep === 'confirmation' && selectedDate && selectedTime && (
            <motion.div
              key="confirmation"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <Card>
                <CardBody className="p-6">
                  <h2 className="text-lg font-semibold mb-4">Confirm Booking</h2>
                  
                  <div className="space-y-4 mb-6">
                    <div className="bg-slate-50 rounded-xl p-6">
                      <h3 className="font-medium mb-4 flex items-center gap-2">
                        <SparklesIcon className="h-5 w-5 text-emerald-600" />
                        Summary
                      </h3>
                      
                      <div className="space-y-3">
                        <SummaryRow label="Practitioner" value={`Dr. ${practitioner.first_name} ${practitioner.last_name}`} />
                        <SummaryRow label="Date" value={formatDate(selectedDate)} />
                        <SummaryRow label="Time" value={formatTime(selectedTime)} />
                        <SummaryRow label="Duration" value={`${duration} minutes`} />
                        <SummaryRow label="Type" value={consultationType} capitalize />
                        <SummaryRow label="Total" value={formatPrice(practitioner.hourly_rate * duration / 60)} highlight />
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 pt-4 border-t">
                    <Button variant="outline" onClick={handleBack}>Back</Button>
                    <Button 
                      onClick={handleConfirmBooking}
                      disabled={isSubmitting}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white"
                    >
                      {isSubmitting ? 'Booking...' : 'Confirm Booking'}
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
              <Card>
                <CardBody className="py-12 px-6 text-center">
                  <CheckCircleIcon className="h-16 w-16 text-green-500 mx-auto mb-4" />
                  <h2 className="text-2xl font-bold mb-2">Booking Confirmed!</h2>
                  <p className="text-slate-500 mb-6">
                    Your consultation has been scheduled.
                  </p>
                  <div className="flex gap-3 justify-center">
                    <Link href="/client/dashboard/consultations">
                      <Button variant="outline">View Consultations</Button>
                    </Link>
                    <Link href="/client/dashboard/practitioners">
                      <Button className="bg-emerald-600 hover:bg-emerald-700 text-white">
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
    </div>
  )
}