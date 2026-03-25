'use client';

import { useEffect, useRef } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

const MAP_CONFIG = {
  style: 'https://tiles.openfreemap.org/styles/dark',
  center: [78.9629, 20.5937] as [number, number],
  zoom: 4,
  attributionControl: false as const,
};

export default function EcoMap() {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    mapRef.current = new maplibregl.Map({
      container: containerRef.current,
      style: MAP_CONFIG.style,
      center: MAP_CONFIG.center,
      zoom: MAP_CONFIG.zoom,
      attributionControl: MAP_CONFIG.attributionControl,
    });

    mapRef.current.addControl(
      new maplibregl.AttributionControl({ compact: true }),
      'bottom-right'
    );

    return () => {
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, []);

  return (
    <div
      ref={containerRef}
      style={{ width: '100%', height: '100%' }}
    />
  );
}
