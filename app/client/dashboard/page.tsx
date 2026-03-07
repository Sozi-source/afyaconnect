// app/client/dashboard/page.tsx
'use client'

import dynamic from 'next/dynamic'

const ClientDashboardPage = dynamic(
  () => import('@/app/components/client/ClientDashboardPage'),
  { 
    ssr: false,
    loading: () => (
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-emerald-200 border-t-emerald-600"></div>
      </div>
    )
  }
)

export default function Page() {
  return <ClientDashboardPage />
}