'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { Loader2 } from 'lucide-react'

import { CategoryDropdown } from '@/components/business/CategoryDropdown'
import {
  LocationSearch,
  type LocationOption,
} from '@/components/business/LocationSearch'
import type { AreaSelection } from '@/lib/analytics/area'

const DEFAULT_LOCATION: LocationOption = {
  id: 'princeton-nj',
  name: 'Princeton, NJ',
  displayName: 'Princeton, New Jersey',
  lat: 40.3573,
  lng: -74.6672,
}

export default function AnalyticsPage() {
  const [category, setCategory] = useState<string>('all')
  const [activeLocation, setActiveLocation] = useState<LocationOption>(DEFAULT_LOCATION)
  const [selection, setSelection] = useState<AreaSelection | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  const currencyFormatter = useMemo(
    () =>
      new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        maximumFractionDigits: 0,
      }),
    [],
  )

  const moneyWithCents = useMemo(
    () =>
      new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        maximumFractionDigits: 2,
      }),
    [],
  )

  const fetchSelection = useCallback(
    async (location: LocationOption, activeCategory: string) => {
      setIsLoading(true)
      setError(null)

      try {
        const response = await fetch(
          `/api/business/analytics/location?lat=${location.lat}&lng=${location.lng}&category=${encodeURIComponent(activeCategory)}`,
          { cache: 'no-store' },
        )

        if (!response.ok) {
          throw new Error(`Request failed with status ${response.status}`)
        }

        const payload = (await response.json()) as { selection?: AreaSelection }

        if (!payload.selection) {
          throw new Error('Unexpected response from location analytics endpoint')
        }

        setSelection(payload.selection)
      } catch (err) {
        console.error('Failed to fetch location analytics', err)
        setSelection(null)
        setError('We had trouble loading live data for that area. Please try a different location.')
      } finally {
        setIsLoading(false)
      }
    },
    [],
  )

  useEffect(() => {
    if (!activeLocation) return
    void fetchSelection(activeLocation, category)
  }, [activeLocation, category, fetchSelection])

  const metricsCards = useMemo(() => {
    if (!selection) {
      return []
    }

    return [
      {
        label: 'Completed Orders (1 mi)',
        value: selection.metrics.totalOrders.toLocaleString(),
        helper: `Sample size: ${selection.metrics.sampleSize.toLocaleString()} orders`,
      },
      {
        label: 'Estimated Revenue',
        value: moneyWithCents.format(selection.metrics.totalRevenue),
        helper: 'Total sales captured in this radius',
      },
      {
        label: 'Average Order Value',
        value: moneyWithCents.format(selection.metrics.avgOrderValue),
        helper: `${selection.metrics.storeCount} active operators nearby`,
      },
      {
        label: 'Monthly Spending Potential',
        value: currencyFormatter.format(selection.metrics.monthlySpending),
        helper: '30-day projection based on observed demand',
      },
      {
        label: 'Opportunity Score',
        value: `${selection.metrics.opportunityScore}/100`,
        helper: selection.metrics.opportunityMessage,
      },
    ]
  }, [currencyFormatter, moneyWithCents, selection])

  const popularItems = selection?.metrics.popularItems.slice(0, 5) ?? []

  return (
    <div className="min-h-[calc(100vh-5rem)] bg-slate-50 px-4 py-10">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
        <header className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="space-y-4">
            <div>
              <h1 className="text-3xl font-semibold text-slate-900">Location Analytics</h1>
              <p className="mt-2 text-sm text-slate-500">
                Pick a neighborhood to see live order performance from Knot&apos;s transaction cache — no map required.
              </p>
            </div>
            <div className="max-w-xl">
              <LocationSearch
                onLocationSelect={(location) => setActiveLocation(location)}
                initialQuery={activeLocation?.name}
                placeholder="Search for a city, neighborhood, or address"
              />
            </div>
          </div>

          <div className="w-full max-w-xs">
            <label className="mb-2 block text-sm font-medium text-slate-600">Cuisine filter</label>
            <CategoryDropdown value={category} onChange={setCategory} />
          </div>
        </header>

        {error && (
          <div className="rounded-3xl border border-rose-200 bg-rose-50 px-6 py-4 text-sm text-rose-700 shadow-sm">
            {error}
          </div>
        )}

        {selection?.isFallback && (
          <div className="rounded-3xl border border-amber-200 bg-amber-50 px-6 py-4 text-sm text-amber-700 shadow-sm">
            {selection.message ??
              'Live Knot data is not available for this location yet — showing representative insights instead.'}
          </div>
        )}

        <section className="relative overflow-hidden rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-100 lg:p-8">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-400">Radius</p>
              <p className="text-sm font-medium text-slate-600">1 mile around {activeLocation?.name}</p>
            </div>
            {isLoading && (
              <div className="flex items-center gap-2 text-sm font-medium text-slate-500">
                <Loader2 className="h-4 w-4 animate-spin" />
                Updating…
              </div>
            )}
          </div>

          {selection ? (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
              {metricsCards.map((card) => (
                <div
                  key={card.label}
                  className="flex h-full flex-col justify-between rounded-2xl border border-slate-100 bg-slate-50/60 p-5 shadow-inner"
                >
                  <div className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    {card.label}
                  </div>
                  <div className="mt-3 text-2xl font-semibold text-slate-900">{card.value}</div>
                  <p className="mt-3 text-xs text-slate-500">{card.helper}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex min-h-[140px] items-center justify-center text-sm text-slate-500">
              {isLoading ? 'Crunching numbers…' : 'Search for a location to load insights.'}
            </div>
          )}
        </section>

        {selection && (
          <section className="grid gap-6 lg:grid-cols-[2fr,1fr]">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-900">Neighborhood Opportunity</h2>
              <p className="mt-3 text-sm leading-relaxed text-slate-600">
                {selection.metrics.opportunityMessage}
              </p>
              <p className="mt-4 text-xs text-slate-500">
                Based on {selection.metrics.sampleSize.toLocaleString()} sampled orders and{' '}
                {selection.metrics.storeCount.toLocaleString()} nearby operators captured within the last{' '}
                {selection.metrics.timeSpanDays.toLocaleString()} days.
              </p>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                Top Menu Performers
              </h3>
              <ul className="mt-4 space-y-3">
                {popularItems.length > 0 ? (
                  popularItems.map((item) => (
                    <li key={item.name} className="rounded-2xl border border-slate-100 bg-slate-50/60 p-3">
                      <div className="text-sm font-medium text-slate-900">{item.name}</div>
                      <p className="mt-1 text-xs text-slate-500">
                        {item.orders.toLocaleString()} orders • Avg price {moneyWithCents.format(item.price)}
                      </p>
                    </li>
                  ))
                ) : (
                  <li className="text-xs text-slate-500">
                    Not enough product-level data yet — try another cuisine or area.
                  </li>
                )}
              </ul>
            </div>
          </section>
        )}
      </div>
    </div>
  )
}
