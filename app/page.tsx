'use client'

import Link from 'next/link'

export default function Home() {
  return (
    <main className="min-h-screen w-full bg-[#ffffff]">
      <div className="flex flex-col items-center w-full">
        {/* Header - Same design as business route */}
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
              <a href="#about" className="rounded-xl px-4 py-2 text-[#111a2c] transition hover:bg-[#4c6ef5]/10">
                About Us
              </a>
              <a href="#roadmap" className="rounded-xl px-4 py-2 text-[#111a2c] transition hover:bg-[#4c6ef5]/10">
                Roadmap
              </a>
              <a href="#contact" className="rounded-xl px-4 py-2 text-[#111a2c] transition hover:bg-[#4c6ef5]/10">
                Contact
              </a>
            </div>
          </div>
        </nav>

        {/* Main Hero Section */}
        <section className="w-full px-6 sm:px-8 lg:px-12 py-12 md:py-20 flex items-center justify-center min-h-[calc(100vh-200px)]">
          {/* Content Section */}
          <div className="flex flex-col items-center text-center">
            <h1 className="max-w-3xl text-3xl font-semibold leading-tight text-[#141c2d] sm:text-5xl md:text-6xl mb-7">
              Unlock Your Restaurant&apos;s Potential with Location-Based Insights
            </h1>
            <p className="max-w-2xl text-base leading-relaxed text-[#566074] md:text-lg mb-12">
              Connect with restaurant owners and leverage food delivery transaction data to make smarter business
              decisions. Why Knot provides the insights you need to grow.
            </p>

            <div className="flex flex-col gap-4 sm:flex-row">
              <Link
                href="/business"
                className="inline-flex items-center justify-center rounded-xl bg-[#FF6B35] px-9 py-3 text-base font-semibold text-white shadow-[0_16px_40px_rgba(255,107,53,0.28)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#FF5722]"
              >
                Business Dashboard
              </Link>
              <Link
                href="/user"
                className="inline-flex items-center justify-center rounded-xl bg-[#000000] px-9 py-3 text-base font-semibold text-white shadow-[0_16px_40px_rgba(0,0,0,0.28)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#1a1a1a]"
              >
                User Portal
              </Link>
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}

