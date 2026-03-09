'use client'
// app/client/dashboard/reviews/create/page.tsx
import { Suspense } from 'react'
import dynamic from 'next/dynamic'

const CreateReviewPage = dynamic(
  () => import('@/app/components/client/CreateReviewPage'),
  {
    ssr: false,
    loading: () => (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-purple-50/30 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center shadow-lg transform rotate-3">
                <span className="text-white text-xs font-bold">★</span>
              </div>
            </div>
          </div>
          <p className="text-sm font-medium text-gray-600 animate-pulse">
            Loading review form...
          </p>
        </div>
      </div>
    )
  }
)

export default function Page() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-purple-50/30 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-200 border-t-purple-600" />
      </div>
    }>
      <CreateReviewPage />
    </Suspense>
  )
}