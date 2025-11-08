import Link from 'next/link'

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm">
        <h1 className="text-4xl font-bold text-center mb-8">
          {/* Replace 'y' and 'K' with logos: YC and KnotAPI */}
          <span className="align-middle">W</span>
          <span className="align-middle">h</span>
          <img src="/assets/yc.png" alt="YC" className="inline-block align-middle mx-1 mt-4 h-6 w-6" />

          <img src="/assets/knot.jpg" alt="Knot API" className="inline-block align-middle mx-1 h-6 w-6" />
          <span className="align-middle">not</span>
        </h1>
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

