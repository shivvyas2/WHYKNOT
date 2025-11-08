'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useUserData } from '@/hooks/useUserData'

export default function RewardsPage() {
  const [dbUserId, setDbUserId] = useState<string | null>(null)
  const { rewards, loading } = useUserData(dbUserId)
  const supabase = createClient()

  useEffect(() => {
    // Fetch database user ID from API
    const fetchDbUserId = async () => {
      try {
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
  }, [supabase])

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold mb-6">Your Rewards</h1>
      {loading ? (
        <div className="text-center py-8">Loading...</div>
      ) : rewards.length === 0 ? (
        <div className="bg-white p-6 rounded-lg shadow">
          <p className="text-gray-600 mb-4">
            You don't have any rewards yet. Opt in to share your data and get a
            $20 promo code!
          </p>
          <a
            href="/user/opt-in"
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            Get Started →
          </a>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {rewards.map((reward: any) => (
            <div
              key={reward.id}
              className="bg-white p-6 rounded-lg shadow border-2 border-green-500"
            >
              <h2 className="text-xl font-semibold mb-2">Promo Code</h2>
              <p className="text-2xl font-bold text-green-600 mb-2">
                {reward.promo_code}
              </p>
              <p className="text-gray-600">
                ${reward.amount} {reward.currency}
              </p>
              {reward.is_used && (
                <span className="inline-block mt-2 px-3 py-1 bg-gray-200 text-gray-700 rounded text-sm">
                  Used
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

