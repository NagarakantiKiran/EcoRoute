"use client";

import { useEffect, useState, useCallback } from 'react';
import { JourneyState } from '@/types';
import { geocodeWithCache } from '@/lib/geocoding';
import { useGeolocation } from './useGeolocation';
import { fetchRoutes } from '@/lib/routing';

export function useRoutes() {
  const geolocationCoords = useGeolocation();
  
  const [state, setState] = useState<JourneyState>({
    origin: '',
    destination: '',
    originCoords: null,
    destinationCoords: null,
    routes: [],
    selectedRouteId: null,
    isLoading: false,
    error: null,
  });

  const { originCoords, destinationCoords } = state;

  // Fetch routes when both originCoords and destinationCoords are set
  useEffect(() => {
    const getRoutes = async () => {
      if (originCoords && destinationCoords) {
        setState((prev) => ({ ...prev, isLoading: true, error: null }));
        try {
          const routes = await fetchRoutes(originCoords, destinationCoords);
          
          // Auto-select greenest route (best eco grade = lowest CO2)
          const greenestRoute = routes.reduce((best, current) => {
            const gradeOrder = { A: 0, B: 1, C: 2, D: 3 };
            const bestGrade = gradeOrder[best.ecoGrade as keyof typeof gradeOrder] || 999;
            const currentGrade = gradeOrder[current.ecoGrade as keyof typeof gradeOrder] || 999;
            return currentGrade < bestGrade ? current : best;
          });
          
          setState((prev) => ({ 
            ...prev, 
            routes, 
            selectedRouteId: greenestRoute?.id || null,
            isLoading: false 
          }));
        } catch (err: any) {
          setState((prev) => ({ ...prev, routes: [], selectedRouteId: null, isLoading: false, error: err?.message || 'Failed to fetch routes' }));
        }
      } else {
        setState((prev) => ({ ...prev, routes: [], selectedRouteId: null }));
      }
    };
    getRoutes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [originCoords, destinationCoords]);

  const [originTimer, setOriginTimer] = useState<NodeJS.Timeout | null>(null);
  const [destTimer, setDestTimer] = useState<NodeJS.Timeout | null>(null);

  // Update origin coords from geolocation on first load
  useEffect(() => {
    if (geolocationCoords && !state.originCoords) {
      setState((prev) => ({
        ...prev,
        originCoords: geolocationCoords,
        origin: 'My location', // Placeholder until we implement reverse geocoding
      }));
    }
  }, [geolocationCoords, state.originCoords]);

  const handleOriginChange = useCallback(
    (value: string) => {
      setState((prev) => ({ ...prev, origin: value, error: null }));

      if (originTimer) clearTimeout(originTimer);

      if (!value.trim()) {
        setState((prev) => ({ ...prev, originCoords: null }));
        return;
      }

      const timer = setTimeout(async () => {
        try {
          const coords = await geocodeWithCache(value);
          if (coords) {
            setState((prev) => ({ ...prev, originCoords: coords, error: null }));
          } else {
            setState((prev) => ({
              ...prev,
              originCoords: null,
              error: "Couldn't find that location. Try being more specific.",
            }));
          }
        } catch (err) {
          console.error('Origin geocoding error:', err);
          setState((prev) => ({
            ...prev,
            originCoords: null,
            error: "Couldn't find that location. Try being more specific.",
          }));
        }
      }, 500);

      setOriginTimer(timer);
    },
    [originTimer]
  );

  const handleDestinationChange = useCallback(
    (value: string) => {
      setState((prev) => ({ ...prev, destination: value, error: null }));

      if (destTimer) clearTimeout(destTimer);

      if (!value.trim()) {
        setState((prev) => ({ ...prev, destinationCoords: null }));
        return;
      }

      const timer = setTimeout(async () => {
        try {
          const coords = await geocodeWithCache(value);
          if (coords) {
            setState((prev) => ({ ...prev, destinationCoords: coords, error: null }));
          } else {
            setState((prev) => ({
              ...prev,
              destinationCoords: null,
              error: "Couldn't find that location. Try being more specific.",
            }));
          }
        } catch (err) {
          console.error('Destination geocoding error:', err);
          setState((prev) => ({
            ...prev,
            destinationCoords: null,
            error: "Couldn't find that location. Try being more specific.",
          }));
        }
      }, 500);

      setDestTimer(timer);
    },
    [destTimer]
  );

  // Cleanup
  useEffect(() => {
    return () => {
      if (originTimer) clearTimeout(originTimer);
      if (destTimer) clearTimeout(destTimer);
    };
  }, [originTimer, destTimer]);

  const handleSelectRoute = useCallback(
    (routeId: string) => {
      setState((prev) => ({ ...prev, selectedRouteId: routeId }));
    },
    []
  );

  return { state, handleOriginChange, handleDestinationChange, handleSelectRoute };
}
