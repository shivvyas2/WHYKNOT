'use client'

import { useCallback } from 'react'
import { useRouter } from 'next/navigation'

import {
  LocationSearch,
  type LocationOption,
} from '@/components/business/LocationSearch'

export default function BusinessDashboard() {
  const router = useRouter()

  const handleLocationSelect = useCallback(
    (location: LocationOption) => {
      const params = new URLSearchParams({
        lat: location.lat.toString(),
        lng: location.lng.toString(),
        label: location.displayName,
      })

      router.push(`/business/locations?${params.toString()}`)
    },
    [router],
  )

  return (
    <div className="relative flex min-h-[calc(100vh-4rem)] w-full flex-col items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(55%_60%_at_90%_95%,rgba(189,211,255,0.6),rgba(237,242,252,0))]" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.92)_0%,rgba(255,255,255,0.7)_60%,rgba(255,255,255,0.4)_100%)]" />

      <div className="relative w-full max-w-4xl rounded-[40px] border border-[#4c6ef5] bg-white/90 px-6 py-12 text-center shadow-[0_30px_75px_rgba(76,110,245,0.2)] backdrop-blur-md sm:px-12 md:px-16 md:py-16">
        <h1 className="text-3xl font-semibold text-[#121c2f] sm:text-4xl md:text-5xl">
          Find Your Next Profitable Location
        </h1>
        <p className="mt-4 text-base text-[#596173] md:text-lg">
          Data-Driven Decisions, Made Simple.
        </p>

        <div className="mx-auto mt-10 w-full max-w-2xl">
          <LocationSearch
            onLocationSelect={handleLocationSelect}
            placeholder="Which spot do you want to open your restaurant?"
            className="w-full"
            inputClassName="h-auto rounded-2xl border border-transparent bg-white pl-16 pr-6 py-4 text-base text-[#121c2f] placeholder:text-[#94a3b8] shadow-[0_15px_35px_rgba(17,28,47,0.08)] focus-visible:border-[#4c6ef5] focus-visible:ring-[#4c6ef5]/20"
          />
          <p className="mt-3 text-xs text-[#94a3b8]">
            Start typing to search any US address, city, or neighborhood and jump right
            into the map.
          </p>
        </div>
      </div>
    </div>
  )
}

