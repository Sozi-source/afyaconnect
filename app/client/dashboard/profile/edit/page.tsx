// app/components/client/dashboard/profile/edit/EditProfilePage.tsx
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
  MapPinIcon,
  BriefcaseIcon,
  CameraIcon,
  ArrowLeftIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline'
import { Card, CardBody, CardHeader } from '@/app/components/ui/Card'
import { Button } from '@/app/components/ui/Buttons'
import { apiClient } from '@/app/lib/api'
import { toast } from 'react-hot-toast'
import type { UserProfile } from '@/app/types'

export default function EditProfilePage() {
  const { user, isAuthenticated, isLoading: authLoading, refreshUserProfile } = useAuth()
  const router = useRouter()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    city: '',
    bio: '',
  })

  // Handle auth loading state
  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-200 border-t-primary-600"></div>
      </div>
    )
  }

  // Redirect if not authenticated
  if (!isAuthenticated || !user) {
    router.push('/login')
    return null
  }

  useEffect(() => {
    loadProfile()
  }, [])

  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        email: user.email || '',
      }))
    }
  }, [user])

  useEffect(() => {
    if (profile) {
      setFormData(prev => ({
        ...prev,
        phone: profile.phone || '',
        city: profile.city || '',
        bio: profile.bio || '',
      }))
    }
  }, [profile])

  const loadProfile = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await apiClient.profiles.getMyProfile()
      setProfile(data)
    } catch (error: any) {
      console.error('Error loading profile:', error)
      setError(error.message || 'Failed to load profile')
      toast.error('Failed to load profile')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      setSaving(true)
      setError(null)
      setSuccess(null)

      const updateData = {
        phone: formData.phone,
        city: formData.city,
        bio: formData.bio,
      }

      await apiClient.profiles.updateMyProfile(updateData)
      await refreshUserProfile()
      
      setSuccess('Profile updated successfully!')
      toast.success('Profile updated successfully!')
      
      setTimeout(() => {
        router.push('/client/dashboard/profile')
      }, 1500)
      
    } catch (error: any) {
      console.error('Error updating profile:', error)
      setError(error.message || 'Failed to update profile')
      toast.error('Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-200 border-t-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 px-4 py-4 sm:py-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          href="/client/dashboard/profile"
          className="p-2 hover:bg-neutral-100 rounded-lg transition"
        >
          <ArrowLeftIcon className="h-5 w-5 text-neutral-500" />
        </Link>
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-neutral-900">Edit Profile</h1>
          <p className="text-xs sm:text-sm text-neutral-500 mt-1">
            Update your personal information
          </p>
        </div>
      </div>

      {/* Success Message */}
      {success && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-start gap-3"
        >
          <CheckCircleIcon className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-green-700">{success}</p>
        </motion.div>
      )}

      {/* Error Message */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3"
        >
          <XCircleIcon className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-700">{error}</p>
        </motion.div>
      )}

      {/* Profile Form */}
      <Card className="border-neutral-200">
        <CardBody className="p-4 sm:p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Profile Picture */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 pb-6 border-b border-neutral-200">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center text-white text-xl sm:text-2xl font-bold mx-auto sm:mx-0 shadow-sm">
                {formData.first_name?.[0]}{formData.last_name?.[0]}
              </div>
              <div className="flex-1 text-center sm:text-left">
                <p className="text-sm font-medium text-neutral-900">Profile Photo</p>
                <p className="text-xs text-neutral-500 mt-1">
                  This is generated from your initials
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled
                className="w-full sm:w-auto border-neutral-200 text-neutral-400 cursor-not-allowed"
              >
                <CameraIcon className="h-4 w-4 mr-2" />
                Coming Soon
              </Button>
            </div>

            {/* Personal Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs sm:text-sm font-medium text-neutral-700 mb-1">
                  First Name
                </label>
                <input
                  type="text"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleInputChange}
                  disabled
                  className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-neutral-400 cursor-not-allowed"
                />
                <p className="text-xs text-neutral-400 mt-1">Contact support to change name</p>
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-neutral-700 mb-1">
                  Last Name
                </label>
                <input
                  type="text"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleInputChange}
                  disabled
                  className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-neutral-400 cursor-not-allowed"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs sm:text-sm font-medium text-neutral-700 mb-1">
                Email Address
              </label>
              <div className="relative">
                <EnvelopeIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-neutral-400" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  disabled
                  className="w-full pl-10 pr-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-neutral-400 cursor-not-allowed"
                />
              </div>
            </div>

            {/* Phone */}
            <div>
              <label className="block text-xs sm:text-sm font-medium text-neutral-700 mb-1">
                Phone Number
              </label>
              <div className="relative">
                <PhoneIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-neutral-400" />
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="+254 712 345 678"
                  className="w-full pl-10 pr-4 py-2.5 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white text-neutral-900 placeholder-neutral-400"
                />
              </div>
            </div>

            {/* City */}
            <div>
              <label className="block text-xs sm:text-sm font-medium text-neutral-700 mb-1">
                City
              </label>
              <div className="relative">
                <MapPinIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-neutral-400" />
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  placeholder="Nairobi"
                  className="w-full pl-10 pr-4 py-2.5 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white text-neutral-900 placeholder-neutral-400"
                />
              </div>
            </div>

            {/* Bio */}
            <div>
              <label className="block text-xs sm:text-sm font-medium text-neutral-700 mb-1">
                Bio
              </label>
              <div className="relative">
                <BriefcaseIcon className="absolute left-3 top-3 h-5 w-5 text-neutral-400" />
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleInputChange}
                  rows={4}
                  placeholder="Tell us a little about yourself..."
                  className="w-full pl-10 pr-4 py-2.5 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white text-neutral-900 placeholder-neutral-400 resize-none"
                />
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex flex-col sm:flex-row sm:justify-end gap-3 pt-4 border-t border-neutral-200">
              <Link href="/client/dashboard/profile" className="w-full sm:w-auto">
                <Button variant="outline" type="button" fullWidth className="sm:w-auto border-neutral-200">
                  Cancel
                </Button>
              </Link>
              <Button
                type="submit"
                disabled={saving}
                fullWidth
                className="sm:w-auto bg-primary-600 hover:bg-primary-700 text-white min-w-[120px] shadow-sm"
              >
                {saving ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mx-auto" />
                ) : (
                  'Save Changes'
                )}
              </Button>
            </div>
          </form>
        </CardBody>
      </Card>
    </div>
  )
}