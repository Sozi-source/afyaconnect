
'use client'
// app/client/dashboard/reviews/page.tsx
import { Suspense } from 'react'
import dynamic from 'next/dynamic'

const ReviewsPage = dynamic(() => import('@/app/components/client/ReviewsPage'), {
  ssr: false,
  loading: () => <ReviewsLoading />
})

const ReviewsLoading = () => (
  <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white py-6 sm:py-8">
    <div className="max-w-4xl mx-auto px-4 sm:px-6">
      <div className="mb-8 animate-pulse">
        <div className="h-4 w-24 bg-slate-200 rounded mb-2" />
        <div className="h-8 w-48 bg-slate-200 rounded" />
      </div>
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-white rounded-2xl border border-slate-200 p-5">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-slate-200 rounded-full animate-pulse" />
              <div className="flex-1">
                <div className="h-5 w-32 bg-slate-200 rounded animate-pulse mb-2" />
                <div className="h-4 w-24 bg-slate-200 rounded animate-pulse" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
)

export default function Page() {
  return (
    <Suspense fallback={<ReviewsLoading />}>
      <ReviewsPage />
    </Suspense>
  )
}