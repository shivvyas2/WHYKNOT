import Link from 'next/link'
import { getAuthUser } from '@/lib/auth/utils'
import { redirect } from 'next/navigation'

// MOCK MODE: Set to true to bypass authentication
const MOCK_MODE = true

function UserHeader() {
  return (
    <nav className="sticky top-0 z-20 flex w-full justify-center px-4 pt-6">
      <div className="flex w-full max-w-5xl items-center justify-between px-6 py-3 sm:px-8">
        <Link href="/" className="flex items-center gap-2 text-2xl font-semibold tracking-wide text-[#111a2c]">
          <span>Wh</span>
          <span className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-lg">
            <img src="/assets/yc.png" alt="Y Combinator" className="h-8 w-8 object-contain" />
          </span>
          <span className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-lg">
            <img src="/assets/knot.jpg" alt="Knot" className="h-8 w-8 object-cover" />
          </span>
          <span>not</span>
        </Link>

        <div className="flex items-center gap-3 text-sm font-medium">
          <a href="/user" className="rounded-xl px-4 py-2 text-[#111a2c] transition hover:bg-[#4c6ef5]/10">
            Coupons
          </a>
          <a href="/user/opt-in" className="rounded-xl px-4 py-2 text-[#111a2c] transition hover:bg-[#4c6ef5]/10">
            Share Data
          </a>
          <a href="/user/rewards" className="rounded-xl px-4 py-2 text-[#111a2c] transition hover:bg-[#4c6ef5]/10">
            My Rewards
          </a>
        </div>
      </div>
    </nav>
  )
}

export default async function UserLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // MOCK MODE: Skip authentication checks
  if (MOCK_MODE) {
    return (
      <div className="min-h-screen w-full bg-white">
        <UserHeader />
        <main className="flex-1">{children}</main>
      </div>
    )
  }

  const user = await getAuthUser()

  if (!user) {
    redirect('/sign-in')
  }

  return (
    <div className="min-h-screen w-full bg-white">
      <UserHeader />
      <main className="flex-1">{children}</main>
    </div>
  )
}

