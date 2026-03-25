# EcoRoute — Build Roadmap
*Prep Document 06 | The Build Sprint*

---

## Overview

EcoRoute is built in 7 tasks, in strict sequence.
Each task is self-contained and verifiable before moving on.
No task should take more than one focused work session (2–4 hours).

**Total estimated time**: 18–26 hours (solo developer)

---

## Task Sequence

```
Task 001 — Project Scaffold & Map Shell          [2–3h]
Task 002 — Geocoding & Journey Planner           [2–3h]
Task 003 — Routing Engine & CO₂ Calculation      [3–4h]
Task 004 — Route Cards & Eco Grade UI            [3–4h]
Task 005 — Personal Footprint Dashboard          [2–3h]
Task 006 — Branding, Polish & Mobile Layout      [3–4h]
Task 007 — Deployment & Environment Config       [1–2h]
```

Dependencies are strictly linear. Do not skip ahead.

---

## Task 001 — Project Scaffold & Map Shell

**Depends on**: Nothing — start here
**Estimated time**: 2–3 hours
**Prep docs**: 03_system_design.md (Architecture, Tech Stack, Map Configuration)

### What this task does
- Initialises the Next.js 14 project with TypeScript and Tailwind CSS
- Sets up the project folder structure (all empty files/folders)
- Installs all dependencies
- Renders MapLibre GL JS with the dark tile theme
- Applies the EcoRoute dark green color palette via CSS variables
- Shows the split-panel layout shell (left panel + map, no content yet)

### Files created
```
ecoroute/
├── app/layout.tsx
├── app/page.tsx
├── app/dashboard/page.tsx (empty stub)
├── app/api/route/route.ts (empty stub)
├── components/map/EcoMap.tsx
├── types/index.ts
├── config/emissions.ts
├── styles/globals.css
├── .env.local (from .env.example)
├── .env.example
└── CLAUDE.md
```

### Verification
- [ ] `npm run dev` starts without errors
- [ ] Map renders at localhost:3000 with dark green tile theme
- [ ] Split panel layout visible (left panel 40%, map 60%)
- [ ] No TypeScript errors (`npm run typecheck`)

---

## Task 002 — Geocoding & Journey Planner

**Depends on**: Task 001 complete
**Estimated time**: 2–3 hours
**Prep docs**: 03_system_design.md (Geocoding section, API Rate Limits)

### What this task does
- Builds the Journey Planner Card (origin + destination inputs)
- Implements Nominatim geocoding with 500ms debounce
- Caches geocoding results in sessionStorage
- Shows origin/destination markers on the map when both fields are filled
- Handles GEOCODING_FAILED error state
- Handles GEOLOCATION_DENIED gracefully (no error shown, user types manually)

### Files created/modified
```
lib/geocoding.ts               ← Nominatim wrapper
hooks/useGeolocation.ts        ← Browser geolocation hook
hooks/useRoutes.ts             ← Skeleton only (routes added Task 003)
components/panel/JourneyPlanner.tsx
components/map/MarkerLayer.tsx
```

### Verification
- [ ] Typing "Banjara Hills, Hyderabad" shows geocoded result
- [ ] Both markers appear on map when both fields filled
- [ ] Map pans to show both markers
- [ ] Invalid location shows "Couldn't find that location" message
- [ ] Nominatim User-Agent header is present in all requests
- [ ] No TypeScript errors

---

## Task 003 — Routing Engine & CO₂ Calculation

**Depends on**: Task 002 complete
**Estimated time**: 3–4 hours
**Prep docs**: 03_system_design.md (Data Flow, CO₂ Calculation, Eco Grade)

### What this task does
- Builds the server-side ORS proxy API route (hides API key)
- Implements the routing hook — 3 parallel requests (walk + cycle + drive)
- Implements CO₂ calculation (`lib/co2.ts`)
- Implements Eco Grade assignment (`lib/ecoGrade.ts`)
- Draws all 3 route lines on the map with correct colors
- Implements OSRM fallback when ORS rate limit is hit
- Handles all routing error states

### Files created/modified
```
app/api/route/route.ts         ← ORS proxy (server-side only)
lib/co2.ts                     ← CO₂ math + equivalents
lib/ecoGrade.ts                ← Grade A/B/C/D logic
lib/routing.ts                 ← ORS API wrapper
hooks/useRoutes.ts             ← Full implementation
components/map/RouteLayer.tsx  ← Route lines on map
```

### Critical rules for this task
- `ORS_API_KEY` must be in the server-side proxy only — never `NEXT_PUBLIC_`
- CO₂ always returned in kg (not grams) at the UI layer
- Emission factors must match `config/emissions.ts` exactly — never hardcode
- All 3 route requests fire in parallel (`Promise.all`) — not sequentially

### Verification
- [ ] Searching Banjara Hills → Hitech City returns 3 routes
- [ ] Route lines appear on map in correct colors (green/amber/orange)
- [ ] CO₂ figures are correct: cycling = 0kg, driving ~2kg for 10km trip
- [ ] Eco grades are correct: cycling = A, driving = C/D
- [ ] ORS rate limit error shows "Route service busy, trying backup..."
- [ ] OSRM fallback activates silently when ORS fails
- [ ] No TypeScript errors

---

## Task 004 — Route Cards & Eco Grade UI

**Depends on**: Task 003 complete
**Estimated time**: 3–4 hours
**Prep docs**: 02_ui_design.md (Route Options Section, CTA Button, Carbon Saved Widget)

### What this task does
- Builds the RouteCard component (active + inactive states)
- Builds the RouteOptions list (3 cards stacked)
- Implements the progress bar logic (relative eco score, not distance)
- Builds the "Start greenest route" CTA button
- Builds the Carbon Saved Today widget (bottom-right map overlay)
- Implements the Eco Mode Badge pill
- Wires route selection — clicking a card selects it, CTA label updates
- Logs the trip to localStorage when CTA is tapped

### Files created/modified
```
components/panel/RouteCard.tsx
components/panel/RouteOptions.tsx
components/panel/StartButton.tsx
components/widgets/CarbonSavedWidget.tsx
components/widgets/EcoModeBadge.tsx
lib/storage.ts                  ← localStorage helpers
```

### Verification
- [ ] 3 route cards render with correct icons, labels, times, CO₂
- [ ] Greenest path card is pre-selected and visually brightest
- [ ] Clicking a card selects it, others dim
- [ ] CTA button label updates when selection changes ("Start fastest route ↗")
- [ ] Progress bars show relative eco score (not distance)
- [ ] Carbon Saved Today widget visible bottom-right of map
- [ ] Tapping CTA logs trip to localStorage (check DevTools → Application → Storage)
- [ ] Empty state (no routes yet) shows clean planner with no route section
- [ ] No TypeScript errors

---

## Task 005 — Personal Footprint Dashboard

**Depends on**: Task 004 complete
**Estimated time**: 2–3 hours
**Prep docs**: 01_master_idea.md (Feature: Personal Carbon Footprint Dashboard)

### What this task does
- Builds the `/dashboard` page
- Reads trip history from localStorage
- Shows total CO₂ saved (this week / month / all time) tabs
- Shows trip count by mode (walk / cycle / drive)
- Shows a simple bar chart of weekly CO₂ savings (no heavy chart library — CSS bars)
- Shows trip history list (last 10 trips)
- Shows CO₂ equivalents ("You've saved the equivalent of X trees")
- Adds dashboard link to header nav

### Files created/modified
```
app/dashboard/page.tsx
components/dashboard/FootprintChart.tsx
components/dashboard/TripHistory.tsx
hooks/useFootprint.ts
```

### Design constraints
- No external charting library — use CSS flexbox bars (keeps bundle small)
- Empty state: "Complete your first trip to see your footprint"
- Dashboard reads localStorage directly — no API call needed
- CO₂ equivalents use `getCO2Equivalent()` from `lib/co2.ts`

### Verification
- [ ] `/dashboard` loads without errors
- [ ] After logging a trip (Task 004), dashboard shows it
- [ ] Week/month/all-time tabs switch correctly
- [ ] Trip count by mode updates after each trip
- [ ] CSS chart renders without external library
- [ ] Empty state looks clean (not broken)
- [ ] No TypeScript errors

---

## Task 006 — Branding, Polish & Mobile Layout

**Depends on**: Task 005 complete
**Estimated time**: 3–4 hours
**Prep docs**: 02_ui_design.md (full document — Brand Identity, Mobile Specifications)

### What this task does
- Adds the EcoRoute logo mark (SVG leaf+route icon)
- Adds the "eco**route**" wordmark (light + bold weight)
- Applies all CSS variables from the brand palette
- Implements the mobile bottom sheet layout for journey planner
- Tests and fixes layout at 375px (iPhone SE) and 390px (standard iPhone)
- Tests and fixes layout at 360px (Redmi/Realme Android)
- Adds map controls (zoom +/−, locate me button)
- Applies correct typography (Inter/system-ui, sizes, weights)
- Final color pass — verifies no red anywhere in the UI
- Favicon and Open Graph metadata

### Files created/modified
```
public/logo.svg                 ← Leaf + route mark
public/favicon.ico
app/layout.tsx                  ← OG metadata
styles/globals.css              ← Final CSS variable pass
components/map/EcoMap.tsx       ← Map controls
```

### Mobile layout rules
- Journey planner panel = bottom sheet on mobile (slides up from bottom)
- Map full screen behind sheet when sheet is collapsed
- Touch targets minimum 44px on all interactive elements
- Minimum font size 11px — verify nothing smaller exists

### Verification
- [ ] Logo renders at correct size in header
- [ ] Mobile layout at 375px: map full screen, panel as bottom sheet
- [ ] Desktop layout at 1280px: split panel 40/60
- [ ] All touch targets ≥ 44px (check in DevTools)
- [ ] No red color appears anywhere in the UI
- [ ] Favicon shows in browser tab
- [ ] `npm run typecheck` — 0 errors
- [ ] Lighthouse mobile score ≥ 80 (performance)

---

## Task 007 — Deployment & Environment Config

**Depends on**: Task 006 complete
**Estimated time**: 1–2 hours
**Prep docs**: 03_system_design.md (Deployment section, Environment Variables)

### What this task does
- Creates Vercel project and connects GitHub repo
- Configures environment variables in Vercel dashboard
- Deploys to production URL
- Verifies all API calls work in production (not just localhost)
- Sets up custom domain (if purchased)
- Verifies ORS API key is not exposed in client bundle

### Verification
- [ ] Production URL loads the app
- [ ] Route search works in production (ORS API key works)
- [ ] ORS_API_KEY does NOT appear in browser DevTools → Network (check response headers and JS bundle)
- [ ] Geocoding works in production
- [ ] Dashboard loads in production
- [ ] Custom domain resolves (if configured)
- [ ] SSL certificate active (https)

---

## Backlog (V2 and beyond)

Features explicitly NOT in V1. Do not build. Do not reference.

```
❌ User authentication / accounts
❌ Backend database
❌ Public transit routing (GTFS)
❌ Real-time turn-by-turn navigation
❌ Push notifications
❌ Social sharing / impact cards
❌ Leaderboard / gamification
❌ Native iOS / Android app
❌ Offline support
❌ Carbon offset purchasing
❌ Corporate fleet dashboard
❌ Traffic data
❌ Elevation data for cycling
❌ Multi-stop routing
❌ Saved favourite routes
❌ EV charging station overlay
```

---

## Definition of Done — V1 Complete

V1 is done when all of the following are true:

- [ ] User can enter origin + destination and receive 3 route options
- [ ] Each route shows CO₂ in kg and an Eco Grade (A–D)
- [ ] Greenest route is pre-selected and visually distinct
- [ ] Carbon Saved Today widget visible on map
- [ ] Trips log to localStorage on CTA tap
- [ ] Dashboard shows accumulated footprint history
- [ ] Mobile layout works on 375px viewport
- [ ] No red colors anywhere in the UI
- [ ] ORS API key is server-side only (never exposed to client)
- [ ] Deployed to production URL and working
- [ ] `npm run typecheck` passes with 0 errors
