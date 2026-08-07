import { getAuthUser } from '@/lib/auth/utils'

export interface RequestUser {
  id: string
  email: string
  isDemo: boolean
}

/**
 * Demo mode runs the app without Supabase so the hosted demo stays clickable.
 * It is opt-in (MOCK_MODE) or inferred from Supabase being unconfigured — it is
 * never entered because a real auth check failed, which would turn an auth
 * outage into anonymous access.
 */
export function isDemoMode(): boolean {
  if (process.env.MOCK_MODE === 'true') return true

  return !(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  )
}

const DEMO_USER: RequestUser = {
  // Stable, not Date.now() — Knot pins sync cursors to external_user_id, so a
  // per-request id would start a fresh sync every call and never paginate.
  id: 'demo-user',
  email: 'demo@whyknot.app',
  isDemo: true,
}

/** Resolves the caller, or null when a real session is required and absent. */
export async function resolveRequestUser(): Promise<RequestUser | null> {
  if (isDemoMode()) return DEMO_USER

  const user = await getAuthUser()
  if (!user) return null

  return { id: user.id, email: user.email ?? '', isDemo: false }
}
