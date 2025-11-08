export const dynamic = 'force-dynamic'

import { getAuthUser } from '@/lib/auth/utils'
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { env } from '@/config/env'

export async function POST(request: Request) {
  try {
    const user = await getAuthUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { merchant_id, cursor, limit = 5 } = body

    if (!merchant_id) {
      return NextResponse.json(
        { error: 'merchant_id is required' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Get user from database
    const { data: dbUser } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single()

    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Create Basic Auth header
    const knotClientId = env.NEXT_PUBLIC_KNOT_CLIENT_ID
    const knotApiSecret = env.KNOT_API_SECRET

    if (!knotClientId || !knotApiSecret) {
      return NextResponse.json(
        { error: 'Knot API credentials not configured' },
        { status: 500 }
      )
    }

    const authString = Buffer.from(`${knotClientId}:${knotApiSecret}`).toString('base64')
    const authHeader = `Basic ${authString}`

    // Determine environment URL
    const environment = env.KNOT_ENVIRONMENT || 'development'
    const baseUrl = environment === 'production' 
      ? 'https://knotapi.com' 
      : 'https://development.knotapi.com'

    // Call Knot's Transaction Sync API
    const syncResponse = await fetch(`${baseUrl}/transactions/sync`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authHeader,
      },
      body: JSON.stringify({
        merchant_id,
        external_user_id: dbUser.id,
        cursor: cursor || undefined,
        limit: Math.min(Math.max(limit, 1), 100), // Clamp between 1 and 100
      }),
    })

    if (!syncResponse.ok) {
      const errorData = await syncResponse.json()
      console.error('Knot transaction sync error:', errorData)
      return NextResponse.json(
        { error: 'Failed to sync transactions', details: errorData },
        { status: syncResponse.status }
      )
    }

    const syncData = await syncResponse.json()

    // Store transactions in cache if needed
    if (syncData.transactions && Array.isArray(syncData.transactions)) {
      for (const transaction of syncData.transactions) {
        await supabase.from('transaction_cache').upsert({
          user_id: dbUser.id,
          merchant: syncData.merchant?.name || merchant_id.toString(),
          transaction_data: transaction,
        })
      }
    }

    return NextResponse.json(syncData)
  } catch (error) {
    console.error('Transaction sync error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

