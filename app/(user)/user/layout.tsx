import { getAuthUser } from '@/lib/auth/utils'
import { redirect } from 'next/navigation'

// MOCK MODE: Set to true to bypass authentication
const MOCK_MODE = true

export default async function UserLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // MOCK MODE: Skip authentication checks
  if (MOCK_MODE) {
    return (
      <div className="min-h-screen bg-gray-50">
        <nav className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex items-center">
                <h1 className="text-xl font-bold">WhyKnot User (MOCK MODE)</h1>
              </div>
              <div className="flex items-center space-x-4">
                <a
                  href="/user"
                  className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Dashboard
                </a>
                <a
                  href="/user/opt-in"
                  className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Opt In
                </a>
                <a
                  href="/user/rewards"
                  className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Rewards
                </a>
                <a
                  href="/user/deals"
                  className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Deals
                </a>
              </div>
            </div>
          </div>
        </nav>
        <main>{children}</main>
      </div>
    )
  }

  const user = await getAuthUser()

  if (!user) {
    redirect('/sign-in')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold">WhyKnot User</h1>
            </div>
            <div className="flex items-center space-x-4">
              <a
                href="/user"
                className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
              >
                Dashboard
              </a>
              <a
                href="/user/opt-in"
                className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
              >
                Opt In
              </a>
              <a
                href="/user/rewards"
                className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
              >
                Rewards
              </a>
              <a
                href="/user/deals"
                className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
              >
                Deals
              </a>
            </div>
          </div>
        </div>
      </nav>
      <main>{children}</main>
    </div>
  )
}

