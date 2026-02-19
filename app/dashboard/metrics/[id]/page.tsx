'use client'

import { useState, useEffect } from 'react'
import { metricsApi, consultationsApi } from '@/app/lib/api'
import { Card, CardBody, CardHeader } from '@/app/components/ui/Card'
import { Button } from '@/app/components/ui/Buttons'
import Link from 'next/link'
import { 
  ArrowLeftIcon,
  CalendarIcon,
  UserGroupIcon,
  ChartBarIcon,
  CurrencyDollarIcon
} from '@heroicons/react/24/outline'

export default function MetricsDetailsPage() {
  const [consultations, setConsultations] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [dateRange, setDateRange] = useState({
    start_date: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0],
    end_date: new Date().toISOString().split('T')[0],
  })

  useEffect(() => {
    fetchDetails()
  }, [dateRange])

  const fetchDetails = async () => {
    try {
      setLoading(true)
      const data = await consultationsApi.getAll({
        start_date: dateRange.start_date,
        end_date: dateRange.end_date,
        ordering: '-date'
      })
      setConsultations(Array.isArray(data) ? data : data.results || [])
    } catch (error) {
      console.error('Failed to fetch details:', error)
    } finally {
      setLoading(false)
    }
  }

  // Calculate statistics
  const stats = {
    total: consultations.length,
    completed: consultations.filter(c => c.status === 'completed').length,
    pending: consultations.filter(c => c.status === 'booked').length,
    cancelled: consultations.filter(c => c.status === 'cancelled').length,
    totalRevenue: consultations
      .filter(c => c.status === 'completed')
      .reduce((sum, c) => sum + (parseFloat(c.practitioner?.hourly_rate) || 0), 0),
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
        <h1 className="text-3xl font-bold">Detailed Metrics</h1>
      </div>

      <div className="flex items-center justify-end gap-2">
        <input
          type="date"
          value={dateRange.start_date}
          onChange={(e) => setDateRange({ ...dateRange, start_date: e.target.value })}
          className="px-3 py-2 border rounded-lg dark:bg-gray-800"
        />
        <span>to</span>
        <input
          type="date"
          value={dateRange.end_date}
          onChange={(e) => setDateRange({ ...dateRange, end_date: e.target.value })}
          className="px-3 py-2 border rounded-lg dark:bg-gray-800"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard
          title="Total"
          value={stats.total}
          icon={CalendarIcon}
          color="blue"
        />
        <StatCard
          title="Completed"
          value={stats.completed}
          icon={ChartBarIcon}
          color="green"
        />
        <StatCard
          title="Pending"
          value={stats.pending}
          icon={UserGroupIcon}
          color="yellow"
        />
        <StatCard
          title="Revenue"
          value={`KES ${stats.totalRevenue.toLocaleString()}`}
          icon={CurrencyDollarIcon}
          color="purple"
        />
      </div>

      <Card>
        <CardHeader>
          <h2 className="text-xl font-semibold">Consultation Details</h2>
        </CardHeader>
        <CardBody>
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="animate-pulse h-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b dark:border-gray-700">
                    <th className="text-left py-3 px-4">Date</th>
                    <th className="text-left py-3 px-4">Practitioner</th>
                    <th className="text-left py-3 px-4">Status</th>
                    <th className="text-right py-3 px-4">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {consultations.map((c) => (
                    <tr key={c.id} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800">
                      <td className="py-3 px-4">{new Date(c.date).toLocaleDateString()}</td>
                      <td className="py-3 px-4">
                        Dr. {c.practitioner?.first_name} {c.practitioner?.last_name}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          c.status === 'completed' ? 'bg-green-100 text-green-700' :
                          c.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                          'bg-yellow-100 text-yellow-700'
                        }`}>
                          {c.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        KES {parseFloat(c.practitioner?.hourly_rate || 0).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  )
}

function StatCard({ title, value, icon: Icon, color }: any) {
  const colors = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    yellow: 'bg-yellow-50 text-yellow-600',
    purple: 'bg-purple-50 text-purple-600',
  }

  return (
    <Card>
      <CardBody>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">{title}</p>
            <p className="text-2xl font-bold mt-1">{value}</p>
          </div>
          <div className={`p-3 rounded-full`}>
            <Icon className="h-6 w-6" />
          </div>
        </div>
      </CardBody>
    </Card>
  )
}