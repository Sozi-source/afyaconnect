'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ClockIcon,
  CalendarDaysIcon
} from '@heroicons/react/24/outline'
import { Card, CardBody } from '@/app/components/ui/Card'
import { Button } from '@/app/components/ui/Buttons'
import type { Availability, TimeSlot } from '@/app/types'

interface TimeSlotPickerProps {
  practitionerId: number
  practitionerName: string
  onSelectSlot: (date: string, time: string) => void
  availability: Availability[]
}

interface CalendarDay {
  date: Date
  dateStr: string
  slots: TimeSlot[]
  hasSlots: boolean
}

export function TimeSlotPicker({ 
  practitionerId, 
  practitionerName, 
  onSelectSlot, 
  availability 
}: TimeSlotPickerProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [selectedTime, setSelectedTime] = useState<string | null>(null)
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([])

  const weekDays = [
    { key: 'sun', label: 'S' },
    { key: 'mon', label: 'M' },
    { key: 'tue', label: 'T' },
    { key: 'wed', label: 'W' },
    { key: 'thu', label: 'T' },
    { key: 'fri', label: 'F' },
    { key: 'sat', label: 'S' }
  ]

  useEffect(() => {
    generateTimeSlots()
  }, [availability, currentMonth, practitionerId, practitionerName])

  const getBackendDay = (jsDay: number): number => {
    const mapping: Record<number, number> = {
      0: 6, // Sunday -> 6
      1: 0, // Monday -> 0
      2: 1, // Tuesday -> 1
      3: 2, // Wednesday -> 2
      4: 3, // Thursday -> 3
      5: 4, // Friday -> 4
      6: 5, // Saturday -> 5
    }
    return mapping[jsDay]
  }

  const generateTimeSlots = () => {
    const slots: TimeSlot[] = []
    const year = currentMonth.getFullYear()
    const month = currentMonth.getMonth()
    const daysInMonth = new Date(year, month + 1, 0).getDate()

    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(year, month, d)
      const dateStr = date.toISOString().split('T')[0]
      const jsDay = date.getDay()
      const backendDay = getBackendDay(jsDay)

      // Find availability for this day
      const dayAvailability = availability.filter((item: Availability) => {
        if (!item.is_available) return false
        
        if (item.recurrence_type === 'weekly') {
          return item.day_of_week === backendDay
        } else if (item.recurrence_type === 'one_time') {
          return item.specific_date === dateStr
        }
        return false
      })

      // Create time slots from availability with all required fields
      dayAvailability.forEach((item: Availability) => {
        slots.push({
          id: item.id,
          date: dateStr,
          start_time: item.start_time.slice(0,5),
          end_time: item.end_time.slice(0,5),
          practitioner_id: practitionerId,
          practitioner_name: practitionerName,
          is_available: item.is_available,
          formatted_time: `${item.start_time.slice(0,5)} - ${item.end_time.slice(0,5)}`
        })
      })
    }

    setAvailableSlots(slots)

    // Clear selected date if no slots available
    if (selectedDate) {
      const hasSlotsOnDate = slots.some((slot: TimeSlot) => slot.date === selectedDate)
      if (!hasSlotsOnDate) {
        setSelectedDate(null)
        setSelectedTime(null)
      }
    }
  }

  const getDaysInMonth = (): CalendarDay[] => {
    const year = currentMonth.getFullYear()
    const month = currentMonth.getMonth()
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    const days: CalendarDay[] = []

    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(year, month, d)
      const dateStr = date.toISOString().split('T')[0]
      
      const slotsForDay = availableSlots.filter((slot: TimeSlot) => slot.date === dateStr)

      days.push({
        date,
        dateStr,
        slots: slotsForDay,
        hasSlots: slotsForDay.length > 0
      })
    }

    return days
  }

  const days = getDaysInMonth()
  const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay()
  const emptyDays = Array(firstDayOfMonth).fill(null)

  const handleDateSelect = (dateStr: string) => {
    setSelectedDate(dateStr)
    setSelectedTime(null)
  }

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time)
  }

  const handleContinue = () => {
    if (selectedDate && selectedTime) {
      onSelectSlot(selectedDate, selectedTime)
    }
  }

  const timeSlotsForSelectedDate = selectedDate
    ? availableSlots
        .filter((slot: TimeSlot) => slot.date === selectedDate)
        .map((slot: TimeSlot) => slot.start_time)
        .sort()
    : []

  return (
    <Card>
      <CardBody className="p-6">
        {/* Calendar Header */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition"
          >
            <ChevronLeftIcon className="h-5 w-5" />
          </button>
          <h3 className="text-lg font-semibold">
            {currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}
          </h3>
          <button
            onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition"
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
          {emptyDays.map((_, i) => (
            <div key={`empty-${i}`} className="aspect-square p-1" />
          ))}
          
          {days.map((day: CalendarDay) => {
            const isSelected = selectedDate === day.dateStr
            const isPast = day.date < new Date(new Date().setHours(0,0,0,0))
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

            {timeSlotsForSelectedDate.length > 0 ? (
              <div className="space-y-4">
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                  {timeSlotsForSelectedDate.map((time: string) => (
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