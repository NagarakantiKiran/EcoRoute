"use client";

import { useEffect, useState } from 'react';

export function useGeolocation() {
  const [coords, setCoords] = useState<[number, number] | null>(null);

  useEffect(() => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setCoords([longitude, latitude]); // MapLibre uses [lon, lat]
      },
      () => {
        // Silently handle permission denied, timeout, etc.
        // User can just type manually — no friction per Figma spec
      },
      {
        enableHighAccuracy: false,
        timeout: 5000,
        maximumAge: 3600000, // Cache for 1 hour
      }
    );
  }, []);

  return coords;
}
