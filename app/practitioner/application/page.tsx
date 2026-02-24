'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/app/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { ApplicationStatus } from '@/app/components/practitioners/ApplicationStatus'
import { ApplicationForm } from '@/app/components/practitioners/ApplicationForm'
import { apiClient } from '@/app/lib/api'
import type { PractitionerApplication } from '@/app/types'

export default function PractitionerApplicationPage() {
  const { user, isAuthenticated, isLoading } = useAuth()
  const router = useRouter()
  const [application, setApplication] = useState<PractitionerApplication | null>(null)
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login')
      return
    }

    if (!isLoading && user?.role !== 'practitioner') {
      router.push('/client/dashboard')
      return
    }

    if (isAuthenticated) {
      checkApplicationStatus()
    }
  }, [isLoading, isAuthenticated, user, router])

  const checkApplicationStatus = async () => {
    try {
      const status = await apiClient.practitioners.applications.getStatus()
      
      if (status.hasApplication) {
        const appData = await apiClient.practitioners.applications.getMine()
        setApplication(appData)
      } else {
        setShowForm(true)
      }
    } catch (error) {
      console.error('Failed to check application status:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleApplicationComplete = () => {
    checkApplicationStatus()
    setShowForm(false)
  }

  if (isLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-emerald-200 border-t-emerald-600"></div>
      </div>
    )
  }

  if (!isAuthenticated || user?.role !== 'practitioner') {
    return null
  }

  return (
    <div className="max-w-3xl mx-auto py-8 px-4">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold">Practitioner Application</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Complete your application to start offering consultations
        </p>
      </motion.div>

      {application && !showForm && (
        <ApplicationStatus
          status={application.status}
          professionalTitle={application.professional_title}
          submittedAt={application.submitted_at}
          canEdit={application.status === 'draft' || application.status === 'info_needed'}
          rejectionReason={application.rejection_reason}
        />
      )}

      {showForm && (
        <ApplicationForm
          initialData={application}
          onSubmit={handleApplicationComplete}
          onCancel={() => router.push('/practitioner/dashboard')}
        />
      )}

      {application?.status === 'draft' && !showForm && (
        <div className="text-center mt-4">
          <button
            onClick={() => setShowForm(true)}
            className="text-emerald-600 hover:text-emerald-700 font-medium"
          >
            Continue Application →
          </button>
        </div>
      )}
    </div>
  )
}