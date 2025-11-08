'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useUserData } from '@/hooks/useUserData'

export default function UserDashboard() {
  const [dbUserId, setDbUserId] = useState<string | null>(null)
  const { deals, loading } = useUserData(dbUserId)

  useEffect(() => {
    // Fetch database user ID from API
    const fetchDbUserId = async () => {
      try {
        const supabase = createClient()
        const {
          data: { user },
        } = await supabase.auth.getUser()
        if (!user) return

        const response = await fetch('/api/user/profile')
        if (response.ok) {
          const data = await response.json()
          setDbUserId(data.userId)
        }
      } catch (error) {
        console.error('Error fetching user profile:', error)
      }
    }
    fetchDbUserId()
  }, [])

  // Get current month name
  const currentMonth = new Date().toLocaleString('default', { month: 'long', year: 'numeric' })

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Your Monthly Coupons</h1>
        <p className="text-gray-600">Based on your transaction data for {currentMonth}</p>
      </div>
      
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading your coupons...</p>
        </div>
      ) : deals.length === 0 ? (
        <div className="bg-white p-8 rounded-lg shadow text-center">
          <div className="max-w-md mx-auto">
            <svg
              className="mx-auto h-12 w-12 text-gray-400 mb-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4H5z"
              />
            </svg>
            <h2 className="text-xl font-semibold mb-2">No Coupons Yet</h2>
            <p className="text-gray-600 mb-6">
              Start sharing your transaction data to receive personalized coupons and deals!
            </p>
            <a
              href="/user/opt-in"
              className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Get Started →
            </a>
          </div>
        </div>
      ) : (
        <div>
          <div className="mb-4 text-sm text-gray-600">
            {deals.length} {deals.length === 1 ? 'coupon' : 'coupons'} available this month
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {(deals as Array<{ id: string; title: string; description: string; merchant: string; discount_percentage: number | null; discount_amount: number | null; promo_code?: string }>).map((deal) => (
              <div
                key={deal.id}
                className="bg-gradient-to-br from-blue-50 to-purple-50 p-6 rounded-lg shadow-lg border-2 border-blue-200 hover:border-blue-400 transition-all"
              >
                <div className="flex items-start justify-between mb-3">
                  <h2 className="text-xl font-bold text-gray-900">{deal.title}</h2>
                  {deal.discount_percentage && (
                    <span className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                      {deal.discount_percentage}% OFF
                    </span>
                  )}
                  {deal.discount_amount && (
                    <span className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                      ${deal.discount_amount} OFF
                    </span>
                  )}
                </div>
                <p className="text-gray-700 mb-4">{deal.description}</p>
                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                  <span className="text-sm font-medium text-gray-600">{deal.merchant}</span>
                  {deal.promo_code && (
                    <span className="text-xs font-mono bg-white px-2 py-1 rounded border border-gray-300">
                      {deal.promo_code}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

