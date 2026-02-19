'use client'

import { useState, useEffect } from 'react'
import { practitionersApi, consultationsApi } from '@/app/lib/api'
import { Card, CardBody, CardHeader } from '@/app/components/ui/Card'
import { Button } from '@/app/components/ui/Buttons'
import Link from 'next/link'
import { 
  ArrowLeftIcon,
  StarIcon,
  CurrencyDollarIcon,
  CalendarIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline'

export default function PractitionerMetricsPage() {
  const [practitioners, setPractitioners] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const practitionersData = await practitionersApi.getAll()
      const practitionersList = Array.isArray(practitionersData) ? practitionersData : practitionersData.results || []
      
      // Fetch stats for each practitioner
      const practitionersWithStats = await Promise.all(
        practitionersList.map(async (p: any) => {
          try {
            const consultations = await consultationsApi.getAll({ practitioner: p.id })
            const consults = Array.isArray(consultations) ? consultations : consultations.results || []
            
            const completed = consults.filter((c: any) => c.status === 'completed').length
            const totalRevenue = consults
              .filter((c: any) => c.status === 'completed')
              .reduce((sum, c) => sum + (parseFloat(c.practitioner?.hourly_rate) || 0), 0)
            
            return {
              ...p,
              stats: {
                totalConsultations: consults.length,
                completed,
                pending: consults.filter((c: any) => c.status === 'booked').length,
                cancelled: consults.filter((c: any) => c.status === 'cancelled').length,
                totalRevenue,
                avgRating: p.reviews?.length 
                  ? p.reviews.reduce((sum: number, r: any) => sum + r.rating, 0) / p.reviews.length 
                  : 0
              }
            }
          } catch (error) {
            return p
          }
        })
      )
      
      setPractitioners(practitionersWithStats)
    } catch (error) {
      console.error('Failed to fetch data:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/metrics">
          <Button variant="outline" size="sm">
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
            Back
          </Button>
        </Link>
        <h1 className="text-3xl font-bold">Practitioner Performance</h1>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <Card key={i}>
              <CardBody>
                <div className="animate-pulse h-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
              </CardBody>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid gap-4">
          {practitioners.map((p) => (
            <Card key={p.id} hoverable>
              <CardBody>
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-semibold">
                      Dr. {p.first_name} {p.last_name}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{p.email}</p>
                    {p.specialties && (
                      <p className="text-sm text-gray-500 mt-1">
                        {p.specialties.map((s: any) => s.name).join(', ')}
                      </p>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <p className="text-sm text-gray-500">Total Consults</p>
                      <p className="text-xl font-bold">{p.stats?.totalConsultations || 0}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-500">Completed</p>
                      <p className="text-xl font-bold text-green-600">{p.stats?.completed || 0}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-500">Revenue</p>
                      <p className="text-xl font-bold text-purple-600">
                        KES {p.stats?.totalRevenue?.toLocaleString() || 0}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-500">Rating</p>
                      <p className="text-xl font-bold text-yellow-500">
                        {p.stats?.avgRating?.toFixed(1) || '0.0'}
                      </p>
                    </div>
                  </div>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}