'use client'

import dynamic from 'next/dynamic'

// THIS IS THE ONLY CODE IN THIS FILE
const FavoritesPage = dynamic(
  () => import('@/app/components/client/FavoritesPage'),
  { 
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-200 border-t-primary-600"></div>
      </div>
    )
  }
)

export default function Page() {
  return <FavoritesPage />
}