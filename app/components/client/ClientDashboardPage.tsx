// app/components/client/dashboard/ClientDashboardPage.tsx
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

export default function ClientDashboardPage() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth()
  const router = useRouter()
  const [isMounted, setIsMounted] = useState(false)
  const [consultations, setConsultations] = useState<Consultation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  if (authLoading || !isMounted) {
    return (
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-emerald-200 border-t-emerald-600"></div>
      </div>
    )
  }

  if (!isAuthenticated || !user) {
    router.push('/login')
    return null
  }

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      const response = await apiClient.consultations.getMyClientConsultations()
      const consultationsArray = Array.isArray(response) ? response : 
        (response && 'results' in response ? (response as any).results : [])
      setConsultations(consultationsArray)
    } catch (error: any) {
      console.error('Error fetching dashboard data:', error)
      setError(error.message || 'Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-emerald-200 border-t-emerald-600"></div>
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

  const StatusBadge = ({ status }: { status: string }) => {
    const config: Record<string, string> = {
      booked: 'bg-blue-50 text-blue-700 border-blue-200',
      completed: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      cancelled: 'bg-red-50 text-red-700 border-red-200',
      no_show: 'bg-amber-50 text-amber-700 border-amber-200',
    }
    return (
      <span className={`px-2 py-1 rounded-md text-xs font-medium border ${config[status] || config.booked}`}>
        {status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
      </span>
    )
  }

  return (
    <div className="min-h-[calc(100vh-64px)] bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Welcome back, {firstName}</h1>
          <p className="text-gray-600 mt-1">Here's an overview of your consultations and activity</p>
        </div>

        {error && (
          <div className="mb-8 bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard title="Total" value={stats.total} icon={DocumentTextIcon} color="bg-blue-500" />
          <StatCard title="Upcoming" value={stats.upcoming} icon={ClockIcon} color="bg-emerald-500" />
          <StatCard title="Completed" value={stats.completed} icon={CheckCircleIcon} color="bg-purple-500" />
          <StatCard title="Cancelled" value={stats.cancelled} icon={XCircleIcon} color="bg-amber-500" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardBody className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">Upcoming Consultations</h2>
                  {upcomingConsultations.length > 0 && (
                    <Link href="/client/dashboard/consultations" className="text-sm text-emerald-600 hover:text-emerald-700 flex items-center gap-1">
                      View all <ArrowRightIcon className="h-4 w-4" />
                    </Link>
                  )}
                </div>

                {upcomingConsultations.length > 0 ? (
                  <div className="space-y-3">
                    {upcomingConsultations.map((consultation) => (
                      <Link key={consultation.id} href={`/client/dashboard/consultations/${consultation.id}`}
                        className="block p-4 bg-gray-50 rounded-xl hover:bg-gray-100">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                          <div className="flex items-start gap-3">
                            <div className="p-2 bg-white rounded-lg">
                              <VideoCameraIcon className="h-5 w-5 text-emerald-600" />
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">Dr. {consultation.practitioner_name || 'Practitioner'}</p>
                              <p className="text-sm text-gray-500">
                                {new Date(consultation.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} at {consultation.time?.slice(0,5)}
                              </p>
                            </div>
                          </div>
                          <StatusBadge status={consultation.status} />
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <EmptyState
                    title="No upcoming consultations"
                    description="Book your first consultation to get started"
                    icon={CalendarIcon}
                    action={{ label: "Book Now", href: "/client/dashboard/practitioners" }}
                  />
                )}
              </CardBody>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardBody className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
                <div className="space-y-3">
                  <Link href="/client/dashboard/practitioners">
                    <Button variant="outline" fullWidth className="justify-start">
                      <UserGroupIcon className="h-5 w-5 mr-3 text-emerald-600" />
                      Find Practitioners
                    </Button>
                  </Link>
                  <Link href="/client/dashboard/consultations">
                    <Button variant="outline" fullWidth className="justify-start">
                      <CalendarIcon className="h-5 w-5 mr-3 text-emerald-600" />
                      View All Consultations
                    </Button>
                  </Link>
                </div>
              </CardBody>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

function StatCard({ title, value, icon: Icon, color }: { title: string; value: number; icon: any; color: string }) {
  return (
    <Card className="hover:shadow-md">
      <CardBody className="p-4">
        <div className="flex items-center justify-between">
          <p className="text-xs font-medium text-gray-500">{title}</p>
          <div className={`p-2 rounded-lg ${color}`}>
            <Icon className="h-4 w-4 text-white" />
          </div>
        </div>
        <p className="text-2xl font-bold text-gray-900 mt-2">{value}</p>
      </CardBody>
    </Card>
  )
}

function EmptyState({ title, description, icon: Icon, action }: { title: string; description: string; icon: any; action?: { label: string; href: string } }) {
  return (
    <div className="text-center py-8">
      <div className="bg-gray-50 rounded-full p-3 w-16 h-16 mx-auto mb-3 flex items-center justify-center">
        <Icon className="h-6 w-6 text-gray-400" />
      </div>
      <h3 className="text-sm font-medium text-gray-900 mb-1">{title}</h3>
      <p className="text-xs text-gray-500 mb-4">{description}</p>
      {action && (
        <Link href={action.href}>
          <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white">
            {action.label}
          </Button>
        </Link>
      )}
    </div>
  )
}