// app/practitioner/dashboard/profile/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/app/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { apiClient } from '@/app/lib/api'
import { PractitionerProfile } from '@/app/components/practitioners/PractitionerProfile'
import type { Practitioner, UserProfile } from '@/app/types'

export default function PractitionerProfilePage() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth()
  const router = useRouter()
  
  const [practitioner, setPractitioner] = useState<Practitioner | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!isAuthenticated && !authLoading) {
      router.push('/login')
      return
    }

    if (user?.role !== 'practitioner') {
      router.push('/client/dashboard')
      return
    }

    if (isAuthenticated && user) {
      fetchData()
    }
  }, [isAuthenticated, user, authLoading, router])

  const fetchData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const [practitionerData, profileData] = await Promise.all([
        apiClient.practitioners.getMyProfile(),
        apiClient.profiles.getMyProfile()
      ])
      
      setPractitioner(practitionerData)
      setProfile(profileData)
    } catch (err) {
      console.error('Failed to fetch profile:', err)
      setError('Unable to load profile')
    } finally {
      setLoading(false)
    }
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-sm text-gray-500">Loading profile...</p>
        </div>
      </div>
    )
  }

  if (error || !practitioner) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="bg-white rounded-xl border border-red-200 p-8 text-center">
          <p className="text-red-600 mb-4">{error || 'Profile not found'}</p>
          <button
            onClick={fetchData}
            className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
        <p className="text-sm text-gray-500 mt-1">View your professional information</p>
      </div>
      
      <PractitionerProfile 
        practitioner={practitioner}
        profile={profile}
      />
    </div>
  )
}