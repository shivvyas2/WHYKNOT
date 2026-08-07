export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'

import { fetchOrderData } from '@/lib/analytics/source'

/**
 * Server-side proxy for the restaurant-stats backend.
 *
 * The map is a client component; without this hop it would fetch the backend
 * origin from the visitor's browser, which resolves to *their* machine.
 */
export async function GET() {
  const { orders, live } = await fetchOrderData()
  return NextResponse.json({ data: orders, live })
}
