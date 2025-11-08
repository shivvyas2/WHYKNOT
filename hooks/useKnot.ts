import { useState, useCallback } from 'react'
import { createKnotClient } from '@/lib/knot/client'
import { env } from '@/config/env'

export function useKnot() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const initializeConnection = useCallback(
    async (userId: string, merchant: string) => {
      setLoading(true)
      setError(null)

      try {
        const client = createKnotClient(
          env.NEXT_PUBLIC_KNOT_CLIENT_ID || '',
          env.KNOT_API_SECRET
        )
        const connection = await client.initializeConnection(userId, merchant)
        return connection
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Unknown error')
        setError(error)
        throw error
      } finally {
        setLoading(false)
      }
    },
    []
  )

  return {
    initializeConnection,
    loading,
    error,
  }
}

