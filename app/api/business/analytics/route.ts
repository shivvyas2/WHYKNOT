import { getAuthUser } from '@/lib/auth/utils'
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(_request: Request) {
  try {
    const user = await getAuthUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = await createClient()

    // Get user's business profile
    const { data: dbUser } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .eq('role', 'business')
      .single()

    if (!dbUser) {
      return NextResponse.json(
        { error: 'Business profile not found' },
        { status: 404 }
      )
    }

    // Get all transaction data for analytics
    const { data: transactions } = await supabase
      .from('transaction_cache')
      .select('*')

    // Process transactions to generate analytics
    // This is simplified - actual implementation would be more complex
    const analytics = {
      totalOrders: transactions?.length || 0,
      averageOrderValue: 0,
      topCategories: [],
      timeDistribution: [],
    }

    return NextResponse.json({ analytics })
  } catch (error) {
    console.error('Error fetching analytics:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

