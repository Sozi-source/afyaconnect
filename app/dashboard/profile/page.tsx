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
  CalendarIcon,
  PencilIcon,
  ShieldCheckIcon,
  IdentificationIcon,
  BriefcaseIcon,
  ClockIcon
} from '@heroicons/react/24/outline'
import { Card, CardBody } from '@/app/components/ui/Card'
import { Button } from '@/app/components/ui/Buttons'

interface ExtendedUser {
  id: number
  email: string
  first_name?: string
  last_name?: string
  role?: string
  is_verified?: boolean
  is_staff?: boolean
}

interface UserProfile {
  id: number
  phone: string
  city: string
  bio: string
  role: string
  created_at: string
  specialties?: { id: number; name: string }[]
  hourly_rate?: number
  years_of_experience?: number
  currency?: string
}

export default function ProfilePage() {
  const { user, isAuthenticated } = useAuth()
  const router = useRouter()
  const extendedUser = user as ExtendedUser | null
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

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
      // Mock data - replace with API call
      const mockProfile: UserProfile = {
        id: 1,
        phone: '+254 712 345 678',
        city: 'Nairobi',
        bio: 'Passionate about helping others achieve their health goals through personalized nutrition plans.',
        role: extendedUser?.role || 'client',
        created_at: '2024-01-15',
        ...(extendedUser?.role === 'practitioner' && {
          specialties: [
            { id: 1, name: 'Clinical Nutrition' },
            { id: 2, name: 'Weight Management' }
          ],
          hourly_rate: 3500,
          years_of_experience: 5,
          currency: 'KES'
        })
      }
      setProfile(mockProfile)
    } catch (error) {
      console.error('Error fetching profile:', error)
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

  const isPractitioner = extendedUser?.role === 'practitioner'
  const fullName = `${extendedUser?.first_name || ''} ${extendedUser?.last_name || ''}`.trim() || 'User'

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
        <Link href="/dashboard/profile/edit">
          <Button className="bg-emerald-600 hover:bg-emerald-700 text-white">
            <PencilIcon className="h-4 w-4 mr-2" />
            Edit Profile
          </Button>
        </Link>
      </div>

      {/* Profile Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Avatar & Basic Info */}
        <div className="lg:col-span-1">
          <Card>
            <CardBody className="p-6">
              <div className="text-center">
                {/* Avatar */}
                <div className="w-24 h-24 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-full mx-auto mb-4 flex items-center justify-center text-white text-2xl font-bold">
                  {extendedUser?.first_name?.[0]}{extendedUser?.last_name?.[0]}
                </div>
                
                <h2 className="text-xl font-bold mb-1">{fullName}</h2>
                <p className="text-sm text-gray-500 capitalize mb-3">{profile?.role}</p>
                
                {isPractitioner && extendedUser?.is_verified && (
                  <div className="inline-flex items-center bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-xs">
                    <ShieldCheckIcon className="h-3 w-3 mr-1" />
                    Verified Practitioner
                  </div>
                )}

                {/* Quick Stats for Practitioners */}
                {isPractitioner && (
                  <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex justify-around">
                      <div className="text-center">
                        <p className="text-lg font-bold">5</p>
                        <p className="text-xs text-gray-500">Years Exp</p>
                      </div>
                      <div className="text-center">
                        <p className="text-lg font-bold">KES 3.5k</p>
                        <p className="text-xs text-gray-500">Hourly Rate</p>
                      </div>
                      <div className="text-center">
                        <p className="text-lg font-bold">45</p>
                        <p className="text-xs text-gray-500">Clients</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Right Column - Details */}
        <div className="lg:col-span-2 space-y-4">
          {/* Contact Information */}
          <Card>
            <CardBody className="p-6">
              <h3 className="text-lg font-semibold mb-4">Contact Information</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
                    <EnvelopeIcon className="h-4 w-4 text-gray-600 dark:text-gray-300" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Email</p>
                    <p className="text-sm font-medium">{extendedUser?.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
                    <PhoneIcon className="h-4 w-4 text-gray-600 dark:text-gray-300" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Phone</p>
                    <p className="text-sm font-medium">{profile?.phone || 'Not provided'}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
                    <MapPinIcon className="h-4 w-4 text-gray-600 dark:text-gray-300" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Location</p>
                    <p className="text-sm font-medium">{profile?.city || 'Not provided'}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
                    <CalendarIcon className="h-4 w-4 text-gray-600 dark:text-gray-300" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Member Since</p>
                    <p className="text-sm font-medium">
                      {new Date(profile?.created_at || '').toLocaleDateString('en-US', {
                        month: 'long',
                        year: 'numeric'
                      })}
                    </p>
                  </div>
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Bio */}
          <Card>
            <CardBody className="p-6">
              <h3 className="text-lg font-semibold mb-4">About Me</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                {profile?.bio || 'No bio added yet.'}
              </p>
            </CardBody>
          </Card>

          {/* Practitioner Details (if applicable) */}
          {isPractitioner && (
            <Card>
              <CardBody className="p-6">
                <h3 className="text-lg font-semibold mb-4">Professional Information</h3>
                
                {/* Specialties */}
                {profile?.specialties && profile.specialties.length > 0 && (
                  <div className="mb-4">
                    <p className="text-xs text-gray-500 mb-2">Specialties</p>
                    <div className="flex flex-wrap gap-2">
                      {profile.specialties.map(spec => (
                        <span key={spec.id} className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs">
                          {spec.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Rate & Experience */}
                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div>
                    <p className="text-xs text-gray-500">Hourly Rate</p>
                    <p className="text-sm font-medium">{profile?.currency} {profile?.hourly_rate}/hr</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Experience</p>
                    <p className="text-sm font-medium">{profile?.years_of_experience} years</p>
                  </div>
                </div>
              </CardBody>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}