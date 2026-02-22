'use client'

import { useState, useEffect } from 'react'
import { apiClient } from '@/app/lib/api'
import { Card, CardBody, CardHeader } from '@/app/components/ui/Card'
import { Button } from '@/app/components/ui/Buttons'
import Link from 'next/link'
import { 
  CalendarIcon, 
  ClockIcon, 
  UserGroupIcon,
  ChevronRightIcon,
  StarIcon
} from '@heroicons/react/24/outline'
import { motion } from 'framer-motion'
import { Consultation, Practitioner, PaginatedResponse } from '@/app/types'

export default function ClientDashboardPage() {
  const [upcomingConsultations, setUpcomingConsultations] = useState<Consultation[]>([])
  const [recommendedPractitioners, setRecommendedPractitioners] = useState<Practitioner[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Fetch upcoming consultations for current client
      const consultationsResponse = await apiClient.consultations.getMyClientConsultations({
        status: 'booked'
      })
      
      // Handle response
      let consultations: Consultation[] = []
      if (Array.isArray(consultationsResponse)) {
        consultations = consultationsResponse
      } else if (consultationsResponse && 'results' in consultationsResponse) {
        consultations = (consultationsResponse as PaginatedResponse<Consultation>).results
      }
      
      setUpcomingConsultations(consultations.slice(0, 3)) // Show only 3 most recent

      // Fetch recommended practitioners (verified practitioners)
      const practitionersResponse = await apiClient.practitioners.getAll({
        verified: true,
        limit: 4
      })
      
      // Handle response
      let practitioners: Practitioner[] = []
      if (Array.isArray(practitionersResponse)) {
        practitioners = practitionersResponse
      } else if (practitionersResponse && 'results' in practitionersResponse) {
        practitioners = (practitionersResponse as PaginatedResponse<Practitioner>).results
      }
      
      setRecommendedPractitioners(practitioners.slice(0, 4))
      
    } catch (error: any) {
      console.error('Failed to fetch dashboard data:', error)
      setError(error.message || 'Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-32 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse"></div>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
        <Button onClick={fetchDashboardData}>Try Again</Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Welcome back!</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Here's what's happening with your health journey</p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Link href="/client/dashboard/consultations/book">
          <Card hoverable className="text-center p-4 cursor-pointer">
            <CalendarIcon className="h-6 w-6 mx-auto mb-2 text-blue-500" />
            <h3 className="text-sm font-medium dark:text-white">Book</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">New consultation</p>
          </Card>
        </Link>
        <Link href="/client/dashboard/practitioners">
          <Card hoverable className="text-center p-4 cursor-pointer">
            <UserGroupIcon className="h-6 w-6 mx-auto mb-2 text-green-500" />
            <h3 className="text-sm font-medium dark:text-white">Find</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">Practitioners</p>
          </Card>
        </Link>
        <Link href="/client/dashboard/consultations">
          <Card hoverable className="text-center p-4 cursor-pointer">
            <ClockIcon className="h-6 w-6 mx-auto mb-2 text-purple-500" />
            <h3 className="text-sm font-medium dark:text-white">View</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">History</p>
          </Card>
        </Link>
        <Link href="/client/dashboard/favourites">
          <Card hoverable className="text-center p-4 cursor-pointer">
            <StarIcon className="h-6 w-6 mx-auto mb-2 text-yellow-500" />
            <h3 className="text-sm font-medium dark:text-white">Favourites</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">Saved practitioners</p>
          </Card>
        </Link>
      </div>

      {/* Upcoming Consultations */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold dark:text-white">Upcoming Consultations</h2>
            <Link href="/client/dashboard/consultations" className="text-sm text-emerald-600 hover:text-emerald-700 dark:text-emerald-400">
              View all
            </Link>
          </div>
        </CardHeader>
        <CardBody className="p-4">
          {upcomingConsultations.length > 0 ? (
            <div className="space-y-3">
              {upcomingConsultations.map((consultation) => (
                <Link
                  key={consultation.id}
                  href={`/client/dashboard/consultations/${consultation.id}`}
                  className="block p-3 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        Dr. {consultation.practitioner_name || 'Unknown'}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {new Date(consultation.date).toLocaleDateString()} at {consultation.time}
                      </p>
                    </div>
                    <ChevronRightIcon className="h-5 w-5 text-gray-400" />
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500 dark:text-gray-400 mb-3">No upcoming consultations</p>
              <Link href="/client/dashboard/consultations/book">
                <Button size="sm">Book a consultation</Button>
              </Link>
            </div>
          )}
        </CardBody>
      </Card>

      {/* Recommended Practitioners */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold dark:text-white">Recommended Practitioners</h2>
            <Link href="/client/dashboard/practitioners" className="text-sm text-emerald-600 hover:text-emerald-700 dark:text-emerald-400">
              View all
            </Link>
          </div>
        </CardHeader>
        <CardBody className="p-4">
          {recommendedPractitioners.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {recommendedPractitioners.map((practitioner) => (
                <Link
                  key={practitioner.id}
                  href={`/client/dashboard/practitioners/${practitioner.id}`}
                  className="block p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-emerald-300 dark:hover:border-emerald-700 hover:shadow-sm transition"
                >
                  <h3 className="font-medium text-gray-900 dark:text-white">{practitioner.full_name}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{practitioner.city}</p>
                  <p className="text-sm text-emerald-600 dark:text-emerald-400 mt-1">
                    KES {practitioner.hourly_rate}/hr
                  </p>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500 dark:text-gray-400 py-4">No practitioners found</p>
          )}
        </CardBody>
      </Card>
    </div>
  )
}