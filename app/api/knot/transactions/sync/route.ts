export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'

import { resolveRequestUser } from '@/lib/auth/request-user'
import { knotErrorResponse, syncTransactions } from '@/lib/knot/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  try {
    const user = await resolveRequestUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { merchant_id: merchantId, cursor, limit = 5 } = await request.json()
    if (!merchantId) {
      return NextResponse.json({ error: 'merchant_id is required' }, { status: 400 })
    }

    const syncData = await syncTransactions({
      merchantId,
      externalUserId: user.id,
      cursor,
      limit,
    })

    if (!user.isDemo && Array.isArray(syncData.transactions) && syncData.transactions.length) {
      const supabase = await createClient()
      const merchant = syncData.merchant?.name ?? String(merchantId)

      // One upsert for the page, not one per transaction.
      const { error } = await supabase.from('transaction_cache').upsert(
        syncData.transactions.map((transaction) => ({
          user_id: user.id,
          merchant,
          transaction_data: transaction,
        }))
      )

      if (error) console.error('Failed to cache synced transactions:', error)
    }

    return NextResponse.json(syncData)
  } catch (error) {
    return knotErrorResponse(error, 'Transaction sync error')
  }
}
