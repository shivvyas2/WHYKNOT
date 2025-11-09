'use client'

import { useState, useEffect, useRef, useMemo, type KeyboardEvent } from 'react'
import { Loader2, MapPin, Search } from 'lucide-react'

import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

export interface LocationOption {
  id: string
  name: string
  displayName: string
  lat: number
  lng: number
  secondaryText?: string
}

interface LocationSearchProps {
  onLocationSelect: (location: LocationOption) => void
  placeholder?: string
  className?: string
  inputClassName?: string
  limit?: number
  initialQuery?: string
  autoFocus?: boolean
}

export function LocationSearch({
  onLocationSelect,
  placeholder = 'Search location...',
  className,
  inputClassName,
  limit = 5,
  initialQuery,
  autoFocus = false,
}: LocationSearchProps) {
  const [query, setQuery] = useState(initialQuery ?? '')
  const [results, setResults] = useState<LocationOption[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const requestIdRef = useRef(0)
  const containerRef = useRef<HTMLDivElement | null>(null)

  const minCharsReached = useMemo(() => query.trim().length >= 3, [query])

  useEffect(() => {
    if (typeof initialQuery === 'string') {
      setQuery(initialQuery)
    }
  }, [initialQuery])

  useEffect(() => {
    if (!minCharsReached) {
      setResults([])
      setIsOpen(false)
      setError(null)
      return
    }

    const controller = new AbortController()
    const trimmedQuery = query.trim()
    const currentRequestId = ++requestIdRef.current

    const timeoutId = window.setTimeout(async () => {
      setIsLoading(true)
      setError(null)

      try {
        const response = await fetch(
          `/api/location-search?q=${encodeURIComponent(trimmedQuery)}&limit=${limit}`,
          { signal: controller.signal },
        )

        if (!response.ok) {
          throw new Error(`Search failed with status ${response.status}`)
        }

        const data = (await response.json()) as { results?: LocationOption[] }

        if (requestIdRef.current === currentRequestId) {
          setResults(data.results ?? [])
          setIsOpen(true)
          if ((data.results ?? []).length === 0) {
            setError('No locations found')
          }
        }
      } catch (err) {
        if (controller.signal.aborted) {
          return
        }

        console.error('Location search error', err)
        if (requestIdRef.current === currentRequestId) {
          setResults([])
          setError('We ran into an issue searching that area')
          setIsOpen(true)
        }
      } finally {
        if (requestIdRef.current === currentRequestId) {
          setIsLoading(false)
        }
      }
    }, 350)

    return () => {
      controller.abort()
      window.clearTimeout(timeoutId)
    }
  }, [query, limit, minCharsReached])

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      if (
        containerRef.current &&
        event.target instanceof Node &&
        !containerRef.current.contains(event.target)
      ) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClick)
    return () => {
      document.removeEventListener('mousedown', handleClick)
    }
  }, [])

  const handleSelect = (option: LocationOption) => {
    setQuery(option.name)
    setResults([])
    setIsOpen(false)
    onLocationSelect(option)
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault()
      if (!minCharsReached) return
      if (results.length > 0) {
        handleSelect(results[0])
      }
    }

    if (event.key === 'Escape') {
      setIsOpen(false)
    }
  }

  return (
    <div ref={containerRef} className={cn('relative w-full max-w-full', className)}>
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <Input
          value={query}
          onChange={(event) => {
            setQuery(event.target.value)
            if (!isOpen) {
              setIsOpen(true)
            }
          }}
          onFocus={() => {
            if (results.length > 0 || error) {
              setIsOpen(true)
            }
          }}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          autoFocus={autoFocus}
          className={cn(
            'pl-12 pr-12 bg-white shadow-lg border border-gray-200 focus-visible:ring-2 focus-visible:ring-[#4c6ef5]',
            inputClassName,
          )}
        />
        {isLoading && (
          <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-gray-400" />
        )}
      </div>

      {isOpen && (
        <div className="absolute top-full z-50 mt-2 w-full overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xl">
          {!minCharsReached ? (
            <div className="px-4 py-3 text-sm text-gray-500">
              Keep typing to search for an address or area
            </div>
          ) : (
            <>
              {results.map((option) => (
                <button
                  key={option.id}
                  onClick={() => handleSelect(option)}
                  className="flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-gray-50 focus:bg-gray-100 focus:outline-none"
                >
                  <MapPin className="mt-0.5 h-4 w-4 text-gray-400" />
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-gray-900">{option.name}</span>
                    <span className="text-xs text-gray-500">
                      {option.secondaryText ?? option.displayName}
                    </span>
                  </div>
                </button>
              ))}
              {!isLoading && results.length === 0 && error && (
                <div className="px-4 py-3 text-sm text-gray-500">{error}</div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  )
}
