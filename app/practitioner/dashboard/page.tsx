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
  StarIcon,
  UserGroupIcon,
  ChartBarIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline'
import { Card, CardBody } from '@/app/components/ui/Card'
import { Button } from '@/app/components/ui/Buttons'
import { apiClient } from '@/app/lib/api'

interface PractitionerStats {
  totalConsultations: number
  completedConsultations: number
  upcomingConsultations: number
  totalEarnings: number
  averageRating: number
  totalReviews: number
}

export default function PractitionerDashboardPage() {
  const { user, isAuthenticated, isLoading } = useAuth()
  const router = useRouter()
  const [stats, setStats] = useState<PractitionerStats>({
    totalConsultations: 0,
    completedConsultations: 0,
    upcomingConsultations: 0,
    totalEarnings: 0,
    averageRating: 0,
    totalReviews: 0
  })
  const [loading, setLoading] = useState(true)
  const [greeting, setGreeting] = useState('')

  useEffect(() => {
    // Set greeting based on time
    const hour = new Date().getHours()
    if (hour < 12) setGreeting('Good morning')
    else if (hour < 18) setGreeting('Good afternoon')
    else setGreeting('Good evening')
  }, [])

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login')
      return
    }

    if (!isLoading && user?.role !== 'practitioner') {
      router.push('/client/dashboard')
      return
    }

    if (isAuthenticated) {
      fetchDashboardData()
    }
  }, [isLoading, isAuthenticated, user, router])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      
      // Fetch metrics
      const metrics = await apiClient.consultations.getMetrics()
      
      setStats({
        totalConsultations: metrics.total_consultations || 0,
        completedConsultations: metrics.completed_consultations || 0,
        upcomingConsultations: metrics.upcoming_consultations || 0,
        totalEarnings: metrics.total_earnings || 0,
        averageRating: metrics.average_rating || 0,
        totalReviews: metrics.total_reviews || 0
      })
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (isLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-emerald-200 border-t-emerald-600"></div>
      </div>
    )
  }

  if (!isAuthenticated || user?.role !== 'practitioner') {
    return null
  }

  const quickActions = [
    {
      title: 'Manage Availability',
      description: 'Set your weekly schedule',
      href: '/practitioner/dashboard/availability',
      icon: ClockIcon,
      color: 'bg-blue-500',
      gradient: 'from-blue-500 to-blue-600'
    },
    {
      title: 'View Consultations',
      description: 'See upcoming appointments',
      href: '/practitioner/dashboard/consultations',
      icon: CalendarIcon,
      color: 'bg-emerald-500',
      gradient: 'from-emerald-500 to-teal-500'
    },
    {
      title: 'Earnings Overview',
      description: 'Track your income',
      href: '/practitioner/dashboard/earnings',
      icon: CurrencyDollarIcon,
      color: 'bg-purple-500',
      gradient: 'from-purple-500 to-pink-500'
    },
    {
      title: 'Client Reviews',
      description: 'See what clients say',
      href: '/practitioner/dashboard/reviews',
      icon: StarIcon,
      color: 'bg-amber-500',
      gradient: 'from-amber-500 to-orange-500'
    }
  ]

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-2xl p-6 text-white"
      >
        <h1 className="text-2xl font-bold mb-2">
          {greeting}, Dr. {user?.first_name}!
        </h1>
        <p className="text-emerald-100">
          Here's an overview of your practice
        </p>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard
          title="Total Consultations"
          value={stats.totalConsultations.toString()}
          icon={ChartBarIcon}
          color="emerald"
        />
        <StatCard
          title="Completed"
          value={stats.completedConsultations.toString()}
          icon={CalendarIcon}
          color="blue"
        />
        <StatCard
          title="Upcoming"
          value={stats.upcomingConsultations.toString()}
          icon={ClockIcon}
          color="purple"
        />
        <StatCard
          title="Total Earnings"
          value={`KES ${stats.totalEarnings.toLocaleString()}`}
          icon={CurrencyDollarIcon}
          color="green"
        />
        <StatCard
          title="Average Rating"
          value={stats.averageRating.toFixed(1)}
          icon={StarIcon}
          color="yellow"
        />
        <StatCard
          title="Total Reviews"
          value={stats.totalReviews.toString()}
          icon={UserGroupIcon}
          color="indigo"
        />
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-lg font-semibold mb-3">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action, index) => (
            <motion.div
              key={action.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Link href={action.href}>
                <Card hoverable>
                  <CardBody className="p-4">
                    <div className={`w-10 h-10 ${action.color} rounded-lg flex items-center justify-center mb-3 text-white`}>
                      <action.icon className="h-5 w-5" />
                    </div>
                    <h3 className="font-semibold mb-1">{action.title}</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {action.description}
                    </p>
                    <div className="flex items-center mt-3 text-xs font-medium text-emerald-600">
                      <span>Go to {action.title}</span>
                      <ArrowRightIcon className="h-3 w-3 ml-1" />
                    </div>
                  </CardBody>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardBody className="p-4">
          <h2 className="text-lg font-semibold mb-4">Recent Activity</h2>
          <p className="text-gray-500 dark:text-gray-400 text-center py-8">
            No recent activity to display
          </p>
        </CardBody>
      </Card>
    </div>
  )
}

function StatCard({ title, value, icon: Icon, color }: any) {
  const colorClasses: Record<string, string> = {
    emerald: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400',
    blue: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
    purple: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400',
    green: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400',
    yellow: 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400',
    indigo: 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400',
  }

  return (
    <Card>
      <CardBody className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">{title}</p>
            <p className="text-xl font-bold text-gray-900 dark:text-white mt-1">{value}</p>
          </div>
          <div className={`p-3 rounded-xl ${colorClasses[color]}`}>
            <Icon className="h-5 w-5" />
          </div>
        </div>
      </CardBody>
    </Card>
  )
}