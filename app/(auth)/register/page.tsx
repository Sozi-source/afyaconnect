import { Suspense } from 'react'
import Link from 'next/link'
import RegisterForm from './RegisterForm'

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-md">
        {/* Logo/Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl shadow-lg shadow-emerald-500/20 mb-4">
            <span className="text-2xl font-bold text-white">NC</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Join Afya<span className="text-emerald-600 dark:text-emerald-400">Connect</span>
          </h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
            Start your health journey with us today
          </p>
        </div>

        {/* Main Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl shadow-gray-200/50 dark:shadow-gray-900/50 overflow-hidden">
          <Suspense fallback={
            <div className="py-12 px-4 sm:px-10">
              <div className="flex flex-col items-center justify-center space-y-4">
                <div className="relative">
                  <div className="w-16 h-16 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-8 h-8 bg-emerald-100 dark:bg-emerald-900/30 rounded-full animate-pulse"></div>
                  </div>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-300 animate-pulse">
                  Preparing your registration form...
                </p>
              </div>
            </div>
          }>
            <RegisterForm />
          </Suspense>
        </div>

        {/* Footer Links */}
        <div className="mt-8 text-center space-y-2">
          <p className="text-xs text-gray-600 dark:text-gray-300">
            By joining, you agree to our{' '}
            <Link href="/terms" className="text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 font-medium hover:underline transition">
              Terms
            </Link>{' '}
            and{' '}
            <Link href="/privacy" className="text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 font-medium hover:underline transition">
              Privacy Policy
            </Link>
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            © {new Date().getFullYear()} AfyaConnect. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  )
}