'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/app/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { ApplicationStatus } from '@/app/components/practitioners/ApplicationStatus'
import { ApplicationForm } from '@/app/components/practitioners/ApplicationForm'
import { apiClient } from '@/app/lib/api'
import type { PractitionerApplication } from '@/app/types'
import { 
  BriefcaseIcon, 
  CheckCircleIcon, 
  ClockIcon,
  DocumentTextIcon,
  ArrowLeftIcon,
  ShieldCheckIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline'
import Link from 'next/link'

export default function PractitionerApplicationPage() {
  const { user, isAuthenticated, isLoading } = useAuth()
  const router = useRouter()
  const [application, setApplication] = useState<PractitionerApplication | null>(null)
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login?redirect=practitioner/application')
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
        // Auto-show form for draft or info_needed
        if (appData.status === 'draft' || appData.status === 'info_needed') {
          setShowForm(true)
        }
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
      <div className="min-h-[80vh] flex items-center justify-center bg-gradient-to-br from-gray-50 to-emerald-50/30">
        <div className="text-center">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-emerald-100 border-t-emerald-600 rounded-full animate-spin mx-auto"></div>
            <BriefcaseIcon className="w-8 h-8 text-emerald-600 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
          </div>
          <p className="mt-4 text-sm font-medium text-gray-600">Loading your application...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated || user?.role !== 'practitioner') {
    return null
  }

  // Determine status color and icon
  const getStatusInfo = () => {
    if (!application) return null
    switch (application.status) {
      case 'approved':
        return { color: 'emerald', icon: CheckCircleIcon, bg: 'bg-emerald-50', text: 'text-emerald-700' }
      case 'pending':
        return { color: 'yellow', icon: ClockIcon, bg: 'bg-yellow-50', text: 'text-yellow-700' }
      case 'rejected':
        return { color: 'red', icon: ExclamationTriangleIcon, bg: 'bg-red-50', text: 'text-red-700' }
      case 'info_needed':
        return { color: 'blue', icon: DocumentTextIcon, bg: 'bg-blue-50', text: 'text-blue-700' }
      default:
        return { color: 'gray', icon: DocumentTextIcon, bg: 'bg-gray-50', text: 'text-gray-700' }
    }
  }

  const statusInfo = getStatusInfo()
  const StatusIcon = statusInfo?.icon

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-emerald-50/30 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header with breadcrumb */}
        <div className="mb-6">
          <Link 
            href="/practitioner/dashboard" 
            className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-emerald-600 transition-colors mb-4"
          >
            <ArrowLeftIcon className="w-4 h-4" />
            Back to Dashboard
          </Link>
          
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col md:flex-row md:items-center md:justify-between gap-4"
          >
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900">Practitioner Application</h1>
              <p className="text-gray-600 mt-2 max-w-2xl">
                Complete your application to start offering consultations and grow your practice
              </p>
            </div>
            
            {application && (
              <div className={`flex items-center gap-3 px-4 py-2 rounded-xl ${statusInfo?.bg}`}>
                {StatusIcon && <StatusIcon className={`w-5 h-5 ${statusInfo?.text}`} />}
                <div>
                  <p className={`text-sm font-medium ${statusInfo?.text}`}>
                    Status: <span className="capitalize">{application.status.replace('_', ' ')}</span>
                  </p>
                </div>
              </div>
            )}
          </motion.div>
        </div>

        <AnimatePresence mode="wait">
          {!application && !showForm ? (
            <motion.div
              key="welcome"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white rounded-2xl shadow-xl p-8 md:p-10 border border-gray-100"
            >
              <div className="text-center max-w-2xl mx-auto">
                <div className="w-24 h-24 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl mx-auto mb-6 flex items-center justify-center shadow-lg transform rotate-3 hover:rotate-0 transition-transform">
                  <ShieldCheckIcon className="w-12 h-12 text-white" />
                </div>
                
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Ready to Get Started?</h2>
                
                <p className="text-gray-600 mb-8">
                  Becoming a verified practitioner takes just a few minutes. Here's what you'll need:
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8 text-left">
                  <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl">
                    <div className="p-2 bg-emerald-100 rounded-lg">
                      <DocumentTextIcon className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Professional Info</h3>
                      <p className="text-sm text-gray-600">Your qualifications and experience</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <DocumentTextIcon className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">ID Document</h3>
                      <p className="text-sm text-gray-600">Government-issued ID for verification</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <DocumentTextIcon className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Certifications</h3>
                      <p className="text-sm text-gray-600">Professional certificates and licenses</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl">
                    <div className="p-2 bg-amber-100 rounded-lg">
                      <DocumentTextIcon className="w-5 h-5 text-amber-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Profile Photo</h3>
                      <p className="text-sm text-gray-600">A professional photo of yourself</p>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setShowForm(true)}
                  className="w-full md:w-auto px-8 py-4 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl font-medium hover:from-emerald-700 hover:to-teal-700 transition-all transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center justify-center gap-2 mx-auto"
                >
                  <BriefcaseIcon className="w-5 h-5" />
                  Start Your Application
                </button>

                <p className="text-xs text-gray-400 mt-6">
                  Your information is secure and will only be used for verification
                </p>
              </div>
            </motion.div>
          ) : application && !showForm ? (
            <motion.div
              key="status"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <ApplicationStatus
                status={application.status}
                professionalTitle={application.professional_title}
                submittedAt={application.submitted_at}
                canEdit={application.status === 'draft' || application.status === 'info_needed'}
                rejectionReason={application.rejection_reason}
              />

              {application.status === 'draft' && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="flex justify-center"
                >
                  <button
                    onClick={() => setShowForm(true)}
                    className="px-6 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-all transform hover:scale-105 shadow-lg flex items-center gap-2"
                  >
                    <DocumentTextIcon className="w-5 h-5" />
                    Continue Editing Application
                  </button>
                </motion.div>
              )}

              {application.status === 'info_needed' && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="flex justify-center"
                >
                  <button
                    onClick={() => setShowForm(true)}
                    className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all transform hover:scale-105 shadow-lg flex items-center gap-2"
                  >
                    <DocumentTextIcon className="w-5 h-5" />
                    Update Required Information
                  </button>
                </motion.div>
              )}

              {application.status === 'approved' && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="text-center"
                >
                  <Link
                    href="/practitioner/dashboard/availability"
                    className="inline-flex px-6 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-all transform hover:scale-105 shadow-lg items-center gap-2"
                  >
                    <BriefcaseIcon className="w-5 h-5" />
                    Set Up Your Availability
                  </Link>
                </motion.div>
              )}
            </motion.div>
          ) : showForm && (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100"
            >
              <div className="px-6 py-4 bg-gradient-to-r from-emerald-50 to-blue-50 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">
                  {application ? 'Edit Your Application' : 'Complete Your Application'}
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  Please provide accurate information to help us verify your credentials
                </p>
              </div>
              
              <div className="p-6">
                <ApplicationForm
                  initialData={application}
                  onSubmit={handleApplicationComplete}
                  onCancel={() => {
                    if (application) {
                      setShowForm(false)
                    } else {
                      router.push('/practitioner/dashboard')
                    }
                  }}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Help Section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-8 p-4 bg-white/50 backdrop-blur-sm rounded-xl border border-gray-200"
        >
          <div className="flex items-start gap-3">
            <div className="p-2 bg-emerald-100 rounded-lg">
              <ShieldCheckIcon className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-900">Need help?</h3>
              <p className="text-xs text-gray-600 mt-1">
                If you have questions about the application process, please contact our support team at{' '}
                <a href="mailto:support@example.com" className="text-emerald-600 hover:underline">
                  support@example.com
                </a>
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}