// Leaflet setup import CSS and fix default marker icon paths so they work with Vite bundling
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Vite needs  image assets imported 
// Import marker images from leaflet package and point Leaflet's default icon to them
import markerUrl from 'leaflet/dist/images/marker-icon.png';
import markerRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png';
import shadowUrl from 'leaflet/dist/images/marker-shadow.png';

// Apply default icon options
delete (L.Icon.Default.prototype as any)._getIconUrl; // ensure prototype is clean
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerRetinaUrl,
  iconUrl: markerUrl,
  shadowUrl: shadowUrl,
});

export {};
