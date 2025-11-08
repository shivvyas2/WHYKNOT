export const siteConfig = {
  name: 'WhyKnot',
  description: 'Connect restaurant owners with location insights through transaction data',
  url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  businessUrl: '/business',
  userUrl: '/user',
  merchants: {
    doordash: 'DoorDash',
    ubereats: 'Uber Eats',
  },
  rewards: {
    initialPromoAmount: 20,
    currency: 'USD',
  },
} as const

