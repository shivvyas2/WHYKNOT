export const dynamic = 'force-dynamic'

import { getAuthUser } from '@/lib/auth/utils'
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { env } from '@/config/env'

export async function POST(request: Request) {
  try {
    // In mock mode, create a mock user
    // Check both environment variable and if Supabase credentials are missing
    const hasSupabaseConfig = !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
    const MOCK_MODE = process.env.MOCK_MODE === 'true' || process.env.NODE_ENV === 'development' || !hasSupabaseConfig
    
    let user
    if (MOCK_MODE) {
      user = {
        id: 'mock-user-id-' + Date.now(),
        email: 'mock@example.com',
      }
    } else {
      try {
        user = await getAuthUser()
        if (!user) {
          // Fall back to mock mode if no user found
          console.warn('No authenticated user found, falling back to mock mode')
          user = {
            id: 'mock-user-id-' + Date.now(),
            email: 'mock@example.com',
          }
        }
      } catch (authError) {
        // Fall back to mock mode if auth fails
        console.error('Error getting authenticated user, falling back to mock mode:', authError)
        user = {
          id: 'mock-user-id-' + Date.now(),
          email: 'mock@example.com',
        }
      }
    }

    const body = await request.json()
    const { merchant_id, cursor, limit = 5 } = body

    if (!merchant_id) {
      return NextResponse.json(
        { error: 'merchant_id is required' },
        { status: 400 }
      )
    }

    let dbUser
    if (MOCK_MODE) {
      dbUser = {
        id: user.id,
        email: user.email || '',
        role: 'user',
      }
    } else {
      const supabase = await createClient()

      // Get user from database
      const { data: existingUser } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single()

      if (!existingUser) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 })
      }
      dbUser = existingUser
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

    // Store transactions in cache if needed (skip in mock mode)
    if (!MOCK_MODE && syncData.transactions && Array.isArray(syncData.transactions)) {
      const supabase = await createClient()
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

