export const MERCHANTS = {
  DOORDASH: 'doordash',
  UBER_EATS: 'ubereats',
} as const

export type MerchantType = typeof MERCHANTS[keyof typeof MERCHANTS]

export const MERCHANT_DISPLAY_NAMES: Record<string, string> = {
  [MERCHANTS.DOORDASH]: 'DoorDash',
  [MERCHANTS.UBER_EATS]: 'Uber Eats',
}

/**
 * Knot's numeric merchant ids. Both the Link SDK (`merchantIds`) and the
 * Transaction Sync API (`merchant_id`) address merchants by number, not slug.
 */
export const KNOT_MERCHANT_IDS: Record<string, number> = {
  [MERCHANTS.DOORDASH]: 19,
  [MERCHANTS.UBER_EATS]: 36,
}

export const REWARD_AMOUNT = 20
export const REWARD_CURRENCY = 'USD'

