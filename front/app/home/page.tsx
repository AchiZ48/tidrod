'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import Sidebar from '@/components/Sidebar';

const MapComponent = dynamic(() => import('@/components/Map'), {
  ssr: false,
  loading: () => <div className="w-full h-full bg-gray-200 dark:bg-gray-800 animate-pulse flex items-center justify-center text-gray-400 text-sm">Loading Map...</div>
});

interface MarkerData {
  lat: number;
  lon: number;
  label?: string;
  color?: string;
}

interface TripData {
  destination: string;
  date: string;
  timeOption: 'flexible' | 'specific';
  specificTime: string;
  lat: number | null;
  lon: number | null;
  locationName: string;
  privacy: 'open' | 'private';
}

export default function HomePage() {
  const [markers, setMarkers] = useState<MarkerData[]>([]);
  const [selectionMode, setSelectionMode] = useState(false);

  // Location being selected on the map (for Step 3)
  const [pendingLocationName, setPendingLocationName] = useState('');
  const [pendingLat, setPendingLat] = useState<number | null>(null);
  const [pendingLon, setPendingLon] = useState<number | null>(null);

  // Enter map selection mode (Step 3 pin drop)
  const handleLocationSelectRequest = () => {
    setSelectionMode(true);
  };

  // When user searches and selects a location in Step 3
  const handleLocationSearch = (lat: number, lon: number, name: string) => {
    setPendingLocationName(name);
    setPendingLat(lat);
    setPendingLon(lon);
    // Also place a marker on the map for preview
    setMarkers(prev => {
      const others = prev.filter(m => m.label !== 'Preview');
      return [...others, { lat, lon, label: 'Preview', color: '#3B82F6' }];
    });
  };

  // Called when user drags pin on map
  const handleMapLocationSelect = (lat: number, lon: number) => {
    const name = `Selected (${lat.toFixed(4)}, ${lon.toFixed(4)})`;
    setPendingLocationName(name);
    setPendingLat(lat);
    setPendingLon(lon);
  };

  // Confirm location from map selection
  const handleConfirmSelection = () => {
    if (pendingLat != null && pendingLon != null) {
      // Remove preview marker
      setMarkers(prev => prev.filter(m => m.label !== 'Preview'));
    }
    setSelectionMode(false);
  };

  // Cancel map selection
  const handleCancelSelection = () => {
    setPendingLocationName('');
    setPendingLat(null);
    setPendingLon(null);
    setMarkers(prev => prev.filter(m => m.label !== 'Preview'));
    setSelectionMode(false);
  };

  // Add trip pin to map
  const handleAddTrip = (trip: TripData) => {
    if (trip.lat != null && trip.lon != null) {
      const timeLabel = trip.timeOption === 'specific' ? trip.specificTime : 'Flexible';
      const privacyLabel = trip.privacy === 'open' ? '🌍 Open' : '🔒 Private';
      setMarkers(prev => {
        const others = prev.filter(m => m.label !== 'Preview');
        return [
          ...others,
          {
            lat: trip.lat!,
            lon: trip.lon!,
            label: `📌 ${trip.destination}\n📅 ${trip.date} ${timeLabel}\n${privacyLabel}`,
            color: '#8B5CF6',
          },
        ];
      });
    }
    // Clear pending
    setPendingLocationName('');
    setPendingLat(null);
    setPendingLon(null);
  };

  return (
    <main className="flex flex-col lg:flex-row flex-1 w-full bg-gray-50 dark:bg-gray-900 p-4 pt-0 gap-4 overflow-hidden pt-22">
      {/* Sidebar Area */}
      <section className="w-full lg:w-auto flex-none z-10">
        <Sidebar
          onLocationSelectRequest={handleLocationSelectRequest}
          onLocationSearch={handleLocationSearch}
          onAddTrip={handleAddTrip}
          selectedLocationName={pendingLocationName}
          selectedLat={pendingLat}
          selectedLon={pendingLon}
          selectionMode={selectionMode}
          onConfirmSelection={handleConfirmSelection}
          onCancelSelection={handleCancelSelection}
        />
      </section>

      {/* Map Area */}
      <section className="flex-1 w-full h-full rounded-xl overflow-hidden shadow-2xl border border-gray-200 dark:border-gray-700 relative z-0">
        <MapComponent
          markers={markers}
          selectionMode={selectionMode ? 'destination' : null}
          onLocationSelect={handleMapLocationSelect}
        />

        {/* Helper Overlay when in Selection Mode */}
        {selectionMode && (
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white px-4 py-2 rounded-full shadow-lg z-20 font-medium animate-bounce">
            Drag the pin to select location
          </div>
        )}

        {!selectionMode && (
          <div className="absolute top-4 left-4 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm p-3 rounded-lg shadow-lg z-10 pointer-events-none">
            <h1 className="text-sm font-bold text-gray-800 dark:text-white">TidRod Map View</h1>
            <p className="text-xs text-gray-500">Create trips to see them on the map</p>
          </div>
        )}
      </section>
    </main>
  );
}
