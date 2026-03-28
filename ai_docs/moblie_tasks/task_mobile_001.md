# Task Mobile 001 — Hamburger Menu & Base Mobile Layout
*EcoRoute Mobile Sprint*

**Depends on**: All desktop tasks complete  
**Estimated time**: 1–2 hours  
**Touches**: `app/page.tsx`, `styles/globals.css`, `components/panel/JourneyPlanner.tsx`

---

## Objective

Add a hamburger menu button that toggles the sidebar panel open/closed on mobile.
On desktop, nothing changes — the sidebar stays always visible as before.

```
MOBILE (≤768px):                    DESKTOP (>768px):
┌────────────────────────┐          ┌──────────┬──────────────────┐
│ 🌿 ecoroute    [☰]    │          │ SIDEBAR  │   MAP            │
│────────────────────────│          │ (always  │                  │
│      MAP FULL WIDTH    │          │  visible)│                  │
│                        │          │          │                  │
│  [Panel slides over ↑] │          └──────────┴──────────────────┘
└────────────────────────┘
```

---

## What This Task Does

1. Adds a sticky mobile header bar (top) with the ecoroute logo + hamburger icon
2. The sidebar panel slides in from the LEFT when hamburger is tapped
3. A dark overlay covers the map when the panel is open (tap to close)
4. On desktop (>768px): hamburger and overlay are hidden, sidebar is always visible
5. Body scroll is locked when mobile panel is open

---

## Step 1 — Add CSS to `styles/globals.css`

Paste this block at the **end** of `globals.css`, just before the final `}` or EOF:

```css
/* ===== MOBILE RESPONSIVE ===== */

/* Mobile header bar (hidden on desktop) */
.mobile-header {
  display: none;
}

@media (max-width: 768px) {
  /* Show mobile header */
  .mobile-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 16px;
    height: 56px;
    background: var(--eco-bg);
    border-bottom: 1px solid var(--eco-border);
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    z-index: 1100;
    flex-shrink: 0;
  }

  .mobile-header-logo {
    display: flex;
    align-items: center;
    gap: 8px;
    color: var(--eco-text);
    font-size: 17px;
  }

  .mobile-header-logo span.eco-logo-icon {
    width: 28px;
    height: 28px;
    border-radius: 7px;
    background: var(--eco-surface);
    border: 1px solid var(--eco-border);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 14px;
  }

  /* Hamburger button */
  .hamburger-btn {
    width: 44px;
    height: 44px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 5px;
    background: transparent;
    border: none;
    cursor: pointer;
    padding: 8px;
    border-radius: 8px;
    transition: background 0.2s;
  }

  .hamburger-btn:active {
    background: var(--eco-surface);
  }

  .hamburger-line {
    width: 22px;
    height: 2px;
    background: var(--eco-text);
    border-radius: 2px;
    transition: all 0.3s ease;
    transform-origin: center;
  }

  /* Animate to X when open */
  .hamburger-btn.open .hamburger-line:nth-child(1) {
    transform: translateY(7px) rotate(45deg);
  }
  .hamburger-btn.open .hamburger-line:nth-child(2) {
    opacity: 0;
    transform: scaleX(0);
  }
  .hamburger-btn.open .hamburger-line:nth-child(3) {
    transform: translateY(-7px) rotate(-45deg);
  }

  /* Main layout shifts: map takes full screen on mobile */
  .app-layout {
    flex-direction: column !important;
    padding-top: 56px; /* offset for fixed header */
  }

  /* Sidebar becomes a fixed slide-in panel */
  .sidebar-panel {
    position: fixed !important;
    top: 56px !important;
    left: -100% !important;
    width: 88vw !important;
    max-width: 360px !important;
    height: calc(100vh - 56px) !important;
    z-index: 1050 !important;
    transition: left 0.35s cubic-bezier(0.4, 0, 0.2, 1) !important;
    overflow-y: auto !important;
    box-shadow: 4px 0 24px rgba(0, 0, 0, 0.5) !important;
    border-right: 1px solid var(--eco-border) !important;
  }

  .sidebar-panel.mobile-open {
    left: 0 !important;
  }

  /* Map takes full height */
  .map-panel {
    width: 100% !important;
    height: calc(100vh - 56px) !important;
    flex: none !important;
  }

  /* Overlay behind the panel */
  .mobile-overlay {
    display: none;
    position: fixed;
    top: 56px;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.55);
    z-index: 1040;
    backdrop-filter: blur(2px);
  }

  .mobile-overlay.active {
    display: block;
  }

  /* Prevent body scroll when panel open */
  body.panel-open {
    overflow: hidden;
  }

  /* Hide the old static header inside sidebar on mobile
     (the logo section already shows in mobile-header) */
  .sidebar-logo-bar {
    display: none;
  }
}
/* ===== END MOBILE RESPONSIVE ===== */
```

---

## Step 2 — Update `app/page.tsx`

### 2a — Add state for mobile panel

At the top of your `HomePage` component, add:

```tsx
const [mobilePanelOpen, setMobilePanelOpen] = React.useState(false);

const openPanel = () => {
  setMobilePanelOpen(true);
  document.body.classList.add('panel-open');
};

const closePanel = () => {
  setMobilePanelOpen(false);
  document.body.classList.remove('panel-open');
};

const togglePanel = () => {
  mobilePanelOpen ? closePanel() : openPanel();
};
```

### 2b — Add the mobile header HTML

As the **first child** inside your root `<div>` (before the flex layout div), add:

```tsx
{/* Mobile-only header */}
<header className="mobile-header">
  <div className="mobile-header-logo">
    <span className="eco-logo-icon">🌿</span>
    <span>
      <span style={{ fontWeight: 400 }}>eco</span>
      <span style={{ fontWeight: 700 }}>route</span>
    </span>
  </div>
  <button
    className={`hamburger-btn ${mobilePanelOpen ? 'open' : ''}`}
    onClick={togglePanel}
    aria-label="Toggle menu"
  >
    <span className="hamburger-line" />
    <span className="hamburger-line" />
    <span className="hamburger-line" />
  </button>
</header>
```

### 2c — Add overlay div

Add this **just after** the mobile header (before the main layout div):

```tsx
{/* Mobile overlay */}
<div
  className={`mobile-overlay ${mobilePanelOpen ? 'active' : ''}`}
  onClick={closePanel}
/>
```

### 2d — Add classNames to layout divs

Find the **outer flex container div** (the one with `display: flex, height: 100vh`):
```tsx
// Add className:
className="app-layout"
```

Find the **left panel div** (sidebar, 40% width):
```tsx
// Add className:
className={`sidebar-panel ${mobilePanelOpen ? 'mobile-open' : ''}`}
```

Find the **map panel div** (right side, flex: 1):
```tsx
// Add className:
className="map-panel"
```

Find the **inner logo/header bar** inside the sidebar (the `padding: '16px 20px'` div):
```tsx
// Add className:
className="sidebar-logo-bar"
```

---

## Step 3 — Add `import React` if not already imported

At the top of `app/page.tsx`:
```tsx
import React, { useRef, useState } from 'react';
// (or however your imports are structured — just ensure useState is available)
```

---

## Verification Checklist

- [ ] On desktop (>768px): layout looks exactly the same as before — no visual change
- [ ] On mobile (≤768px): map fills the full screen (minus 56px for header)
- [ ] Mobile header bar shows "🌿 ecoroute" + hamburger icon (3 lines)
- [ ] Tap hamburger → sidebar slides in from the left
- [ ] Hamburger icon animates to an ✕ when panel is open
- [ ] Dark overlay appears behind the panel
- [ ] Tap overlay → panel slides back out, icon returns to 3 lines
- [ ] Body scroll is locked while panel is open
- [ ] The old logo bar inside the sidebar is hidden on mobile (not duplicated)
- [ ] Panel scrolls internally if content is taller than screen
- [ ] No horizontal overflow / horizontal scroll on mobile

---

## Common Issues

**Panel doesn't slide in:**
- Check that `sidebar-panel` className is applied to the correct div
- Check that `mobile-open` class toggles correctly

**Logo appears twice on mobile:**
- The `sidebar-logo-bar` className must be on the header div inside the sidebar
- The CSS hides it on mobile

**Map height is wrong:**
- Ensure `map-panel` className is applied and `calc(100vh - 56px)` is working

---

## Completion Log

- [ ] CSS added to globals.css
- [ ] State + handlers added to page.tsx
- [ ] Mobile header HTML added
- [ ] Overlay div added
- [ ] classNames applied to all 4 layout divs
- [ ] Tested on 375px (iPhone SE) — no overflow, panel works
- [ ] Tested on 768px (tablet boundary) — desktop layout intact
- [ ] **TASK MOBILE 001 COMPLETE ✅ — Ready for Task Mobile 002**
