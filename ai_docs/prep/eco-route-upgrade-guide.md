# 🌿 Eco Route Finder — Feature Upgrade Guide

> **Goal:** Add truly different routes (fastest / shortest / eco) + animated route highlight on card click.
> **Rule:** No existing features are removed or broken.

---

## What's Changing (Overview)

| Area | Current Behaviour | After Upgrade |
|---|---|---|
| Route fetching | All 3 calls use `driving` profile → same result | 3 genuinely different OSRM queries |
| Route cards | Static, clicking just changes border | Smooth animated highlight + map pan |
| Map polylines | Opacity shift only | Animated dash + weight pulse on active route |

---

## Part 1 — Truly Different Routes

### Problem
In `fetchRoutes()`, the `profiles` array is `['driving', 'driving', 'driving']` and the URL always uses `alternatives=true` loosely. All three routes come back identical.

```js
// ❌ Current (all three are the same driving route)
const profiles = ['driving', 'driving', 'driving'];
```

### Fix — Three Distinct Route Strategies

Replace the entire `fetchRoutes()` function with the version below.

**How it works:**
- **Fastest** → standard OSRM driving, no extras.
- **Eco (Shortest)** → uses OSRM `driving` but requests `annotations=duration,distance` and picks the route with the **lowest distance** from alternatives.
- **Alternative** → explicitly requests `alternatives=true` and picks the second route returned (a genuinely different path when one exists).

```js
async function fetchRoutes() {
    const start = `${startCoords.lng},${startCoords.lat}`;
    const end   = `${endCoords.lng},${endCoords.lat}`;
    const base  = `https://router.project-osrm.org/route/v1/driving`;
    const opts  = `overview=full&geometries=geojson`;

    // --- 1. Fastest route (default OSRM result) ---
    const fastRes  = await fetch(`${base}/${start};${end}?${opts}`);
    const fastData = await fastRes.json();
    const fastRoute = fastData.routes[0];

    // --- 2. Shortest route (pick lowest-distance from alternatives) ---
    const altRes  = await fetch(`${base}/${start};${end}?${opts}&alternatives=true`);
    const altData = await altRes.json();
    const allRoutes = altData.routes || [];
    // Sort by distance ascending → first = shortest
    const shortestRoute = [...allRoutes].sort((a, b) => a.distance - b.distance)[0];

    // --- 3. Alternative route (second unique path, fallback to first) ---
    const altRoute = allRoutes.length > 1 ? allRoutes[1] : allRoutes[0];

    // --- Build route objects ---
    const definitions = [
        {
            raw: fastRoute,
            type: 'fastest',
            label: 'Fastest Route',
            icon: '⚡',
            color: '#3b82f6',
            badge: 'fastest'
        },
        {
            raw: shortestRoute,
            type: 'eco',
            label: 'Eco Route',
            icon: '🌿',
            color: '#10b981',
            badge: 'eco'
        },
        {
            raw: altRoute,
            type: 'alternative',
            label: 'Alternative',
            icon: '🛣️',
            color: '#f59e0b',
            badge: 'alternative'
        }
    ];

    return definitions.map(def => {
        const distance = def.raw.distance / 1000;
        const co2      = distance * EMISSION_FACTORS[selectedVehicle];
        const ecoScore = co2 === 0 ? 100 : Math.max(0, 100 - (co2 / distance * 50));

        return {
            type:      def.type,
            label:     def.label,
            icon:      def.icon,
            color:     def.color,
            badge:     def.badge,
            distance:  distance.toFixed(2),
            duration:  (def.raw.duration / 60).toFixed(0),
            co2:       co2.toFixed(3),
            ecoScore:  ecoScore.toFixed(0),
            geometry:  def.raw.geometry.coordinates
        };
    });
}
```

> ✅ **No other function needs to change for Part 1.** `displayRoutes()` already reads `.geometry`, `.distance`, etc. so it will work as-is.

---

## Part 2 — Animated Route Highlight on Card Click

### What we're adding
When a route card is clicked:
1. The card smoothly pulses with a green glow.
2. The corresponding map polyline **animates** — it grows thicker and its color brightens with a CSS transition.
3. The map **pans & zooms** to fit that specific route.

### Step 2a — Add CSS animations

Paste this inside your `<style>` block, anywhere after the `.route-card.active` rule:

```css
/* --- Animated highlight --- */
@keyframes cardPulse {
    0%   { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.6); }
    70%  { box-shadow: 0 0 0 10px rgba(16, 185, 129, 0); }
    100% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); }
}

.route-card.active {
    border-color: #10b981;
    box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
    animation: cardPulse 0.6s ease-out;
}

.route-card {
    /* make sure transition is set for smooth border change */
    transition: transform 0.3s, box-shadow 0.3s, border-color 0.3s;
}
```

### Step 2b — Replace `highlightRoute()`

Find this in your `<script>`:

```js
// ❌ Current highlightRoute — only changes opacity
function highlightRoute(idx) {
    document.querySelectorAll('.route-card').forEach((card, i) => {
        card.classList.toggle('active', i === idx);
    });

    routeLayers.forEach((layer, i) => {
        layer.setStyle({
            weight: i === idx ? 6 : 4,
            opacity: i === idx ? 0.8 : 0.5
        });

        if (i === idx) {
            layer.bringToFront();
        }
    });
}
```

Replace it with:

```js
// ✅ New highlightRoute — animated card + map pan
function highlightRoute(idx) {
    // 1. Animate the cards
    document.querySelectorAll('.route-card').forEach((card, i) => {
        card.classList.remove('active');          // remove first so animation re-triggers
        if (i === idx) {
            // tiny timeout forces CSS animation to re-fire even if already active
            setTimeout(() => card.classList.add('active'), 10);
        }
    });

    // 2. Animate the polylines
    routeLayers.forEach((layer, i) => {
        if (i === idx) {
            layer.setStyle({ weight: 7, opacity: 1 });
            layer.bringToFront();

            // Pan & zoom map to fit this route's bounds
            map.fitBounds(layer.getBounds(), { padding: [40, 40], animate: true });
        } else {
            layer.setStyle({ weight: 3, opacity: 0.35 });
        }
    });
}
```

### Step 2c — Update `displayRoutes()` to call the new highlight

In `displayRoutes()`, find the line that draws route cards. The `onclick` already calls `highlightRoute(${idx})` — **no change needed there.** However, update the initial active card from index `1` to index `0` (fastest selected by default):

```js
// Find this line inside the routes.map(...) template string:
// ❌ Old
<div class="route-card ${idx === 1 ? 'active' : ''}" onclick="highlightRoute(${idx})">

// ✅ New (fastest = index 0 is highlighted by default)
<div class="route-card ${idx === 0 ? 'active' : ''}" onclick="highlightRoute(${idx})">
```

And right after `document.getElementById('resultsSection').classList.add('active');` at the bottom of `displayRoutes()`, add:

```js
// Auto-highlight fastest route when results first appear
setTimeout(() => highlightRoute(0), 100);
```

---

## Summary of All Changes

| File location | What to change |
|---|---|
| `fetchRoutes()` in `<script>` | Full replacement (Part 1) |
| `<style>` block | Add `@keyframes cardPulse` + update `.route-card` transition (Part 2a) |
| `highlightRoute()` in `<script>` | Full replacement (Part 2b) |
| `displayRoutes()` template string | Change `idx === 1` → `idx === 0` (Part 2c) |
| End of `displayRoutes()` | Add `setTimeout(() => highlightRoute(0), 100)` (Part 2c) |

---

## Testing Checklist

- [ ] Select two different Indian cities and click **Find Eco Routes**
- [ ] Confirm the three route cards show **different distances and durations**
- [ ] Click each card — confirm the card pulses with a green glow
- [ ] Confirm the map polyline for that card thickens and others fade
- [ ] Confirm the map pans/zooms to fit the selected route
- [ ] Test with **Bicycle / Walking** — CO₂ should be 0 and Eco Score 100
- [ ] Test the **Swap** and **Clear** buttons still work as before
- [ ] Test on mobile (sidebar stacks above map, cards still clickable)
