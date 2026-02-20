'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { apiClient } from '@/app/lib/api' // Changed import
import { Button } from '@/app/components/ui/Buttons'
import { Card, CardBody } from '@/app/components/ui/Card'
import Link from 'next/link'
import { Practitioner } from '@/app/types'
import { motion } from 'framer-motion'
import { ChevronLeftIcon } from '@heroicons/react/24/outline'
import { useAuth } from '@/app/contexts/AuthContext'

export default function CreateConsultationPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const practitionerId = searchParams.get('practitioner')
  const { user, isAuthenticated } = useAuth()
  
  const [formData, setFormData] = useState({
    practitioner: practitionerId || '',
    date: '',
    time: '',
    duration_minutes: '60',
    client_notes: '',
  })
  const [practitioners, setPractitioners] = useState<Practitioner[]>([])
  const [loading, setLoading] = useState(false)
  const [fetchingPractitioners, setFetchingPractitioners] = useState(true)
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login')
    }
  }, [isAuthenticated, router])

  useEffect(() => {
    const fetchPractitioners = async () => {
      try {
        setFetchingPractitioners(true)
        const response = await apiClient.practitioners.getAll()
        
        setPractitioners(Array.isArray(response) ? response : [])
      } catch (error) {
        console.error('Failed to fetch practitioners:', error)
        setError('Failed to load practitioners. Please refresh the page.')
      } finally {
        setFetchingPractitioners(false)
      }
    }
    
    fetchPractitioners()
  }, [])

  const validateForm = () => {
    const errors: Record<string, string> = {}
    
    if (!formData.practitioner) {
      errors.practitioner = 'Please select a practitioner'
    }
    if (!formData.date) {
      errors.date = 'Please select a date'
    }
    if (!formData.time) {
      errors.time = 'Please select a time'
    }
    
    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    // Check if user is authenticated and has an ID
    if (!user?.id) {
      setError('You must be logged in to book a consultation')
      return
    }
    
    setLoading(true)
    setError('')
    setFieldErrors({})

    try {
      // Prepare submission data with client field
      const submissionData = {
        practitioner: parseInt(formData.practitioner, 10),
        date: formData.date,
        time: formData.time,
        duration_minutes: parseInt(formData.duration_minutes, 10), 
        client_notes: formData.client_notes?.trim() || '',
      }

      console.log('📤 Submitting consultation:', submissionData)
      
      const response = await apiClient.consultations.create(submissionData)
      console.log('✅ Consultation created:', response)
      
      router.push('/dashboard/consultations')
    } catch (err: any) {
      console.error('❌ Booking error:', err)
      
      // Enhanced error handling
      if (err.response?.data) {
        const errorData = err.response.data
        
        if (typeof errorData === 'object') {
          // Handle field-specific errors
          Object.keys(errorData).forEach(key => {
            if (key !== 'non_field_errors' && key !== 'detail') {
              setFieldErrors(prev => ({
                ...prev,
                [key]: Array.isArray(errorData[key]) ? errorData[key][0] : errorData[key]
              }))
            }
          })
          
          // Handle general errors
          if (errorData.non_field_errors) {
            setError(Array.isArray(errorData.non_field_errors) 
              ? errorData.non_field_errors[0] 
              : errorData.non_field_errors)
          } else if (errorData.detail) {
            setError(errorData.detail)
          } else if (errorData.message) {
            setError(errorData.message)
          }
        } else {
          setError(errorData.message || 'Failed to book consultation')
        }
      } else if (err.message) {
        setError(err.message)
      } else {
        setError('Failed to book consultation. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  // Get tomorrow's date for min date
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  const minDate = tomorrow.toISOString().split('T')[0]

  // Show loading if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-600"></div>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6">
      {/* Header with back button */}
      <div className="flex items-center gap-4 mb-6">
        <Link href="/dashboard/consultations">
          <Button variant="outline" size="sm" className="!p-2 sm:!px-4">
            <ChevronLeftIcon className="h-5 w-5 sm:mr-2" />
            <span className="hidden sm:inline">Back</span>
          </Button>
        </Link>
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
          Book a Consultation
        </h1>
      </div>
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <Card>
          <CardBody className="p-4 sm:p-6">
            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
              {/* General Error */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-3 sm:p-4 rounded-xl border border-red-200 dark:border-red-800"
                >
                  <p className="text-xs sm:text-sm">{error}</p>
                </motion.div>
              )}

              {/* Practitioner Select */}
              <div>
                <label htmlFor="practitioner" className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Select Practitioner <span className="text-red-500">*</span>
                </label>
                <select
                  id="practitioner"
                  value={formData.practitioner}
                  onChange={(e) => {
                    setFormData({...formData, practitioner: e.target.value})
                    if (fieldErrors.practitioner) {
                      const { practitioner, ...rest } = fieldErrors
                      setFieldErrors(rest)
                    }
                  }}
                  className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:bg-gray-700 dark:text-white ${
                    fieldErrors.practitioner ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                  }`}
                  required
                  disabled={fetchingPractitioners || loading}
                >
                  <option value="">
                    {fetchingPractitioners ? 'Loading practitioners...' : 'Choose a practitioner'}
                  </option>
                  {practitioners.map((p) => (
                    <option key={p.id} value={p.id}>
                      Dr. {p.first_name} {p.last_name} 
                      {p.city && ` - ${p.city}`}
                      {p.hourly_rate && ` (${p.currency} ${p.hourly_rate}/hr)`}
                    </option>
                  ))}
                </select>
                {fieldErrors.practitioner && (
                  <p className="text-xs text-red-600 dark:text-red-400 mt-1.5">{fieldErrors.practitioner}</p>
                )}
              </div>

              {/* Date and Time */}
              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label htmlFor="date" className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="date"
                    type="date"
                    value={formData.date}
                    onChange={(e) => {
                      setFormData({...formData, date: e.target.value})
                      if (fieldErrors.date) {
                        const { date, ...rest } = fieldErrors
                        setFieldErrors(rest)
                      }
                    }}
                    min={minDate}
                    className={`w-full px-3 py-2.5 sm:py-3 text-sm border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:bg-gray-700 dark:text-white ${
                      fieldErrors.date ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                    }`}
                    required
                    disabled={loading}
                  />
                  {fieldErrors.date && (
                    <p className="text-xs text-red-600 dark:text-red-400 mt-1.5">{fieldErrors.date}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="time" className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    Time <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="time"
                    type="time"
                    value={formData.time}
                    onChange={(e) => {
                      setFormData({...formData, time: e.target.value})
                      if (fieldErrors.time) {
                        const { time, ...rest } = fieldErrors
                        setFieldErrors(rest)
                      }
                    }}
                    className={`w-full px-3 py-2.5 sm:py-3 text-sm border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:bg-gray-700 dark:text-white ${
                      fieldErrors.time ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                    }`}
                    required
                    disabled={loading}
                  />
                  {fieldErrors.time && (
                    <p className="text-xs text-red-600 dark:text-red-400 mt-1.5">{fieldErrors.time}</p>
                  )}
                </div>
              </div>

              {/* Duration */}
              <div>
                <label htmlFor="duration" className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Duration <span className="text-red-500">*</span>
                </label>
                <select
                  id="duration"
                  value={formData.duration_minutes}
                  onChange={(e) => setFormData({...formData, duration_minutes: e.target.value})}
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:bg-gray-700 dark:text-white"
                  disabled={loading}
                >
                  <option value="30">30 minutes</option>
                  <option value="60">60 minutes</option>
                  <option value="90">90 minutes</option>
                  <option value="120">2 hours</option>
                </select>
              </div>

              {/* Notes */}
              <div>
                <label htmlFor="notes" className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Additional Notes (optional)
                </label>
                <textarea
                  id="notes"
                  value={formData.client_notes}
                  onChange={(e) => setFormData({...formData, client_notes: e.target.value})}
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:bg-gray-700 dark:text-white"
                  rows={4}
                  placeholder="Any specific concerns or questions you'd like to discuss?"
                  disabled={loading}
                />
              </div>

              {/* Buttons */}
              <div className="flex flex-col-reverse xs:flex-row gap-3 pt-4">
                <Link href="/dashboard/consultations" className="flex-1">
                  <Button variant="outline" fullWidth disabled={loading}>
                    Cancel
                  </Button>
                </Link>
                <Button 
                  type="submit" 
                  disabled={loading || fetchingPractitioners}
                  fullWidth
                  className="flex-1"
                >
                  {loading ? 'Booking...' : 'Book Consultation'}
                </Button>
              </div>
            </form>
          </CardBody>
        </Card>
      </motion.div>
    </div>
  )
}