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
- app/globals.css          → CSS variables and dark green theme

## What is NOT in V1
No user auth, no database, no transit routing, no turn-by-turn navigation,
no social features, no gamification, no native app, no offline support.
V2+. Do not build stubs for these.
