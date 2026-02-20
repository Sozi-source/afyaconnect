'use client'

import { Practitioner } from '@/app/types'
import { Card, CardBody } from '@/app/components/ui/Card'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { StarIcon, MapPinIcon } from '@heroicons/react/24/solid'

interface PractitionerGridProps {
  practitioners: Practitioner[]
  isLoading: boolean
}

export function PractitionerGrid({ practitioners, isLoading }: PractitionerGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {[1, 2, 3, 4, 5, 6].map(i => (
          <div key={i} className="h-64 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse"></div>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
      {practitioners.map((practitioner, index) => (
        <motion.div
          key={practitioner.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: Math.min(index * 0.05, 0.5) }}
        >
          <Link href={`/dashboard/practitioners/${practitioner.id}`}>
            <Card hoverable className="h-full cursor-pointer">
              <CardBody className="p-4 sm:p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
                      Dr. {practitioner.first_name} {practitioner.last_name}
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-1">
                      {practitioner.email}
                    </p>
                  </div>
                  {practitioner.is_verified && (
                    <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                      Verified
                    </span>
                  )}
                </div>

                {practitioner.bio && (
                  <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 mb-3 line-clamp-2">
                    {practitioner.bio}
                  </p>
                )}

                {practitioner.city && (
                  <div className="flex items-center text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-2">
                    <MapPinIcon className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                    {practitioner.city}
                  </div>
                )}

                <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                  <div>
                    <span className="text-xs text-gray-500">Rate</span>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                      {practitioner.currency} {practitioner.hourly_rate}/hr
                    </p>
                  </div>
                  <div>
                    <span className="text-xs text-gray-500">Experience</span>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                      {practitioner.years_of_experience || 0} years
                    </p>
                  </div>
                </div>

                {practitioner.specialties && practitioner.specialties.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-3">
                    {practitioner.specialties.slice(0, 2).map(s => (
                      <span key={s.id} className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full">
                        {s.name}
                      </span>
                    ))}
                    {practitioner.specialties.length > 2 && (
                      <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full">
                        +{practitioner.specialties.length - 2}
                      </span>
                    )}
                  </div>
                )}
              </CardBody>
            </Card>
          </Link>
        </motion.div>
      ))}
    </div>
  )
}