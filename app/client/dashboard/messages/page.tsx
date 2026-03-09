'use client'

import { Card, CardBody } from '@/app/components/ui/Card'

export default function MessagesPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Messages</h1>
        <Card>
          <CardBody className="p-6">
            <p className="text-gray-500">Your messages will appear here.</p>
          </CardBody>
        </Card>
      </div>
    </div>
  )
}