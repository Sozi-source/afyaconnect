'use client'

import React from 'react'
import { motion } from 'framer-motion'

interface BadgeProps {
  children: React.ReactNode
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info' | 'primary'
  size?: 'sm' | 'md' | 'lg'
  className?: string
  animate?: boolean
  pill?: boolean
  removable?: boolean
  onRemove?: () => void
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  size = 'md',
  className = '',
  animate = false,
  pill = true,
  removable = false,
  onRemove,
}) => {
  const variants = {
    default: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
    success: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    warning: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    error: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    info: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    primary: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  }

  const sizes = {
    sm: 'px-1.5 sm:px-2 py-0.5 text-[10px] sm:text-xs',
    md: 'px-2 sm:px-2.5 py-0.5 sm:py-1 text-xs sm:text-sm',
    lg: 'px-2.5 sm:px-3 py-1 sm:py-1.5 text-sm sm:text-base',
  }

  const badgeClasses = `
    inline-flex items-center font-medium
    ${pill ? 'rounded-full' : 'rounded-md'}
    ${variants[variant]}
    ${sizes[size]}
    ${removable ? 'pr-1' : ''}
    ${className}
  `

  const badge = removable ? (
    <span className={badgeClasses}>
      <span className="mr-1">{children}</span>
      <button
        onClick={onRemove}
        className="hover:bg-black/10 dark:hover:bg-white/10 rounded-full p-0.5 transition-colors"
        aria-label="Remove"
      >
        <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </span>
  ) : (
    <span className={badgeClasses}>{children}</span>
  )

  if (animate) {
    return (
      <motion.span
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0 }}
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