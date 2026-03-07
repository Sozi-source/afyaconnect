// app/client/dashboard/consultations/page.tsx
'use client'

import dynamic from 'next/dynamic'

const ConsultationsPage = dynamic(
  () => import('@/app/components/client/ConsultationsPage'),
  { 
    ssr: false,
    loading: () => (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-teal-200 border-t-teal-600"></div>
      </div>
    )
  }
)

export default function Page() {
  return <ConsultationsPage />
}