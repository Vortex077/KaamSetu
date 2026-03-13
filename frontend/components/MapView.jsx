'use client';

export default function MapView({ center, markers, zoom = 13 }) {
  // Leaflet requires dynamic import (no SSR)
  // This is a placeholder — full implementation uses react-leaflet
  return (
    <div className="w-full h-64 bg-gray-100 rounded-xl border-2 border-dashed border-gray-300 flex items-center justify-center">
      <div className="text-center text-gray-400">
        <span className="text-3xl">🗺️</span>
        <p className="text-sm mt-2">Map View</p>
        <p className="text-xs">Leaflet map will render here</p>
        {center && <p className="text-xs mt-1">{center[0].toFixed(4)}, {center[1].toFixed(4)}</p>}
      </div>
    </div>
  );
}
