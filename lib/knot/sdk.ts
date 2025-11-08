'use client'

import { useEffect, useRef, useState } from 'react'

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
  // onSuccess receives (product, details) where details contains merchantName
  onSuccess?: (product: string, details: { merchantName: string }) => void
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
  const knotapiRef = useRef<any>(null)
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    // Dynamically import Knot SDK only on client-side
    if (typeof window !== 'undefined' && !knotapiRef.current) {
      import('knotapi-js')
        .then((KnotapiJSModule) => {
          const KnotapiJS = KnotapiJSModule.default || KnotapiJSModule
          knotapiRef.current = new KnotapiJS()
          setIsReady(true)
        })
        .catch((error) => {
          console.error('Failed to load Knot SDK:', error)
        })
    }

    return () => {
      // Cleanup if needed
      knotapiRef.current = null
    }
  }, [])

  const open = (config: KnotSDKConfig, callbacks: KnotSDKCallbacks) => {
    if (!knotapiRef.current || !isReady) {
      console.error('Knot SDK not initialized or not ready')
      return
    }

    // Validate required fields
    if (!config.sessionId || config.sessionId.trim() === '') {
      console.error('Knot SDK: sessionId is required but missing')
      callbacks.onError?.('transaction_link', 'MISSING_SESSION_ID', 'Session ID is required')
      return
    }

    if (!config.clientId || config.clientId.trim() === '') {
      console.error('Knot SDK: clientId is required but missing', {
        clientId: config.clientId,
        config,
      })
      callbacks.onError?.('transaction_link', 'MISSING_CLIENT_ID', 'Client ID is required')
      return
    }

    console.log('Knot SDK: Opening with validated config', {
      hasSessionId: !!config.sessionId,
      hasClientId: !!config.clientId,
      clientIdLength: config.clientId.length,
      environment: config.environment,
    })

    try {
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
    } catch (error) {
      console.error('Knot SDK: Error calling open:', error)
      callbacks.onError?.(
        'transaction_link',
        'SDK_ERROR',
        error instanceof Error ? error.message : 'Unknown error'
      )
    }
  }

  return { open, isReady }
}

