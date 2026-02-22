'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  CalendarIcon,
  ClockIcon,
  PencilIcon,
  TrashIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  FunnelIcon
} from '@heroicons/react/24/outline'
import { Card, CardBody } from '@/app/components/ui/Card'
import { Button } from '@/app/components/ui/Buttons'
import type { Availability } from '@/app/types'

const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

interface AvailabilityListProps {
  availability: Availability[]
  loading: boolean
  onEdit: (id: number, data: Partial<Availability>) => Promise<any>
  onDelete: (id: number) => Promise<void>
}

export function AvailabilityList({ availability, loading, onEdit, onDelete }: AvailabilityListProps) {
  const [filter, setFilter] = useState<'all' | 'available' | 'unavailable'>('all')
  const [sortBy, setSortBy] = useState<'day' | 'time'>('day')
  const [expandedId, setExpandedId] = useState<number | null>(null)

  const filteredAvailability = availability.filter(slot => {
    if (filter === 'available') return slot.is_available
    if (filter === 'unavailable') return !slot.is_available
    return true
  })

  const sortedAvailability = [...filteredAvailability].sort((a, b) => {
    if (sortBy === 'day') {
      // Sort by day of week then time
      const dayA = a.day_of_week ?? 7
      const dayB = b.day_of_week ?? 7
      if (dayA !== dayB) return dayA - dayB
      return a.start_time.localeCompare(b.start_time)
    } else {
      // Sort by time then day
      if (a.start_time !== b.start_time) {
        return a.start_time.localeCompare(b.start_time)
      }
      const dayA = a.day_of_week ?? 7
      const dayB = b.day_of_week ?? 7
      return dayA - dayB
    }
  })

  const groupedByDay = sortedAvailability.reduce((acc, slot) => {
    if (slot.recurrence_type === 'weekly' && slot.day_of_week !== null) {
      const day = slot.day_of_week
      if (!acc[day]) acc[day] = []
      acc[day].push(slot)
    } else {
      // One-time or unavailable slots
      if (!acc['special']) acc['special'] = []
      acc['special'].push(slot)
    }
    return acc
  }, {} as Record<string | number, Availability[]>)

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this availability slot?')) {
      await onDelete(id)
    }
  }

  if (loading) {
    return (
      <Card>
        <CardBody className="p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto"></div>
          <p className="text-gray-500 mt-4">Loading availability...</p>
        </CardBody>
      </Card>
    )
  }

  return (
    <Card>
      <CardBody className="p-4">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
          <div className="flex items-center gap-2">
            <FunnelIcon className="h-4 w-4 text-gray-400" />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as any)}
              className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-800"
            >
              <option value="all">All Slots</option>
              <option value="available">Available Only</option>
              <option value="unavailable">Unavailable Only</option>
            </select>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-800"
            >
              <option value="day">Sort by Day</option>
              <option value="time">Sort by Time</option>
            </select>
          </div>
          <p className="text-sm text-gray-500">
            {sortedAvailability.length} slot{sortedAvailability.length !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Availability List */}
        {sortedAvailability.length === 0 ? (
          <div className="text-center py-12">
            <CalendarIcon className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-500 dark:text-gray-400">No availability slots found</p>
            <p className="text-sm text-gray-400 mt-2">
              Add your first slot using the forms above
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Weekly Slots by Day */}
            {Object.entries(groupedByDay).map(([day, slots]) => {
              if (day === 'special') return null
              const dayName = DAYS_OF_WEEK[parseInt(day)]
              return (
                <div key={day} className="border-b border-gray-200 dark:border-gray-700 pb-4 last:border-0">
                  <h3 className="font-medium text-gray-900 dark:text-white mb-3">{dayName}</h3>
                  <div className="space-y-2">
                    {slots.map(slot => (
                      <SlotItem
                        key={slot.id}
                        slot={slot}
                        isExpanded={expandedId === slot.id}
                        onToggleExpand={() => setExpandedId(expandedId === slot.id ? null : slot.id)}
                        onEdit={() => onEdit(slot.id, slot)}
                        onDelete={() => handleDelete(slot.id)}
                      />
                    ))}
                  </div>
                </div>
              )
            })}

            {/* Special Slots (One-time/Unavailable) */}
            {groupedByDay['special'] && groupedByDay['special'].length > 0 && (
              <div className="pt-2">
                <h3 className="font-medium text-gray-900 dark:text-white mb-3">Special Dates</h3>
                <div className="space-y-2">
                  {groupedByDay['special'].map(slot => (
                    <SlotItem
                      key={slot.id}
                      slot={slot}
                      isExpanded={expandedId === slot.id}
                      onToggleExpand={() => setExpandedId(expandedId === slot.id ? null : slot.id)}
                      onEdit={() => onEdit(slot.id, slot)}
                      onDelete={() => handleDelete(slot.id)}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </CardBody>
    </Card>
  )
}

interface SlotItemProps {
  slot: Availability
  isExpanded: boolean
  onToggleExpand: () => void
  onEdit: () => void
  onDelete: () => void
}

function SlotItem({ slot, isExpanded, onToggleExpand, onEdit, onDelete }: SlotItemProps) {
  const isAvailable = slot.is_available
  const isWeekly = slot.recurrence_type === 'weekly'

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={`
        rounded-lg border-2 transition
        ${isAvailable 
          ? 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20' 
          : 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20'
        }
      `}
    >
      <div className="p-3">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className={`
                px-2 py-0.5 text-xs rounded-full font-medium
                ${isAvailable 
                  ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' 
                  : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
                }
              `}>
                {isAvailable ? 'Available' : 'Unavailable'}
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {isWeekly ? 'Weekly' : slot.recurrence_type === 'one_time' ? 'One-time' : 'Blocked'}
              </span>
            </div>

            <div className="flex items-center gap-4 text-sm">
              <span className="flex items-center text-gray-700 dark:text-gray-300">
                <CalendarIcon className="h-4 w-4 mr-1 text-gray-400" />
                {isWeekly 
                  ? ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'][slot.day_of_week || 0]
                  : slot.specific_date
                }
              </span>
              <span className="flex items-center text-gray-700 dark:text-gray-300">
                <ClockIcon className="h-4 w-4 mr-1 text-gray-400" />
                {slot.start_time.slice(0,5)} - {slot.end_time.slice(0,5)}
              </span>
            </div>

            {slot.notes && !isExpanded && (
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-1">
                📝 {slot.notes}
              </p>
            )}
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={onEdit}
              className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition"
              title="Edit slot"
            >
              <PencilIcon className="h-4 w-4 text-gray-600 dark:text-gray-400" />
            </button>
            <button
              onClick={onDelete}
              className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition text-red-600 dark:text-red-400"
              title="Delete slot"
            >
              <TrashIcon className="h-4 w-4" />
            </button>
            {slot.notes && (
              <button
                onClick={onToggleExpand}
                className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition"
              >
                {isExpanded ? (
                  <ChevronUpIcon className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                ) : (
                  <ChevronDownIcon className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                )}
              </button>
            )}
          </div>
        </div>

        {/* Expanded Notes */}
        <AnimatePresence>
          {isExpanded && slot.notes && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                📝 {slot.notes}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}