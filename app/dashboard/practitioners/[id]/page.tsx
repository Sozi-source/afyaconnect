'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { apiClient } from '@/app/lib/api'
import { PractitionerProfile } from '@/app/components/practitioners/PractitionerProfile'
import { AvailabilityCalendar } from '@/app/components/practitioners/AvailabilityCalendar'
import { Button } from '@/app/components/ui/Buttons'
import { Card, CardBody } from '@/app/components/ui/Card'
import { motion } from 'framer-motion'
import { CalendarIcon, ChatBubbleLeftIcon, ArrowLeftIcon } from '@heroicons/react/24/outline'
import Link from 'next/link'

export default function PractitionerDetailPage() {
  const params = useParams()
  const router = useRouter()
  const id = parseInt(params.id as string)
  
  const [practitioner, setPractitioner] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchPractitioner = async () => {
      try {
        setLoading(true)
        const data = await apiClient.practitioners.getOne(id)
        setPractitioner(data)
      } catch (err: any) {
        console.error('❌ Error fetching practitioner:', err)
        setError(err.message || 'Failed to load practitioner')
      } finally {
        setLoading(false)
      }
    }

    fetchPractitioner()
  }, [id])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12 px-4">
        <h2 className="text-xl sm:text-2xl font-bold text-red-600 dark:text-red-400 mb-4">
          Error Loading Practitioner
        </h2>
        <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-6">{error}</p>
        <Link href="/dashboard/practitioners">
          <Button variant="outline">
            Back to Practitioners
          </Button>
        </Link>
      </div>
    )
  }

  if (!practitioner) {
    return (
      <div className="text-center py-12 px-4">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Practitioner not found
        </h2>
        <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-6">
          The practitioner you're looking for doesn't exist or has been removed.
        </p>
        <Link href="/dashboard/practitioners">
          <Button variant="outline">
            Back to Practitioners
          </Button>
        </Link>
      </div>
    )
  }

  // Get the practitioner's name safely
  const practitionerName = practitioner.first_name || 
                          (practitioner.user as any)?.first_name || 
                          'this practitioner'

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="space-y-4 sm:space-y-6"
    >
      {/* Mobile Back Button */}
      <div className="lg:hidden">
        <Link href="/dashboard/practitioners">
          <Button variant="outline" size="sm" className="!px-3">
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
            Back to Practitioners
          </Button>
        </Link>
      </div>

      <PractitionerProfile practitioner={practitioner} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        <div className="lg:col-span-2">
          <AvailabilityCalendar practitionerId={practitioner.id} />
        </div>

        <div className="space-y-4 sm:space-y-6">
          {/* Book Consultation Card */}
          <Card>
            <CardBody className="p-4 sm:p-6">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-3">
                Book a Consultation
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Ready to start your journey? Book a consultation with {practitionerName}.
              </p>
              <Link href={`/dashboard/consultations/create?practitioner=${practitioner.id}`}>
                <Button fullWidth className="text-sm sm:text-base">
                  <CalendarIcon className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                  Book Now
                </Button>
              </Link>
            </CardBody>
          </Card>

          {/* Message Card */}
          <Card>
            <CardBody className="p-4 sm:p-6">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-3">
                Have Questions?
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Send a message before booking.
              </p>
              <Button variant="outline" fullWidth className="text-sm sm:text-base">
                <ChatBubbleLeftIcon className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                Send Message
              </Button>
            </CardBody>
          </Card>
        </div>
      </div>
    </motion.div>
  )
}