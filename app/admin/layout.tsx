'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/app/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  UsersIcon, 
  ClipboardDocumentListIcon,
  ShieldCheckIcon,
  ChartBarIcon,
  ArrowLeftIcon,
  BellIcon,
  UserCircleIcon
} from '@heroicons/react/24/outline'

interface ExtendedUser {
  id: number
  email: string
  is_staff?: boolean
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [mounted, setMounted] = useState(false)
  const { user, isAuthenticated, isLoading } = useAuth()
  const router = useRouter()
  const extendedUser = user as ExtendedUser | null

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.push('/login')
      } else if (!extendedUser?.is_staff) {
        router.push('/dashboard')
      }
    }
  }, [isLoading, isAuthenticated, extendedUser, router])

  if (!mounted || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-emerald-200 border-t-emerald-600"></div>
      </div>
    )
  }

  if (!extendedUser?.is_staff) {
    return null
  }

  const navigation = [
    { name: 'Dashboard', href: '/admin', icon: ChartBarIcon },
    { name: 'Practitioners', href: '/admin/practitioners', icon: UsersIcon },
    { name: 'Applications', href: '/admin/applications', icon: ClipboardDocumentListIcon },
    { name: 'Verification', href: '/admin/verification', icon: ShieldCheckIcon },
  ]

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-950">
      {/* Admin Header */}
      <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link href="/admin" className="text-xl font-bold text-gray-900 dark:text-white">
                Admin Panel
              </Link>
              <span className="text-sm px-2 py-1 bg-purple-100 text-purple-800 rounded-full">
                Admin
              </span>
            </div>
            
            <div className="flex items-center space-x-4">
              <button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
                <BellIcon className="h-5 w-5 text-gray-600 dark:text-gray-300" />
              </button>
              
              <Link href="/dashboard" className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
                <ArrowLeftIcon className="h-4 w-4 text-gray-600 dark:text-gray-300" />
                <span className="text-sm hidden sm:block">Back to Dashboard</span>
              </Link>

              <div className="flex items-center space-x-2 p-2">
                <UserCircleIcon className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                <span className="text-sm hidden sm:block text-gray-600 dark:text-gray-300">
                  {extendedUser.email}
                </span>
              </div>
            </div>
          </div>

          {/* Admin Navigation */}
          <nav className="flex space-x-4 py-2 overflow-x-auto">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="px-3 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg whitespace-nowrap"
              >
                <item.icon className="h-4 w-4 inline mr-2" />
                {item.name}
              </Link>
            ))}
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {children}
        </div>
      </main>
    </div>
  )
}