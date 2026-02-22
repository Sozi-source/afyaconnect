'use client'

import React from 'react'
import Link from 'next/link'
import { Practitioner } from '@/app/types'
import { Card, CardBody } from '@/app/components/ui/Card'
import { Badge } from '@/app/components/ui/Badge'
import { MapPinIcon, CurrencyDollarIcon } from '@heroicons/react/24/solid'
import { motion } from 'framer-motion'

interface PractitionerCardProps {
  practitioner: Practitioner
}

export const PractitionerCard: React.FC<PractitionerCardProps> = ({ practitioner }) => {
  const fullName = `${practitioner.first_name || ''} ${practitioner.last_name || ''}`.trim() || 'Practitioner'
  const specialties = practitioner.specialties?.map(s => s.name).join(', ') || ''
  const displayName = fullName.length > 20 ? fullName.substring(0, 20) + '...' : fullName
  const displaySpecialties = specialties.length > 30 ? specialties.substring(0, 30) + '...' : specialties

  return (
    <Link href={`/dashboard/practitioners/${practitioner.id}`} className="block h-full">
      <Card hoverable className="cursor-pointer h-full overflow-hidden">
        {/* Header with gradient */}
        <div className="relative h-32 sm:h-36 md:h-40 bg-gradient-to-br from-blue-500 to-indigo-500">
          <div className="absolute inset-0 bg-black/20" />
          <div className="absolute bottom-2 sm:bottom-3 left-3 sm:left-4 right-3 sm:right-4">
            <h3 className="text-base sm:text-lg font-bold text-white truncate">
              {displayName}
            </h3>
            <p className="text-xs sm:text-sm text-white/90 truncate">
              {displaySpecialties || 'Practitioner'}
            </p>
          </div>
          {practitioner.is_verified && (
            <Badge variant="success" className="absolute top-2 sm:top-3 right-2 sm:right-3 text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5">
              ✓ Verified
            </Badge>
          )}
        </div>
        
        <CardBody className="p-3 sm:p-4">
          <div className="space-y-2 sm:space-y-3">
            {/* Bio */}
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 line-clamp-2 min-h-[32px] sm:min-h-[40px]">
              {practitioner.bio || 'No bio provided'}
            </p>
            
            {/* Location & Rate */}
            <div className="flex flex-col xs:flex-row xs:items-center xs:justify-between gap-1 xs:gap-0 text-xs sm:text-sm">
              <div className="flex items-center space-x-1 text-gray-500 dark:text-gray-400">
                <MapPinIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4 flex-shrink-0" />
                <span className="truncate max-w-[100px] sm:max-w-[120px]">
                  {practitioner.city || 'Location N/A'}
                </span>
              </div>
              
              <div className="flex items-center space-x-1 text-gray-500 dark:text-gray-400">
                <CurrencyDollarIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4 flex-shrink-0" />
                <span className="whitespace-nowrap">
                  {practitioner.currency} {practitioner.hourly_rate}/hr
                </span>
              </div>
            </div>
            
            {/* Footer */}
            <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-gray-700">
              <span className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">
                {practitioner.years_of_experience || 0}+ yrs
              </span>
              
              <motion.span
                whileHover={{ x: 3 }}
                className="text-blue-600 hover:text-blue-700 font-medium text-xs sm:text-sm dark:text-blue-400 flex items-center"
              >
                View Profile
                <svg className="h-3 w-3 sm:h-4 sm:w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </motion.span>
            </div>
          </div>
        </CardBody>
      </Card>
    </Link>
  )
}