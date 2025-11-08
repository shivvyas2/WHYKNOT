'use client'

import { useEffect, useRef } from 'react'
import KnotapiJS from 'knotapi-js'

export interface KnotSDKConfig {
  sessionId: string
  clientId: string
  environment: 'development' | 'production'
  product: 'transaction_link'
  merchantIds?: number[]
  entryPoint?: string
  useCategories?: boolean
  useSearch?: boolean
}

export interface KnotSDKCallbacks {
  onSuccess?: (product: string, merchant: string) => void
  onError?: (product: string, errorCode: string, errorDescription: string) => void
  onEvent?: (
    product: string,
    event: string,
    merchant: string,
    merchantId: string,
    payload?: Record<string, unknown>,
    taskId?: string
  ) => void
  onExit?: (product: string) => void
}

export function useKnotSDK() {
  const knotapiRef = useRef<KnotapiJS | null>(null)

  useEffect(() => {
    // Initialize SDK instance
    if (typeof window !== 'undefined' && !knotapiRef.current) {
      knotapiRef.current = new KnotapiJS()
    }

    return () => {
      // Cleanup if needed
      knotapiRef.current = null
    }
  }, [])

  const open = (config: KnotSDKConfig, callbacks: KnotSDKCallbacks) => {
    if (!knotapiRef.current) {
      console.error('Knot SDK not initialized')
      return
    }

    knotapiRef.current.open({
      sessionId: config.sessionId,
      clientId: config.clientId,
      environment: config.environment,
      product: config.product,
      merchantIds: config.merchantIds,
      entryPoint: config.entryPoint,
      useCategories: config.useCategories ?? true,
      useSearch: config.useSearch ?? true,
      onSuccess: callbacks.onSuccess,
      onError: callbacks.onError,
      onEvent: callbacks.onEvent,
      onExit: callbacks.onExit,
    })
  }

  return { open }
}

