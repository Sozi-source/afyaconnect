'use client'

import { Practitioner } from '@/app/types'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { 
  MapPinIcon, 
  CurrencyDollarIcon, 
  BriefcaseIcon,
  CheckBadgeIcon,
  ExclamationCircleIcon
} from '@heroicons/react/24/outline'

interface PractitionerGridProps {
  practitioners: Practitioner[]
  isLoading?: boolean
}

export function PractitionerGrid({ practitioners, isLoading }: PractitionerGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 animate-pulse">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-4"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-2"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
          </div>
        ))}
      </div>
    )
  }

  if (practitioners.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600 dark:text-gray-400">No practitioners found</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {practitioners.map((practitioner, index) => (
        <motion.div
          key={practitioner.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <Link href={`/dashboard/practitioners/${practitioner.id}`}>
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md transition-all p-6 relative group">
              {/* Status Badges */}
              <div className="absolute top-4 right-4 flex gap-2">
                {!practitioner.profile_complete && (
                  <div className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300 text-xs px-2 py-1 rounded-full flex items-center gap-1">
                    <ExclamationCircleIcon className="h-3 w-3" />
                    <span>Incomplete</span>
                  </div>
                )}
                {practitioner.is_verified && (
                  <div className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 text-xs px-2 py-1 rounded-full flex items-center gap-1">
                    <CheckBadgeIcon className="h-3 w-3" />
                    <span>Verified</span>
                  </div>
                )}
              </div>

              {/* Profile Info */}
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                  {practitioner.full_name}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                  {practitioner.bio || 'No bio added yet'}
                </p>
              </div>

              {/* Details */}
              <div className="space-y-2 mb-4">
                <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                  <MapPinIcon className="h-4 w-4 mr-2 flex-shrink-0" />
                  <span>{practitioner.city || 'Location not set'}</span>
                </div>
                <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                  <CurrencyDollarIcon className="h-4 w-4 mr-2 flex-shrink-0" />
                  <span>
                    {practitioner.hourly_rate 
                      ? `KES ${practitioner.hourly_rate}/hr` 
                      : 'Rate not set'}
                  </span>
                </div>
                <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                  <BriefcaseIcon className="h-4 w-4 mr-2 flex-shrink-0" />
                  <span>
                    {practitioner.years_of_experience 
                      ? `${practitioner.years_of_experience} years experience`
                      : 'Experience not set'}
                  </span>
                </div>
              </div>

              {/* Specialties */}
              {practitioner.specialties && practitioner.specialties.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {practitioner.specialties.slice(0, 3).map((spec) => (
                    <span
                      key={spec.id}
                      className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 text-xs rounded-full"
                    >
                      {spec.name}
                    </span>
                  ))}
                  {practitioner.specialties.length > 3 && (
                    <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs rounded-full">
                      +{practitioner.specialties.length - 3} more
                    </span>
                  )}
                </div>
              )}

              {/* Incomplete Profile Warning */}
              {!practitioner.profile_complete && (
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <p className="text-xs text-yellow-600 dark:text-yellow-400 flex items-center gap-1">
                    <ExclamationCircleIcon className="h-4 w-4" />
                    This practitioner is still setting up their profile
                  </p>
                </div>
              )}

              {/* View Profile Button */}
              <div className="mt-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="text-sm text-blue-600 dark:text-blue-400 font-medium">
                  View Profile →
                </span>
              </div>
            </div>
          </Link>
        </motion.div>
      ))}
    </div>
  )
}