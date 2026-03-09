// app/components/practitioner/profile/PractitionerProfile.tsx
'use client'

import { Practitioner, UserProfile } from '@/app/types'
import { Card, CardBody } from '@/app/components/ui/Card'
import { Badge } from '@/app/components/ui/Badge'
import { Button } from '@/app/components/ui/Buttons'
import { 
  MapPinIcon, 
  CurrencyDollarIcon, 
  EnvelopeIcon,
  CalendarIcon,
  BriefcaseIcon,
  PhoneIcon,
  StarIcon
} from '@heroicons/react/24/outline'
import { useRouter } from 'next/navigation'
import { formatCurrency } from '@/app/lib/utils'

interface PractitionerProfileProps {
  practitioner: Practitioner
  profile?: UserProfile | null
}

export const PractitionerProfile = ({ practitioner, profile }: PractitionerProfileProps) => {
  const router = useRouter()
  
  const fullName = `Dr. ${practitioner.first_name || ''} ${practitioner.last_name || ''}`.trim()
  const initials = `${practitioner.first_name?.[0] || ''}${practitioner.last_name?.[0] || ''}` || 'DR'
  const specialties = practitioner.specialties?.map(s => s.name).join(' • ') || 'General Practitioner'
  const isVerified = practitioner.is_verified || false

  return (
    <div className="space-y-5">
      {/* Profile Header Card */}
      <Card>
        <CardBody className="p-5">
          <div className="flex items-start gap-4">
            {/* Avatar */}
            <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-semibold text-xl border-2 border-emerald-200">
              {initials}
            </div>
            
            {/* Basic Info */}
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-xl font-semibold text-gray-900">{fullName}</h1>
                {isVerified && (
                  <Badge variant="success" className="text-xs px-2 py-0.5">Verified</Badge>
                )}
              </div>
              <p className="text-sm text-gray-600 mb-2">{specialties}</p>
              
              {/* Meta Info */}
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-gray-500">
                {practitioner.city && (
                  <span className="flex items-center gap-1">
                    <MapPinIcon className="h-3.5 w-3.5" />
                    {practitioner.city}
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <BriefcaseIcon className="h-3.5 w-3.5" />
                  {practitioner.years_of_experience || 0} years
                </span>
                <span className="flex items-center gap-1">
                  <CurrencyDollarIcon className="h-3.5 w-3.5" />
                  {practitioner.currency || 'KES'} {formatCurrency(practitioner.hourly_rate || 0)}/hr
                </span>
              </div>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Bio Card */}
      {practitioner.bio && (
        <Card>
          <CardBody className="p-5">
            <h2 className="text-sm font-medium text-gray-700 mb-2">About</h2>
            <p className="text-sm text-gray-600 leading-relaxed">{practitioner.bio}</p>
          </CardBody>
        </Card>
      )}

      {/* Contact Card */}
      <Card>
        <CardBody className="p-5">
          <h2 className="text-sm font-medium text-gray-700 mb-3">Contact</h2>
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <EnvelopeIcon className="h-4 w-4 text-gray-400" />
              <a href={`mailto:${practitioner.email}`} className="hover:text-emerald-600">
                {practitioner.email}
              </a>
            </div>
            {profile?.phone && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <PhoneIcon className="h-4 w-4 text-gray-400" />
                <a href={`tel:${profile.phone}`} className="hover:text-emerald-600">
                  {profile.phone}
                </a>
              </div>
            )}
          </div>
        </CardBody>
      </Card>

      {/* Actions */}
      <div className="flex gap-3">
        <Button 
          onClick={() => router.push('/practitioner/dashboard/consultations')}
          className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white"
        >
          View Consultations
        </Button>
        <Button 
          variant="outline" 
          onClick={() => router.push('/practitioner/dashboard/settings')}
          className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-50"
        >
          Settings
        </Button>
      </div>
    </div>
  )
}