'use client'

import { MERCHANTS, MERCHANT_DISPLAY_NAMES, type MerchantType } from '@/lib/constants'

interface MerchantSelectorProps {
  selectedMerchants: MerchantType[]
  onToggle: (merchant: MerchantType) => void
}

export function MerchantSelector({
  selectedMerchants,
  onToggle,
}: MerchantSelectorProps) {
  return (
    <div className="space-y-4">
      {Object.entries(MERCHANTS).map(([key, value]) => (
        <label
          key={value}
          className="flex items-center p-4 border rounded-lg cursor-pointer hover:bg-gray-50"
        >
          <input
            type="checkbox"
            checked={selectedMerchants.includes(value)}
            onChange={() => onToggle(value)}
            className="w-5 h-5 text-blue-600 rounded"
          />
          <span className="ml-3 text-lg font-medium">
            {MERCHANT_DISPLAY_NAMES[value]}
          </span>
        </label>
      ))}
    </div>
  )
}

