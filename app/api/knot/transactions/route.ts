export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'

import { resolveRequestUser } from '@/lib/auth/request-user'
import { KNOT_MERCHANT_IDS } from '@/lib/constants'
import { hasKnotCredentials, knotErrorResponse, syncTransactions } from '@/lib/knot/server'
import { createClient } from '@/lib/supabase/server'

const TRANSACTIONS_PER_MERCHANT = 20

/**
 * Returns the caller's transactions across every merchant they've connected.
 *
 * Knot has no "list all transactions" endpoint — Transaction Sync is per
 * merchant — so this fans out over the user's active opt-ins and flattens.
 */
export async function GET(request: Request) {
  try {
    const user = await resolveRequestUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!hasKnotCredentials()) {
      // Nothing to sync against. Report it rather than 500-ing, so the page can
      // render its empty state instead of an error.
      return NextResponse.json({ transactions: [], reason: 'knot_not_configured' })
    }

    const { searchParams } = new URL(request.url)
    const merchantFilter = searchParams.get('merchant')

    const merchants = await connectedMerchants(user.id, user.isDemo, merchantFilter)
    if (merchants.length === 0) {
      return NextResponse.json({ transactions: [] })
    }

    const results = await Promise.all(
      merchants.map(async (merchantId) => {
        try {
          const data = await syncTransactions({
            merchantId,
            externalUserId: user.id,
            limit: TRANSACTIONS_PER_MERCHANT,
          })
          return Array.isArray(data.transactions) ? data.transactions : []
        } catch (error) {
          // One unreachable merchant shouldn't blank the whole page.
          console.error(`Transaction sync failed for merchant ${merchantId}:`, error)
          return []
        }
      })
    )

    return NextResponse.json({ transactions: results.flat() })
  } catch (error) {
    return knotErrorResponse(error, 'Error fetching transactions')
  }
}

/** Knot merchant ids the user has connected. */
async function connectedMerchants(
  userId: string,
  isDemo: boolean,
  merchantFilter: string | null
): Promise<number[]> {
  const toId = (slug: string) => KNOT_MERCHANT_IDS[slug]

  if (isDemo) {
    // No Supabase to read opt-ins from, so offer the merchants the demo supports.
    const slugs = merchantFilter ? [merchantFilter] : Object.keys(KNOT_MERCHANT_IDS)
    return slugs.map(toId).filter(isMerchantId)
  }

  const supabase = await createClient()
  const query = supabase
    .from('user_opt_ins')
    .select('merchant')
    .eq('user_id', userId)
    .eq('is_active', true)

  if (merchantFilter) query.eq('merchant', merchantFilter)

  const { data, error } = await query
  if (error) {
    console.error('Failed to read opt-ins:', error)
    return []
  }

  return (data ?? []).map((optIn) => toId(optIn.merchant)).filter(isMerchantId)
}

function isMerchantId(id: number | undefined): id is number {
  return typeof id === 'number'
}
