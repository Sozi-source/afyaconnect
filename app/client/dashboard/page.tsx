'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/app/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  CalendarIcon,
  ClockIcon,
  UserGroupIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowRightIcon,
  VideoCameraIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline'
import { Card, CardBody } from '@/app/components/ui/Card'
import { Button } from '@/app/components/ui/Buttons'
import { apiClient } from '@/app/lib/api'
import type { Consultation } from '@/app/types'

// Status badge component with clean design
const StatusBadge = ({ status }: { status: string }) => {
  const config: Record<string, { color: string; icon: any }> = {
    booked: { 
      color: 'bg-blue-50 text-blue-700 border-blue-200', 
      icon: ClockIcon 
    },
    completed: { 
      color: 'bg-emerald-50 text-emerald-700 border-emerald-200', 
      icon: CheckCircleIcon 
    },
    cancelled: { 
      color: 'bg-red-50 text-red-700 border-red-200', 
      icon: XCircleIcon 
    },
    no_show: { 
      color: 'bg-amber-50 text-amber-700 border-amber-200', 
      icon: XCircleIcon 
    },
  }

  const { color, icon: Icon } = config[status] || config.booked
  const displayStatus = status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium border ${color}`}>
      {Icon && <Icon className="h-3 w-3" />}
      {displayStatus}
    </span>
  )
}

// Stat Card Component
const StatCard = ({ 
  title, 
  value, 
  icon: Icon, 
  color 
}: { 
  title: string; 
  value: number; 
  icon: any; 
  color: string 
}) => (
  <Card className="hover:shadow-md transition-shadow">
    <CardBody className="p-4">
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs font-medium text-gray-500">{title}</p>
        <div className={`p-2 rounded-lg ${color}`}>
          <Icon className="h-4 w-4 text-white" />
        </div>
      </div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
    </CardBody>
  </Card>
)

// Empty State Component
const EmptyState = ({ 
  title, 
  description, 
  icon: Icon, 
  action 
}: { 
  title: string; 
  description: string; 
  icon: any; 
  action?: { label: string; href: string } 
}) => (
  <div className="flex flex-col items-center justify-center py-12 px-4">
    <div className="bg-gray-50 rounded-full p-4 mb-4">
      <Icon className="h-8 w-8 text-gray-400" />
    </div>
    <h3 className="text-lg font-semibold text-gray-900 mb-1">{title}</h3>
    <p className="text-sm text-gray-500 text-center max-w-sm mb-6">{description}</p>
    {action && (
      <Link href={action.href}>
        <Button className="bg-emerald-600 hover:bg-emerald-700 text-white">
          {action.label}
        </Button>
      </Link>
    )}
  </div>
)

export default function ClientDashboardPage() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth()
  const router = useRouter()
  
  const [dataLoading, setDataLoading] = useState(true)
  const [consultations, setConsultations] = useState<Consultation[]>([])
  const [error, setError] = useState<string | null>(null)
  const [isMounted, setIsMounted] = useState(false)

  // Handle mounting
  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Auth and role check
  useEffect(() => {
    if (!authLoading && isMounted) {
      if (!isAuthenticated) {
        router.replace('/login')
        return
      }

      if (user && user.role !== 'client' && !user.is_staff) {
        router.replace(`/${user.role}/dashboard`)
        return
      }
    }
  }, [authLoading, isAuthenticated, user, router, isMounted])

  // Fetch dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      if (authLoading || !isMounted || !user) return

      try {
        setDataLoading(true)
        setError(null)
        
        const response = await apiClient.consultations.getMyClientConsultations()
        
        let consultationsArray: Consultation[] = []
        if (Array.isArray(response)) {
          consultationsArray = response
        } else if (response && typeof response === 'object') {
          if ('results' in response && Array.isArray((response as any).results)) {
            consultationsArray = (response as any).results
          }
        }
        
        setConsultations(consultationsArray)
      } catch (error: any) {
        console.error('Error fetching dashboard data:', error)
        setError(error.message || 'Failed to load dashboard data')
      } finally {
        setDataLoading(false)
      }
    }

    fetchDashboardData()
  }, [user, authLoading, isMounted])

  // Loading state
  if (authLoading || !isMounted || !user || dataLoading) {
    return (
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-emerald-200 border-t-emerald-600"></div>
          <p className="text-sm text-gray-500">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  const firstName = user?.first_name || user?.email?.split('@')[0] || 'User'
  const safeConsultations = Array.isArray(consultations) ? consultations : []
  
  const stats = {
    total: safeConsultations.length,
    upcoming: safeConsultations.filter(c => c.status === 'booked').length,
    completed: safeConsultations.filter(c => c.status === 'completed').length,
    cancelled: safeConsultations.filter(c => c.status === 'cancelled' || c.status === 'no_show').length
  }

  const upcomingConsultations = safeConsultations
    .filter(c => c.status === 'booked')
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 3)

  return (
    <div className="min-h-[calc(100vh-64px)] bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
            Welcome back, {firstName}
          </h1>
          <p className="text-gray-600 mt-1">
            Here's an overview of your consultations and activity
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard 
            title="Total Consultations" 
            value={stats.total}
            icon={DocumentTextIcon}
            color="bg-blue-500"
          />
          <StatCard 
            title="Upcoming" 
            value={stats.upcoming}
            icon={ClockIcon}
            color="bg-emerald-500"
          />
          <StatCard 
            title="Completed" 
            value={stats.completed}
            icon={CheckCircleIcon}
            color="bg-purple-500"
          />
          <StatCard 
            title="Cancelled" 
            value={stats.cancelled}
            icon={XCircleIcon}
            color="bg-amber-500"
          />
        </div>

        {/* Error State */}
        {error && (
          <div className="mb-8 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-red-600">{error}</p>
              <button 
                onClick={() => window.location.reload()}
                className="text-sm text-red-600 hover:text-red-700 font-medium"
              >
                Try again
              </button>
            </div>
          </div>
        )}

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Upcoming Consultations */}
            <Card>
              <CardBody className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">
                      Upcoming Consultations
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">
                      Your scheduled sessions
                    </p>
                  </div>
                  {upcomingConsultations.length > 0 && (
                    <Link 
                      href="/client/dashboard/consultations" 
                      className="text-sm text-emerald-600 hover:text-emerald-700 font-medium flex items-center gap-1"
                    >
                      View all
                      <ArrowRightIcon className="h-4 w-4" />
                    </Link>
                  )}
                </div>

                {upcomingConsultations.length > 0 ? (
                  <div className="space-y-3">
                    {upcomingConsultations.map((consultation) => (
                      <Link 
                        key={consultation.id} 
                        href={`/client/dashboard/consultations/${consultation.id}`}
                        className="block p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                          <div className="flex items-start gap-3">
                            <div className="p-2 bg-white rounded-lg">
                              <VideoCameraIcon className="h-5 w-5 text-emerald-600" />
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">
                                Dr. {consultation.practitioner_name || 'Practitioner'}
                              </p>
                              <div className="flex items-center gap-3 mt-1">
                                <span className="text-sm text-gray-500">
                                  {consultation.date ? new Date(consultation.date).toLocaleDateString('en-US', { 
                                    month: 'short', 
                                    day: 'numeric',
                                    year: 'numeric'
                                  }) : 'Date TBD'}
                                </span>
                                <span className="text-sm text-gray-400">•</span>
                                <span className="text-sm text-gray-500">
                                  {consultation.time?.slice(0,5)}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <StatusBadge status={consultation.status} />
                            <Button 
                              size="sm" 
                              variant="outline"
                              className="border-emerald-600 text-emerald-600 hover:bg-emerald-50"
                            >
                              Join
                            </Button>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <EmptyState
                    title="No upcoming consultations"
                    description="Ready to start your wellness journey? Book your first consultation with one of our experienced practitioners."
                    icon={CalendarIcon}
                    action={{ label: "Book Consultation", href: "/client/dashboard/practitioners" }}
                  />
                )}
              </CardBody>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardBody className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Recent Activity
                </h2>
                
                {safeConsultations.length > 0 ? (
                  <div className="space-y-4">
                    {safeConsultations.slice(0, 5).map((consultation) => (
                      <div 
                        key={consultation.id}
                        className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0"
                      >
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            Consultation with Dr. {consultation.practitioner_name || 'Practitioner'}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {new Date(consultation.date).toLocaleDateString('en-US', { 
                              month: 'short', 
                              day: 'numeric' 
                            })}
                          </p>
                        </div>
                        <StatusBadge status={consultation.status} />
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 text-center py-8">
                    No activity yet
                  </p>
                )}
              </CardBody>
            </Card>
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card>
              <CardBody className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Quick Actions
                </h2>
                <div className="space-y-3">
                  <Link href="/client/dashboard/practitioners">
                    <Button 
                      variant="outline" 
                      fullWidth 
                      className="justify-start text-gray-700 hover:bg-emerald-50 hover:border-emerald-200"
                    >
                      <UserGroupIcon className="h-5 w-5 mr-3 text-emerald-600" />
                      Find Practitioners
                    </Button>
                  </Link>
                  <Link href="/client/dashboard/consultations">
                    <Button 
                      variant="outline" 
                      fullWidth 
                      className="justify-start text-gray-700 hover:bg-emerald-50 hover:border-emerald-200"
                    >
                      <CalendarIcon className="h-5 w-5 mr-3 text-emerald-600" />
                      View All Consultations
                    </Button>
                  </Link>
                </div>
              </CardBody>
            </Card>

            {/* Need Help Card */}
            <Card className="bg-gradient-to-br from-emerald-600 to-teal-600">
              <CardBody className="p-6">
                <h3 className="text-lg font-semibold text-white mb-2">
                  Need Help?
                </h3>
                <p className="text-sm text-emerald-50 mb-4">
                  Our support team is here to assist you with any questions or concerns.
                </p>
                <a
                  href="mailto:support@afyaconnect.com"
                  className="inline-flex items-center px-4 py-2 bg-white text-emerald-600 rounded-lg text-sm font-medium hover:bg-emerald-50 transition-colors"
                >
                  Contact Support
                  <ArrowRightIcon className="h-4 w-4 ml-2" />
                </a>
              </CardBody>
            </Card>

            {/* Tips Card */}
            {stats.upcoming === 0 && (
              <Card>
                <CardBody className="p-6">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-emerald-100 rounded-lg">
                      <ClockIcon className="h-5 w-5 text-emerald-600" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-gray-900">
                        Ready to get started?
                      </h4>
                      <p className="text-xs text-gray-500 mt-1">
                        Browse our practitioners and book your first consultation today.
                      </p>
                    </div>
                  </div>
                </CardBody>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}