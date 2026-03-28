# Feature 001 — Carbon Footprint Dashboard (/dashboard)
*EcoRoute Feature Sprint*

**Depends on**: Deploy 001 done (or can be built locally and deployed after)  
**Estimated time**: 3–4 hours  
**Route**: `/dashboard`  
**Touches**: `app/dashboard/page.tsx`, `lib/storage.ts`, `components/dashboard/FootprintChart.tsx`, `components/dashboard/TripHistory.tsx`

---

## What We're Building

A personal carbon footprint page at `/dashboard` showing:

```
┌─────────────────────────────────────────────────────┐
│  🌿 ecoroute          [← Back to map]               │
├─────────────────────────────────────────────────────┤
│                                                     │
│  YOUR ECO IMPACT                                    │
│                                                     │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐            │
│  │ 24.3 kg  │ │ 12 trips │ │ 1.2 trees│            │
│  │CO₂ Saved │ │  Total   │ │ Offset   │            │
│  └──────────┘ └──────────┘ └──────────┘            │
│                                                     │
│  CO₂ SAVED BY MODE                                  │
│  ████████████ Cycling   8.2 kg (4 trips)            │
│  ██████       Walking   3.1 kg (3 trips)            │
│  ████         EV        2.4 kg (2 trips)            │
│  ██           Driving   0.9 kg (3 trips)            │
│                                                     │
│  TRIP HISTORY                                       │
│  ┌─────────────────────────────────────────────┐   │
│  │ 🚴 Banjara Hills → Hitech City              │   │
│  │    12.3 km · 0.0 kg CO₂ · Grade A · Today  │   │
│  └─────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────┐   │
│  │ 🚗 Dundigal → Rangareddy                   │   │
│  │    133.8 km · 16.05 kg CO₂ · Grade C · ... │   │
│  └─────────────────────────────────────────────┘   │
│                                                     │
│  [Clear All Trips]                                  │
└─────────────────────────────────────────────────────┘
```

---

## Step 1 — Complete `lib/storage.ts`

The stub exists. Replace its contents with:

```typescript
import { Trip, FootprintSummary, TransportMode } from '@/types';

const TRIPS_KEY = 'ecoroute:trips';
const MAX_TRIPS = 100;

// ---- Save a trip ----
export function saveTrip(trip: Trip): void {
  if (typeof window === 'undefined') return;
  try {
    const trips = getTrips();
    trips.unshift(trip); // newest first
    const trimmed = trips.slice(0, MAX_TRIPS);
    localStorage.setItem(TRIPS_KEY, JSON.stringify(trimmed));
  } catch {
    console.error('Failed to save trip');
  }
}

// ---- Get all trips ----
export function getTrips(): Trip[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(TRIPS_KEY);
    return raw ? (JSON.parse(raw) as Trip[]) : [];
  } catch {
    return [];
  }
}

// ---- Clear all trips ----
export function clearTrips(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(TRIPS_KEY);
}

// ---- Calculate footprint summary from trips ----
export function getFootprint(): FootprintSummary {
  const trips = getTrips();

  const tripsByMode: Record<TransportMode, number> = {
    walking: 0,
    cycling: 0,
    driving: 0,
    ev: 0,
  };

  let totalCO2SavedKg = 0;

  trips.forEach((t) => {
    tripsByMode[t.mode] = (tripsByMode[t.mode] || 0) + 1;
    totalCO2SavedKg += t.co2SavedKg;
  });

  return {
    totalCO2SavedKg: parseFloat(totalCO2SavedKg.toFixed(3)),
    totalTrips: trips.length,
    tripsByMode,
    lastUpdated: Date.now(),
  };
}

// ---- CO₂ saved per mode (for bar chart) ----
export function getCO2SavedByMode(): Record<TransportMode, number> {
  const trips = getTrips();
  const result: Record<TransportMode, number> = {
    walking: 0, cycling: 0, driving: 0, ev: 0,
  };
  trips.forEach((t) => {
    result[t.mode] = parseFloat(((result[t.mode] || 0) + t.co2SavedKg).toFixed(3));
  });
  return result;
}
```

---

## Step 2 — Complete `components/dashboard/TripHistory.tsx`

```typescript
'use client';

import { useEffect, useState } from 'react';
import { Trip, TransportMode } from '@/types';
import { getTrips, clearTrips } from '@/lib/storage';

const MODE_ICONS: Record<TransportMode, string> = {
  walking:  '🚶',
  cycling:  '🚴',
  driving:  '🚗',
  ev:       '⚡',
};

const GRADE_COLORS: Record<string, string> = {
  A: '#4ade80',
  B: '#86efac',
  C: '#f59e0b',
  D: '#fb923c',
};

function formatDate(ts: number): string {
  const d = new Date(ts);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - d.getTime()) / 86400000);
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
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
            {/* Mode icon */}
            <div style={{ fontSize: '1.6em', flexShrink: 0 }}>
              {MODE_ICONS[trip.mode]}
            </div>

            {/* Main info */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{
                color: '#e0ffe8', fontWeight: 600, fontSize: '14px',
                whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
              }}>
                {trip.origin} → {trip.destination}
              </div>
              <div style={{ color: '#6b9e7a', fontSize: '12px', marginTop: '4px' }}>
                {trip.distanceKm.toFixed(1)} km · {trip.co2Kg.toFixed(2)} kg CO₂ · {formatDate(trip.timestamp)}
              </div>
            </div>

            {/* Grade pill */}
            <div style={{
              background: `${GRADE_COLORS[trip.ecoGrade]}20`,
              border: `1px solid ${GRADE_COLORS[trip.ecoGrade]}`,
              color: GRADE_COLORS[trip.ecoGrade],
              padding: '4px 10px',
              borderRadius: '20px',
              fontSize: '12px',
              fontWeight: 700,
              flexShrink: 0,
            }}>
              {trip.ecoGrade}
            </div>
          </div>
        ))}
      </div>

      {/* Clear button */}
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
        }}
      >
        🗑️ Clear All Trips
      </button>
    </div>
  );
}
```

---

## Step 3 — Complete `components/dashboard/FootprintChart.tsx`

A pure CSS bar chart — no external charting library needed:

```typescript
'use client';

import { useEffect, useState } from 'react';
import { TransportMode } from '@/types';
import { getCO2SavedByMode, getTrips } from '@/lib/storage';

const MODE_CONFIG: Record<TransportMode, { icon: string; label: string; color: string }> = {
  cycling: { icon: '🚴', label: 'Cycling',  color: '#4ade80' },
  walking: { icon: '🚶', label: 'Walking',  color: '#86efac' },
  ev:      { icon: '⚡', label: 'EV',       color: '#60a5fa' },
  driving: { icon: '🚗', label: 'Driving',  color: '#f59e0b' },
};

interface Props {
  refreshKey: number;
}

export default function FootprintChart({ refreshKey }: Props) {
  const [data, setData] = useState<Record<TransportMode, number>>({
    cycling: 0, walking: 0, ev: 0, driving: 0,
  });
  const [tripCounts, setTripCounts] = useState<Record<TransportMode, number>>({
    cycling: 0, walking: 0, ev: 0, driving: 0,
  });

  useEffect(() => {
    setData(getCO2SavedByMode());
    const trips = getTrips();
    const counts: Record<TransportMode, number> = { cycling: 0, walking: 0, ev: 0, driving: 0 };
    trips.forEach(t => { counts[t.mode] = (counts[t.mode] || 0) + 1; });
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
            {/* Label row */}
            <div style={{
              display: 'flex', justifyContent: 'space-between',
              marginBottom: '6px', alignItems: 'center',
            }}>
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

            {/* Bar */}
            <div style={{
              height: '8px', background: '#1e4030',
              borderRadius: '4px', overflow: 'hidden',
            }}>
              <div style={{
                height: '100%',
                width: `${pct}%`,
                background: cfg.color,
                borderRadius: '4px',
                transition: 'width 0.6s ease',
                minWidth: val > 0 ? '4px' : '0',
              }} />
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
```

---

## Step 4 — Build `app/dashboard/page.tsx`

Replace the stub with:

```typescript
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { FootprintSummary } from '@/types';
import { getFootprint } from '@/lib/storage';
import FootprintChart from '@/components/dashboard/FootprintChart';
import TripHistory from '@/components/dashboard/TripHistory';

function StatCard({ label, value, unit, icon }: {
  label: string; value: string; unit: string; icon: string;
}) {
  return (
    <div style={{
      background: '#1a3a2a',
      border: '1px solid #2d5a3d',
      borderRadius: '16px',
      padding: '20px',
      textAlign: 'center',
      flex: 1,
    }}>
      <div style={{ fontSize: '1.8em', marginBottom: '8px' }}>{icon}</div>
      <div style={{ color: '#4ade80', fontSize: '1.8em', fontWeight: 800, lineHeight: 1 }}>
        {value}
      </div>
      <div style={{ color: '#6b9e7a', fontSize: '11px', marginTop: '4px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
        {unit}
      </div>
      <div style={{ color: '#a3c4a8', fontSize: '12px', marginTop: '6px' }}>{label}</div>
    </div>
  );
}

export default function DashboardPage() {
  const [footprint, setFootprint] = useState<FootprintSummary | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const loadFootprint = () => {
    setFootprint(getFootprint());
    setRefreshKey(k => k + 1);
  };

  useEffect(() => {
    loadFootprint();
  }, []);

  const treesOffset = footprint
    ? (footprint.totalCO2SavedKg / 21).toFixed(2)
    : '0';

  return (
    <main style={{
      background: '#0d1f12',
      minHeight: '100vh',
      color: '#f0f4f0',
      fontFamily: 'var(--font-geist-sans), system-ui, sans-serif',
    }}>
      {/* Header */}
      <div style={{
        borderBottom: '1px solid rgba(82,183,136,0.15)',
        padding: '16px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        background: '#0d1f12',
        zIndex: 10,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '20px' }}>🌿</span>
          <span style={{ fontSize: '17px' }}>
            <span style={{ fontWeight: 400 }}>eco</span>
            <span style={{ fontWeight: 700 }}>route</span>
          </span>
        </div>
        <Link href="/" style={{
          color: '#4ade80',
          textDecoration: 'none',
          fontSize: '13px',
          fontWeight: 600,
          border: '1px solid #2d5a3d',
          padding: '8px 14px',
          borderRadius: '8px',
          transition: 'all 0.2s',
        }}>
          ← Back to Map
        </Link>
      </div>

      {/* Content */}
      <div style={{ maxWidth: '680px', margin: '0 auto', padding: '24px 20px 60px' }}>

        {/* Page title */}
        <div style={{ marginBottom: '28px' }}>
          <div style={{
            fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.12em',
            color: '#6b9e7a', marginBottom: '8px', fontWeight: 600,
          }}>
            Your Eco Impact
          </div>
          <h1 style={{ fontSize: '1.8em', fontWeight: 800, color: '#f0f4f0', margin: 0 }}>
            Carbon Footprint
          </h1>
        </div>

        {/* 3 stat cards */}
        <div style={{ display: 'flex', gap: '12px', marginBottom: '32px', flexWrap: 'wrap' }}>
          <StatCard
            icon="💨"
            value={footprint?.totalCO2SavedKg.toFixed(1) ?? '0'}
            unit="kg CO₂"
            label="Total Saved"
          />
          <StatCard
            icon="🗺️"
            value={String(footprint?.totalTrips ?? 0)}
            unit="trips"
            label="Logged"
          />
          <StatCard
            icon="🌳"
            value={treesOffset}
            unit="trees"
            label="Equivalent Offset"
          />
        </div>

        {/* CO₂ by mode chart */}
        <div style={{
          background: '#122b1c',
          border: '1px solid #2d5a3d',
          borderRadius: '16px',
          padding: '22px',
          marginBottom: '24px',
        }}>
          <div style={{
            fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.1em',
            color: '#6b9e7a', fontWeight: 600, marginBottom: '18px',
          }}>
            CO₂ Saved by Mode
          </div>
          <FootprintChart refreshKey={refreshKey} />
        </div>

        {/* Trip history */}
        <div style={{
          background: '#122b1c',
          border: '1px solid #2d5a3d',
          borderRadius: '16px',
          padding: '22px',
        }}>
          <div style={{
            fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.1em',
            color: '#6b9e7a', fontWeight: 600, marginBottom: '18px',
          }}>
            Trip History
          </div>
          <TripHistory onClear={loadFootprint} />
        </div>
      </div>
    </main>
  );
}
```

---

## Step 5 — Add Dashboard Link on the Main Map Page

In `app/page.tsx` or `components/panel/JourneyPlanner.tsx`, add a small link to the dashboard:

```tsx
import Link from 'next/link';

// Add somewhere in the sidebar (e.g. below the Advanced Dashboard button):
<Link href="/dashboard" style={{
  display: 'block',
  textAlign: 'center',
  color: '#6b9e7a',
  fontSize: '13px',
  padding: '10px',
  textDecoration: 'none',
  borderTop: '1px solid rgba(82,183,136,0.1)',
  marginTop: '8px',
}}>
  📊 View Carbon Dashboard
</Link>
```

---

## Step 6 — Wire Trip Saving in StartButton

Make sure your `StartButton` or CTA actually calls `saveTrip()`.
In `components/panel/StartButton.tsx` (or wherever the button lives):

```tsx
import { saveTrip } from '@/lib/storage';
import { v4 as uuidv4 } from 'uuid'; // OR use crypto.randomUUID()

// Inside the click handler:
const handleStart = () => {
  if (!selectedRoute || !state.origin || !state.destination) return;

  saveTrip({
    id: crypto.randomUUID(),
    timestamp: Date.now(),
    origin: state.origin,
    destination: state.destination,
    mode: selectedRoute.mode,
    distanceKm: parseFloat(selectedRoute.distance),
    co2Kg: parseFloat(selectedRoute.co2),
    co2SavedKg: Math.max(0, parseFloat(selectedRoute.co2) * 0), // adjust to your actual saved calc
    ecoGrade: selectedRoute.grade as 'A' | 'B' | 'C' | 'D',
  });
};
```

---

## Verification Checklist

- [ ] `/dashboard` loads with dark green theme matching main app
- [ ] 3 stat cards show: CO₂ Saved, Total Trips, Trees Equivalent
- [ ] CO₂ by Mode chart shows horizontal bars (all 4 modes)
- [ ] Trip History shows a card per logged trip (origin → destination, CO₂, grade)
- [ ] Empty state shows "No trips logged yet 🌱" when no trips
- [ ] "Clear All Trips" removes all trips + resets stats
- [ ] "← Back to Map" link works
- [ ] "📊 View Carbon Dashboard" link in sidebar works
- [ ] Mobile: dashboard is readable at 375px (stat cards wrap if needed)
- [ ] TypeScript: `npm run typecheck` passes 0 errors

---

## Completion Log

- [ ] lib/storage.ts — fully implemented
- [ ] FootprintChart.tsx — CSS bar chart working
- [ ] TripHistory.tsx — trip cards + clear button
- [ ] app/dashboard/page.tsx — full page built
- [ ] Dashboard link added in sidebar
- [ ] Trip saving wired in StartButton
- [ ] Tested with 3+ logged trips
- [ ] **FEATURE 001 COMPLETE ✅ — Ready for Feature 002 (Weather)**
