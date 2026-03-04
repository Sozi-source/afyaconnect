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
  ChevronRightIcon,
  SparklesIcon,
  ArrowPathIcon,
  XMarkIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  Squares2X2Icon,
  ListBulletIcon,
  ChevronDownIcon,
  ChevronUpIcon
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
  const [expandedDays, setExpandedDays] = useState<Record<string, boolean>>({})

  // Fetch the correct practitioner ID
  useEffect(() => {
    const fetchPractitionerId = async () => {
      setIsLoadingPractitioner(true)
      
      try {
        if (initialPractitionerId) {
          setPractitionerId(initialPractitionerId)
          return
        }

        if (user?.practitioner?.id) {
          setPractitionerId(user.practitioner.id)
          return
        }

        const response = await api.get('/practitioners/me/')
        const fetchedId = response.data?.id || response.data?.user?.id
        setPractitionerId(fetchedId || 3)
      } catch (error) {
        console.error('Failed to fetch practitioner ID:', error)
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

    // Initialize all days as collapsed
    const initialExpanded: Record<string, boolean> = {}
    DAYS_OF_WEEK.forEach(day => {
      initialExpanded[day] = false
    })
    setExpandedDays(initialExpanded)
  }, [availability])

  const toggleDay = (day: string) => {
    setExpandedDays(prev => ({
      ...prev,
      [day]: !prev[day]
    }))
  }

  const handleDeleteSlot = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this availability slot?')) {
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

  const getDaySummary = (slots: Availability[]) => {
    const availableCount = slots.filter(s => s.is_available).length
    const totalCount = slots.length
    return `${availableCount}/${totalCount} slots available`
  }

  if (isLoadingPractitioner || loading) {
    return (
      <div className="flex justify-center py-8 sm:py-12 md:py-16">
        <div className="relative">
          <div className="w-10 h-10 sm:w-12 sm:h-12 border-4 border-emerald-100 border-t-emerald-600 rounded-full animate-spin shadow-lg"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <ClockIcon className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600 animate-pulse" />
          </div>
        </div>
      </div>
    )
  }

  if (!practitionerId) {
    return (
      <Card className="border-0 shadow-xl overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-red-500/5"></div>
        <CardBody className="p-6 sm:p-8 md:p-12 text-center relative">
          <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-gradient-to-br from-amber-100 to-red-100 rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto mb-3 sm:mb-4 shadow-lg transform rotate-3">
            <ExclamationCircleIcon className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-amber-600" />
          </div>
          <h3 className="text-base sm:text-lg font-semibold text-slate-900 mb-2">Profile Not Found</h3>
          <p className="text-xs sm:text-sm text-slate-600 max-w-xs mx-auto">
            Unable to identify practitioner profile. Please contact support.
          </p>
        </CardBody>
      </Card>
    )
  }

  return (
    <div className="space-y-4 sm:space-y-6 md:space-y-8">
      {/* Header with Actions - Mobile Optimized */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-emerald-600/20 to-blue-600/20 rounded-lg blur opacity-75"></div>
              <h2 className="relative text-base sm:text-lg md:text-xl font-bold text-slate-900 bg-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg">
                Your Availability
              </h2>
            </div>
            <div className="flex bg-slate-100 rounded-lg p-0.5 sm:p-1 shadow-inner">
              <button
                onClick={() => setView('list')}
                className={`p-1.5 sm:p-2 rounded-md transition-all ${
                  view === 'list' 
                    ? 'bg-white text-emerald-700 shadow-sm' 
                    : 'text-slate-500 hover:text-slate-700'
                }`}
                aria-label="List view"
              >
                <ListBulletIcon className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
              <button
                onClick={() => setView('calendar')}
                className={`p-1.5 sm:p-2 rounded-md transition-all ${
                  view === 'calendar' 
                    ? 'bg-white text-emerald-700 shadow-sm' 
                    : 'text-slate-500 hover:text-slate-700'
                }`}
                aria-label="Calendar view"
              >
                <Squares2X2Icon className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>
          </div>
        </div>
        
        {/* Action Buttons */}
        <div className="flex flex-col xs:flex-row gap-2">
          <Button
            onClick={() => {
              setShowAddForm(true)
              setShowBulkForm(false)
              setEditingSlot(null)
            }}
            className="flex-1 inline-flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5 text-xs sm:text-sm py-2 sm:py-2.5"
          >
            <PlusIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span className="hidden xs:inline">Add Single</span>
            <span className="xs:hidden">Single</span>
          </Button>
          <Button
            onClick={() => {
              setShowBulkForm(true)
              setShowAddForm(false)
              setEditingSlot(null)
            }}
            variant="outline"
            className="flex-1 inline-flex items-center justify-center gap-2 border-2 hover:border-emerald-300 hover:bg-emerald-50/50 shadow-md hover:shadow-lg transition-all text-xs sm:text-sm py-2 sm:py-2.5"
          >
            <SparklesIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span className="hidden xs:inline">Bulk Schedule</span>
            <span className="xs:hidden">Bulk</span>
          </Button>
        </div>
      </div>

      {/* Add/Edit Forms */}
      <AnimatePresence>
        {showAddForm && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="relative"
          >
            <div className="absolute -inset-1 bg-gradient-to-r from-emerald-600/20 to-blue-600/20 rounded-xl sm:rounded-2xl blur-xl"></div>
            <div className="relative bg-white rounded-lg sm:rounded-xl shadow-2xl border border-slate-200/80 overflow-hidden">
              <div className="px-3 sm:px-4 py-2.5 sm:py-4 bg-gradient-to-r from-emerald-50 to-blue-50 border-b border-slate-200/80">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs sm:text-sm font-semibold text-slate-900">
                    {editingSlot ? 'Edit Slot' : 'Add New Slot'}
                  </h3>
                  <button
                    onClick={handleCancel}
                    className="p-1 hover:bg-white/50 rounded-lg transition-colors"
                    aria-label="Close"
                  >
                    <XMarkIcon className="w-4 h-4 sm:w-5 sm:h-5 text-slate-500" />
                  </button>
                </div>
              </div>
              <div className="p-3 sm:p-4">
                <SingleSlotForm
                  practitionerId={practitionerId}
                  onSuccess={handleSuccess}
                  onCancel={handleCancel}
                  initialData={editingSlot}
                />
              </div>
            </div>
          </motion.div>
        )}

        {showBulkForm && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="relative"
          >
            <div className="absolute -inset-1 bg-gradient-to-r from-emerald-600/20 to-blue-600/20 rounded-xl sm:rounded-2xl blur-xl"></div>
            <div className="relative bg-white rounded-lg sm:rounded-xl shadow-2xl border border-slate-200/80 overflow-hidden">
              <div className="px-3 sm:px-4 py-2.5 sm:py-4 bg-gradient-to-r from-emerald-50 to-blue-50 border-b border-slate-200/80">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs sm:text-sm font-semibold text-slate-900">Bulk Add Availability</h3>
                  <button
                    onClick={handleCancel}
                    className="p-1 hover:bg-white/50 rounded-lg transition-colors"
                    aria-label="Close"
                  >
                    <XMarkIcon className="w-4 h-4 sm:w-5 sm:h-5 text-slate-500" />
                  </button>
                </div>
              </div>
              <div className="p-3 sm:p-4">
                <BulkAvailabilityForm
                  practitionerId={practitionerId}
                  onSuccess={handleSuccess}
                  onCancel={handleCancel}
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error Display */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative"
        >
          <div className="absolute -inset-1 bg-gradient-to-r from-red-600/20 to-amber-600/20 rounded-lg sm:rounded-xl blur"></div>
          <div className="relative p-3 sm:p-4 bg-gradient-to-r from-red-50 to-amber-50 border border-red-200/80 rounded-lg sm:rounded-xl shadow-md">
            <div className="flex items-start gap-2 sm:gap-3">
              <div className="p-1.5 bg-red-100 rounded-lg flex-shrink-0">
                <ExclamationCircleIcon className="w-4 h-4 sm:w-5 sm:h-5 text-red-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs sm:text-sm font-medium text-red-800">Error</p>
                <p className="text-[10px] sm:text-xs text-red-600 mt-0.5 break-words">{error}</p>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Availability Display */}
      {view === 'list' ? (
        <div className="space-y-4 sm:space-y-6">
          {/* Main Card with Collapsible Days */}
          <Card className="border-0 shadow-lg sm:shadow-xl overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-blue-500/5"></div>
            <CardBody className="p-4 sm:p-5 md:p-6 relative">
              {/* Header */}
              <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-5">
                <div className="p-1.5 sm:p-2 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg sm:rounded-xl shadow-lg">
                  <ClockIcon className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base md:text-lg font-semibold text-slate-900">Weekly Schedule</h3>
                  <p className="text-xs sm:text-sm text-slate-500">Tap on any day to view and manage slots</p>
                </div>
              </div>
              
              {/* Collapsible Days List */}
              <div className="space-y-2 sm:space-y-3">
                {DAYS_OF_WEEK.map(day => {
                  const slots = groupedByDay[day] || []
                  const hasSlots = slots.length > 0
                  const isExpanded = expandedDays[day]
                  
                  return (
                    <div
                      key={day}
                      className="border border-slate-200 rounded-lg sm:rounded-xl overflow-hidden bg-white shadow-sm"
                    >
                      {/* Day Header - Click to expand/collapse */}
                      <button
                        onClick={() => toggleDay(day)}
                        className="w-full px-3 sm:px-4 py-2.5 sm:py-3 flex items-center justify-between hover:bg-slate-50 transition-colors"
                      >
                        <div className="flex items-center gap-2 sm:gap-3">
                          <div className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full ${hasSlots ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                          <span className="text-xs sm:text-sm font-medium text-slate-900">{day}</span>
                          {hasSlots && (
                            <span className="text-[10px] sm:text-xs text-emerald-600 bg-emerald-50 px-1.5 sm:px-2 py-0.5 rounded-full">
                              {getDaySummary(slots)}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          {!hasSlots && (
                            <span className="text-[10px] sm:text-xs text-slate-400">No slots</span>
                          )}
                          {isExpanded ? (
                            <ChevronUpIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-400" />
                          ) : (
                            <ChevronDownIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-400" />
                          )}
                        </div>
                      </button>

                      {/* Expanded Content - Slots List */}
                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden"
                          >
                            <div className="px-3 sm:px-4 pb-3 sm:pb-4 pt-1 border-t border-slate-100">
                              {slots.length > 0 ? (
                                <div className="space-y-2">
                                  {slots.map(slot => (
                                    <motion.div
                                      key={slot.id}
                                      initial={{ opacity: 0, x: -10 }}
                                      animate={{ opacity: 1, x: 0 }}
                                      className="flex items-center justify-between p-2 sm:p-2.5 bg-slate-50 rounded-lg hover:bg-white hover:shadow-sm border border-transparent hover:border-emerald-100 transition-all group/slot"
                                    >
                                      <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                                        <div className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full flex-shrink-0 ${
                                          slot.is_available ? 'bg-emerald-500' : 'bg-amber-500'
                                        }`} />
                                        <div className="min-w-0 flex-1">
                                          <div className="flex items-center gap-1 sm:gap-2 flex-wrap">
                                            <span className="text-xs sm:text-sm font-medium text-slate-700 whitespace-nowrap">
                                              {formatTime(slot.start_time)} - {formatTime(slot.end_time)}
                                            </span>
                                            {!slot.is_available && (
                                              <span className="text-[8px] sm:text-[10px] px-1.5 py-0.5 bg-amber-100 text-amber-700 rounded-full whitespace-nowrap">
                                                Unavailable
                                              </span>
                                            )}
                                          </div>
                                          {slot.notes && (
                                            <p className="text-[10px] sm:text-xs text-slate-500 mt-0.5 truncate max-w-[150px] sm:max-w-[200px]">
                                              {slot.notes}
                                            </p>
                                          )}
                                        </div>
                                      </div>
                                      <div className="flex gap-0.5 sm:gap-1 opacity-0 group-hover/slot:opacity-100 transition ml-2">
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation()
                                            handleEditSlot(slot)
                                          }}
                                          className="p-1 sm:p-1.5 hover:bg-white rounded-lg text-blue-600 hover:text-blue-700 hover:shadow-sm transition-all"
                                          title="Edit slot"
                                        >
                                          <PencilIcon className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                                        </button>
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation()
                                            handleDeleteSlot(slot.id)
                                          }}
                                          className="p-1 sm:p-1.5 hover:bg-white rounded-lg text-red-600 hover:text-red-700 hover:shadow-sm transition-all"
                                          title="Delete slot"
                                        >
                                          <TrashIcon className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                                        </button>
                                      </div>
                                    </motion.div>
                                  ))}
                                </div>
                              ) : (
                                <div className="text-center py-4 sm:py-5">
                                  <p className="text-xs sm:text-sm text-slate-400">No slots set for {day}</p>
                                  <button
                                    onClick={() => {
                                      setShowAddForm(true)
                                      setEditingSlot(null)
                                    }}
                                    className="mt-2 text-[10px] sm:text-xs text-emerald-600 hover:text-emerald-700 font-medium inline-flex items-center gap-1"
                                  >
                                    <PlusIcon className="w-3 h-3" />
                                    Add first slot
                                  </button>
                                </div>
                              )}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  )
                })}
              </div>
            </CardBody>
          </Card>

          {/* One-time and Unavailable Slots */}
          {oneTimeSlots.length > 0 && (
            <Card className="border-0 shadow-lg sm:shadow-xl overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-indigo-500/5"></div>
              <CardBody className="p-4 sm:p-5 md:p-6 relative">
                <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                  <div className="p-1.5 sm:p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg sm:rounded-xl shadow-lg">
                    <CalendarIcon className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-sm sm:text-base md:text-lg font-semibold text-slate-900">Special Dates</h3>
                    <p className="text-xs sm:text-sm text-slate-500">One-time and unavailable slots</p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  {oneTimeSlots.map(slot => (
                    <motion.div
                      key={slot.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="group relative bg-white border border-slate-200 rounded-lg sm:rounded-xl p-3 sm:p-4 shadow-sm hover:shadow-md transition-all"
                    >
                      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-indigo-500/5 rounded-lg sm:rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                      <div className="relative flex flex-col xs:flex-row xs:items-start gap-2 xs:gap-3">
                        <div className={`p-1.5 sm:p-2 rounded-lg w-fit ${
                          slot.recurrence_type === 'unavailable' 
                            ? 'bg-red-100' 
                            : 'bg-emerald-100'
                        }`}>
                          {slot.recurrence_type === 'unavailable' ? (
                            <ExclamationCircleIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-red-600" />
                          ) : (
                            <CheckCircleIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-600" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs sm:text-sm font-medium text-slate-900">
                            {slot.specific_date ? new Date(slot.specific_date).toLocaleDateString('en-US', {
                              weekday: 'short',
                              month: 'short',
                              day: 'numeric'
                            }) : 'Date TBD'}
                          </p>
                          <div className="flex flex-wrap items-center gap-2 mt-1">
                            <p className="text-[10px] sm:text-xs text-slate-600">
                              {formatTime(slot.start_time)} - {formatTime(slot.end_time)}
                            </p>
                            {!slot.is_available && (
                              <span className="text-[8px] sm:text-[10px] px-1.5 py-0.5 bg-amber-100 text-amber-700 rounded-full">
                                Unavailable
                              </span>
                            )}
                          </div>
                          {slot.notes && (
                            <p className="text-[10px] sm:text-xs text-slate-500 mt-2">{slot.notes}</p>
                          )}
                        </div>
                        <div className="flex gap-1 self-end xs:self-center mt-2 xs:mt-0">
                          <button
                            onClick={() => handleEditSlot(slot)}
                            className="p-1.5 sm:p-2 hover:bg-white rounded-lg text-blue-600 hover:text-blue-700 hover:shadow-sm transition-all"
                            title="Edit slot"
                          >
                            <PencilIcon className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteSlot(slot.id)}
                            className="p-1.5 sm:p-2 hover:bg-white rounded-lg text-red-600 hover:text-red-700 hover:shadow-sm transition-all"
                            title="Delete slot"
                          >
                            <TrashIcon className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardBody>
            </Card>
          )}
        </div>
      ) : (
        // Calendar View - Mobile Optimized
        <Card className="border-0 shadow-lg sm:shadow-xl overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-blue-500/5"></div>
          <CardBody className="p-4 sm:p-5 md:p-6 relative">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 mb-4 sm:mb-5">
              <h3 className="text-sm sm:text-base font-semibold text-slate-900 flex items-center gap-2">
                <CalendarIcon className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600" />
                Calendar View
              </h3>
              <div className="flex items-center gap-2 self-end sm:self-auto">
                <button
                  onClick={() => setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() - 1))}
                  className="p-1.5 sm:p-2 hover:bg-slate-100 rounded-lg transition-colors"
                  aria-label="Previous month"
                >
                  <ChevronLeftIcon className="w-4 h-4 sm:w-5 sm:h-5 text-slate-600" />
                </button>
                <span className="px-2 sm:px-3 py-1 sm:py-1.5 bg-slate-100 rounded-lg text-xs sm:text-sm font-medium whitespace-nowrap">
                  {selectedDate.toLocaleString('default', { month: 'short', year: 'numeric' })}
                </span>
                <button
                  onClick={() => setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1))}
                  className="p-1.5 sm:p-2 hover:bg-slate-100 rounded-lg transition-colors"
                  aria-label="Next month"
                >
                  <ChevronRightIcon className="w-4 h-4 sm:w-5 sm:h-5 text-slate-600" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-7 gap-1 sm:gap-2">
              {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(day => (
                <div key={day} className="text-center text-[10px] sm:text-xs font-medium text-slate-500 py-1 sm:py-2">
                  {day}
                </div>
              ))}

              <div className="col-span-7 text-center py-8 sm:py-12">
                <div className="inline-block p-3 sm:p-4 bg-slate-50 rounded-xl">
                  <CalendarIcon className="w-8 h-8 sm:w-10 sm:h-10 text-slate-300 mx-auto mb-2" />
                  <p className="text-xs sm:text-sm text-slate-500">
                    Calendar coming soon
                  </p>
                </div>
              </div>
            </div>
          </CardBody>
        </Card>
      )}

      {/* Empty State */}
      {availability.length === 0 && !showAddForm && !showBulkForm && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="border-0 shadow-2xl overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-blue-500/10"></div>
            <CardBody className="p-8 sm:p-12 md:p-16 text-center relative">
              <div className="relative inline-block mb-4 sm:mb-6">
                <div className="absolute -inset-4 bg-gradient-to-r from-emerald-600/20 to-blue-600/20 rounded-full blur-2xl"></div>
                <div className="relative w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-2xl transform rotate-3 hover:rotate-0 transition-transform">
                  <CalendarIcon className="w-7 h-7 sm:w-8 sm:h-8 md:w-10 md:h-10 text-white" />
                </div>
              </div>
              <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-slate-900 mb-2 sm:mb-3">No Availability Set</h3>
              <p className="text-xs sm:text-sm text-slate-600 mb-6 sm:mb-8 max-w-xs mx-auto">
                Add your first availability slot to start accepting bookings.
              </p>
              <div className="flex flex-col xs:flex-row justify-center gap-3">
                <Button 
                  onClick={() => setShowAddForm(true)}
                  className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5 text-xs sm:text-sm py-2 sm:py-2.5"
                >
                  <PlusIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-2" />
                  Add Single Slot
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setShowBulkForm(true)}
                  className="border-2 hover:border-emerald-300 hover:bg-emerald-50/50 shadow-md hover:shadow-lg transition-all text-xs sm:text-sm py-2 sm:py-2.5"
                >
                  <SparklesIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-2" />
                  Bulk Schedule
                </Button>
              </div>
            </CardBody>
          </Card>
        </motion.div>
      )}
    </div>
  )
}