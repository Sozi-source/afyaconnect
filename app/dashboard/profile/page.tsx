'use client'

import { useState, useEffect } from 'react'
import { profilesApi } from '@/app/lib/api'
import { Card, CardBody } from '@/app/components/ui/Card'
import { Button } from '@/app/components/ui/Buttons'
import Link from 'next/link'
import { UserIcon, PhoneIcon, EnvelopeIcon, CalendarIcon, MapPinIcon } from '@heroicons/react/24/outline'
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
        
        // Fetch profile using the authenticated user's token
        // The API will use the token to identify the user
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
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto text-center py-12">
        <h2 className="text-2xl font-bold text-red-600 dark:text-red-400 mb-4">
          Error Loading Profile
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">{error}</p>
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

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">My Profile</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="lg:col-span-1">
          <Card>
            <CardBody>
              <div className="text-center">
                <div className="w-24 h-24 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-full mx-auto mb-4 flex items-center justify-center text-white text-2xl font-bold">
                  {displayUser.first_name?.[0]}{displayUser.last_name?.[0]}
                </div>
                <h2 className="text-xl font-semibold">
                  {displayUser.first_name} {displayUser.last_name}
                </h2>
                <p className="text-gray-500 capitalize">{profile?.role || 'User'}</p>
              </div>

              <div className="mt-6 space-y-3">
                <div className="flex items-center text-gray-600 dark:text-gray-300">
                  <EnvelopeIcon className="h-5 w-5 mr-3 text-gray-400" />
                  <span className="text-sm">{displayUser.email}</span>
                </div>
                
                <div className="flex items-center text-gray-600 dark:text-gray-300">
                  <PhoneIcon className="h-5 w-5 mr-3 text-gray-400" />
                  <span className="text-sm">{profile?.phone || 'Not provided'}</span>
                </div>

                {profile?.city && (
                  <div className="flex items-center text-gray-600 dark:text-gray-300">
                    <MapPinIcon className="h-5 w-5 mr-3 text-gray-400" />
                    <span className="text-sm">{profile.city}</span>
                  </div>
                )}

                {profile?.created_at && (
                  <div className="flex items-center text-gray-600 dark:text-gray-300">
                    <CalendarIcon className="h-5 w-5 mr-3 text-gray-400" />
                    <span className="text-sm">
                      Member since {new Date(profile.created_at).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>

              <div className="mt-6">
                <Link href="/dashboard/profile/edit">
                  <Button fullWidth>Edit Profile</Button>
                </Link>
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Details Card */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardBody>
              <h3 className="text-lg font-semibold mb-4">Account Information</h3>
              <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <dt className="text-sm text-gray-500">First Name</dt>
                  <dd className="font-medium">{displayUser.first_name || '-'}</dd>
                </div>
                <div>
                  <dt className="text-sm text-gray-500">Last Name</dt>
                  <dd className="font-medium">{displayUser.last_name || '-'}</dd>
                </div>
                <div>
                  <dt className="text-sm text-gray-500">Email</dt>
                  <dd className="font-medium">{displayUser.email || '-'}</dd>
                </div>
                <div>
                  <dt className="text-sm text-gray-500">Role</dt>
                  <dd className="font-medium capitalize">{profile?.role || 'User'}</dd>
                </div>
                <div>
                  <dt className="text-sm text-gray-500">Phone</dt>
                  <dd className="font-medium">{profile?.phone || '-'}</dd>
                </div>
                <div>
                  <dt className="text-sm text-gray-500">City</dt>
                  <dd className="font-medium">{profile?.city || '-'}</dd>
                </div>
              </dl>
            </CardBody>
          </Card>

          {profile?.bio && (
            <Card>
              <CardBody>
                <h3 className="text-lg font-semibold mb-4">About</h3>
                <p className="text-gray-600 dark:text-gray-300 whitespace-pre-line">
                  {profile.bio}
                </p>
              </CardBody>
            </Card>
          )}

          {profile?.role === 'practitioner' && (
            <Card>
              <CardBody>
                <h3 className="text-lg font-semibold mb-4">Practitioner Profile</h3>
                <div className="space-y-4">
                  {profile?.specialties && profile.specialties.length > 0 && (
                    <div>
                      <p className="text-sm text-gray-500 mb-2">Specialties</p>
                      <div className="flex flex-wrap gap-2">
                        {profile.specialties.map((spec: any) => (
                          <span key={spec.id} className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm">
                            {spec.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {profile?.hourly_rate && (
                    <div>
                      <p className="text-sm text-gray-500">Hourly Rate</p>
                      <p className="font-medium">{profile.currency} {profile.hourly_rate}/hour</p>
                    </div>
                  )}

                  {profile?.years_of_experience !== undefined && (
                    <div>
                      <p className="text-sm text-gray-500">Experience</p>
                      <p className="font-medium">{profile.years_of_experience} years</p>
                    </div>
                  )}

                  <div className="pt-4">
                    <Link href="/dashboard/practitioners/my-profile">
                      <Button variant="outline">Manage Practitioner Profile</Button>
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