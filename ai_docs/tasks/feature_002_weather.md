# Feature 002 — Weather Info Along the Route
*EcoRoute Feature Sprint*

**Depends on**: Feature 001 (optional — can be built independently)  
**Estimated time**: 2–3 hours  
**API**: Open-Meteo (100% free, no API key needed)  
**Touches**: `lib/weather.ts` (new), `components/widgets/WeatherWidget.tsx` (new), `components/panel/JourneyPlanner.tsx`

---

## What We're Building

A weather panel that appears in the sidebar after a route is found.
Shows current conditions at the origin AND destination — no API key needed.

```
SIDEBAR — after route cards:
┌──────────────────────────────────┐
│ 🌤 WEATHER ALONG ROUTE           │
│                                  │
│  From: Dundigal        To: Rangareddy
│  ┌────────────────┐  ┌────────────────┐
│  │ ☀️ 28°C         │  │ 🌧 24°C         │
│  │ Clear sky      │  │ Light rain     │
│  │ 💨 12 km/h Wind │  │ 💨 8 km/h Wind  │
│  │ 💧 45% Humidity │  │ 💧 78% Humidity │
│  └────────────────┘  └────────────────┘
│                                  │
│  ⚠️ Rain at destination —        │
│     consider cycling gear        │
└──────────────────────────────────┘
```

---

## Why Open-Meteo

- Completely free, no API key, no rate limit for personal use
- Returns current weather by lat/lon
- HTTPS, works from both client and server
- Docs: open-meteo.com

---

## Step 1 — Create `lib/weather.ts`

```typescript
// lib/weather.ts

export interface WeatherData {
  temperature: number;       // °C
  windspeed: number;         // km/h
  humidity: number;          // %
  weatherCode: number;       // WMO code
  description: string;       // human readable
  icon: string;              // emoji
  isRainy: boolean;
  isHot: boolean;            // > 35°C
}

// WMO Weather interpretation codes → emoji + description
const WMO_CODES: Record<number, { icon: string; description: string }> = {
  0:  { icon: '☀️',  description: 'Clear sky' },
  1:  { icon: '🌤',  description: 'Mainly clear' },
  2:  { icon: '⛅',  description: 'Partly cloudy' },
  3:  { icon: '☁️',  description: 'Overcast' },
  45: { icon: '🌫',  description: 'Foggy' },
  48: { icon: '🌫',  description: 'Icy fog' },
  51: { icon: '🌦',  description: 'Light drizzle' },
  53: { icon: '🌦',  description: 'Moderate drizzle' },
  55: { icon: '🌧',  description: 'Heavy drizzle' },
  61: { icon: '🌧',  description: 'Light rain' },
  63: { icon: '🌧',  description: 'Moderate rain' },
  65: { icon: '🌧',  description: 'Heavy rain' },
  71: { icon: '🌨',  description: 'Light snow' },
  73: { icon: '❄️',  description: 'Moderate snow' },
  75: { icon: '❄️',  description: 'Heavy snow' },
  80: { icon: '🌦',  description: 'Light showers' },
  81: { icon: '🌧',  description: 'Moderate showers' },
  82: { icon: '⛈',  description: 'Violent showers' },
  95: { icon: '⛈',  description: 'Thunderstorm' },
  99: { icon: '⛈',  description: 'Thunderstorm + hail' },
};

const RAINY_CODES = new Set([51,53,55,61,63,65,71,73,75,80,81,82,95,99]);

export async function getWeather(
  lat: number,
  lon: number
): Promise<WeatherData | null> {
  try {
    const url = new URL('https://api.open-meteo.com/v1/forecast');
    url.searchParams.set('latitude', String(lat));
    url.searchParams.set('longitude', String(lon));
    url.searchParams.set('current', 'temperature_2m,relative_humidity_2m,windspeed_10m,weathercode');
    url.searchParams.set('timezone', 'auto');

    const res = await fetch(url.toString(), { next: { revalidate: 1800 } }); // cache 30 min
    if (!res.ok) return null;

    const data = await res.json();
    const current = data.current;

    const code = current.weathercode as number;
    const wmo = WMO_CODES[code] ?? { icon: '🌡', description: 'Unknown' };

    return {
      temperature: Math.round(current.temperature_2m),
      windspeed:   Math.round(current.windspeed_10m),
      humidity:    Math.round(current.relative_humidity_2m),
      weatherCode: code,
      description: wmo.description,
      icon:        wmo.icon,
      isRainy:     RAINY_CODES.has(code),
      isHot:       current.temperature_2m > 35,
    };
  } catch (err) {
    console.error('Weather fetch failed:', err);
    return null;
  }
}

// Cycling/walking advice based on weather
export function getWeatherAdvice(
  origin: WeatherData | null,
  destination: WeatherData | null
): string | null {
  if (!origin && !destination) return null;

  const destRainy  = destination?.isRainy  ?? false;
  const originRainy = origin?.isRainy      ?? false;
  const destHot    = destination?.isHot    ?? false;
  const highWind   = (destination?.windspeed ?? 0) > 30;

  if (destRainy && originRainy) return '🌧 Rain at both ends — bring a raincoat if cycling or walking';
  if (destRainy)  return '🌧 Rain at destination — consider cycling gear or an umbrella';
  if (originRainy) return '🌧 Rain at your start — stay dry on the way out';
  if (destHot)    return '🌡 Very hot at destination — stay hydrated if walking or cycling';
  if (highWind)   return '💨 Strong winds at destination — cycling may be tougher than usual';
  return null;
}
```

---

## Step 2 — Create `components/widgets/WeatherWidget.tsx`

```typescript
'use client';

import { useEffect, useState } from 'react';
import { getWeather, getWeatherAdvice, WeatherData } from '@/lib/weather';

interface Props {
  originCoords:      [number, number] | null;  // [lon, lat]
  destinationCoords: [number, number] | null;
  originName:        string;
  destinationName:   string;
}

export default function WeatherWidget({
  originCoords,
  destinationCoords,
  originName,
  destinationName,
}: Props) {
  const [originWeather,  setOriginWeather]  = useState<WeatherData | null>(null);
  const [destWeather,    setDestWeather]    = useState<WeatherData | null>(null);
  const [loading,        setLoading]        = useState(false);

  useEffect(() => {
    if (!originCoords && !destinationCoords) return;

    setLoading(true);
    setOriginWeather(null);
    setDestWeather(null);

    const fetches: Promise<void>[] = [];

    if (originCoords) {
      // Open-Meteo uses lat, lon order
      fetches.push(
        getWeather(originCoords[1], originCoords[0])
          .then(w => setOriginWeather(w))
      );
    }

    if (destinationCoords) {
      fetches.push(
        getWeather(destinationCoords[1], destinationCoords[0])
          .then(w => setDestWeather(w))
      );
    }

    Promise.all(fetches).finally(() => setLoading(false));
  }, [
    originCoords?.[0], originCoords?.[1],
    destinationCoords?.[0], destinationCoords?.[1],
  ]);

  // Don't show if neither location set
  if (!originCoords && !destinationCoords) return null;

  const advice = getWeatherAdvice(originWeather, destWeather);

  const cardStyle = {
    background: '#1e4030',
    border: '1px solid #2d5a3d',
    borderRadius: '12px',
    padding: '14px',
    flex: 1,
    minWidth: 0,
  };

  return (
    <div style={{
      background: '#122b1c',
      border: '1px solid #2d5a3d',
      borderRadius: '16px',
      padding: '18px',
      marginTop: '16px',
    }}>
      {/* Section label */}
      <div style={{
        fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.1em',
        color: '#6b9e7a', fontWeight: 600, marginBottom: '14px',
        display: 'flex', alignItems: 'center', gap: '6px',
      }}>
        🌤 Weather Along Route
      </div>

      {loading && (
        <div style={{ color: '#6b9e7a', fontSize: '13px', textAlign: 'center', padding: '12px 0' }}>
          Loading weather...
        </div>
      )}

      {!loading && (
        <>
          <div style={{ display: 'flex', gap: '10px' }}>
            {/* Origin weather */}
            {originCoords && (
              <div style={cardStyle}>
                <div style={{ color: '#6b9e7a', fontSize: '11px', marginBottom: '8px',
                  whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  📍 {originName || 'Origin'}
                </div>
                {originWeather ? (
                  <WeatherCard weather={originWeather} />
                ) : (
                  <div style={{ color: '#6b9e7a', fontSize: '12px' }}>Unavailable</div>
                )}
              </div>
            )}

            {/* Destination weather */}
            {destinationCoords && (
              <div style={cardStyle}>
                <div style={{ color: '#6b9e7a', fontSize: '11px', marginBottom: '8px',
                  whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  🏁 {destinationName || 'Destination'}
                </div>
                {destWeather ? (
                  <WeatherCard weather={destWeather} />
                ) : (
                  <div style={{ color: '#6b9e7a', fontSize: '12px' }}>Unavailable</div>
                )}
              </div>
            )}
          </div>

          {/* Advice banner */}
          {advice && (
            <div style={{
              marginTop: '12px',
              background: 'rgba(245,158,11,0.1)',
              border: '1px solid rgba(245,158,11,0.3)',
              borderRadius: '8px',
              padding: '10px 12px',
              fontSize: '12px',
              color: '#fbbf24',
              lineHeight: 1.5,
            }}>
              {advice}
            </div>
          )}
        </>
      )}
    </div>
  );
}

// Small inner component for weather stats
function WeatherCard({ weather }: { weather: WeatherData }) {
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
        <span style={{ fontSize: '1.5em' }}>{weather.icon}</span>
        <span style={{ color: '#4ade80', fontSize: '1.3em', fontWeight: 700 }}>
          {weather.temperature}°C
        </span>
      </div>
      <div style={{ color: '#a3c4a8', fontSize: '12px', marginBottom: '6px' }}>
        {weather.description}
      </div>
      <div style={{ color: '#6b9e7a', fontSize: '11px', lineHeight: 1.8 }}>
        <div>💨 {weather.windspeed} km/h</div>
        <div>💧 {weather.humidity}%</div>
      </div>
    </div>
  );
}
```

---

## Step 3 — Add WeatherWidget to the Sidebar

In `components/panel/JourneyPlanner.tsx`, import and render the widget.

### 3a — Import at top:
```tsx
import WeatherWidget from '@/components/widgets/WeatherWidget';
```

### 3b — Render it after the journey card (before route options):

```tsx
{/* Show weather when at least one location is set */}
{(state.originCoords || state.destinationCoords) && (
  <WeatherWidget
    originCoords={state.originCoords}
    destinationCoords={state.destinationCoords}
    originName={state.origin}
    destinationName={state.destination}
  />
)}
```

Place this **after** the journey planner card div and **before** the Route Options section.

---

## Step 4 — Mobile CSS for WeatherWidget

Add inside your `@media (max-width: 768px)` block in `globals.css`:

```css
  /* Weather widget on mobile: stack cards vertically */
  .weather-widget-cards {
    flex-direction: column !important;
    gap: 10px !important;
  }
```

Also add `className="weather-widget-cards"` to the flex container holding the two weather cards in `WeatherWidget.tsx`:

```tsx
<div className="weather-widget-cards" style={{ display: 'flex', gap: '10px' }}>
```

---

## Verification Checklist

- [ ] Enter only an origin city → weather widget shows 1 card (origin only)
- [ ] Enter both origin + destination → 2 weather cards side by side
- [ ] Each card shows: emoji icon, temperature °C, description, wind speed, humidity
- [ ] Rainy weather triggers the amber advice banner
- [ ] Hot weather (>35°C) triggers advice banner
- [ ] Loading state shows "Loading weather..." briefly
- [ ] If API fails → "Unavailable" shown (no crash)
- [ ] Changing city → weather updates for new coordinates
- [ ] Mobile: cards stack vertically at 375px
- [ ] No API key required — works out of the box
- [ ] `npm run typecheck` passes 0 errors

---

## How it Updates Automatically

The `useEffect` in `WeatherWidget` watches `originCoords` and `destinationCoords`.
Whenever the user changes a location in the journey planner, new coords are set →
the effect re-fires → fresh weather is fetched. No manual refresh needed.

---

## Completion Log

- [ ] lib/weather.ts created with Open-Meteo integration
- [ ] WeatherWidget.tsx built with dual location cards
- [ ] Advice banner logic working (rainy/hot/wind)
- [ ] Widget added to JourneyPlanner.tsx
- [ ] Mobile stacking CSS added
- [ ] Tested with real locations (Hyderabad / Bangalore)
- [ ] API failure gracefully handled
- [ ] **FEATURE 002 COMPLETE ✅**
