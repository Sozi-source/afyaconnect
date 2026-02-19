'use client'

import { useAuth } from '@/app/contexts/AuthContext'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function DashboardPage() {
  const { user, isAuthenticated, isLoading, logout } = useAuth()
  const router = useRouter()

  useEffect(() => {
    console.log('📊 Dashboard mounted:', { 
      isAuthenticated, 
      isLoading, 
      user: user?.email 
    })
  }, [isAuthenticated, isLoading, user])

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  // If not authenticated, let the login page handle it
  if (!isAuthenticated || !user) {
    console.log('⛔ Not authenticated in dashboard')
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <button
            onClick={logout}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          >
            Logout
          </button>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">
            Welcome, {user.first_name || user.username || user.email}!
          </h2>
          <div className="bg-green-50 border border-green-200 rounded p-4">
            <p className="text-green-700 font-medium">✅ Successfully logged in!</p>
            <div className="mt-4 space-y-2">
              <p className="text-sm text-gray-600"><strong>User ID:</strong> {user.id}</p>
              <p className="text-sm text-gray-600"><strong>Email:</strong> {user.email}</p>
              <p className="text-sm text-gray-600"><strong>Username:</strong> {user.username || 'N/A'}</p>
              <p className="text-sm text-gray-600"><strong>Name:</strong> {user.first_name} {user.last_name}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link 
            href="/dashboard/practitioners" 
            className="block p-6 bg-white rounded-lg shadow hover:shadow-md transition border border-gray-200"
          >
            <h3 className="text-lg font-semibold mb-2">👥 Practitioners</h3>
            <p className="text-gray-600">Find and connect with practitioners</p>
          </Link>
          
          <Link 
            href="/dashboard/consultations" 
            className="block p-6 bg-white rounded-lg shadow hover:shadow-md transition border border-gray-200"
          >
            <h3 className="text-lg font-semibold mb-2">📅 Consultations</h3>
            <p className="text-gray-600">View your consultations</p>
          </Link>
        </div>

        {/* Token debug info (remove in production) */}
        <div className="mt-6 p-4 bg-gray-100 rounded">
          <p className="text-sm font-mono break-all">
            <strong>Token in localStorage:</strong>{' '}
            {typeof window !== 'undefined' && localStorage.getItem('authToken') ? '✅ Present' : '❌ Missing'}
          </p>
        </div>
      </div>
    </div>
  )
}