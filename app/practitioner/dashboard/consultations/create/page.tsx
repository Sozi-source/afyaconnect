'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { apiClient } from '@/app/lib/api'
import { availabilityApi } from '@/app/lib/api/availability'
import { Button } from '@/app/components/ui/Buttons'
import { Card, CardBody, CardHeader } from '@/app/components/ui/Card'
import Link from 'next/link'
import { Practitioner } from '@/app/types'
import { motion } from 'framer-motion'
import { 
  ChevronLeftIcon,
  CalendarIcon,
  ClockIcon,
  UserCircleIcon,
  CurrencyDollarIcon,
  MapPinIcon,
  CheckBadgeIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline'
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
  const [availabilityMessage, setAvailabilityMessage] = useState<{text: string, type: 'success' | 'error' | 'info'} | null>(null)
  const [selectedPractitioner, setSelectedPractitioner] = useState<Practitioner | null>(null)

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
        const practitionersList = Array.isArray(response) ? response : 
          (response as any).results || []
        setPractitioners(practitionersList)
      } catch (error) {
        console.error('Failed to fetch practitioners:', error)
        setError('Failed to load practitioners. Please refresh the page.')
      } finally {
        setFetchingPractitioners(false)
      }
    }
    
    fetchPractitioners()
  }, [])

  // Update selected practitioner when ID changes
  useEffect(() => {
    if (formData.practitioner && practitioners.length > 0) {
      const practitioner = practitioners.find(p => p.id.toString() === formData.practitioner)
      setSelectedPractitioner(practitioner || null)
    } else {
      setSelectedPractitioner(null)
    }
  }, [formData.practitioner, practitioners])

  // Check availability when date/time/practitioner changes
  useEffect(() => {
    const checkAvailability = async () => {
      if (formData.practitioner && formData.date && formData.time) {
        try {
          // Format time to include seconds for API
          let formattedTime = formData.time
          if (formattedTime.split(':').length === 2) {
            formattedTime = `${formattedTime}:00`
          }

          const result = await availabilityApi.checkSlot(
            parseInt(formData.practitioner),
            formData.date,
            formattedTime
          )
          
          if (result.available) {
            setAvailabilityMessage({
              text: 'This time slot is available! ✅',
              type: 'success'
            })
          } else {
            setAvailabilityMessage({
              text: result.reason || 'This time slot is not available',
              type: 'error'
            })
          }
        } catch (err: any) {
          console.error('Error checking availability:', err)
          setAvailabilityMessage({
            text: err.message || 'Could not verify availability',
            type: 'error'
          })
        }
      } else {
        setAvailabilityMessage(null)
      }
    }

    checkAvailability()
  }, [formData.practitioner, formData.date, formData.time])

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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    
    if (!validateForm()) return

    if (!user?.id) {
      setError('You must be logged in to book a consultation')
      return
    }
    
    setLoading(true)
    setError('')
    setFieldErrors({})

    try {
      // Format time to include seconds
      let formattedTime = formData.time
      if (formattedTime.split(':').length === 2) {
        formattedTime = `${formattedTime}:00`
      }

      const submissionData = {
        practitioner: parseInt(formData.practitioner, 10),
        date: formData.date,
        time: formattedTime,
        duration_minutes: parseInt(formData.duration_minutes, 10),
        client_notes: formData.client_notes?.trim() || '',
      }

      console.log('📤 Submitting consultation:', submissionData)
      
      const response = await apiClient.consultations.create(submissionData)
      console.log('✅ Consultation created:', response)
      
      router.push('/client/dashboard/consultations?success=booking-created')
    } catch (err: any) {
      console.error('❌ Booking error:', err)
      
      if (err.response?.data) {
        const errorData = err.response.data
        console.log('Error details:', errorData)
        
        if (typeof errorData === 'object') {
          Object.keys(errorData).forEach(key => {
            if (key !== 'non_field_errors' && key !== 'detail') {
              setFieldErrors(prev => ({
                ...prev,
                [key]: Array.isArray(errorData[key]) ? errorData[key][0] : errorData[key]
              }))
            }
          })
          
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
          setError(errorData || 'Failed to book consultation')
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

  if (!isAuthenticated) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-emerald-200 border-t-emerald-600"></div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-3 sm:px-4 md:px-6 py-4 sm:py-5 md:py-6">
      {/* Header with back button */}
      <div className="flex items-center gap-3 mb-4 sm:mb-5 md:mb-6">
        <Link href="/client/dashboard/consultations">
          <Button variant="outline" size="sm" className="!p-2 sm:!px-4">
            <ChevronLeftIcon className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">Back</span>
          </Button>
        </Link>
        <div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-slate-900">Book a Consultation</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">Schedule an appointment with a verified practitioner</p>
        </div>
      </div>
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <Card>
          <CardHeader className="border-b border-slate-200 px-4 sm:px-6 py-3 sm:py-4">
            <h2 className="text-base sm:text-lg font-semibold text-slate-900">Appointment Details</h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">Fill in the information below to book your session</p>
          </CardHeader>
          <CardBody className="p-4 sm:p-6">
            <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
              {/* Error Message */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-red-50 p-3 sm:p-4 rounded-lg border border-red-200"
                >
                  <div className="flex items-start gap-2">
                    <ExclamationTriangleIcon className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                    <p className="text-xs sm:text-sm text-red-700">{error}</p>
                  </div>
                </motion.div>
              )}

              {/* Availability Message */}
              {availabilityMessage && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`p-3 sm:p-4 rounded-lg border ${
                    availabilityMessage.type === 'success' 
                      ? 'bg-green-50 border-green-200'
                      : availabilityMessage.type === 'error'
                      ? 'bg-red-50 border-red-200'
                      : 'bg-blue-50 border-blue-200'
                  }`}
                >
                  <div className="flex items-start gap-2">
                    {availabilityMessage.type === 'success' && <CheckBadgeIcon className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />}
                    {availabilityMessage.type === 'error' && <ExclamationTriangleIcon className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />}
                    {availabilityMessage.type === 'info' && <InformationCircleIcon className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />}
                    <p className={`text-xs sm:text-sm ${
                      availabilityMessage.type === 'success' ? 'text-green-700' :
                      availabilityMessage.type === 'error' ? 'text-red-700' : 'text-blue-700'
                    }`}>
                      {availabilityMessage.text}
                    </p>
                  </div>
                </motion.div>
              )}

              {/* Practitioner Select */}
              <div>
                <label htmlFor="practitioner" className="block text-xs sm:text-sm font-medium text-slate-700 mb-1.5">
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
                  className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white ${
                    fieldErrors.practitioner ? 'border-red-500' : 'border-slate-300'
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
                      {p.hourly_rate && ` (KES ${p.hourly_rate}/hr)`}
                    </option>
                  ))}
                </select>
                {fieldErrors.practitioner && (
                  <p className="text-xs text-red-600 mt-1.5 flex items-center gap-1">
                    <ExclamationTriangleIcon className="h-3 w-3" />
                    {fieldErrors.practitioner}
                  </p>
                )}
              </div>

              {/* Selected Practitioner Info (if any) */}
              {selectedPractitioner && (
                <div className="bg-emerald-50 p-3 sm:p-4 rounded-lg border border-emerald-200">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <UserCircleIcon className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-900">
                        Dr. {selectedPractitioner.first_name} {selectedPractitioner.last_name}
                      </p>
                      <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1 text-xs">
                        {selectedPractitioner.city && (
                          <span className="flex items-center gap-1 text-slate-600">
                            <MapPinIcon className="h-3 w-3" />
                            {selectedPractitioner.city}
                          </span>
                        )}
                        {selectedPractitioner.hourly_rate && (
                          <span className="flex items-center gap-1 text-slate-600">
                            <CurrencyDollarIcon className="h-3 w-3" />
                            KES {selectedPractitioner.hourly_rate}/hr
                          </span>
                        )}
                        {selectedPractitioner.years_of_experience && (
                          <span className="flex items-center gap-1 text-slate-600">
                            <ClockIcon className="h-3 w-3" />
                            {selectedPractitioner.years_of_experience} years exp
                          </span>
                        )}
                      </div>
                    </div>
                    {selectedPractitioner.is_verified && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-emerald-100 text-emerald-800">
                        ✓ Verified
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Date and Time */}
              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label htmlFor="date" className="block text-xs sm:text-sm font-medium text-slate-700 mb-1.5">
                    Date <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <CalendarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
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
                      className={`w-full pl-9 pr-3 py-2.5 sm:py-3 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                        fieldErrors.date ? 'border-red-500' : 'border-slate-300'
                      }`}
                      required
                      disabled={loading}
                    />
                  </div>
                  {fieldErrors.date && (
                    <p className="text-xs text-red-600 mt-1.5 flex items-center gap-1">
                      <ExclamationTriangleIcon className="h-3 w-3" />
                      {fieldErrors.date}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="time" className="block text-xs sm:text-sm font-medium text-slate-700 mb-1.5">
                    Time <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <ClockIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
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
                      className={`w-full pl-9 pr-3 py-2.5 sm:py-3 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                        fieldErrors.time ? 'border-red-500' : 'border-slate-300'
                      }`}
                      required
                      disabled={loading}
                    />
                  </div>
                  {fieldErrors.time && (
                    <p className="text-xs text-red-600 mt-1.5 flex items-center gap-1">
                      <ExclamationTriangleIcon className="h-3 w-3" />
                      {fieldErrors.time}
                    </p>
                  )}
                </div>
              </div>

              {/* Duration */}
              <div>
                <label htmlFor="duration" className="block text-xs sm:text-sm font-medium text-slate-700 mb-1.5">
                  Duration <span className="text-red-500">*</span>
                </label>
                <select
                  id="duration"
                  value={formData.duration_minutes}
                  onChange={(e) => setFormData({...formData, duration_minutes: e.target.value})}
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
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
                <label htmlFor="notes" className="block text-xs sm:text-sm font-medium text-slate-700 mb-1.5">
                  Additional Notes (optional)
                </label>
                <textarea
                  id="notes"
                  value={formData.client_notes}
                  onChange={(e) => setFormData({...formData, client_notes: e.target.value})}
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  rows={4}
                  placeholder="Any specific concerns or questions you'd like to discuss?"
                  disabled={loading}
                />
              </div>

              {/* Security Notice */}
              <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                <div className="flex items-start gap-2">
                  <ShieldCheckIcon className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-blue-700">
                    Your consultation will be secure and end-to-end encrypted. You'll receive a meeting link via email and SMS.
                  </p>
                </div>
              </div>

              {/* Buttons */}
              <div className="flex flex-col xs:flex-row gap-3 pt-4">
                <Link href="/client/dashboard/consultations" className="flex-1">
                  <Button variant="outline" fullWidth disabled={loading} className="py-2.5 sm:py-3">
                    Cancel
                  </Button>
                </Link>
                <Button 
                  type="submit" 
                  disabled={loading || fetchingPractitioners || (availabilityMessage?.type === 'error')}
                  fullWidth
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 sm:py-3"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></span>
                      Booking...
                    </span>
                  ) : (
                    'Book Consultation'
                  )}
                </Button>
              </div>
            </form>
          </CardBody>
        </Card>
      </motion.div>

      <style jsx>{`
        @media (max-width: 480px) {
          .xs\\:flex-row {
            flex-direction: row;
          }
        }
      `}</style>
    </div>
  )
}