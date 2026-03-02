'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/app/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  CurrencyDollarIcon,
  CalendarIcon,
  ChartBarIcon,
  ArrowDownIcon,
  ArrowUpIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  BanknotesIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  DocumentArrowDownIcon,
  FunnelIcon
} from '@heroicons/react/24/outline'
import { Card, CardBody, CardHeader } from '@/app/components/ui/Card'
import { Button } from '@/app/components/ui/Buttons'
import { apiClient } from '@/app/lib/api'
import { extractResults } from '@/app/lib/utils'

type TransactionStatus = 'completed' | 'pending' | 'cancelled'

interface Transaction {
  id: number
  consultationId: number
  clientName: string
  clientEmail: string
  date: string
  time: string
  duration: number
  amount: number
  rate: number
  status: TransactionStatus
  transactionId: string
}

export default function PractitionerEarningsPage() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth()
  const router = useRouter()
  const [summary, setSummary] = useState({
    totalEarnings: 0,
    pendingPayouts: 0,
    thisMonth: 0,
    lastMonth: 0,
    avgPerConsultation: 0,
    totalConsultations: 0,
    completedConsultations: 0,
    totalHours: 0,
    avgHourlyRate: 0
  })
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [filterStatus, setFilterStatus] = useState<TransactionStatus | 'all'>('all')
  const [dateRange, setDateRange] = useState<'week' | 'month' | 'year' | 'all'>('month')
  const itemsPerPage = 8

  useEffect(() => {
    if (!authLoading && !isAuthenticated) router.push('/login')
    if (!authLoading && user?.role !== 'practitioner') router.push('/client/dashboard')
    if (isAuthenticated) fetchData()
  }, [authLoading, isAuthenticated, user, dateRange])

  const fetchData = async () => {
    setLoading(true)
    try {
      // Fetch practitioner profile to get hourly rate
      const practitioner = await apiClient.practitioners.getMyProfile()
      const hourlyRate = practitioner.hourly_rate || 0

      // Fetch all consultations
      const consultationsData = await apiClient.consultations.getMyPractitionerConsultations()
      const consultations = extractResults<any>(consultationsData)
      
      // Process completed consultations
      const completed = consultations.filter((c: any) => c.status === 'completed')
      const pending = consultations.filter((c: any) => c.status === 'booked')
      const cancelled = consultations.filter((c: any) => c.status === 'cancelled')
      
      // Calculate earnings based on duration and hourly rate
      const calculateEarnings = (consultation: any) => {
        const duration = consultation.duration_minutes || 60
        return (hourlyRate * duration) / 60
      }

      const totalEarnings = completed.reduce((sum: number, c: any) => sum + calculateEarnings(c), 0)
      const totalHours = completed.reduce((sum: number, c: any) => sum + (c.duration_minutes || 60), 0) / 60
      
      const now = new Date()
      const currentMonth = now.getMonth()
      const currentYear = now.getFullYear()
      
      // Filter by date range
      const filterByDate = (consultation: any) => {
        const cDate = new Date(consultation.date)
        if (dateRange === 'week') {
          const weekAgo = new Date(now.setDate(now.getDate() - 7))
          return cDate >= weekAgo
        }
        if (dateRange === 'month') {
          return cDate.getMonth() === currentMonth && cDate.getFullYear() === currentYear
        }
        if (dateRange === 'year') {
          return cDate.getFullYear() === currentYear
        }
        return true
      }

      const thisMonthEarnings = completed
        .filter(filterByDate)
        .reduce((sum: number, c: any) => sum + calculateEarnings(c), 0)

      const lastMonthEarnings = completed
        .filter((c: any) => {
          const cDate = new Date(c.date)
          const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1
          const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear
          return cDate.getMonth() === lastMonth && cDate.getFullYear() === lastMonthYear
        })
        .reduce((sum: number, c: any) => sum + calculateEarnings(c), 0)

      const pendingEarnings = pending.reduce((sum: number, c: any) => sum + calculateEarnings(c), 0)

      setSummary({
        totalEarnings,
        pendingPayouts: pendingEarnings,
        thisMonth: thisMonthEarnings,
        lastMonth: lastMonthEarnings,
        avgPerConsultation: completed.length ? totalEarnings / completed.length : 0,
        totalConsultations: consultations.length,
        completedConsultations: completed.length,
        totalHours,
        avgHourlyRate: hourlyRate
      })

      // Create transactions
      const allConsultations = [...completed, ...pending, ...cancelled]
      setTransactions(
        allConsultations
          .map((c: any, i: number) => {
            let status: TransactionStatus = 'cancelled'
            if (c.status === 'completed') status = 'completed'
            else if (c.status === 'booked') status = 'pending'
            
            const amount = calculateEarnings(c)
            
            return {
              id: i + 1,
              consultationId: c.id,
              clientName: c.client_name || 'Client',
              clientEmail: c.client_email || '',
              date: c.date,
              time: c.time.slice(0,5),
              duration: c.duration_minutes || 60,
              amount,
              rate: hourlyRate,
              status,
              transactionId: `TRX-${c.id}-${c.date.replace(/-/g, '')}`
            }
          })
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      )
    } catch (error) {
      console.error('Error fetching earnings data:', error)
    } finally {
      setLoading(false)
    }
  }

  const filtered = transactions.filter(t => {
    if (filterStatus !== 'all' && t.status !== filterStatus) return false
    
    // Apply date range filter
    const transactionDate = new Date(t.date)
    const now = new Date()
    if (dateRange === 'week') {
      const weekAgo = new Date(now.setDate(now.getDate() - 7))
      return transactionDate >= weekAgo
    }
    if (dateRange === 'month') {
      return transactionDate.getMonth() === now.getMonth() && 
             transactionDate.getFullYear() === now.getFullYear()
    }
    if (dateRange === 'year') {
      return transactionDate.getFullYear() === now.getFullYear()
    }
    return true
  })

  const paginated = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
  const totalPages = Math.ceil(filtered.length / itemsPerPage)

  const formatCurrency = (amount: number) => `KES ${amount.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
  const percentageChange = summary.lastMonth ? ((summary.thisMonth - summary.lastMonth) / summary.lastMonth) * 100 : summary.thisMonth > 0 ? 100 : 0

  const getStatusStyle = (status: TransactionStatus) => {
    const styles = {
      completed: 'bg-green-100 text-green-700 border-green-200',
      pending: 'bg-yellow-100 text-yellow-700 border-yellow-200',
      cancelled: 'bg-red-100 text-red-700 border-red-200'
    }
    return styles[status]
  }

  const getStatusIcon = (status: TransactionStatus) => {
    const icons = {
      completed: <CheckCircleIcon className="h-3.5 w-3.5" />,
      pending: <ClockIcon className="h-3.5 w-3.5" />,
      cancelled: <ExclamationCircleIcon className="h-3.5 w-3.5" />
    }
    return icons[status]
  }

  const handleExport = () => {
    const headers = ['Date', 'Time', 'Duration', 'Client', 'Email', 'Rate', 'Amount', 'Status', 'Transaction ID']
    const rows = filtered.map(t => [
      t.date,
      t.time,
      `${t.duration} min`,
      t.clientName,
      t.clientEmail,
      formatCurrency(t.rate),
      formatCurrency(t.amount),
      t.status,
      t.transactionId
    ])
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n')
    const a = document.createElement('a')
    a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }))
    a.download = `earnings-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="relative">
          <div className="animate-spin rounded-full h-12 w-12 sm:h-14 sm:w-14 border-4 border-emerald-200 border-t-emerald-600"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <CurrencyDollarIcon className="h-5 w-5 sm:h-6 sm:w-6 text-emerald-600 animate-pulse" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-5 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Earnings Dashboard</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Track your consultation earnings and payouts
          </p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <Button 
            onClick={handleExport} 
            variant="outline" 
            size="sm"
            className="flex-1 sm:flex-none text-xs sm:text-sm"
          >
            <DocumentArrowDownIcon className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Date Range Filter */}
      <Card>
        <CardBody className="p-3 sm:p-4">
          <div className="flex flex-wrap gap-2">
            {(['week', 'month', 'year', 'all'] as const).map((range) => (
              <button
                key={range}
                onClick={() => {
                  setDateRange(range)
                  setCurrentPage(1)
                }}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg capitalize transition ${
                  dateRange === range 
                    ? 'bg-emerald-600 text-white' 
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {range === 'all' ? 'All Time' : `This ${range}`}
              </button>
            ))}
          </div>
        </CardBody>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Earnings */}
        <Card>
          <CardBody className="p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-slate-500 mb-1">Total Earnings</p>
                <p className="text-xl sm:text-2xl font-bold text-slate-900">
                  {formatCurrency(summary.totalEarnings)}
                </p>
                <div className="flex items-center gap-1 mt-2">
                  {percentageChange > 0 ? 
                    <ArrowUpIcon className="h-3 w-3 text-green-500" /> : 
                    <ArrowDownIcon className="h-3 w-3 text-red-500" />
                  }
                  <span className={`text-xs ${percentageChange > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {Math.abs(percentageChange).toFixed(1)}% vs last month
                  </span>
                </div>
              </div>
              <div className="p-2 bg-emerald-100 rounded-lg">
                <BanknotesIcon className="h-5 w-5 text-emerald-600" />
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Pending Payouts */}
        <Card>
          <CardBody className="p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-slate-500 mb-1">Pending Payouts</p>
                <p className="text-xl sm:text-2xl font-bold text-slate-900">
                  {formatCurrency(summary.pendingPayouts)}
                </p>
                <p className="text-xs text-slate-500 mt-2">
                  From {transactions.filter(t => t.status === 'pending').length} upcoming
                </p>
              </div>
              <div className="p-2 bg-yellow-100 rounded-lg">
                <ClockIcon className="h-5 w-5 text-yellow-600" />
              </div>
            </div>
          </CardBody>
        </Card>

        {/* This Month */}
        <Card>
          <CardBody className="p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-slate-500 mb-1">This Month</p>
                <p className="text-xl sm:text-2xl font-bold text-slate-900">
                  {formatCurrency(summary.thisMonth)}
                </p>
                <p className="text-xs text-slate-500 mt-2">
                  {summary.totalHours.toFixed(1)} hours worked
                </p>
              </div>
              <div className="p-2 bg-blue-100 rounded-lg">
                <CurrencyDollarIcon className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Average per Consultation */}
        <Card>
          <CardBody className="p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-slate-500 mb-1">Avg per Consultation</p>
                <p className="text-xl sm:text-2xl font-bold text-slate-900">
                  {formatCurrency(summary.avgPerConsultation)}
                </p>
                <p className="text-xs text-slate-500 mt-2">
                  Based on {summary.completedConsultations} completed
                </p>
              </div>
              <div className="p-2 bg-purple-100 rounded-lg">
                <ChartBarIcon className="h-5 w-5 text-purple-600" />
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Transactions Table */}
      <Card>
        <CardHeader className="border-b border-slate-200 px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <h3 className="text-base sm:text-lg font-semibold text-slate-900">Transaction History</h3>
            <div className="flex flex-wrap gap-2">
              <FunnelIcon className="h-4 w-4 text-slate-400 mr-1 self-center" />
              {(['all', 'completed', 'pending', 'cancelled'] as const).map(s => (
                <button
                  key={s}
                  onClick={() => { setFilterStatus(s); setCurrentPage(1) }}
                  className={`px-3 py-1 text-xs font-medium rounded-lg capitalize transition ${
                    filterStatus === s 
                      ? 'bg-emerald-600 text-white' 
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        </CardHeader>
        
        <CardBody className="p-0 sm:p-2">
          {paginated.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-14 h-14 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CurrencyDollarIcon className="h-7 w-7 text-slate-400" />
              </div>
              <p className="text-sm text-slate-500">No transactions found</p>
              <p className="text-xs text-slate-400 mt-1">Try adjusting your filters</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200 text-xs text-slate-500">
                    <th className="text-left py-3 px-3 sm:px-4">Date & Time</th>
                    <th className="text-left py-3 px-3 sm:px-4">Client</th>
                    <th className="text-left py-3 px-3 sm:px-4 hidden sm:table-cell">Duration</th>
                    <th className="text-left py-3 px-3 sm:px-4 hidden md:table-cell">Rate</th>
                    <th className="text-left py-3 px-3 sm:px-4">Amount</th>
                    <th className="text-left py-3 px-3 sm:px-4">Status</th>
                    <th className="text-left py-3 px-3 sm:px-4 hidden lg:table-cell">Transaction ID</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {paginated.map((t, i) => (
                    <motion.tr
                      key={t.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="hover:bg-slate-50"
                    >
                      <td className="py-3 px-3 sm:px-4">
                        <div className="text-xs sm:text-sm text-slate-900">
                          {new Date(t.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </div>
                        <div className="text-xs text-slate-500">{t.time}</div>
                      </td>
                      <td className="py-3 px-3 sm:px-4">
                        <div className="text-xs sm:text-sm text-slate-900 truncate max-w-[120px] sm:max-w-none">
                          {t.clientName}
                        </div>
                        <div className="text-xs text-slate-500">#{t.consultationId}</div>
                      </td>
                      <td className="py-3 px-3 sm:px-4 hidden sm:table-cell text-xs sm:text-sm text-slate-900">
                        {t.duration} min
                      </td>
                      <td className="py-3 px-3 sm:px-4 hidden md:table-cell text-xs sm:text-sm text-slate-600">
                        {formatCurrency(t.rate)}/hr
                      </td>
                      <td className="py-3 px-3 sm:px-4 text-xs sm:text-sm font-semibold text-slate-900">
                        {formatCurrency(t.amount)}
                      </td>
                      <td className="py-3 px-3 sm:px-4">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusStyle(t.status)}`}>
                          {getStatusIcon(t.status)}
                          <span className="capitalize hidden xs:inline">{t.status}</span>
                        </span>
                      </td>
                      <td className="py-3 px-3 sm:px-4 hidden lg:table-cell text-xs text-slate-500 font-mono">
                        {t.transactionId}
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-4 pt-4 border-t border-slate-200 px-4 pb-4">
              <p className="text-xs sm:text-sm text-slate-500">
                Page {currentPage} of {totalPages} • {filtered.length} transactions
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="p-2 rounded-lg border border-slate-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 transition"
                >
                  <ChevronLeftIcon className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-lg border border-slate-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 transition"
                >
                  <ChevronRightIcon className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </CardBody>
      </Card>

      {/* Payout Information */}
      <Card className="bg-gradient-to-r from-emerald-50 to-teal-50 border-emerald-200">
        <CardBody className="p-4 flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          <div className="p-2 bg-emerald-100 rounded-full">
            <BanknotesIcon className="h-5 w-5 text-emerald-600" />
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-emerald-800">Payout Information</h3>
            <p className="text-xs text-emerald-600 mt-1">
              Payouts are processed on the 1st and 15th of each month. 
              Next payout: {new Date().getDate() < 15 
                ? new Date(new Date().setDate(15)).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
                : new Date(new Date().setMonth(new Date().getMonth() + 1, 1)).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
              }
            </p>
          </div>
          <Button variant="outline" size="sm" className="border-emerald-600 text-emerald-600 hover:bg-emerald-50 text-xs whitespace-nowrap">
            View Schedule
          </Button>
        </CardBody>
      </Card>

      <style jsx>{`
        @media (max-width: 480px) {
          .xs\\:inline {
            display: inline;
          }
        }
      `}</style>
    </div>
  )
}