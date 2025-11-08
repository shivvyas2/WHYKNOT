'use client'

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface CategoryDropdownProps {
  value: string;
  onChange: (value: string) => void;
}

const CATEGORIES = [
  { value: 'all', label: 'All Cuisines' },
  { value: 'mexican', label: 'Mexican' },
  { value: 'indian', label: 'Indian' },
  { value: 'italian', label: 'Italian' },
  { value: 'chinese', label: 'Chinese' },
  { value: 'japanese', label: 'Japanese' },
  { value: 'thai', label: 'Thai' },
  { value: 'american', label: 'American' },
  { value: 'mediterranean', label: 'Mediterranean' },
];

export function CategoryDropdown({ value, onChange }: CategoryDropdownProps) {
  return (
    <div className="w-64">
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="bg-white shadow-lg border-gray-300">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {CATEGORIES.map((cat) => (
            <SelectItem key={cat.value} value={cat.value}>
              {cat.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
