'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import {
  CalendarDaysIcon,
  ClockIcon,
  UserCircleIcon,
  MapPinIcon,
  CurrencyDollarIcon,
  BriefcaseIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CheckCircleIcon,
  XMarkIcon,
  ArrowLeftIcon,
  MagnifyingGlassIcon,
  FunnelIcon
} from '@heroicons/react/24/outline'
import { useAuth } from '@/app/contexts/AuthContext'
import { apiClient } from '@/app/lib/api'
import type { Practitioner, Availability } from '@/app/types'

type Step = 'practitioners' | 'datetime' | 'details' | 'confirmation' | 'success'

interface SelectedSlot {
  date: string
  time: string
  practitionerId: number
  practitionerName: string
}

interface DayCell {
  date: Date
  dateStr: string
  hasSlot: boolean
}

export default function NewBookingPage() {
  const { user, isAuthenticated } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const preselectedId = searchParams.get('practitioner')

  const [currentStep, setCurrentStep] = useState<Step>('practitioners')
  const [practitioners, setPractitioners] = useState<Practitioner[]>([])
  const [selectedPractitioner, setSelectedPractitioner] = useState<Practitioner | null>(null)
  const [availability, setAvailability] = useState<Availability[]>([])
  const [selectedSlot, setSelectedSlot] = useState<SelectedSlot | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const [duration, setDuration] = useState(60)
  const [notes, setNotes] = useState('')
  const [consultationType, setConsultationType] = useState<'video' | 'in-person' | 'phone'>('video')

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login')
      return
    }
    fetchPractitioners()
  }, [isAuthenticated, router])

  useEffect(() => {
    if (preselectedId && practitioners.length > 0) {
      const practitioner = practitioners.find(p => p.id === parseInt(preselectedId))
      if (practitioner) {
        handleSelectPractitioner(practitioner)
      }
    }
  }, [preselectedId, practitioners])

  const fetchPractitioners = async () => {
    try {
      setLoading(true)
      const data = await apiClient.practitioners.getAll({ verified: true })
      setPractitioners(Array.isArray(data) ? data : [])
    } catch (error) {
      setError('Failed to load practitioners')
    } finally {
      setLoading(false)
    }
  }

  const fetchAvailability = async (practitionerId: number) => {
    try {
      setLoading(true)
      setError(null)
      const data = await apiClient.availability.getAll(practitionerId)
      setAvailability(Array.isArray(data) ? data : [])
      
      if (data.length === 0) {
        setError('This practitioner has no availability yet')
      }
    } catch (error) {
      setError('Failed to load availability')
    } finally {
      setLoading(false)
    }
  }

  const handleSelectPractitioner = (practitioner: Practitioner) => {
    setSelectedPractitioner(practitioner)
    fetchAvailability(practitioner.id)
    setCurrentStep('datetime')
  }

  const handleSelectSlot = (date: string, time: string) => {
    if (!selectedPractitioner) return
    setSelectedSlot({
      date,
      time,
      practitionerId: selectedPractitioner.id,
      practitionerName: `Dr. ${selectedPractitioner.first_name} ${selectedPractitioner.last_name}`
    })
    setCurrentStep('details')
  }

  const handleBack = () => {
    if (currentStep === 'datetime') {
      setSelectedPractitioner(null)
      setCurrentStep('practitioners')
    } else if (currentStep === 'details') {
      setCurrentStep('datetime')
    } else if (currentStep === 'confirmation') {
      setCurrentStep('details')
    }
  }

  const handleContinueToConfirmation = () => {
    setCurrentStep('confirmation')
  }

  const handleConfirmBooking = async () => {
    if (!selectedPractitioner || !selectedSlot) return

    try {
      setLoading(true)
      await apiClient.consultations.create({
        practitioner: selectedPractitioner.id,
        date: selectedSlot.date,
        time: selectedSlot.time,
        duration_minutes: duration,
        client_notes: notes.trim() || undefined
      })
      setCurrentStep('success')
    } catch (error) {
      setError('Failed to book consultation')
    } finally {
      setLoading(false)
    }
  }

  const handleReset = () => {
    setSelectedPractitioner(null)
    setSelectedSlot(null)
    setCurrentStep('practitioners')
    setNotes('')
    setDuration(60)
    setConsultationType('video')
  }

  const formatPrice = (price: number) => `KES ${price.toLocaleString()}`

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link
              href="/client/dashboard/consultations"
              className="p-2 hover:bg-white/50 dark:hover:bg-slate-800 rounded-xl transition"
            >
              <ArrowLeftIcon className="h-5 w-5 text-slate-600 dark:text-slate-400" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Book Consultation</h1>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                {currentStep === 'practitioners' && 'Choose your practitioner'}
                {currentStep === 'datetime' && 'Select date and time'}
                {currentStep === 'details' && 'Add consultation details'}
                {currentStep === 'confirmation' && 'Review and confirm'}
                {currentStep === 'success' && 'Booking confirmed!'}
              </p>
            </div>
          </div>
          
          {/* Step Indicator */}
          <div className="flex items-center gap-2">
            {['practitioners', 'datetime', 'details', 'confirmation'].map((step, index) => {
              const stepNumber = index + 1
              const isActive = currentStep === step
              const isPast = ['practitioners', 'datetime', 'details', 'confirmation'].indexOf(currentStep) > index
              
              return (
                <div key={step} className="flex items-center">
                  <div className={`
                    w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
                    ${isActive 
                      ? 'bg-emerald-600 text-white ring-4 ring-emerald-100 dark:ring-emerald-900/30' 
                      : isPast
                        ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400'
                        : 'bg-slate-200 text-slate-500 dark:bg-slate-800 dark:text-slate-500'
                    }
                  `}>
                    {isPast ? <CheckCircleIcon className="h-4 w-4" /> : stepNumber}
                  </div>
                  {index < 3 && (
                    <div className={`
                      w-12 h-0.5 mx-1
                      ${isPast ? 'bg-emerald-500' : 'bg-slate-200 dark:bg-slate-800'}
                    `} />
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Error Message */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mb-6 p-4 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 rounded-2xl flex items-center gap-3"
            >
              <XMarkIcon className="h-5 w-5 text-rose-600 dark:text-rose-400 flex-shrink-0" />
              <p className="text-sm text-rose-700 dark:text-rose-300">{error}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Content */}
        <AnimatePresence mode="wait">
          {currentStep === 'practitioners' && (
            <PractitionerGrid
              practitioners={practitioners}
              loading={loading}
              onSelect={handleSelectPractitioner}
            />
          )}

          {currentStep === 'datetime' && selectedPractitioner && (
            <DateTimeSelector
              practitioner={selectedPractitioner}
              availability={availability}
              loading={loading}
              onSelect={handleSelectSlot}
              onBack={handleBack}
            />
          )}

          {currentStep === 'details' && selectedPractitioner && selectedSlot && (
            <DetailsForm
              practitioner={selectedPractitioner}
              slot={selectedSlot}
              duration={duration}
              notes={notes}
              consultationType={consultationType}
              onDurationChange={setDuration}
              onNotesChange={setNotes}
              onTypeChange={setConsultationType}
              onBack={handleBack}
              onContinue={handleContinueToConfirmation}
              formatPrice={formatPrice}
            />
          )}

          {currentStep === 'confirmation' && selectedPractitioner && selectedSlot && (
            <ConfirmationCard
              practitioner={selectedPractitioner}
              slot={selectedSlot}
              duration={duration}
              notes={notes}
              consultationType={consultationType}
              loading={loading}
              onBack={handleBack}
              onConfirm={handleConfirmBooking}
              formatPrice={formatPrice}
            />
          )}

          {currentStep === 'success' && (
            <SuccessScreen
              onNewBooking={handleReset}
              onViewBookings={() => router.push('/client/dashboard/consultations')}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

// ============================================================================
// Practitioner Grid Component
// ============================================================================

function PractitionerGrid({ 
  practitioners, 
  loading, 
  onSelect 
}: { 
  practitioners: Practitioner[]
  loading: boolean
  onSelect: (practitioner: Practitioner) => void
}) {
  const [search, setSearch] = useState('')
  const [selectedSpecialty, setSelectedSpecialty] = useState('')
  const [showFilters, setShowFilters] = useState(false)

  const specialties = [...new Set(
    practitioners.flatMap((p: Practitioner) => p.specialties?.map(s => s.name) || [])
  )]

  const filtered = practitioners.filter((p: Practitioner) => {
    const matchesSearch = p.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      p.specialties?.some(s => s.name.toLowerCase().includes(search.toLowerCase()))
    const matchesSpecialty = !selectedSpecialty ||
      p.specialties?.some(s => s.name === selectedSpecialty)
    return matchesSearch && matchesSpecialty
  })

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1,2,3,4,5,6].map(i => (
          <div key={i} className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-800 animate-pulse">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 bg-slate-200 dark:bg-slate-800 rounded-full" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-3/4" />
                <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-1/2" />
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      {/* Search Bar */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 mb-6 shadow-sm border border-slate-200 dark:border-slate-800">
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name or specialty..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-800 rounded-xl border-0 focus:ring-2 focus:ring-emerald-500/20 text-sm"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`px-4 py-2 rounded-xl border transition ${
              showFilters 
                ? 'bg-emerald-600 text-white border-emerald-600' 
                : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            <FunnelIcon className="h-5 w-5" />
          </button>
        </div>

        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-800"
          >
            <select
              value={selectedSpecialty}
              onChange={(e) => setSelectedSpecialty(e.target.value)}
              className="w-full p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border-0 focus:ring-2 focus:ring-emerald-500/20 text-sm"
            >
              <option value="">All Specialties</option>
              {specialties.map((s: string) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </motion.div>
        )}
      </div>

      {/* Practitioner Grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
          <UserCircleIcon className="h-16 w-16 mx-auto text-slate-400 mb-4" />
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">No practitioners found</h3>
          <p className="text-sm text-slate-600 dark:text-slate-400">Try adjusting your search</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((p: Practitioner) => (
            <motion.button
              key={p.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onSelect(p)}
              className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-800 hover:border-emerald-500 dark:hover:border-emerald-500 transition text-left"
            >
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-full flex items-center justify-center text-white font-bold text-xl">
                  {p.first_name?.[0]}{p.last_name?.[0]}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-slate-900 dark:text-white mb-1">
                    Dr. {p.first_name} {p.last_name}
                  </h3>
                  <div className="flex items-center gap-2 mb-2">
                    <MapPinIcon className="h-4 w-4 text-slate-400" />
                    <span className="text-sm text-slate-600 dark:text-slate-400">{p.city || 'Remote'}</span>
                  </div>
                  <div className="flex items-center gap-2 mb-3">
                    <CurrencyDollarIcon className="h-4 w-4 text-slate-400" />
                    <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
                      KES {p.hourly_rate}/hr
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {p.specialties?.slice(0, 2).map(s => (
                      <span key={s.id} className="px-2 py-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg text-xs">
                        {s.name}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </motion.button>
          ))}
        </div>
      )}
    </motion.div>
  )
}

// ============================================================================
// DateTimeSelector Component
// ============================================================================

function DateTimeSelector({ 
  practitioner, 
  availability, 
  loading, 
  onSelect, 
  onBack 
}: { 
  practitioner: Practitioner
  availability: Availability[]
  loading: boolean
  onSelect: (date: string, time: string) => void
  onBack: () => void
}) {
  const [selectedDate, setSelectedDate] = useState<string>('')
  const [selectedTime, setSelectedTime] = useState<string>('')
  const [currentMonth, setCurrentMonth] = useState(new Date(2026, 1, 1)) // February 2026

  const getBackendDay = (jsDay: number): number => {
    const mapping: Record<number, number> = {
      0: 6, // Sunday -> 6
      1: 0, // Monday -> 0
      2: 1, // Tuesday -> 1
      3: 2, // Wednesday -> 2
      4: 3, // Thursday -> 3
      5: 4, // Friday -> 4
      6: 5, // Saturday -> 5
    };
    return mapping[jsDay];
  }

  const dateHasAvailability = (dateStr: string): boolean => {
    const date = new Date(dateStr);
    const jsDay = date.getDay();
    const backendDay = getBackendDay(jsDay);
    
    return availability.some(slot => {
      if (!slot.is_available) return false;
      
      if (slot.recurrence_type === 'weekly') {
        return slot.day_of_week === backendDay;
      } else if (slot.recurrence_type === 'one_time') {
        return slot.specific_date === dateStr;
      }
      return false;
    });
  };

  const getTimeSlotsForDate = (dateStr: string): string[] => {
    if (!dateStr) return [];
    
    const date = new Date(dateStr);
    const jsDay = date.getDay();
    const backendDay = getBackendDay(jsDay);
    
    return availability
      .filter(slot => {
        if (!slot.is_available) return false;
        
        if (slot.recurrence_type === 'weekly') {
          return slot.day_of_week === backendDay;
        } else if (slot.recurrence_type === 'one_time') {
          return slot.specific_date === dateStr;
        }
        return false;
      })
      .map(slot => slot.start_time.slice(0,5))
      .sort();
  };

  const generateCalendarDays = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days = [];
    
    for (let i = 0; i < firstDay.getDay(); i++) {
      days.push(null);
    }
    
    for (let d = 1; d <= lastDay.getDate(); d++) {
      const date = new Date(year, month, d);
      const dateStr = date.toISOString().split('T')[0];
      const hasSlot = dateHasAvailability(dateStr);
      
      days.push({
        date,
        dateStr,
        hasSlot
      });
    }
    
    return days;
  };

  const days = generateCalendarDays();
  const timeSlots = getTimeSlotsForDate(selectedDate);
  
  const weekDays = [
    { key: 'sun', label: 'S' },
    { key: 'mon', label: 'M' },
    { key: 'tue', label: 'T' },
    { key: 'wed', label: 'W' },
    { key: 'thu', label: 'T' },
    { key: 'fri', label: 'F' },
    { key: 'sat', label: 'S' }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-800"
    >
      <div className="flex items-center gap-3 mb-6">
        <button onClick={onBack} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition">
          <ChevronLeftIcon className="h-5 w-5" />
        </button>
        <div>
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Select Date & Time</h2>
          <p className="text-sm text-slate-600 dark:text-slate-400">Dr. {practitioner.first_name} {practitioner.last_name}</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Calendar */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <button 
              onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
            >
              <ChevronLeftIcon className="h-5 w-5" />
            </button>
            <span className="font-medium">
              {currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}
            </span>
            <button 
              onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
            >
              <ChevronRightIcon className="h-5 w-5" />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1 mb-2">
            {weekDays.map((day) => (
              <div key={day.key} className="text-center text-xs font-medium text-slate-500 py-2">
                {day.label}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {days.map((day, index) => {
              if (!day) {
                return <div key={`empty-${index}`} className="aspect-square p-1" />;
              }

              const isSelected = selectedDate === day.dateStr;
              const isPast = day.date < new Date(new Date().setHours(0,0,0,0));
              const isToday = day.dateStr === new Date().toISOString().split('T')[0];

              return (
                <div key={day.dateStr} className="aspect-square p-1">
                  <button
                    onClick={() => {
                      if (day.hasSlot && !isPast) {
                        setSelectedDate(day.dateStr);
                        setSelectedTime('');
                      }
                    }}
                    disabled={!day.hasSlot || isPast}
                    className={`
                      w-full h-full rounded-xl flex flex-col items-center justify-center text-sm transition
                      ${isSelected 
                        ? 'bg-emerald-600 text-white' 
                        : day.hasSlot && !isPast
                          ? 'hover:bg-emerald-50 dark:hover:bg-emerald-950/30 text-slate-700 dark:text-slate-300 cursor-pointer'
                          : 'text-slate-300 dark:text-slate-700 cursor-not-allowed'
                      }
                      ${isToday && !isSelected ? 'ring-2 ring-emerald-200 dark:ring-emerald-800' : ''}
                    `}
                  >
                    <span>{day.date.getDate()}</span>
                    {day.hasSlot && !isPast && !isSelected && (
                      <div className="w-1 h-1 rounded-full bg-emerald-500 mt-1" />
                    )}
                  </button>
                </div>
              );
            })}
          </div>

          <div className="flex items-center gap-4 mt-4 text-xs text-slate-500">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
              <span>Available</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-emerald-600"></div>
              <span>Selected</span>
            </div>
          </div>
        </div>

        {/* Time Slots */}
        <div>
          {selectedDate ? (
            <>
              <h3 className="font-medium mb-4 flex items-center gap-2">
                <ClockIcon className="h-5 w-5 text-slate-400" />
                Available Times for {new Date(selectedDate).toLocaleDateString(undefined, { 
                  weekday: 'short', 
                  month: 'short', 
                  day: 'numeric' 
                })}
              </h3>
              
              {timeSlots.length > 0 ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-2">
                    {timeSlots.map((time) => (
                      <button
                        key={time}
                        onClick={() => setSelectedTime(time)}
                        className={`
                          p-3 rounded-xl border-2 transition text-center
                          ${selectedTime === time
                            ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/30'
                            : 'border-slate-200 dark:border-slate-800 hover:border-emerald-300 dark:hover:border-emerald-800'
                          }
                        `}
                      >
                        <span className="text-sm font-medium">{time}</span>
                      </button>
                    ))}
                  </div>
                  
                  {selectedTime && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      <button
                        onClick={() => onSelect(selectedDate, selectedTime)}
                        className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-medium transition flex items-center justify-center gap-2"
                      >
                        Continue to Details
                        <ChevronRightIcon className="h-5 w-5" />
                      </button>
                    </motion.div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                  <ClockIcon className="h-8 w-8 mx-auto text-slate-400 mb-2" />
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    No available slots for this date
                  </p>
                </div>
              )}
            </>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center py-12">
              <CalendarDaysIcon className="h-12 w-12 text-slate-300 dark:text-slate-700 mb-4" />
              <p className="text-slate-600 dark:text-slate-400">
                Select a date to see available times
              </p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
// ============================================================================
// DetailsForm Component
// ============================================================================

function DetailsForm({ 
  practitioner, 
  slot, 
  duration, 
  notes, 
  consultationType,
  onDurationChange, 
  onNotesChange, 
  onTypeChange, 
  onBack, 
  onContinue,
  formatPrice
}: any) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-800"
    >
      <div className="flex items-center gap-3 mb-6">
        <button onClick={onBack} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition">
          <ChevronLeftIcon className="h-5 w-5" />
        </button>
        <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Consultation Details</h2>
      </div>

      <div className="space-y-6">
        {/* Summary Card */}
        <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4">
          <div className="flex items-start gap-3 mb-3">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-full flex items-center justify-center text-white font-bold">
              {slot.practitionerName[0]}
            </div>
            <div>
              <p className="font-medium">{slot.practitionerName}</p>
              <p className="text-xs text-slate-500">
                {new Date(slot.date).toLocaleDateString('en-US', { 
                  weekday: 'short', month: 'short', day: 'numeric' 
                })} at {slot.time}
              </p>
            </div>
          </div>
        </div>

        {/* Consultation Type */}
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
            Consultation Type
          </label>
          <div className="grid grid-cols-3 gap-3">
            {(['video', 'in-person', 'phone'] as const).map(type => (
              <button
                key={type}
                onClick={() => onTypeChange(type)}
                className={`
                  p-3 rounded-xl border-2 capitalize transition
                  ${consultationType === type
                    ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/30'
                    : 'border-slate-200 dark:border-slate-800 hover:border-emerald-300'
                  }
                `}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        {/* Duration */}
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
            Duration
          </label>
          <div className="grid grid-cols-2 gap-3">
            {[30, 60, 90, 120].map(d => (
              <button
                key={d}
                onClick={() => onDurationChange(d)}
                className={`
                  p-3 rounded-xl border-2 transition
                  ${duration === d
                    ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/30'
                    : 'border-slate-200 dark:border-slate-800 hover:border-emerald-300'
                  }
                `}
              >
                <span className="block text-sm font-medium">{d} min</span>
                <span className="text-xs text-slate-500">
                  +{formatPrice(practitioner.hourly_rate * d / 60)}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
            Additional Notes
          </label>
          <textarea
            value={notes}
            onChange={(e) => onNotesChange(e.target.value)}
            placeholder="Any specific concerns or information to share?"
            rows={4}
            className="w-full p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border-0 focus:ring-2 focus:ring-emerald-500/20 text-sm resize-none"
          />
        </div>

        {/* Continue Button */}
        <button
          onClick={onContinue}
          className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-medium transition"
        >
          Continue to Review
          <ChevronRightIcon className="h-5 w-5 inline ml-2" />
        </button>
      </div>
    </motion.div>
  )
}

// ============================================================================
// ConfirmationCard Component
// ============================================================================

function ConfirmationCard({ 
  practitioner, 
  slot, 
  duration, 
  notes, 
  consultationType, 
  loading, 
  onBack, 
  onConfirm,
  formatPrice
}: any) {
  const total = practitioner.hourly_rate * duration / 60

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-800"
    >
      <div className="flex items-center gap-3 mb-6">
        <button onClick={onBack} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition">
          <ChevronLeftIcon className="h-5 w-5" />
        </button>
        <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Review Booking</h2>
      </div>

      <div className="space-y-6">
        {/* Booking Summary */}
        <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4">
          <h3 className="font-medium mb-4">Booking Summary</h3>
          
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-full flex items-center justify-center text-white font-bold">
                {slot.practitionerName[0]}
              </div>
              <div>
                <p className="font-medium">{slot.practitionerName}</p>
                <p className="text-xs text-slate-500">{practitioner.specialties?.[0]?.name || 'Specialist'}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2 text-sm">
              <div className="flex items-center gap-2">
                <CalendarDaysIcon className="h-4 w-4 text-slate-400" />
                <span>{new Date(slot.date).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center gap-2">
                <ClockIcon className="h-4 w-4 text-slate-400" />
                <span>{slot.time} ({duration} min)</span>
              </div>
              <div className="flex items-center gap-2">
                <BriefcaseIcon className="h-4 w-4 text-slate-400" />
                <span className="capitalize">{consultationType}</span>
              </div>
              <div className="flex items-center gap-2">
                <CurrencyDollarIcon className="h-4 w-4 text-slate-400" />
                <span className="font-medium text-emerald-600">{formatPrice(total)}</span>
              </div>
            </div>

            {notes && (
              <div className="pt-2 mt-2 border-t border-slate-200 dark:border-slate-700">
                <p className="text-xs text-slate-500 mb-1">Notes:</p>
                <p className="text-sm">{notes}</p>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={onBack}
            disabled={loading}
            className="flex-1 py-3 border-2 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl font-medium transition disabled:opacity-50"
          >
            Back
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-medium transition disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                <span>Booking...</span>
              </>
            ) : (
              <>
                <CheckCircleIcon className="h-5 w-5" />
                <span>Confirm Booking</span>
              </>
            )}
          </button>
        </div>
      </div>
    </motion.div>
  )
}

// ============================================================================
// SuccessScreen Component
// ============================================================================

function SuccessScreen({ onNewBooking, onViewBookings }: { onNewBooking: () => void; onViewBookings: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white dark:bg-slate-900 rounded-2xl p-12 shadow-sm border border-slate-200 dark:border-slate-800 text-center max-w-md mx-auto"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2, type: 'spring' }}
        className="w-20 h-20 bg-emerald-100 dark:bg-emerald-950/30 rounded-full flex items-center justify-center mx-auto mb-6"
      >
        <CheckCircleIcon className="h-10 w-10 text-emerald-600 dark:text-emerald-400" />
      </motion.div>

      <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">Booking Confirmed!</h2>
      <p className="text-slate-600 dark:text-slate-400 mb-8">
        Your consultation has been scheduled. Check your email for details.
      </p>

      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <button
          onClick={onNewBooking}
          className="px-6 py-3 border-2 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl font-medium transition"
        >
          Book Another
        </button>
        <button
          onClick={onViewBookings}
          className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-medium transition"
        >
          View My Consultations
        </button>
      </div>
    </motion.div>
  )
}