# EcoRoute — Build Sprint Task Generator
*Use this to generate a detailed task file for ONE specific build task.*
*Hand this document to your AI coding assistant at the start of every session.*

---

## How To Use This

Tell your AI coding assistant which task you want:

```
"Generate the task file for Task 003 — Routing Engine & CO₂ Calculation"
```

The assistant reads only what is needed for that task,
studies the current state of the codebase,
and generates a detailed task file for your review.
You approve it. Then you execute it together.

**One task per session. Never combine two tasks.**

---

## Step 1 — Identify The Task

Read `ai_docs/prep/06_roadmap.md`.
Find the specific task requested. Note:
- Task number and name
- Estimated time
- Which task it depends on
- Which prep docs are relevant

---

## Step 2 — Read Only What This Task Needs

Do not read every prep doc every session. Read only what is listed here.

### Task 001 — Project Scaffold & Map Shell
```
Prep docs:    03_system_design.md (Architecture, Tech Stack, Map Configuration sections)
              02_ui_design.md (Color Palette, Layout Philosophy sections)
Codebase:     Nothing exists yet — scaffold from scratch
```

### Task 002 — Geocoding & Journey Planner
```
Prep docs:    03_system_design.md (Geocoding section, API Rate Limits section)
              02_ui_design.md (Journey Planner Card section)
Codebase:     app/page.tsx              — current layout shell
              types/index.ts            — JourneyState interface
              hooks/useRoutes.ts        — skeleton to fill in
              lib/geocoding.ts          — stub to implement
              styles/globals.css        — CSS variables available
```

### Task 003 — Routing Engine & CO₂ Calculation
```
Prep docs:    03_system_design.md (Data Flow section, CO₂ Calculation section,
              Eco Grade section, API proxy code)
              01_master_idea.md (CO₂ Comparison Panel section, Eco Score section)
Codebase:     config/emissions.ts       — SACRED, read only, import from here
              types/index.ts            — RouteResult interface
              app/api/route/route.ts    — stub to implement (server-side proxy)
              lib/co2.ts                — stub to implement
              lib/ecoGrade.ts           — stub to implement
              lib/routing.ts            — stub to implement
              hooks/useRoutes.ts        — skeleton from Task 002
              lib/geocoding.ts          — complete from Task 002
```

### Task 004 — Route Cards & Eco Grade UI
```
Prep docs:    02_ui_design.md (Route Options Section, CTA Button,
              Carbon Saved Widget, Progress Bar Logic sections)
              01_master_idea.md (Eco Score / Grade section)
Codebase:     hooks/useRoutes.ts        — complete from Task 003
              lib/co2.ts                — complete from Task 003
              lib/ecoGrade.ts           — complete from Task 003
              lib/storage.ts            — stub to implement
              types/index.ts            — Trip, RouteResult interfaces
              styles/globals.css        — CSS variables
              components/panel/RouteCard.tsx      — stub to implement
              components/panel/RouteOptions.tsx   — stub to implement
              components/panel/StartButton.tsx    — stub to implement
              components/widgets/CarbonSavedWidget.tsx — stub to implement
              components/widgets/EcoModeBadge.tsx      — stub to implement
```

### Task 005 — Personal Footprint Dashboard
```
Prep docs:    01_master_idea.md (Personal Carbon Footprint Dashboard section)
              03_system_design.md (localStorage Schema section,
              Carbon Equivalent Strings section)
Codebase:     lib/storage.ts            — complete from Task 004
              lib/co2.ts                — getCO2Equivalent function
              hooks/useFootprint.ts     — stub to implement
              types/index.ts            — FootprintSummary, Trip interfaces
              app/dashboard/page.tsx    — stub to implement
              components/dashboard/FootprintChart.tsx  — stub to implement
              components/dashboard/TripHistory.tsx     — stub to implement
```

### Task 006 — Branding, Polish & Mobile Layout
```
Prep docs:    02_ui_design.md (full document — Brand Identity, Header,
              Typography, Mobile Specifications, Screen States)
Codebase:     styles/globals.css        — CSS variables to finalise
              app/layout.tsx            — metadata and fonts
              app/page.tsx              — layout shell to polish
              components/map/EcoMap.tsx — map controls to add
              All component files       — visual review only, no logic changes
```
⚠️ No red colors anywhere in the UI. This is a hard rule verified in this task.
Check every component file. If red appears anywhere, remove it before marking complete.

### Task 007 — Deployment & Environment Config
```
Prep docs:    03_system_design.md (Deployment section, Environment Variables section)
Codebase:     app/api/route/route.ts    — verify ORS_API_KEY handling
              .env.example              — verify key names are correct
              next.config.js            — verify transpilePackages
              package.json              — verify build scripts
```
⚠️ ORS_API_KEY must NEVER appear in client-side JS bundle.
Verify this in browser DevTools → Network → JS files before marking complete.

---

## Step 2.5 — Rules Check

Read all 4 files in `.agents/rules/`:
```
.agents/rules/ecoroute-context.md
.agents/rules/ecoroute-boundaries.md
.agents/rules/ecoroute-patterns.md
.agents/rules/ecoroute-technical.md
```

Compare each rule against what you actually see in the codebase for this task.

**If everything matches reality:**
Continue to Step 3 silently.

**If you find anything wrong, missing, or outdated:**
STOP. Do not change anything yet.
Show this exact format:

```
Rules check found [N] issue(s):

Issue 1:
  Rule file: .agents/rules/[filename].md
  Current rule says: "[quote the current rule exactly]"
  Reality in codebase: "[what you actually found]"
  Proposed update: "[what the rule should say]"
  Reason: "[why this matters for the current task]"

Issue 2: [if any]
  ...

Update rules before proceeding? Reply "yes" or "skip".
```

Wait for developer reply before touching any rule file.

**If "yes":** make only the listed changes, then continue to Step 3.
**If "skip":** note the discrepancy in the Completion Log, continue using
codebase reality (not the outdated rule).

---

### The Sacred Rules — Never Change Under Any Circumstances

These two rules cannot be updated, loosened, or worked around.
Do not propose changing them. Do not ask permission.
If a task seems to require violating either rule — stop and flag it.
Something is wrong with the approach, not the rule.

```
SACRED RULE 1 — API KEY EXPOSURE:
  ORS_API_KEY must NEVER have the NEXT_PUBLIC_ prefix.
  It must only exist in app/api/route/route.ts (server-side).
  If it appears anywhere else — that is a security bug, stop immediately.

SACRED RULE 2 — EMISSION FACTORS:
  config/emissions.ts values cannot be changed without citing
  a new authoritative source (IPCC or equivalent).
  Do not change these numbers for convenience, rounding, or estimates.
  They are the scientific foundation of the product.
```

---

## Step 3 — Study The Current Codebase State

Before writing the task file, answer these by reading the relevant files:

1. What do the files look like RIGHT NOW that this task will modify?
2. What stubs exist from previous tasks — what's already been scaffolded?
3. What TypeScript interfaces in `types/index.ts` does this task use?
4. What CSS variables in `styles/globals.css` are already available?
5. Are there any imports that need updating in existing files?

Write down what you found. This becomes the Context section.

---

## Step 4 — Generate The Task File

Save to: `ai_docs/tasks/task_00[N]_[task_name].md`

Use this exact structure:

---

```markdown
# Task [N] — [Task Name]
*EcoRoute Build Sprint*

**Depends on**: Task [N-1] must be complete
**Estimated time**: [from roadmap]
**Key prep doc**: [which doc has the critical decisions for this task]

---

## Context — Current State

[What does the codebase look like RIGHT NOW?
Be specific. Name the exact files and describe their current state.
Example:
  "lib/routing.ts exists as a stub — returns empty array.
   app/api/route/route.ts exists as a stub — returns 501.
   types/index.ts has the full RouteResult interface already defined.
   config/emissions.ts has all emission factors — import from here, never hardcode."]

## What This Task Does

[One sentence per meaningful change — not per file, per outcome]
Example:
  "Implements the ORS server-side proxy in app/api/route/route.ts."
  "Implements CO₂ calculation logic in lib/co2.ts using config/emissions.ts."
  "Draws all 3 route lines on the MapLibre map."

---

## Files To Open Before Starting

\`\`\`
exact/path/file1.ts   — reason you need to read this
exact/path/file2.ts   — reason you need to read this
\`\`\`

---

## Pattern To Follow

[Quote exact code from the codebase to model after.
Never invent patterns — show what already exists.]

From `types/index.ts`, the RouteResult interface is:
\`\`\`typescript
export interface RouteResult {
  mode: TransportMode;
  distanceMeters: number;
  // ...
}
\`\`\`
Every new function that returns route data must match this shape exactly.

From `config/emissions.ts`, the import pattern is:
\`\`\`typescript
import { EMISSION_FACTORS, EmissionMode } from '@/config/emissions';
\`\`\`
Never import emission numbers from anywhere else. Never hardcode 120, 40, 89, etc.

---

## Implementation

### Phase 1: [First group of changes]
**Goal**: [Single sentence — what this phase achieves]

- [ ] **Step 1.1** — [Short action label]
  - File: `exact/path/to/file.ts`
  - What to do: [Precise instruction — specific enough that there's only one
    way to interpret it]
  - Do not change anything else in this file.

- [ ] **Step 1.2** — [Short action label]
  - File: `exact/path/to/file.ts`
  - What to do: [Instruction]

### Phase 2: [Second group of changes]
**Goal**: [Single sentence]

- [ ] **Step 2.1** — [Short action label]
  - File: `exact/path/to/file.ts`
  - What to do: [Instruction]

---

## Before / After

**Before** (`lib/example.ts` — current stub):
\`\`\`typescript
export function calculateCO2(): number {
  // Task 003
  return 0;
}
\`\`\`

**After**:
\`\`\`typescript
import { EMISSION_FACTORS, EmissionMode } from '@/config/emissions';

export function calculateCO2(distanceMeters: number, mode: EmissionMode): number {
  const distanceKm = distanceMeters / 1000;
  return (distanceKm * EMISSION_FACTORS[mode]) / 1000;
}
\`\`\`

---

## Read vs Write

**READ for reference (always allowed):**
- `config/emissions.ts` — import from it, never modify values
- `types/index.ts` — use interfaces, only add if genuinely needed
- `styles/globals.css` — use CSS variables, don't add colors in components
- Any file not listed in the WRITE section

**WRITE — only these files in this task:**
- [list exact files this task touches]

**Never do in any task:**
- Add `NEXT_PUBLIC_` prefix to `ORS_API_KEY`
- Change values in `config/emissions.ts` without a new source citation
- Call `localStorage` directly in a component (always use `lib/storage.ts`)
- Hardcode hex color values in component files (always use CSS variables)
- Use red (`#ff...`, `red`, `danger`) anywhere in the UI
- Install packages not already in `package.json`

---

## Verify

\`\`\`bash
npm run typecheck   # Must show: 0 errors
\`\`\`

In browser at localhost:3000 (developer runs npm run dev):
- [ ] [Specific thing to look for — not "it works", but "cycling CO₂ shows 0.0 kg"]
- [ ] [Specific thing to look for]
- [ ] [Specific thing to look for]

Do not move to the next task until every check above is ticked.

---

## Completion Log

- [ ] Phase 1 complete — [timestamp]
- [ ] Phase 2 complete — [timestamp]
- [ ] Typecheck: 0 errors — [timestamp]
- [ ] Browser verified — [timestamp]
- [ ] **TASK [N] COMPLETE ✅ — Ready for Task [N+1]**
```

---

## Step 5 — Present For Approval

Before writing a single line of code, show this:

```
Task [N] — [Name]
Saved: ai_docs/tasks/task_00[N]_[name].md

Files changing:
  • [file1] — [what changes, one line]
  • [file2] — [what changes, one line]

Phases:
  Phase 1: [one line description]
  Phase 2: [one line description]

Estimated time: [from roadmap]

Say "proceed" to start.
```

Wait for "proceed". Do not touch any file before hearing it.

---

## Step 6 — Execute Phase By Phase

Work through exactly one phase at a time.
Complete and verify Phase 1 before starting Phase 2.
Mark each checkbox `[x]` as you go.

After completing each phase, report:
```
✅ Phase [N] complete
  • [file] (+N lines) — [what was done]
  • [file] (+N lines) — [what was done]
Proceeding to Phase [N+1]...
```

After all phases complete:
```
✅ Task [N] — [Name] complete

Files modified:
  • [file1] (+N lines): [description]
  • [file2] (+N lines): [description]

Typecheck: ✅ 0 errors
Browser: ✅ [specific check that passed]

Ready for Task [N+1].
```

---

## Code Quality — Always Apply These

**TypeScript:**
- No `any` unless it genuinely cannot be avoided — if used, comment why
- All types imported from `types/index.ts` — no inline interface declarations
- Early returns over deeply nested if/else
- `async/await` not `.then()` chains

**CSS:**
- Use `var(--eco-green)`, `var(--eco-amber)` etc. — never hardcode hex in components
- Mobile-first — write 375px base styles first, then `md:` breakpoint for desktop
- Touch targets minimum 44px height on all interactive elements
- Minimum font size 11px — check this after every visual component

**React/Next.js:**
- Client components that need browser APIs (`window`, `localStorage`, `navigator`)
  must have `'use client'` at the top
- MapLibre always needs `dynamic(() => import(...), { ssr: false })` — never direct import
- Never call `localStorage` directly in a component — always use `lib/storage.ts`

**Comments:**
- Explain WHY, not WHAT
- No commented-out code — delete it
- If an emission factor or algorithm comes from a source, cite it inline

**Forbidden in every task:**
```
npm run build   ❌  (developer runs this)
npm run dev     ❌  (developer runs this)
```

**Allowed in every task:**
```
npm run typecheck   ✅
Reading any file    ✅
Creating new files  ✅  (only when listed in the task)
```

---

## V1 Scope Guard

If any step, any suggestion, any import, or any comment pulls toward these —
stop immediately and flag it to the developer before going further:

```
❌ User authentication / login / accounts
❌ Backend database (Postgres, Supabase, Firebase, PlanetScale, anything)
❌ Public transit routing (GTFS, bus APIs, metro APIs)
❌ Real-time turn-by-turn navigation
❌ Push notifications / service workers / PWA install
❌ Social features (sharing cards, leaderboard, friends)
❌ Gamification (badges, streaks, XP, points)
❌ Native app (React Native, Expo, Capacitor, Tauri)
❌ Carbon offset purchasing or payment integration
❌ Corporate fleet dashboard or B2B features
❌ Real-time traffic data
❌ Elevation data for cycling difficulty
❌ Multi-stop / waypoint routing
❌ EV charging station map layer
❌ Saved favourite routes
❌ Any new npm package not already in package.json
```

These are V2 or V3. Not now.
Do not create stubs for them. Do not mention them in comments.
Do not install packages that will "be useful later".
