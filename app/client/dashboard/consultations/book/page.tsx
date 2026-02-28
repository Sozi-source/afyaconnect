// app/client/dashboard/consultations/create/page.tsx
'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
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
  FunnelIcon,
  SparklesIcon,
  ShieldCheckIcon,
  VideoCameraIcon,
  PhoneIcon
} from '@heroicons/react/24/outline'
import { useAuth } from '@/app/contexts/AuthContext'
import { apiClient } from '@/app/lib/api'
import { extractResults, formatDate, formatCurrency, getDayName } from '@/app/lib/utils'
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
      setError(null)
      const data = await apiClient.practitioners.getAll({ verified: true })
      const practitionersList = extractResults<Practitioner>(data)
      setPractitioners(practitionersList)
    } catch (error) {
      setError('Failed to load practitioners')
      console.error('Error fetching practitioners:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchAvailability = async (practitionerId: number) => {
    try {
      setLoading(true)
      setError(null)
      const data = await apiClient.practitioners.getAvailability(practitionerId)
      const availabilityList = extractResults<Availability>(data)
      setAvailability(availabilityList)
      
      if (availabilityList.length === 0) {
        setError('This practitioner has no availability yet')
      }
    } catch (error) {
      setError('Failed to load availability')
      console.error('Error fetching availability:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSelectPractitioner = useCallback((practitioner: Practitioner) => {
    setSelectedPractitioner(practitioner)
    fetchAvailability(practitioner.id)
    setCurrentStep('datetime')
  }, [])

  const handleSelectSlot = useCallback((date: string, time: string) => {
    if (!selectedPractitioner) return
    setSelectedSlot({
      date,
      time,
      practitionerId: selectedPractitioner.id,
      practitionerName: `Dr. ${selectedPractitioner.first_name} ${selectedPractitioner.last_name}`
    })
    setCurrentStep('details')
  }, [selectedPractitioner])

  const handleBack = useCallback(() => {
    if (currentStep === 'datetime') {
      setSelectedPractitioner(null)
      setCurrentStep('practitioners')
    } else if (currentStep === 'details') {
      setCurrentStep('datetime')
    } else if (currentStep === 'confirmation') {
      setCurrentStep('details')
    }
  }, [currentStep])

  const handleContinueToConfirmation = useCallback(() => {
    setCurrentStep('confirmation')
  }, [])

  const handleConfirmBooking = async () => {
    if (!selectedPractitioner || !selectedSlot) return

    try {
      setLoading(true)
      setError(null)
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
      console.error('Error creating consultation:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleReset = useCallback(() => {
    setSelectedPractitioner(null)
    setSelectedSlot(null)
    setCurrentStep('practitioners')
    setNotes('')
    setDuration(60)
    setConsultationType('video')
    setError(null)
  }, [])

  const formatPrice = useCallback((price: number) => formatCurrency(price), [])

  const totalPrice = useMemo(() => {
    if (!selectedPractitioner) return 0
    return (selectedPractitioner.hourly_rate * duration) / 60
  }, [selectedPractitioner, duration])

  const stepTitles = {
    practitioners: 'Choose your practitioner',
    datetime: 'Select date and time',
    details: 'Add consultation details',
    confirmation: 'Review and confirm',
    success: 'Booking confirmed!'
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="max-w-6xl mx-auto px-4 py-8 sm:py-10 lg:py-12">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 lg:mb-10">
          <div className="flex items-center gap-4">
            <Link
              href="/client/dashboard/consultations"
              className="p-2 hover:bg-slate-100 rounded-xl transition-colors border border-slate-200 bg-white shadow-sm"
            >
              <ArrowLeftIcon className="h-5 w-5 text-slate-600" />
            </Link>
            <div>
              <div className="flex items-center gap-2 text-teal-600 mb-1">
                <SparklesIcon className="h-4 w-4" />
                <span className="text-xs font-medium uppercase tracking-wider">New Booking</span>
              </div>
              <h1 className="text-2xl lg:text-3xl font-light text-slate-800">
                Book <span className="font-semibold text-teal-600">Consultation</span>
              </h1>
              <p className="text-sm text-slate-500 mt-1">
                {stepTitles[currentStep]}
              </p>
            </div>
          </div>
          
          {/* Step Indicator - Desktop */}
          <div className="hidden sm:flex items-center gap-2">
            {(['practitioners', 'datetime', 'details', 'confirmation'] as const).map((step, index) => {
              const stepNumber = index + 1
              const isActive = currentStep === step
              const isPast = ['practitioners', 'datetime', 'details', 'confirmation'].indexOf(currentStep) > index
              
              return (
                <div key={step} className="flex items-center">
                  <div className={`
                    w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-all
                    ${isActive 
                      ? 'bg-teal-600 text-white ring-4 ring-teal-100' 
                      : isPast
                        ? 'bg-teal-100 text-teal-600'
                        : 'bg-slate-100 text-slate-400'
                    }
                  `}>
                    {isPast ? <CheckCircleIcon className="h-5 w-5" /> : stepNumber}
                  </div>
                  {index < 3 && (
                    <div className={`
                      w-16 h-0.5 mx-2
                      ${index < ['practitioners', 'datetime', 'details', 'confirmation'].indexOf(currentStep) 
                        ? 'bg-teal-500' 
                        : 'bg-slate-200'
                      }
                    `} />
                  )}
                </div>
              )
            })}
          </div>

          {/* Mobile Step Indicator - Simplified */}
          <div className="sm:hidden flex items-center gap-2">
            <span className="text-sm font-medium text-teal-600">
              Step {['practitioners', 'datetime', 'details', 'confirmation'].indexOf(currentStep) + 1} of 4
            </span>
          </div>
        </div>

        {/* Error Message */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-3 shadow-sm"
            >
              <XMarkIcon className="h-5 w-5 text-rose-600 flex-shrink-0" />
              <p className="text-sm text-rose-700">{error}</p>
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
              totalPrice={totalPrice}
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
              totalPrice={totalPrice}
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
// Practitioner Grid Component - Refined Design
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

  const specialties = useMemo(() => 
    [...new Set(
      practitioners.flatMap((p: Practitioner) => p.specialties?.map(s => s.name) || [])
    )],
    [practitioners]
  )

  const filtered = useMemo(() => 
    practitioners.filter((p: Practitioner) => {
      const matchesSearch = !search || 
        p.full_name?.toLowerCase().includes(search.toLowerCase()) ||
        p.specialties?.some(s => s.name.toLowerCase().includes(search.toLowerCase()))
      const matchesSpecialty = !selectedSpecialty ||
        p.specialties?.some(s => s.name === selectedSpecialty)
      return matchesSearch && matchesSpecialty
    }),
    [practitioners, search, selectedSpecialty]
  )

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {[1,2,3,4,5,6].map(i => (
          <div key={i} className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm animate-pulse">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 bg-slate-200 rounded-full" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-slate-200 rounded w-3/4" />
                <div className="h-3 bg-slate-200 rounded w-1/2" />
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
      <div className="bg-white rounded-2xl p-5 mb-6 shadow-sm border border-slate-200">
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name or specialty..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 bg-slate-50 rounded-xl border-0 focus:ring-2 focus:ring-teal-500/30 text-sm"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`px-4 py-2 rounded-xl border transition-all ${
              showFilters 
                ? 'bg-teal-600 text-white border-teal-600 shadow-sm shadow-teal-200/50' 
                : 'border-slate-200 hover:bg-slate-50'
            }`}
          >
            <FunnelIcon className="h-5 w-5" />
          </button>
        </div>

        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 pt-4 border-t border-slate-200"
            >
              <select
                value={selectedSpecialty}
                onChange={(e) => setSelectedSpecialty(e.target.value)}
                className="w-full p-3.5 bg-slate-50 rounded-xl border-0 focus:ring-2 focus:ring-teal-500/30 text-sm"
              >
                <option value="">All Specialties</option>
                {specialties.map((s: string) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Practitioner Grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 shadow-sm">
          <UserCircleIcon className="h-16 w-16 mx-auto text-slate-300 mb-4" />
          <h3 className="text-lg font-semibold text-slate-800 mb-2">No practitioners found</h3>
          <p className="text-sm text-slate-500">Try adjusting your search</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((p: Practitioner) => (
            <motion.button
              key={p.id}
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onSelect(p)}
              className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:border-teal-200 hover:shadow-md transition-all text-left group"
            >
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 bg-gradient-to-br from-teal-500 to-teal-600 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-sm">
                  {p.first_name?.[0]}{p.last_name?.[0]}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-slate-800 mb-1 group-hover:text-teal-700 transition-colors">
                    Dr. {p.first_name} {p.last_name}
                  </h3>
                  <div className="flex items-center gap-2 mb-2">
                    <MapPinIcon className="h-4 w-4 text-slate-400" />
                    <span className="text-sm text-slate-500">{p.city || 'Remote'}</span>
                  </div>
                  <div className="flex items-center gap-2 mb-3">
                    <CurrencyDollarIcon className="h-4 w-4 text-slate-400" />
                    <span className="text-sm font-medium text-teal-600">
                      {formatCurrency(p.hourly_rate)}/hr
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {p.specialties?.slice(0, 2).map(s => (
                      <span key={s.id} className="px-2 py-1 bg-teal-50 text-teal-700 rounded-lg text-xs font-medium">
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
// DateTimeSelector Component - Refined Design
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
  const [currentMonth, setCurrentMonth] = useState(new Date())

  const getBackendDay = useCallback((jsDay: number): number => {
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
  }, []);

  const dateHasAvailability = useCallback((dateStr: string): boolean => {
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
  }, [availability, getBackendDay]);

  const getTimeSlotsForDate = useCallback((dateStr: string): string[] => {
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
  }, [availability, getBackendDay]);

  const calendarDays = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days: (DayCell | null)[] = [];
    
    let firstDayOfWeek = firstDay.getDay();
    const emptyDays = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1;
    
    for (let i = 0; i < emptyDays; i++) {
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
  }, [currentMonth, dateHasAvailability]);

  const timeSlots = useMemo(() => 
    getTimeSlotsForDate(selectedDate),
    [selectedDate, getTimeSlotsForDate]
  );
  
  const weekDays = [
    { key: 'mon', label: 'M' },
    { key: 'tue', label: 'T' },
    { key: 'wed', label: 'W' },
    { key: 'thu', label: 'T' },
    { key: 'fri', label: 'F' },
    { key: 'sat', label: 'S' },
    { key: 'sun', label: 'S' }
  ];

  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const canGoPrev = useMemo(() => 
    currentMonth > new Date(new Date().getFullYear(), new Date().getMonth(), 1),
    [currentMonth]
  );

  if (loading) {
    return (
      <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 shadow-sm">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-teal-200 border-t-teal-600 mx-auto"></div>
        <p className="text-sm text-slate-500 mt-4">Loading availability...</p>
      </div>
    );
  }

  if (availability.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 shadow-sm">
        <CalendarDaysIcon className="h-16 w-16 text-slate-300 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-slate-800 mb-2">
          No Availability
        </h3>
        <p className="text-sm text-slate-500 max-w-sm mx-auto mb-6">
          This practitioner hasn't set their availability yet.
        </p>
        <button
          onClick={onBack}
          className="px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-medium shadow-sm shadow-teal-200/50"
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="bg-white rounded-2xl p-6 lg:p-8 shadow-sm border border-slate-200"
    >
      <div className="flex items-center gap-3 mb-6">
        <button onClick={onBack} className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
          <ChevronLeftIcon className="h-5 w-5 text-slate-600" />
        </button>
        <div>
          <h2 className="text-xl font-semibold text-slate-800">Select Date & Time</h2>
          <p className="text-sm text-slate-500">Dr. {practitioner.first_name} {practitioner.last_name}</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
        {/* Calendar */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <button 
              onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
              className={`p-2 hover:bg-slate-100 rounded-xl transition-colors ${
                !canGoPrev ? 'opacity-50 cursor-not-allowed' : ''
              }`}
              disabled={!canGoPrev}
            >
              <ChevronLeftIcon className="h-5 w-5 text-slate-600" />
            </button>
            <span className="font-medium text-slate-800">
              {currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}
            </span>
            <button 
              onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
              className="p-2 hover:bg-slate-100 rounded-xl transition-colors"
            >
              <ChevronRightIcon className="h-5 w-5 text-slate-600" />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1 mb-3">
            {weekDays.map((day) => (
              <div key={day.key} className="text-center text-xs font-medium text-slate-500 py-2">
                {day.label}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map((day, index) => {
              if (!day) {
                return <div key={`empty-${index}`} className="aspect-square p-1" />;
              }

              const isSelected = selectedDate === day.dateStr;
              const isPast = day.date < today;
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
                      w-full h-full rounded-xl flex flex-col items-center justify-center text-sm transition-all
                      ${isSelected 
                        ? 'bg-teal-600 text-white shadow-sm' 
                        : day.hasSlot && !isPast
                          ? 'hover:bg-teal-50 text-slate-700 cursor-pointer border border-transparent hover:border-teal-200'
                          : 'text-slate-300 cursor-not-allowed'
                      }
                      ${isToday && !isSelected ? 'ring-2 ring-teal-200' : ''}
                    `}
                  >
                    <span className={isSelected ? 'font-medium' : ''}>{day.date.getDate()}</span>
                    {day.hasSlot && !isPast && !isSelected && (
                      <div className="w-1 h-1 rounded-full bg-teal-500 mt-1" />
                    )}
                  </button>
                </div>
              );
            })}
          </div>

          <div className="flex items-center gap-4 mt-6 text-xs text-slate-500">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-teal-500"></div>
              <span>Available</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-teal-600"></div>
              <span>Selected</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-slate-300"></div>
              <span>Past</span>
            </div>
          </div>
        </div>

        {/* Time Slots */}
        <div>
          {selectedDate ? (
            <>
              <h3 className="font-medium text-slate-800 mb-4 flex items-center gap-2">
                <ClockIcon className="h-5 w-5 text-teal-600" />
                Available Times for {formatDate(selectedDate, { weekday: 'short', month: 'short', day: 'numeric' })}
              </h3>
              
              {timeSlots.length > 0 ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    {timeSlots.map((time) => (
                      <button
                        key={time}
                        onClick={() => setSelectedTime(time)}
                        className={`
                          p-4 rounded-xl border-2 transition-all text-center
                          ${selectedTime === time
                            ? 'border-teal-600 bg-teal-50 shadow-sm'
                            : 'border-slate-200 hover:border-teal-200 hover:bg-teal-50/50'
                          }
                        `}
                      >
                        <span className={`text-sm font-medium ${
                          selectedTime === time ? 'text-teal-700' : 'text-slate-700'
                        }`}>
                          {time}
                        </span>
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
                        className="w-full py-4 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-medium transition-all shadow-sm shadow-teal-200/50 flex items-center justify-center gap-2"
                      >
                        Continue to Details
                        <ChevronRightIcon className="h-5 w-5" />
                      </button>
                    </motion.div>
                  )}
                </div>
              ) : (
                <div className="text-center py-12 bg-slate-50 rounded-xl">
                  <ClockIcon className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                  <p className="text-sm text-slate-500">
                    No available slots for this date
                  </p>
                </div>
              )}
            </>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center py-12">
              <CalendarDaysIcon className="h-16 w-16 text-slate-300 mb-4" />
              <p className="text-slate-500">
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
// DetailsForm Component - Refined Design
// ============================================================================

function DetailsForm({ 
  practitioner, 
  slot, 
  duration, 
  notes, 
  consultationType,
  totalPrice,
  onDurationChange, 
  onNotesChange, 
  onTypeChange, 
  onBack, 
  onContinue,
  formatPrice
}: {
  practitioner: Practitioner
  slot: SelectedSlot
  duration: number
  notes: string
  consultationType: 'video' | 'in-person' | 'phone'
  totalPrice: number
  onDurationChange: (duration: number) => void
  onNotesChange: (notes: string) => void
  onTypeChange: (type: 'video' | 'in-person' | 'phone') => void
  onBack: () => void
  onContinue: () => void
  formatPrice: (price: number) => string
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="bg-white rounded-2xl p-6 lg:p-8 shadow-sm border border-slate-200"
    >
      <div className="flex items-center gap-3 mb-6">
        <button onClick={onBack} className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
          <ChevronLeftIcon className="h-5 w-5 text-slate-600" />
        </button>
        <h2 className="text-xl font-semibold text-slate-800">Consultation Details</h2>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {/* Summary Card */}
          <div className="bg-gradient-to-br from-teal-50 to-white rounded-xl p-5 border border-teal-100">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-teal-600 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-sm">
                {slot.practitionerName[0]}
              </div>
              <div>
                <p className="font-semibold text-slate-800">{slot.practitionerName}</p>
                <p className="text-sm text-teal-600 mt-1">
                  {formatDate(slot.date, { weekday: 'short', month: 'short', day: 'numeric' })} at {slot.time}
                </p>
              </div>
            </div>
          </div>

          {/* Consultation Type */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-3">
              Consultation Type
            </label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { type: 'video', icon: VideoCameraIcon, label: 'Video' },
                { type: 'in-person', icon: MapPinIcon, label: 'In Person' },
                { type: 'phone', icon: PhoneIcon, label: 'Phone' }
              ].map(({ type, icon: Icon, label }) => (
                <button
                  key={type}
                  onClick={() => onTypeChange(type as any)}
                  className={`
                    p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2
                    ${consultationType === type
                      ? 'border-teal-600 bg-teal-50 shadow-sm'
                      : 'border-slate-200 hover:border-teal-200 hover:bg-teal-50/50'
                    }
                  `}
                >
                  <Icon className={`h-5 w-5 ${
                    consultationType === type ? 'text-teal-600' : 'text-slate-400'
                  }`} />
                  <span className={`text-xs font-medium ${
                    consultationType === type ? 'text-teal-700' : 'text-slate-600'
                  }`}>
                    {label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Duration */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-3">
              Duration
            </label>
            <div className="grid grid-cols-2 gap-3">
              {[30, 60, 90, 120].map(d => (
                <button
                  key={d}
                  onClick={() => onDurationChange(d)}
                  className={`
                    p-4 rounded-xl border-2 transition-all text-center
                    ${duration === d
                      ? 'border-teal-600 bg-teal-50 shadow-sm'
                      : 'border-slate-200 hover:border-teal-200 hover:bg-teal-50/50'
                    }
                  `}
                >
                  <span className={`block text-sm font-medium ${
                    duration === d ? 'text-teal-700' : 'text-slate-700'
                  }`}>
                    {d} min
                  </span>
                  <span className={`text-xs mt-1 block ${
                    duration === d ? 'text-teal-600' : 'text-slate-500'
                  }`}>
                    +{formatPrice((practitioner.hourly_rate * d) / 60)}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-3">
              Additional Notes
            </label>
            <textarea
              value={notes}
              onChange={(e) => onNotesChange(e.target.value)}
              placeholder="Any specific concerns or information to share?"
              rows={4}
              className="w-full p-4 bg-slate-50 rounded-xl border-0 focus:ring-2 focus:ring-teal-500/30 text-sm resize-none"
            />
          </div>
        </div>

        {/* Price Summary Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-gradient-to-br from-slate-50 to-white rounded-xl p-6 border border-slate-200 sticky top-24">
            <h3 className="font-medium text-slate-800 mb-4">Price Summary</h3>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Consultation fee</span>
                <span className="font-medium text-slate-800">{formatPrice(practitioner.hourly_rate)}/hr</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Duration</span>
                <span className="font-medium text-slate-800">{duration} min</span>
              </div>
              <div className="border-t border-slate-200 pt-3 mt-3">
                <div className="flex justify-between font-semibold">
                  <span className="text-slate-800">Total</span>
                  <span className="text-teal-600 text-lg">{formatPrice(totalPrice)}</span>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-200">
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <ShieldCheckIcon className="h-4 w-4 text-teal-600" />
                <span>Secure payment</span>
              </div>
            </div>

            <button
              onClick={onContinue}
              className="w-full mt-6 py-4 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-medium transition-all shadow-sm shadow-teal-200/50 flex items-center justify-center gap-2"
            >
              Continue to Review
              <ChevronRightIcon className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

// ============================================================================
// ConfirmationCard Component - Refined Design
// ============================================================================

function ConfirmationCard({ 
  practitioner, 
  slot, 
  duration, 
  notes, 
  consultationType, 
  totalPrice,
  loading, 
  onBack, 
  onConfirm,
  formatPrice
}: {
  practitioner: Practitioner
  slot: SelectedSlot
  duration: number
  notes: string
  consultationType: 'video' | 'in-person' | 'phone'
  totalPrice: number
  loading: boolean
  onBack: () => void
  onConfirm: () => Promise<void>
  formatPrice: (price: number) => string
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="bg-white rounded-2xl p-6 lg:p-8 shadow-sm border border-slate-200"
    >
      <div className="flex items-center gap-3 mb-6">
        <button onClick={onBack} className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
          <ChevronLeftIcon className="h-5 w-5 text-slate-600" />
        </button>
        <h2 className="text-xl font-semibold text-slate-800">Review Your Booking</h2>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {/* Practitioner Card */}
          <div className="bg-gradient-to-br from-teal-50 to-white rounded-xl p-5 border border-teal-100">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-teal-500 to-teal-600 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-sm">
                {slot.practitionerName[0]}
              </div>
              <div>
                <h3 className="font-semibold text-slate-800 text-lg">{slot.practitionerName}</h3>
                <p className="text-sm text-teal-600 mt-1">{practitioner.specialties?.[0]?.name || 'Specialist'}</p>
              </div>
            </div>
          </div>

          {/* Appointment Details */}
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <h4 className="font-medium text-slate-800 mb-4">Appointment Details</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-slate-500 mb-1">Date</p>
                <p className="text-sm font-medium text-slate-800">{formatDate(slot.date)}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-1">Time</p>
                <p className="text-sm font-medium text-slate-800">{slot.time}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-1">Duration</p>
                <p className="text-sm font-medium text-slate-800">{duration} minutes</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-1">Type</p>
                <p className="text-sm font-medium text-slate-800 capitalize">{consultationType}</p>
              </div>
            </div>
          </div>

          {notes && (
            <div className="bg-white border border-slate-200 rounded-xl p-5">
              <h4 className="font-medium text-slate-800 mb-2">Your Notes</h4>
              <p className="text-sm text-slate-600">{notes}</p>
            </div>
          )}
        </div>

        {/* Payment Summary */}
        <div className="lg:col-span-1">
          <div className="bg-gradient-to-br from-slate-50 to-white rounded-xl p-6 border border-slate-200 sticky top-24">
            <h4 className="font-medium text-slate-800 mb-4">Payment Summary</h4>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Consultation</span>
                <span className="font-medium text-slate-800">{formatPrice(totalPrice)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Platform fee</span>
                <span className="font-medium text-teal-600">Free</span>
              </div>
              <div className="border-t border-slate-200 pt-3 mt-3">
                <div className="flex justify-between font-semibold">
                  <span className="text-slate-800">Total</span>
                  <span className="text-teal-600 text-lg">{formatPrice(totalPrice)}</span>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-200">
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <ShieldCheckIcon className="h-4 w-4 text-teal-600" />
                <span>Your payment info is secure</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 mt-8 pt-6 border-t border-slate-200">
        <button
          onClick={onBack}
          disabled={loading}
          className="flex-1 py-4 border-2 border-slate-200 hover:bg-slate-50 rounded-xl font-medium transition disabled:opacity-50"
        >
          Back
        </button>
        <button
          onClick={onConfirm}
          disabled={loading}
          className="flex-1 py-4 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-medium transition disabled:opacity-50 flex items-center justify-center gap-2 shadow-sm shadow-teal-200/50"
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
    </motion.div>
  )
}

// ============================================================================
// SuccessScreen Component - Refined Design
// ============================================================================

function SuccessScreen({ onNewBooking, onViewBookings }: { onNewBooking: () => void; onViewBookings: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white rounded-2xl p-12 shadow-sm border border-slate-200 text-center max-w-lg mx-auto"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2, type: 'spring' }}
        className="w-24 h-24 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-6"
      >
        <CheckCircleIcon className="h-12 w-12 text-teal-600" />
      </motion.div>

      <h2 className="text-2xl font-bold text-slate-800 mb-3">Booking Confirmed!</h2>
      <p className="text-slate-500 mb-8 max-w-sm mx-auto">
        Your consultation has been scheduled. You'll receive a confirmation email with all the details.
      </p>

      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <button
          onClick={onNewBooking}
          className="px-6 py-3 border-2 border-slate-200 hover:bg-slate-50 rounded-xl font-medium transition"
        >
          Book Another
        </button>
        <button
          onClick={onViewBookings}
          className="px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-medium transition shadow-sm shadow-teal-200/50"
        >
          View My Consultations
        </button>
      </div>
    </motion.div>
  )
}