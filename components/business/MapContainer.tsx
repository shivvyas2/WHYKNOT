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
        maxZoom: 15,
        maxBounds: usBounds,
        // Prevent the user from panning far outside the bounds
        maxBoundsViscosity: 0.9,
        zoomControl: false,
      });
    L.control.zoom({ position: 'bottomleft' }).addTo(mapRef.current);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19,
        detectRetina: true,
      }).addTo(mapRef.current);

      // Click handler for map
      mapRef.current.on('click', (e) => {
        onAreaClick({ lat: e.latlng.lat, lng: e.latlng.lng });
      });
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

  return <div id="map" className="w-full h-full" />;
}