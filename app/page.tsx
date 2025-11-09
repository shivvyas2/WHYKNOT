import Link from 'next/link'

export default function Home() {
  return (
    <main className="relative flex min-h-screen w-full flex-col items-center justify-center bg-[#eef3fc] px-5 py-10 md:px-12 md:py-16">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_65%_at_15%_5%,rgba(249,226,203,0.9),rgba(238,243,252,0)),radial-gradient(55%_60%_at_85%_85%,rgba(187,210,255,0.8),rgba(238,243,252,0))]" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.72)_0%,rgba(255,255,255,0.55)_60%,rgba(255,255,255,0.25)_100%)]" />

      <div className="relative z-10 flex w-full max-w-5xl flex-col items-center gap-16">
        <header className="flex w-full items-center justify-between text-[#111a2c]">
          <div className="flex items-center gap-2 text-3xl font-semibold tracking-wide">
            <span>Wh</span>
            <span className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-lg bg-[#ffb347]">
              <img src="/assets/yc.png" alt="Y Combinator" className="h-8 w-8 object-contain" />
            </span>
            <span className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-lg bg-[#1f2937]">
              <img src="/assets/knot.jpg" alt="Knot" className="h-8 w-8 object-cover" />
            </span>
            <span>not</span>
          </div>
        </header>

        <section className="flex flex-col items-center text-center">
          <h1 className="max-w-3xl text-3xl font-semibold leading-tight text-[#141c2d] sm:text-5xl md:text-6xl">
            Unlock Your Restaurant’s Potential with Location-Based Insights
          </h1>
          <p className="mt-7 max-w-2xl text-base leading-relaxed text-[#566074] md:text-lg">
            Connect with restaurant owners and leverage food delivery transaction data to make smarter business
            decisions. Why Knot provides the insights you need to grow.
          </p>

          <div className="mt-12 flex flex-col gap-4 sm:flex-row">
            <Link
              href="/business"
              className="inline-flex items-center justify-center rounded-xl bg-[#2563eb] px-9 py-3 text-base font-semibold text-white shadow-[0_16px_40px_rgba(38,99,235,0.28)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#1d4ed8]"
            >
              Business Dashboard
            </Link>
            <Link
              href="/user"
              className="inline-flex items-center justify-center rounded-xl bg-[#16a34a] px-9 py-3 text-base font-semibold text-white shadow-[0_16px_40px_rgba(22,163,74,0.28)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#15803d]"
            >
              User Portal
            </Link>
          </div>
        </section>

        <footer className="w-full text-center text-sm text-[#6b7280]">
          © 2024 Why Knot. All rights reserved.
        </footer>
      </div>
    </main>
  )
}

