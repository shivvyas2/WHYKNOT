'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import 'leaflet.heat'
import type { HeatLayerOptions } from 'leaflet.heat'

import { computeAreaMetrics, convertMockInsightsToMetrics } from '@/lib/analytics/area'
import type { AreaSelection } from '@/lib/analytics/area'
import { type ParsedOrder, type StoreSummary, aggregateStores, clamp, parseOrders } from '@/lib/analytics/orders'
import { generateHeatmapData, getAreaInsights } from '@/utils/mockData'

export type { AreaMetrics, AreaSelection } from '@/lib/analytics/area'

type Coordinates = [number, number]

interface MapContainerProps {
  center: Coordinates
  category: string
  onAreaClick: (selection: AreaSelection) => void
}

interface MapData {
  orders: ParsedOrder[]
  stores: StoreSummary[]
  isFallback: boolean
}
const MIN_ZOOM_FOR_RESTAURANTS = 10
function computeHeatPoints(orders: ParsedOrder[], category: string): Array<[number, number, number]> {
  const relevantOrders = orders.filter((order) => {
    if (category === 'all') return true
    if (order.category === 'unknown') return false
    return order.category === category
  })

  if (relevantOrders.length === 0) {
    return []
  }

  const buckets = new Map<
    string,
    { lat: number; lng: number; count: number }
  >()

  relevantOrders.forEach((order) => {
    const lat = order.shippingLat
    const lng = order.shippingLng
    const key = `${lat.toFixed(3)}|${lng.toFixed(3)}`
    const current = buckets.get(key)
    if (current) {
      current.count += 1
    } else {
      buckets.set(key, { lat, lng, count: 1 })
    }
  })

  const counts = Array.from(buckets.values()).map((bucket) => bucket.count)
  const maxCount = Math.max(...counts)

  return Array.from(buckets.values()).map((bucket) => [
    bucket.lat,
    bucket.lng,
    clamp(0.25 + bucket.count / maxCount, 0.25, 1) as number,
  ])
}

function escapeHtml(str: string) {
  return str.replace(/[&<>"']/g, (char) => {
    switch (char) {
      case '&':
        return '&amp;'
      case '<':
        return '&lt;'
      case '>':
        return '&gt;'
      case '"':
        return '&quot;'
      case "'":
        return '&#39;'
      default:
        return char
    }
  })
}

export function MapContainer({ center, category, onAreaClick }: MapContainerProps) {
  const mapRef = useRef<L.Map | null>(null)
  const heatLayerRef = useRef<L.Layer | null>(null)
  const restaurantMarkersRef = useRef<L.Marker[]>([])
  const categoryRef = useRef(category)
  const fetchTimerRef = useRef<number | null>(null)
  const fetchRestaurantsForViewRef = useRef<(force?: boolean) => void>(() => {})
  const mapDataRef = useRef<MapData>({ orders: [], stores: [], isFallback: true })

  const [mapData, setMapData] = useState<MapData>(mapDataRef.current)
  const [dataMessage, setDataMessage] = useState<string | null>('Loading live demand…')
  const [filterMessage, setFilterMessage] = useState<string | null>(null)

  useEffect(() => {
    if (typeof window === 'undefined') return

    delete (L.Icon.Default.prototype as unknown as { _getIconUrl?: unknown })._getIconUrl
    L.Icon.Default.mergeOptions({
      iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
      iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    })

    if (!mapRef.current) {
      const usSouthWest = L.latLng(24.396308, -124.848974)
      const usNorthEast = L.latLng(49.384358, -66.885444)
      const usBounds = L.latLngBounds(usSouthWest, usNorthEast)

      mapRef.current = L.map('map', {
        center,
        zoom: 13,
        minZoom: 3,
        maxZoom: 30,
        maxBounds: usBounds,
        maxBoundsViscosity: 0.9,
        zoomControl: false,
      })

      L.control.zoom({ position: 'bottomleft' }).addTo(mapRef.current)

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 30,
        detectRetina: true,
      }).addTo(mapRef.current)

      mapRef.current.on('click', (event) => {
        const selection = buildSelection(event.latlng.lat, event.latlng.lng, mapDataRef.current, categoryRef.current ?? 'all')
        onAreaClick(selection)
      })

      const scheduleFetch = () => {
        if (!mapRef.current) return
        if (fetchTimerRef.current) {
          window.clearTimeout(fetchTimerRef.current)
        }
        fetchTimerRef.current = window.setTimeout(() => {
          fetchRestaurantsForViewRef.current()
        }, 600) as unknown as number
      }

      mapRef.current.on('moveend', scheduleFetch)
      scheduleFetch()
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove()
        mapRef.current = null
      }
    }
  }, [center, onAreaClick])

  useEffect(() => {
    categoryRef.current = category
  }, [category])

  useEffect(() => {
    mapDataRef.current = mapData
  }, [mapData])

  const fetchRestaurantsForView = useCallback(
    (force = false) => {
      if (!mapRef.current) return

      const zoom = mapRef.current.getZoom()
      if (!force && zoom < MIN_ZOOM_FOR_RESTAURANTS) {
        restaurantMarkersRef.current.forEach((marker) => mapRef.current?.removeLayer(marker))
        restaurantMarkersRef.current = []
        return
      }

      restaurantMarkersRef.current.forEach((marker) => mapRef.current?.removeLayer(marker))
      restaurantMarkersRef.current = []

      const currentData = mapDataRef.current
      if (currentData.isFallback || currentData.stores.length === 0) {
        return
      }

      const bounds = mapRef.current.getBounds()
      const activeCategory = categoryRef.current ?? 'all'

      const visibleStores = currentData.stores.filter((store) => {
        if (activeCategory !== 'all' && store.category !== activeCategory) {
          return false
        }
        return bounds.contains(L.latLng(store.lat, store.lng))
      })

      const limit = 250
      visibleStores.slice(0, limit).forEach((store) => {
        const marker = L.marker([store.lat, store.lng])
        marker.bindPopup(
          `<strong>${escapeHtml(store.name)}</strong><br/>~${store.orderCount} orders/mo<br/>AOV $${store.avgOrderValue}`,
        )
        marker.on('click', () => {
          const selection = buildSelection(store.lat, store.lng, mapDataRef.current, activeCategory)
          onAreaClick(selection)
        })
        marker.addTo(mapRef.current!)
        restaurantMarkersRef.current.push(marker)
      })
    },
    [onAreaClick],
  )

  useEffect(() => {
    fetchRestaurantsForViewRef.current = fetchRestaurantsForView
  }, [fetchRestaurantsForView])

  const createOrUpdateHeatLayer = useCallback(() => {
    if (!mapRef.current) return

    if (heatLayerRef.current) {
      mapRef.current.removeLayer(heatLayerRef.current)
      heatLayerRef.current = null
    }

    const activeCategory = categoryRef.current ?? 'all'
    let points: Array<[number, number, number]> = []
    let filterMessageLocal: string | null = null

    if (!mapData.isFallback && mapData.orders.length > 0) {
      points = computeHeatPoints(mapData.orders, activeCategory)
      if (points.length === 0) {
        filterMessageLocal = 'No recent orders match this filter — showing representative sample density.'
      }
    }

    if (points.length === 0) {
      points = generateHeatmapData(center, activeCategory)
    }

    heatLayerRef.current = (L as unknown as { heatLayer: (points: Array<[number, number, number]>, options: HeatLayerOptions) => L.Layer }).heatLayer(points, {
      radius: 25,
      blur: 15,
      maxZoom: 17,
      max: 1.0,
      gradient: {
        0.0: '#1d4ed8',
        0.25: '#3b82f6',
        0.5: '#f59e0b',
        0.75: '#ef4444',
        1.0: '#b91c1c',
      },
    })
    heatLayerRef.current.addTo(mapRef.current)

    setFilterMessage(filterMessageLocal)
  }, [center, mapData])

  useEffect(() => {
    const controller = new AbortController()
    const load = async () => {
      setDataMessage('Loading live demand…')
      try {
        const response = await fetch('http://localhost:8000/api/mongo-data', {
          cache: 'no-store',
          signal: controller.signal,
        })

        if (!response.ok) {
          throw new Error(`Request failed with status ${response.status}`)
        }

        const payload = await response.json()
        const orders = parseOrders(payload?.data ?? [])
        const stores = aggregateStores(orders)
        const isFallback = orders.length === 0

        const nextData: MapData = {
          orders,
          stores,
          isFallback,
        }

        mapDataRef.current = nextData
        setMapData(nextData)

        if (isFallback) {
          setDataMessage('No live orders returned — showing representative sample data.')
        } else {
          setDataMessage(null)
        }
      } catch (error) {
        if (controller.signal.aborted) return
        console.warn('Failed to load Knot data', error)
        const fallbackData: MapData = { orders: [], stores: [], isFallback: true }
        mapDataRef.current = fallbackData
        setMapData(fallbackData)
        setDataMessage('Live Knot data unavailable — showing representative sample data.')
      }
    }

    load()

    return () => {
      controller.abort()
    }
  }, [])

  useEffect(() => {
    if (mapRef.current) {
      mapRef.current.setView(center, 13)
    }
  }, [center])

  useEffect(() => {
    createOrUpdateHeatLayer()
  }, [createOrUpdateHeatLayer, mapData])

  useEffect(() => {
    fetchRestaurantsForView(true)
  }, [fetchRestaurantsForView, mapData])

  useEffect(() => {
    fetchRestaurantsForView(true)
    createOrUpdateHeatLayer()
  }, [category, fetchRestaurantsForView, createOrUpdateHeatLayer])

  const statusBanner = useMemo(() => filterMessage ?? dataMessage, [dataMessage, filterMessage])

  return (
    <div className="relative h-full w-full">
      <div id="map" className="h-full w-full" />
      {statusBanner && (
        <div className="pointer-events-none absolute bottom-4 left-4 z-[1000] max-w-xs rounded-2xl bg-white/90 px-4 py-2 text-xs font-medium text-slate-600 shadow-lg shadow-slate-900/10">
          {statusBanner}
        </div>
      )}
    </div>
  )
}

function buildSelection(
  lat: number,
  lng: number,
  data: MapData,
  activeCategory: string,
): AreaSelection {
  if (!data.isFallback && data.orders.length > 0) {
    const metrics = computeAreaMetrics(data.orders, data.stores, { lat, lng }, activeCategory)
    return {
      location: { lat, lng },
      category: activeCategory,
      metrics,
      isFallback: false,
      message: metrics.totalOrders === 0 ? 'No recorded orders in this radius yet.' : null,
    }
  }

  const mock = getAreaInsights(activeCategory, { lat, lng })
  const metrics = convertMockInsightsToMetrics(mock)

  return {
    location: { lat, lng },
    category: activeCategory,
    metrics,
    isFallback: true,
    message: 'Showing representative insights until live data is available.',
  }
}
