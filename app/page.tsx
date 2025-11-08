import Link from 'next/link'

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm">
        <h1 className="text-4xl font-bold text-center mb-8">WhyKnot</h1>
        <p className="text-center mb-12 text-lg">
          Connect restaurant owners with location insights through transaction data
        </p>
        <div className="flex gap-4 justify-center">
          <Link
            href="/business"
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Business Dashboard
          </Link>
          <Link
            href="/user"
            className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
          >
            User Portal
          </Link>
        </div>
      </div>
    </main>
  )
}

