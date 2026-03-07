'use client'

import { useEffect, useState } from 'react'
import { apiClient } from '@/app/lib/api'
import type { Availability } from '@/app/types'

interface Props {
  practitionerId: number
}

const DAY_NAMES = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

export function BookSlot({ practitionerId }: Props) {
  const [slots, setSlots] = useState<Availability[]>([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')

  const loadSlots = async () => {
    try {
      const data = await apiClient.availability.getPractitionerAvailability(practitionerId)
      setSlots(data.results || [])
    } catch (error) {
      console.error('Failed to load slots:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleBook = async (slot: Availability) => {
    setMessage(`✅ Booked ${slot.start_time.slice(0,5)}`)
    setTimeout(() => setMessage(''), 3000)
  }

  useEffect(() => {
    loadSlots()
  }, [practitionerId])

  if (loading) return <div className="text-center py-4">Loading...</div>

  const weeklySlots = slots.filter(s => s.recurrence_type === 'weekly')

  return (
    <div className="bg-white p-6 rounded-lg shadow max-w-md">
      <h2 className="text-xl font-bold mb-4">Book a Time</h2>

      {message && (
        <div className="mb-4 p-2 bg-emerald-100 text-emerald-700 text-center rounded">
          {message}
        </div>
      )}

      {weeklySlots.length === 0 ? (
        <p className="text-gray-500 text-center">No times available</p>
      ) : (
        <div className="space-y-4">
          {DAY_NAMES.map((day, idx) => {
            const daySlots = weeklySlots.filter(s => s.day_of_week === idx)
            if (daySlots.length === 0) return null

            return (
              <div key={idx}>
                <h3 className="font-medium text-emerald-700 mb-2">{day}</h3>
                <div className="grid grid-cols-2 gap-2">
                  {daySlots.map(slot => (
                    <button
                      key={slot.id}
                      onClick={() => handleBook(slot)}
                      className="p-2 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded text-sm"
                    >
                      {slot.start_time.slice(0,5)}
                    </button>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}