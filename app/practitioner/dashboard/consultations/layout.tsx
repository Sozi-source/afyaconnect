import { ReactNode } from 'react'

interface ConsultationsLayoutProps {
  children: ReactNode
}

export default function ConsultationsLayout({ children }: ConsultationsLayoutProps) {
  return (
    <div className="min-h-screen bg-white">
      {/* Header - Fully responsive */}
      <div className="border-b border-gray-100">
        <div className="px-3 sm:px-4 md:px-6 lg:px-8 py-3 sm:py-4 md:py-5 lg:py-6">
          <h1 className="text-lg sm:text-xl md:text-2xl font-light text-gray-900 tracking-tight">
            Consultations
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-0.5 sm:mt-1 hidden sm:block">
            Manage your appointments and track your practice
          </p>
        </div>
      </div>

      {/* Content - Fully responsive */}
      <div className="px-3 sm:px-4 md:px-6 lg:px-8 py-3 sm:py-4 md:py-5 lg:py-6 max-w-7xl mx-auto">
        {children}
      </div>
    </div>
  )
}