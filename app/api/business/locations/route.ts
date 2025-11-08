export const dynamic = 'force-dynamic'

import { getAuthUser } from '@/lib/auth/utils'
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  try {
    const user = await getAuthUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const zipCode = searchParams.get('zipCode')
    const area = searchParams.get('area')

    if (!zipCode && !area) {
      return NextResponse.json(
        { error: 'zipCode or area is required' },
        { status: 400 }
      )
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

    // Query transaction cache for location insights
    // This is a placeholder - actual implementation would aggregate transaction data
    // by location/zip code and provide insights
    const { data: transactions } = await supabase
      .from('transaction_cache')
      .select('*')
      .limit(100)

    // Process transactions to generate location insights
    // This is simplified - actual implementation would be more complex
    const insights = {
      area: area || zipCode,
      zipCode: zipCode || area,
      orderFrequency: transactions?.length || 0,
      popularItems: [],
      averageOrderValue: 0,
      peakHours: [],
      merchantData: {
        doordash: 0,
        ubereats: 0,
      },
    }

    return NextResponse.json({ insights })
  } catch (error) {
    console.error('Error fetching location insights:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

