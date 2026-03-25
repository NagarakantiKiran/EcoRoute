# EcoRoute — Master Idea Document

## Product Vision

EcoRoute is an **eco-friendly route finder for conscious commuters**. Not just another maps app. Not a carbon accounting tool for corporations. A product that replaces the guilt of defaulting to the car with one clear, rewarding answer: *"Here's how to get there greener — and here's exactly how much CO₂ you're saving."*

> "Instead of opening Google Maps and just picking the fastest route — open this, see the greenest option, understand your impact in 10 seconds."

---

## The Problem

Every urban commuter with a smartphone:
- Opens Google Maps and gets fastest/cheapest routes — never the *greenest*
- Has no easy way to compare the carbon cost of driving vs walking vs cycling
- Makes car trips out of habit, not because it's genuinely the only option
- Has no running sense of their personal carbon footprint from travel
- Feels vaguely guilty about the environment but has no simple tool to act on it

Nobody solves this well at the individual commuter level. Carbon tools are either corporate-scale (too complex) or generic trackers (no routing). No app puts the green choice right in front of you at the moment of decision.

---

## Primary User (V1)

**Urban commuters and eco-conscious general public, English-speaking, 18–35**

Three types:
1. **Daily commuters** — make the same trips repeatedly, open to habit change if the friction is low
2. **Eco-conscious urbanites** — already care about climate, want a tool that matches their values
3. **Curious experimenters** — not hardcore green, but would walk or cycle *if* they knew it was practical and could see the impact

What they share: they want to make greener choices without it feeling like a sacrifice or a research project.

**Excluded from V1**: Fleet managers, logistics companies, corporate sustainability teams (V2/V3 opportunity)

---

## Product Name

**EcoRoute**
- Eco = Environmental consciousness (universally understood)
- Route = Navigation, path, journey
- Meaning: The green path forward

**Tagline**: "Every trip. Lighter footprint."

---

## What EcoRoute Does (V1)

1. **Finds routes** using OpenStreetMap / OpenRouteService (free, open infrastructure)
2. **Compares modes** — walking, cycling, and car (with EV preference when car is chosen)
3. **Shows CO₂ saved** — clear comparison vs baseline car route ("You saved 1.2 kg CO₂")
4. **Scores each route** — Eco Grade (A, B, C, D) so users can make fast decisions
5. **Tracks personal carbon footprint** — running dashboard of savings over time
6. **Works on both mobile and web** — no install barrier for new users

---

## What EcoRoute Does NOT Do (V1)

- No public transit routing (bus/metro data varies too much by city — V2)
- No social features / leaderboards (V2)
- No streak/badge gamification (V2)
- No user accounts / authentication (V1 uses local storage)
- No offline maps
- No ride-hailing integration (Ola, Uber)
- No corporate/fleet dashboard
- No regional language support
- No push notifications

---

## Core Feature Breakdown

### 1. Route Finder
- Enter origin + destination
- App returns 3 route options: Walk / Cycle / Drive (+ EV variant if driving)
- Each option shows: distance, time, and **Eco Grade (A–D)**
- Default suggested route = lowest carbon option that is practical (under 45 min)

### 2. CO₂ Comparison Panel
Every route shows:
```
🚗 Car       →  2.1 kg CO₂   [D]
🚲 Cycling   →  0.0 kg CO₂   [A]  ← Recommended
🚶 Walking   →  0.0 kg CO₂   [A]
```
- Baseline = average petrol car (120g CO₂/km — standard IPCC figure)
- EV = 40g CO₂/km (average grid mix)
- Walk/Cycle = 0g CO₂ (human-powered)

### 3. Eco Score / Grade per Route
Letter grade based on CO₂ per km:
```
A  →  0–20g CO₂/km    (walk, cycle, EV short trip)
B  →  20–60g CO₂/km   (EV, shared transport)
C  →  60–120g CO₂/km  (average car)
D  →  120g+ CO₂/km    (SUV, long drive, heavy traffic)
```

### 4. Personal Carbon Footprint Dashboard
- Total CO₂ saved this week / month / all time
- Number of trips taken by mode
- Equivalent impact ("You've saved the equivalent of 3 trees worth of CO₂ this month")
- Simple chart — no complexity
- Stored in browser local storage for V1 (no account needed)

---

## How It Grows

```
V1 (build now):
  OpenStreetMap routing + CO₂ comparison
  Eco grade per route
  Personal carbon footprint dashboard
  Mobile-first web app

V2 (after first users):
  Public transit routing (GTFS data for major cities)
  User accounts + cloud sync of footprint history
  Streak / badge gamification
  Social sharing ("I saved X kg CO₂ this week")
  Leaderboard with friends

V3 (after product-market fit):
  Corporate/fleet dashboard (B2B)
  Carbon offset purchasing integration
  City-specific data (local grid mix, local transit emissions)
  API for third-party integration

North star (someday):
  Real-time traffic + emissions overlay
  Integration with EV charging networks
  Municipal government partnerships
```

---

## Distribution Strategy

**Primary**: Organic search + word of mouth
- Target: "eco friendly route planner", "carbon footprint commute calculator"
- SEO content: "How much CO₂ does your commute produce?"
- No paid ads in V1

**Secondary**: Eco/climate communities
- Reddit: r/zerowaste, r/cycling, r/fuckcars, r/climatechange
- Twitter/X climate community
- Cycling and sustainability newsletters

**Viral mechanic**: Shareable impact card
- "I saved 4.2 kg CO₂ this week with EcoRoute 🌱"
- One-tap image share to Instagram, WhatsApp, Twitter

**Not**: Paid ads (no budget), B2B sales (V3 only)

---

## Business Model

**V1**: Free, no monetisation
- Build user base and validate the core loop first

**After product-market fit**: Freemium
- Free: route finder + CO₂ comparison + basic dashboard
- Paid (₹199–499/month or $3–5/month): Advanced dashboard, historical data, carbon offset purchasing, ad-free

**V2 paying users**: Eco-conscious professionals, cyclists, environmental researchers
**V3 revenue**: Corporate sustainability packages (fleet CO₂ tracking)

**V1**: Free only. No paid features in V1.

---

## Technical Approach

### Routing Engine
- **OpenRouteService API** (free tier: 2,000 requests/day)
- **OpenStreetMap** data via Nominatim for geocoding
- Fallback: OSRM self-hosted if API limits are hit at scale

### CO₂ Calculation
- Standard emission factors (IPCC / Our World in Data):
  - Petrol car: 120g CO₂/km
  - Electric car: 40g CO₂/km (average grid)
  - Bus: 89g CO₂/km per passenger
  - Cycling: 0g CO₂/km
  - Walking: 0g CO₂/km
- Formula: `distance_km × emission_factor = CO₂_grams`

### Frontend Stack
- React / Next.js (web-first, mobile-responsive)
- MapLibre GL JS + OpenFreeMap tiles (free map rendering)
- Local storage for V1 footprint data (no backend needed for MVP)

### Backend (minimal for V1)
- Vercel serverless functions for API proxying
- No database required in V1 (local storage)
- No auth required in V1

---

## Success Metrics (V1)

- 1,000 monthly active users within 3 months of launch
- 500+ routes searched per week
- Average session time > 2 minutes
- 200+ footprint dashboard views per week (measures retention beyond single search)
- 50+ social shares per week of impact cards

---

## Design Principles

1. **Green is not guilt** — celebrate the win, don't shame the car choice
2. **Instant clarity** — CO₂ comparison visible without any taps or scrolls
3. **No account friction** — works immediately, no sign-up required in V1
4. **Mobile-first** — most route searches happen on phones, on the go
5. **One clear recommendation** — highlight the best eco option, don't overwhelm
6. **Data you can trust** — cite emission factors clearly, no greenwashing

---

## What Makes EcoRoute Different

| Feature | Google Maps | Citymapper | EcoRoute |
|---|---|---|---|
| Route finder | ✅ | ✅ | ✅ |
| CO₂ comparison | ❌ | Partial | ✅ |
| Eco grade per route | ❌ | ❌ | ✅ |
| Personal footprint dashboard | ❌ | ❌ | ✅ |
| Recommends greenest option | ❌ | ❌ | ✅ |
| Free & open source | ❌ | ❌ | ✅ |

The gap is real. Nobody puts the eco choice front and center at the moment of navigation.
