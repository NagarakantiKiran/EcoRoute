# 🚀 Advanced Dashboard Integration Guide
### Merging OSRM Advanced Features into Your Eco Route Finder

> **Your green project** = the sidebar + Leaflet map app (`ecoroute`)
> **Advanced dashboard** = the 6-feature OSRM panel you want to bring in
> **Rule** = Zero existing features get touched or broken

---

## The Big Picture — Where Does It Fit?

Your current app has a **left sidebar** and a **right map**. The advanced dashboard is a separate full-page panel. The cleanest way to merge them is to add a **"Advanced 🚀" toggle button** in your sidebar. When clicked, a **slide-in drawer** opens over the map showing the 6 advanced feature cards. The map stays intact underneath.

```
┌──────────────────┬────────────────────────────────────┐
│   YOUR SIDEBAR   │         LEAFLET MAP                 │
│                  │                                     │
│  [Plan Journey]  │   ┌─────────────────────────────┐  │
│  [Route Options] │   │  ADVANCED DRAWER (slide-in) │  │
│                  │   │  • Multi-Modal Transport    │  │
│  [Advanced 🚀]  │   │  • Alternative Routes       │  │
│  ← new button    │   │  • Route Optimization       │  │
│                  │   │  • Duration Matrix          │  │
│                  │   │  • Eco Score Comparison     │  │
│                  │   │  • Real-time Updates        │  │
└──────────────────┴───┴─────────────────────────────┴──┘
```

---

## Step 1 — Add the CSS (paste inside your `<style>` block)

Find the closing `</style>` tag in your project and paste this **just before it**:

```css
/* ===== ADVANCED DASHBOARD DRAWER ===== */
.advanced-drawer {
    position: fixed;
    top: 0;
    right: -100%;
    width: calc(100vw - 400px); /* fills the map area */
    height: 100vh;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    z-index: 2000;
    overflow-y: auto;
    transition: right 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    padding: 20px;
}

.advanced-drawer.open {
    right: 0;
}

.drawer-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 25px;
}

.drawer-header h2 {
    color: white;
    font-size: 1.8em;
    text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
}

.drawer-close-btn {
    background: rgba(255,255,255,0.2);
    border: 2px solid white;
    color: white;
    padding: 10px 18px;
    border-radius: 8px;
    cursor: pointer;
    font-weight: 700;
    font-size: 16px;
    transition: all 0.3s;
}

.drawer-close-btn:hover {
    background: rgba(255,255,255,0.35);
}

/* Overlay (dims sidebar when drawer is open) */
.drawer-overlay {
    display: none;
    position: fixed;
    top: 0; left: 0;
    width: 400px; /* same as sidebar width */
    height: 100vh;
    background: rgba(0,0,0,0.3);
    z-index: 1999;
}

.drawer-overlay.active {
    display: block;
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

/* ---- Cards inside drawer (copied from advanced dashboard) ---- */
.adv-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(420px, 1fr));
    gap: 20px;
}

.adv-card {
    background: white;
    border-radius: 16px;
    padding: 25px;
    box-shadow: 0 10px 40px rgba(0,0,0,0.2);
    transition: transform 0.3s;
}

.adv-card:hover {
    transform: translateY(-5px);
}

.adv-card h3 {
    color: #667eea;
    margin-bottom: 8px;
    font-size: 1.3em;
    display: flex;
    align-items: center;
    gap: 10px;
}

.adv-card .adv-subtitle {
    color: #7f8c8d;
    font-size: 13px;
    margin-bottom: 18px;
}

.adv-input-group {
    margin-bottom: 13px;
}

.adv-input-group label {
    display: block;
    font-weight: 600;
    margin-bottom: 5px;
    color: #2c3e50;
    font-size: 13px;
}

.adv-input-group input,
.adv-input-group select,
.adv-input-group textarea {
    width: 100%;
    padding: 10px;
    border: 2px solid #e0e0e0;
    border-radius: 8px;
    font-size: 13px;
    font-family: inherit;
    transition: border 0.3s;
}

.adv-input-group input:focus,
.adv-input-group select:focus,
.adv-input-group textarea:focus {
    outline: none;
    border-color: #667eea;
}

.adv-btn {
    background: linear-gradient(135deg, #667eea, #764ba2);
    color: white;
    border: none;
    padding: 13px 24px;
    border-radius: 8px;
    cursor: pointer;
    font-weight: 600;
    font-size: 14px;
    width: 100%;
    transition: all 0.3s;
    box-shadow: 0 4px 15px rgba(102,126,234,0.3);
    font-family: inherit;
}

.adv-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(102,126,234,0.4);
}

.adv-result {
    margin-top: 18px;
    display: none;
}

/* Result summary block */
.adv-result-summary {
    background: linear-gradient(135deg, #667eea, #764ba2);
    color: white;
    padding: 18px;
    border-radius: 12px;
    margin-bottom: 13px;
}

.adv-result-summary h4 {
    margin-bottom: 13px;
    font-size: 1.15em;
}

.adv-stat-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(130px, 1fr));
    gap: 12px;
}

.adv-stat-item {
    background: rgba(255,255,255,0.2);
    padding: 10px;
    border-radius: 8px;
}

.adv-stat-label { font-size: 11px; opacity: 0.9; margin-bottom: 4px; }
.adv-stat-value { font-size: 18px; font-weight: 700; }

/* Route comparison mini-cards */
.adv-route-comparison {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
    gap: 12px;
    margin-bottom: 13px;
}

.adv-route-option {
    background: white;
    border: 2px solid #e0e0e0;
    border-radius: 10px;
    padding: 13px;
    transition: all 0.3s;
}

.adv-route-option.best { border-color: #10b981; background: #f0fdf4; }

.adv-route-badge {
    display: inline-block;
    padding: 3px 10px;
    border-radius: 10px;
    font-size: 10px;
    font-weight: 700;
    margin-bottom: 8px;
}

.adv-badge-fastest { background: #dbeafe; color: #1e40af; }
.adv-badge-eco     { background: #d1fae5; color: #065f46; }
.adv-badge-balanced{ background: #fef3c7; color: #92400e; }

/* JSON viewer */
.adv-tabs {
    display: flex;
    gap: 8px;
    margin-bottom: 12px;
}

.adv-tab {
    padding: 8px 16px;
    background: #f3f4f6;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    font-weight: 600;
    font-size: 13px;
    transition: all 0.3s;
}

.adv-tab.active { background: #667eea; color: white; }

.adv-tab-content { display: none; }
.adv-tab-content.active { display: block; }

.adv-json-viewer {
    background: #1e293b;
    color: #e2e8f0;
    padding: 18px;
    border-radius: 10px;
    font-family: 'Courier New', monospace;
    font-size: 12px;
    max-height: 300px;
    overflow-y: auto;
    position: relative;
}

.adv-json-viewer pre { margin: 0; white-space: pre-wrap; word-wrap: break-word; }

.adv-copy-btn {
    position: absolute;
    top: 8px; right: 8px;
    background: #667eea;
    color: white;
    border: none;
    padding: 6px 12px;
    border-radius: 5px;
    cursor: pointer;
    font-size: 11px;
    font-weight: 600;
}

/* Alert styles */
.adv-alert { padding: 13px; border-radius: 8px; margin-bottom: 12px; }
.adv-alert-error   { background: #fee2e2; color: #991b1b; border: 1px solid #fecaca; }
.adv-alert-success { background: #d1fae5; color: #065f46; border: 1px solid #a7f3d0; }

/* Realtime toggle button */
#advRealtimeBtn[data-active="true"] {
    background: linear-gradient(135deg, #ef4444, #dc2626);
}

/* Mobile responsive */
@media (max-width: 768px) {
    .advanced-drawer {
        width: 100vw;
        right: -100vw;
    }
    .drawer-overlay { width: 100vw; }
    .adv-grid { grid-template-columns: 1fr; }
}
/* ===== END ADVANCED DASHBOARD DRAWER ===== */
```

---

## Step 2 — Add the "Advanced 🚀" Button in Your Sidebar HTML

In your project, find this button in the sidebar:
```html
<button class="btn btn-calculate" id="calculateBtn" onclick="calculateRoutes()" disabled>
    🔍 Find Eco Routes
</button>
```

Paste this **right after** that button (still inside the `<div class="controls-section">`):

```html
<!-- Advanced Dashboard Toggle -->
<button class="btn-advanced" onclick="openAdvancedDashboard()">
    🚀 Advanced Dashboard
</button>
```

---

## Step 3 — Add the Drawer HTML

Find the closing `</div>` of your `.app-container` div (it comes just before `<script src="...leaflet...">`). Paste this entire block **after** it:

```html
<!-- Dim overlay for sidebar -->
<div class="drawer-overlay" id="drawerOverlay" onclick="closeAdvancedDashboard()"></div>

<!-- Advanced Dashboard Drawer -->
<div class="advanced-drawer" id="advancedDrawer">

    <div class="drawer-header">
        <h2>🚀 Advanced Dashboard</h2>
        <button class="drawer-close-btn" onclick="closeAdvancedDashboard()">✕ Close</button>
    </div>

    <div class="adv-grid">

        <!-- 1. Multi-Modal Transport -->
        <div class="adv-card">
            <h3>🚌 Multi-Modal Transport</h3>
            <div class="adv-subtitle">Compare Car + Bike + Walk options</div>
            <div class="adv-input-group">
                <label>From (lon,lat)</label>
                <input type="text" id="advMultiStart" value="77.2090,28.6139" placeholder="lon,lat">
            </div>
            <div class="adv-input-group">
                <label>To (lon,lat)</label>
                <input type="text" id="advMultiEnd" value="77.2295,28.6358" placeholder="lon,lat">
            </div>
            <button class="adv-btn" onclick="advGetMultiModal()">Compare Transport Modes</button>
            <div id="advMultiResult" class="adv-result"></div>
        </div>

        <!-- 2. Alternative Routes -->
        <div class="adv-card">
            <h3>🛣️ Alternative Routes</h3>
            <div class="adv-subtitle">Show multiple route options with comparison</div>
            <div class="adv-input-group">
                <label>From (lon,lat)</label>
                <input type="text" id="advAltStart" value="78.4867,17.3850" placeholder="lon,lat">
            </div>
            <div class="adv-input-group">
                <label>To (lon,lat)</label>
                <input type="text" id="advAltEnd" value="78.3479,17.4401" placeholder="lon,lat">
            </div>
            <button class="adv-btn" onclick="advGetAlternativeRoutes()">Find Alternative Routes</button>
            <div id="advAltResult" class="adv-result"></div>
        </div>

        <!-- 3. Route Optimization -->
        <div class="adv-card">
            <h3>📍 Route Optimization</h3>
            <div class="adv-subtitle">Optimize order for multiple stops (TSP)</div>
            <div class="adv-input-group">
                <label>Waypoints (semicolon separated)</label>
                <textarea id="advWaypointsInput" rows="3">77.2090,28.6139;77.2167,28.6289;77.2295,28.6358;77.2020,28.6400</textarea>
            </div>
            <button class="adv-btn" onclick="advOptimizeRoute()">Optimize Route Order</button>
            <div id="advOptimizeResult" class="adv-result"></div>
        </div>

        <!-- 4. Duration Matrix -->
        <div class="adv-card">
            <h3>⏱️ Duration Matrix</h3>
            <div class="adv-subtitle">Travel time between all points</div>
            <div class="adv-input-group">
                <label>Locations (semicolon separated)</label>
                <textarea id="advMatrixInput" rows="3">72.8777,19.0760;77.5946,12.9716;78.4867,17.3850</textarea>
            </div>
            <button class="adv-btn" onclick="advGetDurationMatrix()">Calculate Matrix</button>
            <div id="advMatrixResult" class="adv-result"></div>
        </div>

        <!-- 5. Eco Score Comparison -->
        <div class="adv-card">
            <h3>🌿 Eco Score Comparison</h3>
            <div class="adv-subtitle">Compare carbon footprint across vehicles</div>
            <div class="adv-input-group">
                <label>From (lon,lat)</label>
                <input type="text" id="advEcoStart" value="77.2090,28.6139">
            </div>
            <div class="adv-input-group">
                <label>To (lon,lat)</label>
                <input type="text" id="advEcoEnd" value="77.5946,12.9716">
            </div>
            <div class="adv-input-group">
                <label>Vehicle Type</label>
                <select id="advVehicleType">
                    <option value="car-petrol">Petrol Car</option>
                    <option value="car-diesel">Diesel Car</option>
                    <option value="car-electric">Electric Car</option>
                    <option value="bicycle">Bicycle</option>
                    <option value="walking">Walking</option>
                </select>
            </div>
            <button class="adv-btn" onclick="advGetEcoComparison()">Calculate Eco Score</button>
            <div id="advEcoResult" class="adv-result"></div>
        </div>

        <!-- 6. Real-time Updates -->
        <div class="adv-card">
            <h3>🔄 Real-time Updates</h3>
            <div class="adv-subtitle">Simulate live route recalculation</div>
            <div class="adv-input-group">
                <label>From (lon,lat)</label>
                <input type="text" id="advRealtimeStart" value="77.2090,28.6139">
            </div>
            <div class="adv-input-group">
                <label>To (lon,lat)</label>
                <input type="text" id="advRealtimeEnd" value="77.2295,28.6358">
            </div>
            <div class="adv-input-group">
                <label>Update Interval (seconds)</label>
                <input type="number" id="advUpdateInterval" value="5" min="3" max="30">
            </div>
            <button class="adv-btn" id="advRealtimeBtn" onclick="advStartRealtimeUpdates()">
                Start Real-time Updates
            </button>
            <div id="advRealtimeResult" class="adv-result"></div>
        </div>

    </div>
</div>
```

---

## Step 4 — Add the JavaScript

In your project find the very last `</script>` tag (near the bottom of the file). Paste this entire block **just before** that `</script>`:

```js
// ============================================================
// ADVANCED DASHBOARD — All functions prefixed with "adv"
// to avoid any name collisions with existing code
// ============================================================

const ADV_OSRM = 'https://router.project-osrm.org';

const ADV_EMISSION = {
    'car-petrol': 0.171,
    'car-diesel': 0.158,
    'car-electric': 0.053,
    'bicycle': 0,
    'walking': 0,
    'bus': 0.089,
    'bike': 0.113
};

// --- Open / Close drawer ---
function openAdvancedDashboard() {
    document.getElementById('advancedDrawer').classList.add('open');
    document.getElementById('drawerOverlay').classList.add('active');
}

function closeAdvancedDashboard() {
    document.getElementById('advancedDrawer').classList.remove('open');
    document.getElementById('drawerOverlay').classList.remove('active');
    // Also stop any running realtime interval
    if (advRealtimeInterval) {
        clearInterval(advRealtimeInterval);
        advRealtimeInterval = null;
        const btn = document.getElementById('advRealtimeBtn');
        if (btn) {
            btn.textContent = 'Start Real-time Updates';
            btn.removeAttribute('data-active');
        }
    }
}

// --- JSON formatting helper ---
function advFormatJSON(obj) {
    const json = JSON.stringify(obj, null, 2);
    return json
        .replace(/"([^"]+)":/g, '<span style="color:#93c5fd">"$1"</span>:')
        .replace(/: "([^"]+)"/g, ': <span style="color:#a5f3fc">"$1"</span>')
        .replace(/: (\d+\.?\d*)/g,  ': <span style="color:#fbbf24">$1</span>')
        .replace(/: (true|false)/g, ': <span style="color:#f472b6">$1</span>')
        .replace(/: null/g,         ': <span style="color:#fb923c">null</span>');
}

// --- Display result with tabs helper ---
function advDisplayResult(containerId, summaryHTML, organizedData, rawData) {
    const container = document.getElementById(containerId);
    container.innerHTML = `
        ${summaryHTML}
        <div class="adv-tabs">
            <button class="adv-tab active" onclick="advSwitchTab(event, 'adv-org-${containerId}')">📊 Organized</button>
            <button class="adv-tab" onclick="advSwitchTab(event, 'adv-raw-${containerId}')">🔧 Raw JSON</button>
        </div>
        <div id="adv-org-${containerId}" class="adv-tab-content active">
            <div class="adv-json-viewer">
                <button class="adv-copy-btn" onclick="advCopyJSON('adv-org-${containerId}')">📋 Copy</button>
                <pre>${advFormatJSON(organizedData)}</pre>
            </div>
        </div>
        <div id="adv-raw-${containerId}" class="adv-tab-content">
            <div class="adv-json-viewer">
                <button class="adv-copy-btn" onclick="advCopyJSON('adv-raw-${containerId}')">📋 Copy</button>
                <pre>${advFormatJSON(rawData)}</pre>
            </div>
        </div>
    `;
    container.style.display = 'block';
}

function advSwitchTab(event, tabId) {
    const card = event.target.closest('.adv-card');
    card.querySelectorAll('.adv-tab').forEach(t => t.classList.remove('active'));
    card.querySelectorAll('.adv-tab-content').forEach(c => c.classList.remove('active'));
    event.target.classList.add('active');
    document.getElementById(tabId).classList.add('active');
}

function advCopyJSON(tabId) {
    const content = document.getElementById(tabId).querySelector('pre').textContent;
    navigator.clipboard.writeText(content);
    alert('Copied to clipboard!');
}

// --- 1. Multi-Modal Transport ---
async function advGetMultiModal() {
    const start = document.getElementById('advMultiStart').value;
    const end   = document.getElementById('advMultiEnd').value;
    try {
        const modes = [
            { name: 'driving', icon: '🚗', label: 'Car' },
            { name: 'bike',    icon: '🚴', label: 'Bicycle' },
            { name: 'foot',    icon: '🚶', label: 'Walking' }
        ];
        const results = await Promise.all(modes.map(async mode => {
            const res  = await fetch(`${ADV_OSRM}/route/v1/${mode.name}/${start};${end}?overview=false`);
            const data = await res.json();
            if (data.code === 'Ok') {
                const r   = data.routes[0];
                const co2 = (r.distance / 1000) * (ADV_EMISSION[mode.name === 'driving' ? 'car-petrol' : mode.name] || 0);
                return { mode: mode.label, icon: mode.icon, distance_km: (r.distance/1000).toFixed(2), duration_min: (r.duration/60).toFixed(1), co2_kg: co2.toFixed(3), eco_score: co2===0 ? 100 : Math.max(0, 100-(co2*10)) };
            }
            return null;
        }));
        const valid = results.filter(Boolean);
        const best  = valid.reduce((a, b) => parseFloat(a.co2_kg) < parseFloat(b.co2_kg) ? a : b);
        const organizedData = { query: { from: start, to: end }, options: valid, recommendation: { best_option: best.mode, reason: best.co2_kg==='0.000' ? 'Zero emissions' : 'Lowest carbon footprint' } };
        const summaryHTML = `
            <div class="adv-result-summary">
                <h4>🚌 Multi-Modal Transport Options</h4>
                <div class="adv-route-comparison">
                    ${valid.map(r => `
                        <div class="adv-route-option ${r.mode===best.mode ? 'best' : ''}">
                            <div style="font-size:2em;text-align:center;margin-bottom:8px">${r.icon}</div>
                            <div style="font-weight:700;text-align:center;margin-bottom:8px">${r.mode}</div>
                            <div style="font-size:12px;color:#6b7280">
                                <div>📏 ${r.distance_km} km</div>
                                <div>⏱️ ${r.duration_min} min</div>
                                <div>💨 ${r.co2_kg} kg CO₂</div>
                                <div>🌿 Score: ${r.eco_score.toFixed(0)}</div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>`;
        advDisplayResult('advMultiResult', summaryHTML, organizedData, valid);
    } catch (e) {
        document.getElementById('advMultiResult').innerHTML = `<div class="adv-alert adv-alert-error">❌ ${e.message}</div>`;
        document.getElementById('advMultiResult').style.display = 'block';
    }
}

// --- 2. Alternative Routes ---
async function advGetAlternativeRoutes() {
    const start = document.getElementById('advAltStart').value;
    const end   = document.getElementById('advAltEnd').value;
    try {
        const res  = await fetch(`${ADV_OSRM}/route/v1/driving/${start};${end}?alternatives=true&overview=full&geometries=geojson`);
        const data = await res.json();
        if (data.code === 'Ok') {
            const routes = data.routes.slice(0, 3).map((route, idx) => {
                const co2 = (route.distance/1000) * ADV_EMISSION['car-petrol'];
                return { route_number: idx+1, type: idx===0 ? 'Fastest' : `Alternative ${idx}`, distance_km: (route.distance/1000).toFixed(2), duration_min: (route.duration/60).toFixed(1), co2_kg: co2.toFixed(3) };
            });
            const organizedData = { query: { from: start, to: end }, routes, comparison: { fastest: routes[0], shortest: routes.reduce((a,b) => parseFloat(a.distance_km)<parseFloat(b.distance_km)?a:b), most_eco: routes.reduce((a,b) => parseFloat(a.co2_kg)<parseFloat(b.co2_kg)?a:b) } };
            const summaryHTML = `
                <div class="adv-result-summary">
                    <h4>🛣️ ${routes.length} Alternative Routes Found</h4>
                    <div class="adv-route-comparison">
                        ${routes.map((r, idx) => `
                            <div class="adv-route-option">
                                <span class="adv-route-badge ${idx===0?'adv-badge-fastest':'adv-badge-balanced'}">${r.type}</span>
                                <div style="font-size:12px;color:#374151">
                                    <div><strong>Distance:</strong> ${r.distance_km} km</div>
                                    <div><strong>Duration:</strong> ${r.duration_min} min</div>
                                    <div><strong>CO₂:</strong> ${r.co2_kg} kg</div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>`;
            advDisplayResult('advAltResult', summaryHTML, organizedData, data);
        }
    } catch (e) {
        document.getElementById('advAltResult').innerHTML = `<div class="adv-alert adv-alert-error">❌ ${e.message}</div>`;
        document.getElementById('advAltResult').style.display = 'block';
    }
}

// --- 3. Route Optimization (TSP) ---
async function advOptimizeRoute() {
    const coords = document.getElementById('advWaypointsInput').value;
    try {
        const res  = await fetch(`${ADV_OSRM}/trip/v1/driving/${coords}?overview=full&geometries=geojson`);
        const data = await res.json();
        if (data.code === 'Ok') {
            const trip = data.trips[0];
            const co2  = (trip.distance/1000) * ADV_EMISSION['car-petrol'];
            const organizedData = {
                optimized_trip: { total_distance_km: (trip.distance/1000).toFixed(2), total_duration_min: (trip.duration/60).toFixed(1), total_co2_kg: co2.toFixed(3), waypoints_count: data.waypoints.length },
                visit_order: data.waypoints.map((wp,i) => ({ stop: i+1, location: wp.location, name: wp.name||`Stop ${i+1}` })),
                savings_estimate: { vs_random_order: '15-25% distance saved', fuel_saved: '2-4 liters (estimated)' }
            };
            const summaryHTML = `
                <div class="adv-result-summary">
                    <h4>📍 Optimized Route (TSP Solution)</h4>
                    <div class="adv-stat-grid">
                        <div class="adv-stat-item"><div class="adv-stat-label">Total Distance</div><div class="adv-stat-value">${organizedData.optimized_trip.total_distance_km} km</div></div>
                        <div class="adv-stat-item"><div class="adv-stat-label">Total Time</div><div class="adv-stat-value">${organizedData.optimized_trip.total_duration_min} min</div></div>
                        <div class="adv-stat-item"><div class="adv-stat-label">CO₂</div><div class="adv-stat-value">${organizedData.optimized_trip.total_co2_kg} kg</div></div>
                        <div class="adv-stat-item"><div class="adv-stat-label">Stops</div><div class="adv-stat-value">${data.waypoints.length}</div></div>
                    </div>
                </div>`;
            advDisplayResult('advOptimizeResult', summaryHTML, organizedData, data);
        }
    } catch (e) {
        document.getElementById('advOptimizeResult').innerHTML = `<div class="adv-alert adv-alert-error">❌ ${e.message}</div>`;
        document.getElementById('advOptimizeResult').style.display = 'block';
    }
}

// --- 4. Duration Matrix ---
async function advGetDurationMatrix() {
    const coords = document.getElementById('advMatrixInput').value;
    try {
        const res  = await fetch(`${ADV_OSRM}/table/v1/driving/${coords}`);
        const data = await res.json();
        if (data.code === 'Ok') {
            const locs   = coords.split(';');
            const labels = locs.map((_, i) => `Point ${i+1}`);
            let tableHTML = '<div style="overflow-x:auto"><table style="width:100%;border-collapse:collapse;margin:12px 0;font-size:12px">';
            tableHTML += '<tr><th style="background:rgba(255,255,255,0.2);padding:8px;border:1px solid rgba(255,255,255,0.3)"></th>';
            labels.forEach(l => { tableHTML += `<th style="background:rgba(255,255,255,0.2);padding:8px;border:1px solid rgba(255,255,255,0.3)">${l}</th>`; });
            tableHTML += '</tr>';
            data.durations.forEach((row, i) => {
                tableHTML += `<tr><th style="background:rgba(255,255,255,0.2);padding:8px;border:1px solid rgba(255,255,255,0.3)">${labels[i]}</th>`;
                row.forEach(d => { tableHTML += `<td style="padding:8px;text-align:center;border:1px solid rgba(255,255,255,0.3)">${d ? (d/60).toFixed(0)+' min' : '-'}</td>`; });
                tableHTML += '</tr>';
            });
            tableHTML += '</table></div>';
            const organizedData = { locations: locs, matrix_minutes: data.durations.map(r => r.map(d => d ? (d/60).toFixed(1) : 0)) };
            const summaryHTML = `<div class="adv-result-summary"><h4>⏱️ Duration Matrix</h4>${tableHTML}</div>`;
            advDisplayResult('advMatrixResult', summaryHTML, organizedData, data);
        }
    } catch (e) {
        document.getElementById('advMatrixResult').innerHTML = `<div class="adv-alert adv-alert-error">❌ ${e.message}</div>`;
        document.getElementById('advMatrixResult').style.display = 'block';
    }
}

// --- 5. Eco Score Comparison ---
async function advGetEcoComparison() {
    const start   = document.getElementById('advEcoStart').value;
    const end     = document.getElementById('advEcoEnd').value;
    const vehicle = document.getElementById('advVehicleType').value;
    try {
        const res  = await fetch(`${ADV_OSRM}/route/v1/driving/${start};${end}?overview=false`);
        const data = await res.json();
        if (data.code === 'Ok') {
            const route    = data.routes[0];
            const distance = route.distance / 1000;
            const co2      = distance * (ADV_EMISSION[vehicle] || 0);
            const ecoScore = co2 === 0 ? 100 : Math.max(0, 100 - (co2/distance*50));
            const allV     = Object.keys(ADV_EMISSION).map(v => ({ type: v, co2_kg: (distance*ADV_EMISSION[v]).toFixed(3), eco_score: ADV_EMISSION[v]===0 ? 100 : Math.max(0, 100-(distance*ADV_EMISSION[v]/distance*50)) }));
            const organizedData = { route_info: { from: start, to: end, distance_km: distance.toFixed(2), duration_min: (route.duration/60).toFixed(1) }, selected_vehicle: { type: vehicle, co2_kg: co2.toFixed(3), eco_score: ecoScore.toFixed(0), rating: ecoScore>80?'Excellent':ecoScore>60?'Good':ecoScore>40?'Average':'Poor' }, all_vehicles: allV, environmental_impact: { trees_to_offset: (co2/21).toFixed(2), savings_vs_petrol: ((distance*ADV_EMISSION['car-petrol'])-co2).toFixed(3)+' kg CO₂' } };
            const summaryHTML = `
                <div class="adv-result-summary">
                    <h4>🌿 Eco Score: ${ecoScore.toFixed(0)}/100</h4>
                    <div class="adv-stat-grid">
                        <div class="adv-stat-item"><div class="adv-stat-label">CO₂ Emissions</div><div class="adv-stat-value">${co2.toFixed(2)} kg</div></div>
                        <div class="adv-stat-item"><div class="adv-stat-label">Distance</div><div class="adv-stat-value">${distance.toFixed(0)} km</div></div>
                        <div class="adv-stat-item"><div class="adv-stat-label">Vehicle</div><div class="adv-stat-value">${vehicle}</div></div>
                        <div class="adv-stat-item"><div class="adv-stat-label">Rating</div><div class="adv-stat-value">${organizedData.selected_vehicle.rating}</div></div>
                    </div>
                </div>`;
            advDisplayResult('advEcoResult', summaryHTML, organizedData, data);
        }
    } catch (e) {
        document.getElementById('advEcoResult').innerHTML = `<div class="adv-alert adv-alert-error">❌ ${e.message}</div>`;
        document.getElementById('advEcoResult').style.display = 'block';
    }
}

// --- 6. Real-time Updates ---
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
        btn.removeAttribute('data-active');
        return;
    }

    btn.textContent = 'Stop Updates';
    btn.setAttribute('data-active', 'true');
    let count = 0; const updates = [];

    advRealtimeInterval = setInterval(async () => {
        count++;
        try {
            const res  = await fetch(`${ADV_OSRM}/route/v1/driving/${start};${end}?overview=false`);
            const data = await res.json();
            if (data.code === 'Ok') {
                const r = data.routes[0];
                const update = { update: count, time: new Date().toLocaleTimeString(), distance_km: (r.distance/1000).toFixed(2), duration_min: (r.duration/60).toFixed(1), traffic: Math.random()>0.5?'Normal':'Heavy' };
                updates.push(update);
                const organizedData = { live_status: 'Active', total_updates: count, current: update, history: updates.slice(-5) };
                const summaryHTML = `
                    <div class="adv-result-summary">
                        <h4>🔄 Update #${count}</h4>
                        <div class="adv-stat-grid">
                            <div class="adv-stat-item"><div class="adv-stat-label">Distance</div><div class="adv-stat-value">${update.distance_km} km</div></div>
                            <div class="adv-stat-item"><div class="adv-stat-label">Duration</div><div class="adv-stat-value">${update.duration_min} min</div></div>
                            <div class="adv-stat-item"><div class="adv-stat-label">Traffic</div><div class="adv-stat-value">${update.traffic}</div></div>
                            <div class="adv-stat-item"><div class="adv-stat-label">Updates</div><div class="adv-stat-value">${count}</div></div>
                        </div>
                    </div>`;
                advDisplayResult('advRealtimeResult', summaryHTML, organizedData, data);
            }
        } catch (e) { console.error('Realtime error:', e); }
    }, interval);
}
// ============================================================
// END ADVANCED DASHBOARD
// ============================================================
```

---

## Summary — Where Each Piece Goes

| What | Where in your `index.html` |
|---|---|
| CSS block (Step 1) | Just before `</style>` |
| "Advanced 🚀" button (Step 2) | After the `🔍 Find Eco Routes` button |
| Drawer HTML (Step 3) | After closing `</div>` of `.app-container`, before `<script src="...leaflet...">` |
| JavaScript block (Step 4) | Just before the final `</script>` tag |

---

## Testing Checklist

- [ ] Open your project — sidebar and map load as normal
- [ ] Click **"Advanced 🚀"** button — drawer slides in from the right
- [ ] Overlay dims the sidebar, close button (✕) works
- [ ] Click each of the 6 feature buttons — results appear with stats + JSON tabs
- [ ] "📋 Copy" button copies JSON to clipboard
- [ ] Start Real-time Updates → button turns red → click again to Stop
- [ ] Close drawer → realtime updates stop automatically
- [ ] All existing features (city search, vehicle selector, Find Eco Routes, map click, swap, clear) work exactly as before
- [ ] Test on mobile — drawer becomes full-width
