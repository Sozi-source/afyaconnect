'use client'

import { motion } from 'framer-motion'

interface Tab {
  id: string
  label: string
  icon?: React.ElementType
}

interface TabsProps {
  tabs: Tab[]
  activeTab: string
  onTabChange: (tabId: string) => void
}

export const Tabs = ({ tabs, activeTab, onTabChange }: TabsProps) => {
  return (
    <div className="border-b border-gray-200 dark:border-gray-700">
      <nav className="flex space-x-8">
        {tabs.map((tab) => {
          const isActive = tab.id === activeTab
          const Icon = tab.icon
          
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`
                relative py-4 px-1 flex items-center space-x-2 text-sm font-medium transition-colors
                ${isActive 
                  ? 'text-primary-600 dark:text-primary-400' 
                  : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                }
              `}
            >
              {Icon && <Icon className="h-5 w-5" />}
              <span>{tab.label}</span>
              {isActive && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-600 dark:bg-primary-400"
                />
              )}
            </button>
          )
        })}
      </nav>
    </div>
  )
}