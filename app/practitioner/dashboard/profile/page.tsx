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
  CurrencyDollarIcon,
  BriefcaseIcon,
  AcademicCapIcon,
  PencilIcon,
  ArrowPathIcon,
  CheckCircleIcon,
  XCircleIcon,
  StarIcon
} from '@heroicons/react/24/outline'
import { Card, CardBody } from '@/app/components/ui/Card'
import { Button } from '@/app/components/ui/Buttons'
import { apiClient } from '@/app/lib/api'
import type { User, UserProfile, Practitioner, Specialty } from '@/app/types'

export default function PractitionerProfilePage() {
  const { user, isAuthenticated, refreshUserProfile } = useAuth()
  const router = useRouter()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [practitioner, setPractitioner] = useState<Practitioner | null>(null)
  const [specialties, setSpecialties] = useState<Specialty[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    bio: '',
    city: '',
    hourly_rate: '',
    years_of_experience: '',
    selectedSpecialties: [] as number[]
  })
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login')
      return
    }
    fetchData()
  }, [isAuthenticated, router])

  const fetchData = async () => {
    try {
      setLoading(true)
      
      // Fetch profile and practitioner data
      const [profileData, specialtiesData, practitionerData] = await Promise.all([
        apiClient.profiles.getMyProfile(),
        apiClient.specialties.getAll(),
        apiClient.practitioners.getMyProfile().catch(() => null)
      ])
      
      setProfile(profileData)
      setSpecialties(specialtiesData)
      setPractitioner(practitionerData)
      
      // Initialize form data
      setFormData({
        first_name: user?.first_name || '',
        last_name: user?.last_name || '',
        email: user?.email || '',
        phone: profileData?.phone || '',
        bio: practitionerData?.bio || '',
        city: practitionerData?.city || '',
        hourly_rate: practitionerData?.hourly_rate?.toString() || '',
        years_of_experience: practitionerData?.years_of_experience?.toString() || '',
        selectedSpecialties: practitionerData?.specialties?.map(s => s.id) || []
      })
    } catch (error) {
      console.error('Failed to fetch profile:', error)
      setError('Failed to load profile')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSpecialtyToggle = (specialtyId: number) => {
    setFormData(prev => ({
      ...prev,
      selectedSpecialties: prev.selectedSpecialties.includes(specialtyId)
        ? prev.selectedSpecialties.filter(id => id !== specialtyId)
        : [...prev.selectedSpecialties, specialtyId]
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError(null)
    setSuccess(null)

    try {
      // Update profile
      await apiClient.profiles.update(user?.id!, {
        phone: formData.phone
      })

      // Update practitioner profile
      if (practitioner) {
        await apiClient.practitioners.update(practitioner.id, {
          bio: formData.bio,
          city: formData.city,
          hourly_rate: parseFloat(formData.hourly_rate) || 0,
          years_of_experience: parseInt(formData.years_of_experience) || 0
        })
      }

      // Refresh user data
      await refreshUserProfile()
      
      setSuccess('Profile updated successfully')
      setEditMode(false)
      await fetchData()
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
          <h1 className="text-2xl font-bold">Practice Profile</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage your professional information
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

      {/* Verification Status */}
      {!user?.is_verified && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
          <p className="text-sm text-yellow-800 dark:text-yellow-300">
            ⏳ Your account is pending verification. You'll be able to receive bookings once verified.
          </p>
        </div>
      )}

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
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Info */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Basic Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      First Name
                    </label>
                    <input
                      type="text"
                      name="first_name"
                      value={formData.first_name}
                      disabled
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-700 cursor-not-allowed"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Last Name
                    </label>
                    <input
                      type="text"
                      name="last_name"
                      value={formData.last_name}
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
              </div>

              {/* Professional Info */}
              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold mb-3">Professional Information</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Professional Bio
                    </label>
                    <textarea
                      name="bio"
                      rows={4}
                      value={formData.bio}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent dark:bg-gray-800"
                      placeholder="Tell clients about your experience and approach..."
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        City
                      </label>
                      <input
                        type="text"
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                        placeholder="Nairobi"
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent dark:bg-gray-800"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Years Experience
                      </label>
                      <input
                        type="number"
                        name="years_of_experience"
                        value={formData.years_of_experience}
                        onChange={handleInputChange}
                        min="0"
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent dark:bg-gray-800"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Hourly Rate (KES)
                      </label>
                      <input
                        type="number"
                        name="hourly_rate"
                        value={formData.hourly_rate}
                        onChange={handleInputChange}
                        min="0"
                        step="100"
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent dark:bg-gray-800"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Specialties
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {specialties.map(specialty => (
                        <button
                          key={specialty.id}
                          type="button"
                          onClick={() => handleSpecialtyToggle(specialty.id)}
                          className={`px-3 py-1 rounded-full text-sm transition ${
                            formData.selectedSpecialties.includes(specialty.id)
                              ? 'bg-emerald-600 text-white'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300'
                          }`}
                        >
                          {specialty.name}
                        </button>
                      ))}
                    </div>
                  </div>
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
              {/* Profile Header */}
              <div className="flex items-center gap-4 pb-4 border-b border-gray-200 dark:border-gray-700">
                <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                  {user?.first_name?.[0]}{user?.last_name?.[0]}
                </div>
                <div>
                  <h2 className="text-xl font-bold">
                    Dr. {user?.first_name} {user?.last_name}
                  </h2>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-gray-600 dark:text-gray-400">Practitioner</span>
                    {user?.is_verified ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-emerald-100 text-emerald-800">
                        ✓ Verified
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                        Pending Verification
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Info Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InfoItem
                  icon={UserIcon}
                  label="Full Name"
                  value={`Dr. ${user?.first_name || ''} ${user?.last_name || ''}`}
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
                  icon={MapPinIcon}
                  label="Location"
                  value={practitioner?.city || 'Not set'}
                />
                <InfoItem
                  icon={BriefcaseIcon}
                  label="Experience"
                  value={practitioner?.years_of_experience ? `${practitioner.years_of_experience} years` : 'Not set'}
                />
                <InfoItem
                  icon={CurrencyDollarIcon}
                  label="Hourly Rate"
                  value={practitioner?.hourly_rate ? `KES ${practitioner.hourly_rate}` : 'Not set'}
                />
              </div>

              {/* Bio */}
              {practitioner?.bio && (
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">About</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{practitioner.bio}</p>
                </div>
              )}

              {/* Specialties */}
              {practitioner?.specialties && practitioner.specialties.length > 0 && (
                <div className="mt-4">
                  <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Specialties</h3>
                  <div className="flex flex-wrap gap-2">
                    {practitioner.specialties.map(specialty => (
                      <span
                        key={specialty.id}
                        className="px-3 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-300 rounded-full text-sm"
                      >
                        {specialty.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Stats */}
              <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold mb-3">Practice Stats</h3>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                  <StatCard label="Total Consultations" value="0" />
                  <StatCard label="Completed" value="0" />
                  <StatCard label="Upcoming" value="0" />
                  <StatCard label="Avg. Rating" value="0.0 ⭐" />
                </div>
              </div>
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  )
}

function InfoItem({ icon: Icon, label, value }: any) {
  return (
    <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
      <Icon className="h-5 w-5 text-gray-400 mt-0.5" />
      <div>
        <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
        <p className="text-sm font-medium text-gray-900 dark:text-white">{value}</p>
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