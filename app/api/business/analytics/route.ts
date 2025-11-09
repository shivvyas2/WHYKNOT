export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'

import { computeAnalytics } from '@/lib/analytics/metrics'
import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'

export async function GET(_request: Request) {
  try {
    let supabase
    try {
      supabase = createServiceClient()
    } catch {
      supabase = await createClient()
    }

    const { data: transactions, error: transactionError } = await supabase
      .from('transaction_cache')
      .select('*')

    if (transactionError) {
      console.error('Error fetching transactions for analytics:', transactionError)
      return NextResponse.json(
        { error: 'Failed to fetch analytics data' },
        { status: 500 },
      )
    }

    const analytics = computeAnalytics(transactions ?? [])

    return NextResponse.json({ analytics })
  } catch (error) {
    console.error('Error fetching analytics:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

