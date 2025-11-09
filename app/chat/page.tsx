import Link from 'next/link'
import Chatbot from '@/components/chat/Chatbot'

export default function ChatPage() {
  return (
    <main className="min-h-screen p-8 bg-[#f6f9ff]">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-semibold">Chat with Sous-AI</h1>
          <Link href="/" className="text-sm text-gray-600 underline">Back</Link>
        </div>

        <Chatbot />
      </div>
    </main>
  )
}
