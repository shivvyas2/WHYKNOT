import { Json } from '@/lib/supabase/types'

export interface ApiOrderProduct {
  name?: string
  quantity?: number
  unitPrice?: number
  total?: number
}

export interface ApiOrder {
  _id?: string
  order_completed_at?: string
  status?: string
  price?: {
    total?: number
    subTotal?: number
  }
  shipping_address?: {
    location?: {
      coordinates?: [number, number]
    }
  }
  store?: {
    name?: string
    address?: {
      location?: {
        coordinates?: [number, number]
      }
    }
  }
  products?: ApiOrderProduct[]
  fulfillment_type?: string | null
}

export interface ParsedProduct {
  name: string
  quantity: number
  unitPrice: number
  total: number
}

export interface ParsedOrder {
  id: string
  completedAt: Date
  total: number
  shippingLat: number
  shippingLng: number
  storeLat: number
  storeLng: number
  storeName: string
  category: string
  products: ParsedProduct[]
  fulfillmentType: 'delivery' | 'pickup'
}

export interface StoreSummary {
  name: string
  lat: number
  lng: number
  category: string
  orderCount: number
  totalRevenue: number
  avgOrderValue: number
}

export const CATEGORY_KEYWORDS: Record<string, { keywords: string[]; productKeywords?: string[] }> = {
  all: { keywords: [] },
  mexican: { keywords: ['taqueria', 'mexican', 'burrito', 'taco'], productKeywords: ['taco', 'burrito', 'quesadilla'] },
  indian: { keywords: ['indian', 'biryani', 'tandoori'], productKeywords: ['masala', 'naan', 'curry'] },
  italian: { keywords: ['italian', 'pizza', 'pasta', 'trattoria'], productKeywords: ['pizza', 'pasta', 'margherita'] },
  chinese: { keywords: ['chinese', 'szechuan', 'szechwan'], productKeywords: ['dumpling', 'lo mein', 'fried rice'] },
  japanese: { keywords: ['japanese', 'sushi', 'ramen', 'izakaya'], productKeywords: ['sushi', 'ramen', 'sashimi'] },
  thai: { keywords: ['thai'], productKeywords: ['pad thai', 'tom yum'] },
  american: { keywords: ['burger', 'bbq', 'steakhouse', 'diner'], productKeywords: ['burger', 'wings', 'bbq'] },
  mediterranean: {
    keywords: ['mediterranean', 'greek', 'lebanese', 'turkish', 'mezze', 'falafel'],
    productKeywords: ['falafel', 'mezze', 'gyro'],
  },
  vegan: { keywords: ['vegan', 'plant'], productKeywords: ['vegan', 'plant'] },
  seafood: { keywords: ['seafood', 'oyster', 'fish'], productKeywords: ['salmon', 'shrimp'] },
}

export const DAY_LABELS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'] as const

export function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

export function normalizeText(value?: string | null): string {
  return (value ?? '').trim().toLowerCase()
}

function matchesAnyKeyword(source: string, keywords: string[]): boolean {
  if (!source || keywords.length === 0) return false
  const normalized = normalizeText(source)
  return keywords.some((keyword) => normalized.includes(keyword))
}

export function inferCategory(storeName?: string, products: ApiOrderProduct[] = []): string {
  const normalizedName = normalizeText(storeName)
  const productStrings = products
    .map((product) => normalizeText(product.name))
    .filter(Boolean)

  for (const [category, { keywords, productKeywords }] of Object.entries(CATEGORY_KEYWORDS)) {
    if (category === 'all') continue
    if (matchesAnyKeyword(normalizedName, keywords)) {
      return category
    }
    if (productKeywords && productStrings.some((item) => matchesAnyKeyword(item, productKeywords))) {
      return category
    }
  }

  return 'unknown'
}

export function haversineDistanceMeters(a: { lat: number; lng: number }, b: { lat: number; lng: number }) {
  const R = 6371000
  const lat1 = (a.lat * Math.PI) / 180
  const lat2 = (b.lat * Math.PI) / 180
  const deltaLat = ((b.lat - a.lat) * Math.PI) / 180
  const deltaLng = ((b.lng - a.lng) * Math.PI) / 180

  const sinLat = Math.sin(deltaLat / 2)
  const sinLng = Math.sin(deltaLng / 2)

  const c =
    sinLat * sinLat +
    Math.cos(lat1) * Math.cos(lat2) * sinLng * sinLng
  const d = 2 * Math.atan2(Math.sqrt(c), Math.sqrt(1 - c))

  return R * d
}

function isRecord(value: Json | undefined): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value)
}

function toNumber(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) return value
  if (typeof value === 'string') {
    const parsed = Number.parseFloat(value)
    return Number.isFinite(parsed) ? parsed : null
  }
  return null
}

function resolveCoordinate(value: unknown, fallback: number | null = null): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value
  }
  if (typeof value === 'string') {
    const parsed = Number.parseFloat(value)
    return Number.isFinite(parsed) ? parsed : fallback
  }
  return fallback
}

function detectFulfillmentType(order: ApiOrder, shippingLat: number, shippingLng: number, storeLat: number, storeLng: number): 'delivery' | 'pickup' {
  const declaredType = normalizeText(order.fulfillment_type)
  if (declaredType === 'delivery') return 'delivery'
  if (declaredType === 'pickup') return 'pickup'

  const distance = haversineDistanceMeters(
    { lat: shippingLat, lng: shippingLng },
    { lat: storeLat, lng: storeLng },
  )

  if (distance < 50) {
    return 'pickup'
  }

  return 'delivery'
}

export function parseOrders(data: unknown[]): ParsedOrder[] {
  if (!Array.isArray(data)) return []

  return data
    .map((raw) => {
      const order = raw as ApiOrder

      if (normalizeText(order.status) !== 'completed') {
        return null
      }

      if (!order.order_completed_at) {
        return null
      }

      const completedAt = new Date(order.order_completed_at)
      if (Number.isNaN(completedAt.getTime())) {
        return null
      }

      const shippingCoords = order.shipping_address?.location?.coordinates
      const storeCoords = order.store?.address?.location?.coordinates

      const rawShippingLat = Array.isArray(shippingCoords) ? shippingCoords[1] : undefined
      const rawShippingLng = Array.isArray(shippingCoords) ? shippingCoords[0] : undefined
      const rawStoreLat = Array.isArray(storeCoords) ? storeCoords[1] : undefined
      const rawStoreLng = Array.isArray(storeCoords) ? storeCoords[0] : undefined

      const shippingLat = resolveCoordinate(rawShippingLat)
      const shippingLng = resolveCoordinate(rawShippingLng)
      const storeLat = resolveCoordinate(rawStoreLat, shippingLat ?? null)
      const storeLng = resolveCoordinate(rawStoreLng, shippingLng ?? null)

      if (
        shippingLat === null ||
        shippingLng === null ||
        storeLat === null ||
        storeLng === null
      ) {
        return null
      }

      const productsArray = Array.isArray(order.products) ? order.products : []
      const products = productsArray.map((product) => {
        const quantity = typeof product.quantity === 'number' && Number.isFinite(product.quantity) ? product.quantity : 1
        const unitPrice =
          typeof product.unitPrice === 'number' && Number.isFinite(product.unitPrice)
            ? product.unitPrice
            : typeof product.total === 'number' && Number.isFinite(product.total) && quantity > 0
              ? product.total / quantity
              : 0
        const total =
          typeof product.total === 'number' && Number.isFinite(product.total)
            ? product.total
            : unitPrice * quantity

        return {
          name: product.name ?? 'Menu Item',
          quantity,
          unitPrice: Number(unitPrice.toFixed(2)),
          total: Number(total.toFixed(2)),
        }
      })

      const category = inferCategory(order.store?.name, order.products)
      const total =
        toNumber(order.price?.total) ??
        toNumber(order.price?.subTotal) ??
        products.reduce((sum, product) => sum + product.total, 0)

      if (total === null) {
        return null
      }

      const parsedTotal = Number(total.toFixed(2))

      const fulfillmentType = detectFulfillmentType(order, shippingLat, shippingLng, storeLat, storeLng)

      return {
        id: order._id ?? `${completedAt.toISOString()}-${Math.random()}`,
        completedAt,
        total: parsedTotal,
        shippingLat,
        shippingLng,
        storeLat,
        storeLng,
        storeName: order.store?.name ?? 'Restaurant',
        category,
        products,
        fulfillmentType,
      } satisfies ParsedOrder
    })
    .filter((item): item is ParsedOrder => Boolean(item))
}

export function aggregateStores(orders: ParsedOrder[]): StoreSummary[] {
  const grouped = new Map<string, StoreSummary>()

  orders.forEach((order) => {
    const key = `${normalizeText(order.storeName)}|${order.storeLat.toFixed(5)}|${order.storeLng.toFixed(5)}`
    const existing = grouped.get(key)
    if (existing) {
      existing.orderCount += 1
      existing.totalRevenue += order.total
      existing.avgOrderValue = existing.orderCount > 0 ? existing.totalRevenue / existing.orderCount : 0
    } else {
      grouped.set(key, {
        name: order.storeName,
        lat: order.storeLat,
        lng: order.storeLng,
        category: order.category,
        orderCount: 1,
        totalRevenue: order.total,
        avgOrderValue: order.total,
      })
    }
  })

  return Array.from(grouped.values()).map((store) => ({
    ...store,
    totalRevenue: Number(store.totalRevenue.toFixed(2)),
    avgOrderValue: Number(store.avgOrderValue.toFixed(2)),
  }))
}

export function computeHeatmapMatrix(orders: ParsedOrder[]): number[][] {
  const matrix = Array.from({ length: 7 }, () => Array(24).fill(0))

  orders.forEach((order) => {
    const day = order.completedAt.getDay()
    const hour = order.completedAt.getHours()
    if (day >= 0 && day <= 6 && hour >= 0 && hour <= 23) {
      matrix[day][hour] += 1
    }
  })

  return matrix
}

export function serializeTransactionData(rows: Array<{ transaction_data: Json }>): ApiOrder[] {
  return rows
    .map((row) => (isRecord(row.transaction_data) ? (row.transaction_data as ApiOrder) : null))
    .filter((order): order is ApiOrder => Boolean(order))
}


