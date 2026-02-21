'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/app/contexts/AuthContext'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { 
  CalendarIcon,
  ClockIcon,
  UserGroupIcon,
  ChartBarIcon,
  CurrencyDollarIcon,
  HeartIcon,
  BriefcaseIcon,
  SparklesIcon,
  DocumentTextIcon,
  ShieldCheckIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline'
import { Card, CardBody } from '@/app/components/ui/Card'
import { Button } from '@/app/components/ui/Buttons'

// Extended user type
interface ExtendedUser {
  id: number
  email: string
  first_name?: string
  last_name?: string
  username?: string
  role?: string
  is_verified?: boolean
  is_staff?: boolean
}

export default function DashboardPage() {
  const { user } = useAuth()
  const extendedUser = user as ExtendedUser | null
  const [greeting, setGreeting] = useState('')
  const [currentTime, setCurrentTime] = useState('')

  useEffect(() => {
    // Set greeting based on time
    const hour = new Date().getHours()
    if (hour < 12) setGreeting('Good morning')
    else if (hour < 18) setGreeting('Good afternoon')
    else setGreeting('Good evening')

    // Format current time
    const now = new Date()
    setCurrentTime(now.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    }))
  }, [])

  const userRole = extendedUser?.role || 'client'
  const isPractitioner = userRole === 'practitioner' && extendedUser?.is_verified
  const isAdmin = extendedUser?.is_staff || false
  const firstName = extendedUser?.first_name || 'there'
  const fullName = extendedUser?.first_name 
    ? `${extendedUser.first_name} ${extendedUser.last_name || ''}`.trim()
    : extendedUser?.username || 'User'

  const getTimeBasedIcon = () => {
    const hour = new Date().getHours()
    if (hour < 12) return '🌅'
    if (hour < 18) return '☀️'
    return '🌙'
  }

  // Quick action cards based on role
  const getQuickActions = () => {
    if (isPractitioner) {
      return [
        {
          title: 'Manage Availability',
          description: 'Set your weekly schedule',
          href: '/dashboard/practitioner/availability',
          icon: ClockIcon,
          color: 'bg-blue-500',
          gradient: 'from-blue-500 to-blue-600'
        },
        {
          title: 'View Consultations',
          description: 'See upcoming appointments',
          href: '/dashboard/consultations',
          icon: CalendarIcon,
          color: 'bg-emerald-500',
          gradient: 'from-emerald-500 to-teal-500'
        },
        {
          title: 'Earnings Overview',
          description: 'Track your income',
          href: '/dashboard/practitioner/earnings',
          icon: CurrencyDollarIcon,
          color: 'bg-purple-500',
          gradient: 'from-purple-500 to-pink-500'
        },
        {
          title: 'Practice Profile',
          description: 'Update your information',
          href: '/dashboard/profile',
          icon: BriefcaseIcon,
          color: 'bg-amber-500',
          gradient: 'from-amber-500 to-orange-500'
        }
      ]
    } else {
      return [
        {
          title: 'Find Experts',
          description: 'Browse practitioners',
          href: '/dashboard/practitioners',
          icon: UserGroupIcon,
          color: 'bg-emerald-500',
          gradient: 'from-emerald-500 to-teal-500'
        },
        {
          title: 'My Consultations',
          description: 'View your appointments',
          href: '/dashboard/consultations',
          icon: CalendarIcon,
          color: 'bg-blue-500',
          gradient: 'from-blue-500 to-indigo-500'
        },
        {
          title: 'Saved Favorites',
          description: 'Your preferred experts',
          href: '/dashboard/favorites',
          icon: HeartIcon,
          color: 'bg-red-500',
          gradient: 'from-red-500 to-pink-500'
        },
        {
          title: 'My Profile',
          description: 'Update your details',
          href: '/dashboard/profile',
          icon: BriefcaseIcon,
          color: 'bg-purple-500',
          gradient: 'from-purple-500 to-purple-600'
        }
      ]
    }
  }

  const quickActions = getQuickActions()

  // Feature highlights based on role
  const getHighlights = () => {
    if (isPractitioner) {
      return [
        { icon: ShieldCheckIcon, text: 'Your profile is verified and visible to clients' },
        { icon: ClockIcon, text: 'Set your availability to start receiving bookings' },
        { icon: ChartBarIcon, text: 'Track your earnings and performance metrics' }
      ]
    } else {
      return [
        { icon: UserGroupIcon, text: 'Browse from 500+ verified practitioners' },
        { icon: CalendarIcon, text: 'Book consultations at your convenience' },
        { icon: HeartIcon, text: 'Save your favorite practitioners for quick access' }
      ]
    }
  }

  const highlights = getHighlights()

  return (
    <div className="space-y-6">
      {/* Welcome Section - Enhanced */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden"
      >
        <div className="bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500 rounded-2xl p-6 text-white">
          {/* Decorative Elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-20 -mt-20 blur-2xl" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-emerald-400/20 rounded-full -ml-16 -mb-16 blur-xl" />
          
          <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="text-4xl bg-white/20 rounded-2xl p-3 backdrop-blur-sm">
                {getTimeBasedIcon()}
              </div>
              <div>
                <h1 className="text-2xl font-bold mb-1">
                  {greeting}, {firstName}!
                </h1>
                <p className="text-emerald-100 flex items-center gap-2">
                  <span>{currentTime}</span>
                  <span>•</span>
                  <span className="capitalize">{userRole}</span>
                  {isPractitioner && <span className="bg-emerald-400/30 text-xs px-2 py-0.5 rounded-full">Verified</span>}
                </p>
              </div>
            </div>
            
            <div className="flex gap-2">
              <Link href="/dashboard/profile">
                <Button variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white/20">
                  View Profile
                </Button>
              </Link>
              {isAdmin && (
                <Link href="/admin">
                  <Button className="bg-white text-emerald-600 hover:bg-gray-100">
                    Admin Panel
                  </Button>
                </Link>
              )}
            </div>
          </div>

          {/* Quick Stats Row - Minimal but elegant */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-4 border-t border-white/20">
            <div>
              <p className="text-emerald-100 text-xs">Account Status</p>
              <p className="font-semibold text-sm">
                {isPractitioner ? 'Active Practitioner' : isAdmin ? 'Administrator' : 'Active Client'}
              </p>
            </div>
            <div>
              <p className="text-emerald-100 text-xs">Member Since</p>
              <p className="font-semibold text-sm">2024</p>
            </div>
            <div>
              <p className="text-emerald-100 text-xs">Email</p>
              <p className="font-semibold text-sm truncate">{extendedUser?.email}</p>
            </div>
            <div>
              <p className="text-emerald-100 text-xs">Verification</p>
              <p className="font-semibold text-sm text-emerald-200">{isPractitioner ? '✓ Verified' : '—'}</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Quick Actions Grid - Modern Card Design */}
      <div>
        <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
          <SparklesIcon className="h-5 w-5 text-emerald-500" />
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action, index) => (
            <motion.div
              key={action.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * index }}
            >
              <Link href={action.href}>
                <div className="group relative bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-all hover:-translate-y-1 cursor-pointer overflow-hidden">
                  {/* Gradient Background on Hover */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${action.gradient} opacity-0 group-hover:opacity-5 transition-opacity`} />
                  
                  <div className={`w-10 h-10 ${action.color} rounded-lg flex items-center justify-center mb-3 text-white shadow-sm`}>
                    <action.icon className="h-5 w-5" />
                  </div>
                  
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                    {action.title}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {action.description}
                  </p>
                  
                  <div className="flex items-center mt-3 text-xs font-medium text-emerald-600 dark:text-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity">
                    <span>Go to {action.title}</span>
                    <ArrowRightIcon className="h-3 w-3 ml-1" />
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Feature Highlights */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardBody className="p-5">
              <h2 className="text-lg font-semibold mb-4">Getting Started</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {highlights.map((item, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                    <div className="w-8 h-8 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                      <item.icon className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                      {item.text}
                    </p>
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>

          {/* Platform Updates */}
          <Card>
            <CardBody className="p-5">
              <h2 className="text-lg font-semibold mb-3">Platform Updates</h2>
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 bg-amber-50 dark:bg-amber-900/10 rounded-lg border border-amber-100 dark:border-amber-800">
                  <SparklesIcon className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-amber-800 dark:text-amber-300">New Features Available</p>
                    <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
                      Check out the improved booking system and enhanced practitioner profiles.
                    </p>
                  </div>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Right Column - Help & Support */}
        <div className="space-y-4">
          {/* Quick Help Card */}
          <Card className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 border-emerald-200 dark:border-emerald-800">
            <CardBody className="p-5">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-emerald-100 dark:bg-emerald-800 rounded-xl">
                  <DocumentTextIcon className="h-5 w-5 text-emerald-600 dark:text-emerald-300" />
                </div>
                <div>
                  <h3 className="font-semibold text-emerald-800 dark:text-emerald-300 mb-1">
                    Need Assistance?
                  </h3>
                  <p className="text-xs text-emerald-600 dark:text-emerald-400 mb-3">
                    Our support team is here to help you 24/7.
                  </p>
                  <div className="space-y-2">
                    <Link href="/dashboard/support">
                      <Button size="sm" variant="outline" className="border-emerald-600 text-emerald-600 w-full">
                        Visit Help Center
                      </Button>
                    </Link>
                    <Link href="/contact">
                      <Button size="sm" variant="outline" className="border-emerald-600 text-emerald-600 w-full">
                        Contact Support
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Quick Links */}
          <Card>
            <CardBody className="p-5">
              <h3 className="font-semibold mb-3">Quick Links</h3>
              <div className="space-y-2">
                <Link href="/faq" className="flex items-center justify-between p-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition">
                  <span className="text-sm">Frequently Asked Questions</span>
                  <ArrowRightIcon className="h-4 w-4 text-gray-400" />
                </Link>
                <Link href="/privacy" className="flex items-center justify-between p-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition">
                  <span className="text-sm">Privacy Policy</span>
                  <ArrowRightIcon className="h-4 w-4 text-gray-400" />
                </Link>
                <Link href="/terms" className="flex items-center justify-between p-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition">
                  <span className="text-sm">Terms of Service</span>
                  <ArrowRightIcon className="h-4 w-4 text-gray-400" />
                </Link>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>

      {/* Admin Section - Only visible to admins */}
      {isAdmin && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card>
            <CardBody className="p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Admin Dashboard</h2>
                <span className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full">Administrator Access</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <Link href="/admin/practitioners">
                  <Button variant="outline" fullWidth className="justify-start hover:border-purple-500 hover:text-purple-600">
                    <UserGroupIcon className="h-4 w-4 mr-2" />
                    Manage Practitioners
                  </Button>
                </Link>
                <Link href="/admin/applications">
                  <Button variant="outline" fullWidth className="justify-start hover:border-purple-500 hover:text-purple-600">
                    <DocumentTextIcon className="h-4 w-4 mr-2" />
                    Pending Approvals
                  </Button>
                </Link>
                <Link href="/admin/analytics">
                  <Button variant="outline" fullWidth className="justify-start hover:border-purple-500 hover:text-purple-600">
                    <ChartBarIcon className="h-4 w-4 mr-2" />
                    Analytics
                  </Button>
                </Link>
              </div>
            </CardBody>
          </Card>
        </motion.div>
      )}
    </div>
  )
}