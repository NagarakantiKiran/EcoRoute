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

interface Props {
  mapRef?: React.MutableRefObject<maplibregl.Map | null>;
}

export default function EcoMap({ mapRef }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const localMapRef = useRef<maplibregl.Map | null>(null);

  useEffect(() => {
    if (!containerRef.current || localMapRef.current) return;

    localMapRef.current = new maplibregl.Map({
      container: containerRef.current,
      style: MAP_CONFIG.style,
      center: MAP_CONFIG.center,
      zoom: MAP_CONFIG.zoom,
      attributionControl: MAP_CONFIG.attributionControl,
    });

    localMapRef.current.addControl(
      new maplibregl.AttributionControl({ compact: true }),
      'bottom-right'
    );

    // Expose to parent
    if (mapRef) {
      mapRef.current = localMapRef.current;
    }

    return () => {
      localMapRef.current?.remove();
      localMapRef.current = null;
      if (mapRef) mapRef.current = null;
    };
  }, [mapRef]);

  return (
    <div
      ref={containerRef}
      style={{ width: '100%', height: '100%' }}
    />
  );
}
