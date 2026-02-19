'use client'

import React from 'react'
import { motion } from 'framer-motion'

interface BadgeProps {
  children: React.ReactNode
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info' | 'primary'
  size?: 'sm' | 'md' | 'lg'
  className?: string
  animate?: boolean
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  size = 'md',
  className = '',
  animate = false,
}) => {
  const variants = {
    default: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
    success: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    warning: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    error: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    info: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    primary: 'bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-200',
  }

  const sizes = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-sm',
    lg: 'px-3 py-1.5 text-base',
  }

  const badge = (
    <span
      className={`
        inline-flex items-center font-medium rounded-full
        ${variants[variant]}
        ${sizes[size]}
        ${className}
      `}
    >
      {children}
    </span>
  )

  if (animate) {
    return (
      <motion.span
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      >
        {badge}
      </motion.span>
    )
  }

  return badge
}

// Convenience components for common badge types
export const SuccessBadge: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className,
}) => (
  <Badge variant="success" className={className}>
    {children}
  </Badge>
)

export const ErrorBadge: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className,
}) => (
  <Badge variant="error" className={className}>
    {children}
  </Badge>
)

export const WarningBadge: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className,
}) => (
  <Badge variant="warning" className={className}>
    {children}
  </Badge>
)

export const InfoBadge: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className,
}) => (
  <Badge variant="info" className={className}>
    {children}
  </Badge>
)

export const PrimaryBadge: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className,
}) => (
  <Badge variant="primary" className={className}>
    {children}
  </Badge>
)