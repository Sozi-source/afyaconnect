'use client'

import { useState, useEffect } from 'react'
import { useAvailability } from '@/app/hooks/useAvailability'
import { Card, CardBody, CardHeader } from '@/app/components/ui/Card'
import { motion } from 'framer-motion'
import { CalendarIcon, ClockIcon } from '@heroicons/react/24/outline'
import type { TimeSlot } from '@/app/types'

interface AvailabilityCalendarProps {
  practitionerId: number
  onSelectSlot?: (slot: TimeSlot) => void
}

export function AvailabilityCalendar({ practitionerId, onSelectSlot }: AvailabilityCalendarProps) {
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  )
  const [dateRange, setDateRange] = useState({
    start: new Date().toISOString().split('T')[0],
    end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  })

  const { timeSlots, loading, fetchTimeSlots } = useAvailability()

  useEffect(() => {
    if (practitionerId) {
      fetchTimeSlots(practitionerId, dateRange.start, dateRange.end)
    }
  }, [practitionerId, dateRange.start, dateRange.end, fetchTimeSlots])

  // Group slots by date
  const slotsByDate = timeSlots.reduce((acc, slot) => {
    if (!acc[slot.date]) {
      acc[slot.date] = []
    }
    acc[slot.date].push(slot)
    return acc
  }, {} as Record<string, TimeSlot[]>)

  const handlePrevMonth = () => {
    const newStart = new Date(dateRange.start)
    newStart.setMonth(newStart.getMonth() - 1)
    const newEnd = new Date(dateRange.end)
    newEnd.setMonth(newEnd.getMonth() - 1)
    setDateRange({
      start: newStart.toISOString().split('T')[0],
      end: newEnd.toISOString().split('T')[0]
    })
  }

  const handleNextMonth = () => {
    const newStart = new Date(dateRange.start)
    newStart.setMonth(newStart.getMonth() + 1)
    const newEnd = new Date(dateRange.end)
    newEnd.setMonth(newEnd.getMonth() + 1)
    setDateRange({
      start: newStart.toISOString().split('T')[0],
      end: newEnd.toISOString().split('T')[0]
    })
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">Available Time Slots</h3>
          <div className="flex gap-2">
            <button
              onClick={handlePrevMonth}
              className="px-3 py-1 text-sm bg-gray-100 rounded hover:bg-gray-200"
            >
              ← Prev
            </button>
            <button
              onClick={handleNextMonth}
              className="px-3 py-1 text-sm bg-gray-100 rounded hover:bg-gray-200"
            >
              Next →
            </button>
          </div>
        </div>
      </CardHeader>
      <CardBody>
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          </div>
        ) : Object.keys(slotsByDate).length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No available slots for the selected period
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(slotsByDate).map(([date, slots]) => (
              <motion.div
                key={date}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="border-b last:border-0 pb-4 last:pb-0"
              >
                <h4 className="font-medium mb-2 flex items-center">
                  <CalendarIcon className="h-4 w-4 mr-2" />
                  {new Date(date).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                  {slots.map((slot, index) => (
                    <button
                      key={index}
                      onClick={() => onSelectSlot?.(slot)}
                      className="flex items-center justify-center px-3 py-2 bg-blue-100 text-blue-700 rounded-lg text-sm hover:bg-blue-200 transition"
                    >
                      <ClockIcon className="h-3 w-3 mr-1" />
                      {slot.start_time.slice(0,5)} - {slot.end_time.slice(0,5)}
                    </button>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </CardBody>
    </Card>
  )
}