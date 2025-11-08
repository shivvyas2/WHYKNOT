'use client'

import { useState } from 'react'
import { MERCHANTS, MERCHANT_DISPLAY_NAMES, type MerchantType } from '@/lib/constants'

export default function OptInPage() {
  const [selectedMerchants, setSelectedMerchants] = useState<MerchantType[]>([])
  const [loading, setLoading] = useState(false)

  const toggleMerchant = (merchant: MerchantType) => {
    setSelectedMerchants((prev) =>
      prev.includes(merchant)
        ? prev.filter((m) => m !== merchant)
        : [...prev, merchant]
    )
  }

  const handleOptIn = async () => {
    if (selectedMerchants.length === 0) {
      alert('Please select at least one merchant')
      return
    }

    setLoading(true)
    try {
      // This will initialize Knot SDK for each selected merchant
      const response = await fetch('/api/user/opt-in', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ merchants: selectedMerchants }),
      })

      if (!response.ok) throw new Error('Failed to opt in')

      // Redirect to rewards page after successful opt-in
      window.location.href = '/user/rewards'
    } catch (error) {
      console.error('Opt-in error:', error)
      alert('Failed to opt in. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold mb-6">Opt In to Share Data</h1>
      <div className="bg-white p-6 rounded-lg shadow max-w-2xl">
        <p className="text-gray-600 mb-6">
          Select which merchants you want to share transaction data from. You'll
          receive a $20 promo code and exclusive deals based on your preferences.
        </p>

        <div className="space-y-4 mb-6">
          {Object.entries(MERCHANTS).map(([key, value]) => (
            <label
              key={value}
              className="flex items-center p-4 border rounded-lg cursor-pointer hover:bg-gray-50"
            >
              <input
                type="checkbox"
                checked={selectedMerchants.includes(value)}
                onChange={() => toggleMerchant(value)}
                className="w-5 h-5 text-blue-600 rounded"
              />
              <span className="ml-3 text-lg font-medium">
                {MERCHANT_DISPLAY_NAMES[value]}
              </span>
            </label>
          ))}
        </div>

        <button
          onClick={handleOptIn}
          disabled={loading || selectedMerchants.length === 0}
          className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
        >
          {loading ? 'Processing...' : 'Opt In & Get $20 Reward'}
        </button>
      </div>
    </div>
  )
}

