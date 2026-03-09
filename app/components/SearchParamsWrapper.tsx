'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'

// Loading component for Suspense fallback
function SearchParamsLoader() {
  return (
    <div className="flex items-center justify-center min-h-[200px]">
      <div className="animate-spin rounded-full h-8 w-8 border-4 border-emerald-200 border-t-emerald-600"></div>
    </div>
  )
}

// Wrapper component that uses useSearchParams
function SearchParamsHandler({ children }: { children: (searchParams: URLSearchParams) => React.ReactNode }) {
  const searchParams = useSearchParams()
  return <>{children(searchParams)}</>
}

// Main export with Suspense boundary
export default function SearchParamsWrapper({ 
  children 
}: { 
  children: (searchParams: URLSearchParams) => React.ReactNode 
}) {
  return (
    <Suspense fallback={<SearchParamsLoader />}>
      <SearchParamsHandler>
        {children}
      </SearchParamsHandler>
    </Suspense>
  )
}
