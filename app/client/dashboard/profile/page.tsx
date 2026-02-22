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
  XCircleIcon
} from '@heroicons/react/24/outline'
import { Card, CardBody } from '@/app/components/ui/Card'
import { Button } from '@/app/components/ui/Buttons'
import { apiClient } from '@/app/lib/api'
import type { User, UserProfile } from '@/app/types'

export default function ClientProfilePage() {
  const { user, isAuthenticated, refreshUserProfile } = useAuth()
  const router = useRouter()
  const [profile, setProfile] = useState<UserProfile | null>(null)
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
    fetchProfile()
  }, [isAuthenticated, router])

  const fetchProfile = async () => {
    try {
      setLoading(true)
      const data = await apiClient.profiles.getMyProfile()
      setProfile(data)
      
      // Initialize form data
      setFormData({
        first_name: user?.first_name || '',
        last_name: user?.last_name || '',
        email: user?.email || '',
        phone: data?.phone || ''
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
      // Update user info
      // Note: You'll need to add this endpoint to your API
      await apiClient.profiles.update(user?.id!, {
        phone: formData.phone
      })

      // Refresh user data
      await refreshUserProfile()
      
      setSuccess('Profile updated successfully')
      setEditMode(false)
      await fetchProfile()
    } catch (error: any) {
      console.error('Failed to update profile:', error)
      setError(error.message || 'Failed to update profile')
    } finally {
      setSaving(false)
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">My Profile</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage your personal information
          </p>
        </div>
        <div className="flex gap-2">
          {!editMode ? (
            <Button
              onClick={() => setEditMode(true)}
              variant="outline"
              className="flex items-center gap-2"
            >
              <PencilIcon className="h-4 w-4" />
              Edit Profile
            </Button>
          ) : (
            <Button
              onClick={() => setEditMode(false)}
              variant="outline"
              className="flex items-center gap-2"
            >
              <XCircleIcon className="h-4 w-4" />
              Cancel
            </Button>
          )}
        </div>
      </div>

      {/* Error/Success Messages */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}
      
      {success && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
          <p className="text-sm text-green-600 dark:text-green-400">{success}</p>
        </div>
      )}

      {/* Profile Card */}
      <Card>
        <CardBody className="p-6">
          {editMode ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    First Name
                  </label>
                  <input
                    type="text"
                    name="first_name"
                    value={formData.first_name}
                    onChange={handleInputChange}
                    disabled
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-700 cursor-not-allowed"
                  />
                  <p className="text-xs text-gray-500 mt-1">Contact support to change name</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Last Name
                  </label>
                  <input
                    type="text"
                    name="last_name"
                    value={formData.last_name}
                    onChange={handleInputChange}
                    disabled
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-700 cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    disabled
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-700 cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="+254 123 456 789"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent dark:bg-gray-800"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button
                  type="submit"
                  disabled={saving}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  {saving ? (
                    <>
                      <ArrowPathIcon className="h-4 w-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    'Save Changes'
                  )}
                </Button>
              </div>
            </form>
          ) : (
            <div className="space-y-6">
              {/* Profile Info Display */}
              <div className="flex items-center gap-4 pb-4 border-b border-gray-200 dark:border-gray-700">
                <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                  {user?.first_name?.[0]}{user?.last_name?.[0]}
                </div>
                <div>
                  <h2 className="text-xl font-bold">
                    {user?.first_name} {user?.last_name}
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400">Client</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold mb-3">Quick Stats</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <StatCard label="Total Consultations" value="0" />
                  <StatCard label="Upcoming" value="0" />
                  <StatCard label="Reviews Written" value="0" />
                </div>
              </div>
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  )
}

function InfoItem({ icon: Icon, label, value, badge = false }: any) {
  return (
    <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
      <Icon className="h-5 w-5 text-gray-400 mt-0.5" />
      <div>
        <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
        {badge ? (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 mt-1">
            {value}
          </span>
        ) : (
          <p className="text-sm font-medium text-gray-900 dark:text-white">{value}</p>
        )}
      </div>
    </div>
  )
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 text-center">
      <p className="text-2xl font-bold text-emerald-600">{value}</p>
      <p className="text-xs text-gray-600 dark:text-gray-400">{label}</p>
    </div>
  )
}