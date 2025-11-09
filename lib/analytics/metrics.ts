import { type Database } from '@/lib/supabase/types'
import {
  DAY_LABELS,
  ParsedOrder,
  StoreSummary,
  aggregateStores,
  clamp,
  computeHeatmapMatrix,
  normalizeText,
  parseOrders,
  serializeTransactionData,
} from './orders'

type TransactionRow = Database['public']['Tables']['transaction_cache']['Row']

export interface SummaryCard {
  label: string
  value: number
  change: number | null
}

export interface CuisineStat {
  name: string
  orderCount: number
  revenue: number
  percentage: number
}

export interface PriceBucketStat {
  label: string
  count: number
  percentage: number
}

export interface CompetitionRow {
  name: string
  cuisine: string
  orders: number
  revenue: number
  priceRange: string
  rating: number
  avgOrderValue: number
}

export interface RestaurantPin {
  name: string
  cuisine: string
  volume: number
  lat: number
  lng: number
}

export interface DemandPoint {
  day: string
  volume: number
}

export interface OrderTypeStat {
  type: 'Delivery' | 'Pickup'
  count: number
  percentage: number
}

export interface AnalyticsPayload {
  usingFallback: boolean
  summary: {
    totalOrders30d: number
    totalRevenue30d: number
    averageOrderValue30d: number
    activeRestaurants30d: number
    orderChangePct: number | null
    revenueChangePct: number | null
    aovChangePct: number | null
  }
  heatmap: number[][]
  cuisines: CuisineStat[]
  priceBuckets: PriceBucketStat[]
  restaurantPins: RestaurantPin[]
  competition: CompetitionRow[]
  demandTrend: DemandPoint[]
  orderType: OrderTypeStat[]
  insights: string[]
  generatedAt: string
}

const PRICE_BUCKETS: Array<{ label: string; min: number; max: number | null }> = [
  { label: 'Under $15', min: 0, max: 15 },
  { label: '$15-30', min: 15, max: 30 },
  { label: '$30-50', min: 30, max: 50 },
  { label: '$50-75', min: 50, max: 75 },
  { label: '$75+', min: 75, max: null },
]

function percentChange(current: number, previous: number): number | null {
  if (!Number.isFinite(previous) || previous === 0) {
    return null
  }
  return ((current - previous) / previous) * 100
}

function toTitleCase(value: string): string {
  if (!value) return 'Unknown'
  return value.replace(/\b\w/g, (char) => char.toUpperCase())
}

function priceRangeFromAov(avgOrderValue: number): string {
  if (avgOrderValue <= 15) return '$'
  if (avgOrderValue <= 30) return '$$'
  if (avgOrderValue <= 50) return '$$$'
  return '$$$$'
}

function computeRating(store: StoreSummary): number {
  const base = 4
  const orderFactor = clamp(store.orderCount / 150, 0, 0.8)
  const valueFactor = clamp(store.avgOrderValue / 80, 0, 0.6)
  const rating = base + orderFactor + valueFactor
  return Number(clamp(rating, 3.6, 4.9).toFixed(1))
}

function aggregateOrders(rows: TransactionRow[]): ParsedOrder[] {
  const rawOrders = serializeTransactionData(rows)
  return parseOrders(rawOrders)
}

function filterByDate(orders: ParsedOrder[], from: Date, to: Date): ParsedOrder[] {
  return orders.filter((order) => order.completedAt >= from && order.completedAt < to)
}

function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate())
}

function computeDemandTrend(recent: ParsedOrder[], days: number): DemandPoint[] {
  const today = startOfDay(new Date())
  const dailyCounts = new Map<string, number>()

  recent.forEach((order) => {
    const dayKey = startOfDay(order.completedAt).toISOString().slice(0, 10)
    dailyCounts.set(dayKey, (dailyCounts.get(dayKey) ?? 0) + 1)
  })

  const points: DemandPoint[] = []
  for (let i = days - 1; i >= 0; i -= 1) {
    const day = new Date(today)
    day.setDate(today.getDate() - i)
    const key = day.toISOString().slice(0, 10)
    points.push({
      day: `Day ${days - i}`,
      volume: dailyCounts.get(key) ?? 0,
    })
  }

  return points
}

function computeCuisineStats(orders: ParsedOrder[]): CuisineStat[] {
  const totals = new Map<string, { count: number; revenue: number }>()
  orders.forEach((order) => {
    const key = order.category || 'unknown'
    const entry = totals.get(key) ?? { count: 0, revenue: 0 }
    entry.count += 1
    entry.revenue += order.total
    totals.set(key, entry)
  })

  const totalOrders = orders.length || 1
  return Array.from(totals.entries())
    .filter(([category]) => category !== 'unknown')
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, 10)
    .map(([category, stats]) => ({
      name: toTitleCase(category),
      orderCount: stats.count,
      revenue: Number(stats.revenue.toFixed(2)),
      percentage: Number(((stats.count / totalOrders) * 100).toFixed(1)),
    }))
}

function computePriceBuckets(orders: ParsedOrder[]): PriceBucketStat[] {
  const counts = PRICE_BUCKETS.map((bucket) => ({
    label: bucket.label,
    count: 0,
  }))

  orders.forEach((order) => {
    const price = order.total
    const bucketIndex = PRICE_BUCKETS.findIndex((bucket) => {
      if (bucket.max === null) {
        return price >= bucket.min
      }
      if (price === bucket.min && bucket.min !== 0) {
        return true
      }
      return price >= bucket.min && price < bucket.max
    })
    const target = counts[bucketIndex >= 0 ? bucketIndex : counts.length - 1]
    target.count += 1
  })

  const total = orders.length || 1
  return counts.map((bucket) => ({
    label: bucket.label,
    count: bucket.count,
    percentage: Number(((bucket.count / total) * 100).toFixed(1)),
  }))
}

function computeRestaurantPins(stores: StoreSummary[]): RestaurantPin[] {
  return stores
    .filter((store) => Number.isFinite(store.lat) && Number.isFinite(store.lng))
    .sort((a, b) => b.orderCount - a.orderCount)
    .slice(0, 50)
    .map((store) => ({
      name: store.name,
      cuisine: toTitleCase(store.category),
      volume: store.orderCount,
      lat: Number(store.lat.toFixed(6)),
      lng: Number(store.lng.toFixed(6)),
    }))
}

function computeCompetition(stores: StoreSummary[]): CompetitionRow[] {
  return stores
    .filter((store) => store.orderCount > 0)
    .sort((a, b) => b.orderCount - a.orderCount)
    .slice(0, 20)
    .map((store) => {
      const rating = computeRating(store)
      return {
        name: store.name,
        cuisine: toTitleCase(store.category),
        orders: store.orderCount,
        revenue: Number(store.totalRevenue.toFixed(2)),
        avgOrderValue: Number(store.avgOrderValue.toFixed(2)),
        priceRange: priceRangeFromAov(store.avgOrderValue),
        rating,
      }
    })
}

function computeOrderType(orders: ParsedOrder[]): OrderTypeStat[] {
  let delivery = 0
  let pickup = 0

  orders.forEach((order) => {
    if (order.fulfillmentType === 'pickup') {
      pickup += 1
    } else {
      delivery += 1
    }
  })

  const total = delivery + pickup || 1
  return [
    {
      type: 'Delivery',
      count: delivery,
      percentage: Number(((delivery / total) * 100).toFixed(1)),
    },
    {
      type: 'Pickup',
      count: pickup,
      percentage: Number(((pickup / total) * 100).toFixed(1)),
    },
  ]
}

function computeInsights(
  cuisines: CuisineStat[],
  priceBuckets: PriceBucketStat[],
  heatmap: number[][],
  orderType: OrderTypeStat[],
  stores: StoreSummary[],
): string[] {
  const insights: string[] = []

  const topCuisine = cuisines[0]
  if (topCuisine) {
    insights.push(
      `Opportunity: ${topCuisine.name} commands ${topCuisine.percentage}% of recent orders — consider differentiated offerings.`,
    )
  }

  let peakDay = 0
  let peakHour = 0
  let peakValue = 0
  heatmap.forEach((row, dayIndex) => {
    row.forEach((value, hourIndex) => {
      if (value > peakValue) {
        peakValue = value
        peakDay = dayIndex
        peakHour = hourIndex
      }
    })
  })
  if (peakValue > 0) {
    const nextHour = peakHour === 23 ? '24' : `${peakHour + 1}`
    insights.push(`Peak demand window: ${DAY_LABELS[peakDay]} ${peakHour}:00-${nextHour}:00 with ${peakValue} orders recorded.`)
  }

  const topBucket = priceBuckets.reduce((best, bucket) => (bucket.count > best.count ? bucket : best), priceBuckets[0])
  if (topBucket) {
    insights.push(`Sweet spot AOV: ${topBucket.label} accounts for ${topBucket.percentage}% of check sizes.`)
  }

  const deliveryStat = orderType.find((entry) => entry.type === 'Delivery')
  if (deliveryStat) {
    insights.push(`Fulfillment mix: ${deliveryStat.percentage}% delivery vs ${100 - deliveryStat.percentage}% pickup.`)
  }

  const restaurantCount = stores.length
  insights.push(
    restaurantCount > 0
      ? `Competitive density: ${restaurantCount} active restaurants in the data set.`
      : 'Competitive density: No peer restaurants recorded in this data window — first mover advantage.',
  )

  return insights.slice(0, 5)
}

export function computeAnalytics(transactions: TransactionRow[]): AnalyticsPayload {
  const orders = aggregateOrders(transactions)

  const now = new Date()
  const endCurrent = now
  const startCurrent = new Date(endCurrent)
  startCurrent.setDate(endCurrent.getDate() - 30)

  const startPrevious = new Date(startCurrent)
  startPrevious.setDate(startPrevious.getDate() - 30)

  const recentOrders = filterByDate(orders, startCurrent, endCurrent)
  const previousOrders = filterByDate(orders, startPrevious, startCurrent)

  const totalOrders = recentOrders.length
  const totalRevenue = recentOrders.reduce((sum, order) => sum + order.total, 0)
  const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0

  const previousRevenue = previousOrders.reduce((sum, order) => sum + order.total, 0)
  const previousAov = previousOrders.length > 0 ? previousRevenue / previousOrders.length : 0

  const stores = aggregateStores(recentOrders)

  const summary = {
    totalOrders30d: totalOrders,
    totalRevenue30d: Number(totalRevenue.toFixed(2)),
    averageOrderValue30d: Number(averageOrderValue.toFixed(2)),
    activeRestaurants30d: new Set(recentOrders.map((order) => normalizeText(order.storeName))).size,
    orderChangePct: percentChange(totalOrders, previousOrders.length),
    revenueChangePct: percentChange(totalRevenue, previousRevenue),
    aovChangePct: percentChange(averageOrderValue, previousAov),
  }

  const heatmap = computeHeatmapMatrix(recentOrders)
  const cuisines = computeCuisineStats(recentOrders)
  const priceBuckets = computePriceBuckets(recentOrders)
  const restaurantPins = computeRestaurantPins(stores)
  const competition = computeCompetition(stores)
  const demandTrend = computeDemandTrend(recentOrders, 30)
  const orderType = computeOrderType(recentOrders)
  const insights = computeInsights(cuisines, priceBuckets, heatmap, orderType, stores)

  const usingFallback =
    recentOrders.length === 0 ||
    cuisines.length === 0 ||
    restaurantPins.length === 0

  return {
    usingFallback,
    summary,
    heatmap,
    cuisines,
    priceBuckets,
    restaurantPins,
    competition,
    demandTrend,
    orderType,
    insights,
    generatedAt: new Date().toISOString(),
  }
}


