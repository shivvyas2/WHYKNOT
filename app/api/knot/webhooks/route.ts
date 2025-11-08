import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { createClient } from '@/lib/supabase/server'
import { env } from '@/config/env'

export async function POST(request: Request) {
  try {
    const headersList = await headers()
    const signature = headersList.get('x-knot-signature')

    // Verify webhook signature
    if (env.KNOT_WEBHOOK_SECRET && signature) {
      // TODO: Implement webhook signature verification
      // This will depend on Knot's webhook verification method
    }

    const body = await request.json()
    const { event, data } = body

    const supabase = await createClient()

    switch (event) {
      case 'transaction.created':
      case 'transaction.updated': {
        // Store transaction data in cache
        const { error } = await supabase.from('transaction_cache').upsert({
          user_id: data.user_id,
          merchant: data.merchant,
          transaction_data: data,
        })

        if (error) {
          console.error('Error storing transaction:', error)
          return NextResponse.json(
            { error: 'Failed to store transaction' },
            { status: 500 }
          )
        }
        break
      }

      case 'connection.updated': {
        // Update opt-in status if connection status changes
        const { error } = await supabase
          .from('user_opt_ins')
          .update({
            is_active: data.status === 'active',
            knot_connection_id: data.connection_id,
          })
          .eq('knot_connection_id', data.connection_id)

        if (error) {
          console.error('Error updating connection:', error)
        }
        break
      }

      default:
        console.log('Unhandled webhook event:', event)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

