import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useTransactions(userId: string | null) {
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (!userId) {
      setLoading(false)
      return
    }

    async function fetchTransactions() {
      try {
        const supabase = createClient()
        const { data, error: fetchError } = await supabase
          .from('transaction_cache')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })

        if (fetchError) throw fetchError
        setTransactions(data || [])
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch transactions'))
      } finally {
        setLoading(false)
      }
    }

    fetchTransactions()
  }, [userId])

  return { transactions, loading, error }
}

