'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/app/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  PencilIcon,
  ArrowPathIcon,
  CheckCircleIcon,
  XCircleIcon,
  CalendarIcon,
  StarIcon
} from '@heroicons/react/24/outline'
import { Card, CardBody } from '@/app/components/ui/Card'
import { Button } from '@/app/components/ui/Buttons'
import { apiClient } from '@/app/lib/api'
import type { User, UserProfile, ClientMetrics } from '@/app/types'

export default function ClientProfilePage() {
  const { user, isAuthenticated, refreshUserProfile } = useAuth()
  const router = useRouter()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [metrics, setMetrics] = useState<ClientMetrics | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: ''
  })
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login')
      return
    }
    fetchProfileData()
  }, [isAuthenticated, router])

  const fetchProfileData = async () => {
    try {
      setLoading(true)
      
      // Fetch profile and metrics in parallel
      const [profileData, consultations] = await Promise.all([
        apiClient.profiles.getMyProfile(),
        apiClient.consultations.getMyClientConsultations().catch(() => [])
      ])
      
      setProfile(profileData)
      
      // Calculate client metrics
      const completed = consultations.filter((c: any) => c.status === 'completed')
      const upcoming = consultations.filter((c: any) => c.status === 'booked')
      const cancelled = consultations.filter((c: any) => c.status === 'cancelled')
      
      const totalSpent = completed.reduce((sum: number, c: any) => sum + (c.price || 500), 0)
      const pendingReviews = completed.filter((c: any) => !c.has_review).length

      setMetrics({
        total_consultations: consultations.length,
        completed_consultations: completed.length,
        upcoming_consultations: upcoming.length,
        cancelled_consultations: cancelled.length,
        total_spent: totalSpent,
        pending_reviews: pendingReviews
      })
      
      setFormData({
        first_name: user?.first_name || '',
        last_name: user?.last_name || '',
        email: user?.email || '',
        phone: profileData?.phone || ''
      })
    } catch (error) {
      console.error('Failed to fetch profile:', error)
      setError('Failed to load profile')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError(null)
    setSuccess(null)

    try {
      // Update profile
      await apiClient.profiles.updateMyProfile({
        phone: formData.phone || undefined
      })

      await refreshUserProfile()
      
      setSuccess('Profile updated successfully')
      setEditMode(false)
      await fetchProfileData()
    } catch (error: any) {
      console.error('Failed to update profile:', error)
      setError(error.response?.data?.message || error.message || 'Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-4">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-4 border-emerald-200 border-t-emerald-600"></div>
          <p className="text-sm text-gray-600 dark:text-gray-400">Loading profile...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">
              My Profile
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Manage your personal information
            </p>
          </div>
          <div>
            {!editMode ? (
              <Button
                onClick={() => setEditMode(true)}
                variant="outline"
                className="inline-flex items-center gap-2 px-4 py-2 text-sm border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                <PencilIcon className="h-4 w-4" />
                Edit Profile
              </Button>
            ) : (
              <Button
                onClick={() => setEditMode(false)}
                variant="outline"
                className="inline-flex items-center gap-2 px-4 py-2 text-sm border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                <XCircleIcon className="h-4 w-4" />
                Cancel
              </Button>
            )}
          </div>
        </div>

        {/* Error/Success Messages */}
        {error && (
          <div className="mb-6 p-3 sm:p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-xs sm:text-sm text-red-700 dark:text-red-300">{error}</p>
          </div>
        )}
        
        {success && (
          <div className="mb-6 p-3 sm:p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
            <p className="text-xs sm:text-sm text-green-700 dark:text-green-300">{success}</p>
          </div>
        )}

        {/* Profile Card */}
        <Card className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
          <CardBody className="p-4 sm:p-6 lg:p-8">
            {editMode ? (
              <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      First Name
                    </label>
                    <input
                      type="text"
                      name="first_name"
                      value={formData.first_name}
                      onChange={handleInputChange}
                      disabled
                      className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">Contact support to change name</p>
                  </div>

                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Last Name
                    </label>
                    <input
                      type="text"
                      name="last_name"
                      value={formData.last_name}
                      onChange={handleInputChange}
                      disabled
                      className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                    />
                  </div>

                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      disabled
                      className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                    />
                  </div>

                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="+254 123 456 789"
                      className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row sm:justify-end gap-3 pt-4">
                  <Button
                    type="submit"
                    disabled={saving}
                    className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2 text-sm"
                  >
                    {saving ? (
                      <>
                        <ArrowPathIcon className="h-4 w-4 mr-2 animate-spin inline" />
                        Saving...
                      </>
                    ) : (
                      'Save Changes'
                    )}
                  </Button>
                </div>
              </form>
            ) : (
              <div className="space-y-6 sm:space-y-8">
                {/* Profile Info Display */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-4 pb-6 border-b border-gray-200 dark:border-gray-800">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-full flex items-center justify-center text-white text-xl sm:text-2xl font-bold mx-auto sm:mx-0">
                    {user?.first_name?.[0]}{user?.last_name?.[0]}
                  </div>
                  <div className="text-center sm:text-left">
                    <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 dark:text-white">
                      {user?.first_name} {user?.last_name}
                    </h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Client</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <InfoItem
                    icon={UserIcon}
                    label="Full Name"
                    value={`${user?.first_name || ''} ${user?.last_name || ''}`}
                  />
                  <InfoItem
                    icon={EnvelopeIcon}
                    label="Email"
                    value={user?.email || ''}
                  />
                  <InfoItem
                    icon={PhoneIcon}
                    label="Phone"
                    value={profile?.phone || 'Not provided'}
                  />
                  <InfoItem
                    icon={CheckCircleIcon}
                    label="Account Status"
                    value="Active"
                    badge
                  />
                </div>

                {/* Stats Summary */}
                <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-800">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Quick Stats
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                    <StatCard 
                      label="Total Consultations" 
                      value={metrics?.total_consultations?.toString() || '0'} 
                    />
                    <StatCard 
                      label="Upcoming" 
                      value={metrics?.upcoming_consultations?.toString() || '0'} 
                    />
                    <StatCard 
                      label="Reviews Written" 
                      value={metrics?.completed_consultations?.toString() || '0'} 
                    />
                  </div>
                </div>

                {/* Recent Activity Link */}
                <div className="pt-4">
                  <Link href="/client/dashboard/metrics">
                    <Button variant="outline" fullWidth className="border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300">
                      <CalendarIcon className="h-4 w-4 mr-2" />
                      View Detailed Metrics
                    </Button>
                  </Link>
                </div>
              </div>
            )}
          </CardBody>
        </Card>
      </div>
    </div>
  )
}

interface InfoItemProps {
  icon: React.ElementType
  label: string
  value: string
  badge?: boolean
}

function InfoItem({ icon: Icon, label, value, badge = false }: InfoItemProps) {
  return (
    <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
      <Icon className="h-5 w-5 text-gray-500 dark:text-gray-500 mt-0.5 flex-shrink-0" />
      <div className="min-w-0 flex-1">
        <p className="text-xs text-gray-600 dark:text-gray-400">{label}</p>
        {badge ? (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 mt-1">
            {value}
          </span>
        ) : (
          <p className="text-sm font-medium text-gray-900 dark:text-white break-words">{value}</p>
        )}
      </div>
    </div>
  )
}

interface StatCardProps {
  label: string
  value: string
}

function StatCard({ label, value }: StatCardProps) {
  return (
    <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 text-center">
      <p className="text-xl sm:text-2xl font-bold text-emerald-600 dark:text-emerald-400">{value}</p>
      <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">{label}</p>
    </div>
  )
}