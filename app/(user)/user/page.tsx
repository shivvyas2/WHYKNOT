export default function UserDashboard() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold mb-6">User Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-2">Opt In</h2>
          <p className="text-gray-600 mb-4">
            Share your transaction data and earn rewards
          </p>
          <a
            href="/user/opt-in"
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            Get Started →
          </a>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-2">Rewards</h2>
          <p className="text-gray-600 mb-4">
            View your promo codes and rewards
          </p>
          <a
            href="/user/rewards"
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            View Rewards →
          </a>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-2">Exclusive Deals</h2>
          <p className="text-gray-600 mb-4">
            Personalized deals based on your preferences
          </p>
          <a
            href="/user/deals"
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            View Deals →
          </a>
        </div>
      </div>
    </div>
  )
}

