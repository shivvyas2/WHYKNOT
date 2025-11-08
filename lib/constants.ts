export const MERCHANTS = {
  DOORDASH: 'doordash',
  UBER_EATS: 'ubereats',
} as const

export type MerchantType = typeof MERCHANTS[keyof typeof MERCHANTS]

export const MERCHANT_DISPLAY_NAMES: Record<MerchantType, string> = {
  [MERCHANTS.DOORDASH]: 'DoorDash',
  [MERCHANTS.UBER_EATS]: 'Uber Eats',
}

export const REWARD_AMOUNT = 20
export const REWARD_CURRENCY = 'USD'

