import { MerchantType } from '@/lib/constants'

export interface UserOptIn {
  id: string
  userId: string
  merchant: MerchantType
  isActive: boolean
  knotConnectionId: string | null
  createdAt: string
  updatedAt: string
}

export interface Reward {
  id: string
  userId: string
  promoCode: string
  amount: number
  currency: string
  isUsed: boolean
  createdAt: string
  updatedAt: string
}

export interface Deal {
  id: string
  userId: string
  title: string
  description: string
  merchant: MerchantType
  discountPercentage: number | null
  discountAmount: number | null
  isActive: boolean
  createdAt: string
  updatedAt: string
}

