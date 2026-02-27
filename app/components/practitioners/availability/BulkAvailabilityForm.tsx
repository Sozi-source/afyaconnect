'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { XMarkIcon, CheckCircleIcon, ExclamationCircleIcon } from '@heroicons/react/24/outline'
import { Card, CardBody } from '@/app/components/ui/Card'
import { Button } from '@/app/components/ui/Buttons'
import { apiClient } from '@/app/lib/api'
import type { DayOfWeek, CreateAvailabilityData } from '@/app/types'

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

interface SlotResult {
  day: DayOfWeek
  success: boolean
  error?: string
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
  const [progress, setProgress] = useState({ current: 0, total: 0 })
  const [results, setResults] = useState<SlotResult[]>([])
  const [showResults, setShowResults] = useState(false)

  const handleDayToggle = (day: DayOfWeek) => {
    setSelectedDays(prev =>
      prev.includes(day)
        ? prev.filter(d => d !== day)
        : [...prev, day]
    )
    setError(null)
    setShowResults(false)
  }

  const handleSelectAll = () => {
    setSelectedDays(DAYS_OF_WEEK.map(d => d.value))
    setError(null)
    setShowResults(false)
  }

  const handleClearAll = () => {
    setSelectedDays([])
    setError(null)
    setShowResults(false)
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

  const createSingleSlot = async (day: DayOfWeek): Promise<SlotResult> => {
    try {
      const slotData: CreateAvailabilityData = {
        recurrence_type: 'weekly',
        day_of_week: day,
        start_time: startTime,
        end_time: endTime,
        is_available: isAvailable,
        notes: notes.trim() || undefined
      }
      
      await apiClient.availability.create(slotData)
      return { day, success: true }
    } catch (err: any) {
      console.error(`Failed to create slot for day ${day}:`, err)
      return { 
        day, 
        success: false, 
        error: err.response?.data?.detail || err.message || 'Failed to create slot'
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    setIsSubmitting(true)
    setError(null)
    setResults([])
    setShowResults(false)
    setProgress({ current: 0, total: selectedDays.length })
    
    const slotResults: SlotResult[] = []

    // Create slots one by one
    for (let i = 0; i < selectedDays.length; i++) {
      const day = selectedDays[i]
      const result = await createSingleSlot(day)
      slotResults.push(result)
      
      // Update progress
      setProgress({ current: i + 1, total: selectedDays.length })
      setResults([...slotResults])
      
      // Small delay to prevent overwhelming the server
      if (i < selectedDays.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 300))
      }
    }

    setShowResults(true)
    
    // Check if all succeeded
    const allSucceeded = slotResults.every(r => r.success)
    const successCount = slotResults.filter(r => r.success).length

    if (allSucceeded) {
      // All succeeded - auto close after 1.5 seconds
      setTimeout(() => {
        onSuccess()
      }, 1500)
    }

    setIsSubmitting(false)
  }

  const successCount = results.filter(r => r.success).length
  const failedCount = results.filter(r => !r.success).length
  const allSucceeded = results.length > 0 && results.every(r => r.success)

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
              aria-label="Close"
            >
              <XMarkIcon className="h-5 w-5 text-gray-500" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Error Message */}
            {error && !showResults && (
              <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <div className="flex items-start gap-2">
                  <ExclamationCircleIcon className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                </div>
              </div>
            )}

            {/* Progress Bar */}
            {isSubmitting && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">
                    Creating slots...
                  </span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                    {progress.current}/{progress.total}
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                  <div 
                    className="bg-emerald-600 h-2.5 rounded-full transition-all duration-300"
                    style={{ width: `${(progress.current / progress.total) * 100}%` }}
                  />
                </div>
              </div>
            )}

            {/* Results Summary */}
            {showResults && !isSubmitting && (
              <div className={`p-4 rounded-lg ${
                allSucceeded 
                  ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
                  : failedCount > 0 && successCount > 0
                    ? 'bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800'
                    : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
              }`}>
                <div className="flex items-start gap-3">
                  {allSucceeded ? (
                    <CheckCircleIcon className="h-6 w-6 text-green-600 dark:text-green-400 flex-shrink-0" />
                  ) : (
                    <ExclamationCircleIcon className="h-6 w-6 text-yellow-600 dark:text-yellow-400 flex-shrink-0" />
                  )}
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {allSucceeded 
                        ? 'All slots created successfully!' 
                        : `Created ${successCount} of ${results.length} slots`
                      }
                    </p>
                    {failedCount > 0 && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        Failed to create {failedCount} slot{failedCount !== 1 ? 's' : ''}. You can try again individually.
                      </p>
                    )}
                  </div>
                </div>
                
                {/* Failed Slots Details */}
                {failedCount > 0 && (
                  <div className="mt-3 space-y-2">
                    {results.filter(r => !r.success).map((result, idx) => {
                      const dayName = DAYS_OF_WEEK.find(d => d.value === result.day)?.label
                      return (
                        <div key={idx} className="text-sm bg-white dark:bg-gray-800 p-2 rounded border border-red-200 dark:border-red-800">
                          <span className="font-medium text-red-600 dark:text-red-400">{dayName}:</span>{' '}
                          <span className="text-gray-600 dark:text-gray-400">{result.error}</span>
                        </div>
                      )
                    })}
                  </div>
                )}
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
                  variant="outline"
                  size="sm"
                  onClick={handleSelectAll}
                  disabled={isSubmitting}
                >
                  Select All
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
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
            {selectedDays.length > 0 && !isSubmitting && !showResults && (
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
                  ? `Creating ${progress.current}/${progress.total}...` 
                  : `Create ${selectedDays.length} Slot${selectedDays.length !== 1 ? 's' : ''}`
                }
              </Button>
            </div>

            {/* Auto-close message */}
            {showResults && allSucceeded && !isSubmitting && (
              <p className="text-center text-sm text-emerald-600 dark:text-emerald-400 mt-2">
                ✓ Closing automatically...
              </p>
            )}
          </form>
        </CardBody>
      </Card>
    </motion.div>
  )
}