//mock implementation need rag 

import { NextResponse } from 'next/server'

export const runtime = 'nodejs'

export async function POST(req: Request) {
  try {
    const { message } = await req.json()
    const text = (message || '').toString().toLowerCase()

    // Simple canned responses for demo. Keep logic server-side so client can be dumb.
    let reply = "Sorry, I don't know that yet. Try asking about categories or the demo."

    if (!text || text.trim().length === 0) {
      reply = 'Say something and I will respond.'
    } else if (text.includes('hello') || text.includes('hi')) {
      reply = 'Hi — I can show demo info about restaurants and categories. Ask me something like "show mexican restaurants".'
    } else if (text.includes('mexican')) {
      reply = 'Mexican restaurants typically show tacos, burritos, bowls. Try clicking the Mexican category on the map.'
    } else if (text.includes('how many') || text.includes('orders')) {
      reply = 'This demo uses deterministic mock data. Click a location to see area insights (orders, avg order value, opportunity score).'
    } else if (text.includes('photo') || text.includes('image')) {
      reply = 'The app can fetch photos from Google Places for a marker when available — enabled in the demo via a server proxy.'
    } else if (text.includes('thanks') || text.includes('thank')) {
      reply = "You're welcome — happy to help!"
    } else {
      // basic echo with prefix
      reply = `You said: "${String(message)}" — this is a demo bot.`
    }

    return NextResponse.json({ reply })
  } catch (err) {
    console.error('chat route error', err)
    return NextResponse.json({ error: 'internal' }, { status: 500 })
  }
}
