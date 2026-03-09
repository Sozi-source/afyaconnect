// app/components/ui/TimeSlotPicker.tsx
'use client'

import { ClockIcon } from '@heroicons/react/24/outline'
import { Card, CardBody, CardHeader } from './Card'

interface TimeSlot {
  id: number
  time: string
  endTime?: string
  isAvailable?: boolean
}

interface TimeSlotPickerProps {
  slots: TimeSlot[]
  selectedTime: string | null
  onSelectTime: (time: string) => void
  loading?: boolean
}

export function TimeSlotPicker({ 
  slots, 
  selectedTime, 
  onSelectTime,
  loading = false 
}: TimeSlotPickerProps) {
  
  const formatTimeDisplay = (time: string) => {
    return new Date(`2000-01-01T${time}`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    })
  }

  const groupSlotsByTimeOfDay = (slots: TimeSlot[]) => {
    const morning: TimeSlot[] = []
    const afternoon: TimeSlot[] = []
    const evening: TimeSlot[] = []
    
    slots.forEach(slot => {
      const hour = parseInt(slot.time.split(':')[0])
      if (hour < 12) {
        morning.push(slot)
      } else if (hour < 17) {
        afternoon.push(slot)
      } else {
        evening.push(slot)
      }
    })
    
    return { morning, afternoon, evening }
  }

  const { morning, afternoon, evening } = groupSlotsByTimeOfDay(slots)

  const renderTimeSlots = (timeSlots: TimeSlot[], title: string) => {
    if (timeSlots.length === 0) return null
    
    return (
      <div className="space-y-2">
        <h4 className="text-xs font-medium text-slate-400 uppercase tracking-wider">{title}</h4>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {timeSlots.map(slot => (
            <button
              key={slot.id}
              onClick={() => onSelectTime(slot.time)}
              disabled={!slot.isAvailable}
              className={`
                p-3 rounded-lg text-sm font-medium transition-all
                ${selectedTime === slot.time
                  ? 'bg-emerald-600 text-white shadow-md ring-2 ring-emerald-300'
                  : slot.isAvailable
                    ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                    : 'bg-slate-50 text-slate-400 cursor-not-allowed'
                }
              `}
            >
              {formatTimeDisplay(slot.time)}
            </button>
          ))}
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <Card className="border-slate-200">
        <CardBody className="p-8">
          <div className="flex flex-col items-center justify-center">
            <div className="relative">
              <div className="w-12 h-12 border-4 border-emerald-100 border-t-emerald-600 rounded-full animate-spin" />
              <ClockIcon className="w-5 h-5 text-emerald-600 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
            </div>
            <p className="mt-3 text-sm text-slate-500">Loading available times...</p>
          </div>
        </CardBody>
      </Card>
    )
  }

  if (slots.length === 0) {
    return (
      <Card className="border-slate-200">
        <CardBody className="p-8 text-center">
          <ClockIcon className="h-12 w-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-sm font-medium text-slate-800 mb-1">No Times Available</h3>
          <p className="text-xs text-slate-500">Please select another date</p>
        </CardBody>
      </Card>
    )
  }

  return (
    <Card className="border-slate-200">
      <CardHeader>
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-slate-800 flex items-center gap-2">
            <ClockIcon className="w-5 h-5 text-emerald-600" />
            Available Times
          </h3>
          <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full">
            {slots.length} slots
          </span>
        </div>
      </CardHeader>
      
      <CardBody className="p-5 space-y-6">
        {renderTimeSlots(morning, 'Morning')}
        {renderTimeSlots(afternoon, 'Afternoon')}
        {renderTimeSlots(evening, 'Evening')}
      </CardBody>

      {/* Footer with timezone info */}
      <div className="px-5 pb-4 pt-2 border-t border-slate-100">
        <p className="text-xs text-slate-400 flex items-center gap-1">
          <ClockIcon className="w-3 h-3" />
          All times shown in your local timezone
        </p>
      </div>
    </Card>
  )
}