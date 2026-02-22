'use client'

import React from 'react'
import { motion } from 'framer-motion'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  isLoading?: boolean
  fullWidth?: boolean
  children: React.ReactNode
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  animate?: boolean
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  fullWidth = false,
  children,
  className = '',
  disabled,
  leftIcon,
  rightIcon,
  animate = false,
  ...props
}) => {
  // Base classes with professional transitions
  const baseClasses = `
    inline-flex items-center justify-center
    font-medium rounded-xl
    transition-all duration-200 ease-in-out
    focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-gray-900
    disabled:opacity-50 disabled:cursor-not-allowed
    active:transform active:scale-[0.98]
  `
  
  // Variant styles with proper hover/focus states
  const variants = {
    primary: `
      bg-blue-600 text-white 
      hover:bg-blue-700 
      focus:ring-blue-500 
      dark:bg-blue-500 dark:hover:bg-blue-600
      shadow-sm hover:shadow
    `,
    secondary: `
      bg-gray-200 text-gray-800 
      hover:bg-gray-300 
      focus:ring-gray-500 
      dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600
    `,
    outline: `
      border-2 border-blue-600 text-blue-600 
      hover:bg-blue-50 
      focus:ring-blue-500 
      dark:border-blue-400 dark:text-blue-400 dark:hover:bg-blue-950
    `,
    ghost: `
      text-gray-600 
      hover:bg-gray-100 
      focus:ring-gray-500 
      dark:text-gray-400 dark:hover:bg-gray-800
    `,
    danger: `
      bg-red-600 text-white 
      hover:bg-red-700 
      focus:ring-red-500 
      dark:bg-red-500 dark:hover:bg-red-600
      shadow-sm hover:shadow
    `,
  }

  // Size variants with responsive padding
  const sizes = {
    sm: 'px-2.5 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm gap-1 sm:gap-1.5',
    md: 'px-4 sm:px-5 py-2 sm:py-2.5 text-sm sm:text-base gap-1.5 sm:gap-2',
    lg: 'px-5 sm:px-6 md:px-7 py-2.5 sm:py-3 md:py-3.5 text-base sm:text-lg gap-2 sm:gap-2.5',
  }

  // Loading spinner component with responsive sizing
  const LoadingSpinner = () => (
    <svg 
      className="animate-spin h-3.5 w-3.5 sm:h-4 sm:w-4" 
      xmlns="http://www.w3.org/2000/svg" 
      fill="none" 
      viewBox="0 0 24 24"
    >
      <circle 
        className="opacity-25" 
        cx="12" 
        cy="12" 
        r="10" 
        stroke="currentColor" 
        strokeWidth="4"
      />
      <path 
        className="opacity-75" 
        fill="currentColor" 
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  )

  const button = (
    <button
      className={`
        ${baseClasses}
        ${variants[variant]}
        ${sizes[size]}
        ${fullWidth ? 'w-full' : ''}
        ${className}
      `}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <span className="flex items-center justify-center">
          <LoadingSpinner />
          <span className="ml-2">Loading...</span>
        </span>
      ) : (
        <span className="flex items-center justify-center">
          {leftIcon && <span className="inline-flex mr-1 sm:mr-2">{leftIcon}</span>}
          <span>{children}</span>
          {rightIcon && <span className="inline-flex ml-1 sm:ml-2">{rightIcon}</span>}
        </span>
      )}
    </button>
  )

  if (animate) {
    return (
      <motion.div
        whileTap={{ scale: 0.95 }}
        transition={{ duration: 0.1 }}
      >
        {button}
      </motion.div>
    )
  }

  return button
}

// Convenience components for common button variants
export const PrimaryButton: React.FC<ButtonProps> = (props) => (
  <Button variant="primary" {...props} />
)

export const SecondaryButton: React.FC<ButtonProps> = (props) => (
  <Button variant="secondary" {...props} />
)

export const OutlineButton: React.FC<ButtonProps> = (props) => (
  <Button variant="outline" {...props} />
)

export const DangerButton: React.FC<ButtonProps> = (props) => (
  <Button variant="danger" {...props} />
)