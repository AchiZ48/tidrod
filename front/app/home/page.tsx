'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import Sidebar from '@/components/Sidebar';
import { getMarkers, getToken } from '@/lib/api';
import { MarkerData } from '@/components/Map';

const MapComponent = dynamic(() => import('@/components/Map'), {
  ssr: false,
  loading: () => <div className="w-full h-full bg-[#EAEFEF] animate-pulse flex items-center justify-center text-[#BFC9D1] text-sm">Loading Map...</div>
});

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
  const router = useRouter();
  const [markers, setMarkers] = useState<MarkerData[]>([]);
  const [selectionMode, setSelectionMode] = useState(false);

  // Location being selected on the map (for Step 3)
  const [pendingLocationName, setPendingLocationName] = useState('');
  const [pendingLat, setPendingLat] = useState<number | null>(null);
  const [pendingLon, setPendingLon] = useState<number | null>(null);

  // Viewport-based marker loading
  const handleMapMove = useCallback(async (bounds: { west: number; south: number; east: number; north: number }) => {
    if (selectionMode) return; // Don't reload markers while selecting
    try {
      const serverMarkers = await getMarkers(bounds);
      setMarkers(
        serverMarkers.map((m: any) => ({
          id: m.id,
          lat: m.latitude,
          lon: m.longitude,
          label: m.title,
          color: '#FF9B51',
        }))
      );
    } catch (err) {
      console.error('Failed to load markers:', err);
    }
  }, [selectionMode]);

  // Navigate to trip detail on marker click
  const handleMarkerClick = useCallback((markerId: string) => {
    router.push(`/trip/${markerId}`);
  }, [router]);

  // Enter map selection mode (Step 3 pin drop)
  const handleLocationSelectRequest = () => {
    setSelectionMode(true);
  };

  // When user searches and selects a location in Step 3
  const handleLocationSearch = (lat: number, lon: number, name: string) => {
    setPendingLocationName(name);
    setPendingLat(lat);
    setPendingLon(lon);
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
    setSelectionMode(false);
  };

  // Cancel map selection
  const handleCancelSelection = () => {
    setPendingLocationName('');
    setPendingLat(null);
    setPendingLon(null);
    setSelectionMode(false);
  };

  // Add trip — now refreshes markers after creation
  const handleAddTrip = (trip: TripData) => {
    // Clear pending
    setPendingLocationName('');
    setPendingLat(null);
    setPendingLon(null);
    // Trigger a marker reload by a slight delay
    setTimeout(() => {
      // Re-fetch markers by triggering map move
      const mapEl = document.querySelector('.maplibregl-canvas') as HTMLElement;
      if (mapEl) mapEl.click(); // triggers moveend
    }, 500);
  };

  return (
    <main className="flex flex-col lg:flex-row flex-1 w-full bg-[#EAEFEF] p-4 pt-0 gap-4 overflow-hidden pt-22">
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
      <section className="flex-1 w-full h-full rounded-xl overflow-hidden shadow-2xl border border-[#BFC9D1]/30 relative z-0">
        <MapComponent
          markers={markers}
          selectionMode={selectionMode ? 'destination' : null}
          onLocationSelect={handleMapLocationSelect}
          onMapMove={handleMapMove}
          onMarkerClick={handleMarkerClick}
        />

        {/* Helper Overlay when in Selection Mode */}
        {selectionMode && (
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-[#FF9B51] text-white px-5 py-2.5 rounded-full shadow-lg z-20 font-semibold text-sm animate-bounce">
            📍 Drag the pin to select location
          </div>
        )}

        {!selectionMode && (
          <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm p-3 rounded-lg shadow-lg z-10 pointer-events-none border border-[#BFC9D1]/20">
            <h1 className="text-sm font-bold text-[#25343F]">TidRod Map View</h1>
            <p className="text-xs text-[#25343F]/50">Click a marker to view trip details</p>
          </div>
        )}
      </section>
    </main>
  );
}
