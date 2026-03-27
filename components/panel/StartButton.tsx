"use client";

import { RouteResult, TransportMode } from '@/types';
import { saveTrip } from '@/lib/storage';
import React from 'react';

interface Props {
  selectedRoute: RouteResult | null;
  origin: string;
  destination: string;
  disabled?: boolean;
  onTripLogged?: () => void;
}

const MODE_LABELS: Record<TransportMode, string> = {
  walking: 'Start walking',
  cycling: 'Start cycling',
  driving: 'Start driving',
  ev: 'Start EV',
};

export default function StartButton({
  selectedRoute,
  origin,
  destination,
  disabled = false,
  onTripLogged,
}: Props) {
  const [isLoading, setIsLoading] = React.useState(false);

  const handleStartTrip = async () => {
    if (!selectedRoute || disabled) return;

    setIsLoading(true);
    try {
      // Create trip object
      const trip = {
        id: crypto.randomUUID(),
        timestamp: Date.now(),
        origin,
        destination,
        mode: selectedRoute.mode as TransportMode,
        strategy: selectedRoute.strategy,
        distanceKm: selectedRoute.distanceMeters / 1000,
        co2Kg: selectedRoute.co2Kg,
        co2SavedKg: selectedRoute.co2SavedKg,
        ecoGrade: selectedRoute.ecoGrade,
      };

      // Save to localStorage
      saveTrip(trip);

      // Call callback to refresh widgets
      onTripLogged?.();

      // Brief success feedback
      setTimeout(() => {
        setIsLoading(false);
      }, 500);
    } catch (err) {
      console.error('Failed to log trip:', err);
      setIsLoading(false);
    }
  };

  const isDisabled = disabled || !selectedRoute || isLoading;
  const strategyLabel = selectedRoute
    ? selectedRoute.strategy.charAt(0).toUpperCase() + selectedRoute.strategy.slice(1)
    : '';
  const label = selectedRoute
    ? `${MODE_LABELS[selectedRoute.mode]} (${strategyLabel})`
    : 'Start greenest route';

  return (
    <button
      onClick={handleStartTrip}
      disabled={isDisabled}
      style={{
        width: '100%',
        padding: '14px 20px',
        background: isDisabled ? 'var(--eco-muted)' : 'var(--eco-green)',
        color: 'var(--eco-bg)',
        border: 'none',
        borderRadius: '12px',
        fontSize: '15px',
        fontWeight: 600,
        cursor: isDisabled ? 'not-allowed' : 'pointer',
        transition: 'all 0.2s',
        opacity: isDisabled ? 0.5 : 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        marginTop: '20px',
      }}
    >
      {isLoading ? (
        <>
          <span>Logging trip...</span>
        </>
      ) : (
        <>
          <span>{label}</span>
          <span>↗</span>
        </>
      )}
    </button>
  );
}
