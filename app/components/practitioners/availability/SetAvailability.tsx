'use client'

import { useState } from 'react'
import { apiClient } from '@/app/lib/api'
import type { Availability, CreateAvailabilityData } from '@/app/types'
import { 
  ClockIcon, 
  CheckCircleIcon,
  ExclamationCircleIcon,
  CalendarDaysIcon,
  SparklesIcon,
  ChevronDownIcon,
  ChevronUpIcon
} from '@heroicons/react/24/outline'

interface Props {
  practitionerId: number
  onSlotsAdded: (slots: Availability[]) => void
}

const DAYS = [
  { id: 0, label: 'Mon', fullName: 'Monday', color: 'emerald' },
  { id: 1, label: 'Tue', fullName: 'Tuesday', color: 'blue' },
  { id: 2, label: 'Wed', fullName: 'Wednesday', color: 'indigo' },
  { id: 3, label: 'Thu', fullName: 'Thursday', color: 'purple' },
  { id: 4, label: 'Fri', fullName: 'Friday', color: 'pink' },
  { id: 5, label: 'Sat', fullName: 'Saturday', color: 'amber' },
  { id: 6, label: 'Sun', fullName: 'Sunday', color: 'orange' },
]

export function SetAvailability({ practitionerId, onSlotsAdded }: Props) {
  const [selectedDays, setSelectedDays] = useState<number[]>([])
  const [startTime, setStartTime] = useState('09:00')
  const [endTime, setEndTime] = useState('17:00')
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [showAdvanced, setShowAdvanced] = useState(false)

  const toggleDay = (dayId: number) => {
    setSelectedDays(prev =>
      prev.includes(dayId) ? prev.filter(d => d !== dayId) : [...prev, dayId]
    )
    setMessage(null)
  }

  const selectAllDays = () => {
    setSelectedDays(DAYS.map(d => d.id))
    setMessage(null)
  }

  const clearAllDays = () => {
    setSelectedDays([])
    setMessage(null)
  }

  const validateForm = (): boolean => {
    if (selectedDays.length === 0) {
      setMessage({ text: 'Please select at least one day', type: 'error' })
      return false
    }

    if (startTime >= endTime) {
      setMessage({ text: 'End time must be after start time', type: 'error' })
      return false
    }

    return true
  }

  const handleSave = async () => {
    if (!validateForm()) return

    setIsSaving(true)
    setMessage(null)

    try {
      const createdSlots: Availability[] = []
      
      for (const day of selectedDays) {
        const slotData: CreateAvailabilityData = {
          recurrence_type: 'weekly',
          day_of_week: day as any,
          start_time: startTime,
          end_time: endTime,
          is_available: true
        }
        
        const slot = await apiClient.availability.create(slotData)
        createdSlots.push(slot)
      }
      
      setMessage({ 
        text: `Successfully added ${createdSlots.length} slot${createdSlots.length === 1 ? '' : 's'}`,
        type: 'success' 
      })
      
      onSlotsAdded(createdSlots)
      setSelectedDays([])
    } catch (error: any) {
      setMessage({ text: error.message || 'Failed to save slots', type: 'error' })
    } finally {
      setIsSaving(false)
    }
  }

  const getDayColor = (dayId: number, isSelected: boolean) => {
    const day = DAYS.find(d => d.id === dayId)
    if (!day) return 'gray'
    return isSelected ? day.color : 'gray'
  }

  return (
    <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
      {/* Header with gradient */}
      <div className="px-4 sm:px-6 py-4 bg-gradient-to-r from-emerald-50 to-blue-50 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-white rounded-lg shadow-sm">
            <SparklesIcon className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-semibold text-gray-900">Set Your Weekly Hours</h2>
            <p className="text-xs text-gray-500">Choose days and time slots for your practice</p>
          </div>
        </div>
      </div>

      <div className="p-4 sm:p-6">
        <div className="space-y-6">
          {/* Days selection */}
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3">
              <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
                <CalendarDaysIcon className="w-4 h-4 text-emerald-600" />
                Select Days
              </label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={selectAllDays}
                  className="text-xs px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-lg hover:bg-emerald-100 transition-colors font-medium"
                >
                  Select All
                </button>
                <button
                  type="button"
                  onClick={clearAllDays}
                  className="text-xs px-3 py-1.5 bg-gray-50 text-gray-600 rounded-lg hover:bg-gray-100 transition-colors font-medium"
                >
                  Clear
                </button>
              </div>
            </div>

            {/* Day buttons - responsive grid */}
            <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
              {DAYS.map(day => {
                const isSelected = selectedDays.includes(day.id)
                const color = getDayColor(day.id, isSelected)
                
                return (
                  <button
                    key={day.id}
                    onClick={() => toggleDay(day.id)}
                    className={`
                      relative group flex flex-col items-center p-2 sm:p-3 rounded-xl transition-all
                      ${isSelected 
                        ? `bg-${color}-50 border-2 border-${color}-500 shadow-md` 
                        : 'bg-gray-50 border-2 border-transparent hover:border-gray-300 hover:bg-gray-100'
                      }
                      focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2
                    `}
                    title={day.fullName}
                    type="button"
                  >
                    <span className={`
                      text-xs sm:text-sm font-semibold
                      ${isSelected ? `text-${color}-700` : 'text-gray-700'}
                    `}>
                      {day.label}
                    </span>
                    <span className={`
                      text-[10px] sm:text-xs mt-0.5
                      ${isSelected ? `text-${color}-600` : 'text-gray-400'}
                    `}>
                      {day.fullName.slice(0,3)}
                    </span>
                    
                    {/* Selected indicator */}
                    {isSelected && (
                      <span className={`absolute -top-1 -right-1 w-4 h-4 bg-${color}-500 rounded-full border-2 border-white shadow-sm flex items-center justify-center`}>
                        <CheckCircleIcon className="w-3 h-3 text-white" />
                      </span>
                    )}
                  </button>
                )
              })}
            </div>

            {/* Selection summary */}
            {selectedDays.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1">
                {selectedDays.map(dayId => {
                  const day = DAYS.find(d => d.id === dayId)
                  return (
                    <span
                      key={dayId}
                      className={`inline-flex items-center px-2 py-1 bg-${day?.color}-50 text-${day?.color}-700 rounded-lg text-xs font-medium`}
                    >
                      {day?.fullName}
                    </span>
                  )
                })}
              </div>
            )}
          </div>

          {/* Time selection */}
          <div className="bg-gray-50 rounded-xl p-4">
            <label className="text-sm font-medium text-gray-700 flex items-center gap-1 mb-3">
              <ClockIcon className="w-4 h-4 text-emerald-600" />
              Select Time Range
            </label>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label htmlFor="start-time" className="block text-xs text-gray-500 mb-1">
                  Start Time
                </label>
                <div className="relative">
                  <input
                    id="start-time"
                    type="time"
                    value={startTime}
                    onChange={(e) => {
                      setStartTime(e.target.value)
                      setMessage(null)
                    }}
                    className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white"
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="end-time" className="block text-xs text-gray-500 mb-1">
                  End Time
                </label>
                <div className="relative">
                  <input
                    id="end-time"
                    type="time"
                    value={endTime}
                    onChange={(e) => {
                      setEndTime(e.target.value)
                      setMessage(null)
                    }}
                    className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white"
                  />
                </div>
              </div>
            </div>

            {/* Time preview */}
            <div className="mt-3 flex items-center gap-2 text-sm text-gray-600 bg-white p-2 rounded-lg border border-gray-200">
              <ClockIcon className="w-4 h-4 text-emerald-600" />
              <span>Selected time:</span>
              <span className="font-medium text-emerald-700">{startTime} - {endTime}</span>
            </div>
          </div>

          {/* Advanced options (collapsible) */}
          <div>
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 transition-colors"
            >
              {showAdvanced ? (
                <ChevronUpIcon className="w-4 h-4" />
              ) : (
                <ChevronDownIcon className="w-4 h-4" />
              )}
              Advanced options
            </button>
            
            {showAdvanced && (
              <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-500">
                  You can set different time ranges for specific days by creating multiple schedules.
                </p>
              </div>
            )}
          </div>

          {/* Message */}
          {message && (
            <div className={`
              p-3 rounded-lg flex items-start gap-2
              ${message.type === 'success' ? 'bg-emerald-50 border border-emerald-200' : 'bg-red-50 border border-red-200'}
            `}>
              {message.type === 'success' ? (
                <CheckCircleIcon className="w-5 h-5 text-emerald-600 flex-shrink-0" />
              ) : (
                <ExclamationCircleIcon className="w-5 h-5 text-red-600 flex-shrink-0" />
              )}
              <p className={`text-sm ${message.type === 'success' ? 'text-emerald-700' : 'text-red-700'}`}>
                {message.text}
              </p>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-3 rounded-xl hover:from-emerald-700 hover:to-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-[1.02] active:scale-[0.98] font-medium shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
              type="button"
            >
              {isSaving ? (
                <>
                  <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  Creating...
                </>
              ) : (
                <>
                  <SparklesIcon className="w-5 h-5" />
                  Create {selectedDays.length} Slot{selectedDays.length !== 1 ? 's' : ''}
                </>
              )}
            </button>
          </div>

          {/* Summary */}
          {selectedDays.length > 0 && !isSaving && (
            <div className="text-center text-xs text-gray-400 border-t border-gray-100 pt-3">
              You're about to create {selectedDays.length} weekly slot{selectedDays.length !== 1 ? 's' : ''} from {startTime} to {endTime}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}