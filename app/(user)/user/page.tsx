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

  // Dummy coupons data
  const dummyCoupons = [
    {
      id: 'dummy-1',
      title: '20% Off Your Next Order',
      description: 'Get 20% off on orders over $25. Valid for delivery and pickup. Perfect for your favorite meals!',
      merchant: 'Uber Eats',
      discount_percentage: 20,
      discount_amount: null,
      promo_code: 'SAVE20NOW',
    },
    {
      id: 'dummy-2',
      description: 'Save $5 on your next order of $30 or more. Use this coupon at checkout for instant savings.',
      merchant: 'DoorDash',
      discount_percentage: null,
      discount_amount: 5,
      promo_code: 'DOORDASH5',
      title: '$5 Off Your Order',
    },
    {
      id: 'dummy-3',
      title: '15% Off Italian Cuisine',
      description: 'Enjoy 15% off on Italian restaurants. Valid for all Italian cuisine orders. Buon appetito!',
      merchant: 'Grubhub',
      discount_percentage: 15,
      discount_amount: null,
      promo_code: 'ITALIAN15',
    },
    {
      id: 'dummy-4',
      title: 'Free Delivery',
      description: 'Get free delivery on orders over $15. No delivery fees, just great food delivered to your door.',
      merchant: 'Postmates',
      discount_percentage: null,
      discount_amount: null,
      promo_code: 'FREEDEL',
    },
    {
      id: 'dummy-5',
      title: '30% Off First Order',
      description: 'New customer special! Get 30% off your first order. Try new restaurants and save big.',
      merchant: 'Caviar',
      discount_percentage: 30,
      discount_amount: null,
      promo_code: 'FIRST30',
    },
    {
      id: 'dummy-6',
      title: '$10 Off $40+ Order',
      description: 'Save $10 when you order $40 or more. Perfect for family meals or group orders.',
      merchant: 'Seamless',
      discount_percentage: null,
      discount_amount: 10,
      promo_code: 'SAVE10',
    },
  ]

  // Use dummy coupons if no deals are available
  const displayCoupons = deals.length > 0 ? deals : dummyCoupons

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
      ) : (
        <div>
          {deals.length === 0 && (
            <div className="mb-6 bg-gradient-to-r from-orange-50 to-yellow-50 border border-orange-200 rounded-xl p-4">
              <p className="text-sm text-gray-700">
                <span className="font-semibold">Demo Mode:</span> Showing sample coupons. 
                <a href="/user/opt-in" className="text-[#FF6B35] hover:underline font-medium ml-1">
                  Share your data to get personalized coupons →
                </a>
              </p>
            </div>
          )}
          <div className="mb-4 text-sm text-gray-600">
            {displayCoupons.length} {displayCoupons.length === 1 ? 'coupon' : 'coupons'} available this month
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {(displayCoupons as Array<{ id: string; title: string; description: string; merchant: string; discount_percentage: number | null; discount_amount: number | null; promo_code?: string }>).map((deal) => (
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

