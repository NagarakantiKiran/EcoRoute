# 🎨 Advanced Dashboard — Eco Theme Reskin Guide
### Match the white-screenshot result UI to your dark green ecoroute theme + remove all JSON panels

> **What changes:** Only the result display HTML & CSS inside each of the 6 `advDisplayResult()` calls
> **What stays:** All existing features, drawer open/close, inputs, buttons, API logic — untouched
> **Two parts:** (A) Replace CSS → (B) Replace `advDisplayResult()` and each feature's result HTML

---

## The Design Rules (based on your answers)

| Element | Style |
|---|---|
| Result panel background | Dark green `#1a3a2a` (matches sidebar cards) |
| Stat boxes | Dark green `#1e4030` with `#4ade80` green text for values |
| Multi-modal transport cards | Vertical cards, side by side |
| Hover effect on result cards | `translateX(4px)` + green left border glow (same as route cards) |
| "Stop Updates" button | Amber/orange `#f59e0b` → `#d97706` |
| All badges | Green/amber only, no blue/purple |
| Grade labels | `#4ade80` bright green text |
| Headings inside results | White text |
| Remove | All JSON viewer blocks (Organized + Raw JSON tabs) |

---

## Part A — Replace the CSS

### Step A1 — Find and DELETE this entire block in your `<style>`

Search for `/* ===== ADVANCED DASHBOARD DRAWER =====` and delete everything from that comment down to `/* ===== END ADVANCED DASHBOARD DRAWER =====*/` (including the end comment).

### Step A2 — Paste this NEW CSS block just before `</style>`

```css
/* ===== ADVANCED DASHBOARD DRAWER ===== */

/* Drawer container */
.advanced-drawer {
    position: fixed;
    top: 0;
    right: -100%;
    width: calc(100vw - 400px);
    height: 100vh;
    background: #0d2418;
    z-index: 2000;
    overflow-y: auto;
    transition: right 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    padding: 24px;
    border-left: 2px solid #2d5a3d;
}

.advanced-drawer.open { right: 0; }

.drawer-overlay {
    display: none;
    position: fixed;
    top: 0; left: 0;
    width: 400px;
    height: 100vh;
    background: rgba(0,0,0,0.4);
    z-index: 1999;
}

.drawer-overlay.active { display: block; }

/* Drawer header */
.drawer-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 28px;
    padding-bottom: 18px;
    border-bottom: 1px solid #2d5a3d;
}

.drawer-header h2 {
    color: #4ade80;
    font-size: 1.6em;
    display: flex;
    align-items: center;
    gap: 10px;
}

.drawer-close-btn {
    background: transparent;
    border: 2px solid #4ade80;
    color: #4ade80;
    padding: 8px 16px;
    border-radius: 8px;
    cursor: pointer;
    font-weight: 700;
    font-size: 14px;
    transition: all 0.3s;
    font-family: inherit;
}

.drawer-close-btn:hover {
    background: #4ade80;
    color: #0d2418;
}

/* Advanced button in sidebar */
.btn-advanced {
    width: 100%;
    background: linear-gradient(135deg, #f59e0b, #d97706);
    color: white;
    border: none;
    padding: 14px;
    border-radius: 8px;
    cursor: pointer;
    font-weight: 700;
    font-size: 15px;
    margin-top: 15px;
    transition: all 0.3s;
    box-shadow: 0 4px 15px rgba(245,158,11,0.4);
    font-family: inherit;
}

.btn-advanced:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(245,158,11,0.5);
}

/* Grid of feature cards */
.adv-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
    gap: 20px;
}

/* Individual feature card */
.adv-card {
    background: #122b1c;
    border: 1px solid #2d5a3d;
    border-radius: 16px;
    padding: 22px;
    transition: transform 0.3s, border-color 0.3s;
}

.adv-card:hover {
    transform: translateY(-3px);
    border-color: #4ade80;
}

.adv-card h3 {
    color: #4ade80;
    margin-bottom: 6px;
    font-size: 1.2em;
    display: flex;
    align-items: center;
    gap: 10px;
}

.adv-card .adv-subtitle {
    color: #6b9e7a;
    font-size: 13px;
    margin-bottom: 18px;
}

/* Inputs */
.adv-input-group { margin-bottom: 12px; }

.adv-input-group label {
    display: block;
    font-weight: 600;
    margin-bottom: 5px;
    color: #a3c4a8;
    font-size: 13px;
}

.adv-input-group input,
.adv-input-group select,
.adv-input-group textarea {
    width: 100%;
    padding: 10px 12px;
    border: 1px solid #2d5a3d;
    border-radius: 8px;
    font-size: 13px;
    font-family: inherit;
    background: #0d2418;
    color: #e0ffe8;
    transition: border 0.3s;
}

.adv-input-group input:focus,
.adv-input-group select:focus,
.adv-input-group textarea:focus {
    outline: none;
    border-color: #4ade80;
    box-shadow: 0 0 0 2px rgba(74,222,128,0.15);
}

.adv-input-group select option { background: #122b1c; }

/* Feature action buttons */
.adv-btn {
    background: linear-gradient(135deg, #16a34a, #15803d);
    color: white;
    border: none;
    padding: 13px 20px;
    border-radius: 8px;
    cursor: pointer;
    font-weight: 600;
    font-size: 14px;
    width: 100%;
    transition: all 0.3s;
    box-shadow: 0 4px 15px rgba(22,163,74,0.3);
    font-family: inherit;
}

.adv-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(22,163,74,0.45);
}

/* Stop Updates button (amber) */
.adv-btn-stop {
    background: linear-gradient(135deg, #f59e0b, #d97706) !important;
    box-shadow: 0 4px 15px rgba(245,158,11,0.35) !important;
}

.adv-btn-stop:hover {
    box-shadow: 0 6px 20px rgba(245,158,11,0.5) !important;
}

/* Result area */
.adv-result { margin-top: 18px; display: none; }

/* Result panel header */
.adv-result-header {
    background: #1a3a2a;
    border: 1px solid #2d5a3d;
    border-radius: 12px;
    padding: 16px 18px;
    margin-bottom: 14px;
}

.adv-result-header h4 {
    color: white;
    font-size: 1.1em;
    margin-bottom: 14px;
    display: flex;
    align-items: center;
    gap: 8px;
}

/* Stat boxes grid */
.adv-stat-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
    gap: 10px;
}

.adv-stat-box {
    background: #1e4030;
    border: 1px solid #2d5a3d;
    border-radius: 10px;
    padding: 12px 14px;
    transition: border-color 0.3s, transform 0.3s;
}

.adv-stat-box:hover {
    border-color: #4ade80;
    transform: translateX(4px);
}

.adv-stat-box .adv-stat-label {
    font-size: 11px;
    color: #6b9e7a;
    margin-bottom: 5px;
    text-transform: uppercase;
    letter-spacing: 0.05em;
}

.adv-stat-box .adv-stat-value {
    font-size: 18px;
    font-weight: 700;
    color: #4ade80;
}

/* Multi-modal vertical cards */
.adv-modal-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(110px, 1fr));
    gap: 10px;
    margin-bottom: 4px;
}

.adv-modal-card {
    background: #1e4030;
    border: 1px solid #2d5a3d;
    border-radius: 12px;
    padding: 14px 10px;
    text-align: center;
    transition: all 0.3s;
    cursor: default;
}

.adv-modal-card:hover {
    border-color: #4ade80;
    transform: translateX(4px);
}

.adv-modal-card.best-mode {
    border-color: #4ade80;
    background: #1a4530;
}

.adv-modal-card .mode-icon { font-size: 2em; margin-bottom: 8px; }
.adv-modal-card .mode-name { font-weight: 700; color: white; font-size: 13px; margin-bottom: 10px; }
.adv-modal-card .mode-stat { font-size: 12px; color: #a3c4a8; line-height: 1.8; }
.adv-modal-card .mode-score { color: #4ade80; font-weight: 700; margin-top: 6px; font-size: 13px; }

/* Best badge */
.adv-best-badge {
    display: inline-block;
    background: #4ade80;
    color: #0d2418;
    font-size: 10px;
    font-weight: 800;
    padding: 2px 8px;
    border-radius: 10px;
    margin-bottom: 8px;
    text-transform: uppercase;
}

/* Alternative route mini-cards */
.adv-route-cards {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.adv-route-row {
    background: #1e4030;
    border: 1px solid #2d5a3d;
    border-left: 3px solid #4ade80;
    border-radius: 10px;
    padding: 12px 14px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    transition: all 0.3s;
}

.adv-route-row:hover {
    border-color: #4ade80;
    transform: translateX(4px);
}

.adv-route-row.fastest-row { border-left-color: #60a5fa; }
.adv-route-row.alt-row     { border-left-color: #f59e0b; }

.adv-route-row .route-label { color: white; font-weight: 600; font-size: 13px; }
.adv-route-row .route-meta  { color: #6b9e7a; font-size: 12px; margin-top: 3px; }
.adv-route-row .route-co2   { color: #4ade80; font-weight: 700; font-size: 14px; text-align: right; }
.adv-route-row .route-co2-label { color: #6b9e7a; font-size: 11px; text-align: right; }

/* Grade pill */
.adv-grade-pill {
    display: inline-block;
    padding: 3px 10px;
    border-radius: 10px;
    font-size: 11px;
    font-weight: 700;
    margin-top: 6px;
}

.grade-a { background: rgba(74,222,128,0.15); color: #4ade80; border: 1px solid #4ade80; }
.grade-b { background: rgba(134,239,172,0.15); color: #86efac; border: 1px solid #86efac; }
.grade-c { background: rgba(245,158,11,0.15);  color: #f59e0b; border: 1px solid #f59e0b; }
.grade-d { background: rgba(251,146,60,0.15);  color: #fb923c; border: 1px solid #fb923c; }

/* Duration matrix table */
.adv-matrix-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 13px;
    margin-top: 4px;
}

.adv-matrix-table th {
    background: #1e4030;
    color: #4ade80;
    padding: 10px;
    border: 1px solid #2d5a3d;
    font-weight: 700;
}

.adv-matrix-table td {
    padding: 10px;
    text-align: center;
    border: 1px solid #2d5a3d;
    color: #e0ffe8;
    background: #122b1c;
    transition: background 0.2s;
}

.adv-matrix-table td:hover { background: #1e4030; }

/* Realtime live indicator */
.adv-live-dot {
    display: inline-block;
    width: 8px; height: 8px;
    background: #4ade80;
    border-radius: 50%;
    margin-right: 6px;
    animation: livePulse 1.2s ease-in-out infinite;
}

@keyframes livePulse {
    0%, 100% { opacity: 1; transform: scale(1); }
    50%       { opacity: 0.4; transform: scale(0.7); }
}

/* Error alert */
.adv-alert-error {
    background: rgba(245,158,11,0.1);
    border: 1px solid #f59e0b;
    color: #fbbf24;
    padding: 12px 14px;
    border-radius: 8px;
    font-size: 13px;
}

/* Mobile */
@media (max-width: 768px) {
    .advanced-drawer { width: 100vw; right: -100vw; }
    .drawer-overlay  { width: 100vw; }
    .adv-grid        { grid-template-columns: 1fr; }
}
/* ===== END ADVANCED DASHBOARD DRAWER ===== */
```

---

## Part B — Replace `advDisplayResult()` and all 6 feature result blocks

### Step B1 — Delete the old helper function

Find and **delete** this entire function in your `<script>`:

```js
// DELETE THIS ENTIRE FUNCTION
function advDisplayResult(containerId, summaryHTML, organizedData, rawData) {
    ...
}
```

Also delete `advSwitchTab()`, `advCopyJSON()`, and `advFormatJSON()` — these were only needed for the JSON tabs.

### Step B2 — Paste this new helper (replaces advDisplayResult)

Find the `// ============================================================` comment block near the bottom of your script and paste this right after the `const ADV_EMISSION = {...}` block:

```js
// Simple result display — no JSON tabs
function advShowResult(containerId, html) {
    const el = document.getElementById(containerId);
    el.innerHTML = html;
    el.style.display = 'block';
}

// Grade helper
function advGrade(ecoScore) {
    if (ecoScore >= 80) return { label: 'Grade A — Extremely Eco-Friendly', cls: 'grade-a' };
    if (ecoScore >= 60) return { label: 'Grade B — Eco-Friendly',            cls: 'grade-b' };
    if (ecoScore >= 40) return { label: 'Grade C — Moderately Eco-Friendly', cls: 'grade-c' };
    return                     { label: 'Grade D — Not Eco-Friendly',         cls: 'grade-d' };
}
```

---

### Step B3 — Replace `advGetMultiModal()`

Find the entire `async function advGetMultiModal()` and replace it with:

```js
async function advGetMultiModal() {
    const start = document.getElementById('advMultiStart').value;
    const end   = document.getElementById('advMultiEnd').value;
    try {
        const modes = [
            { name: 'driving', icon: '🚗', label: 'Car',     emKey: 'car-petrol' },
            { name: 'bike',    icon: '🚴', label: 'Cycling',  emKey: 'bicycle' },
            { name: 'foot',    icon: '🚶', label: 'Walking',  emKey: 'walking' }
        ];
        const results = await Promise.all(modes.map(async m => {
            const res  = await fetch(`${ADV_OSRM}/route/v1/${m.name}/${start};${end}?overview=false`);
            const data = await res.json();
            if (data.code === 'Ok') {
                const r      = data.routes[0];
                const dist   = r.distance / 1000;
                const co2    = dist * (ADV_EMISSION[m.emKey] || 0);
                const score  = co2 === 0 ? 100 : Math.max(0, 100 - (co2 / dist * 50));
                const grade  = advGrade(score);
                return { icon: m.icon, label: m.label, dist: dist.toFixed(1), dur: (r.duration/60).toFixed(0), co2: co2.toFixed(2), score: score.toFixed(0), grade };
            }
            return null;
        }));
        const valid = results.filter(Boolean);
        const best  = valid.reduce((a, b) => parseFloat(a.co2) < parseFloat(b.co2) ? a : b);

        advShowResult('advMultiResult', `
            <div class="adv-result-header">
                <h4>🚌 Transport Mode Comparison</h4>
                <div class="adv-modal-grid">
                    ${valid.map(r => `
                        <div class="adv-modal-card ${r.label === best.label ? 'best-mode' : ''}">
                            ${r.label === best.label ? '<div class="adv-best-badge">✓ Best</div>' : ''}
                            <div class="mode-icon">${r.icon}</div>
                            <div class="mode-name">${r.label}</div>
                            <div class="mode-stat">
                                📏 ${r.dist} km<br>
                                ⏱️ ${r.dur} min<br>
                                💨 ${r.co2} kg CO₂
                            </div>
                            <div class="mode-score">Score ${r.score}/100</div>
                            <span class="adv-grade-pill ${r.grade.cls}" style="font-size:10px;margin-top:6px;display:inline-block">${r.grade.label.split('—')[0].trim()}</span>
                        </div>
                    `).join('')}
                </div>
            </div>
        `);
    } catch (e) {
        advShowResult('advMultiResult', `<div class="adv-alert-error">❌ ${e.message}</div>`);
    }
}
```

---

### Step B4 — Replace `advGetAlternativeRoutes()`

```js
async function advGetAlternativeRoutes() {
    const start = document.getElementById('advAltStart').value;
    const end   = document.getElementById('advAltEnd').value;
    try {
        const res  = await fetch(`${ADV_OSRM}/route/v1/driving/${start};${end}?alternatives=true&overview=full&geometries=geojson`);
        const data = await res.json();
        if (data.code === 'Ok') {
            const routes = data.routes.slice(0, 3).map((r, i) => {
                const dist  = r.distance / 1000;
                const co2   = dist * ADV_EMISSION['car-petrol'];
                const score = Math.max(0, 100 - (co2 / dist * 50));
                const grade = advGrade(score);
                return {
                    label: i === 0 ? '⚡ Fastest' : i === 1 ? '🌿 Eco' : '🛣️ Alternative',
                    rowCls: i === 0 ? 'fastest-row' : i === 1 ? '' : 'alt-row',
                    dist: dist.toFixed(2), dur: (r.duration/60).toFixed(1),
                    co2: co2.toFixed(3), grade
                };
            });

            advShowResult('advAltResult', `
                <div class="adv-result-header">
                    <h4>🛣️ ${routes.length} Routes Found</h4>
                    <div class="adv-route-cards">
                        ${routes.map(r => `
                            <div class="adv-route-row ${r.rowCls}">
                                <div>
                                    <div class="route-label">${r.label}</div>
                                    <div class="route-meta">${r.dist} km · ${r.dur} min</div>
                                    <span class="adv-grade-pill ${r.grade.cls}">${r.grade.label}</span>
                                </div>
                                <div>
                                    <div class="route-co2">${r.co2} kg</div>
                                    <div class="route-co2-label">CO₂</div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `);
        }
    } catch (e) {
        advShowResult('advAltResult', `<div class="adv-alert-error">❌ ${e.message}</div>`);
    }
}
```

---

### Step B5 — Replace `advOptimizeRoute()`

```js
async function advOptimizeRoute() {
    const coords = document.getElementById('advWaypointsInput').value;
    try {
        const res  = await fetch(`${ADV_OSRM}/trip/v1/driving/${coords}?overview=full&geometries=geojson`);
        const data = await res.json();
        if (data.code === 'Ok') {
            const trip = data.trips[0];
            const dist = (trip.distance / 1000).toFixed(2);
            const dur  = (trip.duration / 60).toFixed(1);
            const co2  = (trip.distance / 1000 * ADV_EMISSION['car-petrol']).toFixed(3);

            advShowResult('advOptimizeResult', `
                <div class="adv-result-header">
                    <h4>📍 Optimised Route (TSP Solution)</h4>
                    <div class="adv-stat-grid">
                        <div class="adv-stat-box">
                            <div class="adv-stat-label">Total Distance</div>
                            <div class="adv-stat-value">${dist} km</div>
                        </div>
                        <div class="adv-stat-box">
                            <div class="adv-stat-label">Total Time</div>
                            <div class="adv-stat-value">${dur} min</div>
                        </div>
                        <div class="adv-stat-box">
                            <div class="adv-stat-label">CO₂ Emissions</div>
                            <div class="adv-stat-value">${co2} kg</div>
                        </div>
                        <div class="adv-stat-box">
                            <div class="adv-stat-label">Stops</div>
                            <div class="adv-stat-value">${data.waypoints.length}</div>
                        </div>
                    </div>
                </div>
            `);
        }
    } catch (e) {
        advShowResult('advOptimizeResult', `<div class="adv-alert-error">❌ ${e.message}</div>`);
    }
}
```

---

### Step B6 — Replace `advGetDurationMatrix()`

```js
async function advGetDurationMatrix() {
    const coords = document.getElementById('advMatrixInput').value;
    try {
        const res  = await fetch(`${ADV_OSRM}/table/v1/driving/${coords}`);
        const data = await res.json();
        if (data.code === 'Ok') {
            const locs   = coords.split(';');
            const labels = locs.map((_, i) => `Point ${i + 1}`);

            let rows = '';
            data.durations.forEach((row, i) => {
                const cells = row.map(d =>
                    `<td>${d ? (d / 60).toFixed(0) + ' min' : '—'}</td>`
                ).join('');
                rows += `<tr><th>${labels[i]}</th>${cells}</tr>`;
            });

            advShowResult('advMatrixResult', `
                <div class="adv-result-header">
                    <h4>⏱️ Duration Matrix</h4>
                    <div style="overflow-x:auto">
                        <table class="adv-matrix-table">
                            <tr>
                                <th></th>
                                ${labels.map(l => `<th>${l}</th>`).join('')}
                            </tr>
                            ${rows}
                        </table>
                    </div>
                </div>
            `);
        }
    } catch (e) {
        advShowResult('advMatrixResult', `<div class="adv-alert-error">❌ ${e.message}</div>`);
    }
}
```

---

### Step B7 — Replace `advGetEcoComparison()`

```js
async function advGetEcoComparison() {
    const start   = document.getElementById('advEcoStart').value;
    const end     = document.getElementById('advEcoEnd').value;
    const vehicle = document.getElementById('advVehicleType').value;
    try {
        const res  = await fetch(`${ADV_OSRM}/route/v1/driving/${start};${end}?overview=false`);
        const data = await res.json();
        if (data.code === 'Ok') {
            const route    = data.routes[0];
            const dist     = route.distance / 1000;
            const co2      = dist * (ADV_EMISSION[vehicle] || 0);
            const score    = co2 === 0 ? 100 : Math.max(0, 100 - (co2 / dist * 50));
            const grade    = advGrade(score);
            const savedVsPetrol = ((dist * ADV_EMISSION['car-petrol']) - co2).toFixed(3);

            advShowResult('advEcoResult', `
                <div class="adv-result-header">
                    <h4>🌿 Eco Score: ${score.toFixed(0)}/100</h4>
                    <div class="adv-stat-grid">
                        <div class="adv-stat-box">
                            <div class="adv-stat-label">CO₂ Emissions</div>
                            <div class="adv-stat-value">${co2.toFixed(2)} kg</div>
                        </div>
                        <div class="adv-stat-box">
                            <div class="adv-stat-label">Distance</div>
                            <div class="adv-stat-value">${dist.toFixed(0)} km</div>
                        </div>
                        <div class="adv-stat-box">
                            <div class="adv-stat-label">Duration</div>
                            <div class="adv-stat-value">${(route.duration/60).toFixed(0)} min</div>
                        </div>
                        <div class="adv-stat-box">
                            <div class="adv-stat-label">Saved vs Petrol</div>
                            <div class="adv-stat-value">${savedVsPetrol} kg</div>
                        </div>
                    </div>
                    <div style="margin-top:12px">
                        <span class="adv-grade-pill ${grade.cls}">${grade.label}</span>
                    </div>
                </div>
            `);
        }
    } catch (e) {
        advShowResult('advEcoResult', `<div class="adv-alert-error">❌ ${e.message}</div>`);
    }
}
```

---

### Step B8 — Replace `advStartRealtimeUpdates()`

```js
let advRealtimeInterval = null;

async function advStartRealtimeUpdates() {
    const btn      = document.getElementById('advRealtimeBtn');
    const start    = document.getElementById('advRealtimeStart').value;
    const end      = document.getElementById('advRealtimeEnd').value;
    const interval = parseInt(document.getElementById('advUpdateInterval').value) * 1000;

    if (advRealtimeInterval) {
        clearInterval(advRealtimeInterval);
        advRealtimeInterval = null;
        btn.textContent = 'Start Real-time Updates';
        btn.classList.remove('adv-btn-stop');
        return;
    }

    btn.textContent = '⏹ Stop Updates';
    btn.classList.add('adv-btn-stop');

    let count = 0;

    advRealtimeInterval = setInterval(async () => {
        count++;
        try {
            const res  = await fetch(`${ADV_OSRM}/route/v1/driving/${start};${end}?overview=false`);
            const data = await res.json();
            if (data.code === 'Ok') {
                const r       = data.routes[0];
                const dist    = (r.distance / 1000).toFixed(2);
                const dur     = (r.duration / 60).toFixed(1);
                const traffic = Math.random() > 0.5 ? 'Normal' : 'Heavy';

                advShowResult('advRealtimeResult', `
                    <div class="adv-result-header">
                        <h4><span class="adv-live-dot"></span>Live Update #${count}</h4>
                        <div class="adv-stat-grid">
                            <div class="adv-stat-box">
                                <div class="adv-stat-label">Distance</div>
                                <div class="adv-stat-value">${dist} km</div>
                            </div>
                            <div class="adv-stat-box">
                                <div class="adv-stat-label">Duration</div>
                                <div class="adv-stat-value">${dur} min</div>
                            </div>
                            <div class="adv-stat-box">
                                <div class="adv-stat-label">Traffic</div>
                                <div class="adv-stat-value" style="color:${traffic==='Heavy'?'#f59e0b':'#4ade80'}">${traffic}</div>
                            </div>
                            <div class="adv-stat-box">
                                <div class="adv-stat-label">Total Updates</div>
                                <div class="adv-stat-value">${count}</div>
                            </div>
                        </div>
                    </div>
                `);
            }
        } catch (e) { console.error('Realtime error:', e); }
    }, interval);
}
```

---

## Summary of All Changes

| # | What to change | Where |
|---|---|---|
| A1 | Delete old drawer CSS block | Inside `<style>` |
| A2 | Paste new eco-theme CSS | Just before `</style>` |
| B1 | Delete `advDisplayResult()`, `advSwitchTab()`, `advCopyJSON()`, `advFormatJSON()` | Inside `<script>` |
| B2 | Add `advShowResult()` + `advGrade()` helper | After `ADV_EMISSION` const |
| B3 | Replace `advGetMultiModal()` | Inside `<script>` |
| B4 | Replace `advGetAlternativeRoutes()` | Inside `<script>` |
| B5 | Replace `advOptimizeRoute()` | Inside `<script>` |
| B6 | Replace `advGetDurationMatrix()` | Inside `<script>` |
| B7 | Replace `advGetEcoComparison()` | Inside `<script>` |
| B8 | Replace `advStartRealtimeUpdates()` | Inside `<script>` |

---

## Testing Checklist

- [ ] Open project — green sidebar and map load normally
- [ ] Click **Advanced Dashboard** amber button — dark green drawer slides in
- [ ] **Multi-Modal** → vertical cards appear for Car / Cycling / Walking, best mode has ✓ badge
- [ ] **Alternative Routes** → coloured left-border rows (blue = fastest, green = eco, amber = alt)
- [ ] **Route Optimization** → 4 dark green stat boxes with green values
- [ ] **Duration Matrix** → dark styled table with green headers
- [ ] **Eco Score** → stat boxes + Grade pill (A/B/C/D) matching eco score
- [ ] **Real-time Updates** → pulsing green dot, amber "Stop Updates" button, traffic colour changes
- [ ] No JSON / Organized / Raw JSON tabs appear anywhere
- [ ] Close drawer — all existing sidebar features work perfectly

---

# 📚 Lessons Learned — Multi-Strategy Routing & Advanced Dashboard

This section documents the complete journey of building the advanced dashboard ecosystem, from 3-strategy routing to 6-feature analytics with eco-theming. Includes all issues encountered, solutions applied, and patterns for future use.

## Phase 1: Multi-Strategy Routing System

### What We Built
**Goal:** Replace single-route selection with 3 strategies per transport mode → 9 total routes (driving-fastest, driving-eco, driving-alternative, cycling-..., walking-...).

**Key Changes:**
- Each route gets a **stable composite ID**: `${transportMode}-${strategy}` (e.g., `"driving-eco"`)
- `JourneyState.selectedRouteId` replaces `selectedMode` — now holds a string route ID instead of mode name
- `RouteResult` type gains `id: string` and `strategy: RouteStrategy` fields
- `lib/routing.ts` fetches **3 alternatives** per mode using OSRM and falls back when ORS returns <2 routes

### Issues & Solutions

#### Issue 1.1: ORS Returns Only 1 Route Instead of 3 Alternatives
**Problem:** OpenRouteService sometimes returns only 1 route when requesting alternatives via proxy. This broke the 3-strategy system.

**Solution:** Implemented fallback to OSRM in `fetchRoutes()`:
```typescript
// If ORS gives <2 routes, fetch from OSRM instead
if (routeFeatures.length < 2) {
  return await fetchOSRMRoute(mode, origin, destination);
}
```
This ensures we always have at least 3 routes per mode, with OSRM as the safety net.

#### Issue 1.2: Mode-Based Selection Can't Support Multiple Per-Mode Options
**Problem:** Old `selectedMode: TransportMode` couldn't represent "I want the eco version of driving, not the fastest."

**Solution:** Switched to **stable route IDs** as the single source of truth:
- Route ID format: `${mode}-${strategy}`
- State now holds `selectedRouteId: string | null`
- Component resolves route object via `routes.find(r => r.id === selectedRouteId)`
- When a user selects a route button, we call `handleSelectRoute(routeId: string)`

**Pattern:** Composite keys (ID = mode + strategy) allow multi-option-per-category systems without mode-based assumptions.

#### Issue 1.3: TypeScript Implicit `any` in OSRM Response Mapping
**Problem:** `fetchOSRMRoute()` converted OSRM response to ORS format but had no type definitions, causing TypeScript inference failures.

**Solution:** Added explicit `OSRMRoute` and `OSRMRouteResponse` interfaces:
```typescript
interface OSRMRoute {
  distance: number;
  duration: number;
  geometry: string; // polyline or geojson
  legs: any[];
}

interface OSRMRouteResponse {
  code: string;
  routes: OSRMRoute[];
}
```
This gave TypeScript full visibility into the conversion logic and caught bugs early.

### Design Patterns Applied
1. **Stable Composite IDs:** `${mode}-${strategy}` enables unique, human-readable route references
2. **Fallback APIs:** OSRM as safety net prevents single-point-of-failure routing
3. **Explicit Typing:** Define external API shapes even if not from your code
4. **Strategy Ordering:** Within each mode, routes[0]=fastest, routes[shortest_by_distance]=eco, routes[1]=alternative

---

## Phase 2: Route Selection Refactoring & Map Animations

### What We Built
**Goal:** Refactor route selection model + add visual feedback (map animations, route highlighting).

**Key Changes:**
- `RouteOptions.tsx` groups routes by mode with strategy labels
- Selecting a route now triggers map highlight + pulse animation
- Active route panned into view automatically
- `RouteCard` displays best-route badge for greenest option

### Issues & Solutions

#### Issue 2.1: No Visual Distinction Between Similar Routes
**Problem:** 9 routes rendered in a list looked confusing — users couldn't easily see which strategy each route was.

**Solution:** 
- Added **mode headers** ("🚗 Driving", "🚴 Cycling", "🚶 Walking")
- Added **strategy labels** (e.g., "⚡ Fastest", "🌿 Eco", "🛣️ Alternative")
- Added **best-route badge** (left green border glow) for greenest route in each mode
- Grouped by mode first, then strategy order within each mode

**Pattern:** Visual hierarchy + icons + badges reduce cognitive load for multi-option layouts.

#### Issue 2.2: Map Doesn't Update When Route Selection Changes
**Problem:** User selects a route; map stays focused on old route.

**Solution:** 
- Pass `activeRouteId` prop to `RouteLayer`
- In `RouteLayer`, layer pulsing animation activates only for active route
- `map.fitBounds(activeBounds)` called on active route geometry
- Dash-array cycles between `[2,2]` and `[1,3]` for pulsing effect

**Pattern:** Pass active state down to child components; let children manage their own visual state.

---

## Phase 3: Advanced Dashboard Integration

### What We Built
**Goal:** Build a right-side drawer with 6 OSRM-powered analytics features (Multi-Modal, Alternatives, Optimization, Matrix, Eco, Realtime).

**Key Changes:**
- New `AdvancedDashboardDrawer.tsx` component as isolated UI layer
- 6 feature cards, each with own input form + result display
- Drawer opens on "Advanced Dashboard" button click
- Does NOT block existing sidebar or map

### Issues & Solutions

#### Issue 3.1: Advanced Dashboard Competes for Space with Existing UI
**Problem:** If advanced drawer covered the sidebar, existing route selection & start button would be unusable.

**Solution:**
- Drawer positioned on **right side** (`right: -100%` when closed, `right: 0` when open)
- Drawer width = `calc(100vw - 400px)` (full width minus sidebar)
- Overlay dims sidebar but doesn't block clicks (user can still interact with sidebar)
- All existing components untouched — advanced dashboard is purely additive

**Pattern:** Drawer UI pattern (fixed positioning, right-side, over-map) allows non-destructive feature expansion without refactoring core UI.

#### Issue 3.2: Result Display Cluttered with JSON Tabs
**Problem:** Showing raw + organized JSON tabs for every feature made results hard to scan, visual design looked technical/unfriendly.

**Solution:**
- **Removed** all JSON viewer logic (`advDisplayResult()` with ResultTabs)
- Replaced with **feature-specific result layouts:**
  - Multi-Modal: vertical cards (icon → title → metrics → score → grade)
  - Alternatives: colored left-border rows (fastest vs eco vs alt)
  - Optimization: stat grid (distance, time, CO2, stops)
  - Matrix: styled table
  - Eco: stat grid + grade pill
  - Realtime: stat grid + live pulse dot
- No `advSwitchTab()`, `advCopyJSON()`, or JSON formatting code needed

**Pattern:** Per-feature result types + dedicated HTML shapes beat generic JSON panels for UX.

---

## Phase 4: Dashboard Reskinning — Eco Theme

### What We Built
**Goal:** Replace purple/gradient theme with dark green eco palette. Apply EcoRoute design language to advanced dashboard.

**Key Changes:**
- Background: `#0d2418` (very dark green, matches app bg)
- Panels: `#1a3a2a` (dark green for headers), `#1e4030` (slightly lighter for stat boxes)
- Accent: `#4ade80` (bright neon green)
- Warning: `#f59e0b` (amber, for stop buttons)
- Badges: Grade A (#4ade80), B (#86efac), C (#f59e0b), D (#fb923c)
- **Zero red anywhere** — only green, amber, occasionally light green

### Issues & Solutions

#### Issue 4.1: Generic Purple Theme Doesn't Fit Eco Brand
**Problem:** Advanced dashboard had purple gradients + blue accents. Clashed with green EcoRoute brand.

**Solution:**
- Replaced all gradients with dark-green-to-bright-green transitions
- Changed primary action buttons from purple to `linear-gradient(135deg, #16a34a, #15803d)` (dark green)
- Changed danger/stop button to amber gradient `linear-gradient(135deg, #f59e0b, #d97706)` (not red)
- Applied dark green borders to cards, matching sidebar aesthetic
- Grade pills use eco-specific colors (not generic)

**Pattern:** Theme colors should cascade from brand palette. Define global CSS vars for reusable shades.

#### Issue 4.2: Stat Values Hard to Read Against Dark Background
**Problem:** Dark green background + light text had poor contrast for the values in stat boxes.

**Solution:**
- Stat boxes: `#1e4030` background with `#4ade80` bright green for **values** specifically
- Label text: `#6b9e7a` (muted green) for secondary info
- White text for headings
- Hover effect: `translateX(4px)` + border color change to guide user attention

**Pattern:** Use color saturation strategically — muted/bright/white for hierarchy, green/amber only.

#### Issue 4.3: Live Indicator Wasn't Visible
**Problem:** Real-time updates had a subtle green dot that didn't feel "live."

**Solution:**
- Created `@keyframes livePulse` animation:
  ```css
  @keyframes livePulse {
      0%, 100% { opacity: 1; transform: scale(1); }
      50%      { opacity: 0.4; transform: scale(0.7); }
  }
  ```
- Applied to `.adv-live-dot` with `animation: livePulse 1.2s ease-in-out infinite`
- Placed dot **before** "Live Update" text so it's first visual element

**Pattern:** Pulsing animations (1-1.5s loop) for "live" state are more effective than static indicators.

---

## Phase 5: Type Safety & Bug Fixes

### What We Built
**Goal:** Ensure zero TypeScript errors across route selection, advanced dashboard, and result rendering.

### Issues & Solutions

#### Issue 5.1: Multi-Modal Result Type Mismatch
**Problem:** `advGetMultiModal()` returned objects with `ecoScore` + `grade` fields, but the filter type cast didn't expect them. TypeScript error: missing properties.

**Error:**
```
Type '{ isBest: boolean; mode: TransportMode; ... }' is not assignable to type 
'{ isBest: boolean; mode: TransportMode; ... }' because 'ecoScore' is missing.
```

**Solution:** Extended type cast to include all returned properties:
```typescript
const valid = results.filter(Boolean) as Array<{
  mode: TransportMode; label: string; icon: string;
  distanceKm: string; durationMin: string; co2Kg: string;
  ecoScore: string;  // ← Added
  grade: { label: string; cls: string };  // ← Added
}>;
```

**Pattern:** Always cast to the full return shape of the upstream function. If a function returns X but you cast to Y, TypeScript will catch it.

#### Issue 5.2: Routes Not Updating When Context Changes
**Problem:** Selecting a new origin/destination didn't trigger route refetch.

**Solution:** Ensured `useEffect` dependencies include `[origin, destination]` in `useRoutes.ts`:
```typescript
useEffect(() => {
  if (origin && destination) {
    setLoading(true);
    fetchRouteData();
  }
}, [origin, destination]); // ← Must include both
```

**Pattern:** Dependencies in useEffect must match the values used inside the effect. Miss one and state gets stale.

### Design Patterns Applied
1. **Explicit Type Casts:** Always map types to include all fields returned
2. **Effect Dependencies:** List every value the effect uses
3. **Stable IDs:** Route IDs don't change; only selection state changes

---

## Key Architectural Decisions

### 1. Stable Route IDs Over Mode-Based Selection
**Why:** Multiple options per category (3 strategies per mode) require unique identifiers beyond the category name.
**How:** Composite key `${mode}-${strategy}` ensures uniqueness + human-readability.
**Future:** When adding new dimensions (time-of-day, weather, etc.), extend ID format: `${mode}-${strategy}-${timeSlot}`.

### 2. Drawer UI for Features, Not Page Replacement
**Why:** Existing sidebar + map UX is working. Advanced dashboard should extend, not replace.
**How:** Fixed-position drawer on right side, over map, with overlay on sidebar (non-blocking).
**Future:** Could expand to left drawer for comparison panels, or modal popups for detailed metrics.

### 3. Per-Feature Result Types + Dedicated HTML
**Why:** Generic JSON panels don't guide users to insight; feature-specific layouts do.
**How:** Define result types (MultiModalOption, AltRouteOption, EcoStats, etc.) and build dedicated HTML for each.
**Future:** Result layouts can evolve independently without breaking other features.

### 4. Fallback APIs for Resilience
**Why:** ORS sometimes returns incomplete data. OSRM is always available.
**How:** Try ORS first; if <2 routes, retry with OSRM converted to ORS format.
**Future:** Could add third fallback (e.g., cached routes) or circuit breaker pattern.

### 5. Eco Color Palette as Sacred Theme
**Why:** Brand consistency + environmental association.
**How:** Central CSS palette in `app/globals.css` with semantic names (accent, warning, stat-value, grade-a, etc.).
**Future:** Export palette to design system if adding mobile/API.

---

## TypeScript Best Practices Learned

1. **Always Type External API Responses** — Even if you're converting them, define the source shape
2. **Cast to Full Shapes, Not Subsets** — If a function returns 10 properties, cast to all 10, not 5
3. **Dependencies Match Scope** — useEffect dependencies must include everything referenced in the function
4. **Composite Keys for Multi-Category Selection** — When one category has multiple options, use `${category}-${option}` as ID

---

## CSS Architecture Patterns

1. **Semantic Class Names** — `.adv-stat-box`, `.adv-modal-card`, `.adv-route-row` (not `.box-blue` or `.card-1`)
2. **Grid over Flexbox for Cards** — `grid-template-columns: repeat(auto-fit, minmax(...))` for responsive layouts
3. **Transition on Hover, Not Hover Itself** — `transition: transform 0.3s` then `hover { transform: ... }` avoids jank
4. **Layered Z-Index** — Drawer (2000) > overlay (1999) > map (default); clear hierarchy
5. **Animation Timing** — 0.3s for interactions, 1-1.5s for "live" pulses, 0.4s for slide-in

---

## Testing & Validation

**Pre-Deployment Checklist:**
```bash
npm run typecheck  # Must pass 0 errors
npm run build      # Must complete without warnings
npm run dev        # Verify visually in browser
```

**Visual Tests:**
- [ ] All 9 routes display with correct mode headers + strategy labels
- [ ] Selecting a route highlights it on map + pans into view
- [ ] Advanced Dashboard drawer opens from right, covers map, doesn't block sidebar
- [ ] All 6 feature result layouts render correctly (no JSON tabs)
- [ ] Grade pills show correct colors (A=bright green, D=orange)
- [ ] Stop button turns amber when real-time updates running
- [ ] Close drawer; all sidebar features still work

---

## Future Improvements

1. **Persist Advanced Settings** — Save user's last-used inputs per feature in localStorage
2. **Export Results** — "Download as CSV/PDF" for each feature's results
3. **Comparison Mode** — Compare 2 routes side-by-side (MultiModal vs Custom)
4. **Real Historical Data** — Replace simulated real-time with actual traffic API
5. **Mobile Drawer** — At small viewport, make drawer full-screen instead of 60vw
6. **Feature Toggles** — Let users enable/disable features they don't need
7. **Keyboard Navigation** — Arrow keys to cycle through features, Enter to run

---

## Summary: What We Learned

✅ **Route selection:** Stable IDs (composite keys) beat mode-based models for multi-option systems
✅ **API resilience:** Fallback APIs prevent single points of failure
✅ **UI architecture:** Drawer patterns allow non-destructive feature expansion
✅ **Result display:** Feature-specific layouts > generic JSON panels for UX
✅ **Theme:** Consistent color palette (eco green + amber) strengthens brand
✅ **TypeScript:** Explicit types for external APIs catch bugs early
✅ **CSS:** Semantic naming + grid layouts + animations = maintainable UI

**Next session:** Run `npm run typecheck`, test visually in browser, gather user feedback on result layouts.
