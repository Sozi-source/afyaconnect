import React from 'react'
import { motion } from 'framer-motion'

interface CardProps {
  children: React.ReactNode
  className?: string
  onClick?: () => void
  hoverable?: boolean
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  onClick,
  hoverable = true,
}) => {
  return (
    <motion.div
      whileHover={hoverable ? { y: -4 } : undefined}
      transition={{ duration: 0.2 }}
      className={`
        bg-white rounded-xl shadow-md overflow-hidden
        dark:bg-gray-800
        ${hoverable ? 'cursor-pointer' : ''}
        ${className}
      `}
      onClick={onClick}
    >
      {children}
    </motion.div>
  )
}

export const CardHeader: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = '',
}) => (
  <div className={`px-6 py-4 border-b border-gray-200 dark:border-gray-700 ${className}`}>
    {children}
  </div>
)

export const CardBody: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = '',
}) => (
  <div className={`px-6 py-4 ${className}`}>
    {children}
  </div>
)

export const CardFooter: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = '',
}) => (
  <div className={`px-6 py-4 border-t border-gray-200 dark:border-gray-700 ${className}`}>
    {children}
  </div>
)