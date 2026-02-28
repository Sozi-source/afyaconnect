'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/app/contexts/AuthContext'
import { Card, CardBody } from '@/app/components/ui/Card'
import { Button } from '@/app/components/ui/Buttons'
import { PractitionerAvailabilityManager } from '@/app/components/practitioners/availability/PractitionerAvailabilityManager'
import { 
  CalendarIcon, 
  ClockIcon, 
  UserCircleIcon,
  ArrowLeftOnRectangleIcon,
  ShieldCheckIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline'

export default function AvailabilityPage() {
  const { user, isLoading: authLoading } = useAuth()
  const [isMounted, setIsMounted] = useState(false)
  const [practitionerId, setPractitionerId] = useState<number | null>(null)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  useEffect(() => {
    if (user) {
      const id = user?.practitioner?.id || 3
      setPractitionerId(id)
    }
  }, [user])

  if (authLoading || !isMounted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin mx-auto"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <CalendarIcon className="w-8 h-8 text-emerald-600 animate-pulse" />
            </div>
          </div>
          <p className="mt-4 text-gray-600 font-medium">Loading your availability...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
        <Card className="max-w-md w-full transform transition-all hover:scale-105">
          <CardBody className="p-8">
            <div className="text-center">
              <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <UserCircleIcon className="w-12 h-12 text-emerald-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Authentication Required</h2>
              <p className="text-gray-600 mb-6">Please log in to manage your availability schedule.</p>
              <Button 
                onClick={() => window.location.href = '/login'} 
                className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
              >
                <ArrowLeftOnRectangleIcon className="w-5 h-5 mr-2 inline-block" />
                Sign In to Continue
              </Button>
            </div>
          </CardBody>
        </Card>
      </div>
    )
  }

  if (user.role !== 'practitioner' && !user.is_staff) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
        <Card className="max-w-md w-full border-2 border-amber-200 transform transition-all hover:scale-105">
          <CardBody className="p-8">
            <div className="text-center">
              <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <ShieldCheckIcon className="w-12 h-12 text-amber-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Restricted</h2>
              <p className="text-gray-600 mb-6">
                This area is only accessible to practitioners. You are currently logged in as a {user.role}.
              </p>
              <Button 
                onClick={() => window.location.href = `/${user.role}/dashboard`} 
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
              >
                Go to Your Dashboard
              </Button>
            </div>
          </CardBody>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      {/* Header Section */}
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl shadow-lg">
                <CalendarIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Availability Management</h1>
                <div className="flex items-center mt-1 space-x-2">
                  <p className="text-gray-600">Manage your weekly schedule and time slots</p>
                  {user.practitioner && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                      <ClockIcon className="w-3 h-3 mr-1" />
                      Active Practitioner
                    </span>
                  )}
                </div>
              </div>
            </div>
            
            {/* Quick Stats */}
            <div className="mt-4 sm:mt-0 flex items-center space-x-3">
              <div className="text-right">
                <p className="text-sm text-gray-500">Current Status</p>
                <p className="text-sm font-semibold text-emerald-600">Available for bookings</p>
              </div>
              <div className="h-10 w-px bg-gray-200"></div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-gray-600">Live</span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          {practitionerId ? (
            <div className="divide-y divide-gray-100">
              <div className="p-6 bg-gradient-to-r from-emerald-50 to-transparent border-b border-gray-100">
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <CalendarIcon className="w-4 h-4 text-emerald-500" />
                  <span>Practitioner ID: <span className="font-mono font-medium">{practitionerId}</span></span>
                </div>
              </div>
              <div className="p-6">
                <PractitionerAvailabilityManager initialPractitionerId={practitionerId} />
              </div>
            </div>
          ) : (
            <div className="p-12 text-center">
              <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <ExclamationTriangleIcon className="w-8 h-8 text-amber-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Practitioner ID Not Found</h3>
              <p className="text-gray-500 mb-6">Unable to load availability settings. Please try refreshing the page.</p>
              <Button 
                onClick={() => window.location.reload()} 
                variant="outline"
                className="inline-flex items-center"
              >
                Refresh Page
              </Button>
            </div>
          )}
        </div>

        {/* Help Section */}
        <div className="mt-6 bg-emerald-50 rounded-xl p-4 border border-emerald-100">
          <div className="flex items-start space-x-3">
            <div className="p-2 bg-white rounded-lg shadow-sm">
              <ClockIcon className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-emerald-900">Need help managing your availability?</p>
              <p className="text-sm text-emerald-700 mt-1">
                Set your weekly recurring schedule and manage time slots for patient bookings. 
                Changes will be reflected immediately in the booking system.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}