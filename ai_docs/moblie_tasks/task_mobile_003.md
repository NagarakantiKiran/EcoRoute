# Task Mobile 003 — Advanced Dashboard Mobile Layout
*EcoRoute Mobile Sprint*

**Depends on**: Task Mobile 001 + 002 complete  
**Estimated time**: 1 hour  
**Touches**: `styles/globals.css` only (the Advanced Dashboard CSS block)

---

## Objective

The Advanced Dashboard drawer already has a basic mobile rule that makes it full-width.
This task makes it properly usable on mobile — full-width overlay, readable cards,
properly sized inputs and buttons, and a fixed close button.

```
MOBILE Advanced Dashboard:
┌────────────────────────┐
│ 🚀 Advanced Dashboard [✕ Close] │  ← fixed header
├────────────────────────┤
│ ┌──────────────────────┐│
│ │ 🚌 Multi-Modal       ││
│ │ [From input        ] ││
│ │ [To input          ] ││
│ │ [Compare Modes btn ] ││  ← full width cards
│ │ [result area       ] ││     stacked 1 column
│ └──────────────────────┘│
│ ┌──────────────────────┐│
│ │ 🛣️ Alternative Routes ││
│ │  ...                 ││
│ └──────────────────────┘│
│   ... more cards ...    │
└────────────────────────┘
```

---

## What This Task Does

1. Drawer becomes full-width on mobile (already partially done — this refines it)
2. The grid of feature cards switches to single column (1 card per row)
3. Inputs and buttons inside cards get proper mobile sizing
4. The drawer header (title + close button) becomes sticky/fixed at the top so it's always accessible while scrolling
5. Bottom padding ensures the last card isn't cut off

---

## Step 1 — Update the existing mobile rule in the Advanced Dashboard CSS

In `styles/globals.css`, find the existing mobile block inside the Advanced Dashboard section:

```css
/* Mobile — find this existing rule: */
@media (max-width: 768px) {
    .advanced-drawer { width: 100vw; right: -100vw; }
    .drawer-overlay  { width: 100vw; }
    .adv-grid        { grid-template-columns: 1fr; }
}
```

**Replace it entirely** with the expanded version below:

```css
@media (max-width: 768px) {
  /* Drawer: full width, starts below mobile header */
  .advanced-drawer {
    width: 100vw !important;
    right: -100vw !important;
    top: 56px !important;           /* below the mobile header bar */
    height: calc(100vh - 56px) !important;
    padding: 0 !important;          /* remove padding — handled inside */
    border-left: none !important;
  }

  .advanced-drawer.open {
    right: 0 !important;
  }

  /* Overlay covers full screen on mobile */
  .drawer-overlay {
    width: 100vw !important;
    top: 56px !important;
    height: calc(100vh - 56px) !important;
  }

  /* Sticky header inside drawer */
  .drawer-header {
    position: sticky !important;
    top: 0 !important;
    z-index: 10 !important;
    background: #0d2418 !important;
    padding: 14px 16px !important;
    margin-bottom: 0 !important;
    border-bottom: 1px solid #2d5a3d !important;
  }

  .drawer-header h2 {
    font-size: 1.2em !important;
  }

  .drawer-close-btn {
    padding: 8px 14px !important;
    font-size: 13px !important;
    min-height: 40px !important;
    min-width: 80px !important;
  }

  /* Cards grid: 1 column on mobile */
  .adv-grid {
    grid-template-columns: 1fr !important;
    gap: 14px !important;
    padding: 16px !important;
    padding-bottom: 40px !important; /* space at bottom */
  }

  /* Individual feature cards */
  .adv-card {
    padding: 18px 16px !important;
    border-radius: 14px !important;
  }

  .adv-card h3 {
    font-size: 1.1em !important;
    margin-bottom: 4px !important;
  }

  .adv-card .adv-subtitle {
    font-size: 12px !important;
    margin-bottom: 14px !important;
  }

  /* Inputs inside advanced cards */
  .adv-input-group input,
  .adv-input-group select,
  .adv-input-group textarea {
    font-size: 16px !important;    /* prevents iOS zoom */
    padding: 12px 14px !important;
  }

  .adv-input-group label {
    font-size: 13px !important;
  }

  /* Action buttons inside cards */
  .adv-btn {
    padding: 14px 20px !important;
    font-size: 15px !important;
    min-height: 50px !important;
    border-radius: 10px !important;
  }

  /* Result stat grid: 2 columns on mobile */
  .adv-stat-grid {
    grid-template-columns: 1fr 1fr !important;
    gap: 8px !important;
  }

  .adv-stat-box {
    padding: 10px 12px !important;
  }

  .adv-stat-box .adv-stat-value {
    font-size: 16px !important;
  }

  /* Multi-modal transport cards: wrap to 2 on mobile */
  .adv-modal-grid {
    grid-template-columns: 1fr 1fr 1fr !important; /* still 3 side by side on mobile — they're compact */
    gap: 8px !important;
  }

  .adv-modal-card {
    padding: 12px 8px !important;
  }

  .adv-modal-card .mode-icon {
    font-size: 1.6em !important;
  }

  .adv-modal-card .mode-name {
    font-size: 12px !important;
  }

  .adv-modal-card .mode-stat {
    font-size: 11px !important;
  }

  /* Alternative route rows: stack content vertically */
  .adv-route-row {
    flex-direction: column !important;
    align-items: flex-start !important;
    gap: 8px !important;
    padding: 14px !important;
  }

  .adv-route-row .route-co2 {
    font-size: 16px !important;
  }

  /* Duration matrix table: allow horizontal scroll */
  .adv-result-header {
    overflow-x: auto !important;
  }

  .adv-matrix-table {
    min-width: 260px !important;
    font-size: 12px !important;
  }

  .adv-matrix-table th,
  .adv-matrix-table td {
    padding: 8px 6px !important;
  }

  /* Result header */
  .adv-result-header {
    padding: 14px !important;
    border-radius: 10px !important;
  }

  .adv-result-header h4 {
    font-size: 1em !important;
    margin-bottom: 12px !important;
  }

  /* Autocomplete suggestions dropdown */
  .adv-suggestions {
    max-height: 160px !important;
  }

  .adv-suggestion-item {
    padding: 12px 14px !important;
    font-size: 14px !important;
    min-height: 44px !important;
  }
}
```

---

## Step 2 — Ensure the Drawer Closes When Route Is Found

On mobile, when the user opens the Advanced Dashboard, runs a feature,
and then taps Close — the panel should close cleanly. This already works
via `closeAdvancedDashboard()`. No changes needed here.

However, make sure the **existing `closeAdvancedDashboard()` function** also
handles the z-index stacking correctly on mobile. It already does — just verify
it calls `classList.remove('open')`.

---

## Step 3 — Verify the Z-index Stack

On mobile, we now have multiple layers. Make sure the z-index order is:

| Layer | z-index | Description |
|---|---|---|
| Map | default | Leaflet/MapLibre map |
| Mobile overlay (sidebar) | 1040 | Dims map when sidebar open |
| Sidebar panel | 1050 | Slides in from left |
| Mobile header | 1100 | Always on top |
| Drawer overlay | 1999 | Dims everything when adv dashboard open |
| Advanced drawer | 2000 | Advanced dashboard panel |

The Advanced Dashboard's z-index (2000) is already above the mobile header (1100),
so it correctly overlays everything including the header. ✅

---

## Verification Checklist

- [ ] On mobile: tap "Advanced Dashboard" button — drawer slides in from the right, full-width
- [ ] Drawer appears below the mobile header bar (not over it)
- [ ] "🚀 Advanced Dashboard" title + Close button stay visible while scrolling (sticky)
- [ ] All 6 feature cards are stacked in 1 column
- [ ] Inputs inside cards have readable font (no iOS zoom)
- [ ] Each card's action button is full-width and at least 50px tall
- [ ] Multi-Modal result shows 3 transport cards side by side (compact)
- [ ] Duration Matrix table scrolls horizontally if too wide
- [ ] Alternative Routes rows: label+grade on left, CO₂ below on mobile
- [ ] Tap Close → drawer slides out, underlying map/sidebar visible
- [ ] Autocomplete dropdown shows suggestions correctly on mobile
- [ ] On desktop (>768px): advanced dashboard unchanged

---

## Common Issues

**Drawer appears over the mobile header:**
- Ensure `top: 56px` is set in the mobile rule
- Check that the mobile header has `z-index: 1100` and drawer has `z-index: 2000`
- The drawer SHOULD overlay the header (2000 > 1100) — that's correct behaviour

**Cards still in 2 columns:**
- Confirm the `@media` override uses `!important`
- Check browser DevTools to see which rule is winning

**Inputs zoom on iOS:**
- Must be exactly `font-size: 16px` (not 15.9px, not 15px)

**Sticky header not working:**
- The `.advanced-drawer` must have `overflow-y: auto` for `position: sticky` to work on the child
- Already set in the base CSS — should be fine

---

## Completion Log

- [ ] Existing mobile media query in Advanced Dashboard CSS replaced
- [ ] Tested Advanced Dashboard open/close on 375px screen
- [ ] Sticky header verified (scroll down in drawer → header stays visible)
- [ ] All 6 features tested on mobile — results display correctly
- [ ] iOS zoom test — no zoom on any input
- [ ] Desktop unchanged
- [ ] **TASK MOBILE 003 COMPLETE ✅ — All mobile tasks done!**
