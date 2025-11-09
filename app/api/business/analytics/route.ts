export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { z } from 'zod'

import { getAuthUser } from '@/lib/auth/utils'
import { createClient } from '@/lib/supabase/server'
import type { Database } from '@/lib/supabase/types'

type TransactionRow = Database['public']['Tables']['transaction_cache']['Row']

interface NormalizedTransaction {
  id: string
  merchant: string
  amount: number
  currency: string
  createdAt: Date
  cuisine: string | null
  orderType: 'delivery' | 'pickup' | 'dine-in' | 'unknown'
  locationLabel: string | null
  location: {
    lat: number | null
    lng: number | null
  } | null
  rating: number | null
}

interface SummaryComparisons {
  orders: number | null
  revenue: number | null
  aov: number | null
}

interface AnalyticsSummary {
  totalOrders: number
  totalRevenue: number
  averageOrderValue: number
  activeRestaurants: number
  comparisons: SummaryComparisons
}

interface HeatmapPayload {
  matrix: number[][]
  maxValue: number
  peak:
    | {
        dayIndex: number
        hour: number
        value: number
      }
    | null
}

interface CuisineBreakdown {
  name: string
  orders: number
  revenue: number
  percentage: number
}

interface PriceBucket {
  label: string
  min: number
  max: number | null
  count: number
  percentage: number
}

interface RestaurantAggregate {
  name: string
  cuisine: string | null
  totalOrders: number
  totalRevenue: number
  averageOrderValue: number
  priceRange: string
  rating: number | null
  location: {
    lat: number | null
    lng: number | null
    label: string | null
  } | null
}

interface DemandTrendPoint {
  date: string
  orders: number
  revenue: number
}

interface OrderTypeBreakdown {
  type: string
  count: number
  percentage: number
}

interface AnalyticsPayload {
  summary: AnalyticsSummary
  heatmap: HeatmapPayload
  cuisines: CuisineBreakdown[]
  priceBuckets: PriceBucket[]
  restaurants: RestaurantAggregate[]
  demandTrend: DemandTrendPoint[]
  orderTypes: OrderTypeBreakdown[]
  insights: string[]
  meta: {
    availableLocations: string[]
    availableCuisines: string[]
    minDate: string | null
    maxDate: string | null
    totalTransactions: number
  }
}

const msInDay = 1000 * 60 * 60 * 24

const cuisineKeywordMap: Array<{ label: string; keywords: RegExp }> = [
  { label: 'Sushi', keywords: /sushi|ramen|izakaya|omakase/i },
  { label: 'Italian', keywords: /italian|pizza|pasta|trattoria|ristorante/i },
  { label: 'Mexican', keywords: /mexican|taqueria|taco|quesadilla|burrito/i },
  { label: 'Chinese', keywords: /chinese|szechuan|dim sum|dumpling|noodle/i },
  { label: 'Thai', keywords: /thai|pad thai|curry/i },
  { label: 'Indian', keywords: /indian|curry|masala|tandoor|biryani/i },
  { label: 'Japanese', keywords: /japanese|tonkatsu|yakitori|udon|donburi/i },
  { label: 'Mediterranean', keywords: /mediterranean|greek|falafel|mezze|shawarma|kebab/i },
  { label: 'American', keywords: /american|bbq|burger|steak|diner|smokehouse/i },
  { label: 'Vegan', keywords: /vegan|plant|vegetarian/i },
  { label: 'Seafood', keywords: /seafood|oyster|clam|lobster|shrimp/i },
  { label: 'Breakfast & Brunch', keywords: /brunch|breakfast|pancake|waffle|bagel/i },
  { label: 'Bakery', keywords: /bakery|bread|pastry|boulangerie|patisserie/i },
  { label: 'Cafe', keywords: /cafe|coffee|espresso|bistro/i },
  { label: 'Middle Eastern', keywords: /middle eastern|lebanese|turkish|persian|kebab/i },
  { label: 'Korean', keywords: /korean|kimchi|bibimbap|bbq/i },
  { label: 'Vietnamese', keywords: /vietnamese|pho|banh|vermicelli/i },
  { label: 'Caribbean', keywords: /caribbean|jerk|jamaican|cuban|puerto rican/i },
]

const priceBucketConfig = [
  { label: 'Under $15', min: 0, max: 15 },
  { label: '$15 - $30', min: 15, max: 30 },
  { label: '$30 - $50', min: 30, max: 50 },
  { label: '$50 - $75', min: 50, max: 75 },
  { label: '$75+', min: 75, max: null },
] as const

const querySchema = z.object({
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  cuisine: z.string().optional(),
  location: z.string().optional(),
  lat: z.coerce.number().optional(),
  lng: z.coerce.number().optional(),
  radiusKm: z.coerce.number().optional(),
})

function toNumber(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value
  }
  if (typeof value === 'string') {
    const parsed = Number.parseFloat(value.replace(/[^0-9.-]/g, ''))
    return Number.isFinite(parsed) ? parsed : null
  }
  return null
}

function toDate(value: unknown): Date | null {
  if (!value) return null
  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value
  }
  if (typeof value === 'number') {
    const date = new Date(value)
    return Number.isNaN(date.getTime()) ? null : date
  }
  if (typeof value === 'string') {
    const date = new Date(value)
    return Number.isNaN(date.getTime()) ? null : date
  }
  return null
}

function toStringValue(value: unknown): string | null {
  if (typeof value === 'string' && value.trim()) {
    return value.trim()
  }
  return null
}

function getNestedValue(data: unknown, path: string): unknown {
  if (!data || typeof data !== 'object') return undefined
  return path.split('.').reduce<unknown>((acc, key) => {
    if (!acc || typeof acc !== 'object') return undefined
    if (Array.isArray(acc)) {
      const index = Number(key)
      if (Number.isInteger(index)) {
        return acc[index]
      }
      return undefined
    }
    return (acc as Record<string, unknown>)[key]
  }, data)
}

function coalesceNumber(data: unknown, paths: string[]): number | null {
  for (const path of paths) {
    const value = path === '__root' ? data : getNestedValue(data, path)
    const parsed = toNumber(value)
    if (parsed !== null) return parsed
  }
  return null
}

function coalesceString(data: unknown, paths: string[]): string | null {
  for (const path of paths) {
    const value = path === '__root' ? data : getNestedValue(data, path)
    const parsed = toStringValue(value)
    if (parsed) return parsed
  }
  return null
}

function titleCase(value: string): string {
  return value
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => word[0].toUpperCase() + word.slice(1))
    .join(' ')
}

function inferCuisine(data: unknown, merchant: string): string | null {
  const cuisineValue = coalesceString(data, [
    'cuisine',
    'category',
    'restaurant.cuisine',
    'restaurant.category',
    'restaurant.categories.0',
    'categories.0',
    'metadata.cuisine',
    'tags.cuisine',
    'order.cuisine',
  ])

  if (cuisineValue) {
    return titleCase(cuisineValue)
  }

  const merchantName = merchant.toLowerCase()
  for (const matcher of cuisineKeywordMap) {
    if (matcher.keywords.test(merchantName)) {
      return matcher.label
    }
  }

  return null
}

function inferOrderType(data: unknown): 'delivery' | 'pickup' | 'dine-in' | 'unknown' {
  const value =
    coalesceString(data, [
      'order_type',
      'order.type',
      'order.fulfillment_type',
      'fulfillment.type',
      'delivery.method',
      'metadata.order_type',
      'metadata.fulfillment_type',
    ]) || ''

  const normalized = value.toLowerCase()
  if (normalized.includes('pickup') || normalized.includes('collection')) {
    return 'pickup'
  }
  if (normalized.includes('dine')) {
    return 'dine-in'
  }
  if (normalized.includes('delivery') || normalized.includes('courier')) {
    return 'delivery'
  }

  const hasDeliverySignals =
    coalesceNumber(data, ['delivery_fee', 'order.delivery_fee', 'fulfillment.delivery_fee']) !== null
  return hasDeliverySignals ? 'delivery' : 'unknown'
}

function inferLocation(data: unknown, fallbackMerchant: string) {
  const lat = coalesceNumber(data, [
    'location.lat',
    'location.latitude',
    'order.location.lat',
    'order.location.latitude',
    'store.location.lat',
    'store.location.latitude',
    'restaurant.location.lat',
    'restaurant.location.latitude',
    'dropoff.location.lat',
    'dropoff.location.latitude',
    'pickup.location.lat',
    'pickup.location.latitude',
  ])

  const lng = coalesceNumber(data, [
    'location.lng',
    'location.longitude',
    'order.location.lng',
    'order.location.longitude',
    'store.location.lng',
    'store.location.longitude',
    'restaurant.location.lng',
    'restaurant.location.longitude',
    'dropoff.location.lng',
    'dropoff.location.longitude',
    'pickup.location.lng',
    'pickup.location.longitude',
  ])

  const city = coalesceString(data, [
    'location.city',
    'order.location.city',
    'store.location.city',
    'restaurant.location.city',
    'dropoff.address.city',
    'pickup.address.city',
    'address.city',
    'order.address.city',
  ])
  const neighborhood = coalesceString(data, [
    'location.neighborhood',
    'store.location.neighborhood',
    'restaurant.location.neighborhood',
    'dropoff.address.neighborhood',
    'pickup.address.neighborhood',
  ])
  const postalCode = coalesceString(data, [
    'location.postal_code',
    'location.zip',
    'store.location.postal_code',
    'restaurant.location.postal_code',
    'address.postal_code',
    'order.address.postal_code',
    'dropoff.address.postal_code',
    'pickup.address.postal_code',
  ])
  const region = coalesceString(data, [
    'location.state',
    'location.region',
    'store.location.state',
    'restaurant.location.state',
    'address.state',
    'order.address.state',
    'dropoff.address.state',
    'pickup.address.state',
  ])

  const parts = [neighborhood, city, region, postalCode].filter(Boolean)
  const label = parts.length ? parts.join(', ') : fallbackMerchant || null

  return {
    lat: lat ?? null,
    lng: lng ?? null,
    label,
  }
}

function inferRating(data: unknown): number | null {
  const rating = coalesceNumber(data, [
    'restaurant.rating',
    'store.rating',
    'merchant.rating',
    'rating',
    'metadata.rating',
  ])
  if (rating === null) return null
  if (rating < 0) return null
  if (rating > 5) {
    return Number((rating / 20).toFixed(1)) // handle percentage scales
  }
  return Number(rating.toFixed(1))
}

function getPriceRange(aov: number): string {
  if (aov < 15) return '$'
  if (aov < 30) return '$$'
  if (aov < 50) return '$$$'
  if (aov < 75) return '$$$$'
  return '$$$$$'
}

function isWithinRadius(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
  radiusKm: number,
) {
  const toRad = (value: number) => (value * Math.PI) / 180
  const R = 6371 // Earth radius in km
  const dLat = toRad(lat2 - lat1)
  const dLon = toRad(lng2 - lng1)
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  const distance = R * c
  return distance <= radiusKm
}

function normalizeTransaction(row: TransactionRow): NormalizedTransaction | null {
  const data = row.transaction_data
  if (!data) return null

  const amount =
    coalesceNumber(data, [
      'order.total',
      'order.summary.total',
      'summary.total',
      'total',
      'total_amount',
      'charges.total',
      'payment.total',
      'amount',
      'pricing.total',
      '__root',
    ]) ?? 0

  if (amount <= 0) return null

  const currency =
    coalesceString(data, ['order.currency', 'currency', 'summary.currency', 'pricing.currency']) || 'USD'

  const timestamp =
    coalesceString(data, [
      'order.updated_at',
      'order.completed_at',
      'order.placed_at',
      'order.created_at',
      'order.timestamp',
      'timestamp',
      'created_at',
      'updated_at',
      'completed_at',
    ]) || row.created_at

  const createdAt = toDate(timestamp) ?? toDate(row.created_at) ?? new Date()

  const merchantName =
    coalesceString(data, [
      'merchant.name',
      'restaurant.name',
      'store.name',
      'order.merchant_name',
      'brand.name',
    ]) || row.merchant || 'Unknown Merchant'

  const cuisine = inferCuisine(data, merchantName)
  const orderType = inferOrderType(data)
  const location = inferLocation(data, merchantName)
  const rating = inferRating(data)

  return {
    id: row.id,
    merchant: titleCase(merchantName),
    amount: Number(amount.toFixed(2)),
    currency,
    createdAt,
    cuisine,
    orderType,
    locationLabel: location.label,
    location: {
      lat: location.lat,
      lng: location.lng,
    },
    rating,
  }
}

function percentageChange(current: number, previous: number): number | null {
  if (!previous || !Number.isFinite(previous)) return null
  if (!Number.isFinite(current)) return null
  return Number((((current - previous) / previous) * 100).toFixed(2))
}

function computeHeatmap(transactions: NormalizedTransaction[]): HeatmapPayload {
  const matrix = Array.from({ length: 7 }, () => Array.from({ length: 24 }, () => 0))
  let maxValue = 0
  let peak: HeatmapPayload['peak'] = null

  for (const tx of transactions) {
    const day = tx.createdAt.getDay()
    const hour = tx.createdAt.getHours()
    matrix[day][hour] += 1
    if (matrix[day][hour] > maxValue) {
      maxValue = matrix[day][hour]
      peak = { dayIndex: day, hour, value: matrix[day][hour] }
    }
  }

  return { matrix, maxValue, peak }
}

function computeCuisines(transactions: NormalizedTransaction[]): CuisineBreakdown[] {
  const counts = new Map<string, { orders: number; revenue: number }>()
  for (const tx of transactions) {
    const key = tx.cuisine ?? 'Unclassified'
    const existing = counts.get(key) ?? { orders: 0, revenue: 0 }
    existing.orders += 1
    existing.revenue += tx.amount
    counts.set(key, existing)
  }

  const totalOrders = transactions.length || 1
  const cuisines = Array.from(counts.entries()).map(([name, value]) => ({
    name,
    orders: value.orders,
    revenue: Number(value.revenue.toFixed(2)),
    percentage: Number(((value.orders / totalOrders) * 100).toFixed(2)),
  }))

  cuisines.sort((a, b) => b.orders - a.orders)
  return cuisines
}

function computePriceBuckets(transactions: NormalizedTransaction[]): PriceBucket[] {
  const totalOrders = transactions.length || 1
  const buckets = priceBucketConfig.map((config) => ({
    label: config.label,
    min: config.min,
    max: config.max,
    count: 0,
    percentage: 0,
  }))

  for (const tx of transactions) {
    const amount = tx.amount
    const bucket = buckets.find((b) => amount >= b.min && (b.max === null || amount < b.max))
    if (bucket) {
      bucket.count += 1
    }
  }

  return buckets.map((bucket) => ({
    ...bucket,
    percentage: Number(((bucket.count / totalOrders) * 100).toFixed(2)),
  }))
}

function computeRestaurantAggregates(transactions: NormalizedTransaction[]): RestaurantAggregate[] {
  const aggregates = new Map<
    string,
    {
      name: string
      cuisineCounts: Map<string, number>
      totalOrders: number
      totalRevenue: number
      latSum: number
      lngSum: number
      latCount: number
      lngCount: number
      ratingSum: number
      ratingCount: number
      locationLabel: string | null
    }
  >()

  for (const tx of transactions) {
    const key = tx.merchant
    if (!aggregates.has(key)) {
      aggregates.set(key, {
        name: key,
        cuisineCounts: new Map(),
        totalOrders: 0,
        totalRevenue: 0,
        latSum: 0,
        lngSum: 0,
        latCount: 0,
        lngCount: 0,
        ratingSum: 0,
        ratingCount: 0,
        locationLabel: tx.locationLabel,
      })
    }
    const agg = aggregates.get(key)!
    agg.totalOrders += 1
    agg.totalRevenue += tx.amount
    const cuisineKey = tx.cuisine ?? 'Unclassified'
    agg.cuisineCounts.set(cuisineKey, (agg.cuisineCounts.get(cuisineKey) ?? 0) + 1)

    if (tx.location?.lat != null) {
      agg.latSum += tx.location.lat
      agg.latCount += 1
    }
    if (tx.location?.lng != null) {
      agg.lngSum += tx.location.lng
      agg.lngCount += 1
    }
    if (tx.rating != null) {
      agg.ratingSum += tx.rating
      agg.ratingCount += 1
    }
    if (!agg.locationLabel && tx.locationLabel) {
      agg.locationLabel = tx.locationLabel
    }
  }

  const restaurants: RestaurantAggregate[] = []
  for (const agg of aggregates.values()) {
    const cuisines = Array.from(agg.cuisineCounts.entries()).sort((a, b) => b[1] - a[1])
    const topCuisine = cuisines[0]?.[0] ?? null
    const averageOrderValue = agg.totalRevenue / agg.totalOrders
    restaurants.push({
      name: agg.name,
      cuisine: topCuisine,
      totalOrders: agg.totalOrders,
      totalRevenue: Number(agg.totalRevenue.toFixed(2)),
      averageOrderValue: Number(averageOrderValue.toFixed(2)),
      priceRange: getPriceRange(averageOrderValue),
      rating: agg.ratingCount ? Number((agg.ratingSum / agg.ratingCount).toFixed(1)) : null,
      location: agg.latCount || agg.lngCount
        ? {
            lat: agg.latCount ? Number((agg.latSum / agg.latCount).toFixed(5)) : null,
            lng: agg.lngCount ? Number((agg.lngSum / agg.lngCount).toFixed(5)) : null,
            label: agg.locationLabel,
          }
        : agg.locationLabel
          ? { lat: null, lng: null, label: agg.locationLabel }
          : null,
    })
  }

  restaurants.sort((a, b) => b.totalRevenue - a.totalRevenue)
  return restaurants
}

function computeDemandTrend(
  transactions: NormalizedTransaction[],
  startDate: Date,
  endDate: Date,
): DemandTrendPoint[] {
  const totals = new Map<string, { orders: number; revenue: number }>()

  for (const tx of transactions) {
    const key = tx.createdAt.toISOString().slice(0, 10)
    const current = totals.get(key) ?? { orders: 0, revenue: 0 }
    current.orders += 1
    current.revenue += tx.amount
    totals.set(key, current)
  }

  const demand: DemandTrendPoint[] = []
  const current = new Date(Date.UTC(startDate.getUTCFullYear(), startDate.getUTCMonth(), startDate.getUTCDate()))
  const end = new Date(Date.UTC(endDate.getUTCFullYear(), endDate.getUTCMonth(), endDate.getUTCDate()))

  while (current <= end) {
    const key = current.toISOString().slice(0, 10)
    const entry = totals.get(key) ?? { orders: 0, revenue: 0 }
    demand.push({
      date: key,
      orders: entry.orders,
      revenue: Number(entry.revenue.toFixed(2)),
    })
    current.setUTCDate(current.getUTCDate() + 1)
  }

  return demand
}

function computeOrderTypes(transactions: NormalizedTransaction[]): OrderTypeBreakdown[] {
  const counts = new Map<string, number>()
  for (const tx of transactions) {
    const key = tx.orderType
    counts.set(key, (counts.get(key) ?? 0) + 1)
  }

  const totalOrders = transactions.length || 1
  const breakdown = Array.from(counts.entries()).map(([type, count]) => ({
    type,
    count,
    percentage: Number(((count / totalOrders) * 100).toFixed(2)),
  }))

  breakdown.sort((a, b) => b.count - a.count)
  return breakdown
}

function computeInsights(
  summary: AnalyticsSummary,
  cuisines: CuisineBreakdown[],
  priceBuckets: PriceBucket[],
  heatmap: HeatmapPayload,
  orderTypes: OrderTypeBreakdown[],
): string[] {
  if (summary.totalOrders === 0) {
    return ['No transactions found for the selected filters. Try expanding your date range or removing filters.']
  }

  const insights: string[] = []

  if (cuisines.length) {
    const topCuisine = cuisines[0]
    insights.push(`${topCuisine.name} leads demand with ${topCuisine.percentage.toFixed(1)}% of orders.`)
    if (cuisines.length > 1) {
      const bottomCuisine = cuisines[cuisines.length - 1]
      insights.push(
        `${bottomCuisine.name} is underrepresented at ${bottomCuisine.percentage.toFixed(1)}% — opportunity to differentiate.`,
      )
    }
  }

  if (priceBuckets.length) {
    const prominentBucket = [...priceBuckets].sort((a, b) => b.count - a.count)[0]
    insights.push(
      `${
        prominentBucket.label
      } tickets account for ${prominentBucket.percentage.toFixed(1)}% of orders — align offerings to capture this segment.`,
    )
  }

  if (heatmap.peak && heatmap.peak.value > 0) {
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    insights.push(
      `Peak order window: ${dayNames[heatmap.peak.dayIndex]} at ${heatmap.peak.hour}:00 (${heatmap.peak.value} orders).`,
    )
  }

  if (orderTypes.length) {
    const topType = orderTypes[0]
    insights.push(`${titleCase(topType.type)} orders represent ${topType.percentage.toFixed(1)}% of demand.`)
  }

  return insights.slice(0, 5)
}

function matchesFilters(
  tx: NormalizedTransaction,
  filters: {
    location?: string | null
    cuisine?: string | null
    center?: { lat: number; lng: number }
    radiusKm?: number
  },
): boolean {
  if (filters.location && filters.location.toLowerCase() !== 'all') {
    if (!tx.locationLabel || tx.locationLabel.toLowerCase() !== filters.location.toLowerCase()) {
      return false
    }
  }
  if (filters.cuisine && filters.cuisine.toLowerCase() !== 'all') {
    if (!tx.cuisine || tx.cuisine.toLowerCase() !== filters.cuisine.toLowerCase()) {
      return false
    }
  }
  if (
    filters.center &&
    typeof filters.radiusKm === 'number' &&
    tx.location?.lat != null &&
    tx.location?.lng != null &&
    filters.radiusKm > 0
  ) {
    if (!isWithinRadius(tx.location.lat, tx.location.lng, filters.center.lat, filters.center.lng, filters.radiusKm)) {
      return false
    }
  }
  return true
}

export async function GET(request: Request) {
  try {
    const user = await getAuthUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = await createClient()

    const { data: dbUser } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .eq('role', 'business')
      .single()

    if (!dbUser) {
      return NextResponse.json({ error: 'Business profile not found' }, { status: 404 })
    }

    const { searchParams } = new URL(request.url)
    const parsedParams = querySchema.safeParse(Object.fromEntries(searchParams.entries()))

    if (!parsedParams.success) {
      return NextResponse.json({ error: 'Invalid query parameters' }, { status: 400 })
    }

    const { startDate, endDate, cuisine, location, lat, lng, radiusKm } = parsedParams.data

    const now = new Date()
    const defaultEnd = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 23, 59, 59))
    const defaultStart = new Date(defaultEnd.getTime() - 29 * msInDay)

    const parsedStart = startDate ? toDate(startDate) : defaultStart
    const parsedEnd = endDate ? toDate(endDate) : defaultEnd

    const currentStart = parsedStart ?? defaultStart
    const currentEnd = parsedEnd ?? defaultEnd

    if (currentStart > currentEnd) {
      return NextResponse.json({ error: 'startDate must be before endDate' }, { status: 400 })
    }

    const periodLengthDays = Math.max(1, Math.round((currentEnd.getTime() - currentStart.getTime()) / msInDay) + 1)
    const previousEnd = new Date(currentStart.getTime() - msInDay)
    const previousStart = new Date(previousEnd.getTime() - (periodLengthDays - 1) * msInDay)

    const queryStart = previousStart
    const queryEnd = currentEnd

    const { data: transactions, error } = await supabase
      .from('transaction_cache')
      .select('*')
      .gte('created_at', queryStart.toISOString())
      .lte('created_at', queryEnd.toISOString())

    if (error) {
      console.error('Supabase error fetching transactions:', error)
      return NextResponse.json({ error: 'Failed to load analytics data' }, { status: 500 })
    }

    const normalized = (transactions ?? [])
      .map(normalizeTransaction)
      .filter((tx): tx is NormalizedTransaction => tx !== null)

    if (!normalized.length) {
      const emptyPayload: AnalyticsPayload = {
        summary: {
          totalOrders: 0,
          totalRevenue: 0,
          averageOrderValue: 0,
          activeRestaurants: 0,
          comparisons: { orders: null, revenue: null, aov: null },
        },
        heatmap: { matrix: Array.from({ length: 7 }, () => Array.from({ length: 24 }, () => 0)), maxValue: 0, peak: null },
        cuisines: [],
        priceBuckets: priceBucketConfig.map((bucket) => ({ ...bucket, count: 0, percentage: 0 })),
        restaurants: [],
        demandTrend: computeDemandTrend([], currentStart, currentEnd),
        orderTypes: [],
        insights: ['No transactions found.'],
        meta: {
          availableLocations: [],
          availableCuisines: [],
          minDate: null,
          maxDate: null,
          totalTransactions: 0,
        },
      }

      return NextResponse.json({ analytics: emptyPayload })
    }

    const allLocations = new Set<string>()
    const allCuisines = new Set<string>()
    let minDate: string | null = null
    let maxDate: string | null = null

    for (const tx of normalized) {
      if (tx.locationLabel) {
        allLocations.add(tx.locationLabel)
      }
      if (tx.cuisine) {
        allCuisines.add(tx.cuisine)
      }
      const isoDate = tx.createdAt.toISOString()
      if (!minDate || isoDate < minDate) minDate = isoDate
      if (!maxDate || isoDate > maxDate) maxDate = isoDate
    }

    const filterConfig = {
      location: location ?? null,
      cuisine: cuisine ?? null,
      center: lat != null && lng != null ? { lat, lng } : undefined,
      radiusKm,
    }

    const filteredCurrent = normalized.filter(
      (tx) =>
        tx.createdAt >= currentStart &&
        tx.createdAt <= currentEnd &&
        matchesFilters(tx, filterConfig),
    )
    const filteredPrevious = normalized.filter(
      (tx) =>
        tx.createdAt >= previousStart &&
        tx.createdAt <= previousEnd &&
        matchesFilters(tx, filterConfig),
    )

    const totalOrders = filteredCurrent.length
    const totalRevenue = filteredCurrent.reduce((sum, tx) => sum + tx.amount, 0)
    const averageOrderValue = totalOrders ? totalRevenue / totalOrders : 0

    const previousOrders = filteredPrevious.length
    const previousRevenue = filteredPrevious.reduce((sum, tx) => sum + tx.amount, 0)
    const previousAov = previousOrders ? previousRevenue / previousOrders : 0

    const restaurants = computeRestaurantAggregates(filteredCurrent)
    const heatmap = computeHeatmap(filteredCurrent)
    const cuisinesBreakdown = computeCuisines(filteredCurrent)
    const priceBuckets = computePriceBuckets(filteredCurrent)
    const demandTrend = computeDemandTrend(filteredCurrent, currentStart, currentEnd)
    const orderTypes = computeOrderTypes(filteredCurrent)

    const summary: AnalyticsSummary = {
      totalOrders,
      totalRevenue: Number(totalRevenue.toFixed(2)),
      averageOrderValue: Number(averageOrderValue.toFixed(2)),
      activeRestaurants: restaurants.length,
      comparisons: {
        orders: percentageChange(totalOrders, previousOrders),
        revenue: percentageChange(totalRevenue, previousRevenue),
        aov: percentageChange(averageOrderValue, previousAov),
      },
    }

    const insights = computeInsights(summary, cuisinesBreakdown, priceBuckets, heatmap, orderTypes)

    const payload: AnalyticsPayload = {
      summary,
      heatmap,
      cuisines: cuisinesBreakdown,
      priceBuckets,
      restaurants,
      demandTrend,
      orderTypes,
      insights,
      meta: {
        availableLocations: Array.from(allLocations).sort((a, b) => a.localeCompare(b)),
        availableCuisines: Array.from(allCuisines).sort((a, b) => a.localeCompare(b)),
        minDate,
        maxDate,
        totalTransactions: normalized.length,
      },
    }

    return NextResponse.json({ analytics: payload })
  } catch (error) {
    console.error('Error fetching analytics:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

