'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  CalendarIcon,
  ClockIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  PencilIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline'
import { Card, CardBody } from '@/app/components/ui/Card'
import { Button } from '@/app/components/ui/Buttons'
import type { Availability, DayOfWeek } from '@/app/types'

interface AvailabilityCalendarProps {
  availability: Availability[]
  loading: boolean
  onEdit: (id: number, data: Partial<Availability>) => Promise<Availability>
}

const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

export function AvailabilityCalendar({ availability, loading, onEdit }: AvailabilityCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<'month' | 'week'>('month')

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))
    setSelectedDate(null)
  }

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))
    setSelectedDate(null)
  }

  const handleEditClick = (slot: Availability) => {
    onEdit(slot.id, slot)
  }

  // Group availability by type
  const weeklySlots = availability.filter(slot => slot.recurrence_type === 'weekly')
  const oneTimeSlots = availability.filter(slot => 
    slot.recurrence_type === 'one_time' || slot.recurrence_type === 'unavailable'
  )

  // Get slots for a specific date
  const getSlotsForDate = (dateStr: string) => {
    return oneTimeSlots.filter(slot => slot.specific_date === dateStr)
  }

  // Generate calendar days
  const getDaysInMonth = () => {
    const year = currentMonth.getFullYear()
    const month = currentMonth.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const days = []
    
    for (let d = 1; d <= lastDay.getDate(); d++) {
      const date = new Date(year, month, d)
      const dateStr = date.toISOString().split('T')[0]
      const dayOfWeek = date.getDay() // 0 = Sunday, 1 = Monday, etc.
      // Convert to our DayOfWeek format (0 = Monday)
      const ourDayOfWeek = dayOfWeek === 0 ? 6 : dayOfWeek - 1
      
      // Get weekly slots for this day of week
      const dayWeeklySlots = weeklySlots.filter(slot => slot.day_of_week === ourDayOfWeek)
      // Get one-time slots for this date
      const dayOneTimeSlots = getSlotsForDate(dateStr)
      
      days.push({
        date,
        dateStr,
        dayOfWeek: ourDayOfWeek,
        weeklySlots: dayWeeklySlots,
        oneTimeSlots: dayOneTimeSlots,
        allSlots: [...dayWeeklySlots, ...dayOneTimeSlots]
      })
    }
    
    return days
  }

  const days = getDaysInMonth()
  const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

  if (loading) {
    return (
      <Card>
        <CardBody className="p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto"></div>
          <p className="text-gray-500 mt-4">Loading calendar...</p>
        </CardBody>
      </Card>
    )
  }

  return (
    <Card>
      <CardBody className="p-4">
        {/* Header with View Toggle */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrevMonth}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
            >
              <ChevronLeftIcon className="h-5 w-5" />
            </button>
            <h3 className="text-lg font-semibold dark:text-white">
              {currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}
            </h3>
            <button
              onClick={handleNextMonth}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
            >
              <ChevronRightIcon className="h-5 w-5" />
            </button>
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={() => setViewMode('month')}
              className={`px-3 py-1 text-sm rounded-lg transition ${
                viewMode === 'month'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400'
              }`}
            >
              Month
            </button>
            <button
              onClick={() => setViewMode('week')}
              className={`px-3 py-1 text-sm rounded-lg transition ${
                viewMode === 'week'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400'
              }`}
            >
              Week
            </button>
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 mb-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <span className="text-gray-600 dark:text-gray-400">Weekly</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-500"></div>
            <span className="text-gray-600 dark:text-gray-400">One-time</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <span className="text-gray-600 dark:text-gray-400">Unavailable</span>
          </div>
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
          {Array.from({ length: (new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay() + 6) % 7 }).map((_, i) => (
            <div key={`empty-${i}`} className="aspect-square p-1" />
          ))}

          {days.map((day, index) => {
            const hasWeekly = day.weeklySlots.length > 0
            const hasOneTime = day.oneTimeSlots.length > 0
            const hasUnavailable = day.oneTimeSlots.some(s => !s.is_available)
            const isSelected = selectedDate === day.dateStr
            
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: index * 0.005 }}
                className={`
                  aspect-square p-2 rounded-lg border-2 transition relative
                  ${hasWeekly || hasOneTime 
                    ? 'cursor-pointer hover:border-emerald-400' 
                    : 'opacity-50'
                  }
                  ${isSelected ? 'border-emerald-500 ring-2 ring-emerald-200' : 'border-transparent'}
                `}
                onClick={() => (hasWeekly || hasOneTime) && setSelectedDate(day.dateStr)}
              >
                <div className="h-full flex flex-col">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {day.date.getDate()}
                  </span>
                  
                  <div className="mt-1 space-y-1">
                    {hasWeekly && (
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 rounded-full bg-green-500"></div>
                        <span className="text-[10px] text-green-600 dark:text-green-400">
                          {day.weeklySlots.length} weekly
                        </span>
                      </div>
                    )}
                    
                    {hasOneTime && day.oneTimeSlots.map((slot, i) => (
                      <div key={i} className="flex items-center gap-1">
                        <div className={`w-2 h-2 rounded-full ${slot.is_available ? 'bg-blue-500' : 'bg-red-500'}`}></div>
                        <span className="text-[10px] text-gray-600 dark:text-gray-400">
                          {slot.start_time.slice(0,5)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>

        {/* Selected Date Details */}
        {selectedDate && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700"
          >
            <h4 className="font-medium mb-3 flex items-center gap-2">
              <CalendarIcon className="h-4 w-4 text-gray-500" />
              Slots for {new Date(selectedDate).toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'long',
                day: 'numeric'
              })}
            </h4>
            
            <div className="space-y-2">
              {days.find(d => d.dateStr === selectedDate)?.allSlots.map((slot, index) => (
                <div
                  key={index}
                  className={`
                    flex items-center justify-between p-3 rounded-lg
                    ${slot.is_available 
                      ? slot.recurrence_type === 'weekly'
                        ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
                        : 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800'
                      : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
                    }
                  `}
                >
                  <div className="flex items-center gap-3">
                    {slot.is_available ? (
                      <CheckCircleIcon className="h-5 w-5 text-green-600 dark:text-green-400" />
                    ) : (
                      <XCircleIcon className="h-5 w-5 text-red-600 dark:text-red-400" />
                    )}
                    <div>
                      <p className="text-sm font-medium">
                        {slot.start_time.slice(0,5)} - {slot.end_time.slice(0,5)}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {slot.recurrence_type === 'weekly' ? 'Weekly' : 
                         slot.recurrence_type === 'one_time' ? 'One-time' : 'Unavailable'}
                        {slot.notes && ` • ${slot.notes}`}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleEditClick(slot)}
                    className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition"
                  >
                    <PencilIcon className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                  </button>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* No slots message */}
        {availability.length === 0 && (
          <div className="text-center py-8">
            <CalendarIcon className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-500 dark:text-gray-400">No availability slots set</p>
            <p className="text-sm text-gray-400 mt-2">
              Add slots using the forms above
            </p>
          </div>
        )}
      </CardBody>
    </Card>
  )
}