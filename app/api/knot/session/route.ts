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
    const { merchantIds } = body

    const supabase = await createClient()

    // Get or create user in database
    let { data: dbUser } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single()

    if (!dbUser) {
      const { data: newUser, error: userError } = await supabase
        .from('users')
        .insert({
          id: user.id,
          email: user.email || '',
          role: 'user',
        })
        .select()
        .single()

      if (userError) throw userError
      dbUser = newUser
    }

    // Create a Knot session via their API
    // This requires calling Knot's Create Session endpoint
    const knotClientId = env.NEXT_PUBLIC_KNOT_CLIENT_ID
    const knotApiSecret = env.KNOT_API_SECRET

    if (!knotClientId || !knotApiSecret) {
      return NextResponse.json(
        { error: 'Knot API credentials not configured' },
        { status: 500 }
      )
    }

    // Create Basic Auth header
    const authString = Buffer.from(`${knotClientId}:${knotApiSecret}`).toString('base64')
    const authHeader = `Basic ${authString}`

    // Determine environment URL
    const environment = env.KNOT_ENVIRONMENT || 'development'
    const baseUrl = environment === 'production' 
      ? 'https://knotapi.com' 
      : 'https://development.knotapi.com'

    // Call Knot's Create Session API
    const knotResponse = await fetch(`${baseUrl}/session/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authHeader,
      },
      body: JSON.stringify({
        type: 'transaction_link',
        external_user_id: dbUser.id,
        merchant_ids: merchantIds || [],
      }),
    })

    if (!knotResponse.ok) {
      let errorData
      try {
        errorData = await knotResponse.json()
      } catch {
        errorData = { message: await knotResponse.text() }
      }
      console.error('Knot session creation error:', {
        status: knotResponse.status,
        statusText: knotResponse.statusText,
        error: errorData,
      })
      return NextResponse.json(
        { 
          error: 'Failed to create Knot session', 
          details: errorData,
          status: knotResponse.status,
        },
        { status: knotResponse.status }
      )
    }

    const sessionData = await knotResponse.json()
    console.log('Knot session created successfully:', { sessionId: sessionData.session })

    // Knot API returns { session: "session-id" }
    if (!sessionData.session) {
      console.error('Invalid session response:', sessionData)
      return NextResponse.json(
        { error: 'Invalid session response from Knot API', details: sessionData },
        { status: 500 }
      )
    }

    return NextResponse.json({
      sessionId: sessionData.session,
      clientId: knotClientId,
    })
  } catch (error) {
    console.error('Session creation error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    const errorStack = error instanceof Error ? error.stack : undefined
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: errorMessage,
        ...(process.env.NODE_ENV === 'development' && { stack: errorStack }),
      },
      { status: 500 }
    )
  }
}

