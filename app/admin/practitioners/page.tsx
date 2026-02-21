'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/app/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { 
  CheckCircleIcon,
  XCircleIcon,
  UserIcon,
  MapPinIcon,
  BriefcaseIcon,
  CurrencyDollarIcon,
  AcademicCapIcon,
} from '@heroicons/react/24/outline'
import { Card, CardBody } from '@/app/components/ui/Card'
import { Button } from '@/app/components/ui/Buttons'
import { apiClient } from '@/app/lib/api'
import { toast } from 'react-hot-toast'
import type { Practitioner } from '@/app/types'
import { AlertCircleIcon } from 'lucide-react'

interface ExtendedUser {
  id: number
  email: string
  is_staff?: boolean
}

export default function AdminPractitionersPage() {
  const { user, isAuthenticated } = useAuth()
  const router = useRouter()
  const extendedUser = user as ExtendedUser | null
  const [pending, setPending] = useState<Practitioner[]>([])
  const [approved, setApproved] = useState<Practitioner[]>([])
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'pending' | 'approved'>('pending')

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login')
      return
    }
    
    if (!extendedUser?.is_staff) {
      router.push('/dashboard')
      return
    }

    loadData()
  }, [isAuthenticated, extendedUser, router])

  const loadData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Fetch pending practitioners
      const pendingData = await apiClient.admin.getPendingPractitioners()
      setPending(pendingData)

      // Fetch all verified practitioners
      const allPractitioners = await apiClient.practitioners.getAll({ verified: true })
      setApproved(allPractitioners)
    } catch (error: any) {
      console.error('Error loading data:', error)
      setError(error.message || 'Failed to load practitioners')
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (id: number) => {
    try {
      setProcessing(id)
      setError(null)
      
      await apiClient.admin.approvePractitioner(id)
      
      // Update lists
      const approvedPractitioner = pending.find(p => p.id === id)
      if (approvedPractitioner) {
        setPending(prev => prev.filter(p => p.id !== id))
        setApproved(prev => [...prev, { ...approvedPractitioner, is_verified: true }])
      }
      
      toast.success('Practitioner approved successfully')
    } catch (error: any) {
      console.error('Error approving practitioner:', error)
      setError(error.message || 'Failed to approve practitioner')
      toast.error('Failed to approve practitioner')
    } finally {
      setProcessing(null)
    }
  }

  const handleReject = async (id: number) => {
    // Implement reject functionality if needed
    toast.error('Reject functionality not implemented')
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
      <div>
        <h1 className="text-2xl font-bold">Practitioner Management</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Review and approve practitioner applications
        </p>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <AlertCircleIcon className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5" />
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={() => setActiveTab('pending')}
          className={`px-4 py-2 text-sm font-medium ${
            activeTab === 'pending'
              ? 'text-emerald-600 border-b-2 border-emerald-600'
              : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'
          }`}
        >
          Pending Approval ({pending.length})
        </button>
        <button
          onClick={() => setActiveTab('approved')}
          className={`px-4 py-2 text-sm font-medium ${
            activeTab === 'approved'
              ? 'text-emerald-600 border-b-2 border-emerald-600'
              : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'
          }`}
        >
          Approved ({approved.length})
        </button>
      </div>

      {/* Pending Tab */}
      {activeTab === 'pending' && (
        <div className="space-y-4">
          {pending.length === 0 ? (
            <Card>
              <CardBody className="p-8 text-center">
                <CheckCircleIcon className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600 dark:text-gray-400">No pending approvals</p>
                <p className="text-sm text-gray-500 mt-2">
                  All caught up! Check back later.
                </p>
              </CardBody>
            </Card>
          ) : (
            pending.map((practitioner, index) => (
              <motion.div
                key={practitioner.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card>
                  <CardBody className="p-6">
                    <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
                      {/* Left - Basic Info */}
                      <div className="flex-1">
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                            {practitioner.first_name?.[0]}{practitioner.last_name?.[0]}
                          </div>
                          <div>
                            <h2 className="text-lg font-semibold">
                              Dr. {practitioner.first_name} {practitioner.last_name}
                            </h2>
                            <p className="text-sm text-gray-500">{practitioner.email}</p>
                            
                            <div className="flex flex-wrap gap-4 mt-3">
                              <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                                <MapPinIcon className="h-4 w-4 mr-1" />
                                {practitioner.city || 'Not specified'}
                              </div>
                              <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                                <BriefcaseIcon className="h-4 w-4 mr-1" />
                                {practitioner.years_of_experience} years exp
                              </div>
                              <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                                <CurrencyDollarIcon className="h-4 w-4 mr-1" />
                                KES {practitioner.hourly_rate}/hr
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Bio */}
                        {practitioner.bio && (
                          <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                            <p className="text-sm text-gray-700 dark:text-gray-300">
                              {practitioner.bio}
                            </p>
                          </div>
                        )}

                        {/* Specialties */}
                        {practitioner.specialties.length > 0 && (
                          <div className="mt-4">
                            <p className="text-xs text-gray-500 mb-2">Specialties</p>
                            <div className="flex flex-wrap gap-2">
                              {practitioner.specialties.map(spec => (
                                <span
                                  key={spec.id}
                                  className="px-2 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs"
                                >
                                  {spec.name}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Right - Actions */}
                      <div className="flex flex-row lg:flex-col gap-2">
                        <Button
                          onClick={() => handleApprove(practitioner.id)}
                          disabled={processing === practitioner.id}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white min-w-[100px]"
                        >
                          {processing === practitioner.id ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                          ) : (
                            <>
                              <CheckCircleIcon className="h-4 w-4 mr-2" />
                              Approve
                            </>
                          )}
                        </Button>
                        <Button
                          onClick={() => handleReject(practitioner.id)}
                          disabled={processing === practitioner.id}
                          variant="outline"
                          className="border-red-600 text-red-600 hover:bg-red-50"
                        >
                          <XCircleIcon className="h-4 w-4 mr-2" />
                          Reject
                        </Button>
                      </div>
                    </div>
                  </CardBody>
                </Card>
              </motion.div>
            ))
          )}
        </div>
      )}

      {/* Approved Tab */}
      {activeTab === 'approved' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {approved.map((practitioner, index) => (
            <motion.div
              key={practitioner.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card>
                <CardBody className="p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-full flex items-center justify-center text-white font-bold">
                      {practitioner.first_name?.[0]}{practitioner.last_name?.[0]}
                    </div>
                    <div>
                      <h3 className="font-semibold">Dr. {practitioner.first_name} {practitioner.last_name}</h3>
                      <p className="text-xs text-gray-500">{practitioner.city || 'Location N/A'}</p>
                    </div>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>{practitioner.specialties.length} specialties</span>
                    <span>KES {practitioner.hourly_rate}/hr</span>
                  </div>
                </CardBody>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}