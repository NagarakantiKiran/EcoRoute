"use client";

import { useEffect, useRef } from 'react';
import maplibregl, { LngLatBoundsLike } from 'maplibre-gl';

interface Props {
  map: maplibregl.Map | null;
  originCoords: [number, number] | null;
  destinationCoords: [number, number] | null;
}

export default function MarkerLayer({
  map,
  originCoords,
  destinationCoords,
}: Props) {
  const markersRef = useRef<maplibregl.Marker[]>([]);

  useEffect(() => {
    if (!map) return;

    // Remove existing markers
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    // Origin marker (green)
    if (originCoords) {
      const el = document.createElement('div');
      Object.assign(el.style, {
        width: '32px',
        height: '32px',
        borderRadius: '50%',
        background: 'white',
        border: '3px solid #52b788', // eco-green
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '16px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
      });
      el.textContent = '●';

      const marker = new maplibregl.Marker({ element: el })
        .setLngLat(originCoords)
        .addTo(map);
      markersRef.current.push(marker);
    }

    // Destination marker (amber)
    if (destinationCoords) {
      const el = document.createElement('div');
      Object.assign(el.style, {
        width: '32px',
        height: '32px',
        borderRadius: '50%',
        background: 'white',
        border: '3px solid #f4a261', // eco-amber
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '16px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
      });
      el.textContent = '●';

      const marker = new maplibregl.Marker({ element: el })
        .setLngLat(destinationCoords)
        .addTo(map);
      markersRef.current.push(marker);
    }

    // Auto-pan map
    if (originCoords || destinationCoords) {
      const bounds = new maplibregl.LngLatBounds();
      if (originCoords) bounds.extend(originCoords);
      if (destinationCoords) bounds.extend(destinationCoords);

      map.fitBounds(bounds as LngLatBoundsLike, {
        padding: 80,
        maxZoom: 15,
        duration: 800,
      });
    }

    return () => {
      markersRef.current.forEach((m) => m.remove());
    };
  }, [map, originCoords, destinationCoords]);

  return null;
}
