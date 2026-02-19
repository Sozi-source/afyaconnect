'use client'

import { Practitioner } from '@/app/types'
import { PractitionerCard } from './PractitionerCard'
import { motion } from 'framer-motion'

interface PractitionerGridProps {
  practitioners: Practitioner[]
  isLoading?: boolean
}

export const PractitionerGrid = ({ practitioners, isLoading }: PractitionerGridProps) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-md h-80 animate-pulse"
          >
            <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded-t-xl" />
            <div className="p-4 space-y-3">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6" />
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (practitioners.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-16 bg-white dark:bg-gray-800 rounded-xl shadow-sm"
      >
        <div className="text-6xl mb-4">🔍</div>
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          No practitioners found
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          Try adjusting your filters or search criteria
        </p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 text-primary-600 hover:text-primary-700 text-sm"
        >
          Reset filters
        </button>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
    >
      {practitioners.map((practitioner, index) => (
        <motion.div
          key={practitioner.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: Math.min(index * 0.1, 0.5) }}
        >
          <PractitionerCard practitioner={practitioner} />
        </motion.div>
      ))}
    </motion.div>
  )
}