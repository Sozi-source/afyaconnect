'use client'

import { useState } from 'react'
import type { Availability } from '@/app/types'
import { apiClient } from '@/app/lib/api'
import { 
  ClockIcon, 
  TrashIcon,
  ExclamationCircleIcon,
  CalendarDaysIcon,
  ChevronDownIcon,
  ChevronUpIcon
} from '@heroicons/react/24/outline'

interface Props {
  slots: Availability[]
  loading?: boolean
  onSlotDeleted: (id: number) => void
}

const DAY_NAMES = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
const DAY_COLORS = [
  'border-l-emerald-500',
  'border-l-blue-500',
  'border-l-indigo-500',
  'border-l-purple-500',
  'border-l-pink-500',
  'border-l-amber-500',
  'border-l-orange-500'
]

// Distinct colors for slot cards
const SLOT_COLORS = [
  'bg-emerald-50 hover:bg-emerald-100 border-emerald-200',
  'bg-blue-50 hover:bg-blue-100 border-blue-200',
  'bg-indigo-50 hover:bg-indigo-100 border-indigo-200',
  'bg-purple-50 hover:bg-purple-100 border-purple-200',
  'bg-pink-50 hover:bg-pink-100 border-pink-200',
  'bg-amber-50 hover:bg-amber-100 border-amber-200',
  'bg-orange-50 hover:bg-orange-100 border-orange-200',
  'bg-rose-50 hover:bg-rose-100 border-rose-200',
  'bg-cyan-50 hover:bg-cyan-100 border-cyan-200',
  'bg-violet-50 hover:bg-violet-100 border-violet-200',
]

export function ViewAvailability({ slots = [], loading, onSlotDeleted }: Props) {
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [expandedDays, setExpandedDays] = useState<Record<number, boolean>>({})

  const toggleDay = (dayIndex: number) => {
    setExpandedDays(prev => ({
      ...prev,
      [dayIndex]: !prev[dayIndex]
    }))
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this time slot?')) return
    
    setDeletingId(id)
    setError(null)
    
    try {
      await apiClient.availability.delete(id)
      onSlotDeleted(id)
    } catch (error: any) {
      setError(error.message || 'Failed to delete slot. Please try again.')
      setTimeout(() => setError(null), 3000)
    } finally {
      setDeletingId(null)
    }
  }

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-xl p-8">
        <div className="flex flex-col items-center justify-center py-12">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-emerald-100 border-t-emerald-600 rounded-full animate-spin"></div>
            <ClockIcon className="w-6 h-6 text-emerald-600 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
          </div>
          <p className="mt-4 text-sm font-medium text-gray-600">Loading your schedule...</p>
        </div>
      </div>
    )
  }

  const safeSlots = Array.isArray(slots) ? slots : []
  const weeklySlots = safeSlots.filter(s => s?.recurrence_type === 'weekly')

  if (weeklySlots.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center py-12">
          <div className="w-20 h-20 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <CalendarDaysIcon className="w-10 h-10 text-emerald-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Schedule Yet</h3>
          <p className="text-sm text-gray-500 max-w-sm mx-auto">
            Start by adding your weekly availability using the form above. 
            Your schedule will appear here once you've set your hours.
          </p>
        </div>
      </div>
    )
  }

  // Group slots by day
  const slotsByDay = weeklySlots.reduce((acc, slot) => {
    if (slot?.day_of_week !== null && slot?.day_of_week !== undefined) {
      if (!acc[slot.day_of_week]) {
        acc[slot.day_of_week] = []
      }
      acc[slot.day_of_week].push(slot)
    }
    return acc
  }, {} as Record<number, Availability[]>)

  // Sort slots by start time
  Object.keys(slotsByDay).forEach(day => {
    slotsByDay[Number(day)].sort((a, b) => a.start_time.localeCompare(b.start_time))
  })

  return (
    <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
      {/* Header */}
      <div className="px-4 sm:px-6 py-4 bg-gradient-to-r from-emerald-50 to-blue-50 border-b border-gray-200">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-white rounded-lg shadow-sm">
              <CalendarDaysIcon className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-semibold text-gray-900">Weekly Schedule</h2>
              <p className="text-xs text-gray-500">Your recurring availability</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs bg-white px-3 py-1.5 rounded-full shadow-sm text-emerald-700 font-medium">
              {weeklySlots.length} active slot{weeklySlots.length !== 1 ? 's' : ''}
            </span>
          </div>
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="mx-4 sm:mx-6 mt-4 p-3 bg-red-50 border border-red-200 rounded-xl">
          <div className="flex items-start gap-2">
            <ExclamationCircleIcon className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-600">{error}</p>
          </div>
        </div>
      )}

      {/* Schedule grid */}
      <div className="p-4 sm:p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {DAY_NAMES.map((dayName, dayIndex) => {
            const daySlots = slotsByDay[dayIndex] || []
            if (daySlots.length === 0) return null

            const isExpanded = expandedDays[dayIndex] || false
            const displaySlots = isExpanded ? daySlots : daySlots.slice(0, 2)
            const hasMore = daySlots.length > 2

            return (
              <div
                key={dayIndex}
                className={`bg-gradient-to-br from-gray-50 to-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-shadow ${DAY_COLORS[dayIndex]} border-l-4`}
              >
                {/* Day header */}
                <div className="px-3 py-2 bg-white/50 border-b border-gray-100">
                  <h3 className="font-semibold text-gray-900 text-sm">{dayName}</h3>
                </div>

                {/* Time slots */}
                <div className="p-3 space-y-2">
                  {displaySlots.map((slot, slotIndex) => {
                    // Use a consistent color for slots on the same day
                    const colorIndex = (dayIndex * 3 + slotIndex) % SLOT_COLORS.length
                    
                    return (
                      <div
                        key={slot.id}
                        className={`flex items-center justify-between p-2 rounded-lg border-2 transition-all group ${SLOT_COLORS[colorIndex]}`}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <ClockIcon className="w-4 h-4 text-gray-600 flex-shrink-0" />
                          <span className="text-sm font-medium text-gray-800 truncate">
                            {slot.start_time?.slice(0,5)} - {slot.end_time?.slice(0,5)}
                          </span>
                        </div>
                        <button
                          onClick={() => handleDelete(slot.id)}
                          disabled={deletingId === slot.id}
                          className="p-1.5 text-gray-500 hover:text-white hover:bg-red-500 rounded-lg transition-all opacity-0 group-hover:opacity-100 focus:opacity-100 disabled:opacity-50"
                          title="Delete slot"
                        >
                          {deletingId === slot.id ? (
                            <span className="inline-block w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></span>
                          ) : (
                            <TrashIcon className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    )
                  })}

                  {/* Show more/less button */}
                  {hasMore && (
                    <button
                      onClick={() => toggleDay(dayIndex)}
                      className="flex items-center justify-center w-full mt-2 py-1.5 text-xs text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors"
                    >
                      {isExpanded ? (
                        <>
                          <ChevronUpIcon className="w-3 h-3 mr-1" />
                          Show less
                        </>
                      ) : (
                        <>
                          <ChevronDownIcon className="w-3 h-3 mr-1" />
                          Show {daySlots.length - 2} more
                        </>
                      )}
                    </button>
                  )}
                </div>

                {/* Slot count badge */}
                <div className="px-3 py-1.5 bg-gray-50/50 border-t border-gray-100 text-xs text-gray-500">
                  {daySlots.length} time slot{daySlots.length !== 1 ? 's' : ''}
                </div>
              </div>
            )
          })}
        </div>

        {/* Summary footer */}
        <div className="mt-4 pt-4 border-t border-gray-100">
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-gray-500">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
              <span>Total: {weeklySlots.length} weekly slots</span>
            </div>
            <div className="flex items-center gap-2">
              <ClockIcon className="w-3 h-3" />
              <span>Hover over slot to see delete option</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}