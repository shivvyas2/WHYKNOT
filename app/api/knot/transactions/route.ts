export const dynamic = 'force-dynamic'

import { getAuthUser } from '@/lib/auth/utils'
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createKnotClient } from '@/lib/knot/client'
import { env } from '@/config/env'

export async function GET(request: Request) {
  try {
    const user = await getAuthUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const merchant = searchParams.get('merchant')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    const supabase = await createClient()

    // Get user's opt-ins
    const { data: dbUser } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single()

    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const query = supabase
      .from('user_opt_ins')
      .select('*')
      .eq('user_id', dbUser.id)
      .eq('is_active', true)

    if (merchant) {
      query.eq('merchant', merchant)
    }

    const { data: optIns } = await query

    if (!optIns || optIns.length === 0) {
      return NextResponse.json({ transactions: [] })
    }

    // Fetch transactions from Knot API for each active connection
    const knotClient = createKnotClient(
      env.NEXT_PUBLIC_KNOT_CLIENT_ID || '',
      env.KNOT_API_SECRET
    )

    const allTransactions: unknown[] = []

    for (const optIn of optIns) {
      if (optIn.knot_connection_id) {
        try {
          const transactions = await knotClient.getTransactions(
            optIn.knot_connection_id,
            startDate ? new Date(startDate) : undefined,
            endDate ? new Date(endDate) : undefined
          )
          if (Array.isArray(transactions)) {
            allTransactions.push(...transactions)
          }
        } catch (error) {
          console.error(
            `Error fetching transactions for ${optIn.merchant}:`,
            error
          )
        }
      }
    }

    return NextResponse.json({ transactions: allTransactions })
  } catch (error) {
    console.error('Error fetching transactions:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

