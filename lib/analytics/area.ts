import {
  DAY_LABELS,
  ParsedOrder,
  StoreSummary,
  clamp,
  haversineDistanceMeters,
  normalizeText,
} from '@/lib/analytics/orders'
import { getAreaInsights } from '@/utils/mockData'

export interface AreaMetrics {
  totalOrders: number
  totalRevenue: number
  avgOrderValue: number
  storeCount: number
  sampleSize: number
  radiusMeters: number
  timeSpanDays: number
  monthlySpending: number
  yearlySpending: number
  dailySpending: Array<{ day: string; amount: number }>
  popularItems: Array<{ name: string; orders: number; price: number; growth: number }>
  opportunityScore: number
  opportunityMessage: string
}

export interface AreaSelection {
  location: { lat: number; lng: number }
  category: string
  metrics: AreaMetrics
  isFallback: boolean
  message?: string | null
}

export const AREA_RADIUS_METERS = 1600

export function computeAreaMetrics(
  orders: ParsedOrder[],
  stores: StoreSummary[],
  point: { lat: number; lng: number },
  category: string,
): AreaMetrics {
  const filteredOrders = orders.filter((order) => {
    if (category !== 'all' && order.category !== category) return false
    const distance = haversineDistanceMeters({ lat: order.shippingLat, lng: order.shippingLng }, point)
    return distance <= AREA_RADIUS_METERS
  })

  const nearbyStores = stores.filter((store) => {
    if (category !== 'all' && store.category !== category) return false
    const distance = haversineDistanceMeters({ lat: store.lat, lng: store.lng }, point)
    return distance <= AREA_RADIUS_METERS
  })

  const totalOrders = filteredOrders.length
  const totalRevenueRaw = filteredOrders.reduce((sum, order) => sum + order.total, 0)
  const totalRevenue = Number(totalRevenueRaw.toFixed(2))
  const avgOrderValue = totalOrders > 0 ? Number((totalRevenueRaw / totalOrders).toFixed(2)) : 0

  const dailyTotals = new Array(7).fill(0) as number[]
  const dayKeys = new Set<string>()

  filteredOrders.forEach((order) => {
    const dayIndex = order.completedAt.getDay()
    dailyTotals[dayIndex] += order.total
    dayKeys.add(order.completedAt.toISOString().slice(0, 10))
  })

  const dailySpending = DAY_LABELS.map((day, index) => ({
    day,
    amount: Math.round(dailyTotals[index]),
  }))

  const productsMap = new Map<
    string,
    { name: string; quantity: number; revenue: number }
  >()

  filteredOrders.forEach((order) => {
    order.products.forEach((product) => {
      const key = normalizeText(product.name)
      if (!key) return
      const existing = productsMap.get(key)
      if (existing) {
        existing.quantity += product.quantity
        existing.revenue += product.total
      } else {
        productsMap.set(key, {
          name: product.name || 'Menu Item',
          quantity: product.quantity,
          revenue: product.total,
        })
      }
    })
  })

  const totalQuantity = Array.from(productsMap.values()).reduce((sum, item) => sum + item.quantity, 0)

  const popularItems = Array.from(productsMap.values())
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 5)
    .map((item) => ({
      name: item.name,
      orders: item.quantity,
      price: item.quantity > 0 ? Number((item.revenue / item.quantity).toFixed(2)) : avgOrderValue,
      growth: totalQuantity > 0 ? Math.max(4, Math.round((item.quantity / totalQuantity) * 100)) : 0,
    }))

  const timeSpanDays = Math.max(1, dayKeys.size)
  const avgDailyRevenue = timeSpanDays > 0 ? totalRevenueRaw / timeSpanDays : 0
  const monthlySpending = Math.round(avgDailyRevenue * 30)
  const yearlySpending = Math.round(avgDailyRevenue * 365)

  const demandScore = Math.min(35, totalOrders * 1.4)
  const revenueScore = Math.min(25, totalRevenueRaw / 150)
  const supplyPenalty = Math.min(20, nearbyStores.length * 3.2)
  const coverageBonus = totalOrders === 0 ? 12 : Math.min(12, Math.max(0, 10 - nearbyStores.length * 2))
  const opportunityScore = clamp(
    Math.round(48 + demandScore + revenueScore + coverageBonus - supplyPenalty),
    20,
    95,
  )

  let opportunityMessage = ''
  if (totalOrders === 0) {
    opportunityMessage = 'No recorded orders within this radius yet — wide-open opportunity.'
  } else if (opportunityScore >= 80) {
    opportunityMessage = 'High demand with limited supply — move fast to capture the market.'
  } else if (opportunityScore >= 65) {
    opportunityMessage = 'Strong demand with manageable competition — differentiate on menu or experience.'
  } else {
    opportunityMessage = `Dense competition (${nearbyStores.length} operators nearby). Target a niche or premium positioning.`
  }

  return {
    totalOrders,
    totalRevenue,
    avgOrderValue,
    storeCount: nearbyStores.length,
    sampleSize: filteredOrders.length,
    radiusMeters: AREA_RADIUS_METERS,
    timeSpanDays,
    monthlySpending,
    yearlySpending,
    dailySpending,
    popularItems,
    opportunityScore,
    opportunityMessage,
  }
}

export function convertMockInsightsToMetrics(mock: ReturnType<typeof getAreaInsights>): AreaMetrics {
  const totalRevenue = Number((mock.avgOrderValue * mock.totalOrders).toFixed(2))
  return {
    totalOrders: mock.totalOrders,
    totalRevenue,
    avgOrderValue: Number(mock.avgOrderValue),
    storeCount: Math.max(0, Math.round(mock.totalOrders / 1000)),
    sampleSize: mock.totalOrders,
    radiusMeters: AREA_RADIUS_METERS,
    timeSpanDays: 30,
    monthlySpending: mock.monthlySpending,
    yearlySpending: mock.yearlySpending,
    dailySpending: mock.dailySpending,
    popularItems: mock.popularItems,
    opportunityScore: mock.opportunityScore,
    opportunityMessage: mock.opportunityMessage,
  }
}

export function buildAreaSelectionFromData(
  lat: number,
  lng: number,
  orders: ParsedOrder[],
  stores: StoreSummary[],
  category: string,
): AreaSelection {
  if (orders.length > 0) {
    const metrics = computeAreaMetrics(orders, stores, { lat, lng }, category)
    return {
      location: { lat, lng },
      category,
      metrics,
      isFallback: false,
      message: metrics.totalOrders === 0 ? 'No recorded orders in this radius yet.' : null,
    }
  }

  const mock = getAreaInsights(category, { lat, lng })
  const metrics = convertMockInsightsToMetrics(mock)

  return {
    location: { lat, lng },
    category,
    metrics,
    isFallback: true,
    message: 'Showing representative insights until live data is available.',
  }
}

