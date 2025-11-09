import { NextResponse } from 'next/server'
import { env } from '@/config/env'

export async function GET() {
  // Allow in production but with limited info for security
  const isProduction = process.env.NODE_ENV === 'production'
  
  try {
    const envCheck = {
      env: {
        NEXT_PUBLIC_KNOT_CLIENT_ID: env.NEXT_PUBLIC_KNOT_CLIENT_ID ? `${env.NEXT_PUBLIC_KNOT_CLIENT_ID.substring(0, 8)}...` : 'missing',
        KNOT_API_SECRET: env.KNOT_API_SECRET ? '***set***' : 'missing',
        KNOT_ENVIRONMENT: env.KNOT_ENVIRONMENT || 'not set',
        NEXT_PUBLIC_APP_URL: env.NEXT_PUBLIC_APP_URL || 'not set',
      },
      processEnv: {
        NEXT_PUBLIC_KNOT_CLIENT_ID: process.env.NEXT_PUBLIC_KNOT_CLIENT_ID ? `${process.env.NEXT_PUBLIC_KNOT_CLIENT_ID.substring(0, 8)}...` : 'not set',
        KNOT_API_SECRET: process.env.KNOT_API_SECRET ? '***set***' : 'not set',
        KNOT_ENVIRONMENT: process.env.KNOT_ENVIRONMENT || 'not set',
        NODE_ENV: process.env.NODE_ENV,
      },
      // Check if env object loaded successfully
      envObjectLoaded: typeof env !== 'undefined',
      // Common issues checklist
      issues: [] as string[],
    }

    // Check for common issues
    if (!env.NEXT_PUBLIC_KNOT_CLIENT_ID && !process.env.NEXT_PUBLIC_KNOT_CLIENT_ID) {
      envCheck.issues.push('NEXT_PUBLIC_KNOT_CLIENT_ID is missing')
    }
    if (!env.KNOT_API_SECRET && !process.env.KNOT_API_SECRET) {
      envCheck.issues.push('KNOT_API_SECRET is missing')
    }
    if (!env.KNOT_ENVIRONMENT && !process.env.KNOT_ENVIRONMENT) {
      envCheck.issues.push('KNOT_ENVIRONMENT is not set (will default to development)')
    }

    return NextResponse.json({
      ...envCheck,
      message: isProduction 
        ? 'Debug endpoint - check issues array for problems'
        : 'Full debug info available',
    })
  } catch (error) {
    return NextResponse.json({
      error: 'Failed to check environment',
      message: error instanceof Error ? error.message : 'Unknown error',
      envObjectFailed: true,
    }, { status: 500 })
  }
}

