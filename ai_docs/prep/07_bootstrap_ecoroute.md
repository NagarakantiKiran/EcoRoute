# EcoRoute — Build Sprint Bootstrap
*Run this ONCE before starting any build task.*
*Purpose: Configure your IDE / AI assistant with permanent EcoRoute context.*

---

## When To Run This

Run this template exactly once — before Task 001.
Never run it again unless you delete `.agents/rules/` or clone the repo fresh.

---

## Step 1 — Read Everything

Read all of these files in full before creating anything:

**Prep documents:**
```
ai_docs/prep/01_master_idea.md
ai_docs/prep/02_ui_design.md
ai_docs/prep/03_system_design.md
ai_docs/prep/06_roadmap.md
```

**Codebase files (read after scaffold exists from Task 001):**
```
CLAUDE.md
app/layout.tsx
app/page.tsx
lib/co2.ts
config/emissions.ts
types/index.ts
styles/globals.css
```

Do not skip any file. Understanding both the product decisions AND the technical
patterns is required before creating the rules.

---

## Step 2 — Create Workspace Rules

Create the folder `.agents/rules/` and write these 4 files:

---

### `.agents/rules/ecoroute-context.md`

Write a concise summary of:
- What EcoRoute is and what problem it solves (from 01_master_idea.md)
- Who the primary user is
- The core technical approach — Next.js single app, no backend in V1
- Which file contains emission factors (single source of truth)
- The localStorage-only data strategy for V1

Keep it under 200 words. This file is read before every session.

---

### `.agents/rules/ecoroute-boundaries.md`

Write three clear sections:

**Section 1 — SACRED (cannot be changed by anyone):**
- `config/emissions.ts` — emission factors cannot be changed without citing a new source
- `ORS_API_KEY` naming — must never have `NEXT_PUBLIC_` prefix (server-side only)
- All localStorage keys must use the `ecoroute:` prefix
- CO₂ values must always be in kg at the UI layer (never grams in UI)

**Section 2 — V1 scope boundary:**
Features that must never be built in V1 (from 03_system_design.md V1 Scope Boundary):
- No user auth / accounts
- No backend database
- No public transit routing (GTFS)
- No turn-by-turn navigation
- No social features, gamification, or push notifications
- No native app (web only)

**Section 3 — Design rules that cannot be broken:**
- No red color anywhere in the UI (from 02_ui_design.md)
- Minimum font size 11px
- Minimum touch target 44px
- Greenest route must always be pre-selected and visually brightest
- CO₂ data must be visible on every route card without scrolling

Note at the bottom: Section 1 rules can only be updated with explicit developer
approval. Section 2 and 3 can be discussed but require a decision before changing.

---

### `.agents/rules/ecoroute-patterns.md`

Write the coding patterns to always follow:

- **Emission factors**: Always imported from `config/emissions.ts` — never hardcoded
- **CO₂ calculation**: Always use `calculateCO2()` from `lib/co2.ts` — never inline math
- **localStorage**: Always use helpers from `lib/storage.ts` — never call `localStorage` directly in components
- **API key**: `ORS_API_KEY` only in `app/api/route/route.ts` (server-side proxy) — never anywhere else
- **TypeScript**: All types defined in `types/index.ts` — no inline interface declarations in components
- **CSS variables**: All colors via CSS variables (e.g. `--eco-green`, `--eco-amber`) — never hardcoded hex in component files
- **Verification**: Run `npm run typecheck` after every session — must pass 0 errors
- **Mobile-first**: Write CSS at 375px first, then add desktop styles with `md:` breakpoint

---

### `.agents/rules/ecoroute-technical.md`

Write the specific technical constants used throughout the app:

**Emission factors (from config/emissions.ts):**
```
walking:  0g CO₂/km
cycling:  0g CO₂/km
driving:  120g CO₂/km (average petrol car)
ev:       40g CO₂/km (average grid mix)
transit:  89g CO₂/km per passenger (bus)
Source: IPCC / Our World in Data
```

**Eco Grade thresholds:**
```
A:  0–20g CO₂/km    (walk, cycle)
B:  20–60g CO₂/km   (EV, shared)
C:  60–120g CO₂/km  (average car)
D:  120g+ CO₂/km    (SUV, heavy traffic)
```

**Brand colors:**
```
--eco-bg:        #0d1f12  (deep background)
--eco-surface:   #1a2e1d  (card backgrounds)
--eco-input:     #162219  (input fields)
--eco-green:     #52b788  (accent, CTA, route line)
--eco-amber:     #f4a261  (secondary, warnings)
--eco-orange:    #e07c3a  (high-CO₂ indicator)
--eco-text:      #f0f4f0  (primary text)
--eco-muted:     #7a9e7e  (secondary text)
```

**Map config:**
```
Default center: [78.9629, 20.5937] (India)
Default zoom: 4
Tile provider: OpenFreeMap dark style
Route line colors: green (#52b788) / amber (#f4a261) / orange (#e07c3a)
```

**API config:**
```
ORS free tier: 2,000 req/day, 40 req/min
Per route search: 3 parallel requests
Safe daily limit: ~666 searches/day
Nominatim debounce: 500ms
Nominatim cache: sessionStorage
```

**localStorage keys:**
```
ecoroute:trips        → Trip[] (last 100 trips)
ecoroute:footprint    → FootprintSummary
ecoroute:preferences  → UserPreferences
```

---

## Step 3 — Create CLAUDE.md

Create `CLAUDE.md` in the project root with the following content.
This file is the instruction file for AI coding assistants.

```markdown
## EcoRoute — Read This First

EcoRoute is an eco-friendly route finder web app for urban commuters.
Stack: Next.js 14 (App Router), TypeScript, Tailwind CSS, MapLibre GL JS.
It shows users the greenest route to their destination and tracks their carbon savings.

## What we are building
Single Next.js app that:
1. Takes origin + destination input
2. Geocodes them via Nominatim (OSM, free)
3. Fetches walking, cycling, driving routes from OpenRouteService (server-side proxy)
4. Calculates CO₂ per route using IPCC emission factors
5. Assigns eco grades (A/B/C/D) to each route
6. Renders routes on a MapLibre GL JS dark-green map
7. Stores trip history in localStorage (no backend in V1)
8. Shows personal carbon footprint dashboard at /dashboard

## Critical rules
- ORS_API_KEY stays server-side ONLY — never add NEXT_PUBLIC_ prefix
- All localStorage keys prefixed with 'ecoroute:'
- CO₂ values always in kg (not grams) in the UI layer
- Emission factors from config/emissions.ts ONLY — never hardcode
- No red color anywhere in the UI — use amber (#f4a261) for warnings
- Minimum font size: 11px. Minimum touch target: 44px
- Run npm run typecheck before every commit — must pass 0 errors
- Mobile-first CSS — test at 375px width before adding desktop styles

## Key files
- config/emissions.ts      → Single source of truth for emission factors (SACRED)
- lib/co2.ts               → CO₂ math and equivalents
- lib/routing.ts           → ORS API wrapper
- lib/storage.ts           → localStorage helpers (never call localStorage directly)
- app/api/route/route.ts   → Server-side ORS proxy (API key lives here only)
- types/index.ts           → All TypeScript interfaces
- styles/globals.css       → CSS variables and dark green theme

## What is explicitly NOT in V1
No user auth, no database, no transit routing, no turn-by-turn navigation,
no social features, no gamification, no native app, no offline support.
These are all V2+. Do not build, do not mention, do not create stubs for them.
```

---

## Step 4 — Show What You Created

Present a summary:
```
Created .agents/rules/ with 4 files:
  ecoroute-context.md     — [one line describing what's in it]
  ecoroute-boundaries.md  — [one line describing what's in it]
  ecoroute-patterns.md    — [one line describing what's in it]
  ecoroute-technical.md   — [one line describing what's in it]

Created CLAUDE.md — project instruction file for AI assistants

Ready for Task 001.
```

Wait for developer confirmation before any coding begins.
