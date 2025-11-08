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
    const knotApiKey = env.NEXT_PUBLIC_KNOT_API_KEY
    const knotApiSecret = env.KNOT_API_SECRET

    if (!knotApiKey || !knotApiSecret) {
      return NextResponse.json(
        { error: 'Knot API credentials not configured' },
        { status: 500 }
      )
    }

    // Call Knot's Create Session API
    const knotResponse = await fetch('https://api.knotapi.com/v2/session/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': knotApiKey,
        'X-API-Secret': knotApiSecret,
      },
      body: JSON.stringify({
        type: 'transaction_link',
        user_id: dbUser.id,
        merchant_ids: merchantIds || [],
      }),
    })

    if (!knotResponse.ok) {
      const errorData = await knotResponse.json()
      console.error('Knot session creation error:', errorData)
      return NextResponse.json(
        { error: 'Failed to create Knot session', details: errorData },
        { status: knotResponse.status }
      )
    }

    const sessionData = await knotResponse.json()

    return NextResponse.json({
      sessionId: sessionData.session_id || sessionData.id,
      clientId: env.NEXT_PUBLIC_KNOT_CLIENT_ID || '',
    })
  } catch (error) {
    console.error('Session creation error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

