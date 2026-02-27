'use client'

import { motion, AnimatePresence } from 'framer-motion'
import {
  XMarkIcon,
  CheckCircleIcon,
  CalendarIcon,
  ClockIcon,
  UserIcon,
  DocumentTextIcon,
  ExclamationCircleIcon
} from '@heroicons/react/24/outline'
import { Button } from '@/app/components/ui/Buttons'
import type { TimeSlot } from '@/app/types'

interface BookingConfirmationModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => Promise<void>
  slot: TimeSlot | null
  practitionerName: string
  isLoading?: boolean
  error?: string | null
}

// Helper function to format date
const formatDate = (dateStr: string): string => {
  try {
    return new Date(dateStr).toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    })
  } catch (e) {
    return dateStr || 'Invalid date'
  }
}

// Helper function to format time range
const formatTimeRange = (start: string, end: string): string => {
  if (!start || !end) return 'Time not specified'
  return `${start.slice(0,5)} - ${end.slice(0,5)}`
}

// Helper function to calculate duration in minutes
const calculateDuration = (start: string, end: string): number => {
  if (!start || !end) return 60
  
  const [startHour, startMin] = start.split(':').map(Number)
  const [endHour, endMin] = end.split(':').map(Number)
  
  const startMinutes = startHour * 60 + startMin
  const endMinutes = endHour * 60 + endMin
  
  return endMinutes - startMinutes
}

export function BookingConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  slot,
  practitionerName,
  isLoading = false,
  error = null
}: BookingConfirmationModalProps) {
  if (!slot) return null

  const duration = calculateDuration(slot.start_time, slot.end_time)

  const handleConfirm = async () => {
    try {
      await onConfirm()
    } catch (e) {
      // Error is handled by parent component
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white dark:bg-gray-800 rounded-xl max-w-md w-full shadow-xl"
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                Confirm Booking
              </h3>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
                disabled={isLoading}
                aria-label="Close"
              >
                <XMarkIcon className="h-5 w-5 text-gray-500" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-4">
              {/* Error Message */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg"
                >
                  <div className="flex items-start gap-2">
                    <ExclamationCircleIcon className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                  </div>
                </motion.div>
              )}

              {/* Success Preview */}
              {!error && (
                <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
                  <CheckCircleIcon className="h-8 w-8 text-emerald-600 dark:text-emerald-400 mx-auto mb-2" />
                  <p className="text-center text-emerald-700 dark:text-emerald-300 font-medium">
                    Almost there! Review your booking details
                  </p>
                </div>
              )}

              {/* Booking Details */}
              <div className="space-y-3">
                <DetailItem
                  icon={UserIcon}
                  label="Practitioner"
                  value={practitionerName}
                />
                <DetailItem
                  icon={CalendarIcon}
                  label="Date"
                  value={formatDate(slot.date)}
                />
                <DetailItem
                  icon={ClockIcon}
                  label="Time"
                  value={formatTimeRange(slot.start_time, slot.end_time)}
                />
                <DetailItem
                  icon={DocumentTextIcon}
                  label="Duration"
                  value={`${duration} minutes`}
                />
              </div>

              {/* Terms */}
              <div className="text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg">
                <p className="font-medium mb-1">Booking Policy:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Free cancellation up to 24 hours before</li>
                  <li>You'll receive a confirmation email</li>
                  <li>Meeting link will be provided 5 minutes before</li>
                </ul>
              </div>
            </div>

            {/* Footer */}
            <div className="flex gap-3 p-6 border-t border-gray-200 dark:border-gray-700">
              <Button
                variant="outline"
                onClick={onClose}
                disabled={isLoading}
                fullWidth
              >
                Cancel
              </Button>
              <Button
                onClick={handleConfirm}
                disabled={isLoading || !!error}
                isLoading={isLoading}
                fullWidth
                className="bg-emerald-600 hover:bg-emerald-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Confirming...' : 'Confirm Booking'}
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

interface DetailItemProps {
  icon: React.ElementType
  label: string
  value: string
}

function DetailItem({ icon: Icon, label, value }: DetailItemProps) {
  return (
    <div className="flex items-start gap-3">
      <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
        <Icon className="h-4 w-4 text-gray-600 dark:text-gray-400" />
      </div>
      <div className="flex-1">
        <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
        <p className="text-sm font-medium text-gray-900 dark:text-white break-words">
          {value || 'Not specified'}
        </p>
      </div>
    </div>
  )
}