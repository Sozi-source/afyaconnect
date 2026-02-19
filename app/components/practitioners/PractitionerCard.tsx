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
  // Access first_name/last_name directly from practitioner (not nested under user)
  const fullName = `${practitioner.first_name || ''} ${practitioner.last_name || ''}`.trim() || 'Practitioner'
  
  // Get specialties names safely
  const specialties = practitioner.specialties?.map(s => s.name).join(', ') || ''

  return (
    <Link href={`/dashboard/practitioners/${practitioner.id}`}>
      <Card hoverable className="cursor-pointer h-full">
        <div className="relative h-40 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-t-xl">
          <div className="absolute inset-0 bg-black bg-opacity-20 rounded-t-xl" />
          <div className="absolute bottom-3 left-4 right-4">
            <h3 className="text-lg font-bold text-white truncate">{fullName}</h3>
            <p className="text-sm text-white text-opacity-90 truncate">{specialties}</p>
          </div>
          {practitioner.is_verified && (
            <Badge variant="success" className="absolute top-3 right-3">
              ✓ Verified
            </Badge>
          )}
        </div>
        
        <CardBody>
          <div className="space-y-3">
            <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2 min-h-[40px]">
              {practitioner.bio || 'No bio provided'}
            </p>
            
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center space-x-1 text-gray-500 dark:text-gray-400">
                <MapPinIcon className="h-4 w-4" />
                <span>{practitioner.city || 'Location N/A'}</span>
              </div>
              
              <div className="flex items-center space-x-1 text-gray-500 dark:text-gray-400">
                <CurrencyDollarIcon className="h-4 w-4" />
                <span>{practitioner.currency} {practitioner.hourly_rate}/hr</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-gray-700">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {practitioner.years_of_experience || 0}+ years exp.
              </span>
              
              <motion.span
                whileHover={{ x: 5 }}
                className="text-primary-600 hover:text-primary-700 font-medium text-sm dark:text-primary-400 flex items-center"
              >
                View Profile →
              </motion.span>
            </div>
          </div>
        </CardBody>
      </Card>
    </Link>
  )
}