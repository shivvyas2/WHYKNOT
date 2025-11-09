export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { env } from '@/config/env'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { session_id } = body

    if (!session_id) {
      return NextResponse.json(
        { error: 'session_id is required' },
        { status: 400 }
      )
    }

    // Get Knot API credentials
    const knotClientId = env.NEXT_PUBLIC_KNOT_CLIENT_ID
    const knotApiSecret = env.KNOT_API_SECRET

    if (!knotClientId || !knotApiSecret) {
      return NextResponse.json(
        { error: 'Knot API credentials not configured' },
        { status: 500 }
      )
    }

    // Create Basic Auth header
    const authString = Buffer.from(`${knotClientId}:${knotApiSecret}`).toString('base64')
    const authHeader = `Basic ${authString}`

    // Determine environment URL
    const environment = env.KNOT_ENVIRONMENT || 'development'
    const baseUrl = environment === 'production' 
      ? 'https://production.knotapi.com'
      : 'https://development.knotapi.com'

    // Call Knot's Session Extend API
    const extendResponse = await fetch(`${baseUrl}/session/extend`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authHeader,
      },
      body: JSON.stringify({
        session_id,
      }),
    })

    if (!extendResponse.ok) {
      let errorData
      try {
        const textData = await extendResponse.text()
        try {
          errorData = JSON.parse(textData)
        } catch {
          errorData = { message: textData }
        }
      } catch (textError) {
        errorData = { 
          message: `Failed to read error response: ${textError instanceof Error ? textError.message : 'Unknown error'}`,
          status: extendResponse.status,
          statusText: extendResponse.statusText,
        }
      }
      console.error('Knot session extend error:', errorData)
      return NextResponse.json(
        { error: 'Failed to extend session', details: errorData },
        { status: extendResponse.status }
      )
    }

    const extendData = await extendResponse.json()
    return NextResponse.json(extendData)
  } catch (error) {
    console.error('Session extend error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

