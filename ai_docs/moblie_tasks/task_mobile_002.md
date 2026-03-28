# Task Mobile 002 — Route Cards & Vehicle Selector Mobile Layout
*EcoRoute Mobile Sprint*

**Depends on**: Task Mobile 001 complete  
**Estimated time**: 1 hour  
**Touches**: `styles/globals.css` only (no JS changes needed)

---

## Objective

Make the route cards, vehicle selector grid, and sidebar content look great
on a small screen. These are all inside the sliding panel from Task Mobile 001.

```
MOBILE SIDEBAR CONTENT:
┌──────────────────────┐
│ PLAN YOUR JOURNEY    │
│ [From input        ] │
│ [To input          ] │
│ ✓ Eco mode active    │
├──────────────────────┤
│ SELECT VEHICLE       │
│ ┌────────┐ ┌───────┐ │
│ │🚗 Petrol│ │⚡ EV  │ │
│ └────────┘ └───────┘ │
│ ┌────────┐ ┌───────┐ │
│ │🚴 Bike │ │🚶 Walk│ │
│ └────────┘ └───────┘ │
├──────────────────────┤
│ ROUTE OPTIONS        │
│ ┌──────────────────┐ │
│ │⚡ Fastest Route  │ │
│ │  133.8km · 119min│ │
│ │  16.05 kg  Gr. C │ │
│ └──────────────────┘ │
│ ┌──────────────────┐ │
│ │🌿 Eco Route      │ │  ← stacked full-width
│ └──────────────────┘ │
│ ┌──────────────────┐ │
│ │🛣️ Alternative    │ │
│ └──────────────────┘ │
├──────────────────────┤
│ [Start driving ↗   ] │
│ [Advanced Dashboard] │
└──────────────────────┘
```

---

## What This Task Does

1. Route cards stack full-width (single column) on mobile
2. Vehicle selector cards resize to fit 2-per-row cleanly
3. Input fields have proper 16px font (prevents iOS auto-zoom)
4. All touch targets are at least 44px tall
5. Buttons are full-width and finger-friendly
6. Stat items inside route cards wrap properly on small screens

---

## Step 1 — Add CSS to `styles/globals.css`

Paste this block **inside** the existing `@media (max-width: 768px)` block
you added in Task Mobile 001 (just before its closing `}`):

```css
  /* ---- Journey Planner inputs ---- */
  .sidebar-panel input[type="text"],
  .sidebar-panel input[type="number"],
  .sidebar-panel select,
  .sidebar-panel textarea {
    font-size: 16px !important; /* Prevents iOS zoom on focus */
    padding: 14px 16px !important;
  }

  /* ---- Vehicle selector grid ---- */
  /* The vehicle grid is a 2x2 grid — keep it on mobile but ensure cards are big enough */
  .vehicle-grid {
    grid-template-columns: 1fr 1fr !important;
    gap: 10px !important;
  }

  .vehicle-card {
    padding: 16px 8px !important;
    min-height: 80px !important;
  }

  .vehicle-card .vehicle-icon {
    font-size: 22px !important;
  }

  .vehicle-card .vehicle-label {
    font-size: 13px !important;
  }

  /* ---- Route cards — stack full width ---- */
  .route-cards-container {
    flex-direction: column !important;
    gap: 10px !important;
  }

  /* Each route card: full width, good touch target */
  .route-card {
    width: 100% !important;
    padding: 16px !important;
    border-radius: 12px !important;
  }

  /* Route card header */
  .route-card-header {
    margin-bottom: 10px !important;
  }

  /* Stats inside route card — 2 columns on mobile */
  .route-stats {
    grid-template-columns: 1fr 1fr !important;
    gap: 8px !important;
  }

  .stat-item {
    padding: 8px !important;
  }

  .stat-value {
    font-size: 15px !important;
  }

  /* Grade label */
  .route-grade {
    font-size: 11px !important;
    padding-top: 8px !important;
    margin-top: 8px !important;
  }

  /* ---- CTA + Advanced Dashboard buttons ---- */
  /* These are at the bottom of the panel */
  .start-btn,
  button[class*="start"],
  .btn-advanced {
    width: 100% !important;
    min-height: 52px !important;
    font-size: 16px !important;
    border-radius: 10px !important;
    margin-bottom: 10px !important;
  }

  /* ---- Eco mode badge ---- */
  .eco-mode-badge {
    font-size: 13px !important;
    padding: 8px 14px !important;
    min-height: 40px !important;
  }

  /* ---- Section labels ---- */
  .section-label {
    font-size: 11px !important;
    margin-bottom: 12px !important;
  }

  /* ---- Journey planner card padding ---- */
  .journey-card {
    padding: 16px !important;
    border-radius: 14px !important;
  }

  /* ---- Route options section ---- */
  .route-options-section {
    padding: 0 16px 80px 16px !important; /* bottom padding so last button isn't cut off */
  }
```

---

## Step 2 — Verify Class Names Match Your Components

The CSS above uses class names that **must match** what's in your components.
Check these mappings and adjust if your actual class names differ:

| CSS class used above | Where it's applied | Check in file |
|---|---|---|
| `.vehicle-grid` | Vehicle selector grid | JourneyPlanner.tsx or RouteOptions.tsx |
| `.vehicle-card` | Individual vehicle button | Same file |
| `.route-cards-container` | Wrapper around all 3 route cards | RouteOptions.tsx or displayRoutes() |
| `.route-card` | Individual route card | RouteCard.tsx |
| `.route-card-header` | Top row of route card | RouteCard.tsx |
| `.route-stats` | 4-stat grid inside route card | RouteCard.tsx |
| `.stat-item` | Individual stat cell | RouteCard.tsx |
| `.stat-value` | The number in stat cell | RouteCard.tsx |
| `.route-grade` | Grade label at bottom | RouteCard.tsx |
| `.btn-advanced` | Advanced Dashboard button | Already exists from adv dashboard |
| `.journey-card` | The white/surface card in planner | JourneyPlanner.tsx |

> **If your class names are different**, simply update the CSS selectors above to match.
> You can also add the class names to the JSX elements instead if you prefer.

---

## Step 3 — Fix iOS Input Zoom (Critical)

On iOS, any `<input>` with `font-size < 16px` causes the browser to zoom in.
This is already handled by the CSS above (`font-size: 16px !important`),
but double-check that your inputs don't have inline `fontSize` styles that override it.

If they do, update the inline style in your component:
```tsx
// In JourneyPlanner.tsx, find the inputStyle object:
const inputStyle: React.CSSProperties = {
  // ... existing styles ...
  fontSize: '15px', // ← change this to:
  fontSize: '16px', // ← 16px prevents iOS zoom
};
```

---

## Step 4 — Ensure Route Cards Section Has Padding Bottom

The route cards and buttons at the bottom of the panel need extra bottom padding
on mobile so the last button isn't hidden behind anything.

In your `JourneyPlanner.tsx` or wherever `RouteOptions` is rendered, add a wrapper:

```tsx
<div className="route-options-section">
  <RouteOptions ... />
  {/* Start button + Advanced Dashboard button here */}
</div>
```

---

## Verification Checklist

- [ ] Open panel on mobile (375px width) — no horizontal scroll inside
- [ ] Vehicle selector shows 2×2 grid, each card has enough tap area
- [ ] Route cards stack vertically, full-width (no side-by-side cards)
- [ ] Tapping an input on iOS does NOT zoom the page
- [ ] Each route card shows all 4 stats in 2×2 grid (not cut off)
- [ ] Grade label visible below stats on each card
- [ ] "Start driving" CTA button is full-width and at least 52px tall
- [ ] "Advanced Dashboard" button is full-width
- [ ] Scrolling inside the panel is smooth
- [ ] Last button (Advanced Dashboard) is not cut off — there's space below it
- [ ] On desktop (>768px): all existing styles unchanged

---

## Common Issues

**Cards still appear side by side:**
- The wrapper div needs `className="route-cards-container"` — add it in JSX
- Check for conflicting inline `display: flex; flex-direction: row` styles

**Input zoom on iOS:**
- Must be `font-size: 16px` — not `15px` or `14px`
- The `!important` in the CSS handles inline style overrides

**Bottom of panel cut off:**
- Add `padding-bottom: 80px` to the panel's scroll container
- Or add `paddingBottom: '80px'` to the `route-options-section` div

---

## Completion Log

- [ ] CSS added inside the @media (max-width: 768px) block
- [ ] Class names verified against actual component JSX
- [ ] iOS font-size fix applied (16px)
- [ ] Bottom padding confirmed — no content cut off
- [ ] Tested on 375px (iPhone SE)
- [ ] Tested on 414px (iPhone Pro Max)
- [ ] Desktop layout unchanged at 769px+
- [ ] **TASK MOBILE 002 COMPLETE ✅ — Ready for Task Mobile 003**
