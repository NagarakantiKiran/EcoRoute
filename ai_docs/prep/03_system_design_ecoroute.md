# EcoRoute — System Design
*Prep Document 03 | The Build Sprint*

---

## Core Approach: Next.js Web App, Mobile-Responsive

EcoRoute is a **single Next.js application** that works on both web and mobile browsers.
No native app in V1. No React Native. No Expo. Just a well-optimised web app.

This is the most important technical decision. Do not deviate from it.

Reasons:
- Zero install barrier — user clicks a link, app works
- One codebase ships to all platforms
- OpenRouteService and MapLibre GL JS work perfectly in browser
- Local storage handles footprint data without a backend
- Vercel deploys it globally in minutes

---

## Architecture Overview

```
User opens ecoroute.app (or localhost:3000)
        ↓
Next.js App Router loads
        ↓
MapLibre GL JS initialises (dark green tile theme)
  → OpenFreeMap tiles load (free, no API key)
  → User's geolocation requested (optional)
        ↓
User enters origin + destination
  → Nominatim geocoding API called (OpenStreetMap, free)
  → Returns lat/lng for both points
        ↓
OpenRouteService API called (3 parallel requests)
  → /directions/foot-walking      (walking route)
  → /directions/cycling-regular   (cycling route)
  → /directions/driving-car       (car route)
        ↓
CO₂ calculation runs client-side
  → distance_km × emission_factor per mode
  → Eco grade assigned (A/B/C/D)
        ↓
Routes rendered on map (MapLibre GL JS)
Route cards rendered in left panel
Carbon saved widget updated
        ↓
User taps "Start greenest route"
  → Trip logged to localStorage
  → Footprint dashboard updated
```

---

## Tech Stack — Exact Choices

```
FRONTEND:
  Framework:      Next.js 14 (App Router)
  Language:       TypeScript
  Styling:        Tailwind CSS + CSS variables for theme
  Map engine:     MapLibre GL JS (free, open source)
  Map tiles:      OpenFreeMap (free, no API key needed)
  Icons:          Lucide React
  Fonts:          Geist (Vercel's font, clean, modern)

ROUTING & GEO:
  Routing API:    OpenRouteService (free tier: 2,000 req/day)
  Geocoding:      Nominatim (OpenStreetMap, free, no key)
  Fallback:       OSRM public demo server (if ORS limit hit)

DATA STORAGE (V1):
  User footprint: localStorage (browser, no backend)
  Trip history:   localStorage
  Preferences:    localStorage
  NO database in V1

DEPLOYMENT:
  Hosting:        Vercel (free tier)
  Domain:         ecoroute.app (or similar)
  CI/CD:          GitHub → Vercel auto-deploy on push
  Environment:    .env.local for API keys

API KEYS NEEDED:
  NEXT_PUBLIC_ORS_API_KEY=   (OpenRouteService — free signup)
  No other keys required for V1
```

---

## Project Structure

```
ecoroute/
├── app/
│   ├── layout.tsx              ← Root layout, fonts, metadata
│   ├── page.tsx                ← Main app page (map + panel)
│   ├── dashboard/
│   │   └── page.tsx            ← Carbon footprint dashboard
│   └── api/
│       └── route/
│           └── route.ts        ← Server-side ORS proxy (hides API key)
│
├── components/
│   ├── map/
│   │   ├── EcoMap.tsx          ← MapLibre map container
│   │   ├── RouteLayer.tsx      ← Route lines on map
│   │   └── MarkerLayer.tsx     ← Origin/destination markers
│   ├── panel/
│   │   ├── JourneyPlanner.tsx  ← Origin + destination inputs
│   │   ├── RouteCard.tsx       ← Individual route option card
│   │   ├── RouteOptions.tsx    ← List of route cards
│   │   └── StartButton.tsx     ← Primary CTA
│   ├── widgets/
│   │   ├── CarbonSavedWidget.tsx ← Bottom-right map overlay
│   │   └── EcoModeBadge.tsx    ← "Eco mode active" pill
│   └── dashboard/
│       ├── FootprintChart.tsx  ← Weekly CO₂ savings chart
│       └── TripHistory.tsx     ← List of past trips
│
├── lib/
│   ├── co2.ts                  ← CO₂ calculation logic
│   ├── ecoGrade.ts             ← A/B/C/D grade assignment
│   ├── geocoding.ts            ← Nominatim wrapper
│   ├── routing.ts              ← OpenRouteService wrapper
│   └── storage.ts              ← localStorage read/write helpers
│
├── hooks/
│   ├── useRoutes.ts            ← Fetches + stores route results
│   ├── useFootprint.ts         ← Reads/writes footprint from storage
│   └── useGeolocation.ts       ← Browser geolocation hook
│
├── types/
│   └── index.ts                ← All TypeScript interfaces
│
├── config/
│   └── emissions.ts            ← Emission factors constants
│
└── styles/
    └── globals.css             ← CSS variables, dark green theme
```

---

## Data Flow — Route Request

### Step 1: Geocoding
```typescript
// lib/geocoding.ts
// Nominatim — free, no API key, rate limit: 1 req/sec
async function geocode(query: string): Promise<[number, number]> {
  const url = `https://nominatim.openstreetmap.org/search`
    + `?q=${encodeURIComponent(query)}&format=json&limit=1`;
  const res = await fetch(url, {
    headers: { 'User-Agent': 'EcoRoute/1.0 (ecoroute.app)' }
    // Nominatim requires a User-Agent header — always include this
  });
  const data = await res.json();
  return [parseFloat(data[0].lon), parseFloat(data[0].lat)];
}
```

### Step 2: Routing (via server-side API proxy)
```typescript
// app/api/route/route.ts
// Server-side proxy — hides ORS API key from client bundle
export async function POST(req: Request) {
  const { origin, destination, profile } = await req.json();
  // profile: 'foot-walking' | 'cycling-regular' | 'driving-car'

  const res = await fetch(
    `https://api.openrouteservice.org/v2/directions/${profile}/geojson`,
    {
      method: 'POST',
      headers: {
        'Authorization': process.env.ORS_API_KEY!,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        coordinates: [origin, destination],
        instructions: false,  // We don't need turn-by-turn in V1
      }),
    }
  );
  return Response.json(await res.json());
}
```

### Step 3: CO₂ Calculation
```typescript
// lib/co2.ts
// Emission factors from IPCC / Our World in Data
export const EMISSION_FACTORS = {
  walking:  0,    // g CO₂ per km
  cycling:  0,    // g CO₂ per km
  driving:  120,  // g CO₂ per km (average petrol car)
  ev:       40,   // g CO₂ per km (average grid mix)
  transit:  89,   // g CO₂ per km per passenger (bus)
} as const;

export function calculateCO2(
  distanceMeters: number,
  mode: keyof typeof EMISSION_FACTORS
): number {
  const distanceKm = distanceMeters / 1000;
  return (distanceKm * EMISSION_FACTORS[mode]) / 1000; // Returns kg CO₂
}

export function calculateCO2Saved(
  distanceMeters: number,
  chosenMode: keyof typeof EMISSION_FACTORS
): number {
  const baseline = calculateCO2(distanceMeters, 'driving');
  const actual = calculateCO2(distanceMeters, chosenMode);
  return Math.max(0, baseline - actual); // Never negative
}
```

### Step 4: Eco Grade Assignment
```typescript
// lib/ecoGrade.ts
// Grade based on CO₂ per km (grams)
export function getEcoGrade(co2PerKm: number): 'A' | 'B' | 'C' | 'D' {
  if (co2PerKm <= 20)  return 'A';  // Walk, cycle, EV short trip
  if (co2PerKm <= 60)  return 'B';  // EV, shared transport
  if (co2PerKm <= 120) return 'C';  // Average petrol car
  return 'D';                        // SUV, heavy traffic, long drive
}

export const GRADE_COLORS = {
  A: '#52b788',  // Accent green
  B: '#a8c5a0',  // Muted green
  C: '#f4a261',  // Amber
  D: '#e07c3a',  // Orange
} as const;
```

---

## Local Storage Schema

All user data stored in browser localStorage. No backend, no accounts in V1.

```typescript
// types/index.ts

// Key: 'ecoroute:trips'
interface Trip {
  id: string;               // uuid
  timestamp: number;        // Unix ms
  origin: string;           // Display name
  destination: string;      // Display name
  mode: TransportMode;      // 'walking' | 'cycling' | 'driving' | 'ev'
  distanceKm: number;
  co2Kg: number;            // Actual CO₂ for chosen mode
  co2SavedKg: number;       // vs baseline car
  ecoGrade: EcoGrade;       // 'A' | 'B' | 'C' | 'D'
}

// Key: 'ecoroute:footprint'
interface FootprintSummary {
  totalCO2SavedKg: number;
  totalTrips: number;
  tripsByMode: Record<TransportMode, number>;
  lastUpdated: number;      // Unix ms
}

// Key: 'ecoroute:preferences'
interface UserPreferences {
  ecoModeActive: boolean;   // Default: true
  defaultMode: TransportMode | 'auto'; // Default: 'auto'
  homeLocation?: string;    // Optional saved home address
}
```

```typescript
// lib/storage.ts — helpers
const KEYS = {
  TRIPS: 'ecoroute:trips',
  FOOTPRINT: 'ecoroute:footprint',
  PREFS: 'ecoroute:preferences',
} as const;

export function saveTrip(trip: Trip): void {
  const existing = getTrips();
  const updated = [trip, ...existing].slice(0, 100); // Keep last 100 trips
  localStorage.setItem(KEYS.TRIPS, JSON.stringify(updated));
  recalculateFootprint(updated);
}

export function getFootprint(): FootprintSummary {
  const raw = localStorage.getItem(KEYS.FOOTPRINT);
  return raw ? JSON.parse(raw) : DEFAULT_FOOTPRINT;
}
```

---

## Map Configuration

### MapLibre GL JS Setup
```typescript
// components/map/EcoMap.tsx
const MAP_CONFIG = {
  style: 'https://tiles.openfreemap.org/styles/dark', // Free dark tiles
  center: [78.9629, 20.5937] as [number, number],     // India center
  zoom: 4,
  attributionControl: false, // Custom attribution in corner
};

// Route line paint properties
const ROUTE_STYLES = {
  greenest: { 'line-color': '#52b788', 'line-width': 5, 'line-opacity': 1 },
  fastest:  { 'line-color': '#f4a261', 'line-width': 3, 'line-opacity': 0.7 },
  transit:  { 'line-color': '#e07c3a', 'line-width': 3, 'line-opacity': 0.6,
              'line-dasharray': [2, 2] },
};
```

### Map Color Override (Dark Green Theme)
OpenFreeMap's default dark theme uses blue-grey tones.
We override key colors to match EcoRoute's forest green palette:

```css
/* styles/globals.css */
/* MapLibre canvas gets a green tint overlay via CSS filter */
.maplibregl-canvas {
  filter: hue-rotate(120deg) saturate(0.6) brightness(0.85);
}
/* This shifts the blue-grey dark basemap toward green-grey */
/* Adjust values after seeing the result — may need tuning */
```

---

## API Rate Limits & Handling

```
OpenRouteService (free tier):
  Limit: 2,000 requests/day, 40 requests/minute
  Per route search: 3 requests (walk + cycle + drive)
  Safe daily searches: ~666 searches/day on free tier
  
  When limit hit:
    → Show user: "Route service busy, try again shortly"
    → Fallback: OSRM public demo server (no key, no limit but slower)
    → Log error to Vercel logs

Nominatim (geocoding):
  Limit: 1 request/second (enforce with debounce)
  Debounce input: 500ms after user stops typing
  Cache: store geocoded results in sessionStorage to avoid repeat calls
  
  When limit hit:
    → Retry after 1 second
    → No user-facing error unless 3 retries fail

OpenFreeMap tiles:
  No limit — CDN-served, completely free
  Tiles cached by browser after first load
```

---

## Carbon Equivalent Strings

The "= X km of forest absorbed" line in the widget.
These are calculated from CO₂ saved and shown as human-readable equivalents.

```typescript
// lib/co2.ts
export function getCO2Equivalent(co2SavedKg: number): string {
  if (co2SavedKg <= 0)    return '';
  if (co2SavedKg < 0.5)   return `= ${Math.round(co2SavedKg * 1000)}g avoided`;
  if (co2SavedKg < 2)     return `= ${Math.round(co2SavedKg * 0.417)} km of forest absorbed`;
  if (co2SavedKg < 10)    return `= ${Math.round(co2SavedKg * 3)} trees saved today`;
  return `= ${Math.round(co2SavedKg / 2.3)} kg of coal not burned`;
}
// Source: 1 km² of temperate forest absorbs ~2.4 kg CO₂/day
// Scale down to per-km: ≈ 0.0024 kg/m, invert → 1 kg CO₂ ≈ 417m of forest
```

---

## Performance Architecture

```
WHAT LOADS ON FIRST PAINT (< 1.5s target):
  ✓ App shell (HTML + CSS)
  ✓ Left panel (journey planner inputs)
  ✓ Map canvas (tiles start loading)
  
WHAT LOADS ON INTERACTION:
  → Geocoding result (after user types + debounce)
  → Route data (after both fields filled)
  → Route lines on map (after route data arrives)

WHAT NEVER BLOCKS:
  → localStorage reads (synchronous but fast)
  → CO₂ calculation (pure math, < 1ms)
  → Eco grade (pure function, < 1ms)

BUNDLE SIZE TARGETS:
  Initial JS bundle: < 150kb gzipped
  MapLibre GL JS: loaded async, ~250kb (large but unavoidable)
  Tailwind CSS: < 20kb (purged in production)
```

---

## V1 Scope Boundary — What Is Explicitly Excluded

```
EXCLUDED FROM V1 (do not build, do not reference):
  ✗ User authentication / accounts
  ✗ Backend database (Postgres, Supabase, etc.)
  ✗ Public transit routing (GTFS data complexity)
  ✗ Real-time navigation / turn-by-turn
  ✗ Push notifications
  ✗ Social features (leaderboard, sharing cards)
  ✗ Gamification (streaks, badges)
  ✗ Native iOS / Android app
  ✗ Offline support / service worker
  ✗ Carbon offset purchasing
  ✗ Corporate fleet dashboard
  ✗ Traffic data integration
  ✗ Elevation data for cycling difficulty
  ✗ Multi-stop / waypoint routing
  ✗ Saved favourite routes
  ✗ EV charging station overlay

ALL OF THE ABOVE → Backlog. Do not touch in V1.
```

---

## Environment Variables

```bash
# .env.local (never commit this file)
ORS_API_KEY=your_openrouteservice_key_here

# .env.local for development overrides
NEXT_PUBLIC_MAP_CENTER_LNG=78.9629
NEXT_PUBLIC_MAP_CENTER_LAT=20.5937
NEXT_PUBLIC_MAP_ZOOM=12

# These are public (NEXT_PUBLIC_ prefix) — safe to expose
# The ORS_API_KEY must NOT have NEXT_PUBLIC_ prefix — server-side only
```

---

## Deployment

```
PRODUCTION:
  Platform: Vercel (free tier)
  Build command: next build
  Output: Static + serverless functions
  Deploy trigger: git push to main branch
  
PREVIEW ENVIRONMENTS:
  Every pull request gets a preview URL automatically
  Pattern: ecoroute-git-{branch}-{team}.vercel.app
  
DOMAIN:
  Custom domain configured in Vercel dashboard
  SSL: automatic via Vercel
  
MONITORING:
  Vercel Analytics (free): page views, performance
  Vercel Logs: API route errors
  No external monitoring in V1
```

---

## TypeScript Interfaces — Core Types

```typescript
// types/index.ts

export type TransportMode = 'walking' | 'cycling' | 'driving' | 'ev';
export type EcoGrade = 'A' | 'B' | 'C' | 'D';

export interface RouteResult {
  mode: TransportMode;
  distanceMeters: number;
  durationSeconds: number;
  geometry: GeoJSON.LineString;   // For drawing on map
  co2Kg: number;
  co2SavedKg: number;
  ecoGrade: EcoGrade;
  label: string;                   // "Greenest path" | "Fastest route" | "Walking"
}

export interface JourneyState {
  origin: string;                  // Display text
  destination: string;             // Display text
  originCoords: [number, number] | null;
  destinationCoords: [number, number] | null;
  routes: RouteResult[];
  selectedMode: TransportMode | null;
  isLoading: boolean;
  error: string | null;
}

export interface Trip {
  id: string;
  timestamp: number;
  origin: string;
  destination: string;
  mode: TransportMode;
  distanceKm: number;
  co2Kg: number;
  co2SavedKg: number;
  ecoGrade: EcoGrade;
}

export interface FootprintSummary {
  totalCO2SavedKg: number;
  totalTrips: number;
  tripsByMode: Record<TransportMode, number>;
  lastUpdated: number;
}
```

---

## Error States

```typescript
// Every API call has a defined error state shown to the user

GEOCODING_FAILED:
  UI: "Couldn't find that location. Try being more specific."
  Action: Clear coords, keep input text

ROUTING_FAILED:
  UI: "Couldn't calculate routes right now. Try again."
  Action: Show retry button, log to console

ROUTING_RATE_LIMITED:
  UI: "Route service is busy. Trying backup..."
  Action: Silent fallback to OSRM, retry once

NO_WALKING_ROUTE:
  UI: Hide walking card (some destinations not walkable)
  Action: Show only cycling + driving cards

GEOLOCATION_DENIED:
  UI: Don't show error — just don't autofill origin
  Action: User manually types origin, no friction
```

---

## CLAUDE.md Update

Add this section when starting development. This is the instruction file for AI coding assistants.

```markdown
## EcoRoute — Read This First

EcoRoute is an eco-friendly route finder web app.
Stack: Next.js 14 (App Router), TypeScript, Tailwind CSS, MapLibre GL JS.

## What we are building
Single Next.js app that:
1. Takes origin + destination input
2. Fetches walking, cycling, driving routes from OpenRouteService
3. Calculates CO₂ per route using emission factors
4. Assigns eco grades (A/B/C/D) to each route
5. Renders routes on a MapLibre GL JS dark-green map
6. Stores trip history in localStorage (no backend)
7. Shows personal carbon footprint dashboard

## Key files
- lib/co2.ts          → CO₂ math, never change emission factors without source
- lib/routing.ts      → ORS API wrapper
- config/emissions.ts → Single source of truth for emission factors
- app/api/route/      → Server-side proxy (keeps API key server-side)

## Rules
- ORS_API_KEY must stay server-side only (no NEXT_PUBLIC_ prefix)
- All localStorage keys prefixed with 'ecoroute:'
- CO₂ calculations always in kg (not grams) in the UI layer
- Emission factors sourced from IPCC — do not change without updating the source comment
- Run npm run typecheck before every commit — must pass zero errors
- Mobile-first CSS — test at 375px width before desktop
```
