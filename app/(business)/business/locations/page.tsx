export default function LocationsPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold mb-6">Location Scouting</h1>
      <div className="bg-white p-6 rounded-lg shadow">
        <p className="text-gray-600 mb-4">
          Find optimal locations for franchise expansion based on transaction data
        </p>
        <div className="space-y-4">
          <div className="border p-4 rounded">
            <h3 className="font-semibold">Search by Area</h3>
            <p className="text-sm text-gray-500 mt-2">
              Enter zip code or area to see ordering patterns
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

