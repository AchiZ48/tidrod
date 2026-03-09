'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

export interface MarkerData {
  id?: string;
  lat: number;
  lon: number;
  label?: string;
  color?: string;
}

interface MapBounds {
  west: number;
  south: number;
  east: number;
  north: number;
}

interface MapProps {
  markers?: MarkerData[];
  center?: [number, number];
  zoom?: number;
  selectionMode?: 'origin' | 'destination' | null;
  onLocationSelect?: (lat: number, lon: number) => void;
  onMapMove?: (bounds: MapBounds) => void;
  onMarkerClick?: (markerId: string) => void;
}

export default function MapComponent({
  markers = [],
  center = [0, 0],
  zoom = 2,
  selectionMode = null,
  onLocationSelect,
  onMapMove,
  onMarkerClick,
}: MapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const markersRef = useRef<maplibregl.Marker[]>([]);
  const dragMarkerRef = useRef<maplibregl.Marker | null>(null);
  const [isMapReady, setIsMapReady] = useState(false);
  const moveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Initialize Map
  useEffect(() => {
    if (map.current) return;
    if (!mapContainer.current) return;

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
      center: center.length === 2 && (center[0] !== 0 || center[1] !== 0) ? center : [100.5018, 13.7563],
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
      setIsMapReady(true);
      mapInstance.resize();

      const hasCustomCenter = center.length === 2 && (center[0] !== 0 || center[1] !== 0);
      if (!hasCustomCenter) {
        geolocate.trigger();
      }

      // Fire initial bounds
      if (onMapMove) {
        const bounds = mapInstance.getBounds();
        onMapMove({
          west: bounds.getWest(),
          south: bounds.getSouth(),
          east: bounds.getEast(),
          north: bounds.getNorth(),
        });
      }
    });

    // Debounced map move for viewport-based marker loading
    mapInstance.on('moveend', () => {
      if (onMapMove) {
        if (moveTimeoutRef.current) clearTimeout(moveTimeoutRef.current);
        moveTimeoutRef.current = setTimeout(() => {
          if (!map.current) return;
          const bounds = map.current.getBounds();
          onMapMove({
            west: bounds.getWest(),
            south: bounds.getSouth(),
            east: bounds.getEast(),
            north: bounds.getNorth(),
          });
        }, 300);
      }
    });

    mapInstance.on('error', (e) => {
      console.error("Map error:", e);
    });

    return () => {
      if (moveTimeoutRef.current) clearTimeout(moveTimeoutRef.current);
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
      const el = document.createElement('div');
      el.className = 'custom-marker';
      el.style.cssText = `
        width: 32px; height: 32px; border-radius: 50% 50% 50% 0;
        background: ${m.color || '#FF9B51'}; transform: rotate(-45deg);
        border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        cursor: pointer; transition: transform 0.2s;
      `;
      el.onmouseenter = () => { el.style.transform = 'rotate(-45deg) scale(1.2)'; };
      el.onmouseleave = () => { el.style.transform = 'rotate(-45deg) scale(1)'; };

      // Click handler for navigation
      if (m.id && onMarkerClick) {
        el.onclick = (e) => {
          e.stopPropagation();
          onMarkerClick(m.id!);
        };
      }

      const marker = new maplibregl.Marker({ element: el })
        .setLngLat([m.lon, m.lat])
        .addTo(map.current!);

      if (m.label) {
        marker.setPopup(
          new maplibregl.Popup({ offset: 25, closeButton: false })
            .setHTML(`<div style="font-weight:600;font-size:13px;color:#25343F;max-width:200px">${m.label}</div>`)
        );
      }

      markersRef.current.push(marker);
    });

    // Don't fit bounds when in selection mode, or if it's a single-marker static view (trip detail page)
    if (markers.length > 1 && !selectionMode) {
      const bounds = new maplibregl.LngLatBounds();
      markers.forEach(m => bounds.extend([m.lon, m.lat]));
      try {
        map.current.fitBounds(bounds, { padding: 50, maxZoom: 15 });
      } catch (e) { console.error("Error fitting bounds:", e); }
    }

  }, [markers, isMapReady, selectionMode, onMarkerClick]);

  // Manage Selection Mode (Draggable Pin)
  useEffect(() => {
    if (!isMapReady || !map.current) return;

    if (dragMarkerRef.current) {
      dragMarkerRef.current.remove();
      dragMarkerRef.current = null;
    }

    if (selectionMode) {
      const center = map.current.getCenter();
      const color = selectionMode === 'origin' ? '#10B981' : '#EF4444';

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

      const popup = new maplibregl.Popup({ offset: 25, closeButton: false })
        .setText("Drag to select location")
        .setLngLat(center)
        .addTo(map.current);

      marker.on('dragstart', () => popup.remove());
    }

  }, [selectionMode, isMapReady]);

  return (
    <div className="w-full h-full min-h-[400px] relative">
      <div
        ref={mapContainer}
        className="w-full h-full rounded-lg overflow-hidden shadow-lg bg-[#EAEFEF]"
      />
    </div>
  );
}
