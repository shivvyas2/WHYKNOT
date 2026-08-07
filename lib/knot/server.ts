import { NextResponse } from 'next/server'

import { env } from '@/config/env'

const KNOT_BASE_URLS = {
  development: 'https://development.knotapi.com',
  production: 'https://production.knotapi.com',
} as const

/** Serverless functions bill wall-clock time, so outbound calls need a deadline. */
const KNOT_TIMEOUT_MS = 10_000

/** Knot credentials are missing or malformed. */
export class KnotConfigError extends Error {
  constructor(message = 'Knot API credentials are not configured') {
    super(message)
    this.name = 'KnotConfigError'
  }
}

/** Knot answered, but not with a success status. */
export class KnotApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly details: unknown
  ) {
    super(message)
    this.name = 'KnotApiError'
  }
}

export function hasKnotCredentials(): boolean {
  return Boolean(env.NEXT_PUBLIC_KNOT_CLIENT_ID && env.KNOT_API_SECRET)
}

export function knotBaseUrl(): string {
  return KNOT_BASE_URLS[env.KNOT_ENVIRONMENT ?? 'development']
}

function knotAuthHeader(): string {
  const clientId = env.NEXT_PUBLIC_KNOT_CLIENT_ID
  const apiSecret = env.KNOT_API_SECRET

  if (!clientId || !apiSecret) {
    throw new KnotConfigError()
  }

  return `Basic ${Buffer.from(`${clientId}:${apiSecret}`).toString('base64')}`
}

export interface CreateSessionParams {
  externalUserId: string
  merchantIds?: number[]
}

/**
 * Creates a `transaction_link` session for the Link SDK to open with.
 *
 * `merchant_ids` narrows the merchant picker and is only sent in development —
 * the production endpoint rejects it.
 */
export async function createSession({
  externalUserId,
  merchantIds,
}: CreateSessionParams): Promise<{ session: string }> {
  const body: Record<string, unknown> = {
    type: 'transaction_link',
    external_user_id: externalUserId,
  }

  if (merchantIds?.length && env.KNOT_ENVIRONMENT !== 'production') {
    body.merchant_ids = merchantIds
  }

  const response = await fetch(`${knotBaseUrl()}/session/create`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: knotAuthHeader(),
    },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(KNOT_TIMEOUT_MS),
  })

  if (!response.ok) {
    const raw = await response.text().catch(() => '')
    let details: unknown
    try {
      details = raw ? JSON.parse(raw) : {}
    } catch {
      details = { message: raw }
    }

    throw new KnotApiError('Knot session creation failed', response.status, details)
  }

  const data = await response.json()
  if (!data?.session) {
    throw new KnotApiError('Knot returned a session response with no session id', 502, data)
  }

  return data
}

export interface SyncTransactionsParams {
  merchantId: number | string
  /** Stable per-user id. Knot pins sync cursors to this, so it must not change between calls. */
  externalUserId: string
  cursor?: string
  limit?: number
}

export interface KnotSyncResponse {
  transactions?: unknown[]
  merchant?: { name?: string }
  next_cursor?: string
  [key: string]: unknown
}

/** Calls Knot's Transaction Sync API for a single connected merchant. */
export async function syncTransactions({
  merchantId,
  externalUserId,
  cursor,
  limit = 5,
}: SyncTransactionsParams): Promise<KnotSyncResponse> {
  const response = await fetch(`${knotBaseUrl()}/transactions/sync`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: knotAuthHeader(),
    },
    body: JSON.stringify({
      merchant_id: merchantId,
      external_user_id: externalUserId,
      cursor: cursor || undefined,
      limit: Math.min(Math.max(limit, 1), 100),
    }),
    signal: AbortSignal.timeout(KNOT_TIMEOUT_MS),
  })

  if (!response.ok) {
    // Read once as text: the body can only be consumed a single time, and Knot
    // returns plain text for some upstream failures.
    const raw = await response.text().catch(() => '')
    let details: unknown
    try {
      details = raw ? JSON.parse(raw) : {}
    } catch {
      details = { message: raw }
    }

    throw new KnotApiError('Knot transaction sync failed', response.status, details)
  }

  return response.json()
}

/**
 * Maps a thrown Knot error onto a response.
 *
 * Upstream bodies are logged, never returned — they can carry request echoes and
 * internal identifiers, and this endpoint is reachable by the browser.
 */
export function knotErrorResponse(error: unknown, context: string): NextResponse {
  if (error instanceof KnotConfigError) {
    console.error(`${context}:`, error.message)
    return NextResponse.json({ error: 'Knot API credentials not configured' }, { status: 503 })
  }

  if (error instanceof KnotApiError) {
    console.error(`${context}:`, error.status, error.details)
    // Collapse upstream 4xx to 502: a Knot rejection is our bug, not the caller's.
    const status = error.status >= 500 || error.status < 400 ? 502 : error.status
    return NextResponse.json({ error: 'Knot request failed' }, { status })
  }

  if (error instanceof DOMException && error.name === 'TimeoutError') {
    console.error(`${context}: timed out`)
    return NextResponse.json({ error: 'Knot request timed out' }, { status: 504 })
  }

  console.error(`${context}:`, error)
  return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
}
