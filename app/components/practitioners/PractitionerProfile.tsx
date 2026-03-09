'use client'

import { StarIcon } from '@heroicons/react/24/solid'
import { MapPinIcon, CheckBadgeIcon } from '@heroicons/react/24/outline'
import type { Practitioner } from '@/app/types'

export function PractitionerProfile({ practitioner }: { practitioner: Practitioner }) {
  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-slate-200/60 p-6 sm:p-8">
      <div className="flex flex-col sm:flex-row gap-6">
        {/* Avatar */}
        <div className="relative">
          <div className="w-28 h-28 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center text-white font-bold text-4xl shadow-lg">
            {practitioner.first_name?.[0]}{practitioner.last_name?.[0]}
          </div>
          {practitioner.is_verified && (
            <div className="absolute -bottom-2 -right-2 bg-emerald-500 rounded-full p-1 border-4 border-white">
              <CheckBadgeIcon className="w-5 h-5 text-white" />
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-800">
            Dr. {practitioner.first_name} {practitioner.last_name}
          </h1>
          
          <div className="flex items-center gap-2 mt-2">
            <div className="flex items-center gap-1">
              <StarIcon className="w-5 h-5 text-amber-400" />
              <span className="font-medium text-slate-700">
                {practitioner.average_rating?.toFixed(1) || 'New'}
              </span>
            </div>
            <span className="text-slate-300">•</span>
            <span className="text-slate-600">{practitioner.total_reviews || 0} reviews</span>
          </div>

          <div className="flex items-center gap-2 mt-3 text-slate-600">
            <MapPinIcon className="w-5 h-5" />
            <span>{practitioner.city || 'Location not specified'}</span>
          </div>

          <div className="flex flex-wrap gap-2 mt-4">
            {practitioner.specialties?.map(s => (
              <span key={s.id} className="px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-sm font-medium">
                {s.name}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}