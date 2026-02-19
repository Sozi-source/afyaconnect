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
  ChartBarIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline'
import { motion } from 'framer-motion'

export default function PractitionerMetricsPage() {
  const [practitioners, setPractitioners] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

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

  const filteredPractitioners = practitioners.filter(p => 
    p.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.email?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <Link href="/dashboard/metrics">
          <Button variant="outline" size="sm" className="!p-2 sm:!px-4">
            <ArrowLeftIcon className="h-5 w-5 sm:mr-2" />
            <span className="hidden sm:inline">Back to Metrics</span>
          </Button>
        </Link>
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
          Practitioner Performance
        </h1>
      </div>

      {/* Search */}
      <div className="relative">
        <input
          type="text"
          placeholder="Search practitioners..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2.5 sm:py-3 pl-10 text-sm border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
        />
        <svg
          className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>

      {/* Practitioners List */}
      {loading ? (
        <div className="space-y-3 sm:space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-32 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse"></div>
          ))}
        </div>
      ) : (
        <div className="space-y-3 sm:space-y-4">
          {filteredPractitioners.map((p, index) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(index * 0.05, 0.5) }}
            >
              <Link href={`/dashboard/practitioners/${p.id}`}>
                <Card hoverable className="cursor-pointer">
                  <CardBody className="p-4 sm:p-5">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                      {/* Practitioner Info */}
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
                              Dr. {p.first_name} {p.last_name}
                            </h3>
                            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1">
                              {p.email}
                            </p>
                            {p.specialties && p.specialties.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-2">
                                {p.specialties.slice(0, 2).map((s: any) => (
                                  <span key={s.id} className="px-2 py-0.5 bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 rounded-full text-xs">
                                    {s.name}
                                  </span>
                                ))}
                                {p.specialties.length > 2 && (
                                  <span className="px-2 py-0.5 bg-gray-100 text-gray-600 dark:bg-gray-700 rounded-full text-xs">
                                    +{p.specialties.length - 2}
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                          <ChevronRightIcon className="h-5 w-5 text-gray-400 lg:hidden" />
                        </div>
                      </div>
                      
                      {/* Stats Grid */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                        <div className="text-center p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <p className="text-xs text-gray-500">Total</p>
                          <p className="text-sm sm:text-base font-bold">{p.stats?.totalConsultations || 0}</p>
                        </div>
                        <div className="text-center p-2 bg-green-50 dark:bg-green-900/20 rounded-lg">
                          <p className="text-xs text-green-600 dark:text-green-400">Completed</p>
                          <p className="text-sm sm:text-base font-bold text-green-700 dark:text-green-300">
                            {p.stats?.completed || 0}
                          </p>
                        </div>
                        <div className="text-center p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                          <p className="text-xs text-purple-600 dark:text-purple-400">Revenue</p>
                          <p className="text-sm sm:text-base font-bold text-purple-700 dark:text-purple-300">
                            KES {p.stats?.totalRevenue?.toLocaleString() || 0}
                          </p>
                        </div>
                        <div className="text-center p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                          <p className="text-xs text-yellow-600 dark:text-yellow-400">Rating</p>
                          <div className="flex items-center justify-center">
                            <StarIcon className="h-3 w-3 text-yellow-400 mr-1" />
                            <span className="text-sm sm:text-base font-bold">
                              {p.stats?.avgRating?.toFixed(1) || '0.0'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardBody>
                </Card>
              </Link>
            </motion.div>
          ))}

          {filteredPractitioners.length === 0 && (
            <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl">
              <p className="text-gray-500 dark:text-gray-400">No practitioners found</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}