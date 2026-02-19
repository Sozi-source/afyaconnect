'use client'

import { Practitioner } from '@/app/types'
import { Card, CardBody, CardHeader } from '@/app/components/ui/Card'
import { Badge } from '@/app/components/ui/Badge'
import { 
  MapPinIcon, 
  CurrencyDollarIcon, 
  StarIcon,
  EnvelopeIcon,
  PhoneIcon,
  CalendarIcon,
  CheckBadgeIcon
} from '@heroicons/react/24/solid'
import { ClockIcon } from '@heroicons/react/24/outline'

interface PractitionerProfileProps {
  practitioner: Practitioner
}

export const PractitionerProfile = ({ practitioner }: PractitionerProfileProps) => {
  const fullName = `${practitioner.first_name || ''} ${practitioner.last_name || ''}`.trim() || 'Practitioner'
  const specialties = practitioner.specialties?.map(s => s.name).join(', ') || 'No specialties listed'

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <Card>
        <CardBody>
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  {fullName}
                </h1>
                {practitioner.is_verified && (
                  <Badge variant="success" className="flex items-center gap-1">
                    <CheckBadgeIcon className="h-4 w-4" />
                    Verified
                  </Badge>
                )}
              </div>
              <p className="text-lg text-gray-600 dark:text-gray-400 mb-4">
                {specialties}
              </p>
              
              <div className="flex flex-wrap gap-4 text-sm">
                {practitioner.city && (
                  <div className="flex items-center text-gray-500 dark:text-gray-400">
                    <MapPinIcon className="h-5 w-5 mr-1" />
                    {practitioner.city}
                  </div>
                )}
                <div className="flex items-center text-gray-500 dark:text-gray-400">
                  <CurrencyDollarIcon className="h-5 w-5 mr-1" />
                  {practitioner.currency} {practitioner.hourly_rate}/hour
                </div>
                {practitioner.years_of_experience !== undefined && (
                  <div className="flex items-center text-gray-500 dark:text-gray-400">
                    <CalendarIcon className="h-5 w-5 mr-1" />
                    {practitioner.years_of_experience}+ years experience
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex gap-2">
              <button className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition">
                Book Consultation
              </button>
              <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-700 transition">
                Contact
              </button>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Bio Card */}
      <Card>
        <CardHeader>
          <h2 className="text-xl font-semibold">About</h2>
        </CardHeader>
        <CardBody>
          <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line">
            {practitioner.bio || 'No bio provided.'}
          </p>
        </CardBody>
      </Card>

      {/* Specialties Card */}
      {practitioner.specialties && practitioner.specialties.length > 0 && (
        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold">Specialties</h2>
          </CardHeader>
          <CardBody>
            <div className="flex flex-wrap gap-2">
              {practitioner.specialties.map((specialty) => (
                <Badge key={specialty.id} variant="primary" className="px-3 py-1">
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
          <h2 className="text-xl font-semibold">Contact Information</h2>
        </CardHeader>
        <CardBody>
          <div className="space-y-3">
            <div className="flex items-center text-gray-600 dark:text-gray-400">
              <EnvelopeIcon className="h-5 w-5 mr-3 text-gray-400" />
              <a href={`mailto:${practitioner.email}`} className="hover:text-primary-600">
                {practitioner.email}
              </a>
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  )
}