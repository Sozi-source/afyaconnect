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
  date: string
  time: string
  amount: number
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
    completedConsultations: 0
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
      const consultations = await apiClient.consultations.getMyPractitionerConsultations()
      
      const completed = consultations.filter((c: any) => c.status === 'completed')
      const pending = consultations.filter((c: any) => c.status === 'booked')
      
      const totalEarnings = completed.reduce((sum: number, c: any) => sum + (c.price || 500), 0)
      const now = new Date()
      
      setSummary({
        totalEarnings,
        pendingPayouts: pending.reduce((sum: number, c: any) => sum + (c.price || 500), 0),
        thisMonth: completed.filter((c: any) => new Date(c.date).getMonth() === now.getMonth()).reduce((sum: number, c: any) => sum + (c.price || 500), 0),
        lastMonth: completed.filter((c: any) => new Date(c.date).getMonth() === now.getMonth() - 1).reduce((sum: number, c: any) => sum + (c.price || 500), 0),
        avgPerConsultation: completed.length ? totalEarnings / completed.length : 0,
        totalConsultations: consultations.length,
        completedConsultations: completed.length
      })

      setTransactions(consultations.map((c: any, i: number) => {
        let status: TransactionStatus = 'cancelled'
        if (c.status === 'completed') status = 'completed'
        else if (c.status === 'booked') status = 'pending'
        
        return {
          id: i + 1,
          consultationId: c.id,
          clientName: c.client_name || 'Client',
          date: c.date,
          time: c.time.slice(0,5),
          amount: c.price || 500,
          status,
          transactionId: `TRX-${c.id}`
        }
      }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()))
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const filtered = transactions.filter(t => filterStatus === 'all' ? true : t.status === filterStatus)
  const paginated = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
  const totalPages = Math.ceil(filtered.length / itemsPerPage)

  const formatCurrency = (amount: number) => `KES ${amount.toLocaleString()}`
  const percentageChange = summary.lastMonth ? ((summary.thisMonth - summary.lastMonth) / summary.lastMonth) * 100 : 100

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
    <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-4 border-emerald-200 border-t-emerald-600" /></div>
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Earnings Dashboard</h1>
        <Button onClick={() => {
          const csv = [['Date','Client','Amount','Status','ID'], ...transactions.map(t => [t.date, t.clientName, t.amount, t.status, t.transactionId])].map(r => r.join(',')).join('\n')
          const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([csv])); a.download = 'earnings.csv'; a.click()
        }} variant="outline" size="sm"><DownloadIcon className="h-4 w-4 mr-2" />Export</Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { title: 'Total Earnings', value: formatCurrency(summary.totalEarnings), icon: BanknotesIcon, color: 'emerald', trend: percentageChange },
          { title: 'Pending', value: formatCurrency(summary.pendingPayouts), icon: ClockIcon, color: 'yellow' },
          { title: 'This Month', value: formatCurrency(summary.thisMonth), icon: CurrencyDollarIcon, color: 'blue' },
          { title: 'Avg/Consult', value: formatCurrency(summary.avgPerConsultation), icon: ChartBarIcon, color: 'purple' }
        ].map((item, i) => (
          <Card key={i}>
            <CardBody className="p-4">
              <div className="flex justify-between">
                <div>
                  <p className="text-sm text-gray-500">{item.title}</p>
                  <p className="text-2xl font-bold mt-1">{item.value}</p>
                  {item.trend !== undefined && (
                    <div className="flex items-center gap-1 mt-2">
                      {item.trend > 0 ? <ArrowUpIcon className="h-3 w-3 text-green-500" /> : <ArrowDownIcon className="h-3 w-3 text-red-500" />}
                      <span className={`text-xs ${item.trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {Math.abs(item.trend).toFixed(1)}% vs last month
                      </span>
                    </div>
                  )}
                </div>
                <div className={`p-3 rounded-xl bg-${item.color}-100 text-${item.color}-600 dark:bg-${item.color}-900/30`}>
                  <item.icon className="h-5 w-5" />
                </div>
              </div>
            </CardBody>
          </Card>
        ))}
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card><CardBody className="p-4 flex justify-between">
          <div><p className="text-sm text-gray-500">Consultations</p><p className="text-2xl font-bold">{summary.totalConsultations}</p></div>
          <div className="p-3 bg-blue-100 rounded-xl"><CalendarIcon className="h-5 w-5 text-blue-600" /></div>
        </CardBody></Card>
        <Card><CardBody className="p-4 flex justify-between">
          <div><p className="text-sm text-gray-500">Completed</p><p className="text-2xl font-bold">{summary.completedConsultations}</p></div>
          <div className="p-3 bg-green-100 rounded-xl"><CheckCircleIcon className="h-5 w-5 text-green-600" /></div>
        </CardBody></Card>
        <Card><CardBody className="p-4 flex justify-between">
          <div><p className="text-sm text-gray-500">Success Rate</p><p className="text-2xl font-bold">{summary.totalConsultations ? ((summary.completedConsultations / summary.totalConsultations) * 100).toFixed(1) : 0}%</p></div>
          <div className="p-3 bg-purple-100 rounded-xl"><ChartBarIcon className="h-5 w-5 text-purple-600" /></div>
        </CardBody></Card>
      </div>

      {/* Transactions */}
      <Card>
        <CardHeader className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">Transactions</h3>
          <div className="flex gap-2">
            {['all', 'completed', 'pending', 'cancelled'].map(s => (
              <button key={s} onClick={() => { setFilterStatus(s as any); setCurrentPage(1) }}
                className={`px-3 py-1 text-sm rounded-lg transition ${filterStatus === s ? 'bg-emerald-600 text-white' : 'bg-gray-100 hover:bg-gray-200 dark:bg-gray-800'}`}>
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            ))}
          </div>
        </CardHeader>
        <CardBody className="p-4">
          {paginated.length === 0 ? (
            <div className="text-center py-8"><CurrencyDollarIcon className="h-12 w-12 mx-auto text-gray-400 mb-4" /><p className="text-gray-500">No transactions</p></div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead><tr className="border-b text-xs text-gray-500">
                  <th className="text-left py-3">Date</th><th className="text-left">Client</th><th className="text-left">Amount</th><th className="text-left">Status</th><th className="text-left">ID</th>
                </tr></thead>
                <tbody className="divide-y">
                  {paginated.map((t, i) => (
                    <motion.tr key={t.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                      <td className="py-3"><div className="text-sm">{new Date(t.date).toLocaleDateString()}</div><div className="text-xs text-gray-500">{t.time}</div></td>
                      <td className="py-3"><div className="text-sm">{t.clientName}</div><div className="text-xs text-gray-500">#{t.consultationId}</div></td>
                      <td className="py-3 font-semibold">{formatCurrency(t.amount)}</td>
                      <td className="py-3"><span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs ${getStatusStyle(t.status)}`}>{getStatusIcon(t.status)}{t.status}</span></td>
                      <td className="py-3 text-xs text-gray-500">{t.transactionId}</td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {totalPages > 1 && (
            <div className="flex justify-between items-center mt-4 pt-4 border-t">
              <p className="text-sm text-gray-500">Page {currentPage} of {totalPages}</p>
              <div className="flex gap-2">
                <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="p-2 rounded-lg border disabled:opacity-50"><ChevronLeftIcon className="h-5 w-5" /></button>
                <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="p-2 rounded-lg border disabled:opacity-50"><ChevronRightIcon className="h-5 w-5" /></button>
              </div>
            </div>
          )}
        </CardBody>
      </Card>

      {/* Payout Info */}
      <Card className="bg-gradient-to-r from-emerald-50 to-teal-50">
        <CardBody className="p-4 flex gap-4">
          <BanknotesIcon className="h-8 w-8 text-emerald-600" />
          <div>
            <h3 className="font-semibold text-emerald-800">Payout Information</h3>
            <p className="text-sm text-emerald-600">Payouts processed on the 1st and 15th. Next payout: {new Date(new Date().setDate(15) > Date.now() ? new Date().setDate(15) : new Date(new Date().setMonth(new Date().getMonth() + 1)).setDate(1)).toLocaleDateString()}</p>
          </div>
        </CardBody>
      </Card>
    </div>
  )
}