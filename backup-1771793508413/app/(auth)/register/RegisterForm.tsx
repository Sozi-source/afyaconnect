'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/app/components/ui/Buttons'
import { apiClient } from '@/app/lib/api'

export default function RegisterForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const defaultRole = searchParams.get('role') || 'client'
  
  const [formData, setFormData] = useState({
    email: '',
    first_name: '',
    last_name: '',
    password: '',
    confirm_password: '',
    role: defaultRole,
    phone: '',
    bio: '',
    city: '',
    hourly_rate: '',
    years_of_experience: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
    // Clear field error when user starts typing
    if (fieldErrors[name]) {
      setFieldErrors({ ...fieldErrors, [name]: '' })
    }
  }

  const validateForm = () => {
    const errors: Record<string, string> = {}
    
    if (!formData.email) errors.email = 'Email is required'
    else if (!/\S+@\S+\.\S+/.test(formData.email)) errors.email = 'Email is invalid'
    
    if (!formData.first_name) errors.first_name = 'First name is required'
    if (!formData.last_name) errors.last_name = 'Last name is required'
    
    if (!formData.password) errors.password = 'Password is required'
    else if (formData.password.length < 8) errors.password = 'Password must be at least 8 characters'
    
    if (formData.password !== formData.confirm_password) {
      errors.confirm_password = 'Passwords do not match'
    }
    
    if (formData.role === 'practitioner') {
      if (!formData.bio) errors.bio = 'Bio is required for practitioners'
      if (!formData.city) errors.city = 'City is required'
      if (!formData.years_of_experience) errors.years_of_experience = 'Years of experience is required'
      else if (parseInt(formData.years_of_experience) < 0) errors.years_of_experience = 'Must be a positive number'
      if (formData.hourly_rate && parseFloat(formData.hourly_rate) < 0) errors.hourly_rate = 'Hourly rate must be positive'
    }
    
    return errors
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate form
    const errors = validateForm()
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors)
      setError('Please fix the errors below')
      return
    }
    
    setLoading(true)
    setError('')
    setFieldErrors({})

    // Prepare data for API
    const requestData = {
      email: formData.email,
      first_name: formData.first_name,
      last_name: formData.last_name,
      password: formData.password,
      role: formData.role as 'client' | 'practitioner',
      phone: formData.phone || undefined,
      ...(formData.role === 'practitioner' && {
        bio: formData.bio,
        city: formData.city,
        hourly_rate: formData.hourly_rate ? parseFloat(formData.hourly_rate) : undefined,
        years_of_experience: formData.years_of_experience ? parseInt(formData.years_of_experience) : undefined
      })
    }

    console.log('📤 Sending registration data:', requestData)

    try {
      const response = await apiClient.auth.register(requestData)
      console.log('📥 Registration response:', response)

      // Store auth data if returned
      if (response.token) {
        localStorage.setItem('authToken', response.token)
        localStorage.setItem('user', JSON.stringify(response))
        router.push('/client/dashboard')
      } else {
        // If no token returned (email verification required, etc.)
        router.push('/login?registered=true')
      }
    } catch (err: any) {
      console.error('❌ Registration error:', err)
      
      // Handle different types of errors
      if (err.message) {
        try {
          const errorData = JSON.parse(err.message)
          if (typeof errorData === 'object') {
            // Handle field-specific errors
            const fieldErrors: Record<string, string> = {}
            Object.keys(errorData).forEach(key => {
              if (Array.isArray(errorData[key])) {
                fieldErrors[key] = errorData[key][0]
              } else if (typeof errorData[key] === 'string') {
                fieldErrors[key] = errorData[key]
              }
            })
            setFieldErrors(fieldErrors)
            setError('Please check the errors below')
          } else {
            setError(errorData)
          }
        } catch {
          // If it's not JSON, use the message directly
          setError(err.message)
        }
      } else {
        setError('Registration failed. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="sm:mx-auto sm:w-full sm:max-w-2xl">
      <div className="bg-white dark:bg-gray-800 py-8 px-4 shadow sm:rounded-lg sm:px-10">
        <form className="space-y-6" onSubmit={handleSubmit}>
          {/* Role Selection */}
          <div>
            <label htmlFor="role" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              I want to join as <span className="text-red-500">*</span>
            </label>
            <select
              id="role"
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              <option value="client">Client</option>
              <option value="practitioner">Practitioner</option>
            </select>
          </div>

          {/* Basic Info */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              id="email"
              type="email"
              name="email"
              required
              value={formData.email}
              onChange={handleChange}
              className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white ${
                fieldErrors.email 
                  ? 'border-red-500 dark:border-red-500' 
                  : 'border-gray-300 dark:border-gray-600'
              }`}
            />
            {fieldErrors.email && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{fieldErrors.email}</p>
            )}
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="first_name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                First Name <span className="text-red-500">*</span>
              </label>
              <input
                id="first_name"
                type="text"
                name="first_name"
                required
                value={formData.first_name}
                onChange={handleChange}
                className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white ${
                  fieldErrors.first_name 
                    ? 'border-red-500 dark:border-red-500' 
                    : 'border-gray-300 dark:border-gray-600'
                }`}
              />
              {fieldErrors.first_name && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{fieldErrors.first_name}</p>
              )}
            </div>

            <div>
              <label htmlFor="last_name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Last Name <span className="text-red-500">*</span>
              </label>
              <input
                id="last_name"
                type="text"
                name="last_name"
                required
                value={formData.last_name}
                onChange={handleChange}
                className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white ${
                  fieldErrors.last_name 
                    ? 'border-red-500 dark:border-red-500' 
                    : 'border-gray-300 dark:border-gray-600'
                }`}
              />
              {fieldErrors.last_name && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{fieldErrors.last_name}</p>
              )}
            </div>
          </div>

          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Phone Number
            </label>
            <input
              id="phone"
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="+254712345678"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Format: +254712345678 (optional)
            </p>
          </div>

          {/* Password */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Password <span className="text-red-500">*</span>
              </label>
              <input
                id="password"
                type="password"
                name="password"
                required
                minLength={8}
                value={formData.password}
                onChange={handleChange}
                className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white ${
                  fieldErrors.password 
                    ? 'border-red-500 dark:border-red-500' 
                    : 'border-gray-300 dark:border-gray-600'
                }`}
              />
              {fieldErrors.password && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{fieldErrors.password}</p>
              )}
            </div>

            <div>
              <label htmlFor="confirm_password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Confirm Password <span className="text-red-500">*</span>
              </label>
              <input
                id="confirm_password"
                type="password"
                name="confirm_password"
                required
                value={formData.confirm_password}
                onChange={handleChange}
                className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white ${
                  fieldErrors.confirm_password 
                    ? 'border-red-500 dark:border-red-500' 
                    : 'border-gray-300 dark:border-gray-600'
                }`}
              />
              {fieldErrors.confirm_password && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{fieldErrors.confirm_password}</p>
              )}
            </div>
          </div>

          {/* Practitioner-only fields */}
          {formData.role === 'practitioner' && (
            <div className="space-y-6 border-t border-gray-200 dark:border-gray-700 pt-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Professional Information</h3>
              
              <div>
                <label htmlFor="bio" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Professional Bio <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="bio"
                  name="bio"
                  rows={4}
                  value={formData.bio}
                  onChange={handleChange}
                  className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white ${
                    fieldErrors.bio 
                      ? 'border-red-500 dark:border-red-500' 
                      : 'border-gray-300 dark:border-gray-600'
                  }`}
                  placeholder="Tell us about your qualifications and experience..."
                />
                {fieldErrors.bio && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{fieldErrors.bio}</p>
                )}
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="city" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    City <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="city"
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white ${
                      fieldErrors.city 
                        ? 'border-red-500 dark:border-red-500' 
                        : 'border-gray-300 dark:border-gray-600'
                    }`}
                    placeholder="Nairobi"
                  />
                  {fieldErrors.city && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">{fieldErrors.city}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="years_of_experience" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Years of Experience <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="years_of_experience"
                    type="number"
                    name="years_of_experience"
                    value={formData.years_of_experience}
                    onChange={handleChange}
                    min="0"
                    className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white ${
                      fieldErrors.years_of_experience 
                        ? 'border-red-500 dark:border-red-500' 
                        : 'border-gray-300 dark:border-gray-600'
                    }`}
                    placeholder="5"
                  />
                  {fieldErrors.years_of_experience && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">{fieldErrors.years_of_experience}</p>
                  )}
                </div>
              </div>

              <div>
                <label htmlFor="hourly_rate" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Hourly Rate (KES)
                </label>
                <input
                  id="hourly_rate"
                  type="number"
                  name="hourly_rate"
                  value={formData.hourly_rate}
                  onChange={handleChange}
                  min="0"
                  step="100"
                  className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white ${
                    fieldErrors.hourly_rate 
                      ? 'border-red-500 dark:border-red-500' 
                      : 'border-gray-300 dark:border-gray-600'
                  }`}
                  placeholder="1500"
                />
                {fieldErrors.hourly_rate && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{fieldErrors.hourly_rate}</p>
                )}
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Optional - you can set this later
                </p>
              </div>
            </div>
          )}

          {/* Error Messages */}
          {error && (
            <div className="rounded-md bg-red-50 dark:bg-red-900/20 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700 dark:text-red-200">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <Button
            type="submit"
            variant="primary"
            disabled={loading}
            className="w-full"
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Creating account...
              </div>
            ) : 'Create account'}
          </Button>
        </form>
      </div>
    </div>
  )
}