# Task 004 — Route Cards & Eco Grade UI

**Depends on**: Task 003 complete  
**Estimated time**: 3–4 hours  
**Prep docs**: 02_ui_design.md (Route Options Section, CTA Button, Carbon Saved Widget)  
**Status**: 🚀 IN PROGRESS

---

## Objective
Build the route selection UI and trip logging system, including:
- Route cards with active/inactive states (visual distinction)
- Route selection wiring — clicking a card updates state
- "Start greenest route" CTA button with dynamic label
- Carbon Saved Today widget (bottom-right map overlay)
- Eco Mode Badge toggle
- localStorage integration for trip history
- Trip logging when CTA is tapped

---

## Files Created/Modified
- `components/panel/RouteCard.tsx`          ← Individual route display (enhance with selection)
- `components/panel/RouteOptions.tsx`       ← Route list (already basic version)
- `components/panel/StartButton.tsx`        ← Primary CTA button
- `components/widgets/CarbonSavedWidget.tsx` ← Bottom-right map overlay
- `components/widgets/EcoModeBadge.tsx`     ← Toggle badge
- `lib/storage.ts`                          ← localStorage helpers
- `hooks/useRoutes.ts`                      ← Add selection logic
- `app/page.tsx`                            ← Wire components together

---

## Implementation Details

### 1. components/panel/RouteCard.tsx
**Pre-implemented for verification in Task 003**
- Display: distance, duration, mode icon, CO₂, eco grade
- Selected state: border color matches eco grade color, full opacity
- Unselected state: dimmed, gray border
- onClick handler updates parent state with selected mode

### 2. components/panel/RouteOptions.tsx
**Pre-implemented for verification in Task 003**
- Receives: `routes[]`, `selectedMode`, `onSelectMode()`, `isLoading`
- Sorts routes by eco grade (A → D, greenest first)
- Props drilled from JourneyPlanner → page.tsx
- Shows loading state while fetching

### 3. components/panel/StartButton.tsx
**NEW — Main CTA**
- Label changes based on selected mode:
  - "Start walking ↗" (walking selected)
  - "Start cycling ↗" (cycling selected)
  - "Start driving ↗" (driving selected)
  - "Start greenest route ↗" (no selection)
- On click: logs trip to localStorage, shows success feedback
- Disabled state: visible when no routes loaded
- Color: always green (#52b788), no red

### 4. components/widgets/CarbonSavedWidget.tsx
**NEW — Bottom-right map overlay**
- Display: "CO₂ Saved Today: X.XX kg" (big bold number)
- Subtitle: "equivalent to X trees"
- Shows only when at least 1 trip logged
- Reads from localStorage on mount
- Position: fixed, bottom-right (40px from edges)
- Animation: slide-in on mount

### 5. components/widgets/EcoModeBadge.tsx
**NEW — Toggle badge**
- Already exists in JourneyPlanner, can extract as component
- Display: "✓ Eco mode active" or "○ Eco mode off"
- Color: green when active, muted when off
- onClick: toggles state
- No functional change in behavior, just UI refactor

### 6. lib/storage.ts
**NEW — localStorage helpers**
- Keys: `ecoroute:trips`, `ecoroute:footprint`, `ecoroute:preferences`
- Exports:
  - `saveTrip(trip: Trip): void` →  Appends to trips array (max 100)
  - `getTrips(): Trip[]` → Returns all trips
  - `getFootprint(): FootprintSummary` → Calculates from trips
  - `clearTrips(): void` → Reset all trips
  
- Each trip includes: id, timestamp, origin, destination, mode, distance, co2Kg, co2SavedKg, grade

### 7. hooks/useRoutes.ts
**ENHANCEMENT — Add selection logic**
- Add `selectedMode: TransportMode | null` to state
- Add handler: `setSelectedMode(mode: TransportMode)`
- Pre-select greenest route on fetch (cycling or walking)
- Export handlers to page.tsx

### 8. app/page.tsx
**ENHANCEMENT — Wire everything together**
- Pass `selectedMode` → RouteOptions
- Pass `onSelectMode` handler → RouteOptions
- Render StartButton with selectedMode + onTripLogged callback
- Render CarbonSavedWidget with refreshTrigger
- Render EcoModeBadge in Journey Planner OR as separate component

---

## Critical Rules
- **Selection state**: Must be in useState, not just UI styling
- **Trip logging**: Must use localStorage helpers, never call localStorage directly
- **CO₂ display**: Always in kg (no grams), from route data
- **Modal/overlay**: CarbonSavedWidget should not block map interaction
- **No red colors**: Use green (#52b788) or amber (#f4a261) only
- **Touch targets**: All interactive elements ≥ 44px
- **Font size**: Minimum 11px
- **Run typecheck**: After every change — must pass 0 errors

---

## Verification Checklist
- [ ] 3 route cards render with correct icons, labels, times, CO₂
- [ ] Greenest route (cycling/walking) is pre-selected on fetch
- [ ] Clicking a card updates its visual state (border color, opacity)
- [ ] Clicking a card updates related components (button label, etc)
- [ ] Others dim when one is selected
- [ ] CTA button label updates when selection changes ("Start cycling ↗")
- [ ] Carbon Saved Today widget visible bottom-right of map
- [ ] Widget shows CO₂ saved this session and tree equivalents
- [ ] Tapping CTA logs trip to localStorage (DevTools → Application → Storage)
- [ ] Widget updates after logging new trip
- [ ] Empty state: no widget visible when no trips logged
- [ ] No TypeScript errors

---

## Task Execution Plan

### Phase 1: Verify Current State (10 min)
- Check what's already implemented from Task 003
- Confirm RouteCard and RouteOptions are working

### Phase 2: Implement Core Components (90 min)
1. StartButton.tsx — CTA with dynamic label
2. CarbonSavedWidget.tsx — Bottom-right overlay
3. EcoModeBadge.tsx — Extract from JourneyPlanner
4. lib/storage.ts — localStorage helpers

### Phase 3: Wire Selection Logic (40 min)
1. Enhance useRoutes.ts with selectedMode state
2. Update page.tsx to pass props and handlers
3. Test route selection flow end-to-end

### Phase 4: Trip Logging (20 min)
1. Wire StartButton to storage.saveTrip()
2. Update CarbonSavedWidget to read from storage
3. Test adding trips and widget refresh

### Phase 5: Verification (10 min)
- TypeScript: npm run typecheck (0 errors)
- Visual: Test all components in browser
- Data: Verify localStorage in DevTools

---

## References
- System Design: ai_docs/prep/03_system_design_ecoroute.md (localStorage schema)
- UI Design: ai_docs/prep/02_ui_design.md (Route Options Section)
- Roadmap: ai_docs/prep/06_roadmap_ecoroute.md
- Types: types/index.ts (Trip, RouteResult, etc)
- Storage: lib/storage.ts (to be created)

---

## Notes from Task 003 for this Task
- RouteCard and RouteOptions are **already partially implemented**
- Just need: selection state, CTA button, widgets, storage integration
- Pre-selection logic: Choose cycling/walking if available (lower CO₂)
- Trip ID: Use `crypto.randomUUID()` or timestamp-based

---

**Do not proceed to Task 005 until all checklist items are complete and verified.**
