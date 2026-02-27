// app/components/booking/ClientBookingCalendar.tsx
'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { motion } from 'framer-motion'
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ClockIcon,
  CalendarDaysIcon,
  ExclamationCircleIcon
} from '@heroicons/react/24/outline'
import { Card, CardBody } from '@/app/components/ui/Card'
import { Button } from '@/app/components/ui/Buttons'
import { apiClient } from '@/app/lib/api'
import { extractResults } from '@/app/lib/utils'
import type { Availability } from '@/app/types'

interface ClientBookingCalendarProps {
  practitionerId: number
  onSelectSlot: (date: string, time: string) => void
}

interface DayCell {
  date: Date
  dateStr: string
  hasSlots: boolean
  slots: string[]
}

const weekDays = [
  { key: 'mon', label: 'M' },
  { key: 'tue', label: 'T' },
  { key: 'wed', label: 'W' },
  { key: 'thu', label: 'T' },
  { key: 'fri', label: 'F' },
  { key: 'sat', label: 'S' },
  { key: 'sun', label: 'S' }
]

export function ClientBookingCalendar({ practitionerId, onSelectSlot }: ClientBookingCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<string>('')
  const [selectedTime, setSelectedTime] = useState<string>('')
  const [availability, setAvailability] = useState<Availability[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (practitionerId) {
      fetchAvailability()
    }
  }, [practitionerId])

  useEffect(() => {
    setSelectedDate('')
    setSelectedTime('')
  }, [currentMonth])

  const fetchAvailability = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const data = await apiClient.practitioners.getAvailability(practitionerId)
      const availabilityList = extractResults<Availability>(data)
      setAvailability(availabilityList)
    } catch (error: any) {
      console.error('Failed to fetch availability:', error)
      setError(error.message || 'Failed to load availability')
    } finally {
      setLoading(false)
    }
  }

  const getBackendDay = useCallback((jsDay: number): number => {
    const mapping: Record<number, number> = {
      0: 6, // Sunday -> 6
      1: 0, // Monday -> 0
      2: 1, // Tuesday -> 1
      3: 2, // Wednesday -> 2
      4: 3, // Thursday -> 3
      5: 4, // Friday -> 4
      6: 5, // Saturday -> 5
    };
    return mapping[jsDay];
  }, []);

  const getDaysInMonth = useCallback((): DayCell[] => {
    const year = currentMonth.getFullYear()
    const month = currentMonth.getMonth()
    const lastDay = new Date(year, month + 1, 0)
    const days: DayCell[] = []
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    for (let d = 1; d <= lastDay.getDate(); d++) {
      const date = new Date(year, month, d)
      const dateStr = date.toISOString().split('T')[0]
      const jsDay = date.getDay()
      const backendDay = getBackendDay(jsDay)

      const slots = availability
        .filter(slot => {
          if (!slot.is_available) return false
          
          if (slot.recurrence_type === 'weekly') {
            return slot.day_of_week === backendDay
          } else if (slot.recurrence_type === 'one_time') {
            return slot.specific_date === dateStr
          }
          return false
        })
        .map(slot => slot.start_time.slice(0,5))
        .sort()

      days.push({
        date,
        dateStr,
        hasSlots: slots.length > 0,
        slots
      })
    }

    return days
  }, [currentMonth, availability, getBackendDay])

  const days = useMemo(() => getDaysInMonth(), [getDaysInMonth])
  
  const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay()
  const emptyDays = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1
  
  const today = useMemo(() => {
    const d = new Date()
    d.setHours(0, 0, 0, 0)
    return d
  }, [])

  const handleDateSelect = useCallback((dateStr: string) => {
    setSelectedDate(dateStr)
    setSelectedTime('')
  }, [])

  const handleTimeSelect = useCallback((time: string) => {
    setSelectedTime(time)
  }, [])

  const handleContinue = useCallback(() => {
    if (selectedDate && selectedTime) {
      onSelectSlot(selectedDate, selectedTime)
    }
  }, [selectedDate, selectedTime, onSelectSlot])

  const selectedDaySlots = useMemo(() => 
    days.find(d => d.dateStr === selectedDate)?.slots || [],
    [days, selectedDate]
  )

  const canGoPrev = useMemo(() => 
    currentMonth > new Date(new Date().getFullYear(), new Date().getMonth(), 1),
    [currentMonth]
  )

  if (loading) {
    return (
      <Card>
        <CardBody className="p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-4 border-emerald-200 border-t-emerald-600 mx-auto"></div>
          <p className="text-sm text-gray-500 mt-4">Loading availability...</p>
        </CardBody>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardBody className="p-8 text-center">
          <ExclamationCircleIcon className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{error}</p>
          <Button onClick={fetchAvailability} variant="outline" size="sm">
            Try Again
          </Button>
        </CardBody>
      </Card>
    )
  }

  if (availability.length === 0) {
    return (
      <Card>
        <CardBody className="p-8 text-center">
          <CalendarDaysIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            No Availability Yet
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 max-w-md mx-auto">
            This practitioner hasn't set their availability yet. Please check back later or contact them directly.
          </p>
        </CardBody>
      </Card>
    )
  }

  return (
    <Card>
      <CardBody className="p-6">
        {/* Calendar Header */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
            className={`p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition ${
              !canGoPrev ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            disabled={!canGoPrev}
            aria-label="Previous month"
          >
            <ChevronLeftIcon className="h-5 w-5" />
          </button>
          <h3 className="text-lg font-semibold">
            {currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}
          </h3>
          <button
            onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition"
            aria-label="Next month"
          >
            <ChevronRightIcon className="h-5 w-5" />
          </button>
        </div>

        {/* Weekday Headers */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {weekDays.map((day) => (
            <div key={day.key} className="text-center text-xs font-medium text-gray-500 py-2">
              {day.label}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1 mb-6">
          {Array.from({ length: emptyDays }).map((_, i) => (
            <div key={`empty-${i}`} className="aspect-square p-1" />
          ))}
          
          {days.map((day) => {
            const isSelected = selectedDate === day.dateStr
            const isPast = day.date < today
            const isToday = day.dateStr === new Date().toISOString().split('T')[0]

            return (
              <div key={day.dateStr} className="aspect-square p-1">
                <button
                  onClick={() => day.hasSlots && !isPast && handleDateSelect(day.dateStr)}
                  disabled={!day.hasSlots || isPast}
                  className={`
                    w-full h-full rounded-lg flex flex-col items-center justify-center text-sm transition
                    ${isSelected
                      ? 'bg-emerald-600 text-white'
                      : day.hasSlots && !isPast
                        ? 'hover:bg-emerald-50 dark:hover:bg-emerald-900/30 text-gray-700 dark:text-gray-300 cursor-pointer'
                        : 'text-gray-300 dark:text-gray-700 cursor-not-allowed'
                    }
                    ${isToday && !isSelected ? 'ring-2 ring-emerald-200 dark:ring-emerald-800' : ''}
                  `}
                  aria-label={`${day.dateStr} ${day.hasSlots ? 'has available slots' : 'no slots'}`}
                >
                  <span>{day.date.getDate()}</span>
                  {day.hasSlots && !isPast && !isSelected && (
                    <div className="w-1 h-1 rounded-full bg-emerald-500 mt-1" />
                  )}
                </button>
              </div>
            )
          })}
        </div>

        {/* Time Slots */}
        {selectedDate && (
          <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
            <h4 className="text-sm font-medium mb-4 flex items-center gap-2">
              <ClockIcon className="h-4 w-4 text-gray-400" />
              Available Times for {new Date(selectedDate).toLocaleDateString('en-US', {
                weekday: 'short',
                month: 'short',
                day: 'numeric'
              })}
            </h4>

            {selectedDaySlots.length > 0 ? (
              <div className="space-y-4">
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                  {selectedDaySlots.map((time) => (
                    <button
                      key={time}
                      onClick={() => handleTimeSelect(time)}
                      className={`
                        p-3 rounded-lg border-2 transition text-center
                        ${selectedTime === time
                          ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-900/30'
                          : 'border-gray-200 hover:border-emerald-300 dark:border-gray-700 dark:hover:border-emerald-800'
                        }
                      `}
                    >
                      <span className="text-sm font-medium">{time}</span>
                    </button>
                  ))}
                </div>

                {selectedTime && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <Button
                      onClick={handleContinue}
                      fullWidth
                      className="bg-emerald-600 hover:bg-emerald-700 text-white"
                    >
                      Continue to Booking
                    </Button>
                  </motion.div>
                )}
              </div>
            ) : (
              <div className="text-center py-8 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                <CalendarDaysIcon className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  No available slots for this date
                </p>
              </div>
            )}
          </div>
        )}
      </CardBody>
    </Card>
  )
}