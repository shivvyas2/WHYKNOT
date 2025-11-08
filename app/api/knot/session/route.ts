export const dynamic = 'force-dynamic'

import { getAuthUser } from '@/lib/auth/utils'
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { env } from '@/config/env'

export async function POST(request: Request) {
  try {
    console.log('Session API called')
    
    // In mock mode, create a mock user
    const MOCK_MODE = process.env.MOCK_MODE === 'true' || process.env.NODE_ENV === 'development'
    console.log('MOCK_MODE:', MOCK_MODE)
    
    let user
    try {
      if (MOCK_MODE) {
        // Create a mock user for development
        user = {
          id: 'mock-user-id-' + Date.now(),
          email: 'mock@example.com',
        }
        console.log('Using mock user:', user.id)
      } else {
        user = await getAuthUser()
        if (!user) {
          return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }
        console.log('Authenticated user:', user.id)
      }
    } catch (error) {
      console.error('Error getting user:', error)
      return NextResponse.json(
        { 
          error: 'Failed to get user', 
          message: error instanceof Error ? error.message : 'Unknown error',
          details: process.env.NODE_ENV === 'development' ? String(error) : undefined,
        },
        { status: 500 }
      )
    }

    let body
    try {
      body = await request.json()
    } catch (error) {
      console.error('Error parsing request body:', error)
      return NextResponse.json(
        { error: 'Invalid request body', message: error instanceof Error ? error.message : 'Unknown error' },
        { status: 400 }
      )
    }
    
    const { merchantIds } = body
    console.log('Merchant IDs:', merchantIds)

    // Get or create user in database
    let dbUser
    try {
      if (MOCK_MODE) {
        // In mock mode, create a mock db user
        dbUser = {
          id: user.id,
          email: user.email || '',
          role: 'user',
        }
      } else {
        const supabase = await createClient()
        const { data: existingUser } = await supabase
          .from('users')
          .select('*')
          .eq('id', user.id)
          .single()

        if (!existingUser) {
          const { data: newUser, error: userError } = await supabase
            .from('users')
            .insert({
              id: user.id,
              email: user.email || '',
              role: 'user',
            })
            .select()
            .single()

          if (userError) {
            console.error('Error creating user:', userError)
            throw userError
          }
          dbUser = newUser
        } else {
          dbUser = existingUser
        }
      }
    } catch (error) {
      console.error('Error getting/creating db user:', error)
      return NextResponse.json(
        { 
          error: 'Failed to get/create user in database', 
          message: error instanceof Error ? error.message : 'Unknown error',
          details: process.env.NODE_ENV === 'development' ? String(error) : undefined,
        },
        { status: 500 }
      )
    }

    // Create a Knot session via their API
    // This requires calling Knot's Create Session endpoint
    let knotClientId: string | undefined
    let knotApiSecret: string | undefined
    
    try {
      knotClientId = env.NEXT_PUBLIC_KNOT_CLIENT_ID
      knotApiSecret = env.KNOT_API_SECRET
    } catch (error) {
      console.error('Error accessing env variables:', error)
      return NextResponse.json(
        { 
          error: 'Failed to access environment variables', 
          message: error instanceof Error ? error.message : 'Unknown error',
          details: process.env.NODE_ENV === 'development' ? String(error) : undefined,
        },
        { status: 500 }
      )
    }

    console.log('Knot credentials check:', {
      hasClientId: !!knotClientId,
      hasSecret: !!knotApiSecret,
      clientIdLength: knotClientId?.length || 0,
      secretLength: knotApiSecret?.length || 0,
      clientIdPreview: knotClientId ? `${knotClientId.substring(0, 8)}...` : 'missing',
    })

    if (!knotClientId || !knotApiSecret) {
      console.error('Missing Knot credentials:', {
        clientId: knotClientId ? 'present' : 'missing',
        secret: knotApiSecret ? 'present' : 'missing',
        envCheck: {
          NEXT_PUBLIC_KNOT_CLIENT_ID: process.env.NEXT_PUBLIC_KNOT_CLIENT_ID ? 'set' : 'not set',
          KNOT_API_SECRET: process.env.KNOT_API_SECRET ? 'set' : 'not set',
        },
      })
      return NextResponse.json(
        { 
          error: 'Knot API credentials not configured',
          details: process.env.NODE_ENV === 'development' ? {
            clientIdSet: !!process.env.NEXT_PUBLIC_KNOT_CLIENT_ID,
            secretSet: !!process.env.KNOT_API_SECRET,
          } : undefined,
        },
        { status: 500 }
      )
    }

    // Create Basic Auth header
    const authString = Buffer.from(`${knotClientId}:${knotApiSecret}`).toString('base64')
    const authHeader = `Basic ${authString}`

    // Determine environment URL
    const environment = env.KNOT_ENVIRONMENT || 'development'
    const baseUrl = environment === 'production' 
      ? 'https://knotapi.com' 
      : 'https://development.knotapi.com'

    console.log('Calling Knot API:', {
      baseUrl,
      environment,
      externalUserId: dbUser.id,
      merchantIds,
    })

    // Call Knot's Create Session API
    let knotResponse
    try {
      knotResponse = await fetch(`${baseUrl}/session/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': authHeader,
        },
        body: JSON.stringify({
          type: 'transaction_link',
          external_user_id: dbUser.id,
          merchant_ids: merchantIds || [],
        }),
      })
    } catch (error) {
      console.error('Error calling Knot API:', error)
      return NextResponse.json(
        { 
          error: 'Failed to call Knot API', 
          message: error instanceof Error ? error.message : 'Unknown error',
          details: process.env.NODE_ENV === 'development' ? String(error) : undefined,
        },
        { status: 500 }
      )
    }

    if (!knotResponse.ok) {
      let errorData
      try {
        errorData = await knotResponse.json()
      } catch {
        errorData = { message: await knotResponse.text() }
      }
      console.error('Knot session creation error:', {
        status: knotResponse.status,
        statusText: knotResponse.statusText,
        error: errorData,
      })
      return NextResponse.json(
        { 
          error: 'Failed to create Knot session', 
          details: errorData,
          status: knotResponse.status,
        },
        { status: knotResponse.status }
      )
    }

    const sessionData = await knotResponse.json()
    console.log('Knot session created successfully:', { sessionId: sessionData.session })

    // Knot API returns { session: "session-id" }
    if (!sessionData.session) {
      console.error('Invalid session response:', sessionData)
      return NextResponse.json(
        { error: 'Invalid session response from Knot API', details: sessionData },
        { status: 500 }
      )
    }

    return NextResponse.json({
      sessionId: sessionData.session,
      clientId: knotClientId,
    })
  } catch (error) {
    console.error('Session creation error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    const errorStack = error instanceof Error ? error.stack : undefined
    const errorName = error instanceof Error ? error.name : 'Error'
    
    // In development, return detailed error information
    const isDevelopment = process.env.NODE_ENV === 'development'
    
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: errorMessage,
        name: errorName,
        ...(isDevelopment && { 
          stack: errorStack,
          // Include full error object in development
          details: error instanceof Error ? {
            name: error.name,
            message: error.message,
            stack: error.stack,
          } : String(error),
        }),
      },
      { status: 500 }
    )
  }
}

