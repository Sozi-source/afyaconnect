// app/client/dashboard/reviews/page.tsx
'use client'

import dynamic from 'next/dynamic'

const ReviewsPage = dynamic(
  () => import('@/app/components/client/ReviewsPage'),
  { 
    ssr: false,
    loading: () => (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-teal-200 border-t-teal-600"></div>
          <p className="text-sm text-slate-500">Loading reviews...</p>
        </div>
      </div>
    )
  }
)

export default function Page() {
  return <ReviewsPage />
}