'use client'

import { useState } from 'react'

export function LocationScout() {
  const [zipCode, setZipCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [insights, setInsights] = useState(null)

  const handleSearch = async () => {
    if (!zipCode) return

    setLoading(true)
    try {
      const response = await fetch(`/api/business/locations?zipCode=${zipCode}`)
      const data = await response.json()
      setInsights(data.insights)
    } catch (error) {
      console.error('Error fetching location insights:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <input
          type="text"
          value={zipCode}
          onChange={(e) => setZipCode(e.target.value)}
          placeholder="Enter zip code"
          className="flex-1 px-4 py-2 border rounded-lg"
        />
        <button
          onClick={handleSearch}
          disabled={loading}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
        >
          {loading ? 'Searching...' : 'Search'}
        </button>
      </div>
      {insights && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-xl font-semibold mb-4">Location Insights</h3>
          <div className="space-y-2">
            <p>Area: {insights.area}</p>
            <p>Order Frequency: {insights.orderFrequency}</p>
            <p>Average Order Value: ${insights.averageOrderValue}</p>
          </div>
        </div>
      )}
    </div>
  )
}

