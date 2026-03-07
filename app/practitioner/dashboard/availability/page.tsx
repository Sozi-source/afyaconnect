'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/app/contexts/AuthContext'
import { Card, CardBody } from '@/app/components/ui/Card'
import { Button } from '@/app/components/ui/Buttons'
import { SetAvailability } from '@/app/components/practitioners/availability/SetAvailability'
import { ViewAvailability } from '@/app/components/practitioners/availability/ViewAvailability'
import type { Availability } from '@/app/types'
import { apiClient } from '@/app/lib/api'
import { 
  CalendarDaysIcon,
  UserCircleIcon,
  ShieldCheckIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon,
  ClockIcon,
  CheckCircleIcon,
  PlusCircleIcon,
  ListBulletIcon,
  SparklesIcon
} from '@heroicons/react/24/outline'
import Link from 'next/link'

export default function AvailabilityPage() {
  const { user, isLoading: authLoading } = useAuth()
  const [isMounted, setIsMounted] = useState(false)
  const [practitionerId, setPractitionerId] = useState<number | null>(null)
  const [availabilitySlots, setAvailabilitySlots] = useState<Availability[]>([])
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<'overview' | 'schedule'>('overview')

  useEffect(() => {
    setIsMounted(true)
  }, [])

  useEffect(() => {
    if (user?.practitioner?.id) {
      setPractitionerId(user.practitioner.id)
    }
  }, [user])

  const loadAvailability = async () => {
    if (!practitionerId) return
    
    setLoading(true)
    try {
      const response = await apiClient.availability.getMyAvailability()
      const slots = Array.isArray(response) ? response : []
      setAvailabilitySlots(slots)
    } catch (error) {
      console.error('Failed to load slots:', error)
      setAvailabilitySlots([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadAvailability()
  }, [practitionerId])

  const handleSlotsAdded = async (newSlots: Availability[]) => {
    if (!Array.isArray(newSlots)) return
    
    setAvailabilitySlots(prev => [...prev, ...newSlots])
    await loadAvailability()
  }

  const handleSlotDeleted = async (deletedId: number) => {
    await loadAvailability()
  }

  const handleRefresh = () => {
    loadAvailability()
  }

  if (authLoading || !isMounted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-blue-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin"></div>
            <CalendarDaysIcon className="w-8 h-8 text-emerald-600 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
          </div>
          <p className="mt-6 text-sm font-medium text-emerald-700 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-sm">
            Loading your schedule...
          </p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-blue-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md border-0 shadow-2xl rounded-2xl overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-600/10 to-blue-600/10"></div>
          <CardBody className="p-8 relative">
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg transform rotate-3 hover:rotate-0 transition-transform">
                <UserCircleIcon className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome Back</h2>
              <p className="text-sm text-gray-600 mb-8">
                Sign in to manage your availability schedule
              </p>
              <Link href="/login">
                <Button className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white py-3 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5">
                  Sign In to Continue
                </Button>
              </Link>
            </div>
          </CardBody>
        </Card>
      </div>
    )
  }

  if (user.role !== 'practitioner' && !user.is_staff) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-orange-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md border-0 shadow-2xl rounded-2xl overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-amber-600/10 to-orange-600/10"></div>
          <CardBody className="p-8 relative">
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-amber-500 to-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg transform -rotate-3 hover:rotate-0 transition-transform">
                <ShieldCheckIcon className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Restricted</h2>
              <p className="text-sm text-gray-600 mb-4">
                This area is only for practitioners.
              </p>
              <div className="bg-amber-50 px-4 py-2 rounded-full inline-block mb-6">
                <p className="text-sm text-amber-600">
                  Current role: <span className="font-semibold capitalize">{user.role}</span>
                </p>
              </div>
              <Link href={`/${user.role}/dashboard`}>
                <Button variant="outline" className="w-full border-2 hover:border-amber-300 hover:bg-amber-50 py-3 rounded-xl">
                  Go to Dashboard
                </Button>
              </Link>
            </div>
          </CardBody>
        </Card>
      </div>
    )
  }

  if (!practitionerId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-orange-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md border-0 shadow-2xl rounded-2xl overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-amber-600/10 to-orange-600/10"></div>
          <CardBody className="p-8 relative">
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-amber-500 to-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                <ExclamationTriangleIcon className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">No Practitioner Profile</h2>
              <p className="text-sm text-gray-600 mb-8">
                Complete your practitioner profile to start managing availability.
              </p>
              <Link href="/practitioner/application">
                <Button className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 py-3 rounded-xl">
                  Complete Profile
                </Button>
              </Link>
            </div>
          </CardBody>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-emerald-50/30">
      {/* Header with gradient */}
      <div className="bg-white border-b border-gray-200/80 sticky top-0 z-10 backdrop-blur-sm bg-white/90">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl shadow-lg">
                <CalendarDaysIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Availability</h1>
                <p className="text-sm text-gray-500 flex items-center gap-2">
                  <span>Manage your practice hours</span>
                  <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                  <span className="text-emerald-600 font-medium">{availabilitySlots.length} active slots</span>
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleRefresh}
                className="flex items-center gap-2 border-gray-300 hover:border-emerald-400 hover:bg-emerald-50"
              >
                <ArrowPathIcon className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">Refresh</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
            <CardBody className="p-5">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-emerald-100 rounded-xl">
                  <ClockIcon className="w-6 h-6 text-emerald-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total Slots</p>
                  <p className="text-2xl font-bold text-gray-900">{availabilitySlots.length}</p>
                </div>
              </div>
            </CardBody>
          </Card>

          <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
            <CardBody className="p-5">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-100 rounded-xl">
                  <CalendarDaysIcon className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Days Covered</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {new Set(availabilitySlots.map(s => s.day_of_week)).size}
                  </p>
                </div>
              </div>
            </CardBody>
          </Card>

          <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
            <CardBody className="p-5">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-purple-100 rounded-xl">
                  <CheckCircleIcon className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Status</p>
                  <p className="text-lg font-semibold text-green-600">Active</p>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'overview'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'bg-white text-gray-600 hover:bg-gray-100'
            }`}
          >
            <ListBulletIcon className="w-4 h-4 inline-block mr-2" />
            Overview
          </button>
          <button
            onClick={() => setActiveTab('schedule')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'schedule'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'bg-white text-gray-600 hover:bg-gray-100'
            }`}
          >
            <CalendarDaysIcon className="w-4 h-4 inline-block mr-2" />
            Schedule
          </button>
        </div>

        {/* Content area */}
        <div className="space-y-6">
          {/* Quick add card */}
          <Card className="border-0 shadow-xl overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-600/5 via-transparent to-blue-600/5"></div>
            <CardBody className="p-6 relative">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-emerald-100 rounded-lg">
                  <PlusCircleIcon className="w-5 h-5 text-emerald-600" />
                </div>
                <h2 className="text-lg font-semibold text-gray-900">Add Availability</h2>
              </div>
              
              <SetAvailability 
                practitionerId={practitionerId}
                onSlotsAdded={handleSlotsAdded}
              />
            </CardBody>
          </Card>

          {/* View card */}
          <Card className="border-0 shadow-xl overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 via-transparent to-purple-600/5"></div>
            <CardBody className="p-6 relative">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <CalendarDaysIcon className="w-5 h-5 text-blue-600" />
                </div>
                <h2 className="text-lg font-semibold text-gray-900">Current Schedule</h2>
                {availabilitySlots.length > 0 && (
                  <span className="ml-auto text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full">
                    {availabilitySlots.length} active
                  </span>
                )}
              </div>
              
              <ViewAvailability 
                slots={availabilitySlots}
                loading={loading}
                onSlotDeleted={handleSlotDeleted}
              />
            </CardBody>
          </Card>
        </div>

        {/* Footer */}
        <div className="mt-8 flex items-center justify-between text-xs text-gray-400 border-t border-gray-200 pt-4">
          <div className="flex items-center gap-2">
            <SparklesIcon className="w-4 h-4" />
            <span>Schedule syncs automatically</span>
          </div>
          <div className="flex items-center gap-2">
            <span>Time zone: {Intl.DateTimeFormat().resolvedOptions().timeZone}</span>
          </div>
        </div>
      </div>
    </div>
  )
}