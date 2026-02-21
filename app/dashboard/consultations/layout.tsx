import { ReactNode } from 'react'
import Link from 'next/link'
import { Calendar, Clock, CheckCircle, XCircle, CalendarRange } from 'lucide-react'

interface ConsultationsLayoutProps {
  children: ReactNode
}

export default function ConsultationsLayout({ children }: ConsultationsLayoutProps) {
  const tabs = [
    { name: 'Upcoming', href: '/dashboard/consultations/upcoming', icon: Clock },
    { name: 'Completed', href: '/dashboard/consultations/completed', icon: CheckCircle },
    { name: 'Cancelled', href: '/dashboard/consultations/cancelled', icon: XCircle },
    { name: 'All', href: '/dashboard/consultations/all', icon: CalendarRange },
  ]

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="border-b border-gray-200">
        <div className="px-8 py-6">
          <h1 className="text-2xl font-light text-gray-900">Consultations</h1>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <div className="px-8">
          <nav className="flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <Link
                  key={tab.name}
                  href={tab.href}
                  className="py-4 px-1 border-b-2 border-transparent text-sm font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300 flex items-center space-x-2"
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.name}</span>
                </Link>
              )
            })}
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="px-8 py-6">
        {children}
      </div>
    </div>
  )
}