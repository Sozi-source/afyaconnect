// app/components/ui/DatePicker.tsx
'use client'

import { useState, useMemo } from 'react'
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline'
import { Card, CardBody } from './Card'

interface DatePickerProps {
  selectedDate: string | null
  onSelectDate: (date: string) => void
  availableDates: Set<string>
}

const DAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

export function DatePicker({ selectedDate, onSelectDate, availableDates }: DatePickerProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  
  const daysInMonth = useMemo(() => {
    const year = currentMonth.getFullYear()
    const month = currentMonth.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    
    const days: (Date | null)[] = []
    // Add empty cells for days before month starts
    for (let i = 0; i < firstDay.getDay(); i++) {
      days.push(null)
    }
    // Add days of month
    for (let d = 1; d <= lastDay.getDate(); d++) {
      days.push(new Date(year, month, d))
    }
    return days
  }, [currentMonth])

  const isDateAvailable = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0]
    return availableDates.has(dateStr)
  }

  const isPastDate = (date: Date) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return date < today
  }

  const isToday = (date: Date) => {
    const today = new Date()
    return date.toDateString() === today.toDateString()
  }

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.setMonth(currentMonth.getMonth() + 1)))
  }

  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.setMonth(currentMonth.getMonth() - 1)))
  }

  return (
    <Card className="border-slate-200">
      <CardBody className="p-5">
        {/* Month Navigation */}
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={prevMonth}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <ChevronLeftIcon className="h-5 w-5 text-slate-600" />
          </button>
          <h3 className="font-semibold text-slate-800">
            {MONTHS[currentMonth.getMonth()]} {currentMonth.getFullYear()}
          </h3>
          <button
            onClick={nextMonth}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <ChevronRightIcon className="h-5 w-5 text-slate-600" />
          </button>
        </div>
        
        {/* Day Labels */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {DAYS.map(day => (
            <div key={day} className="text-center text-xs font-medium text-slate-400 py-2">
              {day}
            </div>
          ))}
        </div>
        
        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1">
          {daysInMonth.map((day, index) => {
            if (!day) {
              return <div key={`empty-${index}`} className="aspect-square" />
            }
            
            const dateStr = day.toISOString().split('T')[0]
            const isAvailable = isDateAvailable(day)
            const isPast = isPastDate(day)
            const isSelected = selectedDate === dateStr
            const isCurrentMonthDay = day.getMonth() === currentMonth.getMonth()
            
            // Determine styling
            let bgColor = 'bg-slate-50'
            let textColor = 'text-slate-400'
            let cursor = 'cursor-not-allowed'
            let ring = ''
            
            if (isAvailable && !isPast && isCurrentMonthDay) {
              bgColor = 'bg-emerald-50 hover:bg-emerald-100'
              textColor = 'text-emerald-700'
              cursor = 'cursor-pointer'
            }
            
            if (isSelected) {
              bgColor = 'bg-emerald-600 hover:bg-emerald-700'
              textColor = 'text-white'
              cursor = 'cursor-pointer'
            }
            
            if (isToday(day) && !isSelected) {
              ring = 'ring-2 ring-emerald-200'
            }
            
            return (
              <button
                key={dateStr}
                onClick={() => isAvailable && !isPast && isCurrentMonthDay && onSelectDate(dateStr)}
                disabled={!isAvailable || isPast || !isCurrentMonthDay}
                className={`
                  aspect-square rounded-lg text-sm font-medium transition-all
                  ${bgColor} ${textColor} ${cursor} ${ring}
                `}
                title={isAvailable ? 'Available' : 'Unavailable'}
              >
                {day.getDate()}
              </button>
            )
          })}
        </div>
        
        {/* Legend */}
        <div className="mt-4 flex items-center justify-center gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-emerald-50 rounded" />
            <span>Available</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-emerald-600 rounded" />
            <span>Selected</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-slate-50 rounded" />
            <span>Unavailable</span>
          </div>
        </div>
      </CardBody>
    </Card>
  )
}