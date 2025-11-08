export default function BusinessDashboard() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold mb-6">Business Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-2">Location Insights</h2>
          <p className="text-gray-600">
            Discover high-demand areas for your franchise expansion
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-2">Transaction Data</h2>
          <p className="text-gray-600">
            Analyze customer ordering patterns and preferences
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-2">Analytics</h2>
          <p className="text-gray-600">
            View detailed reports and trends
          </p>
        </div>
      </div>
    </div>
  )
}

