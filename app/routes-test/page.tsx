'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'

export default function RoutesTest() {
  const [currentPath, setCurrentPath] = useState('')

  useEffect(() => {
    setCurrentPath(window.location.pathname)
  }, [])

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Route Test Page</h1>
      <p className="mb-2">Current Path: <span className="font-mono bg-gray-100 p-1">{currentPath}</span></p>
      
      <div className="mt-6 space-y-2">
        <h2 className="text-xl font-semibold">Test Links:</h2>
        <div className="flex flex-col space-y-2">
          <Link href="/" className="text-blue-600 hover:underline">Home (/)</Link>
          <Link href="/dashboard" className="text-blue-600 hover:underline">Dashboard (/dashboard)</Link>
          <Link href="/login" className="text-blue-600 hover:underline">Login (/login)</Link>
          <Link href="/register" className="text-blue-600 hover:underline">Register (/register)</Link>
        </div>
      </div>

      <div className="mt-6">
        <h2 className="text-xl font-semibold mb-2">Next.js Router Info:</h2>
        <pre className="bg-gray-100 p-4 rounded">
          {JSON.stringify({
            NODE_ENV: process.env.NODE_ENV,
            hasWindow: typeof window !== 'undefined',
          }, null, 2)}
        </pre>
      </div>
    </div>
  )
}