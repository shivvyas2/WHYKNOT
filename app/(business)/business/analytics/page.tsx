'use client'

import { useMemo, useState } from 'react'
import { MapPin } from 'lucide-react'

const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
const hours = Array.from({ length: 24 }, (_, index) => index)

const cuisinePalette = [
  '#4F46E5',
  '#EC4899',
  '#22C55E',
  '#F97316',
  '#14B8A6',
  '#FACC15',
  '#0EA5E9',
  '#6366F1',
  '#D946EF',
  '#FB7185',
]

const cuisineHeatmap = [
  [12, 8, 6, 4, 3, 2, 1, 5, 12, 22, 35, 40, 45, 50, 54, 60, 68, 70, 52, 34, 22, 18, 16, 13],
  [10, 7, 4, 3, 2, 1, 2, 6, 18, 28, 38, 42, 46, 48, 52, 64, 72, 75, 58, 38, 24, 20, 17, 14],
  [11, 8, 5, 4, 3, 2, 2, 8, 20, 30, 44, 50, 52, 58, 64, 72, 80, 84, 64, 42, 28, 24, 20, 16],
  [9, 6, 4, 3, 2, 1, 2, 10, 22, 32, 48, 54, 58, 62, 70, 78, 88, 92, 70, 44, 30, 24, 20, 15],
  [8, 6, 4, 3, 2, 1, 3, 12, 28, 36, 52, 58, 62, 66, 74, 82, 90, 96, 72, 46, 32, 26, 22, 18],
  [7, 5, 4, 3, 2, 1, 4, 16, 32, 38, 48, 52, 55, 58, 66, 72, 78, 82, 64, 40, 26, 22, 18, 14],
  [6, 4, 3, 2, 1, 1, 3, 14, 28, 36, 44, 48, 50, 54, 60, 66, 70, 72, 58, 36, 24, 20, 16, 12],
]

const cuisines = [
  { name: 'Sushi', volume: 2200, percentage: 22 },
  { name: 'Italian', volume: 1800, percentage: 18 },
  { name: 'Burgers', volume: 1400, percentage: 14 },
  { name: 'Mexican', volume: 1200, percentage: 12 },
  { name: 'Thai', volume: 900, percentage: 9 },
  { name: 'Mediterranean', volume: 800, percentage: 8 },
  { name: 'Vegan', volume: 650, percentage: 6.5 },
  { name: 'Pizza', volume: 600, percentage: 6 },
  { name: 'Chinese', volume: 550, percentage: 5.5 },
  { name: 'Indian', volume: 500, percentage: 5 },
]

const priceBuckets = [
  { label: 'Under $15', count: 420, percentage: 14 },
  { label: '$15-30', count: 980, percentage: 32 },
  { label: '$30-50', count: 1100, percentage: 36 },
  { label: '$50-75', count: 360, percentage: 12 },
  { label: '$75+', count: 140, percentage: 6 },
]

const restaurantPins = [
  { name: 'Sakura Sushi', cuisine: 'Sushi', volume: 820, lat: 37.7749, lng: -122.4194 },
  { name: 'Trattoria Uno', cuisine: 'Italian', volume: 640, lat: 37.7799, lng: -122.4244 },
  { name: 'Fire Grill', cuisine: 'Burgers', volume: 410, lat: 37.7699, lng: -122.4144 },
  { name: 'Green Bowl', cuisine: 'Vegan', volume: 220, lat: 37.7649, lng: -122.4094 },
]

const competition = [
  { name: 'Sakura Sushi', cuisine: 'Sushi', orders: 1200, revenue: '$33.6K', price: '$$', rating: 4.7 },
  { name: 'Trattoria Uno', cuisine: 'Italian', orders: 1050, revenue: '$29.4K', price: '$$', rating: 4.5 },
  { name: 'La Fiesta', cuisine: 'Mexican', orders: 960, revenue: '$24.5K', price: '$', rating: 4.4 },
  { name: 'Green Bowl', cuisine: 'Vegan', orders: 720, revenue: '$18.7K', price: '$$', rating: 4.6 },
  { name: 'Katsu Bar', cuisine: 'Japanese', orders: 680, revenue: '$19.0K', price: '$$', rating: 4.3 },
  { name: 'Pasta Veloce', cuisine: 'Italian', orders: 640, revenue: '$17.9K', price: '$$', rating: 4.1 },
  { name: 'Fiery Wok', cuisine: 'Chinese', orders: 600, revenue: '$15.6K', price: '$', rating: 4.2 },
  { name: 'Burger Forge', cuisine: 'Burgers', orders: 580, revenue: '$14.8K', price: '$$', rating: 4.0 },
  { name: 'Bombay Spice', cuisine: 'Indian', orders: 520, revenue: '$13.5K', price: '$$', rating: 4.2 },
  { name: 'Roma Kitchen', cuisine: 'Italian', orders: 510, revenue: '$13.1K', price: '$$', rating: 4.3 },
  { name: 'Aroma Thai', cuisine: 'Thai', orders: 480, revenue: '$12.4K', price: '$$', rating: 4.5 },
  { name: 'Taqueria Azul', cuisine: 'Mexican', orders: 460, revenue: '$11.7K', price: '$', rating: 4.1 },
  { name: 'Urban Vegan', cuisine: 'Vegan', orders: 360, revenue: '$9.2K', price: '$$', rating: 4.6 },
  { name: 'Pho District', cuisine: 'Vietnamese', orders: 340, revenue: '$8.9K', price: '$', rating: 4.4 },
  { name: 'Brooklyn Slice', cuisine: 'Pizza', orders: 320, revenue: '$8.3K', price: '$', rating: 4.0 },
]

const demandTrend = Array.from({ length: 30 }, (_, index) => {
  const base = 320 + Math.sin(index / 3.5) * 40
  const weekendBoost = index % 7 === 5 || index % 7 === 6 ? 60 : 20

  return {
    day: `Day ${index + 1}`,
    volume: Math.round(base + weekendBoost),
  }
})

const orderType = [
  { type: 'Delivery', count: 1800, percentage: 75 },
  { type: 'Pickup', count: 600, percentage: 25 },
]

const insights = [
  'Opportunity: Low-cost Asian fusion (underrepresented)',
  'High demand window: 6-9pm weekdays',
  'Sweet spot AOV: $25-35 (most competitive range)',
  'Saturation alert: 12 pizza shops already in this area',
]

const executiveSummaryCards = [
  {
    label: 'Total Orders (30d)',
    value: '2,400',
    change: '+8.1%',
    helper: 'vs prior 30 days',
  },
  {
    label: 'Revenue Estimate',
    value: '$67.2K',
    change: '+6.4%',
    helper: 'Assuming $28 AOV',
  },
  {
    label: 'Average Order Value',
    value: '$28.00',
    change: '+2.3%',
    helper: 'DoorDash + Uber Eats',
  },
  {
    label: 'Active Restaurants',
    value: '84',
    change: '+3.0%',
    helper: 'Within 3 mile radius',
  },
]

const maxHeatmapValue = Math.max(...cuisineHeatmap.flat())
const maxCuisineVolume = Math.max(...cuisines.map((cuisine) => cuisine.volume))
const maxPriceCount = Math.max(...priceBuckets.map((bucket) => bucket.count))
const maxTrendValue = Math.max(...demandTrend.map((point) => point.volume))

export default function AnalyticsPage() {
  const [selectedSort, setSelectedSort] = useState<'orders' | 'revenue' | 'price'>('orders')

  const sortedCompetition = useMemo(() => {
    if (selectedSort === 'orders') {
      return [...competition].sort((a, b) => b.orders - a.orders)
    }

    if (selectedSort === 'revenue') {
      return [...competition].sort(
        (a, b) => Number(b.revenue.replace(/[^0-9.]/g, '')) - Number(a.revenue.replace(/[^0-9.]/g, '')),
      )
    }

    return [...competition].sort((a, b) => a.price.length - b.price.length)
  }, [selectedSort])

  return (
    <div className="min-h-[calc(100vh-5rem)] bg-slate-50 py-10">
      <div className="mx-auto flex max-w-7xl flex-col gap-10 px-4 sm:px-6 lg:px-8">
        <header className="flex flex-col gap-4 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-100 lg:flex-row lg:items-center lg:justify-between lg:gap-8 lg:p-8">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900 sm:text-3xl">Market Intelligence</h1>
            <p className="mt-1 text-sm text-slate-500">
              Analyze real order data from DoorDash and Uber Eats to guide your next restaurant launch.
            </p>
          </div>
          <div className="grid w-full gap-3 sm:grid-cols-2 lg:w-auto lg:grid-cols-3 lg:items-center">
            <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
              Location
              <select className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-normal text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/20">
                <option>Downtown SF (94103)</option>
                <option>Mission District (94110)</option>
                <option>SoMa (94105)</option>
                <option>Oakland Uptown (94612)</option>
              </select>
            </label>
            <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
              Date Range
              <input
                type="text"
                defaultValue="Oct 10 - Nov 08"
                className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-normal text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/20"
              />
            </label>
            <label className="flex flex-col gap-1 text-sm font-medium text-slate-700 sm:col-span-2 lg:col-span-1">
              Cuisine Filter
              <select className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-normal text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/20">
                <option>All Cuisines</option>
                <option>Asian</option>
                <option>Italian</option>
                <option>Mexican</option>
                <option>Vegan</option>
              </select>
            </label>
          </div>
        </header>

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {executiveSummaryCards.map((card) => (
            <div
              key={card.label}
              className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-indigo-100/40 transition hover:-translate-y-0.5 hover:shadow-lg"
            >
              <p className="text-sm font-medium text-indigo-500">{card.label}</p>
              <p className="mt-3 text-3xl font-semibold text-slate-900">{card.value}</p>
              <div className="mt-2 flex items-center gap-3 text-xs font-medium text-emerald-500">
                <span>{card.change}</span>
                <span className="text-slate-400">{card.helper}</span>
              </div>
            </div>
          ))}
        </section>

        <section className="grid gap-8 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
          <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-100">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">Order Volume by Day & Time</h2>
                <p className="mt-1 text-sm text-slate-500">
                  Heatmap of order density across the last 30 days segmented by hour.
                </p>
              </div>
              <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-600">
                Peak hours are Tuesday-Thursday, 6-8pm
              </span>
            </div>
            <div className="mt-6 overflow-hidden rounded-2xl border border-slate-100 bg-slate-50">
              <div className="grid grid-cols-[auto_1fr]">
                <div className="flex flex-col gap-2 border-r border-slate-100 bg-white px-3 py-4 text-xs font-medium text-slate-500">
                  {daysOfWeek.map((day) => (
                    <div key={day} className="flex h-10 items-center">
                      {day.slice(0, 3)}
                    </div>
                  ))}
                </div>
                <div className="relative overflow-x-auto">
                  <div className="grid grid-cols-24 gap-0.5 px-4 py-4">
                    {hours.map((hour) => (
                      <div key={`hour-${hour}`} className="text-center text-[10px] font-medium text-slate-400">
                        {hour}
                      </div>
                    ))}
                  </div>
                  <div className="grid grid-cols-24 gap-0.5 px-4 pb-4">
                    {cuisineHeatmap.flatMap((row, rowIndex) =>
                      row.map((value, columnIndex) => {
                        const intensity = value / maxHeatmapValue
                        const backgroundOpacity = Math.max(0.1, intensity)

                        return (
                          <div
                            key={`${rowIndex}-${columnIndex}`}
                            className="h-10 rounded-md transition hover:scale-105 hover:shadow-md"
                            style={{
                              backgroundColor: `rgba(79, 70, 229, ${backgroundOpacity})`,
                            }}
                            title={`${daysOfWeek[rowIndex]} ${columnIndex}:00 • ${value} orders`}
                          />
                        )
                      }),
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-100">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">Cuisine Breakdown</h2>
                <p className="mt-1 text-sm text-slate-500">Top 10 cuisines by order volume.</p>
              </div>
              <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-600">
                Sushi dominates at 22% of orders
              </span>
            </div>
            <div className="mt-6 flex flex-col gap-4">
              {cuisines.map((cuisine, index) => (
                <div key={cuisine.name}>
                  <div className="flex items-center justify-between text-sm font-medium text-slate-600">
                    <span className="flex items-center gap-2">
                      <span
                        className="h-2.5 w-2.5 rounded-full"
                        style={{ backgroundColor: cuisinePalette[index % cuisinePalette.length] }}
                      />
                      {cuisine.name}
                    </span>
                    <span>{cuisine.percentage}%</span>
                  </div>
                  <div className="mt-2 flex h-3 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="rounded-full"
                      style={{
                        background: `linear-gradient(90deg, ${cuisinePalette[index % cuisinePalette.length]}, ${cuisinePalette[(index + 1) % cuisinePalette.length]})`,
                        width: `${(cuisine.volume / maxCuisineVolume) * 100}%`,
                      }}
                    />
                  </div>
                  <div className="mt-1 text-xs text-slate-400">{cuisine.volume.toLocaleString()} orders</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="grid gap-8 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
          <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-100">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">Price Point Distribution</h2>
                <p className="mt-1 text-sm text-slate-500">Order distribution by ticket size.</p>
              </div>
              <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-600">
                Most orders are $20-40; premium segment is underserved
              </span>
            </div>
            <div className="mt-8 space-y-5">
              {priceBuckets.map((bucket) => (
                <div key={bucket.label}>
                  <div className="flex items-center justify-between text-sm font-medium text-slate-600">
                    <span>{bucket.label}</span>
                    <span>{bucket.percentage}%</span>
                  </div>
                  <div className="mt-2 h-3 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-indigo-500 via-indigo-400 to-indigo-300"
                      style={{ width: `${(bucket.count / maxPriceCount) * 100}%` }}
                    />
                  </div>
                  <div className="mt-1 text-xs text-slate-400">{bucket.count.toLocaleString()} orders</div>
                </div>
              ))}
            </div>
            <div className="mt-6 rounded-2xl bg-indigo-50 p-4 text-sm text-indigo-700">
              <p className="font-medium">Average order value</p>
              <p className="text-2xl font-semibold">$28.00</p>
              <p className="mt-1 text-indigo-600">
                Highlight: Premium segment ($50+) represents just 18% of order volume — room to grow.
              </p>
            </div>
          </div>

          <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-100">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">Restaurant Density</h2>
                <p className="mt-1 text-sm text-slate-500">Competitor concentration in the selected geography.</p>
              </div>
              <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-medium text-amber-600">
                15 ramen shops vs 2 vegan restaurants
              </span>
            </div>
            <div className="mt-6 grid h-[320px] place-items-center rounded-2xl bg-gradient-to-br from-slate-100 via-white to-slate-100 p-6 text-center">
              <div className="flex flex-col items-center gap-3">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-indigo-100 text-indigo-600">
                  <MapPin className="h-10 w-10" />
                </div>
                <p className="text-sm font-medium text-slate-600">
                  Inline map placeholder. Integrate Mapbox or Google Maps for interactive competitor view.
                </p>
              </div>
            </div>
            <div className="mt-6 space-y-4">
              {restaurantPins.map((pin) => (
                <div key={pin.name} className="flex items-center justify-between rounded-2xl bg-slate-50/80 px-4 py-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{pin.name}</p>
                    <p className="text-xs text-slate-500">
                      {pin.cuisine} • ~{pin.volume} orders/month
                    </p>
                  </div>
                  <span className="text-xs text-slate-400">
                    {pin.lat.toFixed(3)}, {pin.lng.toFixed(3)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-100">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Competition Analysis</h2>
              <p className="mt-1 text-sm text-slate-500">Top 15 restaurants ranked by orders/month.</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-slate-500">Sort by:</span>
              <div className="flex rounded-full bg-slate-100 p-1 text-xs font-semibold text-slate-500">
                <button
                  onClick={() => setSelectedSort('orders')}
                  className={`rounded-full px-3 py-1 transition ${
                    selectedSort === 'orders' ? 'bg-white text-slate-900 shadow-sm' : ''
                  }`}
                >
                  Volume
                </button>
                <button
                  onClick={() => setSelectedSort('revenue')}
                  className={`rounded-full px-3 py-1 transition ${
                    selectedSort === 'revenue' ? 'bg-white text-slate-900 shadow-sm' : ''
                  }`}
                >
                  Revenue
                </button>
                <button
                  onClick={() => setSelectedSort('price')}
                  className={`rounded-full px-3 py-1 transition ${
                    selectedSort === 'price' ? 'bg-white text-slate-900 shadow-sm' : ''
                  }`}
                >
                  Price
                </button>
              </div>
            </div>
          </div>
          <div className="mt-6 overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold">Restaurant</th>
                  <th className="px-4 py-3 text-left font-semibold">Cuisine</th>
                  <th className="px-4 py-3 text-left font-semibold">Est. Orders/Month</th>
                  <th className="px-4 py-3 text-left font-semibold">Est. Revenue</th>
                  <th className="px-4 py-3 text-left font-semibold">Price Range</th>
                  <th className="px-4 py-3 text-left font-semibold">Rating</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {sortedCompetition.map((row) => (
                  <tr key={row.name} className="transition hover:bg-indigo-50/40">
                    <td className="px-4 py-3 font-semibold text-slate-900">{row.name}</td>
                    <td className="px-4 py-3">{row.cuisine}</td>
                    <td className="px-4 py-3">{row.orders.toLocaleString()}</td>
                    <td className="px-4 py-3">{row.revenue}</td>
                    <td className="px-4 py-3">
                      <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-600">
                        {row.price}
                      </span>
                    </td>
                    <td className="px-4 py-3">{row.rating.toFixed(1)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-6 rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">
            <span className="font-semibold text-slate-900">Insight:</span> The top competitor does ~1,200 orders/month at $
            28 AOV — consider winning share through differentiated menu and faster delivery.
          </div>
        </section>

        <section className="grid gap-8 xl:grid-cols-2">
          <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-100">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">Demand Trends</h2>
                <p className="mt-1 text-sm text-slate-500">Daily order volume trend over the last 30 days.</p>
              </div>
              <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-600">
                Demand is stable with slight uptick on weekends
              </span>
            </div>
            <div className="mt-6">
              <div className="h-64 rounded-2xl border border-slate-100 bg-gradient-to-b from-indigo-50 via-white to-white p-4">
                <div className="flex h-full flex-col justify-end gap-2">
                  <div className="flex flex-1 items-end gap-1.5">
                    {demandTrend.map((point, index) => {
                      const height = (point.volume / maxTrendValue) * 100
                      const isWeekend = index % 7 === 5 || index % 7 === 6

                      return (
                        <div
                          key={point.day}
                          className="flex flex-col-reverse justify-end"
                          style={{ height: '100%' }}
                          title={`${point.day}: ${point.volume} orders`}
                        >
                          <div
                            className={`rounded-t-full ${isWeekend ? 'bg-emerald-400/70' : 'bg-indigo-400/70'} transition hover:brightness-110`}
                            style={{ height: `calc(${height}% - 12px)` }}
                          />
                        </div>
                      )
                    })}
                  </div>
                  <div className="flex justify-between text-[10px] font-medium text-slate-400">
                    <span>Day 1</span>
                    <span>Day 10</span>
                    <span>Day 20</span>
                    <span>Day 30</span>
                  </div>
                </div>
              </div>
              <div className="mt-4 rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">
                <p>
                  Trend line indicates a steady baseline with green weekends where volume spikes. Consider promotions on
                  slower Mondays to smooth demand.
                </p>
              </div>
            </div>
          </div>

          <div className="grid gap-8">
            <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-100">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">Order Type Breakdown</h2>
                  <p className="mt-1 text-sm text-slate-500">DoorDash vs Uber Eats split for the selected location.</p>
                </div>
                <span className="rounded-full bg-sky-50 px-3 py-1 text-xs font-medium text-sky-600">
                  75% delivery, 25% pickup
                </span>
              </div>
              <div className="mt-6 flex flex-col items-center gap-4 sm:flex-row sm:items-center sm:justify-around">
                <div className="relative flex h-44 w-44 items-center justify-center rounded-full bg-slate-100">
                  <div className="absolute inset-4 rounded-full bg-white" />
                  <svg className="h-44 w-44 -rotate-90">
                    <circle
                      cx="88"
                      cy="88"
                      r="68"
                      stroke="rgba(148, 163, 184, 0.3)"
                      strokeWidth="20"
                      fill="none"
                    />
                    {(() => {
                      const radius = 68
                      const circumference = 2 * Math.PI * radius
                      let dashOffset = 0

                      return orderType.map((slice) => {
                        const sliceLength = (slice.percentage / 100) * circumference
                        const circle = (
                          <circle
                            key={slice.type}
                            cx="88"
                            cy="88"
                            r={radius}
                            stroke={slice.type === 'Delivery' ? '#4F46E5' : '#22C55E'}
                            strokeWidth="20"
                            strokeDasharray={`${sliceLength} ${circumference - sliceLength}`}
                            strokeDashoffset={dashOffset}
                            strokeLinecap="round"
                            fill="none"
                          />
                        )

                        dashOffset -= sliceLength
                        return circle
                      })
                    })()}
                  </svg>
                  <div className="absolute text-center">
                    <p className="text-xs font-medium text-slate-500">Total Orders</p>
                    <p className="text-2xl font-semibold text-slate-900">2,400</p>
                  </div>
                </div>
                <div className="space-y-4 text-sm text-slate-600">
                  {orderType.map((entry) => (
                    <div key={entry.type} className="flex items-center gap-3">
                      <span
                        className="h-2.5 w-2.5 rounded-full"
                        style={{ backgroundColor: entry.type === 'Delivery' ? '#4F46E5' : '#22C55E' }}
                      />
                      <div className="flex items-center justify-between gap-6">
                        <span className="w-20 font-medium text-slate-700">{entry.type}</span>
                        <span>{entry.percentage}%</span>
                        <span className="text-xs text-slate-400">{entry.count.toLocaleString()} orders</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-100">
              <h2 className="text-lg font-semibold text-slate-900">Key Insights & Recommendations</h2>
              <p className="mt-1 text-sm text-slate-500">AI-generated opportunities tailored to your filters.</p>
              <ul className="mt-4 space-y-3 text-sm text-slate-600">
                {insights.map((insight) => (
                  <li key={insight} className="flex gap-2 rounded-2xl bg-slate-50 px-4 py-3">
                    <span className="mt-0.5 h-2 w-2 rounded-full bg-indigo-500" />
                    {insight}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <section className="flex flex-col gap-4 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-100 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Take Action</h2>
            <p className="mt-1 text-sm text-slate-500">
              Export a go-to-market plan or compare this neighborhood against others in seconds.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <button className="rounded-2xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/30 transition hover:bg-indigo-500">
              Generate Business Plan
            </button>
            <button className="rounded-2xl border border-indigo-200 px-5 py-3 text-sm font-semibold text-indigo-600 transition hover:border-indigo-300 hover:text-indigo-700">
              Compare Neighborhoods
            </button>
          </div>
        </section>
      </div>
    </div>
  )
}

