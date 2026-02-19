'use client'

import { useState, useEffect } from 'react'
import { consultationsApi } from '@/app/lib/api'
import { Card, CardBody } from '@/app/components/ui/Card'
import { Button } from '@/app/components/ui/Buttons'
import Link from 'next/link'
import { CalendarIcon, ClockIcon } from '@heroicons/react/24/outline'
import { Consultation } from '@/app/types'

export default function ConsultationsPage() {
  const [consultations, setConsultations] = useState<Consultation[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchConsultations = async () => {
      try {
        const data = await consultationsApi.getAll()
        // Handle both paginated and non-paginated responses
        setConsultations(Array.isArray(data) ? data : data.results || [])
      } catch (error) {
        console.error('Failed to fetch consultations:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchConsultations()
  }, [])

  const getStatusColor = (status: string) => {
    const colors = {
      booked: 'bg-yellow-100 text-yellow-800',
      completed: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
      no_show: 'bg-gray-100 text-gray-800',
    }
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800'
  }

  if (loading) return <div className="flex justify-center p-8">Loading...</div>

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Consultations</h1>
        <Link href="/dashboard/consultations/create">
          <Button>Book New Consultation</Button>
        </Link>
      </div>

      <div className="grid gap-4">
        {consultations.map((consultation) => (
          <Link href={`/dashboard/consultations/${consultation.id}`} key={consultation.id}>
            <Card hoverable>
              <CardBody>
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-semibold">
                      Consultation with Dr. {consultation.practitioner?.first_name} {consultation.practitioner?.last_name}
                    </h3>
                    <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                      <span className="flex items-center">
                        <CalendarIcon className="h-4 w-4 mr-1" />
                        {consultation.date}
                      </span>
                      <span className="flex items-center">
                        <ClockIcon className="h-4 w-4 mr-1" />
                        {consultation.time}
                      </span>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(consultation.status)}`}>
                    {consultation.status}
                  </span>
                </div>
              </CardBody>
            </Card>
          </Link>
        ))}

        {consultations.length === 0 && !loading && (
          <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg">
            <p className="text-gray-500 dark:text-gray-400">No consultations found</p>
            <Link href="/dashboard/consultations/create">
              <Button variant="outline" className="mt-4">
                Book Your First Consultation
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}