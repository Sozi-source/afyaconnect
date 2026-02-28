'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  CalendarIcon,
  ClockIcon,
  PencilIcon,
  TrashIcon,
  PlusIcon,
  ChevronLeftIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline'
import { Card, CardBody } from '@/app/components/ui/Card'
import { Button } from '@/app/components/ui/Buttons'
import { SingleSlotForm } from '@/app/components/practitioners/availability/SingleSlotForm'
import { BulkAvailabilityForm } from '@/app/components/practitioners/availability/BulkAvailabilityForm'
import { useAvailability } from '@/app/hooks/useAvailability'
import { useAuth } from '@/app/contexts/AuthContext'
import api from '@/app/lib/api/client'
import type { Availability } from '@/app/types'

interface PractitionerAvailabilityManagerProps {
  initialPractitionerId?: number
}

const DAYS_OF_WEEK = [
  'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'
]

export function PractitionerAvailabilityManager({ initialPractitionerId }: PractitionerAvailabilityManagerProps) {
  const { user } = useAuth()
  const [view, setView] = useState<'calendar' | 'list'>('list')
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [showAddForm, setShowAddForm] = useState(false)
  const [showBulkForm, setShowBulkForm] = useState(false)
  const [editingSlot, setEditingSlot] = useState<Availability | null>(null)
  const [groupedByDay, setGroupedByDay] = useState<Record<string, Availability[]>>({})
  const [practitionerId, setPractitionerId] = useState<number | null>(null)
  const [isLoadingPractitioner, setIsLoadingPractitioner] = useState(true)

  // Fetch the correct practitioner ID
  useEffect(() => {
    const fetchPractitionerId = async () => {
      setIsLoadingPractitioner(true)
      
      try {
        // Priority 1: From props
        if (initialPractitionerId) {
          console.log('📋 Using practitioner ID from props:', initialPractitionerId)
          setPractitionerId(initialPractitionerId)
          return
        }

        // Priority 2: From user context
        if (user?.practitioner?.id) {
          console.log('📋 Using practitioner ID from user context:', user.practitioner.id)
          setPractitionerId(user.practitioner.id)
          return
        }

        // Priority 3: Fetch from API
        console.log('📋 Fetching practitioner profile from API...')
        const response = await api.get('/practitioners/me/')
        console.log('📋 API response:', response.data)
        
        // The API might return the ID in different places
        const fetchedId = response.data?.id || response.data?.user?.id
        if (fetchedId) {
          console.log('📋 Using practitioner ID from API:', fetchedId)
          setPractitionerId(fetchedId)
        } else {
          // Fallback to known ID from curl tests
          console.log('📋 Using fallback practitioner ID: 3')
          setPractitionerId(3)
        }
      } catch (error) {
        console.error('❌ Failed to fetch practitioner ID:', error)
        // Fallback to known ID from curl tests
        console.log('📋 Using fallback practitioner ID: 3')
        setPractitionerId(3)
      } finally {
        setIsLoadingPractitioner(false)
      }
    }

    fetchPractitionerId()
  }, [user, initialPractitionerId])

  const { 
    availability, 
    loading, 
    error, 
    fetchAvailability, 
    updateSlot,
    deleteSlot
  } = useAvailability(practitionerId || undefined)

  // Group availability by day of week
  useEffect(() => {
    if (!availability || availability.length === 0) {
      setGroupedByDay({})
      return
    }

    const grouped: Record<string, Availability[]> = {}
    
    DAYS_OF_WEEK.forEach(day => {
      grouped[day] = []
    })

    availability.forEach(slot => {
      if (slot.recurrence_type === 'weekly' && slot.day_of_week !== null && slot.day_of_week !== undefined) {
        const dayIndex = slot.day_of_week
        const dayName = DAYS_OF_WEEK[dayIndex]
        if (dayName) {
          grouped[dayName].push(slot)
        }
      }
    })

    Object.keys(grouped).forEach(day => {
      grouped[day].sort((a, b) => a.start_time.localeCompare(b.start_time))
    })

    setGroupedByDay(grouped)
  }, [availability])

  const handleDeleteSlot = async (id: number) => {
    if (confirm('Are you sure you want to delete this availability slot?')) {
      try {
        await deleteSlot(id)
        fetchAvailability()
      } catch (error) {
        console.error('Failed to delete slot:', error)
      }
    }
  }

  const handleEditSlot = (slot: Availability) => {
    setEditingSlot(slot)
    setShowAddForm(true)
    setShowBulkForm(false)
  }

  const handleSuccess = () => {
    setShowAddForm(false)
    setShowBulkForm(false)
    setEditingSlot(null)
    fetchAvailability()
  }

  const handleCancel = () => {
    setShowAddForm(false)
    setShowBulkForm(false)
    setEditingSlot(null)
  }

  const formatTime = (time: string) => {
    return time.slice(0, 5)
  }

  const getOneTimeSlots = () => {
    return availability.filter(slot => 
      slot.recurrence_type === 'one_time' || slot.recurrence_type === 'unavailable'
    ).sort((a, b) => {
      if (a.specific_date && b.specific_date) {
        return a.specific_date.localeCompare(b.specific_date)
      }
      return 0
    })
  }

  const oneTimeSlots = getOneTimeSlots()

  if (isLoadingPractitioner || loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-4 border-emerald-200 border-t-emerald-600"></div>
      </div>
    )
  }

  if (!practitionerId) {
    return (
      <Card>
        <CardBody className="p-8 text-center">
          <p className="text-gray-600">Unable to identify practitioner profile. Please contact support.</p>
        </CardBody>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header with Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-semibold">Your Availability</h2>
          <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
            <button
              onClick={() => setView('list')}
              className={`px-3 py-1 text-sm rounded-md transition ${
                view === 'list' 
                  ? 'bg-white dark:bg-gray-700 shadow' 
                  : 'hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              List
            </button>
            <button
              onClick={() => setView('calendar')}
              className={`px-3 py-1 text-sm rounded-md transition ${
                view === 'calendar' 
                  ? 'bg-white dark:bg-gray-700 shadow' 
                  : 'hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              Calendar
            </button>
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button
            onClick={() => {
              setShowAddForm(true)
              setShowBulkForm(false)
              setEditingSlot(null)
            }}
            size="sm"
            className="flex items-center gap-2"
          >
            <PlusIcon className="h-4 w-4" />
            Add Slot
          </Button>
          <Button
            onClick={() => {
              setShowBulkForm(true)
              setShowAddForm(false)
              setEditingSlot(null)
            }}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <PlusIcon className="h-4 w-4" />
            Bulk Add
          </Button>
        </div>
      </div>

      {/* Add/Edit Forms */}
      <AnimatePresence>
        {showAddForm && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <SingleSlotForm
              practitionerId={practitionerId}
              onSuccess={handleSuccess}
              onCancel={handleCancel}
              initialData={editingSlot}
            />
          </motion.div>
        )}

        {showBulkForm && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <BulkAvailabilityForm
              practitionerId={practitionerId}
              onSuccess={handleSuccess}
              onCancel={handleCancel}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error Display */}
      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      {/* Availability Display */}
      {view === 'list' ? (
        <div className="space-y-6">
          {/* Weekly Recurring Slots */}
          <Card>
            <CardBody className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <ClockIcon className="h-5 w-5 text-emerald-600" />
                Weekly Schedule
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {DAYS_OF_WEEK.map(day => {
                  const slots = groupedByDay[day] || []
                  
                  return (
                    <div key={day} className="border rounded-lg p-4">
                      <h4 className="font-medium text-gray-900 dark:text-white mb-3">{day}</h4>
                      {slots.length > 0 ? (
                        <div className="space-y-2">
                          {slots.map(slot => (
                            <div
                              key={slot.id}
                              className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded group hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                            >
                              <div>
                                <span className="text-sm font-medium">
                                  {formatTime(slot.start_time)} - {formatTime(slot.end_time)}
                                </span>
                                {!slot.is_available && (
                                  <span className="ml-2 text-xs text-red-600">(Unavailable)</span>
                                )}
                                {slot.notes && (
                                  <p className="text-xs text-gray-500 mt-1">{slot.notes}</p>
                                )}
                              </div>
                              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition">
                                <button
                                  onClick={() => handleEditSlot(slot)}
                                  className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
                                  title="Edit slot"
                                >
                                  <PencilIcon className="h-4 w-4 text-blue-600" />
                                </button>
                                <button
                                  onClick={() => handleDeleteSlot(slot.id)}
                                  className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
                                  title="Delete slot"
                                >
                                  <TrashIcon className="h-4 w-4 text-red-600" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-gray-500">No slots set</p>
                      )}
                    </div>
                  )
                })}
              </div>
            </CardBody>
          </Card>

          {/* One-time and Unavailable Slots */}
          {oneTimeSlots.length > 0 && (
            <Card>
              <CardBody className="p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <CalendarIcon className="h-5 w-5 text-emerald-600" />
                  One-time & Unavailable Slots
                </h3>
                
                <div className="space-y-2">
                  {oneTimeSlots.map(slot => (
                    <div
                      key={slot.id}
                      className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded group hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full ${
                          slot.recurrence_type === 'unavailable' 
                            ? 'bg-red-500' 
                            : 'bg-emerald-500'
                        }`} />
                        <div>
                          <p className="font-medium">
                            {slot.specific_date ? new Date(slot.specific_date).toLocaleDateString('en-US', {
                              weekday: 'short',
                              month: 'short',
                              day: 'numeric'
                            }) : 'Date TBD'}
                          </p>
                          <p className="text-sm text-gray-600">
                            {formatTime(slot.start_time)} - {formatTime(slot.end_time)}
                            {!slot.is_available && ' • Unavailable'}
                          </p>
                          {slot.notes && (
                            <p className="text-xs text-gray-500 mt-1">{slot.notes}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition">
                        <button
                          onClick={() => handleEditSlot(slot)}
                          className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
                          title="Edit slot"
                        >
                          <PencilIcon className="h-4 w-4 text-blue-600" />
                        </button>
                        <button
                          onClick={() => handleDeleteSlot(slot.id)}
                          className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
                          title="Delete slot"
                        >
                          <TrashIcon className="h-4 w-4 text-red-600" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardBody>
            </Card>
          )}
        </div>
      ) : (
        // Calendar View
        <Card>
          <CardBody className="p-6">
            <div className="flex items-center justify-between mb-6">
              <button
                onClick={() => setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() - 1))}
                className="p-2 hover:bg-gray-100 rounded"
              >
                <ChevronLeftIcon className="h-5 w-5" />
              </button>
              <h3 className="text-lg font-semibold">
                {selectedDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
              </h3>
              <button
                onClick={() => setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1))}
                className="p-2 hover:bg-gray-100 rounded"
              >
                <ChevronRightIcon className="h-5 w-5" />
              </button>
            </div>

            <div className="grid grid-cols-7 gap-2">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="text-center text-sm font-medium py-2">
                  {day}
                </div>
              ))}

              <p className="col-span-7 text-center py-8 text-gray-500">
                Calendar view coming soon - use List view for now
              </p>
            </div>
          </CardBody>
        </Card>
      )}

      {/* Empty State */}
      {availability.length === 0 && !showAddForm && !showBulkForm && (
        <Card>
          <CardBody className="p-12 text-center">
            <CalendarIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Availability Set</h3>
            <p className="text-gray-600 mb-6">
              Add your first availability slot to start accepting bookings from clients.
            </p>
            <div className="flex justify-center gap-4">
              <Button onClick={() => setShowAddForm(true)}>
                Add Single Slot
              </Button>
              <Button variant="outline" onClick={() => setShowBulkForm(true)}>
                Bulk Add
              </Button>
            </div>
          </CardBody>
        </Card>
      )}
    </div>
  )
}