'use client'

import { X, TrendingUp, DollarSign, Package, Store } from 'lucide-react'

import type { AreaSelection } from '@/components/business/MapContainer'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'

interface AreaInsightsProps {
  data: AreaSelection
  onClose: () => void
}

export function AreaInsights({ data, onClose }: AreaInsightsProps) {
  const {
    location,
    category,
    metrics,
    isFallback,
    message,
  } = data

  const radiusMiles = metrics.radiusMeters / 1609.34

  const formatCurrency = (value: number, opts: Intl.NumberFormatOptions = {}) =>
    value.toLocaleString(undefined, { maximumFractionDigits: 0, ...opts })

  return (
    <div className="absolute top-0 right-0 z-[1000] flex h-full w-full max-w-md flex-col overflow-y-auto bg-white shadow-2xl sm:max-w-lg lg:max-w-xl">
      <div className="sticky top-0 z-[1001] border-b border-gray-200 bg-white/95 px-4 py-4 backdrop-blur sm:px-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-lg font-semibold text-gray-900">Area Insights</h2>
              <Badge variant="outline" className="text-xs capitalize text-indigo-600">
              {category === 'all' ? 'all cuisines' : category}
            </Badge>
          </div>
            <p className="text-sm text-gray-500">
              {location.lat.toFixed(4)}, {location.lng.toFixed(4)} · {radiusMiles.toFixed(1)} mi radius
            </p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="self-start sm:self-auto">
            <X className="h-5 w-5" />
          </Button>
        </div>
      </div>

      <div className="space-y-6 px-4 py-6 sm:px-6">
        {(isFallback || message) && (
          <div className="rounded-2xl border border-indigo-100 bg-indigo-50 px-4 py-3 text-xs font-medium text-indigo-600">
            {message ?? 'Live Knot demand is still loading — showing representative sample insights.'}
          </div>
        )}

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <Card>
            <CardContent className="flex items-center gap-3 pt-6">
              <div className="rounded-lg bg-blue-100 p-2">
                <Package className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Orders</p>
                <p className="text-lg font-semibold text-gray-900">{metrics.totalOrders.toLocaleString()}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-3 pt-6">
              <div className="rounded-lg bg-green-100 p-2">
                <DollarSign className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Avg. Order</p>
                <p className="text-lg font-semibold text-gray-900">${metrics.avgOrderValue.toFixed(2)}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-3 pt-6">
              <div className="rounded-lg bg-amber-100 p-2">
                <Store className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Nearby Restaurants</p>
                <p className="text-lg font-semibold text-gray-900">{metrics.storeCount}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Spending Trends</CardTitle>
            <p className="text-xs font-medium text-gray-500">
              Based on {metrics.sampleSize.toLocaleString()} orders across {metrics.timeSpanDays} tracked days
            </p>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="monthly">
              <TabsList className="grid w-full grid-cols-3 text-xs sm:text-sm">
                <TabsTrigger value="daily">Daily</TabsTrigger>
                <TabsTrigger value="monthly">Monthly</TabsTrigger>
                <TabsTrigger value="yearly">Yearly</TabsTrigger>
              </TabsList>
              <TabsContent value="daily" className="mt-4">
                <div className="space-y-2">
                  {metrics.dailySpending.map((day) => (
                    <div key={day.day} className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">{day.day}</span>
                      <span className="font-medium text-gray-900">${formatCurrency(day.amount)}</span>
                    </div>
                  ))}
                </div>
              </TabsContent>
              <TabsContent value="monthly" className="mt-4">
                <div className="py-8 text-center">
                  <p className="text-2xl font-semibold text-gray-900">${formatCurrency(metrics.monthlySpending)}</p>
                  <p className="mt-1 text-sm text-gray-500">Projected monthly spend</p>
                </div>
              </TabsContent>
              <TabsContent value="yearly" className="mt-4">
                <div className="py-8 text-center">
                  <p className="text-2xl font-semibold text-gray-900">${formatCurrency(metrics.yearlySpending)}</p>
                  <p className="mt-1 text-sm text-gray-500">Projected annual spend</p>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Most Popular Items
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {metrics.popularItems.map((item, index) => (
                <div key={item.name} className="flex items-start gap-3">
                  <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-purple-600">
                    <span className="text-sm font-semibold text-white">#{index + 1}</span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="text-sm font-semibold text-gray-900 break-words">{item.name}</h4>
                      <Badge variant="secondary" className="whitespace-nowrap">
                        {item.orders.toLocaleString()} sold
                      </Badge>
                    </div>
                    <div className="mt-1 flex items-center gap-3 text-xs text-gray-600">
                      <span>${item.price.toFixed(2)}</span>
                      <span className="flex items-center gap-1 text-green-600">
                        <TrendingUp className="h-3 w-3" />
                        +{item.growth}%
                      </span>
                    </div>
                  </div>
                </div>
              ))}
              {metrics.popularItems.length === 0 && (
                <p className="text-sm text-gray-500">No menu items recorded yet for this selection.</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-blue-50">
          <CardHeader>
            <CardTitle>Opportunity Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-center">
              <div className="text-4xl font-semibold text-purple-600">{metrics.opportunityScore}/100</div>
              <p className="text-sm text-gray-700">{metrics.opportunityMessage}</p>
              <p className="text-xs text-gray-500">
                Benchmarking {metrics.storeCount} active restaurants &amp; ${formatCurrency(metrics.totalRevenue)} in captured spend.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
