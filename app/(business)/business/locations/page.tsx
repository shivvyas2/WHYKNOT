'use client'

import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import { LocationSearch } from '@/components/business/LocationSearch'
import { CategoryDropdown } from '@/components/business/CategoryDropdown'
import { AreaInsights } from '@/components/business/AreaInsights'

// Dynamically import MapContainer to prevent SSR
const MapContainer = dynamic(() => import('@/components/business/MapContainer').then(mod => ({ default: mod.MapContainer })), {
  ssr: false,
})

export default function LocationsPage() {
  const [selectedLocation, setSelectedLocation] = useState<[number, number]>([
    40.7128, -74.0060,
  ])
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [clickedArea, setClickedArea] = useState<{ lat: number; lng: number } | null>(
    null
  )

  // Make the page full-screen by removing default layout constraints
  useEffect(() => {
    // Remove padding/margins from body when on this page
    const originalMargin = document.body.style.margin
    const originalPadding = document.body.style.padding
    const originalOverflow = document.body.style.overflow
    
    document.body.style.margin = '0'
    document.body.style.padding = '0'
    document.body.style.overflow = 'hidden'

    return () => {
      document.body.style.margin = originalMargin
      document.body.style.padding = originalPadding
      document.body.style.overflow = originalOverflow
    }
  }, [])

  return (
    <div className="fixed inset-0 h-screen w-screen">
      {/* Map */}
      <MapContainer
        center={selectedLocation}
        category={selectedCategory}
        onAreaClick={setClickedArea}
      />

      {/* Location Search - Top Left */}
      <div className="absolute top-6 left-6 z-[1000]">
        <LocationSearch onLocationSelect={setSelectedLocation} />
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

