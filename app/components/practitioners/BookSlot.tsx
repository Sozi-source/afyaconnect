// app/components/practitioners/BookSlot.tsx
'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ClockIcon, 
  CalendarIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  CheckCircleIcon,
  XCircleIcon,
  SparklesIcon,
  ShieldCheckIcon,
  VideoCameraIcon,
  PhoneIcon,
  BuildingOfficeIcon
} from '@heroicons/react/24/outline'
import { apiClient } from '@/app/lib/api'
import type { Availability, PaginatedResponse } from '@/app/types'
import { Button } from '@/app/components/ui/Buttons'

interface BookSlotProps {
  practitionerId: number
  onBookingComplete?: string | (() => void)
}

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

const extractSlots = (data: Availability[] | PaginatedResponse<Availability>): Availability[] => {
  if (Array.isArray(data)) return data
  return data?.results || []
}

const formatTime = (time: string) => {
  return new Date(`2000-01-01T${time}`).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  })
}

export function BookSlot({ practitionerId, onBookingComplete }: BookSlotProps) {
  const router = useRouter()
  const [slots, setSlots] = useState<Availability[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedSlot, setSelectedSlot] = useState<Availability | null>(null)
  const [bookingId, setBookingId] = useState<number | null>(null)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [expandedDays, setExpandedDays] = useState<Record<number, boolean>>({})

  const loadSlots = useCallback(async () => {
    try {
      setLoading(true)
      const data = await apiClient.availability.getPractitionerAvailability(practitionerId)
      setSlots(extractSlots(data))
    } catch (error) {
      console.error('Failed to load slots:', error)
      setMessage({ type: 'error', text: 'Failed to load availability' })
    } finally {
      setLoading(false)
    }
  }, [practitionerId])

  useEffect(() => {
    loadSlots()
  }, [loadSlots])

  const handleBook = async (slot: Availability) => {
    if (!slot.start_time) return

    setBookingId(slot.id)
    setMessage(null)

    try {
      const today = new Date()
      const dateStr = slot.specific_date || today.toISOString().split('T')[0]

      await apiClient.consultations.create({
        practitioner: practitionerId,
        date: dateStr,
        time: slot.start_time.slice(0, 5),
        client_notes: `Booked via ${slot.recurrence_type} slot`
      })

      setMessage({ type: 'success', text: '✅ Booked successfully!' })
      setSelectedSlot(null)

      setTimeout(() => {
        if (typeof onBookingComplete === 'string') {
          router.push(onBookingComplete)
        } else if (typeof onBookingComplete === 'function') {
          onBookingComplete()
        } else {
          setMessage(null)
        }
      }, 1500)
    } catch (error: any) {
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'Failed to book slot' 
      })
      setBookingId(null)
    }
  }

  const toggleDay = (dayIndex: number) => {
    setExpandedDays(prev => ({
      ...prev,
      [dayIndex]: !prev[dayIndex]
    }))
  }

  const weeklySlots = slots.filter(s => s.recurrence_type === 'weekly')
  const oneTimeSlots = slots.filter(s => s.recurrence_type === 'one_time')

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-6">
        <div className="flex flex-col items-center justify-center py-8">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-emerald-100 border-t-emerald-600 rounded-full animate-spin" />
            <CalendarIcon className="w-6 h-6 text-emerald-600 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
          </div>
          <p className="mt-4 text-sm text-slate-500">Loading available times...</p>
        </div>
      </div>
    )
  }

  if (weeklySlots.length === 0 && oneTimeSlots.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-6 text-center">
        <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <CalendarIcon className="w-8 h-8 text-slate-400" />
        </div>
        <h3 className="font-semibold text-slate-800 mb-1">No Availability</h3>
        <p className="text-sm text-slate-500">This practitioner hasn't set any available times yet.</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden sticky top-24">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-600 p-5">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
            <CalendarIcon className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">Book Appointment</h3>
            <p className="text-sm text-emerald-100">Select a time slot below</p>
          </div>
        </div>
      </div>

      {/* Message */}
      <AnimatePresence>
        {message && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className={`mx-5 mt-5 p-3 rounded-xl flex items-center gap-2 ${
              message.type === 'success' 
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                : 'bg-red-50 text-red-700 border border-red-200'
            }`}
          >
            {message.type === 'success' 
              ? <CheckCircleIcon className="w-5 h-5 flex-shrink-0" />
              : <XCircleIcon className="w-5 h-5 flex-shrink-0" />
            }
            <span className="text-sm">{message.text}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Consultation Type Selector */}
      <div className="px-5 pt-5">
        <div className="grid grid-cols-3 gap-2 p-1 bg-slate-100 rounded-xl">
          {[
            { icon: VideoCameraIcon, label: 'Video' },
            { icon: PhoneIcon, label: 'Audio' },
            { icon: BuildingOfficeIcon, label: 'In Person' }
          ].map(({ icon: Icon, label }) => (
            <button
              key={label}
              className="flex items-center justify-center gap-2 p-2 rounded-lg text-sm font-medium text-slate-600 hover:bg-white hover:text-emerald-600 hover:shadow-sm transition-all"
            >
              <Icon className="w-4 h-4" />
              <span className="hidden sm:inline">{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Time Slots */}
      <div className="p-5 max-h-[500px] overflow-y-auto">
        {/* Weekly Slots */}
        {weeklySlots.length > 0 && (
          <div className="space-y-4">
            <h4 className="text-xs font-medium text-slate-400 uppercase tracking-wider">Weekly Schedule</h4>
            {DAYS.map((day, index) => {
              const daySlots = weeklySlots.filter(s => s.day_of_week === index)
              if (daySlots.length === 0) return null

              const isExpanded = expandedDays[index]
              const displaySlots = isExpanded ? daySlots : daySlots.slice(0, 2)
              const hasMore = daySlots.length > 2

              return (
                <div key={day} className="border-l-4 border-emerald-500 pl-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-slate-700">{day}</span>
                    <span className="text-xs text-slate-400">{daySlots.length} slots</span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2">
                    {displaySlots.map(slot => (
                      <button
                        key={slot.id}
                        onClick={() => handleBook(slot)}
                        disabled={bookingId === slot.id}
                        className={`
                          p-2 rounded-lg text-sm font-medium transition-all
                          ${bookingId === slot.id
                            ? 'bg-emerald-100 text-emerald-700 cursor-wait'
                            : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                          }
                        `}
                      >
                        {bookingId === slot.id ? (
                          <span className="flex items-center justify-center gap-2">
                            <span className="w-3 h-3 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
                            Booking...
                          </span>
                        ) : (
                          formatTime(slot.start_time)
                        )}
                      </button>
                    ))}
                  </div>

                  {hasMore && (
                    <button
                      onClick={() => toggleDay(index)}
                      className="flex items-center gap-1 mt-2 text-xs text-emerald-600 hover:text-emerald-700"
                    >
                      {isExpanded ? (
                        <>
                          <ChevronUpIcon className="w-3 h-3" />
                          Show less
                        </>
                      ) : (
                        <>
                          <ChevronDownIcon className="w-3 h-3" />
                          Show {daySlots.length - 2} more
                        </>
                      )}
                    </button>
                  )}
                </div>
              )
            })}
          </div>
        )}

        {/* One-time Slots */}
        {oneTimeSlots.length > 0 && (
          <div className="mt-6 pt-6 border-t border-slate-200">
            <h4 className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-3">Special Dates</h4>
            <div className="space-y-2">
              {oneTimeSlots.map(slot => {
                const date = slot.specific_date 
                  ? new Date(slot.specific_date)
                  : new Date()
                
                return (
                  <button
                    key={slot.id}
                    onClick={() => handleBook(slot)}
                    disabled={bookingId === slot.id}
                    className={`
                      w-full p-3 rounded-xl text-left transition-all border
                      ${bookingId === slot.id
                        ? 'bg-purple-100 text-purple-700 border-purple-200'
                        : 'bg-purple-50 text-purple-700 hover:bg-purple-100 border-purple-200'
                      }
                    `}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-medium">
                          {date.getDate()} {MONTHS[date.getMonth()]} {date.getFullYear()}
                        </p>
                        <p className="text-xs text-purple-600 mt-0.5">
                          {formatTime(slot.start_time)}
                        </p>
                      </div>
                      <SparklesIcon className="w-5 h-5 text-purple-500" />
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* No slots message */}
        {weeklySlots.length === 0 && oneTimeSlots.length === 0 && (
          <div className="text-center py-8">
            <p className="text-slate-500">No available slots at the moment</p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-4 bg-slate-50 border-t border-slate-200">
        <div className="flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <ShieldCheckIcon className="w-4 h-4 text-emerald-600" />
            <span>Secure booking</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            <span>Available today</span>
          </div>
        </div>
      </div>
    </div>
  )
}