'use client'

import { useEffect, useRef, useState } from 'react'
import Lottie from 'lottie-react'

interface SuccessAnimationProps {
  onComplete?: () => void
  duration?: number // Duration in milliseconds before calling onComplete
}

export function SuccessAnimation({ onComplete, duration = 3000 }: SuccessAnimationProps) {
  const animationRef = useRef<any>(null)
  const [animationData, setAnimationData] = useState<any>(null)

  useEffect(() => {
    // Fetch the Lottie animation JSON from public folder
    fetch('/assets/Successful.json')
      .then((res) => res.json())
      .then((data) => setAnimationData(data))
      .catch((err) => console.error('Failed to load animation:', err))
  }, [])

  useEffect(() => {
    if (onComplete && duration > 0) {
      const timer = setTimeout(() => {
        onComplete()
      }, duration)
      return () => clearTimeout(timer)
    }
  }, [onComplete, duration])

  if (!animationData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
        <p className="mt-4 text-gray-600">Loading...</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px]">
      <div className="w-64 h-64">
        <Lottie
          lottieRef={animationRef}
          animationData={animationData}
          loop={false}
          autoplay={true}
        />
      </div>
      <h2 className="text-2xl font-bold text-green-600 mt-4">Successfully Connected!</h2>
      <p className="text-gray-600 mt-2">Your account has been linked successfully.</p>
    </div>
  )
}

