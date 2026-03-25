# EcoRoute — UI Design & Brand

## Brand Identity

### Name & Tagline
- **Product name**: EcoRoute
- **Wordmark style**: Mixed weight — "eco" in light/regular weight, "route" in bold
- **Tagline**: "Every trip. Lighter footprint."
- **Logo mark**: Leaf icon with a circular arrow/route symbol inside — green on dark

### Logo Mark
- **Concept**: Circular leaf with route arrow — nature + navigation combined
- **Shape**: Rounded square container (app icon style), dark green background, bright green leaf icon
- **NOT**: Globe icons, carbon molecules, generic map pins

### Color Palette

#### Primary Colors
- **Forest Green (background)**: `#0d1f12` — deep, near-black green base
- **Surface Green (cards)**: `#1a2e1d` — slightly lighter for card backgrounds
- **Input Surface**: `#162219` — for search inputs and interactive fields
- **Accent Green (active/CTA)**: `#4caf6e` or `#52b788` — bright leaf green
- **Eco route line**: `#3ddc84` or `#52b788` — bright green on map

#### Secondary Colors
- **Amber/Saffron (fastest route, warnings)**: `#f4a261` or `#ffb347` — warm orange for contrast
- **Muted Orange (transit CO₂)**: `#e07c3a` — for transit route accents
- **White (primary text)**: `#f0f4f0` — slightly warm white
- **Muted text**: `#7a9e7e` — secondary labels, metadata

#### Status Colors
- **CO₂ Low (green routes)**: `#52b788` — good, eco-friendly
- **CO₂ Medium (transit)**: `#f4a261` — amber, moderate
- **CO₂ High (car routes)**: `#e07c3a` — orange-red, high emission

#### Why these colors
- Deep forest green background = calm, natural, premium — the opposite of anxiety-red navigation apps
- Amber accent = warmth, energy, draws eye to key data like CO₂ numbers without alarm
- No red — red implies danger/error; emissions data should inform, not panic
- Dark AMOLED-friendly background = battery saving on Android mid-range devices

---

## Layout Philosophy

### Split-Panel Design (Desktop/Tablet)
```
┌─────────────────────┬────────────────────────────┐
│   Left Panel        │   Map Panel                │
│   (40% width)       │   (60% width)              │
│                     │                            │
│  - Logo + wordmark  │  - Dark green map tiles    │
│  - Journey planner  │  - Route lines overlay     │
│  - Route options    │  - Origin/dest markers     │
│  - Start CTA        │  - Carbon saved widget     │
│                     │                            │
└─────────────────────┴────────────────────────────┘
```

### Mobile Layout (Stacked)
- Map full screen behind everything
- Journey planner panel slides up from bottom (bottom sheet)
- Route cards stack vertically
- Map controls (zoom +/−, locate) pinned top-right
- "Carbon saved today" chip pinned bottom-right of map

---

## Header

```
[🌿 Logo icon 40px]  ecoroute
```

- Logo: rounded square, dark green bg, bright green leaf-route icon
- Wordmark: "eco" in regular weight, "route" in bold — same font, different weight
- Color: white wordmark
- No search bar in header — journey input is in the main panel card

---

## Journey Planner Card

### Container
- Background: `#1a2e1d` (surface green)
- Border radius: 16px
- Padding: 20px
- Small label: `PLAN YOUR JOURNEY` — uppercase, 10px, muted green tracking

### Origin Field
```
● Banjara Hills, Hyderabad
```
- Green filled circle dot `●` as origin marker
- Text: white, 15px
- Input background: `#162219`
- Border radius: 10px

### Destination Field
```
● Hitech City
```
- Orange/amber filled circle dot as destination marker (contrast against origin)
- Same field styling as origin

### Eco Mode Badge
```
✓ Eco mode active
```
- Pill/chip shape
- Border: 1px solid accent green
- Background: transparent or very subtle green tint
- Icon: green checkmark circle
- Text: accent green, 12px
- This is a toggle — when active shows this badge, when off shows "Eco mode off"

---

## Route Options Section

### Section Label
`ROUTE OPTIONS` — uppercase, 10px, muted green, letter-spaced

### Route Card — Greenest Path (ACTIVE/SELECTED STATE)

```
┌─────────────────────────────────────────────┐
│  ⏱ Greenest path                    24 min  │
│  ████████████░░░░░░░  ← green progress bar  │
│  12.4 km · Via PVNR Exp        0.8 kg CO₂   │
└─────────────────────────────────────────────┘
```

- **Background**: Slightly brighter green than base (`#1e3524`) + green border `1px`
- **Icon**: Clock/leaf icon, accent green
- **Title**: "Greenest path", white, 14px bold
- **Time**: Large, white, `24` in ~22px bold + `min` in 14px
- **Progress bar**: Full-width, bright green (`#52b788`), ~4px height, rounded
- **Metadata row**: Distance + via info (muted, 11px) | CO₂ in green (12px)
- **CO₂ color**: Green (low = good)

### Route Card — Fastest Route (SECONDARY STATE)

```
┌─────────────────────────────────────────────┐
│  ← Fastest route                    18 min  │
│  ████░░░░░░░░░░░░░░░  ← amber progress bar  │
│  10.1 km · Via ORR             2.1 kg CO₂   │
└─────────────────────────────────────────────┘
```

- **Background**: Dark surface (`#162219`), no active border
- **Icon**: Arrow left (route icon), amber
- **Title**: "Fastest route", white, 14px
- **Progress bar**: Amber/orange (`#f4a261`)
- **CO₂**: Amber/orange — signals higher emissions
- **Design intent**: Visually less prominent than greenest — user eye goes to green first

### Route Card — Via Transit

```
┌─────────────────────────────────────────────┐
│  🚌 Via transit                     31 min  │
│  ██░░░░░░░░░░░░░░░░░  ← short amber bar     │
│  Metro + Walk · 2 changes      0.3 kg CO₂   │
└─────────────────────────────────────────────┘
```

- **Background**: Dark surface, no active border
- **Icon**: Bus/transit icon, muted orange
- **Progress bar**: Short amber bar (longer time = shorter bar relative to others)
- **Metadata**: "Metro + Walk · 2 changes" — shows transfer complexity
- **CO₂**: Amber (moderate emission)

### Progress Bar Logic
The progress bar is NOT literal distance — it represents **relative eco score**:
- Greenest path → full green bar (best)
- Transit → medium amber bar (medium)
- Fastest (car) → short amber bar with orange tint (worst eco)
This gives instant visual hierarchy: green = good, less bar + amber = worse.

---

## Primary CTA Button

```
[ Start greenest route ↗ ]
```

- Full width
- Background: white
- Text: black, bold, 15px
- Icon: diagonal arrow (↗) indicating start/launch
- Border radius: 12px
- Height: 52px (touch-friendly)
- Margin: 16px from last route card
- **Only one CTA** — always starts the recommended (greenest) route
- If user selects a different card, button updates: "Start fastest route ↗"

---

## Map Panel

### Basemap
- Dark green tile theme — custom styled OpenFreeMap or Mapbox dark style, recolored green
- Grid lines: very subtle, semi-transparent green lines (`rgba(82,183,136,0.1)`)
- Labels: muted, minimal — roads only, no POI clutter

### Route Lines on Map
```
Greenest path  → bright green (#3ddc84), 4px, solid
Fastest route  → amber (#f4a261), 3px, slightly transparent
Transit        → muted orange, 2px, dashed
```
- All routes shown simultaneously so user can see paths spatially
- Selected route line is brighter/thicker

### Origin Marker
- White circle with green border
- "Banjara Hills" label in white pill badge

### Destination Marker
- Orange/amber circle marker
- "Hitech City" label in white pill badge
- Small upward arrow above marker

### Waypoint Dots
- Semi-transparent green circles at route bends
- Subtle, not distracting

### Map Controls (top-right, stacked)
```
[+]   zoom in
[−]   zoom out
[◎]   locate me
```
- Dark surface squares, rounded corners
- Accent green icons
- 40px touch targets

---

## Carbon Saved Today Widget (Map Overlay)

Positioned: **bottom-right corner of map panel**

```
┌──────────────────────────┐
│  CARBON SAVED TODAY      │
│                          │
│  1.3 kg CO₂              │
│  vs. typical car route   │
│  = 5 km of forest absorbed│
└──────────────────────────┘
```

- Background: `#1a2e1d` with subtle border
- Border radius: 12px
- Label: `CARBON SAVED TODAY` — 10px, muted, uppercase
- Number: `1.3` in 32px bold white + `kg CO₂` in 14px muted
- Comparison line: "vs. typical car route" — 11px muted
- Equivalent: "= 5 km of forest absorbed" — 11px, accent green italic
- This is the emotional hook — makes CO₂ numbers tangible

---

## Design Principles

1. **Green is a reward, not a lecture** — the UI celebrates green choices without shaming alternatives
2. **Dark forest palette** — calm, premium, works on AMOLED, battery-friendly on mid-range Android
3. **CO₂ is always visible** — emissions data on every route card, never buried
4. **One clear winner** — Greenest path is visually brightest and pre-selected
5. **Amber = information, not alarm** — orange tones signal "higher impact" neutrally
6. **Minimal chrome** — map takes 60% of screen, UI is a panel over it, not competing with it
7. **Touch targets ≥ 44px** — all interactive elements are finger-friendly
8. **No red anywhere** — red implies error/danger; we never want the user to feel bad about their route choice

---

## Typography

- **Font family**: Inter or system-ui (clean, modern, high legibility on screens)
- **Wordmark "ecoroute"**: Custom weight mix — light + bold
- **Section labels**: 10px, uppercase, 0.12em letter-spacing, muted green
- **Route titles**: 14px, medium weight, white
- **Time (large)**: 20–24px, bold, white — most prominent number
- **Metadata**: 11–12px, regular, muted green (`#7a9e7e`)
- **CO₂ values**: 12–14px, colored by emission level (green/amber/orange)
- **CTA button**: 15px, bold, black on white

---

## Mobile Specifications

- **Target devices**: Mid-range Android (Redmi, Realme, Samsung M-series), iPhone SE and up
- **Minimum font size**: 11px
- **Touch targets**: 44px minimum
- **Bottom sheet**: Journey planner as a bottom sheet over the map on mobile
- **Map**: Full screen behind the sheet, visible when sheet is collapsed
- **Performance target**: First meaningful paint < 2 seconds on 4G
- **No heavy map layers on first load** — map tiles load progressively

---

## Screen States

### Empty State (No Route Yet)
- Left panel: only the journey planner card + "Enter destination to see routes"
- Map: shows user's current city centered, zoom 12
- Route options section: hidden
- CTA button: hidden

### Route Loaded State
- Left panel: journey planner + 3 route cards + CTA button
- Map: all 3 routes drawn, greenest highlighted
- Carbon saved widget: visible bottom-right

### Navigation Active State (V2)
- Left panel: collapses to thin strip showing next turn + distance
- Map: full screen, route highlighted, real-time position dot
- Carbon saved: updates in real time

---

## What The UI Is NOT

```
NOT a red/orange warning dashboard
NOT a data-heavy analytics screen
NOT a cluttered POI map
NOT white/light theme (dark is intentional)
NOT a gamification screen full of badges
NOT a social feed
```

The UI is calm, confident, and clear.
One question answered: "What's the greenest way to get there?"
