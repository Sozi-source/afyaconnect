'use client'

import dynamic from 'next/dynamic'

const PageComponent = dynamic(
  () => import('@/app/components/client/ProfilePage'),
  { 
    ssr: false, // This is the KEY - it disables server rendering
    loading: () => (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-200 border-t-primary-600"></div>
      </div>
    )
  }
)

export default function Page() {
  return <PageComponent />
}