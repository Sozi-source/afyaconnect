// app/test-practitioners/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { publicApi } from '../lib/api/client'

export default function TestPractitionersPage() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const testApi = async () => {
      try {
        console.log('Testing practitioners endpoint...')
        const response = await publicApi.get('/practitioners/')
        console.log('✅ Success! Response:', response.data)
        setData(response.data)
      } catch (err: any) {
        console.error('❌ Failed:', err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    testApi()
  }, [])

  if (loading) return <div>Loading...</div>
  if (error) return <div className="text-red-500">Error: {error}</div>

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Practitioners API Test</h1>
      <pre className="bg-gray-100 p-4 rounded overflow-auto">
        {JSON.stringify(data, null, 2)}
      </pre>
    </div>
  )
}