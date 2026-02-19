'use client'

import { useParams } from 'next/navigation'
import useSWR from 'swr'
import { practitionersApi } from '@/app/lib/api'
import { PractitionerProfile } from '@/app/components/practitioners/PractitionerProfile'
import { AvailabilityCalendar } from '@/app/components/practitioners/AvailabilityCalendar'
import { Button } from '@/app/components/ui/Buttons'
import { Card, CardBody } from '@/app/components/ui/Card'
import { motion } from 'framer-motion'
import { CalendarIcon, ChatBubbleLeftIcon } from '@heroicons/react/24/outline'
import Link from 'next/link'
import { useEffect } from 'react'

export default function PractitionerDetailPage() {
  const params = useParams()
  const id = parseInt(params.id as string)

  const { data: practitioner, error, isLoading } = useSWR(
    `practitioner-${id}`,
    () => practitionersApi.getOne(id),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    }
  )

  // Debug: log practitioner data
  useEffect(() => {
    if (practitioner) {
      console.log('📊 Practitioner data:', practitioner)
    }
    if (error) {
      console.error('❌ Error fetching practitioner:', error)
    }
  }, [practitioner, error])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-red-600 dark:text-red-400 mb-4">
          Error Loading Practitioner
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          {error.message || 'Failed to load practitioner details'}
        </p>
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
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Practitioner not found
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
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

  // Get the practitioner's name safely (based on your serializer structure)
  const practitionerName = practitioner.first_name || 
                          (practitioner.user as any)?.first_name || 
                          'this practitioner'

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <PractitionerProfile practitioner={practitioner} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <AvailabilityCalendar practitionerId={practitioner.id} />
        </div>

        <div className="space-y-6">
          <Card>
            <CardBody>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Book a Consultation
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Ready to start your journey? Book a consultation with {practitionerName}.
              </p>
              <Link href={`/dashboard/consultations/create?practitioner=${practitioner.id}`}>
                <Button fullWidth>
                  <CalendarIcon className="h-5 w-5 mr-2" />
                  Book Now
                </Button>
              </Link>
            </CardBody>
          </Card>

          <Card>
            <CardBody>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Have Questions?
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Send a message before booking.
              </p>
              <Button variant="outline" fullWidth>
                <ChatBubbleLeftIcon className="h-5 w-5 mr-2" />
                Send Message
              </Button>
            </CardBody>
          </Card>
        </div>
      </div>
    </motion.div>
  )
}