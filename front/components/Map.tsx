'use client';

import React, { useRef, useEffect, useState } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

interface MarkerData {
  lat: number;
  lon: number;
  label?: string;
  color?: string;
}

interface MapProps {
  markers?: MarkerData[];
  center?: [number, number];
  zoom?: number;
  selectionMode?: 'origin' | 'destination' | null;
  onLocationSelect?: (lat: number, lon: number) => void;
}

export default function MapComponent({ 
  markers = [], 
  center = [0, 0], 
  zoom = 2,
  selectionMode = null,
  onLocationSelect
}: MapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const markersRef = useRef<maplibregl.Marker[]>([]);
  const dragMarkerRef = useRef<maplibregl.Marker | null>(null);
  const [isMapReady, setIsMapReady] = useState(false);

  // Initialize Map
  useEffect(() => {
    if (map.current) return;
    if (!mapContainer.current) return;

    console.log("Initializing MapLibre...");

    const mapInstance = new maplibregl.Map({
      container: mapContainer.current,
      style: {
        version: 8,
        sources: {
          osm: {
            type: 'raster',
            tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
            tileSize: 256,
            attribution: '&copy; OpenStreetMap Contributors',
            maxzoom: 19
          }
        },
        layers: [
          {
            id: 'osm',
            type: 'raster',
            source: 'osm'
          }
        ]
      } as any,
      // Thailand coordinates: [100.5018, 13.7563] (Bangkok approx) or center of Thailand
      center: center.length === 2 && (center[0] !== 0 || center[1] !== 0) ? center : [100.5018, 13.7563], // Default to Bangkok/Thailand
      zoom: center.length === 2 && (center[0] !== 0 || center[1] !== 0) ? zoom : 6
    });

    map.current = mapInstance;

    mapInstance.addControl(new maplibregl.NavigationControl(), 'top-right');

    const geolocate = new maplibregl.GeolocateControl({
      positionOptions: { enableHighAccuracy: true },
      trackUserLocation: true,
      showUserLocation: true
    });
    mapInstance.addControl(geolocate, 'top-right');

    mapInstance.on('load', () => {
      console.log("Map loaded successfully");
      setIsMapReady(true);
      mapInstance.resize();

      const hasCustomCenter = center.length === 2 && (center[0] !== 0 || center[1] !== 0);
      if (!hasCustomCenter) {
         geolocate.trigger();
      }
    });

    mapInstance.on('error', (e) => {
      console.error("Map error:", e);
    });

    return () => {
      mapInstance.remove();
      map.current = null;
      setIsMapReady(false);
    };
  }, []);

  // Manage Markers
  useEffect(() => {
    if (!isMapReady || !map.current) return;

    // Clear existing static markers
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    // Add new markers
    markers.forEach(m => {
      const marker = new maplibregl.Marker({ color: m.color || '#3B82F6' })
        .setLngLat([m.lon, m.lat])
        .setPopup(new maplibregl.Popup({ offset: 25 }).setText(m.label || ''))
        .addTo(map.current!);
      
      markersRef.current.push(marker);
    });

    // Fit bounds if we have markers and NOT in selection mode (don't jump around while selecting)
    if (markers.length > 0 && !selectionMode) {
       const bounds = new maplibregl.LngLatBounds();
       markers.forEach(m => bounds.extend([m.lon, m.lat]));
       try {
         map.current.fitBounds(bounds, { padding: 50, maxZoom: 15 });
       } catch (e) { console.error("Error fitting bounds:", e); }
    }

  }, [markers, isMapReady, selectionMode]);

  // Manage Selection Mode (Draggable Pin)
  useEffect(() => {
    if (!isMapReady || !map.current) return;

    // Cleanup previous drag marker
    if (dragMarkerRef.current) {
      dragMarkerRef.current.remove();
      dragMarkerRef.current = null;
    }

    if (selectionMode) {
      const center = map.current.getCenter();
      const color = selectionMode === 'origin' ? '#10B981' : '#EF4444'; // Green or Red

      const marker = new maplibregl.Marker({ 
        draggable: true,
        color: color,
        scale: 1.2
      })
        .setLngLat(center)
        .addTo(map.current);
      
      marker.on('dragend', () => {
        const lngLat = marker.getLngLat();
        if (onLocationSelect) {
          onLocationSelect(lngLat.lat, lngLat.lng);
        }
      });

      dragMarkerRef.current = marker;
      
      // Optional: Popup instruction?
      const popup = new maplibregl.Popup({ offset: 25, closeButton: false })
          .setText("Drag to select location")
          .setLngLat(center)
          .addTo(map.current);
      
      // Remove popup on drag start
      marker.on('dragstart', () => popup.remove());
    }

  }, [selectionMode, isMapReady]);

  return (
    <div className="w-full h-full min-h-[400px] relative">
      <div 
        ref={mapContainer} 
        className="w-full h-full rounded-lg overflow-hidden shadow-lg bg-gray-200 dark:bg-gray-800" 
      />
    </div>
  );
}
