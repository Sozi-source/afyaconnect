// app/practitioner/dashboard/availability/page.tsx
'use client'

import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { PlusIcon } from '@heroicons/react/24/outline'
import { Card, CardBody } from '@/app/components/ui/Card'
import { Button } from '@/app/components/ui/Buttons'
import { AvailabilityCalendar } from '@/app/components/practitioners/availability/AvailabilityCalendar'
import { BulkAvailabilityForm } from '@/app/components/practitioners/availability/BulkAvailabilityForm'
import { useAvailability } from '@/app/hooks/useAvailability'
import { useAuth } from '@/app/contexts/AuthContext'
import type { Availability, CreateAvailabilityData } from '@/app/types'

// Wrapper component to handle type conversion
function AvailabilityCalendarWrapper({ 
  availability, 
  loading, 
  onEdit, 
  onAdd 
}: { 
  availability: Availability[]
  loading: boolean
  onEdit: (id: number, data: Partial<CreateAvailabilityData>) => Promise<Availability | null>
  onAdd?: () => void
}) {
  // Adapt the onEdit function to match what AvailabilityCalendar expects
  const handleEditAdapter = useCallback(async (id: number, data: Partial<Availability>): Promise<Availability> => {
    // Convert Partial<Availability> to Partial<CreateAvailabilityData>
    const convertedData: Partial<CreateAvailabilityData> = {
      recurrence_type: data.recurrence_type,
      day_of_week: data.day_of_week !== null && data.day_of_week !== undefined ? data.day_of_week : undefined,
      specific_date: data.specific_date || undefined,
      start_time: data.start_time,
      end_time: data.end_time,
      is_available: data.is_available,
      notes: data.notes || undefined
    }
    
    const result = await onEdit(id, convertedData)
    
    // Ensure we always return an Availability object
    if (!result) {
      // If no result, we need to find the updated slot from the availability list
      // This assumes the update was successful and we need to return the updated slot
      const updatedSlot = availability.find(slot => slot.id === id)
      if (!updatedSlot) {
        throw new Error('Failed to update slot')
      }
      return updatedSlot
    }
    
    return result
  }, [onEdit, availability])

  return (
    <AvailabilityCalendar
      availability={availability}
      loading={loading}
      onEdit={handleEditAdapter}
      onAdd={onAdd}
    />
  )
}

export default function AvailabilityPage() {
  const { user } = useAuth()
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingSlot, setEditingSlot] = useState<Availability | null>(null)
  
  // Safely get practitioner ID
  const practitionerId = user?.practitioner?.id

  const { 
    availability, 
    loading, 
    error, 
    fetchAvailability, 
    updateSlot,
    bulkCreateSlots
  } = useAvailability(practitionerId)

  const handleEdit = async (id: number, data: Partial<CreateAvailabilityData>): Promise<Availability | null> => {
    try {
      const updated = await updateSlot(id, data)
      if (updated) {
        setEditingSlot(null)
      }
      return updated
    } catch (error) {
      console.error('Failed to update slot:', error)
      return null
    }
  }

  const handleBulkSuccess = () => {
    setShowAddForm(false)
    fetchAvailability()
  }

  // Don't render if not a practitioner
  if (!practitionerId) {
    return (
      <Card>
        <CardBody className="p-8 text-center">
          <p className="text-gray-600 dark:text-gray-400">
            Please ensure you are logged in as a practitioner to manage availability.
          </p>
        </CardBody>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Availability</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Manage your weekly schedule and time slots
          </p>
        </div>
        
        <Button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-2"
        >
          <PlusIcon className="h-5 w-5" />
          {showAddForm ? 'Cancel' : 'Add Availability'}
        </Button>
      </div>

      {/* Add Form */}
      <AnimatePresence>
        {showAddForm && (
          <BulkAvailabilityForm
            practitionerId={practitionerId}
            onSuccess={handleBulkSuccess}
            onCancel={() => setShowAddForm(false)}
          />
        )}
      </AnimatePresence>

      {/* Error Message */}
      {error && (
        <Card className="bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800">
          <CardBody className="p-4">
            <p className="text-red-700 dark:text-red-300 text-sm">{error}</p>
          </CardBody>
        </Card>
      )}

      {/* Calendar - using the wrapper */}
      <AvailabilityCalendarWrapper
        availability={availability}
        loading={loading}
        onEdit={handleEdit}
        onAdd={() => setShowAddForm(true)}
      />

      {/* Info Card */}
      <Card>
        <CardBody className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
          <h3 className="font-medium text-blue-800 dark:text-blue-300 mb-2">About Availability</h3>
          <ul className="text-sm text-blue-700 dark:text-blue-400 space-y-1 list-disc list-inside">
            <li>Weekly slots repeat every week on the selected days</li>
            <li>One-time slots are for specific dates only</li>
            <li>Mark slots as unavailable for breaks or time off</li>
            <li>Clients can only book during available time slots</li>
          </ul>
        </CardBody>
      </Card>
    </div>
  )
}