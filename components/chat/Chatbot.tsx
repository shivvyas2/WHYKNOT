'use client'

import { useState, useRef, useEffect } from 'react'

export default function Chatbot() {
  const [messages, setMessages] = useState<{ from: 'user' | 'bot'; text: string }[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const listRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    // scroll to bottom when messages change
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight
    }
  }, [messages])

  async function send() {
    const text = input.trim()
    if (!text) return
    setMessages((m) => [...m, { from: 'user', text }])
    setInput('')
    setLoading(true)
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text }),
      })
      const json = await res.json()
      const reply = json?.reply ?? 'Sorry, I could not respond.'
      setMessages((m) => [...m, { from: 'bot', text: reply }])
    } catch {
      setMessages((m) => [...m, { from: 'bot', text: 'Network error' }])
    } finally {
      setLoading(false)
    }
  }

  function onKey(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') send()
  }

  return (
    <div className="max-w-2xl w-full mx-auto h-[640px] flex flex-col border rounded-lg bg-white shadow">
      <div className="p-4 border-b flex items-center justify-between">
        <h3 className="text-lg font-medium">Sous-AI Chat</h3>
        <div className="text-sm text-gray-500">Mock assistant</div>
      </div>
      <div ref={listRef} className="flex-1 overflow-auto p-4 space-y-3">
        {messages.length === 0 && (
          <div className="text-center text-sm text-gray-500">Say hi — ask about restaurants, categories, or the demo.</div>
        )}
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.from === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`${m.from === 'user' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-900'} px-4 py-2 rounded-lg max-w-[80%]`}>{m.text}</div>
          </div>
        ))}
      </div>
      <div className="p-3 border-t flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={onKey}
          placeholder="Type a message..."
          className="flex-1 border rounded px-3 py-2"
        />
        <button onClick={send} disabled={loading} className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-60">
          {loading ? '...' : 'Send'}
        </button>
      </div>
    </div>
  )
}
