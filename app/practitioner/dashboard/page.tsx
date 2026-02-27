'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/app/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  CalendarIcon,
  ClockIcon,
  CurrencyDollarIcon,
  UserGroupIcon,
  StarIcon,
  ArrowRightIcon,
  BellIcon
} from '@heroicons/react/24/outline'
import { Card, CardBody } from '@/app/components/ui/Card'
import { Button } from '@/app/components/ui/Buttons'
import { apiClient } from '@/app/lib/api'
import type { PractitionerMetrics, Consultation, Notification, PaginatedResponse } from '@/app/types'

function extractResults<T>(data: T[] | PaginatedResponse<T> | any): T[] {
  if (Array.isArray(data)) return data as T[]
  if (data && typeof data === 'object' && 'results' in data && Array.isArray(data.results)) {
    return data.results as T[]
  }
  return []
}

export default function PractitionerDashboardPage() {
  const { user, isAuthenticated, isLoading } = useAuth()
  const router = useRouter()
  const [metrics, setMetrics] = useState<PractitionerMetrics | null>(null)
  const [recentConsultations, setRecentConsultations] = useState<Consultation[]>([])
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login')
      return
    }
    
    if (!isLoading && user?.role !== 'practitioner') {
      router.push('/client/dashboard')
      return
    }

    fetchDashboardData()
  }, [isLoading, isAuthenticated, user, router])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      
      const metricsData = await apiClient.consultations.getMetrics()
      if (metricsData && 'total_earnings' in metricsData) {
        setMetrics(metricsData as PractitionerMetrics)
      }
      
      const consultationsData = await apiClient.consultations.getMyPractitionerConsultations({
        ordering: '-date,-time',
        page_size: 5
      })
      const consultationsList = extractResults<Consultation>(consultationsData)
      setRecentConsultations(consultationsList.slice(0, 5))
      
      const notifsData = await apiClient.notifications.getAll()
      const notificationsList = extractResults<Notification>(notifsData)
      setNotifications(notificationsList.slice(0, 5))
      
      const unreadData = await apiClient.notifications.getUnreadCount()
      setUnreadCount(unreadData.unread_count)
      
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (isLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-emerald-200 border-t-emerald-600" />
      </div>
    )
  }

  if (!isAuthenticated || user?.role !== 'practitioner') return null

  const completionRate = metrics && metrics.total_consultations > 0
    ? Math.round((metrics.completed_consultations / metrics.total_consultations) * 100)
    : 0

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Welcome back, Dr. {user?.first_name}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Here's what's happening with your practice today
          </p>
        </div>
        
        <Link href="/practitioner/dashboard/notifications">
          <button className="relative p-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white">
            <BellIcon className="h-6 w-6" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </button>
        </Link>
      </div>

      {metrics && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Earnings"
            value={`KES ${metrics.total_earnings.toLocaleString()}`}
            icon={CurrencyDollarIcon}
            color="emerald"
          />
          <StatCard
            title="Consultations"
            value={metrics.total_consultations.toString()}
            icon={CalendarIcon}
            color="blue"
            subtitle={`${metrics.upcoming_consultations} upcoming`}
          />
          <StatCard
            title="Rating"
            value={metrics.average_rating.toFixed(1)}
            icon={StarIcon}
            color="yellow"
            subtitle={`${metrics.total_reviews} reviews`}
          />
          <StatCard
            title="Completion Rate"
            value={`${completionRate}%`}
            icon={UserGroupIcon}
            color="purple"
          />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardBody className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <CalendarIcon className="h-5 w-5 text-emerald-600" />
                  Recent Consultations
                </h2>
                <Link 
                  href="/practitioner/dashboard/consultations"
                  className="text-sm text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
                >
                  View All
                  <ArrowRightIcon className="h-4 w-4" />
                </Link>
              </div>

              {recentConsultations.length > 0 ? (
                <div className="space-y-3">
                  {recentConsultations.map((consultation) => (
                    <RecentConsultationItem 
                      key={consultation.id} 
                      consultation={consultation} 
                    />
                  ))}
                </div>
              ) : (
                <EmptyState
                  message="No recent consultations"
                  action={{
                    label: "Set Availability",
                    href: "/practitioner/dashboard/availability"
                  }}
                />
              )}
            </CardBody>
          </Card>
        </div>

        <div>
          <Card>
            <CardBody className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <BellIcon className="h-5 w-5 text-emerald-600" />
                  Notifications
                </h2>
                {unreadCount > 0 && (
                  <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full">
                    {unreadCount} new
                  </span>
                )}
              </div>

              {notifications.length > 0 ? (
                <div className="space-y-3">
                  {notifications.map((notification) => (
                    <NotificationItem key={notification.id} notification={notification} />
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
                  No notifications
                </p>
              )}

              <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                <h3 className="text-sm font-medium mb-3">Quick Actions</h3>
                <div className="grid grid-cols-2 gap-2">
                  <QuickAction label="Add Slot" href="/practitioner/dashboard/availability" />
                  <QuickAction label="View Schedule" href="/practitioner/dashboard/consultations" />
                  <QuickAction label="Edit Profile" href="/practitioner/dashboard/profile" />
                  <QuickAction label="View Metrics" href="/practitioner/dashboard/metrics" />
                </div>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>

      {user?.is_verified === false && (
        <Card className="bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800">
          <CardBody className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-yellow-100 dark:bg-yellow-800 rounded-full">
                  <ClockIcon className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                </div>
                <div>
                  <p className="font-medium text-yellow-800 dark:text-yellow-300">
                    Your account is pending verification
                  </p>
                  <p className="text-sm text-yellow-700 dark:text-yellow-400">
                    You'll be able to accept bookings once verified
                  </p>
                </div>
              </div>
              
              <Link href="/practitioner/dashboard/application">
                <Button variant="outline" size="sm" className="border-yellow-600 text-yellow-600">
                  Check Status
                </Button>
              </Link>
            </div>
          </CardBody>
        </Card>
      )}
    </div>
  )
}

interface StatCardProps {
  title: string
  value: string
  icon: React.ElementType
  color: 'emerald' | 'blue' | 'yellow' | 'purple' | 'red' | 'green'
  subtitle?: string
}

function StatCard({ title, value, icon: Icon, color, subtitle }: StatCardProps) {
  const colorClasses = {
    emerald: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400',
    blue: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
    yellow: 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400',
    purple: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400',
    red: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400',
    green: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400',
  }

  return (
    <Card>
      <CardBody className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">{title}</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{value}</p>
            {subtitle && (
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{subtitle}</p>
            )}
          </div>
          <div className={`p-3 rounded-xl ${colorClasses[color]}`}>
            <Icon className="h-5 w-5" />
          </div>
        </div>
      </CardBody>
    </Card>
  )
}

function RecentConsultationItem({ consultation }: { consultation: Consultation }) {
  const statusColors = {
    booked: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
    completed: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
    cancelled: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
    no_show: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300',
  }

  const status = consultation.status || 'booked'

  return (
    <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center text-white font-bold">
          {consultation.client_name?.[0] || 'C'}
        </div>
        <div>
          <p className="font-medium text-sm">{consultation.client_name || 'Client'}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {new Date(consultation.date).toLocaleDateString()} at {consultation.time?.slice(0,5) || '--:--'}
          </p>
        </div>
      </div>
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[status]}`}>
        {status}
      </span>
    </div>
  )
}

function NotificationItem({ notification }: { notification: Notification }) {
  return (
    <div className={`p-3 rounded-lg ${!notification.is_read ? 'bg-emerald-50 dark:bg-emerald-900/20' : ''}`}>
      <p className="font-medium text-sm">{notification.title}</p>
      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{notification.message}</p>
      <p className="text-xs text-gray-400 mt-1">{notification.time_ago}</p>
    </div>
  )
}

function QuickAction({ label, href }: { label: string; href: string }) {
  return (
    <Link href={href}>
      <button className="w-full p-2 text-sm bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition">
        {label}
      </button>
    </Link>
  )
}

interface EmptyStateProps {
  message: string
  action?: {
    label: string
    href: string
  }
}

function EmptyState({ message, action }: EmptyStateProps) {
  return (
    <div className="text-center py-6">
      <p className="text-sm text-gray-500 dark:text-gray-400">{message}</p>
      {action && (
        <Link href={action.href}>
          <button className="mt-3 text-sm text-emerald-600 hover:text-emerald-700 font-medium">
            {action.label}
          </button>
        </Link>
      )}
    </div>
  )
}