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
  CheckBadgeIcon,
  BellAlertIcon,
  ChartPieIcon,
  Cog6ToothIcon,
  Bars3Icon,
  ArrowLeftEndOnRectangleIcon
} from '@heroicons/react/24/outline'
import Link from 'next/link'

export default function AvailabilityPage() {
  const { user, isLoading: authLoading } = useAuth()
  const [isMounted, setIsMounted] = useState(false)
  const [practitionerId, setPractitionerId] = useState<number | null>(null)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="relative">
            <div className="w-16 h-16 sm:w-20 sm:h-20 border-4 border-emerald-100 border-t-emerald-600 rounded-full animate-spin mx-auto shadow-xl"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <CalendarIcon className="w-6 h-6 sm:w-8 sm:h-8 text-emerald-600 animate-pulse" />
            </div>
          </div>
          <p className="mt-4 sm:mt-6 text-xs sm:text-sm text-slate-600 font-medium bg-white/80 backdrop-blur-sm px-3 sm:px-4 py-2 rounded-full shadow-sm">
            Loading your availability...
          </p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-emerald-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md transform transition-all hover:scale-[1.02] hover:shadow-2xl shadow-xl border-0 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-600/5 to-blue-600/5"></div>
          <CardBody className="p-6 sm:p-8 relative">
            <div className="text-center">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-6 shadow-lg transform rotate-3 hover:rotate-0 transition-transform">
                <UserCircleIcon className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-2">Welcome Back</h2>
              <p className="text-xs sm:text-sm text-slate-600 mb-6 sm:mb-8 px-4">
                Sign in to manage your availability schedule
              </p>
              <Link href="/login" className="block">
                <Button className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white py-2.5 sm:py-3 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5 text-sm sm:text-base">
                  <ArrowLeftEndOnRectangleIcon className="w-4 h-4 sm:w-5 sm:h-5 mr-2 inline-block" />
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
        <Card className="w-full max-w-md border-0 shadow-2xl overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-amber-600/5 to-orange-600/5"></div>
          <CardBody className="p-6 sm:p-8 relative">
            <div className="text-center">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-amber-500 to-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-6 shadow-lg transform -rotate-3 hover:rotate-0 transition-transform">
                <ShieldCheckIcon className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-2">Access Restricted</h2>
              <p className="text-xs sm:text-sm text-slate-600 mb-3">
                This area is only accessible to practitioners.
              </p>
              <div className="bg-amber-50 px-3 py-2 rounded-full inline-block mb-6">
                <p className="text-xs text-amber-600">
                  Current role: <span className="font-semibold capitalize">{user.role}</span>
                </p>
              </div>
              <Link href={`/${user.role}/dashboard`} className="block">
                <Button className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-2.5 sm:py-3 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5 text-sm sm:text-base">
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50/30 py-3 sm:py-4 md:py-6 px-3 sm:px-4 lg:px-6">
      <div className="max-w-7xl mx-auto">
        {/* Header Section - Mobile Optimized */}
        <div className="mb-4 sm:mb-6 bg-white rounded-xl sm:rounded-2xl shadow-lg sm:shadow-xl border border-slate-200/80 overflow-hidden backdrop-blur-sm">
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-600/5 via-transparent to-blue-600/5"></div>
          <div className="relative p-4 sm:p-6">
            <div className="flex flex-col gap-4">
              {/* Top Row - Logo and Mobile Menu */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="p-2 sm:p-2.5 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl sm:rounded-1.5xl shadow-lg">
                      <CalendarIcon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                    </div>
                    <div className="absolute -top-1 -right-1 w-2 h-2 sm:w-2.5 sm:h-2.5 bg-emerald-500 rounded-full border-2 border-white animate-pulse"></div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-slate-900 tracking-tight truncate">
                      Availability Management
                    </h1>
                  </div>
                </div>
                
                {/* Mobile Menu Button */}
                <button
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="lg:hidden p-2 hover:bg-slate-100 rounded-lg transition-colors"
                  aria-label="Toggle menu"
                >
                  <Bars3Icon className="w-5 h-5 text-slate-600" />
                </button>

                {/* Desktop Quick Actions - Hidden on mobile */}
                <div className="hidden lg:flex items-center gap-3">
                  <button className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors">
                    <BellAlertIcon className="w-4 h-4" />
                  </button>
                  <button className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors">
                    <ChartPieIcon className="w-4 h-4" />
                  </button>
                  <button className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors">
                    <Cog6ToothIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Subtitle - Always visible */}
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-xs sm:text-sm text-slate-600">Manage your weekly schedule</p>
                {user.practitioner && (
                  <span className="inline-flex items-center px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-medium bg-emerald-100 text-emerald-800 border border-emerald-200 shadow-sm">
                    <ClockIcon className="w-3 h-3 mr-1" />
                    Active
                  </span>
                )}
              </div>

              {/* Mobile Menu Dropdown */}
              {mobileMenuOpen && (
                <div className="lg:hidden mt-3 pt-3 border-t border-slate-200">
                  <div className="flex items-center justify-between">
                    <div className="bg-gradient-to-br from-slate-50 to-white rounded-lg px-3 py-2 border border-slate-200 shadow-sm flex-1 mr-2">
                      <p className="text-[10px] text-slate-500 mb-0.5">Status</p>
                      <p className="text-xs font-semibold text-emerald-700 flex items-center gap-1.5">
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                        </span>
                        Available
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors">
                        <BellAlertIcon className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors">
                        <Cog6ToothIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Desktop Status - Hidden on mobile */}
              <div className="hidden lg:flex items-center justify-between mt-2">
                <div className="flex items-center gap-4">
                  <div className="bg-gradient-to-br from-slate-50 to-white rounded-lg px-3 py-2 border border-slate-200 shadow-sm">
                    <p className="text-xs text-slate-500 mb-1">Current Status</p>
                    <p className="text-sm font-semibold text-emerald-700 flex items-center gap-1.5">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                      </span>
                      Available for bookings
                    </p>
                  </div>
                  <div className="h-8 w-px bg-gradient-to-b from-transparent via-slate-300 to-transparent"></div>
                  <div className="flex items-center gap-1.5 bg-emerald-50 px-3 py-2 rounded-lg border border-emerald-100 shadow-sm">
                    <CheckBadgeIcon className="w-4 h-4 text-emerald-600" />
                    <span className="text-xs font-medium text-emerald-700">Live</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content - Responsive */}
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg sm:shadow-xl border border-slate-200/80 overflow-hidden backdrop-blur-sm">
          <div className="absolute inset-0 bg-gradient-to-b from-emerald-600/5 via-transparent to-transparent pointer-events-none"></div>
          
          {/* Practitioner ID Bar - Mobile Optimized */}
          <div className="px-4 sm:px-6 py-3 sm:py-4 bg-gradient-to-r from-emerald-50/80 via-white to-blue-50/80 border-b border-slate-200/80">
            <div className="flex flex-col xs:flex-row xs:items-center gap-2 xs:gap-0 xs:justify-between">
              <div className="flex items-center gap-2 text-xs sm:text-sm">
                <CalendarIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-600 flex-shrink-0" />
                <span className="text-slate-600">ID:</span>
                <span className="font-mono font-semibold text-slate-900 bg-white px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-lg border border-slate-200 shadow-sm text-xs">
                  {practitionerId}
                </span>
              </div>
              
              {/* Quick Actions - Always visible but stacked on mobile */}
              <div className="flex items-center gap-2 self-end xs:self-auto">
                <button className="p-1.5 sm:p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors">
                  <BellAlertIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </button>
                <button className="p-1.5 sm:p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors">
                  <ChartPieIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </button>
                <button className="p-1.5 sm:p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors">
                  <Cog6ToothIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Content Area - Responsive Padding */}
          <div className="p-3 sm:p-4 md:p-5 lg:p-6">
            {practitionerId ? (
              <div className="animate-in fade-in duration-500">
                <PractitionerAvailabilityManager initialPractitionerId={practitionerId} />
              </div>
            ) : (
              <div className="text-center py-8 sm:py-12 md:py-16">
                <div className="relative inline-block">
                  <div className="w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 bg-gradient-to-br from-amber-100 to-orange-100 rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto mb-3 sm:mb-4 shadow-lg transform rotate-3">
                    <ExclamationTriangleIcon className="w-7 h-7 sm:w-8 sm:h-8 md:w-10 md:h-10 text-amber-600" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-2.5 h-2.5 sm:w-3 sm:h-3 bg-amber-500 rounded-full border-2 border-white animate-pulse"></div>
                </div>
                <h3 className="text-base sm:text-lg font-semibold text-slate-900 mb-2">ID Not Found</h3>
                <p className="text-xs sm:text-sm text-slate-500 mb-4 sm:mb-6 max-w-xs mx-auto px-4">
                  Unable to load availability settings. Please refresh.
                </p>
                <Button 
                  onClick={() => window.location.reload()} 
                  variant="outline"
                  className="inline-flex items-center text-xs sm:text-sm px-4 sm:px-6 py-2 sm:py-2.5 border-2 hover:border-emerald-300 hover:bg-emerald-50 transition-all"
                >
                  <ArrowPathIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-2" />
                  Refresh
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Help Section - Mobile Optimized */}
        <div className="mt-4 sm:mt-6 relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-emerald-600/20 to-blue-600/20 rounded-xl sm:rounded-2xl blur opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <div className="relative bg-gradient-to-br from-emerald-50 via-white to-blue-50 rounded-lg sm:rounded-xl p-3 sm:p-4 md:p-5 border border-emerald-200/80 shadow-md">
            <div className="flex flex-col xs:flex-row items-start gap-3 sm:gap-4">
              <div className="p-2 sm:p-2.5 bg-white rounded-lg sm:rounded-xl shadow-md flex-shrink-0">
                <InformationCircleIcon className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs sm:text-sm font-semibold text-emerald-900 mb-1">Need help?</p>
                <p className="text-[10px] sm:text-xs text-emerald-700/80 leading-relaxed">
                  Set your weekly recurring schedule and manage time slots. Changes reflect immediately.
                  <Link href="/help/availability" className="inline-flex items-center ml-1 text-emerald-600 hover:text-emerald-700 font-medium">
                    Learn more
                    <span className="ml-1">→</span>
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Stats - Mobile Optimized */}
        <div className="mt-3 sm:mt-4 flex flex-wrap items-center justify-end gap-2 sm:gap-4 text-[10px] sm:text-xs text-slate-400">
          <span>Updated: Today</span>
          <span className="w-1 h-1 rounded-full bg-slate-300"></span>
          <span>Time zone: EAT</span>
        </div>
      </div>
    </div>
  )
}