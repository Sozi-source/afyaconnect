'use client'

import { Practitioner } from '@/app/types'
import { Card, CardBody, CardHeader } from '@/app/components/ui/Card'
import { Badge } from '@/app/components/ui/Badge'
import { 
  MapPinIcon, 
  CurrencyDollarIcon, 
  EnvelopeIcon,
  CalendarIcon,
  CheckBadgeIcon
} from '@heroicons/react/24/solid'
import { motion } from 'framer-motion'

interface PractitionerProfileProps {
  practitioner: Practitioner
}

export const PractitionerProfile = ({ practitioner }: PractitionerProfileProps) => {
  const fullName = `${practitioner.first_name || ''} ${practitioner.last_name || ''}`.trim() || 'Practitioner'
  const specialties = practitioner.specialties?.map(s => s.name).join(', ') || 'No specialties listed'

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header Card */}
      <Card>
        <CardBody className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div>
              <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-2">
                <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
                  {fullName}
                </h1>
                {practitioner.is_verified && (
                  <Badge variant="success" className="flex items-center gap-1 text-xs sm:text-sm px-2 py-1">
                    <CheckBadgeIcon className="h-3 w-3 sm:h-4 sm:w-4" />
                    Verified
                  </Badge>
                )}
              </div>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-3 sm:mb-4">
                {specialties}
              </p>
              
              <div className="flex flex-wrap gap-3 sm:gap-4 text-xs sm:text-sm">
                {practitioner.city && (
                  <div className="flex items-center text-gray-500 dark:text-gray-400">
                    <MapPinIcon className="h-4 w-4 sm:h-5 sm:w-5 mr-1 flex-shrink-0" />
                    <span>{practitioner.city}</span>
                  </div>
                )}
                <div className="flex items-center text-gray-500 dark:text-gray-400">
                  <CurrencyDollarIcon className="h-4 w-4 sm:h-5 sm:w-5 mr-1 flex-shrink-0" />
                  <span>{practitioner.currency} {practitioner.hourly_rate}/hr</span>
                </div>
                {practitioner.years_of_experience !== undefined && (
                  <div className="flex items-center text-gray-500 dark:text-gray-400">
                    <CalendarIcon className="h-4 w-4 sm:h-5 sm:w-5 mr-1 flex-shrink-0" />
                    <span>{practitioner.years_of_experience}+ years</span>
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex flex-col xs:flex-row gap-2">
              <button className="px-4 sm:px-6 py-2.5 sm:py-2 bg-blue-600 text-white text-sm sm:text-base rounded-xl hover:bg-blue-700 transition active:scale-95">
                Book Consultation
              </button>
              <button className="px-4 sm:px-6 py-2.5 sm:py-2 border border-gray-300 dark:border-gray-600 text-sm sm:text-base rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition active:scale-95">
                Contact
              </button>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Bio Card */}
      <Card>
        <CardHeader>
          <h2 className="text-lg sm:text-xl font-semibold">About</h2>
        </CardHeader>
        <CardBody className="p-4 sm:p-6">
          <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300 whitespace-pre-line">
            {practitioner.bio || 'No bio provided.'}
          </p>
        </CardBody>
      </Card>

      {/* Specialties Card */}
      {practitioner.specialties && practitioner.specialties.length > 0 && (
        <Card>
          <CardHeader>
            <h2 className="text-lg sm:text-xl font-semibold">Specialties</h2>
          </CardHeader>
          <CardBody className="p-4 sm:p-6">
            <div className="flex flex-wrap gap-2">
              {practitioner.specialties.map((specialty) => (
                <Badge key={specialty.id} variant="primary" className="px-2 sm:px-3 py-1 text-xs sm:text-sm">
                  {specialty.name}
                </Badge>
              ))}
            </div>
          </CardBody>
        </Card>
      )}

      {/* Contact Info Card */}
      <Card>
        <CardHeader>
          <h2 className="text-lg sm:text-xl font-semibold">Contact Information</h2>
        </CardHeader>
        <CardBody className="p-4 sm:p-6">
          <div className="space-y-3">
            <div className="flex items-center text-sm sm:text-base text-gray-600 dark:text-gray-400">
              <EnvelopeIcon className="h-5 w-5 sm:h-5 sm:w-5 mr-3 text-gray-400 flex-shrink-0" />
              <a href={`mailto:${practitioner.email}`} className="hover:text-blue-600 truncate">
                {practitioner.email}
              </a>
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  )
}