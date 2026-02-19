'use client'

import { useState, useEffect } from 'react'
import { profilesApi } from '@/app/lib/api'
import { Card, CardBody } from '@/app/components/ui/Card'
import { Button } from '@/app/components/ui/Buttons'
import Link from 'next/link'
import { UserIcon, PhoneIcon, EnvelopeIcon, CalendarIcon, MapPinIcon, PencilIcon } from '@heroicons/react/24/outline'
import { useAuth } from '@/app/contexts/AuthContext'

export default function ProfilePage() {
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const { user: authUser } = useAuth()

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true)
        setError(null)
        
        const profileData = await profilesApi.getMyProfile()
        setProfile(profileData)
        
      } catch (error: any) {
        console.error('Failed to fetch profile:', error)
        setError(error.response?.data?.message || 'Failed to load profile')
      } finally {
        setLoading(false)
      }
    }
    
    fetchProfile()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto text-center py-12 px-4">
        <h2 className="text-xl sm:text-2xl font-bold text-red-600 dark:text-red-400 mb-4">
          Error Loading Profile
        </h2>
        <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-6">{error}</p>
        <Button onClick={() => window.location.reload()} variant="outline">
          Try Again
        </Button>
      </div>
    )
  }

  // Combine auth user and profile data
  const displayUser = {
    first_name: authUser?.first_name || profile?.user?.first_name || '',
    last_name: authUser?.last_name || profile?.user?.last_name || '',
    email: authUser?.email || profile?.user?.email || '',
  }

  const fullName = `${displayUser.first_name} ${displayUser.last_name}`.trim() || 'User'

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6">
      <h1 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6">My Profile</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Profile Card */}
        <div className="lg:col-span-1">
          <Card>
            <CardBody className="p-4 sm:p-6">
              {/* Avatar */}
              <div className="text-center">
                <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full mx-auto mb-4 flex items-center justify-center text-white text-xl sm:text-2xl font-bold">
                  {displayUser.first_name?.[0]}{displayUser.last_name?.[0]}
                </div>
                <h2 className="text-lg sm:text-xl font-semibold truncate">{fullName}</h2>
                <p className="text-sm text-gray-500 capitalize">{profile?.role || 'User'}</p>
              </div>

              {/* Contact Info */}
              <div className="mt-6 space-y-3">
                <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                  <EnvelopeIcon className="h-4 w-4 sm:h-5 sm:w-5 mr-3 text-gray-400 flex-shrink-0" />
                  <span className="truncate">{displayUser.email}</span>
                </div>
                
                <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                  <PhoneIcon className="h-4 w-4 sm:h-5 sm:w-5 mr-3 text-gray-400 flex-shrink-0" />
                  <span className="truncate">{profile?.phone || 'Not provided'}</span>
                </div>

                {profile?.city && (
                  <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                    <MapPinIcon className="h-4 w-4 sm:h-5 sm:w-5 mr-3 text-gray-400 flex-shrink-0" />
                    <span className="truncate">{profile.city}</span>
                  </div>
                )}

                {profile?.created_at && (
                  <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                    <CalendarIcon className="h-4 w-4 sm:h-5 sm:w-5 mr-3 text-gray-400 flex-shrink-0" />
                    <span className="text-sm">
                      Joined {new Date(profile.created_at).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>

              {/* Edit Button */}
              <div className="mt-6">
                <Link href="/dashboard/profile/edit">
                  <Button fullWidth className="text-sm sm:text-base">
                    <PencilIcon className="h-4 w-4 mr-2" />
                    Edit Profile
                  </Button>
                </Link>
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Details Card */}
        <div className="lg:col-span-2 space-y-4 sm:space-y-6">
          <Card>
            <CardBody className="p-4 sm:p-6">
              <h3 className="text-base sm:text-lg font-semibold mb-4">Account Information</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <dt className="text-xs text-gray-500">First Name</dt>
                  <dd className="text-sm sm:text-base font-medium">{displayUser.first_name || '-'}</dd>
                </div>
                <div>
                  <dt className="text-xs text-gray-500">Last Name</dt>
                  <dd className="text-sm sm:text-base font-medium">{displayUser.last_name || '-'}</dd>
                </div>
                <div className="sm:col-span-2">
                  <dt className="text-xs text-gray-500">Email</dt>
                  <dd className="text-sm sm:text-base font-medium break-all">{displayUser.email || '-'}</dd>
                </div>
                <div>
                  <dt className="text-xs text-gray-500">Role</dt>
                  <dd className="text-sm sm:text-base font-medium capitalize">{profile?.role || 'User'}</dd>
                </div>
                <div>
                  <dt className="text-xs text-gray-500">Phone</dt>
                  <dd className="text-sm sm:text-base font-medium">{profile?.phone || '-'}</dd>
                </div>
                <div>
                  <dt className="text-xs text-gray-500">City</dt>
                  <dd className="text-sm sm:text-base font-medium">{profile?.city || '-'}</dd>
                </div>
              </div>
            </CardBody>
          </Card>

          {profile?.bio && (
            <Card>
              <CardBody className="p-4 sm:p-6">
                <h3 className="text-base sm:text-lg font-semibold mb-4">About</h3>
                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 whitespace-pre-line">
                  {profile.bio}
                </p>
              </CardBody>
            </Card>
          )}

          {profile?.role === 'practitioner' && (
            <Card>
              <CardBody className="p-4 sm:p-6">
                <h3 className="text-base sm:text-lg font-semibold mb-4">Practitioner Profile</h3>
                <div className="space-y-4">
                  {profile?.specialties && profile.specialties.length > 0 && (
                    <div>
                      <p className="text-xs sm:text-sm text-gray-500 mb-2">Specialties</p>
                      <div className="flex flex-wrap gap-2">
                        {profile.specialties.map((spec: any) => (
                          <span key={spec.id} className="px-2 sm:px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs sm:text-sm">
                            {spec.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {profile?.hourly_rate && (
                    <div>
                      <p className="text-xs sm:text-sm text-gray-500">Hourly Rate</p>
                      <p className="text-sm sm:text-base font-medium">{profile.currency} {profile.hourly_rate}/hour</p>
                    </div>
                  )}

                  {profile?.years_of_experience !== undefined && (
                    <div>
                      <p className="text-xs sm:text-sm text-gray-500">Experience</p>
                      <p className="text-sm sm:text-base font-medium">{profile.years_of_experience} years</p>
                    </div>
                  )}

                  <div className="pt-4">
                    <Link href="/dashboard/practitioners/my-profile">
                      <Button variant="outline" size="sm" className="w-full sm:w-auto">
                        Manage Practitioner Profile
                      </Button>
                    </Link>
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