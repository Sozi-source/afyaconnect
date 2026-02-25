'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { XMarkIcon } from '@heroicons/react/24/outline'
import { Card, CardBody } from '@/app/components/ui/Card'
import { Button } from '@/app/components/ui/Buttons'
import { useAvailability } from '@/app/hooks/useAvailability'
import type { DayOfWeek, BulkAvailabilityData } from '@/app/types'

const DAYS_OF_WEEK = [
  { value: 0 as DayOfWeek, label: 'Monday' },
  { value: 1 as DayOfWeek, label: 'Tuesday' },
  { value: 2 as DayOfWeek, label: 'Wednesday' },
  { value: 3 as DayOfWeek, label: 'Thursday' },
  { value: 4 as DayOfWeek, label: 'Friday' },
  { value: 5 as DayOfWeek, label: 'Saturday' },
  { value: 6 as DayOfWeek, label: 'Sunday' },
]

interface BulkAvailabilityFormProps {
  practitionerId: number
  onSuccess: () => void
  onCancel: () => void
}

export function BulkAvailabilityForm({ 
  practitionerId, 
  onSuccess, 
  onCancel 
}: BulkAvailabilityFormProps) {
  const [selectedDays, setSelectedDays] = useState<DayOfWeek[]>([])
  const [startTime, setStartTime] = useState('09:00')
  const [endTime, setEndTime] = useState('17:00')
  const [isAvailable, setIsAvailable] = useState(true)
  const [notes, setNotes] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const { bulkCreateSlots } = useAvailability(practitionerId)

  const handleDayToggle = (day: DayOfWeek) => {
    setSelectedDays(prev =>
      prev.includes(day)
        ? prev.filter(d => d !== day)
        : [...prev, day]
    )
    setError(null)
  }

  const handleSelectAll = () => {
    setSelectedDays(DAYS_OF_WEEK.map(d => d.value))
    setError(null)
  }

  const handleClearAll = () => {
    setSelectedDays([])
    setError(null)
  }

  const validateForm = (): boolean => {
    if (selectedDays.length === 0) {
      setError('Please select at least one day')
      return false
    }

    if (startTime >= endTime) {
      setError('End time must be after start time')
      return false
    }

    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    setIsSubmitting(true)
    setError(null)
    
    try {
      // Prepare data in the format expected by BulkAvailabilityData
      // Note: practitioner_id is not needed as it's determined from the auth token
      const bulkData: BulkAvailabilityData = {
        days: selectedDays,
        start_time: startTime,
        end_time: endTime,
        is_available: isAvailable,
        notes: notes.trim() || undefined
      }
      
      await bulkCreateSlots(bulkData)
      onSuccess()
    } catch (err: any) {
      setError(err.message || 'Failed to create availability slots')
      console.error('Failed to create bulk slots:', err)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="mb-6"
    >
      <Card>
        <CardBody className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold dark:text-white">
              Add Weekly Schedule
            </h3>
            <button
              type="button"
              onClick={onCancel}
              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
              disabled={isSubmitting}
            >
              <XMarkIcon className="h-5 w-5 text-gray-500" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Error Message */}
            {error && (
              <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
              </div>
            )}

            {/* Day Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Select Days <span className="text-red-500">*</span>
              </label>
              <div className="flex flex-wrap gap-2 mb-2">
                <Button
                  type="button"
                  className='font-sm'
                  variant="outline"
                  onClick={handleSelectAll}
                  disabled={isSubmitting}
                >
                  Select All
                </Button>
                <Button
                  type="button"
                  className='font-sm'
                  variant="outline"
                  onClick={handleClearAll}
                  disabled={isSubmitting}
                >
                  Clear All
                </Button>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {DAYS_OF_WEEK.map(day => (
                  <label
                    key={day.value}
                    className={`
                      flex items-center justify-center p-2 rounded-lg border-2 cursor-pointer transition
                      ${selectedDays.includes(day.value)
                        ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20'
                        : 'border-gray-200 hover:border-gray-300 dark:border-gray-700 dark:hover:border-gray-600'
                      }
                      ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}
                    `}
                  >
                    <input
                      type="checkbox"
                      checked={selectedDays.includes(day.value)}
                      onChange={() => handleDayToggle(day.value)}
                      disabled={isSubmitting}
                      className="sr-only"
                    />
                    <span className={`text-sm ${
                      selectedDays.includes(day.value)
                        ? 'text-emerald-700 dark:text-emerald-300 font-medium'
                        : 'text-gray-700 dark:text-gray-300'
                    }`}>
                      {day.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Time Range */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Start Time <span className="text-red-500">*</span>
                </label>
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => {
                    setStartTime(e.target.value)
                    setError(null)
                  }}
                  disabled={isSubmitting}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent dark:bg-gray-800 dark:text-white disabled:opacity-50"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  End Time <span className="text-red-500">*</span>
                </label>
                <input
                  type="time"
                  value={endTime}
                  onChange={(e) => {
                    setEndTime(e.target.value)
                    setError(null)
                  }}
                  disabled={isSubmitting}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent dark:bg-gray-800 dark:text-white disabled:opacity-50"
                  required
                />
              </div>
            </div>

            {/* Availability Toggle */}
            <div>
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={isAvailable}
                  onChange={(e) => setIsAvailable(e.target.checked)}
                  disabled={isSubmitting}
                  className="w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500 disabled:opacity-50"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  Available for booking
                </span>
              </label>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 ml-7">
                Uncheck to mark these times as unavailable (e.g., breaks, meetings)
              </p>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Notes (Optional)
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                disabled={isSubmitting}
                placeholder="e.g., Lunch break, Team meeting"
                maxLength={255}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent dark:bg-gray-800 dark:text-white disabled:opacity-50"
              />
            </div>

            {/* Preview */}
            {selectedDays.length > 0 && (
              <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Will create {selectedDays.length} weekly slot{selectedDays.length !== 1 ? 's' : ''}:
                </p>
                <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
                  {selectedDays.map(day => {
                    const dayName = DAYS_OF_WEEK.find(d => d.value === day)?.label
                    return (
                      <span
                        key={day}
                        className="inline-flex items-center px-2 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 rounded text-xs"
                      >
                        {dayName}: {startTime} - {endTime}
                        {!isAvailable && ' (Unavailable)'}
                      </span>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting || selectedDays.length === 0}
                isLoading={isSubmitting}
              >
                {isSubmitting 
                  ? 'Creating...' 
                  : `Create ${selectedDays.length} Slot${selectedDays.length !== 1 ? 's' : ''}`
                }
              </Button>
            </div>
          </form>
        </CardBody>
      </Card>
    </motion.div>
  )
}