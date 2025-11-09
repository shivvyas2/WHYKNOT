export const dynamic = 'force-dynamic'

import { NextResponse, type NextRequest } from 'next/server'

import { buildAreaSelectionFromData } from '@/lib/analytics/area'
import { aggregateStores, parseOrders } from '@/lib/analytics/orders'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const latParam = searchParams.get('lat')
    const lngParam = searchParams.get('lng')
    const category = (searchParams.get('category') ?? 'all').toLowerCase()

    const lat = latParam ? Number.parseFloat(latParam) : Number.NaN
    const lng = lngParam ? Number.parseFloat(lngParam) : Number.NaN

    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
      return NextResponse.json(
        { error: 'lat and lng query params are required and must be numeric.' },
        { status: 400 },
      )
    }

    const response = await fetch('http://localhost:8000/api/mongo-data', { cache: 'no-store' })
    if (!response.ok) {
      console.error('Location analytics request failed:', response.status, response.statusText)
      return NextResponse.json({ error: 'Failed to fetch live analytics data' }, { status: 502 })
    }

    const payload = await response.json()
    const rawOrders = Array.isArray(payload?.data) ? payload.data : []

    const orders = parseOrders(rawOrders)
    const stores = aggregateStores(orders)

    const selection = buildAreaSelectionFromData(lat, lng, orders, stores, category)

    return NextResponse.json({ selection })
  } catch (error) {
    console.error('Error computing location analytics:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

