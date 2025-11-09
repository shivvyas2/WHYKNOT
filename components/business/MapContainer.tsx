'use client'

import { useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import 'leaflet.heat'
import { generateHeatmapData } from '@/utils/mockData'

// Fix Leaflet default icon paths for Next.js - will be set in useEffect

interface MapContainerProps {
  center: [number, number];
  category: string;
  onAreaClick: (location: { lat: number; lng: number }) => void;
}

export function MapContainer({ center, category, onAreaClick }: MapContainerProps) {
  const mapRef = useRef<L.Map | null>(null);
  const heatLayerRef = useRef<any>(null);
  const restaurantMarkersRef = useRef<L.Marker<any>[]>([]);
  const fetchTimerRef = useRef<number | null>(null);
  const categoryRef = useRef(category);
  const minZoomForRestaurants = 10;
  const cuisineFetchAbortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return
    
    // Fix Leaflet default icon paths
    delete (L.Icon.Default.prototype as any)._getIconUrl
    L.Icon.Default.mergeOptions({
      iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
      iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    })

    if (!mapRef.current) {
      // United States bounds only 
      const usSouthWest = L.latLng(24.396308, -124.848974); // lat, lng
      const usNorthEast = L.latLng(49.384358, -66.885444);
      const usBounds = L.latLngBounds(usSouthWest, usNorthEast);

      mapRef.current = L.map('map', {
        center,
        zoom: 13,
        minZoom: 3,
        maxZoom: 30,
        maxBounds: usBounds,
        // Prevent the user from panning far outside the bounds
        maxBoundsViscosity: 0.9,
        zoomControl: false,
      });
    L.control.zoom({ position: 'bottomleft' }).addTo(mapRef.current);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 30,
        detectRetina: true,
      }).addTo(mapRef.current);

      // Click handler for map
      mapRef.current.on('click', (e) => {
        onAreaClick({ lat: e.latlng.lat, lng: e.latlng.lng });
      });

      // Fetch restaurants for visible bounds after movement (debounced)
      const scheduleFetch = () => {
        if (!mapRef.current) return;
        if (fetchTimerRef.current) {
          window.clearTimeout(fetchTimerRef.current);
        }
        // debounce 600ms
        fetchTimerRef.current = window.setTimeout(() => {
          fetchRestaurantsForView();
        }, 600) as unknown as number;
      };

      mapRef.current.on('moveend', scheduleFetch);
      // initial fetch
      scheduleFetch();
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // Update center
  useEffect(() => {
    if (mapRef.current) {
      mapRef.current.setView(center, 13);
    }
  }, [center]);

  useEffect(() => {
    categoryRef.current = category
    if (mapRef.current) {
      // immediately refresh markers when cuisine changes
      fetchRestaurantsForView(true)
    }
  }, [category])

  // Update heatmap based on category
  useEffect(() => {
    if (mapRef.current) {
      if (heatLayerRef.current) {
        mapRef.current.removeLayer(heatLayerRef.current);
      }

      const heatmapData = generateHeatmapData(center, category);

      heatLayerRef.current = (L as any).heatLayer(heatmapData, {
        radius: 25,
        blur: 15,
        maxZoom: 17,
        max: 1.0,
        gradient: {
          0.0: '#0000ff',
          0.25: '#00bfffff',
          0.5: '#ffff00',
          0.75: '#ff8c00',
          1.0: '#ff0000'
        }
      }).addTo(mapRef.current);
    }
  }, [center, category]);

  const CUISINE_PRESETS: Record<
    string,
    { regex: string | null; keywords: string[]; nameKeywords?: string[] }
  > = {
    all: { regex: null, keywords: [] },
    mexican: { regex: 'mexican|taco', keywords: ['mexican', 'taco'] },
    indian: { regex: 'indian', keywords: ['indian'] },
    italian: { regex: 'italian|pizza|pasta', keywords: ['italian', 'pizza', 'pasta'] },
    chinese: { regex: 'chinese|szechuan|szechwan', keywords: ['chinese', 'szechuan', 'szechwan'] },
    japanese: { regex: 'japanese|sushi|ramen|izakaya', keywords: ['japanese', 'sushi', 'ramen', 'izakaya'] },
    thai: { regex: 'thai', keywords: ['thai'] },
    american: {
      regex: 'american|burger|bbq|steakhouse|diner',
      keywords: ['american', 'burger', 'bbq', 'steakhouse', 'diner'],
    },
    mediterranean: {
      regex: 'mediterranean|greek|lebanese|turkish|mezze|falafel',
      keywords: ['mediterranean', 'greek', 'lebanese', 'turkish', 'mezze', 'falafel', 'middle eastern'],
    },
  }

  // Build query to fetch restaurants within current map bounds using Overpass API
  function buildOverpassBBoxQuery(south: number, west: number, north: number, east: number) {
    // Overpass uses (south,west,north,east)
    const activeCategory = categoryRef.current ?? 'all'
    const preset = CUISINE_PRESETS[activeCategory] ?? CUISINE_PRESETS.all
    const cuisineClause = preset.regex ? `["cuisine"~"${preset.regex}", i]` : ''
    return `
      [out:json][timeout:25];
      node["amenity"="restaurant"]${cuisineClause}(${south},${west},${north},${east});
      out body;
    `;
  }

  function matchesCuisineTag(value: unknown, categoryValue: string) {
    if (!categoryValue || categoryValue === 'all') return true
    if (typeof value !== 'string') return false
    const normalized = value
      .split(';')
      .map((part) => part.trim().toLowerCase())
      .filter(Boolean)

    if (normalized.length === 0) return false

    const keywords = (CUISINE_PRESETS[categoryValue] ?? CUISINE_PRESETS.all).keywords

    return normalized.some((valuePart) =>
      keywords.some((keyword) => valuePart.includes(keyword)),
    )
  }

  async function fetchRestaurantsForView(force = false) {
    if (!mapRef.current) return;
    const z = mapRef.current.getZoom();
    if (!force && z < minZoomForRestaurants) {
      // remove existing markers if zoomed out
      restaurantMarkersRef.current.forEach((m) => mapRef.current?.removeLayer(m));
      restaurantMarkersRef.current = [];
      return;
    }

    const bounds = mapRef.current.getBounds();
    const south = bounds.getSouth();
    const west = bounds.getWest();
    const north = bounds.getNorth();
    const east = bounds.getEast();

    const query = buildOverpassBBoxQuery(south, west, north, east);
    const url = `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`;

    if (cuisineFetchAbortRef.current) {
      cuisineFetchAbortRef.current.abort()
    }
    const abortController = new AbortController()
    cuisineFetchAbortRef.current = abortController

    try {
      const res = await fetch(url, { signal: abortController.signal });
      if (!res.ok) throw new Error(`Overpass error ${res.status}`);
      const data = await res.json();

      // clear existing markers
      restaurantMarkersRef.current.forEach((m) => mapRef.current?.removeLayer(m));
      restaurantMarkersRef.current = [];

      if (!data.elements || !Array.isArray(data.elements)) return;

      // limit number of markers to avoid overload
      const activeCategory = categoryRef.current ?? 'all'
      const preset = CUISINE_PRESETS[activeCategory] ?? CUISINE_PRESETS.all
      const nodes = data.elements.filter((el: any) => {
        if (el.type !== 'node') return false
        if (activeCategory === 'all') return true
        if (matchesCuisineTag(el.tags?.cuisine, activeCategory)) return true
        if (typeof el.tags?.['name'] === 'string') {
          const name = el.tags['name'].toLowerCase()
          return preset.keywords.some((keyword) => name.includes(keyword))
        }
        return false
      });
      const max = 300;
      for (let i = 0; i < Math.min(nodes.length, max); i++) {
        const node = nodes[i];
        if (typeof node.lat !== 'number' || typeof node.lon !== 'number') continue;
        const lat = node.lat;
        const lng = node.lon;
        const name = node.tags?.name ?? 'Restaurant';

        const marker = L.marker([lat, lng]);
        marker.bindPopup(`<strong>${escapeHtml(String(name))}</strong>`);
        marker.on('click', () => onAreaClick({ lat, lng }));
        marker.addTo(mapRef.current!);
        restaurantMarkersRef.current.push(marker);
      }
    } catch (err) {
      if ((err as DOMException).name === 'AbortError') {
        return;
      }
      console.warn('Failed to fetch restaurants', err);
    } finally {
      if (cuisineFetchAbortRef.current === abortController) {
        cuisineFetchAbortRef.current = null;
      }
    }
  }
//clean restuarant names before displaying with leaflet
  function escapeHtml(str: string) {
    return str.replace(/[&<>"']/g, (s) => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    } as any)[s]);
  }

  return <div id="map" className="w-full h-full" />;
}