'use client'

import dynamic from 'next/dynamic'

// THIS IS THE ONLY CODE IN THIS FILE
const CreateReviewPage = dynamic(
  () => import('@/app/components/client/CreateReviewPage'),
  { 
    ssr: false,
    loading: () => (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-200 border-t-primary-600"></div>
      </div>
    )
  }
)

export default function Page() {
  return <CreateReviewPage />
}