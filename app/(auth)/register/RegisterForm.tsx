'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  UserIcon, 
  EnvelopeIcon, 
  LockClosedIcon,
  PhoneIcon,
  CheckCircleIcon,
  ArrowRightIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/outline'
import { apiClient } from '@/app/lib/api'

type Step = 'account' | 'personal' | 'complete'

export default function RegisterForm() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState<Step>('account')
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    first_name: '',
    last_name: '',
    phone: ''
  })
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [apiError, setApiError] = useState('')

  const steps = [
    { id: 'account', name: 'Account', icon: LockClosedIcon },
    { id: 'personal', name: 'Personal', icon: UserIcon },
    { id: 'complete', name: 'Complete', icon: CheckCircleIcon }
  ]

  const currentStepIndex = steps.findIndex(s => s.id === currentStep)

  const validateStep = (): boolean => {
    const newErrors: Record<string, string> = {}

    switch (currentStep) {
      case 'account':
        if (!formData.email) newErrors.email = 'Email is required'
        else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid'
        if (!formData.password) newErrors.password = 'Password is required'
        else if (formData.password.length < 8) newErrors.password = 'Password must be at least 8 characters'
        if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match'
        break
      case 'personal':
        if (!formData.first_name) newErrors.first_name = 'First name is required'
        if (!formData.last_name) newErrors.last_name = 'Last name is required'
        if (formData.phone && !/^\+?[\d\s-]{10,}$/.test(formData.phone)) {
          newErrors.phone = 'Invalid phone number format'
        }
        break
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = () => {
    if (validateStep()) {
      const nextIndex = currentStepIndex + 1
      if (nextIndex < steps.length) {
        setCurrentStep(steps[nextIndex].id as Step)
      }
    }
  }

  const handleBack = () => {
    const prevIndex = currentStepIndex - 1
    if (prevIndex >= 0) {
      setCurrentStep(steps[prevIndex].id as Step)
      setErrors({})
      setApiError('')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateStep()) return

    setLoading(true)
    setApiError('')

    try {
      // Prepare data for API - client only
      const registerData = {
        email: formData.email,
        password: formData.password,
        first_name: formData.first_name,
        last_name: formData.last_name,
        role: 'client' as const,
        phone: formData.phone || undefined
      }

      console.log('📤 Sending registration data:', registerData)

      // Call the API
      const response = await apiClient.auth.register(registerData)
      
      console.log('✅ Registration successful:', response)
      
      // Show success screen
      setCurrentStep('complete')
      
      // Store auth data if returned
      if (response.token) {
        localStorage.setItem('authToken', response.token)
        if (response.user) {
          localStorage.setItem('user', JSON.stringify(response.user))
        }
      }
      
      // Redirect after 2 seconds
      setTimeout(() => {
        if (response.token) {
          router.push('/client/dashboard')
        } else {
          router.push('/login?registered=true')
        }
      }, 2000)

    } catch (error: any) {
      console.error('❌ Registration failed:', error)
      
      // Handle API errors
      if (error.response?.data) {
        const apiErrors = error.response.data
        
        if (typeof apiErrors === 'object') {
          const fieldErrors: Record<string, string> = {}
          let hasFieldErrors = false
          
          Object.keys(apiErrors).forEach(key => {
            if (Array.isArray(apiErrors[key])) {
              fieldErrors[key] = apiErrors[key][0]
              hasFieldErrors = true
            } else if (typeof apiErrors[key] === 'string') {
              fieldErrors[key] = apiErrors[key]
              hasFieldErrors = true
            }
          })
          
          if (hasFieldErrors) {
            setErrors(fieldErrors)
            setApiError('Please check the errors below')
          } else if (apiErrors.message) {
            setApiError(apiErrors.message)
          } else if (apiErrors.error) {
            setApiError(apiErrors.error)
          } else {
            setApiError('Registration failed. Please try again.')
          }
        } else if (typeof apiErrors === 'string') {
          setApiError(apiErrors)
        } else {
          setApiError('Registration failed. Please try again.')
        }
      } else if (error.message) {
        setApiError(error.message)
      } else {
        setApiError('Registration failed. Please try again.')
      }
      
      // Go back to account step if there are errors
      if (currentStep !== 'account') {
        setCurrentStep('account')
      }
    } finally {
      setLoading(false)
    }
  }

  const updateFormData = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear field error when user types
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }
    // Clear general API error when user makes changes
    if (apiError) setApiError('')
  }

  return (
    <div className="py-8 px-4 sm:px-10">
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <div key={step.id} className="flex flex-col items-center relative">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${
                  index <= currentStepIndex
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/20'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                }`}
              >
                {index < currentStepIndex ? (
                  <CheckCircleIcon className="w-5 h-5" />
                ) : (
                  <step.icon className="w-4 h-4" />
                )}
              </div>
              <span className="text-xs mt-2 font-medium text-gray-600 dark:text-gray-300">
                {step.name}
              </span>
              {index < steps.length - 1 && (
                <div
                  className={`absolute top-4 left-8 w-full h-0.5 -z-10 transition-all duration-300 ${
                    index < currentStepIndex
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-500'
                      : 'bg-gray-200 dark:bg-gray-700'
                  }`}
                  style={{ width: 'calc(100% - 2rem)' }}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* API Error Message */}
      {apiError && (
        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-sm text-red-600 dark:text-red-400 text-center">{apiError}</p>
        </div>
      )}

      <form id="register-form" onSubmit={handleSubmit}>
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            {currentStep === 'account' && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Create your account
                </h3>
                
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Email address
                  </label>
                  <div className="relative">
                    <EnvelopeIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
                    <input
                      id="email"
                      form="register-form"
                      type="email"
                      autoComplete="email"
                      value={formData.email}
                      onChange={(e) => updateFormData('email', e.target.value)}
                      className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 transition ${
                        errors.email ? 'border-red-300 dark:border-red-600' : 'border-gray-300 dark:border-gray-600'
                      }`}
                      placeholder="you@example.com"
                    />
                  </div>
                  {errors.email && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.email}</p>}
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <LockClosedIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
                    <input
                      id="password"
                      form="register-form"
                      type="password"
                      autoComplete="new-password"
                      value={formData.password}
                      onChange={(e) => updateFormData('password', e.target.value)}
                      className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 transition ${
                        errors.password ? 'border-red-300 dark:border-red-600' : 'border-gray-300 dark:border-gray-600'
                      }`}
                      placeholder="••••••••"
                    />
                  </div>
                  {errors.password && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.password}</p>}
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Confirm password
                  </label>
                  <div className="relative">
                    <LockClosedIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
                    <input
                      id="confirmPassword"
                      form="register-form"
                      type="password"
                      autoComplete="new-password"
                      value={formData.confirmPassword}
                      onChange={(e) => updateFormData('confirmPassword', e.target.value)}
                      className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 transition ${
                        errors.confirmPassword ? 'border-red-300 dark:border-red-600' : 'border-gray-300 dark:border-gray-600'
                      }`}
                      placeholder="••••••••"
                    />
                  </div>
                  {errors.confirmPassword && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.confirmPassword}</p>}
                </div>
              </div>
            )}

            {currentStep === 'personal' && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Tell us about yourself
                </h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="first_name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      First name
                    </label>
                    <input
                      id="first_name"
                      form="register-form"
                      type="text"
                      autoComplete="given-name"
                      value={formData.first_name}
                      onChange={(e) => updateFormData('first_name', e.target.value)}
                      className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 transition ${
                        errors.first_name ? 'border-red-300 dark:border-red-600' : 'border-gray-300 dark:border-gray-600'
                      }`}
                      placeholder="John"
                    />
                    {errors.first_name && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.first_name}</p>}
                  </div>

                  <div>
                    <label htmlFor="last_name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Last name
                    </label>
                    <input
                      id="last_name"
                      form="register-form"
                      type="text"
                      autoComplete="family-name"
                      value={formData.last_name}
                      onChange={(e) => updateFormData('last_name', e.target.value)}
                      className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 transition ${
                        errors.last_name ? 'border-red-300 dark:border-red-600' : 'border-gray-300 dark:border-gray-600'
                      }`}
                      placeholder="Doe"
                    />
                    {errors.last_name && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.last_name}</p>}
                  </div>
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Phone number (optional)
                  </label>
                  <div className="relative">
                    <PhoneIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
                    <input
                      id="phone"
                      form="register-form"
                      type="tel"
                      autoComplete="tel"
                      value={formData.phone}
                      onChange={(e) => updateFormData('phone', e.target.value)}
                      className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 transition ${
                        errors.phone ? 'border-red-300 dark:border-red-600' : 'border-gray-300 dark:border-gray-600'
                      }`}
                      placeholder="+1 234 567 890"
                    />
                  </div>
                  {errors.phone && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.phone}</p>}
                </div>
              </div>
            )}

            {currentStep === 'complete' && (
              <div className="text-center py-8">
                <div className="relative">
                  <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-full mx-auto flex items-center justify-center">
                    <CheckCircleIcon className="w-10 h-10 text-white" />
                  </div>
                  <div className="absolute inset-0 -z-10">
                    <div className="w-20 h-20 bg-emerald-500 rounded-full mx-auto animate-ping opacity-20"></div>
                  </div>
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mt-6">
                  Registration Successful!
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">
                  Welcome, {formData.first_name}! Your account has been created.
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Redirecting to your dashboard...
                </p>
                <div className="mt-6 flex justify-center">
                  <div className="w-12 h-1 bg-emerald-200 dark:bg-emerald-800 rounded-full overflow-hidden">
                    <div className="w-1/2 h-full bg-emerald-600 dark:bg-emerald-400 rounded-full animate-slide"></div>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </form>

      {/* Navigation Buttons */}
      {currentStep !== 'complete' && (
        <div className="mt-8 flex gap-3">
          {currentStepIndex > 0 && (
            <button
              type="button"
              onClick={handleBack}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition font-medium bg-white dark:bg-gray-800"
            >
              <ArrowLeftIcon className="w-5 h-5" />
              Back
            </button>
          )}
          <button
            type={currentStepIndex === steps.length - 2 ? "submit" : "button"}
            form="register-form"
            onClick={currentStepIndex === steps.length - 2 ? undefined : handleNext}
            disabled={loading}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-white font-medium transition ${
              loading
                ? 'bg-gray-400 dark:bg-gray-600 cursor-not-allowed'
                : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700'
            }`}
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Processing...
              </>
            ) : (
              <>
                {currentStepIndex === steps.length - 2 ? 'Create Account' : 'Continue'}
                <ArrowRightIcon className="w-5 h-5" />
              </>
            )}
          </button>
        </div>
      )}

      {/* Login Link */}
      {currentStep !== 'complete' && (
        <p className="mt-6 text-center text-sm text-gray-600 dark:text-gray-300">
          Already have an account?{' '}
          <Link href="/login" className="text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 font-medium hover:underline">
            Sign in
          </Link>
        </p>
      )}
    </div>
  )
}