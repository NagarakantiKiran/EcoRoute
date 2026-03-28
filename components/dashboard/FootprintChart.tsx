'use client';

import { useEffect, useState } from 'react';
import { TransportMode } from '@/types';
import { getCO2SavedByMode, getTrips } from '@/lib/storage';

const MODE_CONFIG: Record<TransportMode, { icon: string; label: string; color: string }> = {
  cycling: { icon: '🚴', label: 'Cycling', color: '#4ade80' },
  walking: { icon: '🚶', label: 'Walking', color: '#86efac' },
  ev: { icon: '⚡', label: 'EV', color: '#60a5fa' },
  driving: { icon: '🚗', label: 'Driving', color: '#f59e0b' },
};

interface Props {
  refreshKey: number;
}

export default function FootprintChart({ refreshKey }: Props) {
  const [data, setData] = useState<Record<TransportMode, number>>({
    cycling: 0,
    walking: 0,
    ev: 0,
    driving: 0,
  });
  const [tripCounts, setTripCounts] = useState<Record<TransportMode, number>>({
    cycling: 0,
    walking: 0,
    ev: 0,
    driving: 0,
  });

  useEffect(() => {
    setData(getCO2SavedByMode());
    const trips = getTrips();
    const counts: Record<TransportMode, number> = { cycling: 0, walking: 0, ev: 0, driving: 0 };
    trips.forEach((trip) => {
      counts[trip.mode] = (counts[trip.mode] || 0) + 1;
    });
    setTripCounts(counts);
  }, [refreshKey]);

  const maxVal = Math.max(...Object.values(data), 0.1);
  const modes = Object.keys(MODE_CONFIG) as TransportMode[];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      {modes.map((mode) => {
        const cfg = MODE_CONFIG[mode];
        const val = data[mode] || 0;
        const pct = (val / maxVal) * 100;
        const trips = tripCounts[mode] || 0;

        return (
          <div key={mode}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginBottom: '6px',
                alignItems: 'center',
              }}
            >
              <span style={{ color: '#a3c4a8', fontSize: '13px' }}>
                {cfg.icon} {cfg.label}
                {trips > 0 && (
                  <span style={{ color: '#6b9e7a', marginLeft: '6px' }}>
                    ({trips} trip{trips !== 1 ? 's' : ''})
                  </span>
                )}
              </span>
              <span style={{ color: cfg.color, fontWeight: 700, fontSize: '14px' }}>
                {val.toFixed(2)} kg
              </span>
            </div>

            <div
              style={{
                height: '8px',
                background: '#1e4030',
                borderRadius: '4px',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  height: '100%',
                  width: `${pct}%`,
                  background: cfg.color,
                  borderRadius: '4px',
                  transition: 'width 0.6s ease',
                  minWidth: val > 0 ? '4px' : '0',
                }}
              />
            </div>
          </div>
        );
      })}

      {maxVal === 0.1 && (
        <div style={{ color: '#6b9e7a', fontSize: '13px', textAlign: 'center', paddingTop: '8px' }}>
          Log trips to see your breakdown
        </div>
      )}
    </div>
  );
}
