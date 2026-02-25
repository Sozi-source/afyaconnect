'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/app/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  CalendarIcon,
  ClockIcon,
  InformationCircleIcon,
  PlusIcon,
  ChartBarIcon,
} from '@heroicons/react/24/outline'
import { Card, CardBody } from '@/app/components/ui/Card'
import { Button } from '@/app/components/ui/Buttons'
import { useAvailability } from '@/app/hooks/useAvailability'
import { AvailabilityCalendar } from '@/app/components/practitioners/availability/AvailabilityCalendar'
import { BulkAvailabilityForm } from '@/app/components/practitioners/availability/BulkAvailabilityForm'
import { SingleSlotForm } from '@/app/components/practitioners/SingleSlotForm'
import { AvailabilityList } from '@/app/components/practitioners/availability/AvailabilityList'
import { apiClient } from '@/app/lib/api'
import { Availability, CreateAvailabilityData } from '@/app/types/index'

interface PractitionerStats {
  totalWeeklySlots: number
  totalHoursPerWeek: number
  unavailableBlocks: number
  upcomingBookings: number
}

// Define color type for type safety
type ColorVariant = 'emerald' | 'blue' | 'amber' | 'purple'

interface StatCardProps {
  title: string
  value: string
  icon: React.ElementType
  color: ColorVariant
}

export default function PractitionerAvailabilityPage() {
  const { user, isAuthenticated, isLoading } = useAuth()
  const router = useRouter()
  const [practitionerId, setPractitionerId] = useState<number | null>(null)
  const [showBulkForm, setShowBulkForm] = useState(false)
  const [showSingleForm, setShowSingleForm] = useState(false)
  const [stats, setStats] = useState<PractitionerStats>({
    totalWeeklySlots: 0,
    totalHoursPerWeek: 0,
    unavailableBlocks: 0,
    upcomingBookings: 0
  })
  const [selectedView, setSelectedView] = useState<'list' | 'calendar'>('list')

  const {
    availability,
    loading,
    fetchAvailability,
    bulkCreateSlots,
    createSlot,
    updateSlot,
    deleteSlot
  } = useAvailability(practitionerId || undefined)

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login')
      return
    }
    
    if (!isLoading && user?.role !== 'practitioner') {
      router.push('/client/dashboard')
      return
    }

    // Fetch practitioner ID
    const fetchPractitionerId = async () => {
      try {
        const practitioner = await apiClient.practitioners.getMyProfile()
        setPractitionerId(practitioner.id)
      } catch (error) {
        console.error('No practitioner profile found')
      }
    }

    if (user?.role === 'practitioner') {
      fetchPractitionerId()
    }
  }, [isLoading, isAuthenticated, user, router])

  useEffect(() => {
    if (practitionerId) {
      fetchAvailability()
    }
  }, [practitionerId, fetchAvailability])

  // Calculate stats whenever availability changes
  useEffect(() => {
    if (availability.length > 0) {
      const weeklySlots = availability.filter(s => 
        s.recurrence_type === 'weekly' && s.is_available
      )
      const unavailableBlocks = availability.filter(s => 
        s.recurrence_type === 'unavailable'
      )
      
      const totalHours = weeklySlots.reduce((acc, slot) => {
        const start = new Date(`1970-01-01T${slot.start_time}`)
        const end = new Date(`1970-01-01T${slot.end_time}`)
        const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60)
        return acc + hours
      }, 0)

      setStats({
        totalWeeklySlots: weeklySlots.length,
        totalHoursPerWeek: Math.round(totalHours * 10) / 10,
        unavailableBlocks: unavailableBlocks.length,
        upcomingBookings: 0 // This would come from consultations API
      })
    }
  }, [availability])

  // Type-safe update handler that returns Promise<Availability>
  const handleUpdateSlot = useCallback(async (id: number, data: Partial<Availability>) => {
    // Only include properties that exist on Availability and are needed for update
    const updateData: Partial<CreateAvailabilityData> = {
      // Convert null to undefined for day_of_week
      ...(data.day_of_week !== undefined && { 
        day_of_week: data.day_of_week ?? undefined 
      }),
      ...(data.start_time && { start_time: data.start_time }),
      ...(data.end_time && { end_time: data.end_time }),
      ...(data.is_available !== undefined && { is_available: data.is_available }),
      ...(data.recurrence_type && { recurrence_type: data.recurrence_type }),
      // recurrence_end_date is intentionally omitted as it doesn't exist on Availability
    };
    
    // Remove any undefined values
    const cleanedData = Object.fromEntries(
      Object.entries(updateData).filter(([_, value]) => value !== undefined)
    );
    
    // Return the result from updateSlot (which returns Promise<Availability>)
    return await updateSlot(id, cleanedData);
  }, [updateSlot]);

  // Type-safe delete handler
  const handleDeleteSlot = useCallback(async (id: number) => {
    if (window.confirm('Are you sure you want to delete this availability slot?')) {
      await deleteSlot(id);
    }
  }, [deleteSlot]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-emerald-200 border-t-emerald-600"></div>
      </div>
    )
  }

  if (!isAuthenticated || user?.role !== 'practitioner') {
    return null
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Manage Availability
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Set your schedule and manage booking availability
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => {
              setShowBulkForm(true)
              setShowSingleForm(false)
            }}
            variant="primary"
            size="sm"
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            Bulk Add
          </Button>
          <Button
            onClick={() => {
              setShowSingleForm(true)
              setShowBulkForm(false)
            }}
            variant="outline"
            size="sm"
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            Add Slot
          </Button>
        </div>
      </div>

      {/* Info Banner */}
      <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
        <CardBody className="p-4">
          <div className="flex items-start gap-3">
            <InformationCircleIcon className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-medium text-blue-800 dark:text-blue-300 mb-1">
                Managing Your Availability
              </h3>
              <p className="text-sm text-blue-700 dark:text-blue-400">
                Use "Bulk Add" to set your regular weekly schedule. Use "Add Slot" for one-time 
                appointments or unavailable blocks. Clients can only book during available times.
              </p>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Weekly Slots"
          value={stats.totalWeeklySlots.toString()}
          icon={CalendarIcon}
          color="emerald"
        />
        <StatCard
          title="Hours/Week"
          value={stats.totalHoursPerWeek.toString()}
          icon={ClockIcon}
          color="blue"
        />
        <StatCard
          title="Unavailable Blocks"
          value={stats.unavailableBlocks.toString()}
          icon={InformationCircleIcon}
          color="amber"
        />
        <StatCard
          title="Upcoming Bookings"
          value={stats.upcomingBookings.toString()}
          icon={ChartBarIcon}
          color="purple"
        />
      </div>

      {/* Forms */}
      <AnimatePresence>
        {showBulkForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <BulkAvailabilityForm
              practitionerId={practitionerId!}
              onSuccess={() => {
                setShowBulkForm(false)
                fetchAvailability()
              }}
              onCancel={() => setShowBulkForm(false)}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showSingleForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <SingleSlotForm
              practitionerId={practitionerId!}
              onSuccess={() => {
                setShowSingleForm(false)
                fetchAvailability()
              }}
              onCancel={() => setShowSingleForm(false)}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* View Toggle */}
      <div className="flex justify-end">
        <div className="inline-flex rounded-lg border border-gray-200 dark:border-gray-700 p-1">
          <button
            onClick={() => setSelectedView('list')}
            className={`px-4 py-2 text-sm font-medium rounded-md transition ${
              selectedView === 'list'
                ? 'bg-emerald-600 text-white'
                : 'text-gray-600 hover:text-gray-900 dark:text-gray-400'
            }`}
          >
            List View
          </button>
          <button
            onClick={() => setSelectedView('calendar')}
            className={`px-4 py-2 text-sm font-medium rounded-md transition ${
              selectedView === 'calendar'
                ? 'bg-emerald-600 text-white'
                : 'text-gray-600 hover:text-gray-900 dark:text-gray-400'
            }`}
          >
            Calendar View
          </button>
        </div>
      </div>

      {/* Availability Display */}
      {selectedView === 'list' ? (
        <AvailabilityList
          availability={availability}
          loading={loading}
          onEdit={handleUpdateSlot}
          onDelete={handleDeleteSlot}
        />
      ) : (
        <AvailabilityCalendar
          availability={availability}
          loading={loading}
          onEdit={handleUpdateSlot}
        />
      )}
    </div>
  )
}

// Fixed StatCard component with proper typing
function StatCard({ title, value, icon: Icon, color }: StatCardProps) {
  // Define color classes with proper typing
  const colorClasses: Record<ColorVariant, string> = {
    emerald: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400',
    blue: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
    amber: 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400',
    purple: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400',
  }

  return (
    <Card>
      <CardBody className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">{title}</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{value}</p>
          </div>
          <div className={`p-3 rounded-xl ${colorClasses[color]}`}>
            <Icon className="h-5 w-5" />
          </div>
        </div>
      </CardBody>
    </Card>
  )
}