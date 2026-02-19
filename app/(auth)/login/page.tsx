'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/app/contexts/AuthContext'
import { motion } from 'framer-motion'
import { 
  EnvelopeIcon, 
  LockClosedIcon, 
  EyeIcon, 
  EyeSlashIcon,
  ArrowRightIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState<{email?: string; password?: string}>({})
  
  const router = useRouter()
  const { login, isAuthenticated } = useAuth()

  useEffect(() => {
    if (isAuthenticated) {
      router.push('/dashboard')
    }
  }, [isAuthenticated, router])

  const validateForm = () => {
    const errors: {email?: string; password?: string} = {}
    
    if (!email.trim()) {
      errors.email = 'Email is required'
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errors.email = 'Please enter a valid email address'
    }
    
    if (!password) {
      errors.password = 'Password is required'
    } else if (password.length < 6) {
      errors.password = 'Password must be at least 6 characters'
    }
    
    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return

    setIsLoading(true)
    setError('')
    setFieldErrors({})

    try {
      await login({ username: email, password })
    } catch (err: any) {
      if (err.response?.status === 401) {
        setError('Invalid email or password')
      } else if (err.response?.status === 404) {
        setError('Account not found. Please register first.')
      } else if (err.code === 'ERR_NETWORK') {
        setError('Cannot connect to server. Please check your connection.')
      } else {
        setError('Login failed. Please try again.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-gray-900 dark:to-gray-800 py-6 px-4 sm:px-6">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-[400px]"
      >
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-8 sm:px-8 sm:py-10">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="w-16 h-16 sm:w-20 sm:h-20 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center mx-auto mb-4"
            >
              <ShieldCheckIcon className="h-8 w-8 sm:h-10 sm:w-10 text-white" />
            </motion.div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white text-center">
              Welcome Back
            </h1>
            <p className="text-emerald-100 text-center text-sm sm:text-base mt-2">
              Sign in to continue to NutriConnect
            </p>
          </div>

          {/* Form Container */}
          <div className="p-6 sm:p-8">
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4"
              >
                <p className="text-sm text-red-600 dark:text-red-400 text-center">{error}</p>
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <EnvelopeIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value)
                      if (fieldErrors.email) setFieldErrors(prev => ({ ...prev, email: undefined }))
                    }}
                    className={`w-full pl-10 pr-4 py-3.5 text-sm border rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 dark:bg-gray-700 dark:text-white transition-colors ${
                      fieldErrors.email 
                        ? 'border-red-300 focus:ring-red-500 dark:border-red-600' 
                        : 'border-gray-300 focus:ring-emerald-500 dark:border-gray-600'
                    }`}
                    placeholder="you@example.com"
                    disabled={isLoading}
                    autoComplete="email"
                  />
                </div>
                {fieldErrors.email && (
                  <p className="mt-1.5 text-xs text-red-600 dark:text-red-400">{fieldErrors.email}</p>
                )}
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <LockClosedIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value)
                      if (fieldErrors.password) setFieldErrors(prev => ({ ...prev, password: undefined }))
                    }}
                    className={`w-full pl-10 pr-12 py-3.5 text-sm border rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 dark:bg-gray-700 dark:text-white transition-colors ${
                      fieldErrors.password 
                        ? 'border-red-300 focus:ring-red-500 dark:border-red-600' 
                        : 'border-gray-300 focus:ring-emerald-500 dark:border-gray-600'
                    }`}
                    placeholder="••••••••"
                    disabled={isLoading}
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                    disabled={isLoading}
                  >
                    {showPassword ? (
                      <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                    ) : (
                      <EyeIcon className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                </div>
                {fieldErrors.password && (
                  <p className="mt-1.5 text-xs text-red-600 dark:text-red-400">{fieldErrors.password}</p>
                )}
              </div>

              <div className="text-right">
                <Link 
                  href="/forgot-password" 
                  className="text-sm text-emerald-600 hover:text-emerald-500 dark:text-emerald-400 font-medium"
                >
                  Forgot password?
                </Link>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-semibold py-3.5 px-4 rounded-xl transition-all transform active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Signing in...
                  </span>
                ) : (
                  'Sign In'
                )}
              </button>

              <p className="text-center text-sm text-gray-600 dark:text-gray-400 mt-6">
                Don't have an account?{' '}
                <Link 
                  href="/register" 
                  className="text-emerald-600 hover:text-emerald-500 dark:text-emerald-400 font-semibold inline-flex items-center gap-1 group"
                >
                  Sign up
                  <ArrowRightIcon className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
                </Link>
              </p>
            </form>

            {/* Optional test accounts */}
            <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
              <p className="text-xs text-center text-gray-500 dark:text-gray-400 mb-3">
                Quick test accounts
              </p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    setEmail('client@example.com')
                    setPassword('client123')
                  }}
                  className="text-xs bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg p-2 transition-colors"
                >
                  <span className="font-medium text-gray-700 dark:text-gray-300">Client</span>
                </button>
                <button
                  onClick={() => {
                    setEmail('practitioner@example.com')
                    setPassword('practitioner123')
                  }}
                  className="text-xs bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg p-2 transition-colors"
                >
                  <span className="font-medium text-gray-700 dark:text-gray-300">Practitioner</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}