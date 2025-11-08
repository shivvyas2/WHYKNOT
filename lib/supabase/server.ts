import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { env } from '@/config/env'

export const createClient = async () => {
  const cookieStore = await cookies()
  const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL || ''
  const supabaseAnonKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
  
  // In CI or development, use placeholder values if missing
  if (!supabaseUrl || !supabaseAnonKey) {
    if (process.env.CI || process.env.NODE_ENV !== 'production') {
      return createServerClient(
        'https://placeholder.supabase.co',
        'placeholder-key',
        {
          cookies: {
            get() { return undefined },
            set() {},
            remove() {},
          },
        }
      )
    }
    throw new Error('Missing Supabase environment variables')
  }

  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value
      },
      set(name: string, value: string, options?: { path?: string; maxAge?: number; domain?: string; sameSite?: 'lax' | 'strict' | 'none'; secure?: boolean }) {
        try {
          cookieStore.set(name, value, options)
        } catch {
          // The `set` method was called from a Server Component.
          // This can be ignored if you have middleware refreshing
          // user sessions.
        }
      },
      remove(name: string, options?: { path?: string; maxAge?: number; domain?: string; sameSite?: 'lax' | 'strict' | 'none'; secure?: boolean }) {
        try {
          cookieStore.set(name, '', { ...options, maxAge: 0 })
        } catch {
          // The `delete` method was called from a Server Component.
          // This can be ignored if you have middleware refreshing
          // user sessions.
        }
      },
    },
  })
}

