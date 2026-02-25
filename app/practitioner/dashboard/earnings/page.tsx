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
  ExclamationCircleIcon
} from '@heroicons/react/24/outline'
import { Card, CardBody, CardHeader } from '@/app/components/ui/Card'
import { Button } from '@/app/components/ui/Buttons'
import { apiClient } from '@/app/lib/api'
import { DownloadIcon } from 'lucide-react'

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
  const itemsPerPage = 8

  useEffect(() => {
    if (!authLoading && !isAuthenticated) router.push('/login')
    if (!authLoading && user?.role !== 'practitioner') router.push('/client/dashboard')
    if (isAuthenticated) fetchData()
  }, [authLoading, isAuthenticated, user])

  const fetchData = async () => {
    setLoading(true)
    try {
      // Fetch practitioner profile to get hourly rate
      const practitioner = await apiClient.practitioners.getMyProfile()
      const hourlyRate = practitioner.hourly_rate || 0

      // Fetch all consultations
      const consultations = await apiClient.consultations.getMyPractitionerConsultations()
      
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
      
      const thisMonthEarnings = completed
        .filter((c: any) => {
          const cDate = new Date(c.date)
          return cDate.getMonth() === currentMonth && cDate.getFullYear() === currentYear
        })
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

  const filtered = transactions.filter(t => filterStatus === 'all' ? true : t.status === filterStatus)
  const paginated = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
  const totalPages = Math.ceil(filtered.length / itemsPerPage)

  const formatCurrency = (amount: number) => `KES ${amount.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
  const percentageChange = summary.lastMonth ? ((summary.thisMonth - summary.lastMonth) / summary.lastMonth) * 100 : summary.thisMonth > 0 ? 100 : 0

  const getStatusStyle = (status: TransactionStatus) => {
    const styles = {
      completed: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
      pending: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300',
      cancelled: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
    }
    return styles[status]
  }

  const getStatusIcon = (status: TransactionStatus) => {
    const icons = {
      completed: <CheckCircleIcon className="h-4 w-4" />,
      pending: <ClockIcon className="h-4 w-4" />,
      cancelled: <ExclamationCircleIcon className="h-4 w-4" />
    }
    return icons[status]
  }

  if (authLoading || loading) return (
    <div className="flex justify-center py-20">
      <div className="animate-spin rounded-full h-12 w-12 border-4 border-emerald-200 border-t-emerald-600" />
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Earnings Dashboard</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Track your consultation earnings and payouts
          </p>
        </div>
        <Button 
          onClick={() => {
            const headers = ['Date', 'Time', 'Duration', 'Client', 'Email', 'Rate', 'Amount', 'Status', 'Transaction ID']
            const rows = transactions.map(t => [
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
          }} 
          variant="outline" 
          size="sm"
        >
          <DownloadIcon className="h-4 w-4 mr-2" />
          Export CSV
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Earnings */}
        <Card>
          <CardBody className="p-4">
            <div className="flex justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Total Earnings</p>
                <p className="text-2xl font-bold mt-1 text-gray-900 dark:text-white">
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
              <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl">
                <BanknotesIcon className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Pending Payouts */}
        <Card>
          <CardBody className="p-4">
            <div className="flex justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Pending Payouts</p>
                <p className="text-2xl font-bold mt-1 text-gray-900 dark:text-white">
                  {formatCurrency(summary.pendingPayouts)}
                </p>
                <p className="text-xs text-gray-500 mt-2">
                  From {transactions.filter(t => t.status === 'pending').length} upcoming consultations
                </p>
              </div>
              <div className="p-3 bg-yellow-100 dark:bg-yellow-900/30 rounded-xl">
                <ClockIcon className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
              </div>
            </div>
          </CardBody>
        </Card>

        {/* This Month */}
        <Card>
          <CardBody className="p-4">
            <div className="flex justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">This Month</p>
                <p className="text-2xl font-bold mt-1 text-gray-900 dark:text-white">
                  {formatCurrency(summary.thisMonth)}
                </p>
                <p className="text-xs text-gray-500 mt-2">
                  {summary.totalHours.toFixed(1)} hours worked
                </p>
              </div>
              <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
                <CurrencyDollarIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Average per Consultation */}
        <Card>
          <CardBody className="p-4">
            <div className="flex justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Avg per Consultation</p>
                <p className="text-2xl font-bold mt-1 text-gray-900 dark:text-white">
                  {formatCurrency(summary.avgPerConsultation)}
                </p>
                <p className="text-xs text-gray-500 mt-2">
                  Based on {summary.completedConsultations} completed
                </p>
              </div>
              <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-xl">
                <ChartBarIcon className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardBody className="p-4 flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Consultations</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{summary.totalConsultations}</p>
            </div>
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
              <CalendarIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
          </CardBody>
        </Card>
        
        <Card>
          <CardBody className="p-4 flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Completed</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{summary.completedConsultations}</p>
            </div>
            <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-xl">
              <CheckCircleIcon className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
          </CardBody>
        </Card>
        
        <Card>
          <CardBody className="p-4 flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Success Rate</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {summary.totalConsultations ? ((summary.completedConsultations / summary.totalConsultations) * 100).toFixed(1) : 0}%
              </p>
            </div>
            <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-xl">
              <ChartBarIcon className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Transactions Table */}
      <Card>
        <CardHeader className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Transaction History</h3>
          <div className="flex flex-wrap gap-2">
            {(['all', 'completed', 'pending', 'cancelled'] as const).map(s => (
              <button
                key={s}
                onClick={() => { setFilterStatus(s); setCurrentPage(1) }}
                className={`px-3 py-1 text-sm rounded-lg capitalize transition ${
                  filterStatus === s 
                    ? 'bg-emerald-600 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </CardHeader>
        
        <CardBody className="p-4">
          {paginated.length === 0 ? (
            <div className="text-center py-12">
              <CurrencyDollarIcon className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500 dark:text-gray-400">No transactions found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700 text-xs text-gray-500 dark:text-gray-400">
                    <th className="text-left py-3">Date & Time</th>
                    <th className="text-left">Client</th>
                    <th className="text-left">Duration</th>
                    <th className="text-left">Rate</th>
                    <th className="text-left">Amount</th>
                    <th className="text-left">Status</th>
                    <th className="text-left">Transaction ID</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {paginated.map((t, i) => (
                    <motion.tr
                      key={t.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="hover:bg-gray-50 dark:hover:bg-gray-800/50"
                    >
                      <td className="py-3">
                        <div className="text-sm text-gray-900 dark:text-white">
                          {new Date(t.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">{t.time}</div>
                      </td>
                      <td className="py-3">
                        <div className="text-sm text-gray-900 dark:text-white">{t.clientName}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">#{t.consultationId}</div>
                      </td>
                      <td className="py-3 text-sm text-gray-900 dark:text-white">{t.duration} min</td>
                      <td className="py-3 text-sm text-gray-600 dark:text-gray-300">{formatCurrency(t.rate)}/hr</td>
                      <td className="py-3 font-semibold text-gray-900 dark:text-white">{formatCurrency(t.amount)}</td>
                      <td className="py-3">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusStyle(t.status)}`}>
                          {getStatusIcon(t.status)}
                          <span className="capitalize">{t.status}</span>
                        </span>
                      </td>
                      <td className="py-3 text-xs text-gray-500 dark:text-gray-400 font-mono">{t.transactionId}</td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Page {currentPage} of {totalPages} • {filtered.length} transactions
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-800 transition"
                >
                  <ChevronLeftIcon className="h-5 w-5" />
                </button>
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-800 transition"
                >
                  <ChevronRightIcon className="h-5 w-5" />
                </button>
              </div>
            </div>
          )}
        </CardBody>
      </Card>

      {/* Payout Information */}
      <Card className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30 border-emerald-200 dark:border-emerald-800">
        <CardBody className="p-4 flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 rounded-full">
            <BanknotesIcon className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-emerald-800 dark:text-emerald-300">Payout Information</h3>
            <p className="text-sm text-emerald-600 dark:text-emerald-400">
              Payouts are processed on the 1st and 15th of each month. 
              Next payout: {new Date().getDate() < 15 
                ? new Date(new Date().setDate(15)).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
                : new Date(new Date().setMonth(new Date().getMonth() + 1, 1)).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
              }
            </p>
          </div>
          <Button variant="outline" size="sm" className="border-emerald-600 text-emerald-600 hover:bg-emerald-50">
            View Payout Schedule
          </Button>
        </CardBody>
      </Card>
    </div>
  )
}