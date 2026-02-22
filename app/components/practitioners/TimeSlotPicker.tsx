'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ClockIcon,
  CalendarIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline'
import { Card, CardBody, CardHeader } from '@/app/components/ui/Card'
import { useAvailability } from '@/app/hooks/useAvailability'
import type { TimeSlot } from '@/app/types'

interface TimeSlotPickerProps {
  practitionerId: number
  practitionerName: string
  onDateRangeChange?: (startDate: string, endDate: string) => void
  onSelectSlot: (slot: TimeSlot) => void
  selectedSlot: TimeSlot | null
}

interface DayWithSlots {
  date: Date
  dateStr: string
  slots: TimeSlot[]
  isAvailable: boolean
  slotCount: number
}

export function TimeSlotPicker({
  practitionerId,
  practitionerName,
  onDateRangeChange,
  onSelectSlot,
  selectedSlot
}: TimeSlotPickerProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [slots, setSlots] = useState<TimeSlot[]>([])
  const [loading, setLoading] = useState(false)
  const [view, setView] = useState<'calendar' | 'list'>('calendar')

  const { fetchTimeSlots } = useAvailability()

  // Fetch slots when month changes
  useEffect(() => {
    const loadSlots = async () => {
      setLoading(true)
      try {
        const year = currentMonth.getFullYear()
        const month = currentMonth.getMonth()
        const startDate = new Date(year, month, 1).toISOString().split('T')[0]
        const endDate = new Date(year, month + 1, 0).toISOString().split('T')[0]
        
        onDateRangeChange?.(startDate, endDate)
        
        const availableSlots = await fetchTimeSlots(practitionerId, startDate, endDate)
        setSlots(availableSlots)
        
        // Clear selected date if no slots available
        if (selectedDate) {
          const hasSlotsOnDate = availableSlots.some(slot => slot.date === selectedDate)
          if (!hasSlotsOnDate) {
            setSelectedDate(null)
          }
        }
      } catch (error) {
        console.error('Error fetching slots:', error)
      } finally {
        setLoading(false)
      }
    }

    if (practitionerId) {
      loadSlots()
    }
  }, [practitionerId, currentMonth, onDateRangeChange, fetchTimeSlots])

  // Generate calendar days
  const getDaysInMonth = (): DayWithSlots[] => {
    const year = currentMonth.getFullYear()
    const month = currentMonth.getMonth()
    
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    
    const days: DayWithSlots[] = []
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    for (let d = 1; d <= lastDay.getDate(); d++) {
      const date = new Date(year, month, d)
      const dateStr = date.toISOString().split('T')[0]
      const daySlots = slots.filter(slot => slot.date === dateStr)
      
      days.push({
        date,
        dateStr,
        slots: daySlots,
        isAvailable: daySlots.length > 0 && date >= today,
        slotCount: daySlots.length
      })
    }
    
    return days
  }

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))
    setSelectedDate(null)
  }

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))
    setSelectedDate(null)
  }

  const handleDateClick = (dateStr: string) => {
    setSelectedDate(dateStr)
  }

  const handleSlotClick = (slot: TimeSlot) => {
    onSelectSlot(slot)
  }

  const isPastDate = (date: Date) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return date < today
  }

  const days = getDaysInMonth()
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  
  // Get slots for selected date
  const selectedDateSlots = selectedDate 
    ? slots.filter(slot => slot.date === selectedDate)
    : []

  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold dark:text-white">
            Select Date & Time
          </h3>
          <div className="flex gap-2">
            <button
              onClick={() => setView('calendar')}
              className={`px-3 py-1 text-sm rounded-lg transition ${
                view === 'calendar'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400'
              }`}
            >
              Calendar
            </button>
            <button
              onClick={() => setView('list')}
              className={`px-3 py-1 text-sm rounded-lg transition ${
                view === 'list'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400'
              }`}
            >
              List
            </button>
          </div>
        </div>
      </CardHeader>

      <CardBody className="p-4">
        {view === 'calendar' ? (
          <>
            {/* Calendar Navigation */}
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={handlePrevMonth}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
                disabled={loading}
              >
                <ChevronLeftIcon className="h-5 w-5" />
              </button>
              <h4 className="text-lg font-medium">
                {currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}
              </h4>
              <button
                onClick={handleNextMonth}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
                disabled={loading}
              >
                <ChevronRightIcon className="h-5 w-5" />
              </button>
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {weekDays.map(day => (
                <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
                  {day}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
              {/* Empty cells for days before month starts */}
              {Array.from({ length: new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay() }).map((_, i) => (
                <div key={`empty-${i}`} className="aspect-square p-1" />
              ))}

              {days.map((day, index) => {
                const isPast = isPastDate(day.date)
                const isSelected = selectedDate === day.dateStr
                const hasSlots = day.slotCount > 0 && !isPast
                
                return (
                  <motion.button
                    key={index}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: index * 0.005 }}
                    onClick={() => hasSlots && handleDateClick(day.dateStr)}
                    disabled={!hasSlots}
                    className={`
                      aspect-square p-2 rounded-lg border-2 transition relative
                      ${hasSlots 
                        ? 'cursor-pointer hover:border-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20' 
                        : 'cursor-not-allowed opacity-50'
                      }
                      ${isSelected ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20' : 'border-transparent'}
                      ${isPast ? 'bg-gray-100 dark:bg-gray-800' : 'bg-white dark:bg-gray-800'}
                    `}
                  >
                    <div className="h-full flex flex-col items-center">
                      <span className={`text-sm font-medium ${
                        isPast ? 'text-gray-400' : 'text-gray-700 dark:text-gray-300'
                      }`}>
                        {day.date.getDate()}
                      </span>
                      
                      {hasSlots && (
                        <>
                          <div className="mt-1 flex gap-0.5">
                            {Array.from({ length: Math.min(day.slotCount, 3) }).map((_, i) => (
                              <div
                                key={i}
                                className="w-1 h-1 rounded-full bg-emerald-500"
                              />
                            ))}
                          </div>
                          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 mt-auto">
                            {day.slotCount}
                          </span>
                        </>
                      )}
                    </div>
                  </motion.button>
                )
              })}
            </div>

            {/* Legend */}
            <div className="mt-4 flex items-center gap-4 text-xs border-t pt-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                <span className="text-gray-600 dark:text-gray-400">Available</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-gray-300 dark:bg-gray-600"></div>
                <span className="text-gray-600 dark:text-gray-400">No slots</span>
              </div>
            </div>

            {/* Selected Date Slots */}
            <AnimatePresence>
              {selectedDate && selectedDateSlots.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700"
                >
                  <h4 className="font-medium mb-3 flex items-center gap-2">
                    <CalendarIcon className="h-4 w-4 text-gray-500" />
                    Available times for {new Date(selectedDate).toLocaleDateString('en-US', {
                      weekday: 'long',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </h4>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                    {selectedDateSlots.map((slot, index) => (
                      <motion.button
                        key={`${slot.date}-${slot.start_time}`}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.05 }}
                        onClick={() => handleSlotClick(slot)}
                        className={`
                          p-3 rounded-lg border-2 transition-all hover:scale-105
                          ${selectedSlot?.date === slot.date && selectedSlot?.start_time === slot.start_time
                            ? 'border-emerald-500 bg-emerald-100 dark:bg-emerald-900/30'
                            : 'border-emerald-200 bg-emerald-50 hover:border-emerald-400 dark:border-emerald-800 dark:bg-emerald-900/20'
                          }
                        `}
                      >
                        <ClockIcon className="h-4 w-4 mx-auto mb-1 text-emerald-600 dark:text-emerald-400" />
                        <span className="text-sm font-medium text-emerald-700 dark:text-emerald-300">
                          {slot.start_time.slice(0,5)}
                        </span>
                      </motion.button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </>
        ) : (
          /* List View */
          <div className="space-y-4">
            {slots.length === 0 ? (
              <p className="text-center text-gray-500 py-8">No available slots found</p>
            ) : (
              Object.entries(
                slots.reduce((acc, slot) => {
                  if (!acc[slot.date]) acc[slot.date] = []
                  acc[slot.date].push(slot)
                  return acc
                }, {} as Record<string, TimeSlot[]>)
              ).map(([date, dateSlots]) => (
                <div key={date} className="border-b border-gray-200 dark:border-gray-700 pb-4 last:border-0">
                  <h4 className="font-medium mb-2">
                    {new Date(date).toLocaleDateString('en-US', {
                      weekday: 'long',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {dateSlots.map((slot) => (
                      <button
                        key={`${slot.date}-${slot.start_time}`}
                        onClick={() => handleSlotClick(slot)}
                        className={`
                          px-3 py-2 rounded-lg border-2 transition
                          ${selectedSlot?.date === slot.date && selectedSlot?.start_time === slot.start_time
                            ? 'border-emerald-500 bg-emerald-100 dark:bg-emerald-900/30'
                            : 'border-emerald-200 bg-emerald-50 hover:border-emerald-400 dark:border-emerald-800 dark:bg-emerald-900/20'
                          }
                        `}
                      >
                        <span className="text-sm font-medium text-emerald-700 dark:text-emerald-300">
                          {slot.start_time.slice(0,5)}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Loading Overlay */}
        {loading && (
          <div className="absolute inset-0 bg-white/50 dark:bg-gray-900/50 flex items-center justify-center rounded-lg">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
          </div>
        )}
      </CardBody>
    </Card>
  )
}