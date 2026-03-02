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
  ShieldCheckIcon,
  SparklesIcon,
  WifiIcon
} from '@heroicons/react/24/outline'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState<{email?: string; password?: string}>({})
  const [rememberMe, setRememberMe] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState<'checking' | 'online' | 'offline'>('checking')
  
  const router = useRouter()
  const { login, isAuthenticated, user } = useAuth()

  // Test connection on mount
  useEffect(() => {
    const testConnection = async () => {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);
        
        const response = await fetch('https://osozi.pythonanywhere.com/health/', {
          method: 'GET',
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        if (response.ok) {
          setConnectionStatus('online');
          console.log('🌐 Server is online');
        } else {
          setConnectionStatus('offline');
          console.warn('🌐 Server returned error');
        }
      } catch (error) {
        console.error('🌐 Server connection failed:', error);
        setConnectionStatus('offline');
      }
    };

    testConnection();
  }, []);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      console.log('🔍 User already authenticated:', user)
      if (user.is_staff) {
        router.push('/admin')
      } else if (user.role === 'practitioner') {
        router.push('/practitioner/dashboard')
      } else {
        router.push('/client/dashboard')
      }
    }
  }, [isAuthenticated, user, router])

  useEffect(() => {
    const savedEmail = localStorage.getItem('rememberedEmail')
    if (savedEmail) {
      setEmail(savedEmail)
      setRememberMe(true)
    }
  }, [])

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

    if (connectionStatus === 'offline') {
      setError('Cannot connect to server. Please check your internet connection.')
      return
    }

    setIsLoading(true)
    setError('')
    setFieldErrors({})

    if (rememberMe) {
      localStorage.setItem('rememberedEmail', email)
    } else {
      localStorage.removeItem('rememberedEmail')
    }

    // Set a timeout to show a message if login is taking too long
    const timeoutId = setTimeout(() => {
      setError('Login is taking longer than expected. The server might be slow, but we\'re still trying...')
    }, 10000) // Show message after 10 seconds

    try {
      await login({ 
        username: email, 
        password 
      })
      
      clearTimeout(timeoutId) // Clear timeout if login succeeds
      console.log('✅ Login successful, redirecting...')
      
    } catch (err: any) {
      clearTimeout(timeoutId) // Clear timeout on error
      console.error('❌ Login error:', err)
      
      if (err.message?.includes('timeout')) {
        setError('Connection timeout. The server is taking too long to respond. Please try again.')
      } else if (err.message?.includes('network') || err.code === 'ERR_NETWORK') {
        setError('Cannot connect to server. Please check your internet connection.')
      } else if (err.message?.includes('Invalid') || err.message?.includes('credentials')) {
        setError('Invalid email or password')
      } else if (err.message?.includes('active')) {
        setError('Account is not active. Please check your email.')
      } else {
        setError(err.message || 'Login failed. Please try again.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  const fillTestCredentials = (type: 'client' | 'practitioner') => {
    if (type === 'client') {
      setEmail('client@example.com')
      setPassword('client123')
    } else {
      setEmail('practitioner@example.com')
      setPassword('practitioner123')
    }
    setFieldErrors({})
    setError('')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-6 px-4 sm:px-6">
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-emerald-200 dark:bg-emerald-900/20 rounded-full blur-3xl opacity-30"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-teal-200 dark:bg-teal-900/20 rounded-full blur-3xl opacity-30"></div>
      </div>

      {/* Connection Status Indicator */}
      {connectionStatus !== 'checking' && (
        <div className={`absolute top-4 right-4 flex items-center gap-2 px-3 py-1.5 rounded-full text-xs ${
          connectionStatus === 'online' 
            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' 
            : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
        }`}>
          <WifiIcon className="h-3 w-3" />
          <span>{connectionStatus === 'online' ? 'Connected' : 'Offline'}</span>
        </div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-[400px] relative z-10"
      >
        <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-2xl shadow-2xl shadow-emerald-500/10 overflow-hidden border border-emerald-100/20 dark:border-gray-700/50">
          {/* Header */}
          <div className="bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-8 sm:px-8 sm:py-10 relative overflow-hidden">
            <div className="absolute inset-0 bg-white/10 skew-y-12 transform translate-y-full"></div>
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="relative"
            >
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center mx-auto mb-4 ring-4 ring-white/30">
                <ShieldCheckIcon className="h-8 w-8 sm:h-10 sm:w-10 text-white" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white text-center drop-shadow-md">
                Welcome Back
              </h1>
              <p className="text-emerald-100 text-center text-sm sm:text-base mt-2">
                Sign in to continue to NutriConnect
              </p>
            </motion.div>
          </div>

          {/* Form Container */}
          <div className="p-6 sm:p-8">
            {/* Error Alert */}
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
              {/* Email Field */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Email Address
                </label>
                <div className="relative group">
                  <EnvelopeIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-emerald-500 transition-colors" />
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value)
                      if (fieldErrors.email) setFieldErrors(prev => ({ ...prev, email: undefined }))
                    }}
                    className={`w-full pl-10 pr-4 py-3.5 text-sm border rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all ${
                      fieldErrors.email 
                        ? 'border-red-300 focus:ring-red-500 dark:border-red-600' 
                        : 'border-gray-300 focus:ring-emerald-500 dark:border-gray-600'
                    } bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500`}
                    placeholder="you@example.com"
                    disabled={isLoading}
                    autoComplete="email"
                  />
                </div>
                {fieldErrors.email && (
                  <motion.p 
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-1.5 text-xs text-red-600 dark:text-red-400"
                  >
                    {fieldErrors.email}
                  </motion.p>
                )}
              </div>

              {/* Password Field */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Password
                </label>
                <div className="relative group">
                  <LockClosedIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-emerald-500 transition-colors" />
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value)
                      if (fieldErrors.password) setFieldErrors(prev => ({ ...prev, password: undefined }))
                    }}
                    className={`w-full pl-10 pr-12 py-3.5 text-sm border rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all ${
                      fieldErrors.password 
                        ? 'border-red-300 focus:ring-red-500 dark:border-red-600' 
                        : 'border-gray-300 focus:ring-emerald-500 dark:border-gray-600'
                    } bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500`}
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
                      <EyeSlashIcon className="h-5 w-5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" />
                    ) : (
                      <EyeIcon className="h-5 w-5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" />
                    )}
                  </button>
                </div>
                {fieldErrors.password && (
                  <motion.p 
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-1.5 text-xs text-red-600 dark:text-red-400"
                  >
                    {fieldErrors.password}
                  </motion.p>
                )}
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between">
                <label className="flex items-center space-x-2 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500 dark:border-gray-600 dark:bg-gray-700"
                  />
                  <span className="text-sm text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-gray-300 transition">
                    Remember me
                  </span>
                </label>
                
                <Link 
                  href="/forgot-password" 
                  className="text-sm text-emerald-600 hover:text-emerald-500 dark:text-emerald-400 font-medium transition-colors"
                >
                  Forgot password?
                </Link>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading || connectionStatus === 'offline'}
                className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-semibold py-3.5 px-4 rounded-xl transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 shadow-lg shadow-emerald-500/20"
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
                  <span className="flex items-center justify-center">
                    Sign In
                    <ArrowRightIcon className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </span>
                )}
              </button>

              {/* Sign Up Link */}
              <p className="text-center text-sm text-gray-600 dark:text-gray-400 mt-6">
                Don't have an account?{' '}
                <Link 
                  href="/register" 
                  className="text-emerald-600 hover:text-emerald-500 dark:text-emerald-400 font-semibold inline-flex items-center gap-1 group"
                >
                  Sign up
                  <SparklesIcon className="h-3 w-3 group-hover:rotate-12 transition-transform" />
                </Link>
              </p>
            </form>

            {/* Test Accounts Divider */}
            <div className="relative mt-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200 dark:border-gray-700"></div>
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="px-2 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">
                  Quick test accounts
                </span>
              </div>
            </div>

            {/* Test Account Buttons */}
            <div className="mt-6 grid grid-cols-2 gap-3">
              <button
                onClick={() => fillTestCredentials('client')}
                className="group relative overflow-hidden text-xs bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-gray-700 dark:to-gray-600 hover:from-emerald-100 hover:to-teal-100 dark:hover:from-gray-600 dark:hover:to-gray-500 rounded-xl p-3 transition-all border border-emerald-200 dark:border-gray-600 text-gray-700 dark:text-gray-200 font-medium"
                disabled={connectionStatus === 'offline'}
              >
                <span className="relative z-10">Client</span>
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></div>
              </button>
              <button
                onClick={() => fillTestCredentials('practitioner')}
                className="group relative overflow-hidden text-xs bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-gray-700 dark:to-gray-600 hover:from-emerald-100 hover:to-teal-100 dark:hover:from-gray-600 dark:hover:to-gray-500 rounded-xl p-3 transition-all border border-emerald-200 dark:border-gray-600 text-gray-700 dark:text-gray-200 font-medium"
                disabled={connectionStatus === 'offline'}
              >
                <span className="relative z-10">Practitioner</span>
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></div>
              </button>
            </div>

            {/* Security Note */}
            <p className="mt-6 text-center text-xs text-gray-500 dark:text-gray-400">
              🔒 Secured with industry-standard encryption
            </p>
          </div>
        </div>

        {/* Footer Links */}
        <div className="mt-6 text-center space-x-4">
          <Link href="/terms" className="text-xs text-gray-500 hover:text-emerald-600 dark:text-gray-400 dark:hover:text-emerald-400 transition">
            Terms
          </Link>
          <span className="text-xs text-gray-300 dark:text-gray-600">•</span>
          <Link href="/privacy" className="text-xs text-gray-500 hover:text-emerald-600 dark:text-gray-400 dark:hover:text-emerald-400 transition">
            Privacy
          </Link>
          <span className="text-xs text-gray-300 dark:text-gray-600">•</span>
          <Link href="/help" className="text-xs text-gray-500 hover:text-emerald-600 dark:text-gray-400 dark:hover:text-emerald-400 transition">
            Help
          </Link>
        </div>
      </motion.div>
    </div>
  )
}