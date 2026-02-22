'use client'

import { useState, useEffect } from 'react'
import { useAvailability } from '@/app/hooks/useAvailability'
import { useAuth } from '@/app/contexts/AuthContext'
import { apiClient } from '@/app/lib/api'
import { Button } from '@/app/components/ui/Buttons'
import { Card, CardBody, CardHeader } from '@/app/components/ui/Card'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  PlusIcon, 
  TrashIcon, 
  PencilIcon,
  ClockIcon,
  CalendarIcon 
} from '@heroicons/react/24/outline'
import type { Availability, RecurrenceType, DayOfWeek } from '@/app/types'

// Extended user type
interface ExtendedUser {
  id: number
  email: string
  first_name?: string
  last_name?: string
  username?: string
  role?: string
  is_verified?: boolean
}

const DAYS_OF_WEEK: { value: DayOfWeek; label: string }[] = [
  { value: 0, label: 'Monday' },
  { value: 1, label: 'Tuesday' },
  { value: 2, label: 'Wednesday' },
  { value: 3, label: 'Thursday' },
  { value: 4, label: 'Friday' },
  { value: 5, label: 'Saturday' },
  { value: 6, label: 'Sunday' },
]

const RECURRENCE_TYPES: { value: RecurrenceType; label: string }[] = [
  { value: 'weekly', label: 'Weekly Recurring' },
  { value: 'one_time', label: 'One-Time' },
  { value: 'unavailable', label: 'Unavailable Block' },
]

interface FormData {
  recurrence_type: RecurrenceType
  day_of_week: DayOfWeek | null
  specific_date: string
  start_time: string
  end_time: string
  is_available: boolean
  notes: string
}

export function AvailabilityManager() {
  const { user } = useAuth()
  const extendedUser = user as ExtendedUser | null
  const [practitionerId, setPractitionerId] = useState<number | null>(null)
  const [loadingPractitioner, setLoadingPractitioner] = useState(true)
  
  const {
    availability,
    loading: availabilityLoading,
    fetchMyAvailability,  // ✅ Correct method name
    createSlot,
    bulkCreateSlots,
    updateSlot,
    deleteSlot
  } = useAvailability(practitionerId || undefined)

  const [showForm, setShowForm] = useState(false)
  const [showBulkForm, setShowBulkForm] = useState(false)
  const [editingSlot, setEditingSlot] = useState<Availability | null>(null)
  const [formData, setFormData] = useState<FormData>({
    recurrence_type: 'weekly',
    day_of_week: 0,
    specific_date: '',
    start_time: '09:00',
    end_time: '17:00',
    is_available: true,
    notes: ''
  })

  // Fetch practitioner ID on mount
  useEffect(() => {
    const fetchPractitionerId = async () => {
      try {
        setLoadingPractitioner(true)
        // Get current practitioner profile
        const practitioner = await apiClient.practitioners.getMyProfile()
        setPractitionerId(practitioner.id)
        console.log('✅ Found practitioner ID:', practitioner.id)
      } catch (error) {
        console.error('No practitioner found for current user')
        setPractitionerId(null)
      } finally {
        setLoadingPractitioner(false)
      }
    }

    if (extendedUser?.role === 'practitioner' && extendedUser?.is_verified) {
      fetchPractitionerId()
    } else {
      setLoadingPractitioner(false)
    }
  }, [extendedUser])

  // Fetch availability once we have practitioner ID
  useEffect(() => {
    if (practitionerId) {
      fetchMyAvailability()  // ✅ Using correct method name
    }
  }, [practitionerId, fetchMyAvailability])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!practitionerId) {
      alert('Practitioner ID not found. Please ensure you have a practitioner profile.')
      return
    }
    
    try {
      const slotData = {
        ...formData,
        practitioner: practitionerId
      }
      
      if (editingSlot) {
        await updateSlot(editingSlot.id, slotData)
      } else {
        await createSlot(slotData)
      }
      resetForm()
      await fetchMyAvailability() // ✅ Refresh the list
    } catch (error) {
      console.error('Error saving slot:', error)
      alert('Failed to save availability slot')
    }
  }

  const handleBulkSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!practitionerId) {
      alert('Practitioner ID not found. Please ensure you have a practitioner profile.')
      return
    }
    
    const form = e.target as HTMLFormElement
    const formData = new FormData(form)
    
    const days: DayOfWeek[] = DAYS_OF_WEEK
      .filter((_, index) => formData.get(`day_${index}`) === 'on')
      .map(day => day.value)

    if (days.length === 0) {
      alert('Select at least one day')
      return
    }

    try {
      await bulkCreateSlots({
        practitioner_id: practitionerId,
        days,
        start_time: formData.get('start_time') as string,
        end_time: formData.get('end_time') as string,
        is_available: formData.get('is_available') === 'on',
        notes: formData.get('notes') as string
      })
      setShowBulkForm(false)
      await fetchMyAvailability() // ✅ Refresh the list
    } catch (error) {
      console.error('Error creating bulk slots:', error)
      alert('Failed to create bulk slots')
    }
  }

  const resetForm = () => {
    setFormData({
      recurrence_type: 'weekly',
      day_of_week: 0,
      specific_date: '',
      start_time: '09:00',
      end_time: '17:00',
      is_available: true,
      notes: ''
    })
    setEditingSlot(null)
    setShowForm(false)
  }

  const editSlot = (slot: Availability) => {
    setEditingSlot(slot)
    setFormData({
      recurrence_type: slot.recurrence_type,
      day_of_week: slot.day_of_week ?? 0,
      specific_date: slot.specific_date || '',
      start_time: slot.start_time.slice(0, 5),
      end_time: slot.end_time.slice(0, 5),
      is_available: slot.is_available,
      notes: slot.notes || ''
    })
    setShowForm(true)
  }

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this availability slot?')) {
      try {
        await deleteSlot(id)
        await fetchMyAvailability() // ✅ Refresh the list
      } catch (error) {
        console.error('Error deleting slot:', error)
        alert('Failed to delete slot')
      }
    }
  }

  const handleDayChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = parseInt(e.target.value) as DayOfWeek
    setFormData({...formData, day_of_week: value})
  }

  const handleRecurrenceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFormData({...formData, recurrence_type: e.target.value as RecurrenceType})
  }

  const isWeekly = formData.recurrence_type === 'weekly'
  const requiresDate = formData.recurrence_type === 'one_time' || formData.recurrence_type === 'unavailable'

  if (loadingPractitioner) {
    return (
      <Card>
        <CardBody className="p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-gray-500">Loading practitioner profile...</p>
        </CardBody>
      </Card>
    )
  }

  if (!practitionerId) {
    return (
      <Card>
        <CardBody className="p-8 text-center">
          <p className="text-amber-600 mb-4">No practitioner profile found.</p>
          <p className="text-gray-500 text-sm">
            If you are a practitioner, please ensure your profile is complete and verified.
          </p>
        </CardBody>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Manage Availability</h2>
            <div className="flex gap-2">
              <Button size="sm" onClick={() => setShowBulkForm(!showBulkForm)}>
                <PlusIcon className="h-4 w-4 mr-2" />
                Bulk Add
              </Button>
              <Button size="sm" onClick={() => setShowForm(!showForm)}>
                <PlusIcon className="h-4 w-4 mr-2" />
                Add Slot
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardBody>
          {/* Bulk Add Form */}
          <AnimatePresence>
            {showBulkForm && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg"
              >
                <h3 className="font-medium mb-4">Add Weekly Schedule</h3>
                <form onSubmit={handleBulkSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Select Days</label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {DAYS_OF_WEEK.map((day, index) => (
                        <label key={day.value} className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            name={`day_${index}`}
                            className="rounded border-gray-300 dark:border-gray-600"
                          />
                          <span className="text-sm dark:text-gray-300">{day.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1 dark:text-gray-300">Start Time</label>
                      <input
                        type="time"
                        name="start_time"
                        defaultValue="09:00"
                        className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1 dark:text-gray-300">End Time</label>
                      <input
                        type="time"
                        name="end_time"
                        defaultValue="17:00"
                        className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        name="is_available"
                        defaultChecked
                        className="rounded border-gray-300 dark:border-gray-600"
                      />
                      <span className="text-sm dark:text-gray-300">Available (uncheck for unavailable blocks)</span>
                    </label>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1 dark:text-gray-300">Notes (Optional)</label>
                    <input
                      type="text"
                      name="notes"
                      placeholder="e.g., Lunch break, Vacation"
                      className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                    />
                  </div>

                  <div className="flex justify-end gap-2">
                    <Button type="button" variant="outline" onClick={() => setShowBulkForm(false)}>
                      Cancel
                    </Button>
                    <Button type="submit">Create Slots</Button>
                  </div>
                </form>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Single Add/Edit Form */}
          <AnimatePresence>
            {showForm && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg"
              >
                <h3 className="font-medium mb-4 dark:text-white">
                  {editingSlot ? 'Edit Slot' : 'Add New Slot'}
                </h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1 dark:text-gray-300">Type</label>
                    <select
                      value={formData.recurrence_type}
                      onChange={handleRecurrenceChange}
                      className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                    >
                      {RECURRENCE_TYPES.map(type => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {isWeekly && (
                    <div>
                      <label className="block text-sm font-medium mb-1 dark:text-gray-300">Day of Week</label>
                      <select
                        value={formData.day_of_week ?? 0}
                        onChange={handleDayChange}
                        className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                      >
                        {DAYS_OF_WEEK.map(day => (
                          <option key={day.value} value={day.value}>
                            {day.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {requiresDate && (
                    <div>
                      <label className="block text-sm font-medium mb-1 dark:text-gray-300">
                        {formData.recurrence_type === 'unavailable' ? 'Unavailable Date' : 'Date'}
                      </label>
                      <input
                        type="date"
                        value={formData.specific_date}
                        onChange={(e) => setFormData({...formData, specific_date: e.target.value})}
                        min={new Date().toISOString().split('T')[0]}
                        className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                        required
                      />
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1 dark:text-gray-300">Start Time</label>
                      <input
                        type="time"
                        value={formData.start_time}
                        onChange={(e) => setFormData({...formData, start_time: e.target.value})}
                        className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1 dark:text-gray-300">End Time</label>
                      <input
                        type="time"
                        value={formData.end_time}
                        onChange={(e) => setFormData({...formData, end_time: e.target.value})}
                        className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={formData.is_available}
                        onChange={(e) => setFormData({...formData, is_available: e.target.checked})}
                        className="rounded border-gray-300 dark:border-gray-600"
                      />
                      <span className="text-sm dark:text-gray-300">Available</span>
                    </label>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1 dark:text-gray-300">Notes (Optional)</label>
                    <input
                      type="text"
                      value={formData.notes}
                      onChange={(e) => setFormData({...formData, notes: e.target.value})}
                      placeholder="e.g., Lunch break, Vacation"
                      className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                    />
                  </div>

                  <div className="flex justify-end gap-2">
                    <Button type="button" variant="outline" onClick={resetForm}>
                      Cancel
                    </Button>
                    <Button type="submit">
                      {editingSlot ? 'Update' : 'Create'}
                    </Button>
                  </div>
                </form>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Availability List */}
          {availabilityLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto"></div>
            </div>
          ) : availability.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              No availability slots set. Add your first slot above.
            </div>
          ) : (
            <div className="space-y-2">
              {availability.map((slot) => (
                <motion.div
                  key={slot.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`p-3 rounded-lg border ${
                    slot.is_available 
                      ? 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800' 
                      : 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`px-2 py-0.5 text-xs rounded-full ${
                          slot.is_available 
                            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' 
                            : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
                        }`}>
                          {slot.is_available ? 'Available' : 'Unavailable'}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {slot.recurrence_type === 'weekly' ? 'Weekly' : 
                           slot.recurrence_type === 'one_time' ? 'One-time' : 'Unavailable'}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm">
                        {slot.recurrence_type === 'weekly' ? (
                          <span className="flex items-center text-gray-700 dark:text-gray-300">
                            <CalendarIcon className="h-4 w-4 mr-1 text-gray-500" />
                            {DAYS_OF_WEEK.find(d => d.value === slot.day_of_week)?.label || 'Unknown'}
                          </span>
                        ) : (
                          <span className="flex items-center text-gray-700 dark:text-gray-300">
                            <CalendarIcon className="h-4 w-4 mr-1 text-gray-500" />
                            {slot.specific_date}
                          </span>
                        )}
                        <span className="flex items-center text-gray-700 dark:text-gray-300">
                          <ClockIcon className="h-4 w-4 mr-1 text-gray-500" />
                          {slot.start_time.slice(0,5)} - {slot.end_time.slice(0,5)}
                        </span>
                      </div>
                      
                      {slot.notes && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{slot.notes}</p>
                      )}
                    </div>
                    
                    <div className="flex gap-1">
                      <button
                        onClick={() => editSlot(slot)}
                        className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
                        aria-label="Edit slot"
                      >
                        <PencilIcon className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                      </button>
                      <button
                        onClick={() => handleDelete(slot.id)}
                        className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors text-red-600 dark:text-red-400"
                        aria-label="Delete slot"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  )
}