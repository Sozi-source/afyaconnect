'use client'

import { AvailabilityManager } from '@/app/components/practitioners/AvailabilityManager'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { Button } from '@/app/components/ui/Buttons'
import { ArrowLeftIcon } from '@heroicons/react/24/outline'

export default function AvailabilityPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link href="/dashboard/practitioners">
          <Button variant="outline" size="sm" className="!p-2 sm:!px-4">
            <ArrowLeftIcon className="h-5 w-5 sm:mr-2" />
            <span className="hidden sm:inline">Back</span>
          </Button>
        </Link>
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
          Manage Availability
        </h1>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <AvailabilityManager />
      </motion.div>
    </div>
  )
}