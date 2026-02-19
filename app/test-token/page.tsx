'use client'

import { useEffect, useState } from 'react'
import api from '@/app/lib/api'

export default function TestTokenPage() {
  const [token, setToken] = useState<string | null>(null)
  const [requests, setRequests] = useState<any[]>([])

  useEffect(() => {
    const stored = localStorage.getItem('authToken')
    setToken(stored)
  }, [])

  const testRequest = async (url: string) => {
    try {
      const start = Date.now()
      const response = await api.get(url)
      const time = Date.now() - start
      
      setRequests(prev => [{
        url,
        status: response.status,
        success: true,
        time,
        data: response.data
      }, ...prev])
    } catch (error: any) {
      setRequests(prev => [{
        url,
        status: error.response?.status || 'Network Error',
        success: false,
        error: error.message
      }, ...prev])
    }
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Token Test Page</h1>
      
      <div className="mb-4 p-4 bg-gray-100 rounded">
        <p><strong>Token in localStorage:</strong> {token ? '✅ Present' : '❌ Missing'}</p>
        {token && <p className="text-sm break-all">Token: {token.substring(0, 50)}...</p>}
      </div>

      <div className="space-x-2 mb-6">
        <button 
          onClick={() => testRequest('/profile/')}
          className="px-4 py-2 bg-blue-500 text-white rounded"
        >
          Test /profile/
        </button>
        <button 
          onClick={() => testRequest('/metrics/')}
          className="px-4 py-2 bg-green-500 text-white rounded"
        >
          Test /metrics/
        </button>
        <button 
          onClick={() => {
            localStorage.removeItem('authToken')
            setToken(null)
          }}
          className="px-4 py-2 bg-red-500 text-white rounded"
        >
          Clear Token
        </button>
      </div>

      <div className="space-y-2">
        <h2 className="text-xl font-semibold">Request Results:</h2>
        {requests.map((req, i) => (
          <div key={i} className={`p-3 rounded ${
            req.success ? 'bg-green-100' : 'bg-red-100'
          }`}>
            <p><strong>{req.url}</strong> - Status: {req.status} ({req.time}ms)</p>
            {req.error && <p className="text-red-600">Error: {req.error}</p>}
          </div>
        ))}
      </div>
    </div>
  )
}