import { NextResponse } from 'next/server'
import { env } from '@/config/env'

export async function GET() {
  // Only allow in development
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Not available in production' }, { status: 403 })
  }

  return NextResponse.json({
    env: {
      NEXT_PUBLIC_KNOT_CLIENT_ID: env.NEXT_PUBLIC_KNOT_CLIENT_ID ? `${env.NEXT_PUBLIC_KNOT_CLIENT_ID.substring(0, 8)}...` : 'missing',
      KNOT_API_SECRET: env.KNOT_API_SECRET ? '***set***' : 'missing',
      KNOT_ENVIRONMENT: env.KNOT_ENVIRONMENT || 'not set',
    },
    processEnv: {
      NEXT_PUBLIC_KNOT_CLIENT_ID: process.env.NEXT_PUBLIC_KNOT_CLIENT_ID ? 'set' : 'not set',
      KNOT_API_SECRET: process.env.KNOT_API_SECRET ? 'set' : 'not set',
      KNOT_ENVIRONMENT: process.env.KNOT_ENVIRONMENT || 'not set',
      NODE_ENV: process.env.NODE_ENV,
    },
  })
}

