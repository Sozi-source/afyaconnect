'use client'

import { motion } from 'framer-motion'
import { useState, useEffect, useRef } from 'react'

interface Tab {
  id: string
  label: string
  icon?: React.ElementType
  badge?: number
  disabled?: boolean
}

interface TabsProps {
  tabs: Tab[]
  activeTab: string
  onTabChange: (tabId: string) => void
  variant?: 'default' | 'pills' | 'underlined'
  size?: 'sm' | 'md' | 'lg'
  fullWidth?: boolean
}

export const Tabs = ({ 
  tabs, 
  activeTab, 
  onTabChange, 
  variant = 'default',
  size = 'md',
  fullWidth = false 
}: TabsProps) => {
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 })
  const tabRefs = useRef<Map<string, HTMLButtonElement>>(new Map())

  useEffect(() => {
    if (variant === 'underlined') {
      const activeTabElement = tabRefs.current.get(activeTab)
      if (activeTabElement) {
        setIndicatorStyle({
          left: activeTabElement.offsetLeft,
          width: activeTabElement.offsetWidth,
        })
      }
    }
  }, [activeTab, variant])

  const sizeClasses = {
    sm: 'text-xs sm:text-sm py-2 sm:py-2.5 px-2 sm:px-3 gap-1 sm:gap-1.5',
    md: 'text-sm sm:text-base py-2.5 sm:py-3 px-3 sm:px-4 gap-1.5 sm:gap-2',
    lg: 'text-base sm:text-lg py-3 sm:py-4 px-4 sm:px-5 gap-2 sm:gap-2.5',
  }

  const variants = {
    default: 'border-b border-gray-200 dark:border-gray-700',
    pills: 'bg-gray-100 dark:bg-gray-800 p-1 rounded-xl',
    underlined: 'border-b border-gray-200 dark:border-gray-700',
  }

  return (
    <div className={`${variants[variant]} ${fullWidth ? 'w-full' : ''}`}>
      <div className={`flex ${fullWidth ? 'w-full' : 'inline-flex'} ${variant === 'pills' ? 'space-x-1' : 'space-x-2 sm:space-x-4'}`}>
        {tabs.map((tab) => {
          const isActive = tab.id === activeTab
          const Icon = tab.icon
          
          const tabButton = (
            <button
              key={tab.id}
              ref={(el) => {
                if (el) tabRefs.current.set(tab.id, el)
                else tabRefs.current.delete(tab.id)
              }}
              onClick={() => !tab.disabled && onTabChange(tab.id)}
              disabled={tab.disabled}
              className={`
                relative flex items-center justify-center font-medium transition-all
                ${sizeClasses[size]}
                ${fullWidth ? 'flex-1' : ''}
                ${variant === 'pills' 
                  ? `rounded-lg ${isActive 
                      ? 'bg-white text-blue-600 shadow dark:bg-gray-700 dark:text-blue-400' 
                      : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-300'
                    }`
                  : variant === 'underlined'
                  ? `border-b-2 ${isActive 
                      ? 'border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400' 
                      : 'border-transparent text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-300'
                    }`
                  : `rounded-lg ${isActive 
                      ? 'text-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-400' 
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:bg-gray-800'
                    }`
                }
                ${tab.disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
              `}
            >
              {Icon && <Icon className="h-4 w-4 sm:h-5 sm:w-5" />}
              <span>{tab.label}</span>
              {tab.badge !== undefined && (
                <span className={`
                  ml-1.5 px-1.5 py-0.5 text-xs rounded-full
                  ${isActive 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                  }
                `}>
                  {tab.badge}
                </span>
              )}
            </button>
          )

          return tabButton
        })}
      </div>

      {/* Animated indicator for underlined variant */}
      {variant === 'underlined' && (
        <motion.div
          className="relative h-0.5"
          initial={false}
          animate={indicatorStyle}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        >
          <div className="absolute bottom-0 h-0.5 bg-blue-600 dark:bg-blue-400" 
            style={{ 
              left: indicatorStyle.left, 
              width: indicatorStyle.width,
              transition: 'all 0.2s ease-in-out'
            }} 
          />
        </motion.div>
      )}
    </div>
  )
}

// Convenience component for tab panels
export const TabPanel: React.FC<{ 
  children: React.ReactNode 
  active: boolean 
  className?: string 
}> = ({ children, active, className = '' }) => {
  if (!active) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
      className={className}
    >
      {children}
    </motion.div>
  )
}