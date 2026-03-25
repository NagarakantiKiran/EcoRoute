# EcoRoute — Task Generator
*Use this to generate a detailed task file for ONE specific roadmap task.*

---

## How To Use This

Tell your AI coding assistant which task you want to start:

```
"Generate the task file for Task 003 — Routing Engine & CO₂ Calculation"
```

The assistant reads only what is needed for that task,
studies the relevant codebase files,
and generates a detailed task file.
You review and approve it.
Then you execute it together.

---

## Step 1 — Identify The Task

Read `ai_docs/prep/06_roadmap.md`.
Find the specific task requested.
Note:
- Task number and name
- Files to create or modify
- Prep docs relevant to this task
- What the previous task must have completed

---

## Step 2 — Read Only What This Task Needs

Each task only needs specific prep docs and codebase files.
Do not read everything — only what is listed below.

### Task 001 — Project Scaffold & Map Shell
```
Prep docs:    03_system_design.md (Architecture, Tech Stack, Map Configuration)
              02_ui_design.md (Color Palette, Layout Philosophy)
Codebase:     package.json (if exists)
              Nothing else exists yet — you are creating the scaffold
```

### Task 002 — Geocoding & Journey Planner
```
Prep docs:    03_system_design.md (Geocoding section, API Rate Limits)
              02_ui_design.md (Journey Planner Card section)
Codebase:     app/page.tsx
              types/index.ts
              styles/globals.css
```

### Task 003 — Routing Engine & CO₂ Calculation
```
Prep docs:    03_system_design.md (Data Flow, CO₂ Calculation, Eco Grade, API proxy)
              01_master_idea.md (CO₂ Comparison Panel, Eco Score section)
Codebase:     config/emissions.ts
              types/index.ts
              hooks/useRoutes.ts (skeleton from Task 002)
              app/api/route/route.ts (stub from Task 001)
              lib/geocoding.ts (from Task 002)
```

### Task 004 — Route Cards & Eco Grade UI
```
Prep docs:    02_ui_design.md (Route Options Section, CTA Button, Carbon Saved Widget)
              01_master_idea.md (Eco Score / Grade section)
Codebase:     hooks/useRoutes.ts (from Task 003)
              lib/co2.ts (from Task 003)
              lib/ecoGrade.ts (from Task 003)
              lib/storage.ts (stub or new)
              types/index.ts
              styles/globals.css
```

### Task 005 — Personal Footprint Dashboard
```
Prep docs:    01_master_idea.md (Personal Carbon Footprint Dashboard section)
              03_system_design.md (localStorage Schema section)
Codebase:     lib/storage.ts (from Task 004)
              lib/co2.ts (getCO2Equivalent function)
              hooks/useFootprint.ts (new)
              types/index.ts
              app/dashboard/page.tsx (stub from Task 001)
```

### Task 006 — Branding, Polish & Mobile Layout
```
Prep docs:    02_ui_design.md (full document — Brand Identity, Typography,
              Mobile Specifications, Screen States)
Codebase:     styles/globals.css
              app/layout.tsx
              components/map/EcoMap.tsx
              All component files (visual review only, not logic changes)
```

### Task 007 — Deployment & Environment Config
```
Prep docs:    03_system_design.md (Deployment, Environment Variables)
Codebase:     app/api/route/route.ts (verify key handling)
              .env.example
              package.json (build scripts)
              next.config.js (if exists)
```

---

## Step 2.5 — Rules Check

Read all 4 files in `.agents/rules/`.
Compare each rule against what you actually see in the codebase for this task.

**If everything matches reality:**
Continue to Step 3 silently.

**If you find anything wrong, missing, or outdated:**
STOP. Do not change anything yet.

Show in this format:

```
Rules check found [N] issue(s):

Issue 1:
  Rule file: .agents/rules/[filename].md
  Current rule says: "[quote the current rule]"
  Reality in codebase: "[what you actually found]"
  Proposed change: "[what you want to update it to]"
  Reason: "[why this matters for this task]"

Do you want me to update these rules before proceeding?
Reply "yes" or "skip".
```

Wait for reply before touching any rule file.

**The Sacred Rule — Never changes under any circumstances:**

```
SACRED — config/emissions.ts values cannot be changed
without citing a new authoritative source.
ORS_API_KEY must NEVER have the NEXT_PUBLIC_ prefix.
```

If a task ever seems to require exposing the API key to the client — stop immediately.
Something is wrong with the approach, not the rule.

---

## Step 3 — Study The Codebase Pattern

Before writing the task file, answer these by reading the relevant files:

1. What do the files look like RIGHT NOW that this task will modify?
2. What is the EXACT pattern to follow? Quote the relevant lines.
3. What is the TypeScript interface being used from `types/index.ts`?
4. Are there any imports or dependencies that need updating?

Write down what you found. This becomes the Context and Pattern sections.

---

## Step 4 — Generate The Task File

Save to: `ai_docs/tasks/00[N]_[task_name].md`

Use this exact structure:

---

```markdown
# Task [N] — [Task Name]
*EcoRoute Build Sprint*

**Depends on**: Task [previous] must be complete
**Estimated time**: [from roadmap]
**Prep doc**: [which prep doc has the key decisions]

---

## Context — Current State

[What does the codebase look like RIGHT NOW?
Be specific. Name files. Describe what they contain.
Example: "lib/routing.ts exists as an empty stub.
         app/api/route/route.ts has the ORS proxy shell but no
         CO₂ logic yet. types/index.ts has RouteResult interface defined."]

## What This Task Does

[One sentence per change.
Example:
  "Implements ORS API calls in lib/routing.ts."
  "Implements CO₂ calculation in lib/co2.ts using emission factors."
  "Draws route lines on the map in RouteLayer.tsx."]

---

## Files To Open Before Starting

\`\`\`
exact/path/file1.ts   — reason
exact/path/file2.ts   — reason
\`\`\`

---

## Pattern To Follow

[Quote exact existing code to model after.]

From `types/index.ts`, the RouteResult interface looks like:
\`\`\`typescript
export interface RouteResult {
  mode: TransportMode;
  distanceMeters: number;
  // ...
}
\`\`\`
Follow this structure exactly. Do not add fields not in the interface.

---

## Implementation

### Phase 1: [First group of changes]
**Goal**: [What this phase achieves]

- [ ] **Step 1.1** — [Action]
  - File: `exact/path/file.ts`
  - What to do: [Precise instruction]
  - Do not change anything else in this file.

- [ ] **Step 1.2** — [Action]
  - File: `exact/path/file.ts`
  - What to do: [Precise instruction]

### Phase 2: [Second group of changes]
**Goal**: [What this phase achieves]

- [ ] **Step 2.1** — [Action]
  - File: `exact/path/file.ts`
  - What to do: [Precise instruction]

---

## Before / After

**Before** (`[file]`):
\`\`\`typescript
// Empty stub or previous state
\`\`\`

**After**:
\`\`\`typescript
// What it looks like after this task
\`\`\`

---

## Read vs Write

**READ for reference (always allowed):**
- `config/emissions.ts` — emission factors to import, never modify values
- `types/index.ts` — interfaces to use, only add if genuinely needed
- Any other file not listed in "Files To Open"

**WRITE only to files explicitly listed in this task.**

**Never do:**
- Change `config/emissions.ts` emission values without new source citation
- Add `NEXT_PUBLIC_` to `ORS_API_KEY`
- Call `localStorage` directly in a component (use `lib/storage.ts`)
- Hardcode hex colors in component files (use CSS variables)

---

## Verify

\`\`\`bash
npm run typecheck   # Must show: 0 errors
\`\`\`

In browser (npm run dev):
- [ ] [What to look for]
- [ ] [What to look for]
- [ ] [What to look for]

Do not move to the next task until all checks pass.

---

## Completion Log

- [ ] Phase 1 complete — [timestamp]
- [ ] Phase 2 complete — [timestamp]
- [ ] Typecheck: 0 errors — [timestamp]
- [ ] Browser verified — [timestamp]
- [ ] **TASK [N] COMPLETE** ✅
```

---

## Step 5 — Present For Approval

Show this before writing any code:

```
Task [N] — [Name]
Saved: ai_docs/tasks/00[N]_[name].md

Files changing:
  • [file1] — [what changes]
  • [file2] — [what changes]

Phases:
  Phase 1: [one line]
  Phase 2: [one line]

Time estimate: [X hours]

Say "proceed" to start.
```

Wait for "proceed" before touching any code.

---

## Step 6 — Execute

Work phase by phase. Complete Phase 1 fully before Phase 2.
Mark each checkbox [x] with a note as you go.

After each phase:
```
✅ Phase [N] complete
  • [file] (+X lines) — [description]
Proceeding to Phase [N+1]...
```

After all phases:
```
✅ Task [N] — [Name] complete

Modified:
  • [file1] (+X lines): [description]
  • [file2] (+Y lines): [description]

Typecheck: ✅ 0 errors
Browser: ✅ [check passed]

Ready for Task [N+1].
```

---

## Code Quality Rules

- TypeScript strict — no `any` unless unavoidable and commented why
- Early returns over deeply nested if/else
- `async/await` not `.then()` chains
- Comments explain WHY, not WHAT
- No commented-out code — delete it completely
- Mobile-first CSS — 375px base, then `md:` breakpoint for desktop
- Touch targets minimum 44px height
- Use `var(--eco-green)` CSS variables, never hardcoded hex in component files
- All CO₂ values in kg at the UI layer — multiply/divide before displaying

**Forbidden:**
```
npm run build   ❌  (developer runs this themselves)
npm run dev     ❌  (developer runs this themselves)
```

**Allowed:**
```
npm run typecheck   ✅
Reading any file    ✅
Creating new files  ✅ (only when listed in the task)
```

---

## V1 Scope Guard

If any step pulls toward these — stop and flag it immediately:

```
❌ User auth / accounts / login
❌ Backend database (Postgres, Supabase, Firebase, etc.)
❌ Public transit / GTFS routing
❌ Turn-by-turn navigation
❌ Push notifications / service workers
❌ Social features (sharing cards, leaderboard)
❌ Gamification (badges, streaks)
❌ Native app (React Native, Expo, Capacitor)
❌ Carbon offset purchasing
❌ Corporate fleet dashboard
❌ Traffic data integration
❌ EV charging station map layer
```

These are V2+. Not now.
Do not create stubs, do not import packages for them, do not mention them in comments.
