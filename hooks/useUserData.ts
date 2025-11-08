import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useUserData(userId: string | null) {
  const [optIns, setOptIns] = useState<unknown[]>([])
  const [rewards, setRewards] = useState<unknown[]>([])
  const [deals, setDeals] = useState<unknown[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (!userId) {
      setLoading(false)
      return
    }

    async function fetchUserData() {
      try {
        const supabase = createClient()

        const [optInsResult, rewardsResult, dealsResult] = await Promise.all([
          supabase.from('user_opt_ins').select('*').eq('user_id', userId),
          supabase.from('rewards').select('*').eq('user_id', userId),
          supabase.from('deals').select('*').eq('user_id', userId).eq('is_active', true),
        ])

        if (optInsResult.error) throw optInsResult.error
        if (rewardsResult.error) throw rewardsResult.error
        if (dealsResult.error) throw dealsResult.error

        setOptIns(optInsResult.data || [])
        setRewards(rewardsResult.data || [])
        setDeals(dealsResult.data || [])
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch user data'))
      } finally {
        setLoading(false)
      }
    }

    fetchUserData()
  }, [userId])

  return { optIns, rewards, deals, loading, error }
}

