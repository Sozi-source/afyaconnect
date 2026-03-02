import { ReactNode } from 'react'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Consultations | AfyaConnect',
  description: 'Manage your consultations and appointments',
}

interface ConsultationsLayoutProps {
  children: ReactNode
}

export default function ConsultationsLayout({ children }: ConsultationsLayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white">
      {/* Header - Django-inspired */}
      <div className="border-b border-slate-200 bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
          <div className="py-3 sm:py-4">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-6 bg-emerald-500 rounded-full"></div>
              <div>
                <h1 className="text-base sm:text-lg md:text-xl font-semibold text-slate-900 tracking-tight">
                  Consultations
                </h1>
                <p className="text-xs sm:text-sm text-slate-500 mt-0.5 hidden sm:block">
                  Manage your appointments and track your practice
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content - Fully responsive */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-5 md:py-6">
        {children}
      </div>
    </div>
  )
}