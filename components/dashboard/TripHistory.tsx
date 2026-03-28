'use client';

import { useEffect, useState } from 'react';
import { Trip, TransportMode } from '@/types';
import { getTrips, clearTrips } from '@/lib/storage';

const MODE_ICONS: Record<TransportMode, string> = {
  walking: '🚶',
  cycling: '🚴',
  driving: '🚗',
  ev: '⚡',
};

const GRADE_COLORS: Record<string, string> = {
  A: '#4ade80',
  B: '#86efac',
  C: '#f59e0b',
  D: '#fb923c',
};

function formatDate(ts: number): string {
  const date = new Date(ts);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - date.getTime()) / 86400000);
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

interface Props {
  onClear: () => void;
}

export default function TripHistory({ onClear }: Props) {
  const [trips, setTrips] = useState<Trip[]>([]);

  useEffect(() => {
    setTrips(getTrips());
  }, []);

  const handleClear = () => {
    clearTrips();
    setTrips([]);
    onClear();
  };

  if (trips.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '40px 20px', color: '#6b9e7a' }}>
        <div style={{ fontSize: '2.5em', marginBottom: '12px' }}>🌱</div>
        <div style={{ fontSize: '15px', marginBottom: '6px', color: '#a3c4a8' }}>
          No trips logged yet
        </div>
        <div style={{ fontSize: '13px' }}>
          Plan a route and tap "Start" to log your first trip
        </div>
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '24px' }}>
        {trips.map((trip) => (
          <div
            key={trip.id}
            style={{
              background: '#1a3a2a',
              border: '1px solid #2d5a3d',
              borderRadius: '12px',
              padding: '14px 16px',
              display: 'flex',
              alignItems: 'center',
              gap: '14px',
            }}
          >
            <div style={{ fontSize: '1.6em', flexShrink: 0 }}>
              {MODE_ICONS[trip.mode]}
            </div>

            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  color: '#e0ffe8',
                  fontWeight: 600,
                  fontSize: '14px',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {trip.origin} → {trip.destination}
              </div>
              <div style={{ color: '#6b9e7a', fontSize: '12px', marginTop: '4px' }}>
                {trip.distanceKm.toFixed(1)} km · {trip.co2Kg.toFixed(2)} kg CO₂ · {formatDate(trip.timestamp)}
              </div>
            </div>

            <div
              style={{
                background: `${GRADE_COLORS[trip.ecoGrade]}20`,
                border: `1px solid ${GRADE_COLORS[trip.ecoGrade]}`,
                color: GRADE_COLORS[trip.ecoGrade],
                padding: '4px 10px',
                borderRadius: '20px',
                fontSize: '12px',
                fontWeight: 700,
                flexShrink: 0,
              }}
            >
              {trip.ecoGrade}
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={handleClear}
        style={{
          background: 'transparent',
          border: '1px solid #f59e0b',
          color: '#f59e0b',
          padding: '10px 20px',
          borderRadius: '8px',
          cursor: 'pointer',
          fontSize: '13px',
          fontWeight: 600,
          fontFamily: 'inherit',
          transition: 'all 0.2s',
          width: '100%',
          minHeight: '44px',
        }}
      >
        🗑️ Clear All Trips
      </button>
    </div>
  );
}
