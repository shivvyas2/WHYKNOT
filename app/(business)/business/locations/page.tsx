'use client'

import { useCallback, useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'

import {
  LocationSearch,
  type LocationOption,
} from '@/components/business/LocationSearch'
import { CategoryDropdown } from '@/components/business/CategoryDropdown'
import { AreaInsights } from '@/components/business/AreaInsights'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'

// Dynamically import MapContainer to prevent SSR
const MapContainer = dynamic(() => import('@/components/business/MapContainer').then(mod => ({ default: mod.MapContainer })), {
  ssr: false,
})

export default function LocationsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const pathname = usePathname()
  const [selectedLocation, setSelectedLocation] = useState<[number, number]>([
    40.7128, -74.0060,
  ])
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [clickedArea, setClickedArea] = useState<{ lat: number; lng: number } | null>(
    null
  )
  const [selectedLabel, setSelectedLabel] = useState<string | undefined>(undefined)

  // Make the page full-screen by removing default layout constraints
  useEffect(() => {
    // Remove padding/margins from body when on this page
    const originalMargin = document.body.style.margin
    const originalPadding = document.body.style.padding
    const originalOverflow = document.body.style.overflow
    const header = document.querySelector('[data-business-header]') as HTMLElement | null
    const originalHeaderDisplay = header?.style.display ?? ''
    
    document.body.style.margin = '0'
    document.body.style.padding = '0'
    document.body.style.overflow = 'hidden'
    if (header) {
      header.style.display = 'none'
    }

    return () => {
      document.body.style.margin = originalMargin
      document.body.style.padding = originalPadding
      document.body.style.overflow = originalOverflow
      if (header) {
        header.style.display = originalHeaderDisplay
      }
    }
  }, [])

  useEffect(() => {
    if (!searchParams) return

    const latParam = searchParams.get('lat')
    const lngParam = searchParams.get('lng')
    const labelParam = searchParams.get('label') || undefined

    if (labelParam && labelParam !== selectedLabel) {
      setSelectedLabel(labelParam)
    }

    if (latParam && lngParam) {
      const parsedLat = Number.parseFloat(latParam)
      const parsedLng = Number.parseFloat(lngParam)

      if (
        Number.isFinite(parsedLat) &&
        Number.isFinite(parsedLng) &&
        (parsedLat !== selectedLocation[0] || parsedLng !== selectedLocation[1])
      ) {
        setSelectedLocation([parsedLat, parsedLng])
      }
    }
  }, [searchParams, selectedLabel, selectedLocation])

  const handleLocationSelect = useCallback(
    (option: LocationOption) => {
      setSelectedLocation([option.lat, option.lng])
      setSelectedLabel(option.displayName)

      const params = new URLSearchParams({
        lat: option.lat.toString(),
        lng: option.lng.toString(),
        label: option.displayName,
      })

      router.replace(`${pathname}?${params.toString()}`, { scroll: false })
    },
    [pathname, router],
  )

  return (
    <div className="fixed inset-0 h-screen w-screen">
      {/* Map */}
      <MapContainer
        center={selectedLocation}
        category={selectedCategory}
        onAreaClick={setClickedArea}
      />

      {/* Location Search - Top Left */}
      {/* Page-level Back button */}
      <div className="absolute top-6 left-2 z-[1000]">
        <Button variant="ghost" size="icon" onClick={() => router.back()} aria-label="Go back">
          <ArrowLeft className="h-6 w-6" />
        </Button>
      </div>

      <div className="absolute top-6 left-12 z-[1000]">
        <LocationSearch
          onLocationSelect={handleLocationSelect}
          className="w-80"
          initialQuery={selectedLabel}
        />
      </div>

      {/* Category Dropdown - Top Right */}
      <div className="absolute top-6 right-6 z-[1000]">
        <CategoryDropdown value={selectedCategory} onChange={setSelectedCategory} />
      </div>

      {/* Area Insights Panel - Slides in when area is clicked */}
      {clickedArea && (
        <AreaInsights
          location={clickedArea}
          category={selectedCategory}
          onClose={() => setClickedArea(null)}
        />
      )}
    </div>
  )
}

