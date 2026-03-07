'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  UserIcon, EnvelopeIcon, LockClosedIcon, PhoneIcon,
  CheckCircleIcon, ArrowRightIcon, ArrowLeftIcon,
  BriefcaseIcon, UserGroupIcon
} from '@heroicons/react/24/outline'
import { apiClient } from '@/app/lib/api'
import type { RegisterData } from '@/app/types'

type Step = 'role' | 'account' | 'personal' | 'complete'
type UserRole = 'client' | 'practitioner' // Removed null

export default function RegisterForm() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState<Step>('role')
  const [userRole, setUserRole] = useState<UserRole | null>(null) // Allow null for initial state
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
    { id: 'role', name: 'Role', icon: UserGroupIcon },
    { id: 'account', name: 'Account', icon: LockClosedIcon },
    { id: 'personal', name: 'Personal', icon: UserIcon },
    { id: 'complete', name: 'Complete', icon: CheckCircleIcon }
  ]

  const currentStepIndex = steps.findIndex(s => s.id === currentStep)

  const validateStep = (): boolean => {
    const newErrors: Record<string, string> = {}
    
    switch (currentStep) {
      case 'role':
        if (!userRole) newErrors.role = 'Please select an account type'
        break
        
      case 'account':
        if (!formData.email) newErrors.email = 'Email is required'
        else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Please enter a valid email'
        
        if (!formData.password) newErrors.password = 'Password is required'
        else if (formData.password.length < 8) newErrors.password = 'Password must be at least 8 characters'
        
        if (formData.password !== formData.confirmPassword) {
          newErrors.confirmPassword = 'Passwords do not match'
        }
        break
        
      case 'personal':
        if (!formData.first_name) newErrors.first_name = 'First name is required'
        if (!formData.last_name) newErrors.last_name = 'Last name is required'
        break
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = () => {
    if (validateStep()) {
      const nextIndex = currentStepIndex + 1
      if (nextIndex < steps.length) setCurrentStep(steps[nextIndex].id as Step)
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
    if (!validateStep() || !userRole) return // Add check for userRole

    setLoading(true)
    setApiError('')

    try {
      const registerData: RegisterData = {
        email: formData.email,
        password: formData.password,
        first_name: formData.first_name,
        last_name: formData.last_name,
        role: userRole, // Now this is guaranteed to be 'client' | 'practitioner'
        phone: formData.phone || undefined
      }

      const response = await apiClient.auth.register(registerData)
      
      setCurrentStep('complete')
      
      if (response.token) {
        localStorage.setItem('authToken', response.token)
        if (response.user) localStorage.setItem('user', JSON.stringify(response.user))
      }
      
      setTimeout(() => {
        if (userRole === 'practitioner') {
          router.push('/practitioner/application')
        } else if (response.token) {
          router.push('/client/dashboard')
        } else {
          router.push('/login?registered=true')
        }
      }, 2000)

    } catch (error: any) {
      setApiError(error.response?.data?.message || 'Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const updateFormData = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      const updated = { ...errors }
      delete updated[field]
      setErrors(updated)
    }
    if (apiError) setApiError('')
  }

  return (
    <div className="py-8 px-4 sm:px-10">
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <div key={step.id} className="flex flex-col items-center relative">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                index <= currentStepIndex
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white'
                  : 'bg-gray-200 text-gray-500'
              }`}>
                {index < currentStepIndex ? <CheckCircleIcon className="w-5 h-5" /> : <step.icon className="w-4 h-4" />}
              </div>
              <span className="text-xs mt-2 font-medium text-gray-600">{step.name}</span>
              {index < steps.length - 1 && (
                <div className={`absolute top-4 left-8 w-full h-0.5 -z-10 ${
                  index < currentStepIndex ? 'bg-gradient-to-r from-emerald-500 to-teal-500' : 'bg-gray-200'
                }`} style={{ width: 'calc(100% - 2rem)' }} />
              )}
            </div>
          ))}
        </div>
      </div>

      {apiError && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600 text-center">{apiError}</p>
        </div>
      )}

      <form id="register-form" onSubmit={handleSubmit}>
        <AnimatePresence mode="wait">
          <motion.div 
            key={currentStep} 
            initial={{ opacity: 0, x: 20 }} 
            animate={{ opacity: 1, x: 0 }} 
            exit={{ opacity: 0, x: -20 }} 
            className="space-y-6"
          >
            
            {currentStep === 'role' && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Choose your account type</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <button 
                    type="button" 
                    onClick={() => setUserRole('client')} 
                    className={`p-6 border-2 rounded-xl text-left transition-all ${
                      userRole === 'client' 
                        ? 'border-emerald-500 bg-emerald-50 shadow-md' 
                        : 'border-gray-200 hover:border-emerald-300 hover:bg-gray-50'
                    }`}
                  >
                    <UserIcon className="w-8 h-8 text-emerald-600 mb-3" />
                    <h4 className="font-semibold text-lg">Client</h4>
                    <p className="text-sm text-gray-600 mt-1">Book consultations with health experts</p>
                  </button>
                  
                  <button 
                    type="button" 
                    onClick={() => setUserRole('practitioner')} 
                    className={`p-6 border-2 rounded-xl text-left transition-all ${
                      userRole === 'practitioner' 
                        ? 'border-emerald-500 bg-emerald-50 shadow-md' 
                        : 'border-gray-200 hover:border-emerald-300 hover:bg-gray-50'
                    }`}
                  >
                    <BriefcaseIcon className="w-8 h-8 text-emerald-600 mb-3" />
                    <h4 className="font-semibold text-lg">Practitioner</h4>
                    <p className="text-sm text-gray-600 mt-1">Offer health consultations and services</p>
                  </button>
                </div>
                {errors.role && <p className="text-sm text-red-600 text-center">{errors.role}</p>}
              </div>
            )}

            {currentStep === 'account' && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Create your account</h3>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Email Address</label>
                  <div className="relative">
                    <EnvelopeIcon className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                    <input 
                      type="email" 
                      value={formData.email}
                      onChange={(e) => updateFormData('email', e.target.value)}
                      className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-emerald-500 ${
                        errors.email ? 'border-red-300' : 'border-gray-300'
                      }`} 
                      placeholder="you@example.com" 
                    />
                  </div>
                  {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Password</label>
                  <div className="relative">
                    <LockClosedIcon className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                    <input 
                      type="password" 
                      value={formData.password}
                      onChange={(e) => updateFormData('password', e.target.value)}
                      className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-emerald-500 ${
                        errors.password ? 'border-red-300' : 'border-gray-300'
                      }`} 
                      placeholder="••••••••" 
                    />
                  </div>
                  {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Confirm Password</label>
                  <div className="relative">
                    <LockClosedIcon className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                    <input 
                      type="password" 
                      value={formData.confirmPassword}
                      onChange={(e) => updateFormData('confirmPassword', e.target.value)}
                      className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-emerald-500 ${
                        errors.confirmPassword ? 'border-red-300' : 'border-gray-300'
                      }`} 
                      placeholder="••••••••" 
                    />
                  </div>
                  {errors.confirmPassword && <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>}
                </div>
              </div>
            )}

            {currentStep === 'personal' && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Tell us about yourself</h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">First Name</label>
                    <input 
                      type="text" 
                      value={formData.first_name} 
                      onChange={(e) => updateFormData('first_name', e.target.value)}
                      className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-emerald-500 ${
                        errors.first_name ? 'border-red-300' : 'border-gray-300'
                      }`} 
                      placeholder="John" 
                    />
                    {errors.first_name && <p className="mt-1 text-sm text-red-600">{errors.first_name}</p>}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Last Name</label>
                    <input 
                      type="text" 
                      value={formData.last_name} 
                      onChange={(e) => updateFormData('last_name', e.target.value)}
                      className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-emerald-500 ${
                        errors.last_name ? 'border-red-300' : 'border-gray-300'
                      }`} 
                      placeholder="Doe" 
                    />
                    {errors.last_name && <p className="mt-1 text-sm text-red-600">{errors.last_name}</p>}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Phone Number (optional)</label>
                  <div className="relative">
                    <PhoneIcon className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                    <input 
                      type="tel" 
                      value={formData.phone} 
                      onChange={(e) => updateFormData('phone', e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500" 
                      placeholder="+254 712 345 678" 
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">We'll only use this for appointment notifications</p>
                </div>

                {userRole === 'practitioner' && (
                  <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-800">
                      <strong>Next step:</strong> After registration, you'll complete a detailed application 
                      to become a verified practitioner. This helps us maintain quality and trust.
                    </p>
                  </div>
                )}
              </div>
            )}

            {currentStep === 'complete' && (
              <div className="text-center py-8">
                <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-full mx-auto flex items-center justify-center animate-bounce">
                  <CheckCircleIcon className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-xl font-bold mt-6">Registration Successful!</h3>
                <p className="text-sm text-gray-600 mt-2">Welcome, {formData.first_name}!</p>
                
                {userRole === 'practitioner' ? (
                  <div className="mt-4 space-y-2">
                    <p className="text-sm text-emerald-600 font-medium">
                      Redirecting you to complete your practitioner application...
                    </p>
                    <p className="text-xs text-gray-500">
                      You'll need to provide your qualifications, certifications, and professional details.
                    </p>
                  </div>
                ) : (
                  <p className="text-sm text-emerald-600 mt-2">Redirecting to your dashboard...</p>
                )}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </form>

      {currentStep !== 'complete' && (
        <div className="mt-8 flex gap-3">
          {currentStepIndex > 0 && (
            <button 
              type="button" 
              onClick={handleBack} 
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
              disabled={loading}
            >
              <ArrowLeftIcon className="w-5 h-5" /> Back
            </button>
          )}
          
          <button 
            type={currentStepIndex === steps.length - 2 ? "submit" : "button"} 
            form="register-form"
            onClick={currentStepIndex === steps.length - 2 ? undefined : handleNext}
            disabled={loading || (currentStep === 'role' && !userRole)}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-white transition-all ${
              loading || (currentStep === 'role' && !userRole)
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 hover:shadow-lg'
            }`}
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <>
                {currentStepIndex === steps.length - 2 ? 'Create Account' : 'Continue'} 
                <ArrowRightIcon className="w-5 h-5" />
              </>
            )}
          </button>
        </div>
      )}

      {currentStep !== 'complete' && (
        <p className="mt-6 text-center text-sm text-gray-600">
          Already have an account?{' '}
          <Link href="/login" className="text-emerald-600 hover:underline font-medium">
            Sign in
          </Link>
        </p>
      )}
    </div>
  )
}