# 🛣️ Route Cards Fix — 9 Cards → 3 Cards
### Show only: ⚡ Fastest Route | 🌿 Eco Route | 🛣️ Alternative

> **Problem:** Currently showing 9 cards (Walking×3, Cycling×3, Driving×3)
> **Fix:** Always show exactly 3 cards regardless of vehicle — Fastest / Eco / Alternative
> **Also:** Remove Eco Score bar → replace with Grade A/B/C/D label
> **Rule:** Zero other features touched

---

## Why It's Showing 9 Cards Right Now

Your `fetchRoutes()` is looping over multiple vehicle profiles AND fetching alternatives for each — so you get 3 route types × 3 vehicles = 9 cards. The fix collapses this into one single driving fetch with alternatives, then labels the results Fastest / Eco / Alternative.

---

## Step 1 — Replace `fetchRoutes()`

Find this function in your `<script>`:
```js
async function fetchRoutes() {
```
Delete the **entire function** and replace with:

```js
async function fetchRoutes() {
    const start = `${startCoords.lng},${startCoords.lat}`;
    const end   = `${endCoords.lng},${endCoords.lat}`;
    const base  = `https://router.project-osrm.org/route/v1/driving`;
    const opts  = `overview=full&geometries=geojson&alternatives=true`;

    const res  = await fetch(`${base}/${start};${end}?${opts}`);
    const data = await res.json();

    if (data.code !== 'Ok') throw new Error('No route found');

    const allRoutes = data.routes || [];

    // Sort a copy by distance ascending → shortest = most eco
    const byDistance = [...allRoutes].sort((a, b) => a.distance - b.distance);

    // Pick the 3 route objects
    const fastest     = allRoutes[0];                              // OSRM default = fastest
    const eco         = byDistance[0];                             // shortest distance = least CO₂
    const alternative = allRoutes.length > 1 ? allRoutes[1] : allRoutes[0]; // 2nd path or fallback

    const definitions = [
        { raw: fastest,     type: 'fastest',     label: 'Fastest Route', icon: '⚡', color: '#3b82f6' },
        { raw: eco,         type: 'eco',          label: 'Eco Route',     icon: '🌿', color: '#10b981' },
        { raw: alternative, type: 'alternative',  label: 'Alternative',   icon: '🛣️', color: '#f59e0b' }
    ];

    return definitions.map(def => {
        const distance = def.raw.distance / 1000;
        const co2      = distance * EMISSION_FACTORS[selectedVehicle];
        const ecoScore = co2 === 0 ? 100 : Math.max(0, 100 - (co2 / distance * 50));

        // Grade label
        let grade, gradeColor;
        if (ecoScore >= 80) { grade = 'Grade A — Extremely Eco-Friendly';   gradeColor = '#4ade80'; }
        else if (ecoScore >= 60) { grade = 'Grade B — Eco-Friendly';         gradeColor = '#86efac'; }
        else if (ecoScore >= 40) { grade = 'Grade C — Moderately Eco-Friendly'; gradeColor = '#f59e0b'; }
        else                     { grade = 'Grade D — Not Eco-Friendly';     gradeColor = '#fb923c'; }

        return {
            type:      def.type,
            label:     def.label,
            icon:      def.icon,
            color:     def.color,
            distance:  distance.toFixed(2),
            duration:  (def.raw.duration / 60).toFixed(0),
            co2:       co2.toFixed(3),
            ecoScore:  ecoScore.toFixed(0),
            grade,
            gradeColor,
            geometry:  def.raw.geometry.coordinates
        };
    });
}
```

---

## Step 2 — Replace `displayRoutes()`

Find:
```js
function displayRoutes(routes) {
```
Delete the **entire function** and replace with:

```js
function displayRoutes(routes) {
    const container = document.getElementById('routeCards');

    container.innerHTML = routes.map((route, idx) => `
        <div class="route-card ${idx === 0 ? 'active' : ''}"
             onclick="highlightRoute(${idx})">

            <div class="route-card-header">
                <div class="route-type">
                    <span>${route.icon}</span>
                    <span>${route.label}</span>
                </div>
                <span class="route-badge badge-${route.type}">${route.type}</span>
            </div>

            <div class="route-stats">
                <div class="stat-item">
                    <div class="stat-label">Distance</div>
                    <div class="stat-value">${route.distance} km</div>
                </div>
                <div class="stat-item">
                    <div class="stat-label">Duration</div>
                    <div class="stat-value">${route.duration} min</div>
                </div>
                <div class="stat-item">
                    <div class="stat-label">CO₂</div>
                    <div class="stat-value">${route.co2} kg</div>
                </div>
                <div class="stat-item">
                    <div class="stat-label">Fuel</div>
                    <div class="stat-value">${(parseFloat(route.distance) / 15).toFixed(1)} L</div>
                </div>
            </div>

            <div class="route-grade" style="color: ${route.gradeColor};">
                ${route.grade}
            </div>

        </div>
    `).join('');

    // Draw polylines on map
    routes.forEach((route, idx) => {
        const coords = route.geometry.map(c => [c[1], c[0]]);
        const layer  = L.polyline(coords, {
            color:   route.color,
            weight:  idx === 0 ? 6 : 4,
            opacity: idx === 0 ? 0.9 : 0.45
        }).addTo(map);

        layer.bindPopup(`
            <b>${route.icon} ${route.label}</b><br>
            Distance: ${route.distance} km<br>
            Duration: ${route.duration} min<br>
            CO₂: ${route.co2} kg<br>
            ${route.grade}
        `);

        routeLayers.push(layer);
    });

    document.getElementById('resultsSection').classList.add('active');

    // Auto-highlight fastest on load
    setTimeout(() => highlightRoute(0), 100);
}
```

---

## Step 3 — Add Grade CSS

Find your `.eco-score` CSS rule (the green bar) and **replace it** with:

```css
/* ❌ Delete this */
.eco-score {
    grid-column: 1 / -1;
    background: linear-gradient(135deg, #10b981, #059669);
    color: white;
    padding: 12px;
    border-radius: 8px;
    text-align: center;
    font-weight: 700;
}

/* ✅ Add this instead */
.route-grade {
    grid-column: 1 / -1;
    font-size: 0.78em;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    margin-top: 10px;
    padding-top: 10px;
    border-top: 1px solid rgba(0,0,0,0.08);
}
```

---

## Step 4 — Fix `highlightRoute()` (auto-triggers animation correctly)

Find `highlightRoute()` and replace with:

```js
function highlightRoute(idx) {
    // Animate card
    document.querySelectorAll('.route-card').forEach((card, i) => {
        card.classList.remove('active');
        if (i === idx) setTimeout(() => card.classList.add('active'), 10);
    });

    // Animate polylines + pan map
    routeLayers.forEach((layer, i) => {
        if (i === idx) {
            layer.setStyle({ weight: 7, opacity: 1 });
            layer.bringToFront();
            map.fitBounds(layer.getBounds(), { padding: [40, 40], animate: true });
        } else {
            layer.setStyle({ weight: 3, opacity: 0.35 });
        }
    });
}
```

---

## Summary of All Changes

| # | What | Where |
|---|---|---|
| 1 | Replace `fetchRoutes()` — one fetch, 3 labelled results | `<script>` |
| 2 | Replace `displayRoutes()` — 3 cards, grade label, no eco score bar | `<script>` |
| 3 | Replace `.eco-score` CSS → `.route-grade` CSS | `<style>` |
| 4 | Replace `highlightRoute()` — cleaner animation + map pan | `<script>` |

---

## Testing Checklist

- [ ] Pick any two cities → click **Find Eco Routes**
- [ ] Exactly **3 cards** appear — Fastest ⚡, Eco 🌿, Alternative 🛣️
- [ ] No vehicle name (Walking / Cycling / Driving) appears on cards
- [ ] Each card shows **Distance, Duration, CO₂, Fuel**
- [ ] Each card shows **Grade label** (Grade A / B / C / D) in matching colour — NO green score bar
- [ ] Clicking a card highlights its polyline on the map and pans to fit it
- [ ] Switch vehicle to **Electric / Bicycle / Walking** → still 3 cards, CO₂ changes correctly
- [ ] **Swap, Clear, Use My Location** all still work
- [ ] Advanced Dashboard button still opens the drawer normally
