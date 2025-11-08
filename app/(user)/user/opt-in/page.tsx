'use client'

import { useState } from 'react'
import { useKnotSDK } from '@/lib/knot/sdk'
import { env } from '@/config/env'

// Merchant IDs from Knot - Only Instacart and Uber Eats
const MERCHANT_IDS: Record<string, number> = {
  instacart: 40,
  ubereats: 36,
}

const MERCHANT_DISPLAY_NAMES: Record<string, string> = {
  instacart: 'Instacart',
  ubereats: 'Uber Eats',
}

export default function OptInPage() {
  const [selectedMerchant, setSelectedMerchant] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { open, isReady } = useKnotSDK()

  const handleMerchantSelect = async (merchant: string) => {
    if (!isReady) {
      setError('SDK is still loading. Please wait a moment and try again.')
      return
    }

    setSelectedMerchant(merchant)
    setLoading(true)
    setError(null)

    try {
      // Get the merchant ID for the selected service
      const merchantId = MERCHANT_IDS[merchant]
      if (!merchantId) {
        setError('Invalid merchant selected')
        setLoading(false)
        return
      }

      // Create a Knot session with the specific merchant ID
      const sessionResponse = await fetch('/api/knot/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          merchantIds: [merchantId], // Pass the specific merchant ID
        }),
      })

      if (!sessionResponse.ok) {
        const errorData = await sessionResponse.json()
        throw new Error(errorData.error || 'Failed to create session')
      }

      const { sessionId, clientId } = await sessionResponse.json()

      if (!sessionId || !clientId) {
        throw new Error('Invalid session response')
      }

      // Open Knot SDK
      open(
        {
          sessionId,
          clientId,
          environment: (env.KNOT_ENVIRONMENT as 'development' | 'production') || 'development',
          product: 'transaction_link',
          merchantIds: [merchantId], // Pass the specific merchant ID to SDK
          entryPoint: 'opt-in',
          useCategories: true,
          useSearch: true,
        },
        {
          onSuccess: async (product, details) => {
            console.log('Knot SDK Success:', product, details)
            // Handle successful connection
            // Sync transactions for the selected merchant after successful connection
            try {
              const syncResponse = await fetch('/api/knot/transactions/sync', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  merchant_id: merchantId,
                  limit: 10,
                }),
              })

              if (syncResponse.ok) {
                const syncData = await syncResponse.json()
                console.log('Transactions synced:', syncData)
              } else {
                console.error('Failed to sync transactions:', await syncResponse.json())
              }
            } catch (error) {
              console.error('Failed to sync transactions:', error)
            }
            
            setLoading(false)
            // Redirect to main page to see coupons
            window.location.href = '/user'
          },
          onError: (product, errorCode, errorDescription) => {
            console.error('Knot SDK Error:', product, errorCode, errorDescription)
            setError(`${errorCode}: ${errorDescription}`)
            setLoading(false)
          },
          onEvent: (product, event, merchant, merchantId, payload, taskId) => {
            console.log('Knot SDK Event:', product, event, merchant, merchantId, payload, taskId)
            
            // Handle REFRESH_SESSION_REQUEST
            if (event === 'REFRESH_SESSION_REQUEST') {
              // Create a new session and update the SDK
              const refreshMerchantId = MERCHANT_IDS[selectedMerchant || '']
              if (!refreshMerchantId) {
                setError('Invalid merchant selected')
                setLoading(false)
                return
              }

              fetch('/api/knot/session', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  merchantIds: [refreshMerchantId],
                }),
              })
                .then((res) => res.json())
                .then(({ sessionId, clientId }) => {
                  if (sessionId && clientId) {
                    // Reopen with new session
                    open(
                      {
                        sessionId,
                        clientId,
                        environment: (env.KNOT_ENVIRONMENT as 'development' | 'production') || 'development',
                        product: 'transaction_link',
                        merchantIds: [refreshMerchantId],
                        entryPoint: 'opt-in',
                        useCategories: true,
                        useSearch: true,
                      },
                      {
                        onSuccess: async (product, details) => {
                          console.log('Knot SDK Success (after refresh):', product, details)
                          // Sync transactions after successful connection
                          try {
                            const syncResponse = await fetch('/api/knot/transactions/sync', {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({
                                merchant_id: refreshMerchantId,
                                limit: 10,
                              }),
                            })

                            if (syncResponse.ok) {
                              const syncData = await syncResponse.json()
                              console.log('Transactions synced:', syncData)
                            }
                          } catch (error) {
                            console.error('Failed to sync transactions:', error)
                          }
                          
                          setLoading(false)
                          window.location.href = '/user'
                        },
                        onError: (product, errorCode, errorDescription) => {
                          console.error('Knot SDK Error (after refresh):', product, errorCode, errorDescription)
                          setError(`${errorCode}: ${errorDescription}`)
                          setLoading(false)
                        },
                        onEvent: (product, event, merchant, merchantId, payload, taskId) => {
                          console.log('Knot SDK Event (after refresh):', product, event, merchant, merchantId, payload, taskId)
                        },
                        onExit: (product) => {
                          console.log('Knot SDK Exit (after refresh):', product)
                          setLoading(false)
                        },
                      }
                    )
                  }
                })
                .catch((err) => {
                  console.error('Failed to refresh session:', err)
                  setError('Failed to refresh session. Please try again.')
                  setLoading(false)
                })
            }
          },
          onExit: (product) => {
            console.log('Knot SDK Exit:', product)
            setLoading(false)
          },
        }
      )
    } catch (error) {
      console.error('Opt-in error:', error)
      setError(error instanceof Error ? error.message : 'Failed to start opt-in process')
      setLoading(false)
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold mb-6">Share Your Transaction Data</h1>
      <div className="bg-white p-6 rounded-lg shadow max-w-2xl">
        <p className="text-gray-600 mb-6">
          Select which service you want to connect and share your transaction data from. 
          You&apos;ll receive monthly coupons and exclusive deals based on your spending patterns.
        </p>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800 text-sm">{error}</p>
          </div>
        )}

        <div className="space-y-4 mb-6">
          {Object.entries(MERCHANT_DISPLAY_NAMES).map(([key, name]) => (
            <button
              key={key}
              onClick={() => handleMerchantSelect(key)}
              disabled={loading}
              className="w-full flex items-center justify-between p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:bg-blue-50 hover:border-blue-300 disabled:bg-gray-100 disabled:cursor-not-allowed transition"
            >
              <span className="text-lg font-medium text-gray-900">{name}</span>
              {loading && selectedMerchant === key && (
                <div className="inline-block animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
              )}
              {!loading && (
                <svg
                  className="w-5 h-5 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              )}
            </button>
          ))}
        </div>

        {loading && (
          <div className="text-center py-4">
            <p className="text-gray-600">
              Opening secure connection window...
            </p>
            <p className="text-sm text-gray-500 mt-2">
              Please complete the authentication in the popup window.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

