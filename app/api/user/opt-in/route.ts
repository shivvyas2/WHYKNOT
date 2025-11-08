export const dynamic = 'force-dynamic'

import { getAuthUser } from '@/lib/auth/utils'
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createKnotClient } from '@/lib/knot/client'
import { env } from '@/config/env'
import { REWARD_AMOUNT, REWARD_CURRENCY } from '@/lib/constants'

export async function POST(request: Request) {
  try {
    const user = await getAuthUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { merchants } = body

    if (!merchants || !Array.isArray(merchants) || merchants.length === 0) {
      return NextResponse.json(
        { error: 'Merchants array is required' },
        { status: 400 }
      )
    }

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

    // Initialize Knot SDK for each merchant
    const knotClient = createKnotClient(
      env.NEXT_PUBLIC_KNOT_API_KEY || '',
      env.KNOT_API_SECRET
    )

    const optInResults = []

    for (const merchant of merchants) {
      try {
        // Initialize Knot connection
        const connection = await knotClient.initializeConnection(user.id, merchant)

        // Create opt-in record
        const { data: optIn, error: optInError } = await supabase
          .from('user_opt_ins')
          .insert({
            user_id: dbUser.id,
            merchant,
            is_active: true,
            knot_connection_id: connection.id || null,
          })
          .select()
          .single()

        if (optInError) throw optInError

        optInResults.push(optIn)
      } catch (error) {
        console.error(`Error initializing connection for ${merchant}:`, error)
        // Continue with other merchants even if one fails
      }
    }

    // Create reward for user
    const promoCode = `WHYKNOT${Math.random().toString(36).substring(2, 10).toUpperCase()}`
    const { data: reward, error: rewardError } = await supabase
      .from('rewards')
      .insert({
        user_id: dbUser.id,
        promo_code: promoCode,
        amount: REWARD_AMOUNT,
        currency: REWARD_CURRENCY,
        is_used: false,
      })
      .select()
      .single()

    if (rewardError) {
      console.error('Error creating reward:', rewardError)
    }

    return NextResponse.json({
      success: true,
      optIns: optInResults,
      reward,
    })
  } catch (error) {
    console.error('Opt-in error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

