import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { env } from '@/config/env'

export const createClient = () => {
  const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL || ''
  const supabaseAnonKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
  
  // In CI or development, use placeholder values if missing
  if (!supabaseUrl || !supabaseAnonKey) {
    if (process.env.CI || process.env.NODE_ENV !== 'production') {
      return createSupabaseClient('https://placeholder.supabase.co', 'placeholder-key')
    }
    throw new Error('Missing Supabase environment variables')
  }
  
  return createSupabaseClient(supabaseUrl, supabaseAnonKey)
}

