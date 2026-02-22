'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ChevronLeftIcon, 
  ChevronRightIcon,
  ClockIcon,
  CalendarIcon,
  XMarkIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline'
import { availabilityApi } from '@/app/lib/api/availability'
import type { TimeSlot } from '@/app/types'

interface ClientBookingCalendarProps {
  practitionerId: number
  practitionerName: string
   onSelectSlot?: (slot: TimeSlot) => void 
}

interface DayWithSlots {
  date: Date
  dateStr: string
  slots: TimeSlot[]
  isAvailable: boolean
}

export function ClientBookingCalendar({ 
  practitionerId, 
  practitionerName,
  onSelectSlot 
}: ClientBookingCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [slots, setSlots] = useState<TimeSlot[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null)
  const [showBookingModal, setShowBookingModal] = useState(false)

  // Fetch slots for current month
  useEffect(() => {
    const fetchSlots = async () => {
      setLoading(true)
      try {
        const year = currentMonth.getFullYear()
        const month = currentMonth.getMonth()
        const startDate = new Date(year, month, 1).toISOString().split('T')[0]
        const endDate = new Date(year, month + 1, 0).toISOString().split('T')[0]
        
        const availableSlots = await availabilityApi.getPractitionerSlots(
          practitionerId,
          startDate,
          endDate
        )
        setSlots(availableSlots)
      } catch (error) {
        console.error('Error fetching slots:', error)
      } finally {
        setLoading(false)
      }
    }

    if (practitionerId) {
      fetchSlots()
    }
  }, [practitionerId, currentMonth])

  // Generate calendar days
  const getDaysInMonth = (): DayWithSlots[] => {
    const year = currentMonth.getFullYear()
    const month = currentMonth.getMonth()
    
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    
    const days: DayWithSlots[] = []
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    // Create array of all days in month
    for (let d = 1; d <= lastDay.getDate(); d++) {
      const date = new Date(year, month, d)
      const dateStr = date.toISOString().split('T')[0]
      const daySlots = slots.filter(slot => slot.date === dateStr)
      
      days.push({
        date,
        dateStr,
        slots: daySlots,
        isAvailable: daySlots.length > 0 && date >= today
      })
    }
    
    return days
  }

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))
    setSelectedDate(null)
    setSelectedSlot(null)
  }

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))
    setSelectedDate(null)
    setSelectedSlot(null)
  }

  const handleDateClick = (dateStr: string) => {
    setSelectedDate(dateStr)
    setSelectedSlot(null)
  }

  const handleSlotSelect = (slot: TimeSlot) => {
    setSelectedSlot(slot)
    setShowBookingModal(true)
  }

  const confirmBooking = () => {
    if (selectedSlot && onSelectSlot) {
      onSelectSlot(selectedSlot)
      setShowBookingModal(false)
    }
  }

  const days = getDaysInMonth()
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  
  // Get slots for selected date
  const selectedDateSlots = selectedDate 
    ? slots.filter(slot => slot.date === selectedDate)
    : []

  const isPastDate = (date: Date) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return date < today
  }

  return (
    <>
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Book with {practitionerName}
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Select an available time slot below
          </p>
        </div>

        {/* Calendar Navigation */}
        <div className="p-4 flex items-center justify-between border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={handlePrevMonth}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
          >
            <ChevronLeftIcon className="h-5 w-5" />
          </button>
          <h3 className="text-lg font-semibold">
            {currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}
          </h3>
          <button
            onClick={handleNextMonth}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
          >
            <ChevronRightIcon className="h-5 w-5" />
          </button>
        </div>

        {/* Calendar Grid */}
        <div className="p-4">
          {/* Weekday headers */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {weekDays.map(day => (
              <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar days */}
          <div className="grid grid-cols-7 gap-1">
            {/* Add empty cells for days before month starts */}
            {Array.from({ length: new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay() }).map((_, i) => (
              <div key={`empty-${i}`} className="aspect-square p-2" />
            ))}

            {days.map((day, index) => {
              const isPast = isPastDate(day.date)
              const isSelected = selectedDate === day.dateStr
              
              return (
                <motion.button
                  key={index}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.01 }}
                  onClick={() => day.isAvailable && !isPast && handleDateClick(day.dateStr)}
                  disabled={!day.isAvailable || isPast}
                  className={`
                    aspect-square p-2 rounded-lg border-2 transition relative
                    ${day.isAvailable && !isPast 
                      ? 'cursor-pointer hover:border-green-400 hover:bg-green-50 dark:hover:bg-green-900/20' 
                      : 'cursor-not-allowed opacity-50'
                    }
                    ${isSelected ? 'border-green-500 bg-green-50 dark:bg-green-900/20' : 'border-transparent'}
                    ${isPast ? 'bg-gray-100 dark:bg-gray-800' : 'bg-white dark:bg-gray-800'}
                  `}
                >
                  <div className="h-full flex flex-col">
                    <span className={`text-sm font-medium ${
                      isPast ? 'text-gray-400' : 'text-gray-700 dark:text-gray-300'
                    }`}>
                      {day.date.getDate()}
                    </span>
                    
                    {/* Slot indicators */}
                    {day.isAvailable && !isPast && (
                      <>
                        <div className="mt-1 flex flex-wrap gap-1">
                          {day.slots.slice(0, 3).map((_, i) => (
                            <div
                              key={i}
                              className="w-1.5 h-1.5 rounded-full bg-green-500"
                            />
                          ))}
                          {day.slots.length > 3 && (
                            <span className="text-xs text-green-600">+{day.slots.length - 3}</span>
                          )}
                        </div>
                        <span className="text-xs text-green-600 mt-auto">
                          {day.slots.length} slot{day.slots.length !== 1 ? 's' : ''}
                        </span>
                      </>
                    )}

                    {/* No availability indicator */}
                    {!day.isAvailable && !isPast && (
                      <span className="text-xs text-gray-400 mt-auto">No slots</span>
                    )}

                    {isPast && (
                      <span className="text-xs text-gray-400 mt-auto">Past</span>
                    )}
                  </div>
                </motion.button>
              )
            })}
          </div>

          {/* Legend */}
          <div className="mt-4 flex items-center gap-4 text-sm border-t pt-4">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-green-500"></div>
              <span>Available</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-gray-300"></div>
              <span>No slots</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-gray-100 border border-gray-300"></div>
              <span>Past date</span>
            </div>
          </div>
        </div>

        {/* Selected Date Slots */}
        <AnimatePresence>
          {selectedDate && selectedDateSlots.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50"
            >
              <h3 className="font-medium mb-3 flex items-center gap-2">
                <CalendarIcon className="h-5 w-5 text-gray-500" />
                Available times for {new Date(selectedDate).toLocaleDateString('en-US', {
                  weekday: 'long',
                  month: 'long',
                  day: 'numeric'
                })}
              </h3>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                {selectedDateSlots.map((slot, index) => (
                  <motion.button
                    key={index}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => handleSlotSelect(slot)}
                    className="p-3 rounded-lg border-2 border-green-200 bg-green-50 
                             hover:border-green-500 hover:bg-green-100 
                             text-green-700 font-medium transition-all hover:scale-105"
                  >
                    <ClockIcon className="h-4 w-4 mx-auto mb-1" />
                    {slot.start_time.slice(0,5)}
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Loading state */}
        {loading && (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
            <p className="mt-2 text-gray-500">Loading available slots...</p>
          </div>
        )}
      </div>

      {/* Booking Confirmation Modal */}
      <AnimatePresence>
        {showBookingModal && selectedSlot && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
            onClick={() => setShowBookingModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-gray-800 rounded-xl max-w-md w-full p-6"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-bold">Confirm Booking</h3>
                <button
                  onClick={() => setShowBookingModal(false)}
                  className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-4 mb-6">
                <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <CheckCircleIcon className="h-6 w-6 text-green-600 mx-auto mb-2" />
                  <p className="text-center text-green-700 dark:text-green-300 font-medium">
                    Selected time is available!
                  </p>
                </div>

                <div className="space-y-2">
                  <p className="text-sm text-gray-500">Practitioner</p>
                  <p className="font-medium">{practitionerName}</p>
                </div>

                <div className="space-y-2">
                  <p className="text-sm text-gray-500">Date</p>
                  <p className="font-medium">
                    {new Date(selectedSlot.date).toLocaleDateString('en-US', {
                      weekday: 'long',
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </p>
                </div>

                <div className="space-y-2">
                  <p className="text-sm text-gray-500">Time</p>
                  <p className="font-medium text-lg">
                    {selectedSlot.start_time.slice(0,5)} - {selectedSlot.end_time.slice(0,5)}
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowBookingModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmBooking}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                >
                  Confirm Booking
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}