'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  UserIcon, EnvelopeIcon, LockClosedIcon, PhoneIcon,
  CheckCircleIcon, ArrowRightIcon, ArrowLeftIcon,
  BriefcaseIcon, AcademicCapIcon, CurrencyDollarIcon,
  MapPinIcon, UserGroupIcon
} from '@heroicons/react/24/outline'
import { apiClient } from '@/app/lib/api'

type Step = 'role' | 'account' | 'personal' | 'practitioner' | 'complete'
type UserRole = 'client' | 'practitioner' | null
interface Specialty { id: number; name: string }

export default function RegisterForm() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState<Step>('role')
  const [userRole, setUserRole] = useState<UserRole>(null)
  const [formData, setFormData] = useState({
    email: '', password: '', confirmPassword: '', first_name: '', last_name: '', phone: '',
    bio: '', city: '', hourly_rate: '', years_of_experience: '', specialties: [] as number[]
  })
  const [specialties, setSpecialties] = useState<Specialty[]>([])
  const [loading, setLoading] = useState(false)
  const [loadingSpecialties, setLoadingSpecialties] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [apiError, setApiError] = useState('')

  useEffect(() => {
    if (userRole === 'practitioner') fetchSpecialties()
  }, [userRole])

  const fetchSpecialties = async () => {
    setLoadingSpecialties(true)
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/specialties/`)
      if (response.ok) setSpecialties(await response.json())
    } catch (error) {
      console.error('Failed to fetch specialties:', error)
    } finally {
      setLoadingSpecialties(false)
    }
  }

  const steps = userRole === 'practitioner' 
    ? [
        { id: 'role', name: 'Role', icon: UserGroupIcon },
        { id: 'account', name: 'Account', icon: LockClosedIcon },
        { id: 'personal', name: 'Personal', icon: UserIcon },
        { id: 'practitioner', name: 'Professional', icon: BriefcaseIcon },
        { id: 'complete', name: 'Complete', icon: CheckCircleIcon }
      ]
    : [
        { id: 'role', name: 'Role', icon: UserGroupIcon },
        { id: 'account', name: 'Account', icon: LockClosedIcon },
        { id: 'personal', name: 'Personal', icon: UserIcon },
        { id: 'complete', name: 'Complete', icon: CheckCircleIcon }
      ]

  const currentStepIndex = steps.findIndex(s => s.id === currentStep)

  const validateStep = (): boolean => {
    const newErrors: Record<string, string> = {}
    switch (currentStep) {
      case 'account':
        if (!formData.email) newErrors.email = 'Email required'
        else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Invalid email'
        if (!formData.password) newErrors.password = 'Password required'
        else if (formData.password.length < 8) newErrors.password = 'Min 8 characters'
        if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match'
        break
      case 'personal':
        if (!formData.first_name) newErrors.first_name = 'First name required'
        if (!formData.last_name) newErrors.last_name = 'Last name required'
        break
      case 'practitioner':
        if (!formData.bio) newErrors.bio = 'Bio required'
        else if (formData.bio.length < 50) newErrors.bio = 'Bio must be at least 50 characters'
        if (!formData.city) newErrors.city = 'City required'
        if (!formData.hourly_rate) newErrors.hourly_rate = 'Hourly rate required'
        else if (isNaN(Number(formData.hourly_rate)) || Number(formData.hourly_rate) <= 0) {
          newErrors.hourly_rate = 'Valid rate required'
        }
        if (!formData.years_of_experience) newErrors.years_of_experience = 'Years required'
        else if (isNaN(Number(formData.years_of_experience)) || Number(formData.years_of_experience) < 0) {
          newErrors.years_of_experience = 'Valid years required'
        }
        // Specialties are optional - no validation
        break
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = () => {
    if (currentStep === 'role' && !userRole) {
      setErrors({ role: 'Select a role' })
      return
    }
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
    if (!validateStep()) return

    setLoading(true)
    setApiError('')

    try {
      const registerData: any = {
        email: formData.email,
        password: formData.password,
        first_name: formData.first_name,
        last_name: formData.last_name,
        role: userRole,
        phone: formData.phone || undefined
      }

      if (userRole === 'practitioner') {
        registerData.bio = formData.bio
        registerData.city = formData.city
        registerData.hourly_rate = parseFloat(formData.hourly_rate)
        registerData.years_of_experience = parseInt(formData.years_of_experience)
      }

      const response = await apiClient.auth.register(registerData)
      
      if (userRole === 'practitioner' && formData.specialties.length > 0 && response.token) {
        await fetch(`${process.env.NEXT_PUBLIC_API_URL}/practitioners/me/`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Token ${response.token}`
          },
          body: JSON.stringify({ specialties: formData.specialties })
        })
      }
      
      setCurrentStep('complete')
      
      if (response.token) {
        localStorage.setItem('authToken', response.token)
        if (response.user) localStorage.setItem('user', JSON.stringify(response.user))
      }
      
      setTimeout(() => {
        if (response.token) {
          router.push(userRole === 'practitioner' ? '/practitioner/dashboard' : '/client/dashboard')
        } else {
          router.push('/login?registered=true')
        }
      }, 2000)

    } catch (error: any) {
      setApiError(error.response?.data?.message || 'Registration failed')
      setCurrentStep('role')
    } finally {
      setLoading(false)
    }
  }

  const updateFormData = (field: string, value: string | number[]) => {
  setFormData(prev => ({ ...prev, [field]: value }))
  if (errors[field]) {
    setErrors(prev => {
      const updated = { ...prev }
      delete updated[field]
      return updated
    })
  }
  if (apiError) setApiError('')
}

  const toggleSpecialty = (specialtyId: number) => {
    const newSpecialties = formData.specialties.includes(specialtyId)
      ? formData.specialties.filter(id => id !== specialtyId)
      : [...formData.specialties, specialtyId]
    updateFormData('specialties', newSpecialties)
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
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-500'
              }`}>
                {index < currentStepIndex ? <CheckCircleIcon className="w-5 h-5" /> : <step.icon className="w-4 h-4" />}
              </div>
              <span className="text-xs mt-2 font-medium text-gray-600 dark:text-gray-300">{step.name}</span>
              {index < steps.length - 1 && (
                <div className={`absolute top-4 left-8 w-full h-0.5 -z-10 ${
                  index < currentStepIndex ? 'bg-gradient-to-r from-emerald-500 to-teal-500' : 'bg-gray-200 dark:bg-gray-700'
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
          <motion.div key={currentStep} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
            
            {currentStep === 'role' && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Choose your account type</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <button type="button" onClick={() => setUserRole('client')} className={`p-6 border-2 rounded-xl text-left ${
                    userRole === 'client' ? 'border-emerald-500 bg-emerald-50' : 'border-gray-200 hover:border-emerald-300'
                  }`}>
                    <UserIcon className="w-6 h-6 text-emerald-600 mb-3" />
                    <h4 className="font-semibold">Client</h4>
                    <p className="text-sm text-gray-600">Book consultations with experts</p>
                  </button>
                  <button type="button" onClick={() => setUserRole('practitioner')} className={`p-6 border-2 rounded-xl text-left ${
                    userRole === 'practitioner' ? 'border-emerald-500 bg-emerald-50' : 'border-gray-200 hover:border-emerald-300'
                  }`}>
                    <BriefcaseIcon className="w-6 h-6 text-emerald-600 mb-3" />
                    <h4 className="font-semibold">Practitioner</h4>
                    <p className="text-sm text-gray-600">Offer nutrition consultations</p>
                  </button>
                </div>
                {errors.role && <p className="text-sm text-red-600 text-center">{errors.role}</p>}
              </div>
            )}

            {currentStep === 'account' && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Create your account</h3>
                {['email', 'password', 'confirmPassword'].map((field) => (
                  <div key={field}>
                    <label className="block text-sm font-medium mb-2 capitalize">{field.replace(/([A-Z])/g, ' $1')}</label>
                    <div className="relative">
                      {field.includes('email') ? <EnvelopeIcon className="absolute left-3 top-3 w-5 h-5 text-gray-400" /> :
                       <LockClosedIcon className="absolute left-3 top-3 w-5 h-5 text-gray-400" />}
                      <input type={field.includes('password') ? 'password' : 'email'} value={formData[field as keyof typeof formData] as string}
                        onChange={(e) => updateFormData(field, e.target.value)}
                        className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-emerald-500 ${
                          errors[field] ? 'border-red-300' : 'border-gray-300'
                        }`} placeholder={field === 'email' ? 'you@example.com' : '••••••••'} />
                    </div>
                    {errors[field] && <p className="mt-1 text-sm text-red-600">{errors[field]}</p>}
                  </div>
                ))}
              </div>
            )}

            {currentStep === 'personal' && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Tell us about yourself</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">First name</label>
                    <input type="text" value={formData.first_name} onChange={(e) => updateFormData('first_name', e.target.value)}
                      className={`w-full px-4 py-3 border rounded-xl ${errors.first_name ? 'border-red-300' : 'border-gray-300'}`} />
                    {errors.first_name && <p className="mt-1 text-sm text-red-600">{errors.first_name}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Last name</label>
                    <input type="text" value={formData.last_name} onChange={(e) => updateFormData('last_name', e.target.value)}
                      className={`w-full px-4 py-3 border rounded-xl ${errors.last_name ? 'border-red-300' : 'border-gray-300'}`} />
                    {errors.last_name && <p className="mt-1 text-sm text-red-600">{errors.last_name}</p>}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Phone (optional)</label>
                  <div className="relative">
                    <PhoneIcon className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                    <input type="tel" value={formData.phone} onChange={(e) => updateFormData('phone', e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl" placeholder="+254 712 345 678" />
                  </div>
                </div>
              </div>
            )}

            {currentStep === 'practitioner' && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Professional Information</h3>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Bio</label>
                  <textarea rows={3} value={formData.bio} onChange={(e) => updateFormData('bio', e.target.value)}
                    className={`w-full px-4 py-3 border rounded-xl ${errors.bio ? 'border-red-300' : 'border-gray-300'}`}
                    placeholder="Your experience and qualifications..." />
                  <p className="text-xs text-gray-500 mt-1">{formData.bio.length}/50 min</p>
                  {errors.bio && <p className="text-sm text-red-600">{errors.bio}</p>}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">City</label>
                    <div className="relative">
                      <MapPinIcon className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                      <input type="text" value={formData.city} onChange={(e) => updateFormData('city', e.target.value)}
                        className={`w-full pl-10 pr-4 py-3 border rounded-xl ${errors.city ? 'border-red-300' : 'border-gray-300'}`} />
                    </div>
                    {errors.city && <p className="text-sm text-red-600">{errors.city}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Experience (years)</label>
                    <div className="relative">
                      <AcademicCapIcon className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                      <input type="number" value={formData.years_of_experience} onChange={(e) => updateFormData('years_of_experience', e.target.value)}
                        className={`w-full pl-10 pr-4 py-3 border rounded-xl ${errors.years_of_experience ? 'border-red-300' : 'border-gray-300'}`} />
                    </div>
                    {errors.years_of_experience && <p className="text-sm text-red-600">{errors.years_of_experience}</p>}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Hourly Rate (KES)</label>
                  <div className="relative">
                    <CurrencyDollarIcon className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                    <input type="number" value={formData.hourly_rate} onChange={(e) => updateFormData('hourly_rate', e.target.value)}
                      className={`w-full pl-10 pr-4 py-3 border rounded-xl ${errors.hourly_rate ? 'border-red-300' : 'border-gray-300'}`} />
                  </div>
                  {errors.hourly_rate && <p className="text-sm text-red-600">{errors.hourly_rate}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Specialties <span className="text-xs text-gray-500">(optional)</span></label>
                  {loadingSpecialties ? (
                    <div className="flex justify-center py-4"><div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div></div>
                  ) : (
                    <div className="grid grid-cols-2 gap-2">
                      {specialties.map((s) => (
                        <button key={s.id} type="button" onClick={() => toggleSpecialty(s.id)}
                          className={`p-2 text-sm border rounded-lg ${
                            formData.specialties.includes(s.id) ? 'bg-emerald-500 text-white' : 'border-gray-300 hover:border-emerald-500'
                          }`}>{s.name}</button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {currentStep === 'complete' && (
              <div className="text-center py-8">
                <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-full mx-auto flex items-center justify-center">
                  <CheckCircleIcon className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-xl font-bold mt-6">Registration Successful!</h3>
                <p className="text-sm text-gray-600 mt-2">Welcome, {formData.first_name}!</p>
                {userRole === 'practitioner' && (
                  <p className="text-xs text-emerald-600 mt-1">Pending verification. You'll be notified once approved.</p>
                )}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </form>

      {currentStep !== 'complete' && (
        <div className="mt-8 flex gap-3">
          {currentStepIndex > 0 && (
            <button type="button" onClick={handleBack} className="flex-1 flex items-center justify-center gap-2 px-4 py-3 border rounded-xl">
              <ArrowLeftIcon className="w-5 h-5" /> Back
            </button>
          )}
          <button type={currentStepIndex === steps.length - 2 ? "submit" : "button"} form="register-form"
            onClick={currentStepIndex === steps.length - 2 ? undefined : handleNext}
            disabled={loading || (currentStep === 'role' && !userRole)}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-white ${
              loading || (currentStep === 'role' && !userRole) ? 'bg-gray-400' : 'bg-gradient-to-r from-emerald-600 to-teal-600'
            }`}>
            {loading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : (
              <>{currentStepIndex === steps.length - 2 ? 'Create Account' : 'Continue'} <ArrowRightIcon className="w-5 h-5" /></>
            )}
          </button>
        </div>
      )}

      {currentStep !== 'complete' && (
        <p className="mt-6 text-center text-sm text-gray-600">
          Already have an account? <Link href="/login" className="text-emerald-600 hover:underline">Sign in</Link>
        </p>
      )}
    </div>
  )
}