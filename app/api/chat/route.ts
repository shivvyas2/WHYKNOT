import { NextResponse } from 'next/server'
import { env } from '@/config/env'

export const runtime = 'nodejs'

export async function POST(req: Request) {
  try {
    const { message } = await req.json()
    const text = (message || '').toString().trim()

    if (!text || text.length === 0) {
      return NextResponse.json({ reply: 'Please ask me a question about restaurants or orders.' })
    }

    // Call the semantic search backend API
    const backendUrl = env.RESTAURANT_STATS_API_URL || 'http://localhost:8000'
    const apiUrl = `${backendUrl}/api/semantic-search/query`

    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: text,
          max_results: 5,
          // model and temperature use defaults from backend
        }),
      })

      if (!response.ok) {
        throw new Error(`Backend API returned ${response.status}`)
      }

      const data = await response.json()
      
      // Extract the answer from the semantic search response
      const reply = data?.answer || "I couldn't find relevant information. Try asking about restaurants, orders, or popular items."

      return NextResponse.json({ reply })
    } catch (fetchError) {
      console.error('Error calling semantic search API:', fetchError)
      
      // Fallback to a helpful error message
      return NextResponse.json({ 
        reply: 'I\'m having trouble connecting to the backend service. Please make sure the Restaurant Stats API is running.' 
      })
    }
  } catch (err) {
    console.error('chat route error', err)
    return NextResponse.json({ 
      reply: 'An error occurred while processing your request. Please try again.' 
    }, { status: 500 })
  }
}
