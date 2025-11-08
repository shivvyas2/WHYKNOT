'use client'

import { X, TrendingUp, DollarSign, Package } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { getAreaInsights } from '@/utils/mockData'

interface AreaInsightsProps {
  location: { lat: number; lng: number };
  category: string;
  onClose: () => void;
}

export function AreaInsights({ location, category, onClose }: AreaInsightsProps) {
  const insights = getAreaInsights(category, location);

  return (
    <div className="absolute top-0 right-0 h-full w-[500px] bg-white shadow-2xl z-[1000] overflow-y-auto">
      {/* Header */}
      <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <div>
          <h2 className="text-gray-900">Area Insights</h2>
          <p className="text-sm text-gray-600">
            {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
          </p>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-5 w-5" />
        </Button>
      </div>

      <div className="p-6 space-y-6">
        {/* Key Metrics */}
        <div className="grid grid-cols-2 gap-3">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Package className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Orders</p>
                  <p className="text-gray-900">{insights.totalOrders.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <DollarSign className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Avg. Order</p>
                  <p className="text-gray-900">${insights.avgOrderValue}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Spending Over Time */}
        <Card>
          <CardHeader>
            <CardTitle>Spending Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="monthly">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="daily">Daily</TabsTrigger>
                <TabsTrigger value="monthly">Monthly</TabsTrigger>
                <TabsTrigger value="yearly">Yearly</TabsTrigger>
              </TabsList>
              <TabsContent value="daily" className="mt-4">
                <div className="space-y-2">
                  {insights.dailySpending.map((day: { day: string; amount: number }, i: number) => (
                    <div key={i} className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">{day.day}</span>
                      <span className="text-gray-900">${day.amount.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </TabsContent>
              <TabsContent value="monthly" className="mt-4">
                <div className="text-center py-8">
                  <p className="text-gray-900">~${insights.monthlySpending.toLocaleString()}</p>
                  <p className="text-sm text-gray-600 mt-1">Average monthly spending</p>
                </div>
              </TabsContent>
              <TabsContent value="yearly" className="mt-4">
                <div className="text-center py-8">
                  <p className="text-gray-900">~${insights.yearlySpending.toLocaleString()}</p>
                  <p className="text-sm text-gray-600 mt-1">Average yearly spending</p>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Most Popular Items */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Most Popular Items
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {insights.popularItems.map((item: { name: string; orders: number; price: number; growth: number }, index: number) => (
                <div key={index} className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                    <span className="text-white text-sm">#{index + 1}</span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="text-gray-900">{item.name}</h4>
                      <Badge variant="secondary">{item.orders} orders</Badge>
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-sm">
                      <span className="text-gray-600">${item.price}</span>
                      <span className="text-green-600 flex items-center gap-1">
                        <TrendingUp className="h-3 w-3" />
                        +{item.growth}%
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Opportunity Score */}
        <Card className="bg-gradient-to-br from-purple-50 to-blue-50 border-purple-200">
          <CardHeader>
            <CardTitle>Opportunity Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className="text-4xl text-purple-600 mb-2">{insights.opportunityScore}/100</div>
              <p className="text-sm text-gray-700">{insights.opportunityMessage}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
