# 🔄 Advanced Dashboard — Auto-Fill & Autocomplete Guide
### Sync main sidebar Start/End → all Advanced Dashboard inputs + live city search using Positionstack API

> **Zero existing features broken**
> **Two behaviours added:**
> 1. When user sets Start/End on the main map → all 6 Advanced Dashboard feature inputs auto-fill instantly (live sync)
> 2. When user opens Advanced Dashboard → inputs are pre-filled with current Start/End
> 3. Each Advanced Dashboard input also has live autocomplete (type a name → dropdown → click → fills lon,lat)

---

## How It Works (Big Picture)

```
User types "Hyderabad" in main sidebar
        ↓
startCoords = { lat: 17.385, lng: 78.4867 }  ← already set by your existing code
        ↓
advSyncCoords() is called automatically
        ↓
All 10 "From" fields in Advanced Dashboard = "78.4867,17.385"  ← lon,lat format OSRM needs

User also opens Advanced Dashboard and types "Delhi" in advMultiStart input
        ↓
Positionstack API called: /v1/forward?query=Delhi
        ↓
Dropdown shows: "Delhi, India" → user clicks
        ↓
advMultiStart input = "77.2090,28.6139"
```

---

## Step 1 — Store Your Positionstack API Key

At the very top of your `<script>` block, right after `const ADV_OSRM = ...`, add:

```js
// Positionstack geocoding API key
const POSITION_KEY = 'YOUR_API_KEY_HERE'; // ← replace with your actual key
```

> ⚠️ Replace `YOUR_API_KEY_HERE` with your real key from positionstack.com/dashboard

---

## Step 2 — Add the CSS for Autocomplete Dropdowns

Paste this inside your `<style>` block, just before `</style>`:

```css
/* ===== ADV DASHBOARD AUTOCOMPLETE ===== */
.adv-input-wrapper {
    position: relative;
}

.adv-suggestions {
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    background: #1a3a2a;
    border: 1px solid #4ade80;
    border-top: none;
    border-radius: 0 0 8px 8px;
    max-height: 180px;
    overflow-y: auto;
    z-index: 9999;
    display: none;
    box-shadow: 0 8px 20px rgba(0,0,0,0.4);
}

.adv-suggestions.open {
    display: block;
}

.adv-suggestion-item {
    padding: 10px 14px;
    color: #e0ffe8;
    font-size: 13px;
    cursor: pointer;
    border-bottom: 1px solid #2d5a3d;
    display: flex;
    align-items: center;
    gap: 8px;
    transition: background 0.2s;
}

.adv-suggestion-item:last-child {
    border-bottom: none;
}

.adv-suggestion-item:hover {
    background: #2d5a3d;
    color: #4ade80;
}

.adv-suggestion-item .adv-sugg-icon {
    font-size: 14px;
    flex-shrink: 0;
}

.adv-suggestion-item .adv-sugg-label {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.adv-searching {
    padding: 10px 14px;
    color: #6b9e7a;
    font-size: 12px;
    font-style: italic;
}

/* Visual indicator that input is auto-filled from main map */
.adv-input-synced {
    border-color: #4ade80 !important;
    box-shadow: 0 0 0 2px rgba(74,222,128,0.2) !important;
}
/* ===== END ADV DASHBOARD AUTOCOMPLETE ===== */
```

---

## Step 3 — Update the Drawer HTML Inputs

Every `<input>` in the Advanced Dashboard that accepts coordinates needs to be wrapped in an `.adv-input-wrapper` div and given a unique `id`. Replace **all 6 feature card input sections** inside the drawer HTML with the versions below.

### 3a — Multi-Modal Transport

Find:
```html
<div class="adv-input-group">
    <label>From (lon,lat)</label>
    <input type="text" id="advMultiStart" value="77.2090,28.6139" placeholder="lon,lat">
</div>
<div class="adv-input-group">
    <label>To (lon,lat)</label>
    <input type="text" id="advMultiEnd" value="77.2295,28.6358" placeholder="lon,lat">
</div>
```

Replace with:
```html
<div class="adv-input-group">
    <label>From — city name or coordinates</label>
    <div class="adv-input-wrapper">
        <input type="text" id="advMultiStart" placeholder="e.g. Hyderabad or 78.4867,17.3850"
               oninput="advHandleSearch(this, 'advMultiStartSugg')"
               onfocus="advHandleSearch(this, 'advMultiStartSugg')"
               autocomplete="off">
        <div class="adv-suggestions" id="advMultiStartSugg"></div>
    </div>
</div>
<div class="adv-input-group">
    <label>To — city name or coordinates</label>
    <div class="adv-input-wrapper">
        <input type="text" id="advMultiEnd" placeholder="e.g. Chennai or 80.2707,13.0827"
               oninput="advHandleSearch(this, 'advMultiEndSugg')"
               onfocus="advHandleSearch(this, 'advMultiEndSugg')"
               autocomplete="off">
        <div class="adv-suggestions" id="advMultiEndSugg"></div>
    </div>
</div>
```

### 3b — Alternative Routes

Find:
```html
<div class="adv-input-group">
    <label>From (lon,lat)</label>
    <input type="text" id="advAltStart" value="78.4867,17.3850" placeholder="lon,lat">
</div>
<div class="adv-input-group">
    <label>To (lon,lat)</label>
    <input type="text" id="advAltEnd" value="78.3479,17.4401" placeholder="lon,lat">
</div>
```

Replace with:
```html
<div class="adv-input-group">
    <label>From — city name or coordinates</label>
    <div class="adv-input-wrapper">
        <input type="text" id="advAltStart" placeholder="e.g. Hyderabad"
               oninput="advHandleSearch(this, 'advAltStartSugg')"
               onfocus="advHandleSearch(this, 'advAltStartSugg')"
               autocomplete="off">
        <div class="adv-suggestions" id="advAltStartSugg"></div>
    </div>
</div>
<div class="adv-input-group">
    <label>To — city name or coordinates</label>
    <div class="adv-input-wrapper">
        <input type="text" id="advAltEnd" placeholder="e.g. Gachibowli"
               oninput="advHandleSearch(this, 'advAltEndSugg')"
               onfocus="advHandleSearch(this, 'advAltEndSugg')"
               autocomplete="off">
        <div class="adv-suggestions" id="advAltEndSugg"></div>
    </div>
</div>
```

### 3c — Route Optimization

Find:
```html
<div class="adv-input-group">
    <label>Waypoints (semicolon separated)</label>
    <textarea id="advWaypointsInput" rows="3">...</textarea>
</div>
```

Replace with:
```html
<div class="adv-input-group">
    <label>Start Waypoint — city name or coordinates</label>
    <div class="adv-input-wrapper">
        <input type="text" id="advWaypointStart" placeholder="e.g. Delhi — auto-filled from main map"
               oninput="advHandleSearch(this, 'advWaypointStartSugg')"
               onfocus="advHandleSearch(this, 'advWaypointStartSugg')"
               autocomplete="off">
        <div class="adv-suggestions" id="advWaypointStartSugg"></div>
    </div>
</div>
<div class="adv-input-group">
    <label>All Waypoints (semicolon separated lon,lat)</label>
    <textarea id="advWaypointsInput" rows="3"
              placeholder="Auto-filled below when you pick start above. Add more stops manually.">77.2090,28.6139;77.2167,28.6289;77.2295,28.6358;77.2020,28.6400</textarea>
</div>
```

### 3d — Duration Matrix

Find:
```html
<div class="adv-input-group">
    <label>Locations (semicolon separated)</label>
    <textarea id="advMatrixInput" rows="3">...</textarea>
</div>
```

Replace with:
```html
<div class="adv-input-group">
    <label>Point 1 (From) — auto-filled from main map</label>
    <div class="adv-input-wrapper">
        <input type="text" id="advMatrixP1" placeholder="e.g. Mumbai"
               oninput="advHandleSearch(this, 'advMatrixP1Sugg')"
               onfocus="advHandleSearch(this, 'advMatrixP1Sugg')"
               autocomplete="off">
        <div class="adv-suggestions" id="advMatrixP1Sugg"></div>
    </div>
</div>
<div class="adv-input-group">
    <label>Point 2 (To) — auto-filled from main map</label>
    <div class="adv-input-wrapper">
        <input type="text" id="advMatrixP2" placeholder="e.g. Bangalore"
               oninput="advHandleSearch(this, 'advMatrixP2Sugg')"
               onfocus="advHandleSearch(this, 'advMatrixP2Sugg')"
               autocomplete="off">
        <div class="adv-suggestions" id="advMatrixP2Sugg"></div>
    </div>
</div>
<div class="adv-input-group">
    <label>All Locations (semicolon separated lon,lat)</label>
    <textarea id="advMatrixInput" rows="2"
              placeholder="Auto-updated when you pick points above.">72.8777,19.0760;77.5946,12.9716;78.4867,17.3850</textarea>
</div>
```

### 3e — Eco Score Comparison

Find:
```html
<input type="text" id="advEcoStart" value="77.2090,28.6139">
...
<input type="text" id="advEcoEnd" value="77.5946,12.9716">
```

Replace with:
```html
<div class="adv-input-group">
    <label>From — city name or coordinates</label>
    <div class="adv-input-wrapper">
        <input type="text" id="advEcoStart" placeholder="e.g. Delhi"
               oninput="advHandleSearch(this, 'advEcoStartSugg')"
               onfocus="advHandleSearch(this, 'advEcoStartSugg')"
               autocomplete="off">
        <div class="adv-suggestions" id="advEcoStartSugg"></div>
    </div>
</div>
<div class="adv-input-group">
    <label>To — city name or coordinates</label>
    <div class="adv-input-wrapper">
        <input type="text" id="advEcoEnd" placeholder="e.g. Bangalore"
               oninput="advHandleSearch(this, 'advEcoEndSugg')"
               onfocus="advHandleSearch(this, 'advEcoEndSugg')"
               autocomplete="off">
        <div class="adv-suggestions" id="advEcoEndSugg"></div>
    </div>
</div>
```

### 3f — Real-time Updates

Find:
```html
<input type="text" id="advRealtimeStart" value="77.2090,28.6139">
...
<input type="text" id="advRealtimeEnd" value="77.2295,28.6358">
```

Replace with:
```html
<div class="adv-input-group">
    <label>From — city name or coordinates</label>
    <div class="adv-input-wrapper">
        <input type="text" id="advRealtimeStart" placeholder="e.g. Delhi"
               oninput="advHandleSearch(this, 'advRealtimeStartSugg')"
               onfocus="advHandleSearch(this, 'advRealtimeStartSugg')"
               autocomplete="off">
        <div class="adv-suggestions" id="advRealtimeStartSugg"></div>
    </div>
</div>
<div class="adv-input-group">
    <label>To — city name or coordinates</label>
    <div class="adv-input-wrapper">
        <input type="text" id="advRealtimeEnd" placeholder="e.g. Noida"
               oninput="advHandleSearch(this, 'advRealtimeEndSugg')"
               onfocus="advHandleSearch(this, 'advRealtimeEndSugg')"
               autocomplete="off">
        <div class="adv-suggestions" id="advRealtimeEndSugg"></div>
    </div>
</div>
```

---

## Step 4 — Add the JavaScript

Paste this entire block inside your `<script>`, right after the `advGrade()` helper function:

```js
// ============================================================
// ADV DASHBOARD — AUTO-FILL + AUTOCOMPLETE
// ============================================================

// Debounce timer for search
let advSearchTimer = null;

// ---------- Positionstack geocoding ----------
async function advGeocode(query) {
    // If input looks like coordinates already (e.g. "78.4867,17.385"), skip API
    if (/^-?\d+\.?\d*,\s*-?\d+\.?\d*$/.test(query.trim())) return [];

    const url = `https://api.positionstack.com/v1/forward?access_key=${POSITION_KEY}&query=${encodeURIComponent(query)}&limit=5&output=json`;
    try {
        const res  = await fetch(url);
        const data = await res.json();
        return (data.data || []).map(item => ({
            label: item.label || `${item.name}, ${item.country}`,
            lon:   item.longitude,
            lat:   item.latitude
        }));
    } catch (e) {
        console.error('Geocode error:', e);
        return [];
    }
}

// ---------- Handle search input ----------
function advHandleSearch(inputEl, suggId) {
    const query = inputEl.value.trim();
    const sugg  = document.getElementById(suggId);

    // Close if too short or looks like coords
    if (query.length < 3 || /^-?\d+\.?\d*,/.test(query)) {
        advCloseSugg(suggId);
        return;
    }

    // Show loading state
    sugg.innerHTML = '<div class="adv-searching">🔍 Searching...</div>';
    sugg.classList.add('open');

    // Debounce — wait 400ms after user stops typing
    clearTimeout(advSearchTimer);
    advSearchTimer = setTimeout(async () => {
        const results = await advGeocode(query);
        if (results.length === 0) {
            sugg.innerHTML = '<div class="adv-searching">No results found</div>';
            return;
        }
        sugg.innerHTML = results.map(r => `
            <div class="adv-suggestion-item"
                 onclick="advSelectPlace('${inputEl.id}', '${suggId}', ${r.lon}, ${r.lat}, \`${r.label.replace(/`/g, "'")}\`)">
                <span class="adv-sugg-icon">📍</span>
                <span class="adv-sugg-label">${r.label}</span>
            </div>
        `).join('');
    }, 400);
}

// ---------- User picks a suggestion ----------
function advSelectPlace(inputId, suggId, lon, lat, label) {
    const input = document.getElementById(inputId);

    // Show city name as display text
    input.value = label;
    // Store actual coords as data attribute for API calls
    input.dataset.coords = `${lon},${lat}`;
    input.classList.add('adv-input-synced');

    advCloseSugg(suggId);

    // Special handling for matrix/waypoint textarea updates
    advUpdateTextareas();
}

// ---------- Close a suggestion dropdown ----------
function advCloseSugg(suggId) {
    const el = document.getElementById(suggId);
    if (el) { el.classList.remove('open'); el.innerHTML = ''; }
}

// ---------- Close all dropdowns when clicking outside ----------
document.addEventListener('click', (e) => {
    if (!e.target.closest('.adv-input-wrapper')) {
        document.querySelectorAll('.adv-suggestions').forEach(s => {
            s.classList.remove('open');
            s.innerHTML = '';
        });
    }
});

// ---------- Get coords from input (either dataset or raw value) ----------
function advGetCoords(inputId) {
    const el = document.getElementById(inputId);
    if (!el) return '';
    // Use stored coords if available (set by autocomplete)
    return el.dataset.coords || el.value.trim();
}

// ---------- Update textarea fields (Route Opt + Duration Matrix) ----------
function advUpdateTextareas() {
    // Route Optimization — update the textarea's first waypoint
    const wpStart = advGetCoords('advWaypointStart');
    if (wpStart) {
        const textarea = document.getElementById('advWaypointsInput');
        const existing = textarea.value.split(';').filter(Boolean);
        existing[0] = wpStart; // replace first waypoint only
        textarea.value = existing.join(';');
    }

    // Duration Matrix — update textarea's first two points
    const mp1 = advGetCoords('advMatrixP1');
    const mp2 = advGetCoords('advMatrixP2');
    if (mp1 || mp2) {
        const textarea = document.getElementById('advMatrixInput');
        const existing = textarea.value.split(';').filter(Boolean);
        if (mp1) existing[0] = mp1;
        if (mp2) existing[1] = mp2;
        textarea.value = existing.join(';');
    }
}

// ---------- LIVE SYNC from main map ----------
// Call this every time startCoords or endCoords changes in the main app
function advSyncCoords() {
    if (!startCoords && !endCoords) return;

    // Build coord strings in lon,lat format (OSRM format)
    const fromStr = startCoords ? `${startCoords.lng},${startCoords.lat}` : '';
    const toStr   = endCoords   ? `${endCoords.lng},${endCoords.lat}`     : '';

    // Get display names from main sidebar inputs
    const fromName = document.getElementById('startInput')?.value || fromStr;
    const toName   = document.getElementById('endInput')?.value   || toStr;

    // List of all [inputId, value, coordValue] to fill
    const fills = [
        // Multi-Modal
        ['advMultiStart',     fromName, fromStr],
        ['advMultiEnd',       toName,   toStr],
        // Alternative Routes
        ['advAltStart',       fromName, fromStr],
        ['advAltEnd',         toName,   toStr],
        // Eco Score
        ['advEcoStart',       fromName, fromStr],
        ['advEcoEnd',         toName,   toStr],
        // Real-time Updates
        ['advRealtimeStart',  fromName, fromStr],
        ['advRealtimeEnd',    toName,   toStr],
        // Route Optimization start waypoint
        ['advWaypointStart',  fromName, fromStr],
        // Duration Matrix points
        ['advMatrixP1',       fromName, fromStr],
        ['advMatrixP2',       toName,   toStr],
    ];

    fills.forEach(([id, displayVal, coordVal]) => {
        const el = document.getElementById(id);
        if (!el) return;
        if (displayVal) {
            el.value          = displayVal;
            el.dataset.coords = coordVal;
            el.classList.add('adv-input-synced');
        }
    });

    // Also update the textarea fields
    advUpdateTextareas();
}

// ============================================================
// END ADV DASHBOARD AUTO-FILL + AUTOCOMPLETE
// ============================================================
```

---

## Step 5 — Hook `advSyncCoords()` into the Main Map

Your existing `setStartLocation()` and `setEndLocation()` functions already set `startCoords` and `endCoords`. You just need to call `advSyncCoords()` at the end of each.

### In `setStartLocation()`:

Find the last line of `setStartLocation()`:
```js
updateCalculateButton();
```
Add one line directly after it:
```js
advSyncCoords(); // sync to advanced dashboard
```

### In `setEndLocation()`:

Find the last line of `setEndLocation()`:
```js
fitMapToMarkers();
```
Add one line directly after it:
```js
advSyncCoords(); // sync to advanced dashboard
```

---

## Step 6 — Pre-fill on Drawer Open

Find your `openAdvancedDashboard()` function:
```js
function openAdvancedDashboard() {
    document.getElementById('advancedDrawer').classList.add('open');
    document.getElementById('drawerOverlay').classList.add('active');
}
```

Replace with:
```js
function openAdvancedDashboard() {
    document.getElementById('advancedDrawer').classList.add('open');
    document.getElementById('drawerOverlay').classList.add('active');
    advSyncCoords(); // pre-fill all inputs with current main map coords
}
```

---

## Step 7 — Update API Calls to Use `advGetCoords()`

Since inputs now show city names (not raw coordinates), each feature's API call must read the coords from `dataset.coords` via `advGetCoords()`. Update the first two lines of each function:

### `advGetMultiModal()`
```js
// ❌ Old
const start = document.getElementById('advMultiStart').value;
const end   = document.getElementById('advMultiEnd').value;

// ✅ New
const start = advGetCoords('advMultiStart');
const end   = advGetCoords('advMultiEnd');
```

### `advGetAlternativeRoutes()`
```js
const start = advGetCoords('advAltStart');
const end   = advGetCoords('advAltEnd');
```

### `advGetEcoComparison()`
```js
const start = advGetCoords('advEcoStart');
const end   = advGetCoords('advEcoEnd');
```

### `advStartRealtimeUpdates()`
```js
const start = advGetCoords('advRealtimeStart');
const end   = advGetCoords('advRealtimeEnd');
```

### `advOptimizeRoute()` — no change needed (reads textarea directly)

### `advGetDurationMatrix()` — no change needed (reads textarea directly)

---

## Summary of All Changes

| # | What | Where |
|---|---|---|
| 1 | Add `POSITION_KEY` constant | Top of `<script>` |
| 2 | Add autocomplete CSS | Before `</style>` |
| 3a–3f | Wrap all 10 coord inputs in `.adv-input-wrapper` + add dropdowns | Inside drawer HTML |
| 4 | Add `advGeocode()`, `advHandleSearch()`, `advSelectPlace()`, `advSyncCoords()`, `advGetCoords()`, `advUpdateTextareas()` | Inside `<script>` after `advGrade()` |
| 5 | Call `advSyncCoords()` at end of `setStartLocation()` and `setEndLocation()` | Inside existing functions |
| 6 | Call `advSyncCoords()` inside `openAdvancedDashboard()` | Inside existing function |
| 7 | Replace `.value` reads with `advGetCoords()` in 4 feature functions | Inside `advGetMultiModal`, `advGetAlternativeRoutes`, `advGetEcoComparison`, `advStartRealtimeUpdates` |

---

## Testing Checklist

- [ ] Set a **Start** location on the main map (search or click) → open Advanced Dashboard → all "From" fields show the city name with a green border glow
- [ ] Set an **End** location → all "To" fields auto-fill
- [ ] In any Advanced Dashboard input, type a city name (3+ chars) → dropdown appears with up to 5 suggestions
- [ ] Click a suggestion → input shows city name, coords stored silently, green border confirms sync
- [ ] Type raw coordinates like `78.4867,17.385` → no API call made, dropdown stays closed
- [ ] Click outside any dropdown → all dropdowns close cleanly
- [ ] Run **Compare Transport Modes** → works correctly with auto-filled city
- [ ] Run **Find Alternatives**, **Eco Score**, **Real-time Updates** → all work with auto-filled values
- [ ] **Waypoints textarea** updates its first entry when Start is set
- [ ] **Matrix textarea** updates its first two entries when Start + End are set
- [ ] All existing main map features (city search, vehicle selector, route cards) still work perfectly
