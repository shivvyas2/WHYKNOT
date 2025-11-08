export interface BusinessProfile {
  id: string
  userId: string
  businessName: string
  createdAt: string
  updatedAt: string
}

export interface LocationInsight {
  area: string
  zipCode: string
  orderFrequency: number
  popularItems: string[]
  averageOrderValue: number
  peakHours: number[]
  merchantData: {
    doordash: number
    ubereats: number
  }
}

export interface AnalyticsData {
  totalOrders: number
  averageOrderValue: number
  topCategories: Array<{
    category: string
    count: number
  }>
  timeDistribution: Array<{
    hour: number
    orders: number
  }>
}

