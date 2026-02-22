'use client'

import { useState, useEffect } from 'react'

/**
 * A custom hook that debounces a value
 * @param value The value to debounce
 * @param delay The delay in milliseconds
 * @returns The debounced value
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    // Set a timeout to update the debounced value after the specified delay
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    // Clean up the timeout if the value changes before the delay has passed
    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}

/**
 * A custom hook that debounces a value with immediate execution option
 * @param value The value to debounce
 * @param delay The delay in milliseconds
 * @param options Configuration options
 * @returns The debounced value and a function to cancel pending debounce
 */
export function useDebounceWithCancel<T>(
  value: T, 
  delay: number, 
  options?: { maxWait?: number }
): [T, () => void] {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)
  const [timerId, setTimerId] = useState<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (timerId) {
      clearTimeout(timerId)
    }

    const id = setTimeout(() => {
      setDebouncedValue(value)
      setTimerId(null)
    }, delay)

    setTimerId(id)

    return () => {
      if (timerId) {
        clearTimeout(timerId)
      }
    }
  }, [value, delay])

  const cancel = () => {
    if (timerId) {
      clearTimeout(timerId)
      setTimerId(null)
    }
  }

  return [debouncedValue, cancel]
}

/**
 * A custom hook that debounces a callback function
 * @param callback The function to debounce
 * @param delay The delay in milliseconds
 * @returns A debounced version of the callback
 */
export function useDebouncedCallback<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): (...args: Parameters<T>) => void {
  const [timerId, setTimerId] = useState<NodeJS.Timeout | null>(null)

  return (...args: Parameters<T>) => {
    if (timerId) {
      clearTimeout(timerId)
    }

    const id = setTimeout(() => {
      callback(...args)
      setTimerId(null)
    }, delay)

    setTimerId(id)
  }
}

/**
 * A custom hook that debounces form input values
 * @param initialValue The initial value
 * @param delay The delay in milliseconds
 * @returns An object with the immediate value, debounced value, and setter
 */
export function useDebouncedInput<T>(initialValue: T, delay: number = 300) {
  const [immediateValue, setImmediateValue] = useState<T>(initialValue)
  const debouncedValue = useDebounce(immediateValue, delay)

  return {
    immediateValue,
    debouncedValue,
    setImmediateValue,
  }
}

/**
 * A custom hook that creates a debounced search function
 * @param onSearch The search function to call after debounce
 * @param delay The delay in milliseconds
 * @returns An object with search term handlers
 */
export function useDebouncedSearch(
  onSearch: (term: string) => void,
  delay: number = 300
) {
  const [searchTerm, setSearchTerm] = useState('')
  const debouncedSearchTerm = useDebounce(searchTerm, delay)

  useEffect(() => {
    onSearch(debouncedSearchTerm)
  }, [debouncedSearchTerm, onSearch])

  return {
    searchTerm,
    setSearchTerm,
    debouncedSearchTerm,
  }
}