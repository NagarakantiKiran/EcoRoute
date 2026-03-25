# Task 001 — Project Scaffold & Map Shell
*EcoRoute Build Sprint*

**Depends on**: Nothing — this is the first task
**Estimated time**: 2–3 hours
**Prep docs**: 03_system_design.md (Architecture, Tech Stack, Map Configuration), 02_ui_design.md (Color Palette, Layout Philosophy)

---

## Context — Current State

Nothing exists yet. This task creates the entire project from scratch —
the Next.js app, all empty file stubs, CSS variables, and a working map shell.

By the end of this task: running `npm run dev` shows a split-panel layout
with a real dark-green MapLibre map on the right and an empty left panel.
No routing logic, no inputs, no data — just the skeleton everything else builds on.

---

## What This Task Does

- Initialises Next.js 14 with TypeScript and Tailwind CSS
- Installs all project dependencies (MapLibre, Lucide, etc.)
- Creates every file and folder in the project structure (stubs where needed)
- Sets up CSS variables for the entire EcoRoute brand palette
- Renders the split-panel layout shell (40% left panel / 60% map)
- Renders MapLibre GL JS with dark OpenFreeMap tiles
- Configures the dynamic import fix for MapLibre SSR crash
- Creates CLAUDE.md with project rules
- Creates .env.example with the correct key name (ORS_API_KEY — NOT NEXT_PUBLIC_)

---

## Files To Open Before Starting

```
02_ui_design.md     — color palette values (lines 16–41)
03_system_design.md — project structure (lines 94–143), map config (lines 301–334)
```

Nothing in the codebase to read — it doesn't exist yet.

---

## Dependencies — Install These Exactly

```bash
npx create-next-app@14 ecoroute --typescript --tailwind --eslint --app --src-dir=no --import-alias="@/*"
cd ecoroute
npm install maplibre-gl
npm install lucide-react
npm install @types/geojson
```

No other dependencies in V1. Do not install chart libraries, date libraries,
animation libraries, or anything not listed here.

---

## Phase 1 — Create All File Stubs

**Goal**: Every file in the project structure exists before any code is written.
This prevents import errors when wiring things together in later tasks.

Create the following files. Files marked `[STUB]` get only the minimum
export needed to satisfy TypeScript — no implementation yet.

### Folder structure to create

```
mkdir -p components/map
mkdir -p components/panel
mkdir -p components/widgets
mkdir -p components/dashboard
mkdir -p lib
mkdir -p hooks
mkdir -p types
mkdir -p config
mkdir -p app/dashboard
mkdir -p app/api/route
```

### Files and their stub contents

- [ ] **Step 1.1** — `types/index.ts`
  - This is NOT a stub — write the full TypeScript interfaces now.
  - They are needed by every other file from Task 002 onwards.
  - Copy exactly from 03_system_design.md "TypeScript Interfaces — Core Types" section.
  - Full content:

```typescript
export type TransportMode = 'walking' | 'cycling' | 'driving' | 'ev';
export type EcoGrade = 'A' | 'B' | 'C' | 'D';

export interface RouteResult {
  mode: TransportMode;
  distanceMeters: number;
  durationSeconds: number;
  geometry: GeoJSON.LineString;
  co2Kg: number;
  co2SavedKg: number;
  ecoGrade: EcoGrade;
  label: string;
}

export interface JourneyState {
  origin: string;
  destination: string;
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

export interface UserPreferences {
  ecoModeActive: boolean;
  defaultMode: TransportMode | 'auto';
  homeLocation?: string;
}
```

- [ ] **Step 1.2** — `config/emissions.ts`
  - This is NOT a stub — write the full emission factors now.
  - This is the sacred single source of truth. All CO₂ math imports from here.

```typescript
// Emission factors: grams of CO₂ per kilometre
// Source: IPCC / Our World in Data
// Do not change these values without updating the source reference above.
export const EMISSION_FACTORS = {
  walking:  0,    // human-powered — zero direct emissions
  cycling:  0,    // human-powered — zero direct emissions
  driving:  120,  // average petrol car (IPCC global average)
  ev:       40,   // average EV on mixed grid (IPCC, varies by country)
  transit:  89,   // bus, per passenger km
} as const;

export type EmissionMode = keyof typeof EMISSION_FACTORS;
```

- [ ] **Step 1.3** — `lib/co2.ts` [STUB]

```typescript
import { EMISSION_FACTORS, EmissionMode } from '@/config/emissions';
import { EcoGrade } from '@/types';

export function calculateCO2(distanceMeters: number, mode: EmissionMode): number {
  // Task 003
  return 0;
}

export function calculateCO2Saved(distanceMeters: number, chosenMode: EmissionMode): number {
  // Task 003
  return 0;
}

export function getCO2Equivalent(co2SavedKg: number): string {
  // Task 003
  return '';
}
```

- [ ] **Step 1.4** — `lib/ecoGrade.ts` [STUB]

```typescript
import { EcoGrade } from '@/types';

export function getEcoGrade(co2PerKm: number): EcoGrade {
  // Task 003
  return 'A';
}

export const GRADE_COLORS: Record<EcoGrade, string> = {
  A: '#52b788',
  B: '#a8c5a0',
  C: '#f4a261',
  D: '#e07c3a',
};
```

- [ ] **Step 1.5** — `lib/geocoding.ts` [STUB]

```typescript
export async function geocode(query: string): Promise<[number, number] | null> {
  // Task 002
  return null;
}
```

- [ ] **Step 1.6** — `lib/routing.ts` [STUB]

```typescript
import { RouteResult } from '@/types';

export async function fetchRoutes(
  origin: [number, number],
  destination: [number, number]
): Promise<RouteResult[]> {
  // Task 003
  return [];
}
```

- [ ] **Step 1.7** — `lib/storage.ts` [STUB]

```typescript
import { Trip, FootprintSummary, UserPreferences } from '@/types';

export function saveTrip(trip: Trip): void {
  // Task 004
}

export function getTrips(): Trip[] {
  // Task 004
  return [];
}

export function getFootprint(): FootprintSummary {
  // Task 005
  return { totalCO2SavedKg: 0, totalTrips: 0, tripsByMode: { walking: 0, cycling: 0, driving: 0, ev: 0 }, lastUpdated: 0 };
}
```

- [ ] **Step 1.8** — `hooks/useRoutes.ts` [STUB]

```typescript
import { JourneyState } from '@/types';

export function useRoutes() {
  // Task 002 + 003
  const state: JourneyState = {
    origin: '', destination: '',
    originCoords: null, destinationCoords: null,
    routes: [], selectedMode: null,
    isLoading: false, error: null,
  };
  return { state };
}
```

- [ ] **Step 1.9** — `hooks/useGeolocation.ts` [STUB]

```typescript
export function useGeolocation() {
  // Task 002
  return { coords: null as [number, number] | null, error: null as string | null };
}
```

- [ ] **Step 1.10** — `hooks/useFootprint.ts` [STUB]

```typescript
import { FootprintSummary } from '@/types';

export function useFootprint() {
  // Task 005
  return { footprint: null as FootprintSummary | null };
}
```

- [ ] **Step 1.11** — `components/map/RouteLayer.tsx` [STUB]

```typescript
export default function RouteLayer() {
  // Task 003
  return null;
}
```

- [ ] **Step 1.12** — `components/map/MarkerLayer.tsx` [STUB]

```typescript
export default function MarkerLayer() {
  // Task 002
  return null;
}
```

- [ ] **Step 1.13** — `components/panel/JourneyPlanner.tsx` [STUB]

```typescript
export default function JourneyPlanner() {
  return (
    <div style={{ padding: '20px' }}>
      <p style={{ color: '#7a9e7e', fontSize: '12px' }}>Journey planner — Task 002</p>
    </div>
  );
}
```

- [ ] **Step 1.14** — `components/panel/RouteCard.tsx` [STUB]

```typescript
import { RouteResult } from '@/types';

interface Props { route: RouteResult; isSelected: boolean; onSelect: () => void; }

export default function RouteCard({ route }: Props) {
  // Task 004
  return null;
}
```

- [ ] **Step 1.15** — `components/panel/RouteOptions.tsx` [STUB]

```typescript
export default function RouteOptions() {
  // Task 004
  return null;
}
```

- [ ] **Step 1.16** — `components/panel/StartButton.tsx` [STUB]

```typescript
export default function StartButton() {
  // Task 004
  return null;
}
```

- [ ] **Step 1.17** — `components/widgets/CarbonSavedWidget.tsx` [STUB]

```typescript
export default function CarbonSavedWidget() {
  // Task 004
  return null;
}
```

- [ ] **Step 1.18** — `components/widgets/EcoModeBadge.tsx` [STUB]

```typescript
export default function EcoModeBadge() {
  // Task 004
  return null;
}
```

- [ ] **Step 1.19** — `components/dashboard/FootprintChart.tsx` [STUB]

```typescript
export default function FootprintChart() {
  // Task 005
  return null;
}
```

- [ ] **Step 1.20** — `components/dashboard/TripHistory.tsx` [STUB]

```typescript
export default function TripHistory() {
  // Task 005
  return null;
}
```

- [ ] **Step 1.21** — `app/dashboard/page.tsx` [STUB]

```typescript
export default function DashboardPage() {
  return (
    <main style={{ background: '#0d1f12', minHeight: '100vh', color: '#f0f4f0', padding: '2rem' }}>
      <p>Dashboard — Task 005</p>
    </main>
  );
}
```

- [ ] **Step 1.22** — `app/api/route/route.ts` [STUB]

```typescript
export async function POST(req: Request) {
  // Task 003 — ORS proxy
  // ORS_API_KEY lives HERE ONLY. Never NEXT_PUBLIC_.
  return Response.json({ error: 'Not implemented yet' }, { status: 501 });
}
```

---

## Phase 2 — CSS Variables & Global Styles

**Goal**: All brand colors defined as CSS variables in one place.
Every component uses these variables — never hardcoded hex values.

- [ ] **Step 2.1** — `styles/globals.css`
  - Replace the default Tailwind globals with this:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --eco-bg:        #0d1f12;
  --eco-surface:   #1a2e1d;
  --eco-input:     #162219;
  --eco-green:     #52b788;
  --eco-green-dim: #3ddc84;
  --eco-amber:     #f4a261;
  --eco-orange:    #e07c3a;
  --eco-text:      #f0f4f0;
  --eco-muted:     #7a9e7e;
  --eco-border:    rgba(82, 183, 136, 0.15);

  --grade-a: #52b788;
  --grade-b: #a8c5a0;
  --grade-c: #f4a261;
  --grade-d: #e07c3a;
}

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

html,
body {
  height: 100%;
  background-color: var(--eco-bg);
  color: var(--eco-text);
  font-family: var(--font-geist-sans), system-ui, sans-serif;
  -webkit-font-smoothing: antialiased;
}

/* MapLibre canvas — green tint overlay */
/* Shifts blue-grey dark tiles toward forest green */
/* Adjust hue-rotate and saturation if result looks off */
.maplibregl-canvas {
  filter: hue-rotate(120deg) saturate(0.6) brightness(0.85);
}

/* MapLibre attribution — keep it subtle */
.maplibregl-ctrl-attrib {
  font-size: 10px;
  opacity: 0.5;
}

/* Scrollbar — match dark theme */
::-webkit-scrollbar { width: 6px; }
::-webkit-scrollbar-track { background: var(--eco-bg); }
::-webkit-scrollbar-thumb { background: var(--eco-border); border-radius: 3px; }
```

---

## Phase 3 — Root Layout & Metadata

**Goal**: `app/layout.tsx` sets fonts, metadata, and wraps the app correctly.

- [ ] **Step 3.1** — `app/layout.tsx`

```typescript
import type { Metadata } from 'next';
import { GeistSans } from 'geist/font/sans';
import '@/styles/globals.css';

export const metadata: Metadata = {
  title: 'EcoRoute — Every trip. Lighter footprint.',
  description: 'Find the greenest route to your destination and track your carbon savings.',
  keywords: ['eco friendly route', 'carbon footprint', 'green commute', 'sustainable travel'],
  openGraph: {
    title: 'EcoRoute',
    description: 'Find the greenest route to your destination.',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={GeistSans.variable}>
      <body>{children}</body>
    </html>
  );
}
```

---

## Phase 4 — EcoMap Component (The Real Work)

**Goal**: MapLibre GL JS renders inside a React component with the dark green tile theme.
This is the only component with real implementation in Task 001.

- [ ] **Step 4.1** — `components/map/EcoMap.tsx`
  - This is the full implementation. Read carefully.
  - Key rule: MapLibre accesses `window` — it MUST be a client component.

```typescript
'use client';

import { useEffect, useRef } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

const MAP_CONFIG = {
  style: 'https://tiles.openfreemap.org/styles/dark',
  center: [78.9629, 20.5937] as [number, number],
  zoom: 4,
  attributionControl: false,
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
```

- [ ] **Step 4.2** — Dynamic import in `app/page.tsx`
  - This is critical. Without `ssr: false`, Next.js tries to render MapLibre
    on the server where `window` doesn't exist — immediate crash on build.

```typescript
import dynamic from 'next/dynamic';
import JourneyPlanner from '@/components/panel/JourneyPlanner';

// CRITICAL: MapLibre GL JS requires window — must disable SSR
const EcoMap = dynamic(() => import('@/components/map/EcoMap'), {
  ssr: false,
  loading: () => (
    <div style={{
      width: '100%', height: '100%',
      background: '#0d1f12',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <span style={{ color: '#7a9e7e', fontSize: '14px' }}>Loading map...</span>
    </div>
  ),
});

export default function HomePage() {
  return (
    <div style={{
      display: 'flex',
      height: '100vh',
      overflow: 'hidden',
      background: 'var(--eco-bg)',
    }}>
      {/* Left panel — 40% width on desktop, bottom sheet on mobile */}
      <div style={{
        width: '40%',
        minWidth: '320px',
        maxWidth: '480px',
        height: '100%',
        overflowY: 'auto',
        background: 'var(--eco-bg)',
        borderRight: '1px solid var(--eco-border)',
        zIndex: 10,
        flexShrink: 0,
      }}>
        {/* Header */}
        <div style={{
          padding: '16px 20px',
          borderBottom: '1px solid var(--eco-border)',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
        }}>
          {/* Logo mark placeholder — replaced in Task 006 */}
          <div style={{
            width: '32px', height: '32px',
            borderRadius: '8px',
            background: 'var(--eco-surface)',
            border: '1px solid var(--eco-border)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '16px',
          }}>
            🌿
          </div>
          {/* Wordmark: "eco" regular + "route" bold */}
          <span style={{ color: 'var(--eco-text)', fontSize: '18px' }}>
            <span style={{ fontWeight: 400 }}>eco</span>
            <span style={{ fontWeight: 700 }}>route</span>
          </span>
        </div>

        {/* Journey planner — implemented Task 002 */}
        <JourneyPlanner />
      </div>

      {/* Map panel — 60% width */}
      <div style={{ flex: 1, position: 'relative', height: '100%' }}>
        <EcoMap />
      </div>
    </div>
  );
}
```

---

## Phase 5 — Environment & Project Config Files

**Goal**: `.env.example`, `.env.local`, and `CLAUDE.md` all exist with correct content.

- [ ] **Step 5.1** — `.env.example`

```bash
# EcoRoute environment variables
# Copy this file to .env.local and fill in your values

# OpenRouteService API key
# Get yours free at: https://openrouteservice.org/sign-up/
# IMPORTANT: This key is server-side ONLY.
# Never add NEXT_PUBLIC_ prefix — that exposes it to the browser.
ORS_API_KEY=your_openrouteservice_key_here

# Map default center (optional — defaults to India center)
# NEXT_PUBLIC_ is safe here — these are just coordinates, not secrets
NEXT_PUBLIC_MAP_CENTER_LNG=78.9629
NEXT_PUBLIC_MAP_CENTER_LAT=20.5937
NEXT_PUBLIC_MAP_ZOOM=4
```

- [ ] **Step 5.2** — `.env.local`
  - Copy `.env.example` to `.env.local`
  - Fill in `ORS_API_KEY` with your real key from openrouteservice.org
  - Never commit this file (it's already in `.gitignore` by default in Next.js)

- [ ] **Step 5.3** — `CLAUDE.md` in project root

```markdown
## EcoRoute — Read This First

EcoRoute is an eco-friendly route finder web app for urban commuters.
Stack: Next.js 14 (App Router), TypeScript, Tailwind CSS, MapLibre GL JS.
It shows users the greenest route to their destination and tracks their carbon savings.

## What we are building
Single Next.js app that:
1. Takes origin + destination input
2. Geocodes them via Nominatim (OSM, free, no key needed)
3. Fetches walking, cycling, driving routes from OpenRouteService (server-side proxy)
4. Calculates CO₂ per route using IPCC emission factors
5. Assigns eco grades (A/B/C/D) to each route
6. Renders routes on a MapLibre GL JS dark-green map
7. Stores trip history in localStorage — no backend in V1
8. Shows personal carbon footprint dashboard at /dashboard

## Critical rules
- ORS_API_KEY stays server-side ONLY — never add NEXT_PUBLIC_ prefix
- All localStorage keys prefixed with 'ecoroute:'
- CO₂ values always in kg (not grams) in the UI layer
- Emission factors from config/emissions.ts ONLY — never hardcode in components
- No red color anywhere in the UI — use amber (#f4a261) for warnings instead
- Minimum font size: 11px. Minimum touch target: 44px
- Run npm run typecheck before every commit — must pass 0 errors
- Mobile-first CSS — test at 375px width before desktop

## Key files
- config/emissions.ts      → SACRED — emission factors, do not change values
- lib/co2.ts               → CO₂ math and equivalents
- lib/routing.ts           → ORS API wrapper
- lib/storage.ts           → localStorage helpers (never call localStorage directly in components)
- app/api/route/route.ts   → Server-side ORS proxy (API key lives here ONLY)
- types/index.ts           → All TypeScript interfaces
- styles/globals.css       → CSS variables and dark green theme

## What is NOT in V1
No user auth, no database, no transit routing, no turn-by-turn navigation,
no social features, no gamification, no native app, no offline support.
V2+. Do not build stubs for these.
```

- [ ] **Step 5.4** — Add `maplibre-gl` to `next.config.js` transpile list
  - MapLibre has ESM/CJS issues in Next.js 14. Add this or you'll get
    "Cannot use import statement" errors during build.

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['maplibre-gl'],
};

module.exports = nextConfig;
```

---

## Before / After

**Before**: Empty directory, nothing installed.

**After**: Running `npm run dev` shows:
```
Left panel (40%):        Right panel (60%):
┌─────────────────────┐  ┌──────────────────────────┐
│ 🌿 ecoroute         │  │  [dark green map tiles]   │
│─────────────────────│  │                          │
│ Journey planner –   │  │  [India centered, zoom 4] │
│ Task 002            │  │                          │
└─────────────────────┘  └──────────────────────────┘
```

---

## Read vs Write

**READ for reference (always allowed):**
- `02_ui_design.md` — color values, layout decisions
- `03_system_design.md` — architecture, interfaces, map config

**WRITE in this task — exactly these files:**
- `types/index.ts`
- `config/emissions.ts`
- `lib/co2.ts` (stub)
- `lib/ecoGrade.ts` (stub)
- `lib/geocoding.ts` (stub)
- `lib/routing.ts` (stub)
- `lib/storage.ts` (stub)
- `hooks/useRoutes.ts` (stub)
- `hooks/useGeolocation.ts` (stub)
- `hooks/useFootprint.ts` (stub)
- `components/map/EcoMap.tsx` (full implementation)
- `components/map/RouteLayer.tsx` (stub)
- `components/map/MarkerLayer.tsx` (stub)
- `components/panel/JourneyPlanner.tsx` (stub)
- `components/panel/RouteCard.tsx` (stub)
- `components/panel/RouteOptions.tsx` (stub)
- `components/panel/StartButton.tsx` (stub)
- `components/widgets/CarbonSavedWidget.tsx` (stub)
- `components/widgets/EcoModeBadge.tsx` (stub)
- `components/dashboard/FootprintChart.tsx` (stub)
- `components/dashboard/TripHistory.tsx` (stub)
- `app/layout.tsx`
- `app/page.tsx`
- `app/dashboard/page.tsx` (stub)
- `app/api/route/route.ts` (stub)
- `styles/globals.css`
- `.env.example`
- `.env.local` (fill in your real ORS key)
- `CLAUDE.md`
- `next.config.js`

**Never do in this task:**
- Write any CO₂ calculation logic (Task 003)
- Write any geocoding logic (Task 002)
- Write any routing API calls (Task 003)
- Install any packages not listed in the Dependencies section above

---

## Verify

```bash
npm run typecheck   # Must show: 0 errors
```

In browser at localhost:3000:
- [ ] Page loads without errors in the browser console
- [ ] Split panel layout visible — left panel and map side by side
- [ ] Map renders with dark tile theme (not blank, not white)
- [ ] Map is centered on India (you can see the subcontinent shape)
- [ ] Header shows "🌿 ecoroute" wordmark with correct font weights
- [ ] "Journey planner — Task 002" placeholder text visible in left panel
- [ ] No red colors anywhere on the page
- [ ] Resize browser to 375px width — no horizontal overflow, layout doesn't break

At localhost:3000/dashboard:
- [ ] Page loads (stub content "Dashboard — Task 005" visible)
- [ ] No errors in console

---

## Common Issues & Fixes

**Map is blank / white after load:**
- Check browser console for tile loading errors
- OpenFreeMap CDN may be slow on first load — wait 5 seconds, then refresh
- If persistent: verify `maplibre-gl` is in `transpilePackages` in `next.config.js`

**"Cannot use import statement" error on build:**
- `next.config.js` is missing `transpilePackages: ['maplibre-gl']` — add it

**TypeScript error on GeoJSON.LineString:**
- Run `npm install @types/geojson` — should already be installed from setup

**Map renders but colors look wrong / too blue:**
- The CSS filter in `globals.css` may need tuning for your screen
- Try adjusting `hue-rotate` value (120deg is the starting point)
- This is expected to need tweaking — it's noted in the system design doc

**Left panel and map overlapping on mobile:**
- Mobile layout (bottom sheet) is Task 006 — this is expected at this stage
- At 375px the map may cover the panel — that's fine for now

---

## Completion Log

- [ ] Phase 1 complete — all stubs created, typecheck passes
- [ ] Phase 2 complete — CSS variables in globals.css
- [ ] Phase 3 complete — layout.tsx with Geist font
- [ ] Phase 4 complete — EcoMap renders on screen
- [ ] Phase 5 complete — .env.example, CLAUDE.md, next.config.js
- [ ] `npm run typecheck` — 0 errors
- [ ] Browser verified — map visible, layout correct
- [ ] **TASK 001 COMPLETE ✅ — Ready for Task 002**
