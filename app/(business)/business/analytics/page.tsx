export default function AnalyticsPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold mb-6">Analytics</h1>
      <div className="bg-white p-6 rounded-lg shadow">
        <p className="text-gray-600 mb-4">
          View detailed analytics and insights from transaction data
        </p>
        <div className="space-y-4">
          <div className="border p-4 rounded">
            <h3 className="font-semibold">Order Trends</h3>
            <p className="text-sm text-gray-500 mt-2">
              Analyze ordering patterns over time
            </p>
          </div>
          <div className="border p-4 rounded">
            <h3 className="font-semibold">Popular Items</h3>
            <p className="text-sm text-gray-500 mt-2">
              See what customers order most frequently
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

