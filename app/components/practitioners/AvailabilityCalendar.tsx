'use client'

import { useState, useEffect } from 'react'
import { Card, CardBody, CardHeader } from '@/app/components/ui/Card'
import { practitionersApi } from '@/app/lib/api'
import { Availability } from '@/app/types'
import { ClockIcon } from '@heroicons/react/24/outline'

interface AvailabilityCalendarProps {
  practitionerId: number
}

const DAYS_OF_WEEK = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday'
]

export const AvailabilityCalendar = ({ practitionerId }: AvailabilityCalendarProps) => {
  const [availability, setAvailability] = useState<Availability[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchAvailability = async () => {
      try {
        setLoading(true)
        setError(null)
        
        if (!practitionerId) {
          setAvailability([])
          return
        }

        const data = await practitionersApi.getAvailability(practitionerId)
        setAvailability(data)
        
      } catch (err) {
        console.error('Failed to fetch availability:', err)
        setError('Could not load availability')
        setAvailability([])
      } finally {
        setLoading(false)
      }
    }

    fetchAvailability()
  }, [practitionerId])

  // Group availability by day
  const availabilityByDay: Record<string, Availability[]> = {}
  
  if (availability.length > 0) {
    availability.forEach((slot) => {
      if (slot && typeof slot.day_of_week === 'number') {
        const dayIndex = slot.day_of_week
        const day = DAYS_OF_WEEK[dayIndex] || 'Unknown'
        if (!availabilityByDay[day]) {
          availabilityByDay[day] = []
        }
        availabilityByDay[day].push(slot)
      }
    })
  }

  const sortedDays = Object.keys(availabilityByDay).sort((a, b) => {
    return DAYS_OF_WEEK.indexOf(a) - DAYS_OF_WEEK.indexOf(b)
  })

  const formatTime = (time: string) => {
    if (!time) return ''
    try {
      const [hours, minutes] = time.split(':')
      if (hours && minutes) {
        const date = new Date()
        date.setHours(parseInt(hours, 10), parseInt(minutes, 10))
        return date.toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit'
        })
      }
      return time
    } catch {
      return time
    }
  }

  if (loading) {
    return (
      <Card>
        <CardBody>
          <div className="animate-pulse">
            <div className="h-5 sm:h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4"></div>
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="flex items-center space-x-3">
                  <div className="h-4 w-4 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
                </div>
              ))}
            </div>
          </div>
        </CardBody>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardBody>
          <p className="text-sm text-yellow-600 dark:text-yellow-400 text-center py-4">
            {error}
          </p>
        </CardBody>
      </Card>
    )
  }

  if (availability.length === 0) {
    return (
      <Card>
        <CardBody>
          <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-6 sm:py-8">
            No availability set yet
          </p>
        </CardBody>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <h2 className="text-lg sm:text-xl font-semibold">Availability</h2>
        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
          Available time slots
        </p>
      </CardHeader>
      <CardBody>
        <div className="space-y-4 sm:space-y-6">
          {sortedDays.length > 0 ? (
            sortedDays.map(day => (
              <div key={day} className="border-b border-gray-100 dark:border-gray-700 last:border-0 pb-3 sm:pb-4 last:pb-0">
                <h3 className="text-sm sm:text-base font-medium text-gray-900 dark:text-white mb-2 sm:mb-3">
                  {day}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {availabilityByDay[day].map(slot => (
                    <div 
                      key={slot.id}
                      className="flex items-center text-xs sm:text-sm text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-800/50 rounded-lg p-2 sm:p-3"
                    >
                      <ClockIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-2 text-gray-400 flex-shrink-0" />
                      <span>
                        {formatTime(slot.start_time)} - {formatTime(slot.end_time)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
              No scheduled availability
            </p>
          )}
        </div>
      </CardBody>
    </Card>
  )
}