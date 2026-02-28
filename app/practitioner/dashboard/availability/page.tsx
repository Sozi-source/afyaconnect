'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/app/contexts/AuthContext'
import { Card, CardBody } from '@/app/components/ui/Card'
import { Button } from '@/app/components/ui/Buttons'
import { PractitionerAvailabilityManager } from '@/app/components/practitioners/availability/PractitionerAvailabilityManager'

export default function AvailabilityPage() {
  const { user, isLoading: authLoading } = useAuth()
  const [isMounted, setIsMounted] = useState(false)
  const [practitionerId, setPractitionerId] = useState<number | null>(null)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Get the practitioner ID from user context or use fallback
  useEffect(() => {
    if (user) {
      // Use practitioner.id if available, otherwise fallback to 3
      const id = user?.practitioner?.id || 3
      setPractitionerId(id)
      console.log('🎯 Using practitioner ID:', id)
    }
  }, [user])

  if (authLoading || !isMounted) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-emerald-200 border-t-emerald-600"></div>
      </div>
    )
  }

  if (!user) {
    return (
      <Card>
        <CardBody className="p-8 text-center">
          <p className="text-gray-600">Please log in to manage availability.</p>
          <Button onClick={() => window.location.href = '/login'} className="mt-4">
            Go to Login
          </Button>
        </CardBody>
      </Card>
    )
  }

  if (user.role !== 'practitioner' && !user.is_staff) {
    return (
      <Card>
        <CardBody className="p-8 text-center">
          <p className="text-gray-600">You need to be a practitioner to manage availability.</p>
          <Button onClick={() => window.location.href = `/${user.role}/dashboard`} className="mt-4">
            Go to Dashboard
          </Button>
        </CardBody>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Availability</h1>
        <p className="text-gray-600 mt-1">Manage your weekly schedule and time slots</p>
      </div>

      {/* Use the PractitionerAvailabilityManager component */}
      {practitionerId && (
        <PractitionerAvailabilityManager initialPractitionerId={practitionerId} />
      )}
    </div>
  )
}