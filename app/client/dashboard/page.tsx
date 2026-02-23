'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/app/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { 
  CalendarIcon,
  ClockIcon,
  UserGroupIcon,
  StarIcon,
  BriefcaseIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline'
import { Card, CardBody } from '@/app/components/ui/Card'
import { Button } from '@/app/components/ui/Buttons'
import { apiClient } from '@/app/lib/api'
import type { Consultation } from '@/app/types'

export default function ClientDashboardPage() {
  const { user, isAuthenticated } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [showPractitionerInfo, setShowPractitionerInfo] = useState(false)
  const [stats, setStats] = useState({
    totalConsultations: 0,
    upcoming: 0,
    completed: 0,
    cancelled: 0
  })
  const [recentConsultations, setRecentConsultations] = useState<Consultation[]>([])

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login')
      return
    }
    fetchDashboardData()
  }, [isAuthenticated, router])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      
      // This works with your current API
      const consultations = await apiClient.consultations.getMyClientConsultations()
      
      // Calculate stats
      const upcoming = consultations.filter(c => c.status === 'booked').length
      const completed = consultations.filter(c => c.status === 'completed').length
      const cancelled = consultations.filter(c => c.status === 'cancelled').length

      setStats({
        totalConsultations: consultations.length,
        upcoming,
        completed,
        cancelled
      })

      setRecentConsultations(consultations.slice(0, 5))
      
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-emerald-200 border-t-emerald-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Client Dashboard</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Welcome back, {user?.first_name || 'User'}!
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
        <Card>
          <CardBody className="p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-gray-500">Total Consultations</p>
              <CalendarIcon className="h-4 w-4 text-emerald-500" />
            </div>
            <p className="text-xl font-bold">{stats.totalConsultations}</p>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-gray-500">Upcoming</p>
              <ClockIcon className="h-4 w-4 text-blue-500" />
            </div>
            <p className="text-xl font-bold">{stats.upcoming}</p>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-gray-500">Completed</p>
              <CheckCircleIcon className="h-4 w-4 text-green-500" />
            </div>
            <p className="text-xl font-bold">{stats.completed}</p>
          </CardBody>
        </Card>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Consultations */}
        <div className="lg:col-span-2">
          <Card>
            <CardBody className="p-4">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">Recent Consultations</h2>
                <Link href="/client/dashboard/consultations" className="text-sm text-emerald-600 hover:underline">
                  View all
                </Link>
              </div>
              {recentConsultations.length > 0 ? (
                <div className="space-y-3">
                  {recentConsultations.map((consultation) => (
                    <Link 
                      key={consultation.id} 
                      href={`/client/dashboard/consultations/${consultation.id}`}
                      className="block p-3 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium">Dr. {consultation.practitioner_name}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            {new Date(consultation.date).toLocaleDateString()} at {consultation.time.slice(0,5)}
                          </p>
                        </div>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          consultation.status === 'completed' 
                            ? 'bg-green-100 text-green-800'
                            : consultation.status === 'cancelled'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {consultation.status}
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <CalendarIcon className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-sm text-gray-500">No consultations yet</p>
                  <Link href="/client/dashboard/practitioners">
                    <Button size="sm" className="mt-4 bg-emerald-600 hover:bg-emerald-700 text-white">
                      Book Your First Consultation
                    </Button>
                  </Link>
                </div>
              )}
            </CardBody>
          </Card>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-4">
          {/* Quick Actions */}
          <Card>
            <CardBody className="p-4">
              <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
              <div className="space-y-2">
                <Link href="/client/dashboard/practitioners">
                  <Button variant="outline" fullWidth className="justify-start">
                    <UserGroupIcon className="h-4 w-4 mr-2" />
                    Find Practitioners
                  </Button>
                </Link>
                <Link href="/client/dashboard/consultations">
                  <Button variant="outline" fullWidth className="justify-start">
                    <CalendarIcon className="h-4 w-4 mr-2" />
                    View Consultations
                  </Button>
                </Link>
              </div>
            </CardBody>
          </Card>

          {/* Practitioner Info Card - Just Informational */}
          <Card>
            <CardBody className="p-4 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center text-white">
                  <BriefcaseIcon className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 dark:text-white">Become a Practitioner</h3>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    Interested in becoming a practitioner? Contact our support team to learn more.
                  </p>
                  <a
                    href="mailto:support@nutriconnect.com?subject=Practitioner%20Application"
                    className="inline-block mt-3 text-sm text-emerald-600 hover:text-emerald-700 font-medium"
                  >
                    Contact Support →
                  </a>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  )
}