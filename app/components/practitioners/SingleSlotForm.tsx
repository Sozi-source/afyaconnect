'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { XMarkIcon } from '@heroicons/react/24/outline'
import { Card, CardBody } from '@/app/components/ui/Card'
import { Button } from '@/app/components/ui/Buttons'
import { useAvailability } from '@/app/hooks/useAvailability'
import type { RecurrenceType, DayOfWeek, Availability, CreateAvailabilityData } from '@/app/types'

const RECURRENCE_TYPES = [
  { value: 'weekly' as RecurrenceType, label: 'Weekly Recurring' },
  { value: 'one_time' as RecurrenceType, label: 'One-Time Adjustment' },
  { value: 'unavailable' as RecurrenceType, label: 'Unavailable Block' },
]

const DAYS_OF_WEEK = [
  { value: 0 as DayOfWeek, label: 'Monday' },
  { value: 1 as DayOfWeek, label: 'Tuesday' },
  { value: 2 as DayOfWeek, label: 'Wednesday' },
  { value: 3 as DayOfWeek, label: 'Thursday' },
  { value: 4 as DayOfWeek, label: 'Friday' },
  { value: 5 as DayOfWeek, label: 'Saturday' },
  { value: 6 as DayOfWeek, label: 'Sunday' },
]

interface SingleSlotFormProps {
  practitionerId: number
  onSuccess: () => void
  onCancel: () => void
  initialData?: Availability | null
}

interface SlotFormData {
  practitioner: number
  recurrence_type: RecurrenceType
  day_of_week?: DayOfWeek | null
  specific_date?: string | null
  start_time: string
  end_time: string
  is_available: boolean
  notes: string
}

export function SingleSlotForm({ 
  practitionerId, 
  onSuccess, 
  onCancel,
  initialData 
}: SingleSlotFormProps) {
  const [formData, setFormData] = useState<SlotFormData>({
    practitioner: practitionerId,
    recurrence_type: initialData?.recurrence_type || 'weekly',
    day_of_week: initialData?.day_of_week ?? 0,
    specific_date: initialData?.specific_date || '',
    start_time: initialData?.start_time?.slice(0,5) || '09:00',
    end_time: initialData?.end_time?.slice(0,5) || '17:00',
    is_available: initialData?.is_available ?? true,
    notes: initialData?.notes || ''
  })
  
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const { createSlot, updateSlot } = useAvailability(practitionerId)

  // Set today's date as min for date picker
  const today = new Date().toISOString().split('T')[0]

  const handleChange = <K extends keyof SlotFormData>(key: K, value: SlotFormData[K]) => {
    setFormData(prev => ({ ...prev, [key]: value }))
    setError(null)
  }

  const validateForm = (): boolean => {
    if (formData.start_time >= formData.end_time) {
      setError('End time must be after start time')
      return false
    }

    if (formData.recurrence_type === 'weekly' && formData.day_of_week === undefined) {
      setError('Please select a day of week')
      return false
    }

    if (formData.recurrence_type !== 'weekly' && !formData.specific_date) {
      setError('Please select a date')
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
      // Prepare data matching CreateAvailabilityData type
      const slotData: Partial<CreateAvailabilityData> = {
        recurrence_type: formData.recurrence_type,
        start_time: formData.start_time,
        end_time: formData.end_time,
        is_available: formData.is_available,
        notes: formData.notes.trim() || undefined
      }

      // Add conditional fields based on recurrence type
      if (formData.recurrence_type === 'weekly') {
        slotData.day_of_week = formData.day_of_week ?? undefined
        slotData.specific_date = undefined
      } else {
        slotData.day_of_week = undefined
        slotData.specific_date = formData.specific_date || undefined
      }

      if (initialData) {
        await updateSlot(initialData.id, slotData)
      } else {
        await createSlot(slotData as CreateAvailabilityData)
      }
      onSuccess()
    } catch (err: any) {
      setError(err.message || 'Failed to save availability slot')
      console.error('Error saving slot:', err)
    } finally {
      setIsSubmitting(false)
    }
  }

  const isWeekly = formData.recurrence_type === 'weekly'
  const requiresDate = formData.recurrence_type === 'one_time' || formData.recurrence_type === 'unavailable'

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
              {initialData ? 'Edit Slot' : 'Add New Slot'}
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

            {/* Recurrence Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Type <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.recurrence_type}
                onChange={(e) => handleChange('recurrence_type', e.target.value as RecurrenceType)}
                disabled={isSubmitting}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 dark:bg-gray-800 dark:text-white disabled:opacity-50"
              >
                {RECURRENCE_TYPES.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Day of Week (for weekly) */}
            {isWeekly && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Day of Week <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.day_of_week ?? 0}
                  onChange={(e) => handleChange('day_of_week', parseInt(e.target.value) as DayOfWeek)}
                  disabled={isSubmitting}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 dark:bg-gray-800 dark:text-white disabled:opacity-50"
                >
                  {DAYS_OF_WEEK.map(day => (
                    <option key={day.value} value={day.value}>
                      {day.label}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Date (for one-time/unavailable) */}
            {requiresDate && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {formData.recurrence_type === 'unavailable' ? 'Unavailable Date' : 'Date'} <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={formData.specific_date || ''}
                  onChange={(e) => handleChange('specific_date', e.target.value)}
                  min={today}
                  disabled={isSubmitting}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 dark:bg-gray-800 dark:text-white disabled:opacity-50"
                  required
                />
              </div>
            )}

            {/* Time Range */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Start Time <span className="text-red-500">*</span>
                </label>
                <input
                  type="time"
                  value={formData.start_time}
                  onChange={(e) => handleChange('start_time', e.target.value)}
                  disabled={isSubmitting}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 dark:bg-gray-800 dark:text-white disabled:opacity-50"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  End Time <span className="text-red-500">*</span>
                </label>
                <input
                  type="time"
                  value={formData.end_time}
                  onChange={(e) => handleChange('end_time', e.target.value)}
                  disabled={isSubmitting}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 dark:bg-gray-800 dark:text-white disabled:opacity-50"
                  required
                />
              </div>
            </div>

            {/* Availability Toggle */}
            <div>
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={formData.is_available}
                  onChange={(e) => handleChange('is_available', e.target.checked)}
                  disabled={isSubmitting}
                  className="w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500 disabled:opacity-50"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  Available for booking
                </span>
              </label>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Notes (Optional)
              </label>
              <input
                type="text"
                value={formData.notes}
                onChange={(e) => handleChange('notes', e.target.value)}
                disabled={isSubmitting}
                placeholder="e.g., Lunch break, Special appointment"
                maxLength={255}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 dark:bg-gray-800 dark:text-white disabled:opacity-50"
              />
            </div>

            {/* Preview */}
            <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Preview:</p>
              <div className="flex items-center gap-2 text-sm">
                <span className="px-2 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 rounded">
                  {isWeekly 
                    ? DAYS_OF_WEEK.find(d => d.value === formData.day_of_week)?.label
                    : formData.specific_date || 'Date TBD'
                  }
                </span>
                <span className="text-gray-500">→</span>
                <span className="px-2 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 rounded">
                  {formData.start_time} - {formData.end_time}
                </span>
              </div>
              {formData.notes && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                  📝 {formData.notes}
                </p>
              )}
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Type: {RECURRENCE_TYPES.find(t => t.value === formData.recurrence_type)?.label}
                {!formData.is_available && ' • Unavailable'}
              </p>
            </div>

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
                disabled={isSubmitting}
                isLoading={isSubmitting}
              >
                {isSubmitting 
                  ? 'Saving...' 
                  : initialData ? 'Update Slot' : 'Create Slot'
                }
              </Button>
            </div>
          </form>
        </CardBody>
      </Card>
    </motion.div>
  )
}