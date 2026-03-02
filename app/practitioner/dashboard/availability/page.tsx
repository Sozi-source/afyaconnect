'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/app/contexts/AuthContext'
import { Card, CardBody, CardHeader } from '@/app/components/ui/Card'
import { Button } from '@/app/components/ui/Buttons'
import { PractitionerAvailabilityManager } from '@/app/components/practitioners/availability/PractitionerAvailabilityManager'
import { 
  CalendarIcon, 
  ClockIcon, 
  UserCircleIcon,
  ArrowLeftOnRectangleIcon,
  ShieldCheckIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon,
  InformationCircleIcon,
  CheckBadgeIcon
} from '@heroicons/react/24/outline'
import Link from 'next/link'

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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="w-16 h-16 sm:w-20 sm:h-20 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin mx-auto"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <CalendarIcon className="w-6 h-6 sm:w-8 sm:h-8 text-emerald-600 animate-pulse" />
            </div>
          </div>
          <p className="mt-4 text-sm sm:text-base text-slate-600 font-medium">Loading your availability...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white flex items-center justify-center p-4">
        <Card className="max-w-md w-full transform transition-all hover:scale-105">
          <CardBody className="p-6 sm:p-8">
            <div className="text-center">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                <UserCircleIcon className="w-8 h-8 sm:w-10 sm:h-10 text-emerald-600" />
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-2">Authentication Required</h2>
              <p className="text-sm sm:text-base text-slate-600 mb-6">Please log in to manage your availability schedule.</p>
              <Link href="/login" className="block">
                <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 sm:py-3 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all">
                  <ArrowLeftOnRectangleIcon className="w-4 h-4 sm:w-5 sm:h-5 mr-2 inline-block" />
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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white flex items-center justify-center p-4">
        <Card className="max-w-md w-full border-2 border-amber-200 transform transition-all hover:scale-105">
          <CardBody className="p-6 sm:p-8">
            <div className="text-center">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                <ShieldCheckIcon className="w-8 h-8 sm:w-10 sm:h-10 text-amber-600" />
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-2">Access Restricted</h2>
              <p className="text-sm sm:text-base text-slate-600 mb-6">
                This area is only accessible to practitioners. You are currently logged in as a {user.role}.
              </p>
              <Link href={`/${user.role}/dashboard`} className="block">
                <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 sm:py-3 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all">
                  Go to Your Dashboard
                </Button>
              </Link>
            </div>
          </CardBody>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 py-4 sm:py-6 md:py-8 px-3 sm:px-4 md:px-6 lg:px-8">
      {/* Header Section */}
      <div className="max-w-7xl mx-auto">
        <div className="mb-4 sm:mb-6 bg-white rounded-xl sm:rounded-2xl shadow-sm border border-slate-200 p-4 sm:p-5 md:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
            <div className="flex items-start sm:items-center gap-3 sm:gap-4">
              <div className="p-2 sm:p-3 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl shadow-lg">
                <CalendarIcon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">Availability Management</h1>
                <div className="flex flex-col xs:flex-row xs:items-center gap-1 xs:gap-2 mt-1">
                  <p className="text-xs sm:text-sm text-slate-600">Manage your weekly schedule and time slots</p>
                  {user.practitioner && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 w-fit">
                      <ClockIcon className="w-3 h-3 mr-1" />
                      Active Practitioner
                    </span>
                  )}
                </div>
              </div>
            </div>
            
            {/* Quick Stats */}
            <div className="flex items-center justify-start sm:justify-end gap-2 sm:gap-3 mt-2 sm:mt-0">
              <div className="text-right">
                <p className="text-xs text-slate-500">Current Status</p>
                <p className="text-xs sm:text-sm font-semibold text-emerald-600 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                  Available for bookings
                </p>
              </div>
              <div className="h-8 w-px bg-slate-200"></div>
              <div className="flex items-center gap-1">
                <CheckBadgeIcon className="w-4 h-4 text-emerald-500" />
                <span className="text-xs text-slate-600">Live</span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
          {practitionerId ? (
            <div className="divide-y divide-slate-100">
              <div className="p-3 sm:p-4 md:p-5 bg-gradient-to-r from-emerald-50 to-transparent border-b border-slate-100">
                <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-600">
                  <CalendarIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-500" />
                  <span>Practitioner ID: <span className="font-mono font-medium text-slate-900">{practitionerId}</span></span>
                </div>
              </div>
              <div className="p-3 sm:p-4 md:p-5 lg:p-6">
                <PractitionerAvailabilityManager initialPractitionerId={practitionerId} />
              </div>
            </div>
          ) : (
            <div className="p-8 sm:p-10 md:p-12 text-center">
              <div className="w-14 h-14 sm:w-16 sm:h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <ExclamationTriangleIcon className="w-6 h-6 sm:w-8 sm:h-8 text-amber-600" />
              </div>
              <h3 className="text-base sm:text-lg font-medium text-slate-900 mb-2">Practitioner ID Not Found</h3>
              <p className="text-xs sm:text-sm text-slate-500 mb-4 sm:mb-6">Unable to load availability settings. Please try refreshing the page.</p>
              <Button 
                onClick={() => window.location.reload()} 
                variant="outline"
                className="inline-flex items-center text-xs sm:text-sm"
              >
                <ArrowPathIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5" />
                Refresh Page
              </Button>
            </div>
          )}
        </div>

        {/* Help Section */}
        <div className="mt-4 sm:mt-6 bg-emerald-50 rounded-lg sm:rounded-xl p-3 sm:p-4 border border-emerald-100">
          <div className="flex items-start gap-2 sm:gap-3">
            <div className="p-1.5 sm:p-2 bg-white rounded-lg shadow-sm flex-shrink-0">
              <InformationCircleIcon className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-xs sm:text-sm font-medium text-emerald-900">Need help managing your availability?</p>
              <p className="text-xs text-emerald-700 mt-0.5 sm:mt-1">
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