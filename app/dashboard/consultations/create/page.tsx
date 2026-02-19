'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { consultationsApi, practitionersApi } from '@/app/lib/api'
import { Button } from '@/app/components/ui/Buttons'
import { Card, CardBody } from '@/app/components/ui/Card'
import Link from 'next/link'
import { Practitioner } from '@/app/types'

export default function CreateConsultationPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const practitionerId = searchParams.get('practitioner')
  
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

  useEffect(() => {
    const fetchPractitioners = async () => {
      try {
        setFetchingPractitioners(true)
        const response = await practitionersApi.getAll()
        
        // Handle different response formats
        if (Array.isArray(response)) {
          setPractitioners(response)
        } else if (response?.results) {
          setPractitioners(response.results)
        } else {
          setPractitioners([])
        }
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
    
    setLoading(true)
    setError('')
    setFieldErrors({})

    try {
      // Prepare submission data
      const submissionData = {
        practitioner: parseInt(formData.practitioner, 10),
        date: formData.date,
        time: formData.time,
        duration_minutes: parseInt(formData.duration_minutes, 10),
        ...(formData.client_notes && { client_notes: formData.client_notes }),
      }

      console.log('📝 Submitting consultation:', submissionData)
      
      const response = await consultationsApi.create(submissionData)
      console.log('✅ Consultation created:', response)
      
      router.push('/dashboard/consultations')
    } catch (err: any) {
      console.error('❌ Booking error:', err)
      
      // Handle different error formats
      if (err.response?.data) {
        // Handle field-specific errors from Django
        const errorData = err.response.data
        if (typeof errorData === 'object') {
          // Set field-specific errors
          Object.keys(errorData).forEach(key => {
            setFieldErrors(prev => ({
              ...prev,
              [key]: Array.isArray(errorData[key]) ? errorData[key][0] : errorData[key]
            }))
          })
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

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Book a Consultation</h1>
      
      <Card>
        <CardBody>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* General Error */}
            {error && (
              <div className="bg-red-50 text-red-600 p-3 rounded border border-red-200">
                <p className="font-medium">Error:</p>
                <p className="text-sm">{error}</p>
              </div>
            )}

            {/* Practitioner Select */}
            <div>
              <label htmlFor="practitioner" className="block text-sm font-medium mb-1">
                Practitioner <span className="text-red-500">*</span>
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
                className={`w-full p-2 border rounded focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                  fieldErrors.practitioner ? 'border-red-500' : 'border-gray-300'
                }`}
                required
                disabled={fetchingPractitioners || loading}
              >
                <option value="">
                  {fetchingPractitioners ? 'Loading practitioners...' : 'Select a practitioner'}
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
                <p className="text-sm text-red-600 mt-1">{fieldErrors.practitioner}</p>
              )}
              {practitioners.length === 0 && !fetchingPractitioners && (
                <p className="text-sm text-yellow-600 mt-1">
                  No practitioners available. Please check back later.
                </p>
              )}
            </div>

            {/* Date and Time */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="date" className="block text-sm font-medium mb-1">
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
                  min={new Date().toISOString().split('T')[0]}
                  className={`w-full p-2 border rounded focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                    fieldErrors.date ? 'border-red-500' : 'border-gray-300'
                  }`}
                  required
                  disabled={loading}
                />
                {fieldErrors.date && (
                  <p className="text-sm text-red-600 mt-1">{fieldErrors.date}</p>
                )}
              </div>

              <div>
                <label htmlFor="time" className="block text-sm font-medium mb-1">
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
                  className={`w-full p-2 border rounded focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                    fieldErrors.time ? 'border-red-500' : 'border-gray-300'
                  }`}
                  required
                  disabled={loading}
                />
                {fieldErrors.time && (
                  <p className="text-sm text-red-600 mt-1">{fieldErrors.time}</p>
                )}
              </div>
            </div>

            {/* Duration */}
            <div>
              <label htmlFor="duration" className="block text-sm font-medium mb-1">
                Duration <span className="text-red-500">*</span>
              </label>
              <select
                id="duration"
                value={formData.duration_minutes}
                onChange={(e) => setFormData({...formData, duration_minutes: e.target.value})}
                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                disabled={loading}
              >
                <option value="30">30 minutes</option>
                <option value="60">60 minutes</option>
                <option value="90">90 minutes</option>
              </select>
            </div>

            {/* Notes */}
            <div>
              <label htmlFor="notes" className="block text-sm font-medium mb-1">
                Notes (optional)
              </label>
              <textarea
                id="notes"
                value={formData.client_notes}
                onChange={(e) => setFormData({...formData, client_notes: e.target.value})}
                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                rows={4}
                placeholder="Any specific concerns or questions you'd like to discuss?"
                disabled={loading}
              />
            </div>

            {/* Buttons */}
            <div className="flex space-x-3 pt-4">
              <Button 
                type="submit" 
                disabled={loading || fetchingPractitioners}
                className="flex-1"
              >
                {loading ? 'Booking...' : 'Book Consultation'}
              </Button>
              <Link href="/dashboard/consultations" className="flex-1">
                <Button variant="outline" className="w-full" disabled={loading}>
                  Cancel
                </Button>
              </Link>
            </div>
          </form>
        </CardBody>
      </Card>
    </div>
  )
}