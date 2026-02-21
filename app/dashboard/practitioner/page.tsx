'use client'

import { useAuth } from '@/app/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { 
  CalendarIcon,
  ClockIcon,
  CurrencyDollarIcon,
  UserGroupIcon,
  ChartBarIcon,
  CheckCircleIcon,
  ArrowRightIcon,
  BellIcon,
  StarIcon
} from '@heroicons/react/24/outline'
import { Card, CardBody } from '@/app/components/ui/Card'
import { Button } from '@/app/components/ui/Buttons'
import { apiClient } from '@/app/lib/api'

interface ExtendedUser {
  id: number
  email: string
  first_name?: string
  last_name?: string
  role?: string
  is_verified?: boolean
}

interface PracticeStats {
  totalConsultations: number
  upcoming: number
  completed: number
  cancelled: number
  totalEarnings: number
  pendingEarnings: number
  averageRating: number
  totalClients: number
}

export default function PractitionerDashboardPage() {
  const { user, isAuthenticated } = useAuth()
  const router = useRouter()
  const extendedUser = user as ExtendedUser | null
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<PracticeStats>({
    totalConsultations: 0,
    upcoming: 0,
    completed: 0,
    cancelled: 0,
    totalEarnings: 0,
    pendingEarnings: 0,
    averageRating: 0,
    totalClients: 0
  })

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login')
      return
    }
    
    if (extendedUser?.role !== 'practitioner' || !extendedUser?.is_verified) {
      router.push('/dashboard')
      return
    }

    fetchPracticeData()
  }, [isAuthenticated, extendedUser, router])

  const fetchPracticeData = async () => {
    try {
      setLoading(true)
      // Mock data - replace with actual API calls
      setStats({
        totalConsultations: 45,
        upcoming: 8,
        completed: 37,
        cancelled: 2,
        totalEarnings: 157500,
        pendingEarnings: 28000,
        averageRating: 4.8,
        totalClients: 28
      })
    } catch (error) {
      console.error('Error fetching practice data:', error)
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

  const upcomingConsultations = [
    { id: 1, client: 'Mary Wanjiku', time: '10:00 AM', date: 'Today', type: 'Initial Consultation' },
    { id: 2, client: 'John Omondi', time: '2:30 PM', date: 'Today', type: 'Follow-up' },
    { id: 3, client: 'Sarah Kimani', time: '9:00 AM', date: 'Tomorrow', type: 'Nutrition Plan Review' },
    { id: 4, client: 'Peter Kipchoge', time: '11:30 AM', date: 'Tomorrow', type: 'Sports Nutrition' },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Practice Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Welcome back, Dr. {extendedUser?.first_name}
          </p>
        </div>
        <Link href="/dashboard/availability">
          <Button className="bg-emerald-600 hover:bg-emerald-700 text-white">
            <ClockIcon className="h-4 w-4 mr-2" />
            Set Availability
          </Button>
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Card>
          <CardBody className="p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-gray-500">Total Earnings</p>
              <CurrencyDollarIcon className="h-4 w-4 text-emerald-500" />
            </div>
            <p className="text-xl font-bold">KES {stats.totalEarnings.toLocaleString()}</p>
            <p className="text-xs text-gray-500 mt-1">KES {stats.pendingEarnings.toLocaleString()} pending</p>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-gray-500">Consultations</p>
              <CalendarIcon className="h-4 w-4 text-blue-500" />
            </div>
            <p className="text-xl font-bold">{stats.totalConsultations}</p>
            <p className="text-xs text-gray-500 mt-1">{stats.upcoming} upcoming</p>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-gray-500">Clients</p>
              <UserGroupIcon className="h-4 w-4 text-purple-500" />
            </div>
            <p className="text-xl font-bold">{stats.totalClients}</p>
            <p className="text-xs text-gray-500 mt-1">+3 this month</p>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-gray-500">Rating</p>
              <StarIcon className="h-4 w-4 text-yellow-500" />
            </div>
            <p className="text-xl font-bold">{stats.averageRating}</p>
            <p className="text-xs text-gray-500 mt-1">from 42 reviews</p>
          </CardBody>
        </Card>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-lg font-semibold mb-3">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <QuickActionCard
            href="/dashboard/availability"
            icon={ClockIcon}
            title="Manage Hours"
            description="Set your availability"
            color="emerald"
          />
          <QuickActionCard
            href="/dashboard/consultations"
            icon={CalendarIcon}
            title="Requests"
            description="View pending requests"
            color="blue"
          />
          <QuickActionCard
            href="/dashboard/practitioner/earnings"
            icon={ChartBarIcon}
            title="Earnings"
            description="Track your income"
            color="purple"
          />
          <QuickActionCard
            href="/dashboard/profile/edit"
            icon={UserGroupIcon}
            title="Profile"
            description="Update your info"
            color="orange"
          />
        </div>
      </div>

      {/* Today's Schedule */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upcoming Consultations */}
        <div className="lg:col-span-2">
          <Card>
            <CardBody className="p-4">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">Today's Schedule</h2>
                <Link href="/dashboard/consultations" className="text-sm text-emerald-600 hover:underline">
                  View all
                </Link>
              </div>
              <div className="space-y-3">
                {upcomingConsultations.slice(0, 3).map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-emerald-500 rounded-full" />
                      <div>
                        <p className="text-sm font-medium">{item.client}</p>
                        <p className="text-xs text-gray-500">{item.type}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">{item.time}</p>
                      <p className="text-xs text-gray-500">{item.date}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Quick Stats */}
        <div className="lg:col-span-1">
          <Card>
            <CardBody className="p-4">
              <h2 className="text-lg font-semibold mb-4">Weekly Summary</h2>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Completed</span>
                  <span className="font-semibold">12</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Cancelled</span>
                  <span className="font-semibold text-red-600">1</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">No-show</span>
                  <span className="font-semibold text-orange-600">0</span>
                </div>
                <div className="pt-3 mt-3 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Earnings</span>
                    <span className="font-bold text-emerald-600">KES 42,500</span>
                  </div>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>

      {/* Recent Reviews */}
      <Card>
        <CardBody className="p-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Recent Reviews</h2>
            <Link href="/dashboard/practitioner/reviews" className="text-sm text-emerald-600 hover:underline">
              View all
            </Link>
          </div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                  MW
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">Mary Wanjiku</p>
                    <div className="flex">
                      {[1,2,3,4,5].map(star => (
                        <StarIcon key={star} className="h-3 w-3 text-yellow-400 fill-current" />
                      ))}
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    "Very knowledgeable and helpful. Great session!"
                  </p>
                  <p className="text-xs text-gray-400 mt-1">2 days ago</p>
                </div>
              </div>
            ))}
          </div>
        </CardBody>
      </Card>
    </div>
  )
}

// Helper Component
function QuickActionCard({ href, icon: Icon, title, description, color }: any) {
  const colors = {
    emerald: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400',
    blue: 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400',
    purple: 'bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400',
    orange: 'bg-orange-50 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400',
  }

  return (
    <Link href={href}>
      <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-2`}>
          <Icon className="h-5 w-5" />
        </div>
        <h3 className="text-sm font-medium text-gray-900 dark:text-white">{title}</h3>
        <p className="text-xs text-gray-500 mt-1">{description}</p>
      </div>
    </Link>
  )
}