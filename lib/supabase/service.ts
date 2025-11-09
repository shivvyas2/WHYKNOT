import { createClient } from '@supabase/supabase-js'

import { env } from '@/config/env'
import type { Database } from '@/lib/supabase/types'

export function createServiceClient() {
  const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceKey) {
    throw new Error('Missing Supabase service role configuration')
  }

  return createClient<Database>(supabaseUrl, serviceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}


