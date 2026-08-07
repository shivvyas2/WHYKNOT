export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'

import { env } from '@/config/env'
import { resolveRequestUser } from '@/lib/auth/request-user'
import { createSession, knotErrorResponse } from '@/lib/knot/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  try {
    const user = await resolveRequestUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    let merchantIds: number[] | undefined
    try {
      ;({ merchantIds } = await request.json())
    } catch {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
    }

    if (!user.isDemo) {
      await ensureUserRow(user.id, user.email)
    }

    const { session } = await createSession({ externalUserId: user.id, merchantIds })

    return NextResponse.json({
      sessionId: session,
      clientId: env.NEXT_PUBLIC_KNOT_CLIENT_ID,
      environment: env.KNOT_ENVIRONMENT ?? 'development',
    })
  } catch (error) {
    return knotErrorResponse(error, 'Session creation error')
  }
}

/** Knot pins sessions to external_user_id, so the row must exist before linking. */
async function ensureUserRow(id: string, email: string): Promise<void> {
  const supabase = await createClient()

  const { error } = await supabase
    .from('users')
    .upsert({ id, email, role: 'user' }, { onConflict: 'id' })

  if (error) {
    console.error('Failed to ensure user row:', error)
    throw error
  }
}
