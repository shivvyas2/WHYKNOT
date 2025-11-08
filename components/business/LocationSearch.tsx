'use client'

import { useState } from 'react'
import { Search, MapPin } from 'lucide-react'
import { Input } from '@/components/ui/input'

interface LocationSearchProps {
  onLocationSelect: (coords: [number, number]) => void;
}

const CITIES = [
  { name: 'New York City', coords: [40.7128, -74.0060] as [number, number] },
  { name: 'Los Angeles', coords: [34.0522, -118.2437] as [number, number] },
  { name: 'Chicago', coords: [41.8781, -87.6298] as [number, number] },
  { name: 'San Francisco', coords: [37.7749, -122.4194] as [number, number] },
  { name: 'Austin', coords: [30.2672, -97.7431] as [number, number] },
  { name: 'Miami', coords: [25.7617, -80.1918] as [number, number] },
];

export function LocationSearch({ onLocationSelect }: LocationSearchProps) {
  const [query, setQuery] = useState('');
  const [showResults, setShowResults] = useState(false);

  const filteredCities = CITIES.filter(city =>
    city.name.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="relative">
      <div className="relative w-80">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Search location..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setShowResults(true);
          }}
          onFocus={() => setShowResults(true)}
          className="pl-10 bg-white shadow-lg border-gray-300"
        />
      </div>

      {showResults && query && (
        <div className="absolute top-full mt-2 w-full bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
          {filteredCities.length > 0 ? (
            filteredCities.map((city) => (
              <button
                key={city.name}
                onClick={() => {
                  onLocationSelect(city.coords);
                  setQuery(city.name);
                  setShowResults(false);
                }}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left"
              >
                <MapPin className="h-4 w-4 text-gray-400" />
                <span className="text-gray-900">{city.name}</span>
              </button>
            ))
          ) : (
            <div className="px-4 py-3 text-gray-500 text-sm">No locations found</div>
          )}
        </div>
      )}
    </div>
  );
}
