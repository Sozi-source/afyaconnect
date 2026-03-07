// app/components/client/dashboard/consultations/ConsultationsPage.tsx
'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  CalendarIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  MagnifyingGlassIcon,
  SparklesIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline'
import { useAuth } from '@/app/contexts/AuthContext'
import { Card, CardBody } from '@/app/components/ui/Card'
import { Button } from '@/app/components/ui/Buttons'
import { apiClient } from '@/app/lib/api'
import { extractResults } from '@/app/lib/utils'
import type { Consultation } from '@/app/types'

type TabType = 'upcoming' | 'completed' | 'cancelled' | 'all'

export default function ConsultationsPage() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isMounted, setIsMounted] = useState(false)
  const [consultations, setConsultations] = useState<Consultation[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<TabType>('upcoming')
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    setIsMounted(true)
  }, [])

  if (authLoading || !isMounted) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-teal-200 border-t-teal-600"></div>
      </div>
    )
  }

  if (!isAuthenticated || !user) {
    router.push('/login')
    return null
  }

  useEffect(() => {
    fetchConsultations()
  }, [])

  const fetchConsultations = async () => {
    try {
      setLoading(true)
      const data = await apiClient.consultations.getMyClientConsultations()
      const consultationsList = extractResults<Consultation>(data)
      setConsultations(consultationsList)
    } catch (error) {
      console.error('Error fetching consultations:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredConsultations = consultations.filter(c => {
    if (activeTab === 'upcoming' && c.status !== 'booked') return false
    if (activeTab === 'completed' && c.status !== 'completed') return false
    if (activeTab === 'cancelled' && c.status !== 'cancelled') return false
    if (searchTerm) {
      return c.practitioner_name?.toLowerCase().includes(searchTerm.toLowerCase())
    }
    return true
  })

  const getStatusBadge = (status: string) => {
    const styles = {
      booked: 'bg-blue-50 text-blue-700',
      completed: 'bg-green-50 text-green-700',
      cancelled: 'bg-red-50 text-red-700'
    }
    return styles[status as keyof typeof styles] || 'bg-gray-50 text-gray-700'
  }

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-teal-200 border-t-teal-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white py-6 sm:py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 text-teal-600 mb-1">
              <SparklesIcon className="h-4 w-4" />
              <span className="text-xs font-medium uppercase">Appointments</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-light text-slate-800">
              My <span className="font-semibold text-teal-600">Consultations</span>
            </h1>
          </div>
          <Link href="/client/dashboard/consultations/book">
            <Button className="bg-teal-600 hover:bg-teal-700 text-white">
              <CalendarIcon className="h-4 w-4 mr-2" />
              Book Consultation
            </Button>
          </Link>
        </div>

        <div className="relative mb-6">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search by practitioner name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl bg-white"
          />
        </div>

        <div className="flex flex-wrap gap-2 mb-6 border-b border-slate-200 pb-3">
          {(['upcoming', 'completed', 'cancelled', 'all'] as TabType[]).map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-all ${
                activeTab === tab ? 'bg-teal-600 text-white' : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {filteredConsultations.length === 0 ? (
          <Card>
            <CardBody className="py-16 text-center">
              <CalendarIcon className="h-12 w-12 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-800 mb-2">No consultations found</h3>
              <p className="text-slate-500 mb-6">Book your first consultation to get started</p>
              <Link href="/client/dashboard/consultations/book">
                <Button className="bg-teal-600 hover:bg-teal-700 text-white">Book Now</Button>
              </Link>
            </CardBody>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredConsultations.map((consultation, index) => (
              <motion.div key={consultation.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}>
                <Link href={`/client/dashboard/consultations/${consultation.id}`}>
                  <Card className="border-slate-200 hover:border-teal-200 transition-all">
                    <CardBody className="p-5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-teal-600 rounded-full flex items-center justify-center text-white font-bold">
                            {consultation.practitioner_name?.[0] || 'DR'}
                          </div>
                          <div>
                            <h3 className="font-semibold text-slate-800">Dr. {consultation.practitioner_name || 'Unknown'}</h3>
                            <div className="flex items-center gap-3 text-sm text-slate-500 mt-1">
                              <span className="flex items-center gap-1">
                                <CalendarIcon className="h-4 w-4" />
                                {new Date(consultation.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                              </span>
                              <span className="flex items-center gap-1">
                                <ClockIcon className="h-4 w-4" />
                                {consultation.time?.slice(0,5)}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(consultation.status)}`}>
                            {consultation.status}
                          </span>
                          <ChevronRightIcon className="h-5 w-5 text-slate-300" />
                        </div>
                      </div>
                    </CardBody>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}