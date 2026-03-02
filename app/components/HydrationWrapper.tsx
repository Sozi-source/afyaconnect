// app/components/HydrationWrapper.tsx
'use client'

import { useEffect, useState } from 'react'

interface HydrationWrapperProps {
  children: React.ReactNode
}

export function HydrationWrapper({ children }: HydrationWrapperProps) {
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])
  
  if (!isClient) {
    return null
  }

  return <>{children}</>
}