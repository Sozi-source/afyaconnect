'use client'

import { useState, useEffect } from 'react'
import { apiClient } from '@/app/lib/api'

export default function TestPractitionersPage() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [tokenStatus, setTokenStatus] = useState<string>('')

  useEffect(() => {
    const testApi = async () => {
      try {
        // Check token
        const token = localStorage.getItem('authToken')
        setTokenStatus(token ? `✅ Token exists: ${token.substring(0, 10)}...` : '❌ No token found')
        
        if (!token) {
          setError('No authentication token found')
          setLoading(false)
          return
        }

        // Test 1: Direct fetch
        console.log('Test 1: Direct fetch with token')
        const directResponse = await fetch('https://osozi.pythonanywhere.com/practitioners/', {
          headers: {
            'Authorization': `Token ${token}`,
            'Content-Type': 'application/json'
          }
        })
        
        console.log('Direct fetch status:', directResponse.status)
        const directData = await directResponse.json()
        console.log('Direct fetch data:', directData)

        // Test 2: Using apiClient
        console.log('Test 2: Using apiClient')
        const clientData = await apiClient.practitioners.getAll()
        console.log('apiClient data:', clientData)

        setData({
          direct: {
            status: directResponse.status,
            data: directData
          },
          client: clientData
        })

      } catch (err: any) {
        console.error('Test failed:', err)
        setError(err.message || 'Test failed')
      } finally {
        setLoading(false)
      }
    }

    testApi()
  }, [])

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <p className="mt-4">Testing API connection...</p>
      </div>
    )
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">API Test Page</h1>
      
      <div className="mb-6 p-4 bg-gray-100 rounded-lg">
        <h2 className="font-semibold mb-2">Token Status:</h2>
        <p className={tokenStatus.includes('✅') ? 'text-green-600' : 'text-red-600'}>
          {tokenStatus}
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-lg">
          <h2 className="font-semibold mb-2">Error:</h2>
          <p>{error}</p>
        </div>
      )}

      {data && (
        <div className="space-y-6">
          <div className="p-4 bg-green-100 rounded-lg">
            <h2 className="font-semibold mb-2">Direct Fetch Result:</h2>
            <p>Status: {data.direct.status}</p>
            <p>Count: {Array.isArray(data.direct.data) ? data.direct.data.length : 'Not an array'}</p>
            <pre className="mt-2 p-2 bg-white rounded overflow-auto max-h-60">
              {JSON.stringify(data.direct.data, null, 2)}
            </pre>
          </div>

          <div className="p-4 bg-blue-100 rounded-lg">
            <h2 className="font-semibold mb-2">apiClient Result:</h2>
            <p>Count: {Array.isArray(data.client) ? data.client.length : 'Not an array'}</p>
            <pre className="mt-2 p-2 bg-white rounded overflow-auto max-h-60">
              {JSON.stringify(data.client, null, 2)}
            </pre>
          </div>
        </div>
      )}

      <div className="mt-8">
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Run Test Again
        </button>
      </div>
    </div>
  )
}