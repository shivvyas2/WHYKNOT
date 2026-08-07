import { env } from '@/config/env'

const ORDER_DATA_TIMEOUT_MS = 8_000

export interface OrderDataResult {
  /** Raw order rows, empty when the source is unreachable. */
  orders: unknown[]
  /** False when we fell back because the analytics backend didn't answer. */
  live: boolean
}

/**
 * Reads order data from the restaurant-stats backend.
 *
 * Server-side only. The backend is a separate service (see README) and is not
 * running in the hosted demo, so callers must handle `live: false` rather than
 * assuming rows exist.
 */
export async function fetchOrderData(signal?: AbortSignal): Promise<OrderDataResult> {
  const baseUrl = env.RESTAURANT_STATS_API_URL ?? 'http://localhost:8000'

  try {
    const response = await fetch(`${baseUrl}/api/mongo-data`, {
      cache: 'no-store',
      // Without a deadline an unreachable backend holds the function open until
      // the platform kills it.
      signal: signal ?? AbortSignal.timeout(ORDER_DATA_TIMEOUT_MS),
    })

    if (!response.ok) {
      throw new Error(`Order data request failed with status ${response.status}`)
    }

    const payload = await response.json()
    return { orders: Array.isArray(payload?.data) ? payload.data : [], live: true }
  } catch (error) {
    if (signal?.aborted) throw error
    console.warn('Order data source unavailable:', error)
    return { orders: [], live: false }
  }
}
