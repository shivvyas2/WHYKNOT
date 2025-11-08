'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useUserData } from '@/hooks/useUserData'

export default function DealsPage() {
  const [dbUserId, setDbUserId] = useState<string | null>(null)
  const { deals, loading } = useUserData(dbUserId)
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
      <h1 className="text-3xl font-bold mb-6">Exclusive Deals</h1>
      {loading ? (
        <div className="text-center py-8">Loading...</div>
      ) : deals.length === 0 ? (
        <div className="bg-white p-6 rounded-lg shadow">
          <p className="text-gray-600 mb-4">
            No deals available yet. Opt in to share your data to receive
            personalized deals!
          </p>
          <a
            href="/user/opt-in"
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            Get Started →
          </a>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {deals.map((deal: any) => (
            <div
              key={deal.id}
              className="bg-white p-6 rounded-lg shadow border border-gray-200"
            >
              <h2 className="text-xl font-semibold mb-2">{deal.title}</h2>
              <p className="text-gray-600 mb-4">{deal.description}</p>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">{deal.merchant}</span>
                {deal.discount_percentage && (
                  <span className="text-lg font-bold text-green-600">
                    {deal.discount_percentage}% OFF
                  </span>
                )}
                {deal.discount_amount && (
                  <span className="text-lg font-bold text-green-600">
                    ${deal.discount_amount} OFF
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

