import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

interface NominatimResult {
  place_id: number
  lat: string
  lon: string
  display_name: string
  address?: {
    house_number?: string
    road?: string
    neighbourhood?: string
    suburb?: string
    city?: string
    town?: string
    village?: string
    county?: string
    state?: string
    postcode?: string
    country?: string
  }
}

interface LocationOption {
  id: string
  name: string
  displayName: string
  lat: number
  lng: number
  secondaryText?: string
}

function buildLabel(result: NominatimResult): { name: string; secondary?: string } {
  const address = result.address ?? {}
  const primary =
    address.city ||
    address.town ||
    address.village ||
    address.neighbourhood ||
    address.suburb ||
    address.road ||
    result.display_name.split(',')[0] ||
    'Selected location'

  const hierarchy = [
    address.state,
    address.county,
    address.country,
  ].filter(Boolean)

  return {
    name: primary,
    secondary: hierarchy.join(', ') || undefined,
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get('q')
  const limitParam = searchParams.get('limit')

  if (!query || query.trim().length < 3) {
    return NextResponse.json({ results: [] satisfies LocationOption[] })
  }

  const limit = Math.max(
    1,
    Math.min(Number.isFinite(Number(limitParam)) ? Number(limitParam) : 5, 10),
  )

  const url = `https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&limit=${limit}&q=${encodeURIComponent(
    query,
  )}`

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'WhyKnotApp/1.0 (contact@whyknot.app)',
        'Accept-Language': 'en',
      },
      cache: 'no-store',
    })

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch locations' },
        { status: response.status },
      )
    }

    const results = (await response.json()) as NominatimResult[]

    const formatted = results.map<LocationOption>((result) => {
      const { name, secondary } = buildLabel(result)

      return {
        id: String(result.place_id),
        name,
        displayName: result.display_name,
        lat: Number.parseFloat(result.lat),
        lng: Number.parseFloat(result.lon),
        secondaryText: secondary,
      }
    })

    return NextResponse.json({ results: formatted })
  } catch (error) {
    console.error('Location search failed', error)
    return NextResponse.json(
      { error: 'Unexpected error searching locations' },
      { status: 500 },
    )
  }
}


