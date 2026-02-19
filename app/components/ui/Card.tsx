'use client'

import React from 'react'
import { motion } from 'framer-motion'

interface CardProps {
  children: React.ReactNode
  className?: string
  onClick?: () => void
  hoverable?: boolean
  padding?: 'none' | 'sm' | 'md' | 'lg'
  bordered?: boolean
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  onClick,
  hoverable = true,
  padding = 'md',
  bordered = false,
}) => {
  const paddingClasses = {
    none: '',
    sm: 'p-3 sm:p-4',
    md: 'p-4 sm:p-5 md:p-6',
    lg: 'p-5 sm:p-6 md:p-8',
  }

  return (
    <motion.div
      whileHover={hoverable ? { y: -2, transition: { duration: 0.2 } } : undefined}
      transition={{ duration: 0.2 }}
      className={`
        bg-white rounded-xl overflow-hidden
        dark:bg-gray-800
        ${bordered ? 'border border-gray-200 dark:border-gray-700' : 'shadow-sm hover:shadow-md'}
        ${hoverable ? 'cursor-pointer' : ''}
        ${paddingClasses[padding]}
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
  <div className={`px-4 sm:px-5 md:px-6 py-3 sm:py-4 border-b border-gray-200 dark:border-gray-700 ${className}`}>
    {children}
  </div>
)

export const CardBody: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = '',
}) => (
  <div className={`px-4 sm:px-5 md:px-6 py-3 sm:py-4 ${className}`}>
    {children}
  </div>
)

export const CardFooter: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = '',
}) => (
  <div className={`px-4 sm:px-5 md:px-6 py-3 sm:py-4 border-t border-gray-200 dark:border-gray-700 ${className}`}>
    {children}
  </div>
)

// Convenience component for image headers
export const CardImage: React.FC<{ src: string; alt: string; className?: string }> = ({
  src,
  alt,
  className = '',
}) => (
  <div className={`w-full h-32 sm:h-40 md:h-48 overflow-hidden ${className}`}>
    <img src={src} alt={alt} className="w-full h-full object-cover" />
  </div>
)