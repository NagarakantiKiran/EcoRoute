# Task 002 — Geocoding & Journey Planner
*EcoRoute Build Sprint*

**Depends on**: Task 001 complete
**Estimated time**: 2–3 hours
**Prep docs**: 03_system_design.md (Data Flow — Geocoding section, API Rate Limits), 02_ui_design.md (Journey Planner Card section)

---

## Context — Current State

Task 001 is complete:
- Next.js 14 project scaffolded with all folders, stubs, and dependencies
- MapLibre GL JS renders on the right (60% width)
- Empty left panel (40% width) with logo
- CSS variables and dark green theme applied
- typecheck passes with 0 errors

**What this task adds:**
- Fully functional Journey Planner Card with origin + destination inputs
- Nominatim geocoding with 500ms debounce per field
- Caching of geocoding results in sessionStorage (1 hour TTL)
- Origin and destination markers appear on the map dynamically
- Map automatically pans to show both markers in view
- Error state: "Couldn't find that location. Try being more specific."
- Graceful geolocation: if browser permission denied, silent skip (no error, user types manually)

By the end of this task: Typing "Banjara Hills, Hyderabad" in origin field and "Hitech City" in destination field shows both markers on the map, auto-panned to display both.

---

## What This Task Does

1. **Journey Planner Card Component**
   - Replace placeholder with real form (origin + destination inputs)
   - Origin input with green circle dot indicator
   - Destination input with amber circle dot indicator
   - Eco mode active/off toggle badge
   - Error message area for geocoding failures

2. **Geocoding Library (lib/geocoding.ts)**
   - Nominatim API wrapper: `geocode(query: string)`
   - User-Agent header (required by Nominatim per their ToS)
   - sessionStorage caching with 1-hour TTL
   - Graceful error handling
   - Returns [longitude, latitude] or null

3. **Journey State Hook (hooks/useRoutes.ts)**
   - JourneyState: origin text, originCoords, destination text, destinationCoords
   - Debounce handlers (500ms) for both inputs
   - Automatic geocoding on input change (after debounce)
   - Error state management
   - Cleanup timers on unmount

4. **Geolocation Hook (hooks/useGeolocation.ts)**
   - Browser geolocation API (non-blocking, graceful failure)
   - If permission granted: coords available immediately
   - If permission denied: silent (no error shown)
   - Used by useRoutes to pre-fill origin if available

5. **Map Markers Component (components/map/MarkerLayer.tsx)**
   - Displays green marker at originCoords
   - Displays amber marker at destinationCoords
   - Map auto-fit bounds to show both (or single if only one filled)
   - Pan animation: 800ms duration
   - Cleanup markers when component unmounts or coords change

---

## Files To Modify/Create

**CREATE (implement from stubs):**
- `lib/geocoding.ts`
- `hooks/useGeolocation.ts`
- `components/map/MarkerLayer.tsx`

**MODIFY:**
- `components/panel/JourneyPlanner.tsx` — Replace stub with full implementation
- `hooks/useRoutes.ts` — Full implementation (large)
- `app/page.tsx` — Connect state to components + pass map ref

**NO CHANGES:**
- types/index.ts (all interfaces ready)
- app/globals.css (all colors ready)
- config/emissions.ts (not needed yet)

---

## Phase 1 — lib/geocoding.ts

**Goal**: Nominatim wrapper with caching

```typescript
// lib/geocoding.ts

const NOMINATIM_BASE = 'https://nominatim.openstreetmap.org';
const USER_AGENT = 'EcoRoute/1.0 (ecoroute.app)';

export async function geocode(query: string): Promise<[number, number] | null> {
  if (!query.trim()) return null;

  try {
    const url = new URL(`${NOMINATIM_BASE}/search`);
    url.searchParams.set('q', query);
    url.searchParams.set('format', 'json');
    url.searchParams.set('limit', '1');

    const res = await fetch(url.toString(), {
      headers: { 'User-Agent': USER_AGENT },
    });

    if (!res.ok) throw new Error(`Nominatim ${res.status}`);

    const data: Array<{ lon: string; lat: string }> = await res.json();
    if (!data.length) return null;

    const { lon, lat } = data[0];
    return [parseFloat(lon), parseFloat(lat)];
  } catch (error) {
    console.error('Geocoding failed:', error);
    return null;
  }
}

// Session storage cache
const CACHE_KEY = 'ecoroute:geocoding-cache';
const CACHE_TTL_MS = 3600000; // 1 hour

function getCachedResult(query: string): [number, number] | null {
  if (typeof window === 'undefined') return null;

  try {
    const raw = sessionStorage.getItem(CACHE_KEY);
    if (!raw) return null;

    type CacheEntry = { coords: [number, number]; timestamp: number };
    const cache = JSON.parse(raw) as Record<string, CacheEntry>;
    const entry = cache[query];

    if (!entry) return null;
    if (Date.now() - entry.timestamp > CACHE_TTL_MS) {
      delete cache[query];
      sessionStorage.setItem(CACHE_KEY, JSON.stringify(cache));
      return null;
    }

    return entry.coords;
  } catch {
    return null;
  }
}

function setCachedResult(query: string, coords: [number, number]): void {
  if (typeof window === 'undefined') return;

  try {
    let cache: Record<string, { coords: [number, number]; timestamp: number }> = {};
    const raw = sessionStorage.getItem(CACHE_KEY);
    if (raw) cache = JSON.parse(raw);

    cache[query] = { coords, timestamp: Date.now() };
    sessionStorage.setItem(CACHE_KEY, JSON.stringify(cache));
  } catch {
    // Fail silently on quota exceeded
  }
}

export async function geocodeWithCache(query: string): Promise<[number, number] | null> {
  const cached = getCachedResult(query);
  if (cached) return cached;

  const result = await geocode(query);
  if (result) setCachedResult(query, result);

  return result;
}
```

---

## Phase 2 — hooks/useGeolocation.ts

**Goal**: Non-blocking browser geolocation (silent failure)

```typescript
// hooks/useGeolocation.ts
'use client';

import { useEffect, useState } from 'react';

export function useGeolocation() {
  const [coords, setCoords] = useState<[number, number] | null>(null);

  useEffect(() => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude  } = position.coords;
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
```

---

## Phase 3 — hooks/useRoutes.ts (Complete implementation)

**Goal**: Journey state + geocoding + debounce

```typescript
// hooks/useRoutes.ts
'use client';

import { useEffect, useState, useCallback } from 'react';
import { JourneyState } from '@/types';
import { geocodeWithCache } from '@/lib/geocoding';
import { useGeolocation } from './useGeolocation';

export function useRoutes() {
  const geolocationCoords = useGeolocation();
  
  const [state, setState] = useState<JourneyState>({
    origin: '',
    destination: '',
    originCoords: null,
    destinationCoords: null,
    routes: [],
    selectedMode: null,
    isLoading: false,
    error: null,
  });

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

  return { state, handleOriginChange, handleDestinationChange };
}
```

---

## Phase 4 — components/panel/JourneyPlanner.tsx

**Goal**: Full Journey Planner Card

```typescript
// components/panel/JourneyPlanner.tsx
'use client';

import React from 'react';
import { useRoutes } from '@/hooks/useRoutes';

export default function JourneyPlanner() {
  const { state, handleOriginChange, handleDestinationChange } = useRoutes();
  const [ecoModeActive, setEcoModeActive] = React.useState(true);

  const inputStyle: React.CSSProperties = {
    width: '100%',
    background: 'var(--eco-input)',
    border: '1px solid var(--eco-border)',
    borderRadius: '10px',
    padding: '12px 16px',
    color: 'var(--eco-text)',
    fontSize: '15px',
    outline: 'none',
    boxSizing: 'border-box',
    fontFamily: 'inherit',
  };

  return (
    <div style={{ padding: '20px' }}>
      {/* Section label */}
      <div
        style={{
          fontSize: '10px',
          textTransform: 'uppercase',
          letterSpacing: '0.12em',
          color: 'var(--eco-muted)',
          marginBottom: '16px',
          fontWeight: 600,
        }}
      >
        Plan Your Journey
      </div>

      {/* Card */}
      <div
        style={{
          background: 'var(--eco-surface)',
          borderRadius: '16px',
          padding: '20px',
          marginBottom: '20px',
          border: '1px solid var(--eco-border)',
        }}
      >
        {/* Origin */}
        <div style={{ marginBottom: '16px' }}>
          <input
            type="text"
            placeholder="Enter starting point"
            value={state.origin}
            onChange={(e) => handleOriginChange(e.target.value)}
            style={inputStyle}
          />
          {state.originCoords && state.origin && (
            <div style={{ fontSize: '12px', color: 'var(--eco-green)', marginTop: '4px' }}>
              ● {state.origin}
            </div>
          )}
        </div>

        {/* Destination */}
        <div style={{ marginBottom: '16px' }}>
          <input
            type="text"
            placeholder="Enter destination"
            value={state.destination}
            onChange={(e) => handleDestinationChange(e.target.value)}
            style={inputStyle}
          />
          {state.destinationCoords && state.destination && (
            <div style={{ fontSize: '12px', color: 'var(--eco-amber)', marginTop: '4px' }}>
              ● {state.destination}
            </div>
          )}
        </div>

        {/* Error */}
        {state.error && (
          <div style={{ fontSize: '12px', color: 'var(--eco-orange)', marginBottom: '16px' }}>
            {state.error}
          </div>
        )}

        {/* Eco Mode Badge */}
        {(state.origin || state.destination) && (
          <div
            onClick={() => setEcoModeActive(!ecoModeActive)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              border: '1px solid var(--eco-green)',
              borderRadius: '20px',
              padding: '6px 12px',
              fontSize: '12px',
              color: 'var(--eco-green)',
              cursor: 'pointer',
              userSelect: 'none',
            }}
          >
            <span>{ecoModeActive ? '✓' : '○'}</span>
            <span>{ecoModeActive ? 'Eco mode active' : 'Eco mode off'}</span>
          </div>
        )}
      </div>
    </div>
  );
}
```

---

## Phase 5 — components/map/MarkerLayer.tsx

**Goal**: Display markers + auto-pan map

```typescript
// components/map/MarkerLayer.tsx
'use client';

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
        border: '3px solid var(--eco-green)',
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
        border: '3px solid var(--eco-amber)',
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
```

---

## Phase 6 — Modify EcoMap component to expose map ref

**Current**: EcoMap is an internal component, map instance not accessible

**Solution**: Use callback ref to expose map to parent

```typescript
// components/map/EcoMap.tsx (MODIFY)
// Add these lines at top and bottom

// At top, after imports:
const mapRefCallback = new Map<string, (map: maplibregl.Map) => void>();

// In useEffect, after map creation:
Object.values(mapRefCallback).forEach(cb => cb(mapRef.current!));

// Then export a function to register callback:
export function registerMapCallback(key: string, callback: (map: maplibregl.Map) => void) {
  mapRefCallback.set(key, callback);
}
```

Actually, this is complex. Better approach: Make EcoMap accept a ref prop directly.

Better: Modify EcoMap to accept `mapRef` prop:

```typescript
// components/map/EcoMap.tsx

interface Props {
  mapRef?: React.MutableRefObject<maplibregl.Map | null>;
}

export default function EcoMap({ mapRef }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const localMapRef = useRef<maplibregl.Map | null>(null);

  useEffect(() => {
    if (!containerRef.current || localMapRef.current) return;

    localMapRef.current = new maplibregl.Map({...});
    
    // Expose to parent
    if (mapRef) {
      mapRef.current = localMapRef.current;
    }

    // ... rest of code, using localMapRef everywhere
  }, [mapRef]);
  
  // ... rest
}
```

---

## Phase 7 — Modify app/page.tsx

**Goal**: Connect state to components + pass map ref

Look for the section where EcoMap is rendered and MarkerLayer should be placed.

Replace the simple `<EcoMap />` render with a more complex wrapper that manages state.

---

## Verification Checklist

After completing all phases, verify:

- [ ] Typing in origin field shows geocoding result (with green dot) after 500ms debounce
- [ ] Typing in destination field shows geocoding result (with amber dot) after 500ms debounce
- [ ] Both markers appear on map simultaneously
- [ ] Map pans to fit both markers in viewport (or single if only one filled)
- [ ] Invalid location "xyz" shows error message: "Couldn't find that location. Try being more specific."
- [ ] Error clears when input is modified
- [ ] Clearing input field removes corresponding marker from map
- [ ] Eco mode badge toggles on/off (visual only for now)
- [ ] Typing same location twice uses cached result (instant, no network wait)
- [ ] Session cache persists across page refreshes (within 1 hour)
- [ ] Browser geolocation permission denied → no error shown, user can type manually
- [ ] `npm run typecheck` passes with 0 errors
- [ ] `npm run build` completes without errors

---

## Common Pitfalls

**Pitfall 1**: MapLibre ref not accessible from parent
- **Fix**: Pass mapRef prop to EcoMap component and set it in useEffect

**Pitfall 2**: Debounce timers accumulate/leak
- **Fix**: Always clear previous timer before setting new one, and cleanup in return of useEffect

**Pitfall 3**: sessionStorage throws error in browser
- **Fix**: Check `typeof window === 'undefined'` first, wrap in try/catch

**Pitfall 4**: Nominatim returns error JSON without throwing
- **Fix**: Check `res.ok` before parsing, handle empty array case

**Pitfall 5**: Marker coordinates in wrong order
- **Fix**: MapLibre uses [longitude, latitude], NOT [lat, lng]

---

## Rules Validation

**Sacred Rule Check:**
- ✅ `config/emissions.ts` NOT touched
- ✅ No NEXT_PUBLIC_ORS_API_KEY introduced
- ✅ All localStorage keys prefixed with 'ecoroute:' (geocoding cache uses sessionStorage, which is fine)

**API Key Safety:**
- ✅ ORS_API_KEY still server-side only (not introduced in this task)
- ✅ Nominatim geocoding requires no key (free public API)

---

## Lessons Learned (Phase 002)

- **CSS variables in JS-created DOM nodes:**
  - When creating custom marker elements for MapLibre using JavaScript, CSS variables (e.g., `var(--eco-green)`) may not be reliably applied because the marker DOM is not always in the same CSS scope as the app. Use explicit hex color values for critical UI elements like marker borders to guarantee visibility.

- **Geocoding API etiquette:**
  - Always set a custom User-Agent header when using Nominatim, as required by their ToS. This avoids being rate-limited or blocked.
  - Implement sessionStorage caching and debounce input to respect public API rate limits and improve UX.

- **React state and refs in Next.js App Router:**
  - Any page/component using React hooks like `useRef` or `useState` must be marked as a Client Component (`'use client'` at the top). Otherwise, Next.js will throw a build error.

- **Dynamic imports for browser-only libraries:**
  - MapLibre GL JS must be dynamically imported with SSR disabled to avoid server-side rendering errors in Next.js.

- **Map marker visibility:**
  - For dark map backgrounds, use white marker backgrounds with colored borders and a drop shadow for maximum contrast.

- **Error handling:**
  - Always provide user-friendly error messages for failed geocoding, and clear errors as soon as the user edits the input.

- **Cleanup:**
  - Always remove old markers and clear debounce timers on component unmount to prevent memory leaks and UI glitches.

---

## Completion Log

- [ ] Phase 1: lib/geocoding.ts — Nominatim wrapper + session cache
- [ ] Phase 2: hooks/useGeolocation.ts — Browser geolocation hook
- [ ] Phase 3: hooks/useRoutes.ts — Full state + debounce logic
- [ ] Phase 4: components/panel/JourneyPlanner.tsx — Form UI
- [ ] Phase 5: components/map/MarkerLayer.tsx — Map markers + auto-pan
- [ ] Phase 6: components/map/EcoMap.tsx — Accept mapRef prop
- [ ] Phase 7: app/page.tsx — Connect state + pass refs
- [ ] Verification checklist — all items passing
- [ ] `npm run typecheck` — 0 errors
- [ ] `npm run build` — Successful
- [ ] **TASK 002 COMPLETE ✅ — Ready for Task 003
