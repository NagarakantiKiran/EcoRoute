# Feature 003 — Smart Route Advisor (Groq AI)
*EcoRoute Feature Sprint*

**Depends on**: Task 004 complete (routes render, `RouteResult[]` available in state)
**Estimated time**: 1–2 hours
**Status**: 🚀 READY TO BUILD

---

## Files Created/Modified
- `app/api/advisor/route.ts`                     ← NEW — Groq proxy (server-side, key never exposed)
- `components/widgets/RouteAdvisor.tsx`           ← NEW — Advisor panel component
- `components/panel/JourneyPlanner.tsx`           ← MODIFY — render `<RouteAdvisor>` after route cards
- `.env.local`                                    ← MODIFY — add `GROQ_API_KEY`
- `.env.example`                                  ← MODIFY — document the new key

---

## What We're Building

After routes load in the sidebar, a Groq-powered panel appears below the route
cards. It shows 2–3 sentences explaining which route is greenest and why,
using the actual CO₂ numbers in relatable terms, plus a short practical tip.

```
SIDEBAR — after route cards appear:

┌──────────────────────────────────────────┐
│  ┌────────────────────────────────────┐  │
│  │ 🚴 Cycling · 4.2 km · Grade A     │  │  ← existing route cards
│  └────────────────────────────────────┘  │
│  ┌────────────────────────────────────┐  │
│  │ 🚗 Driving · 5.1 km · Grade C     │  │
│  └────────────────────────────────────┘  │
│                                          │
│  ┌────────────────────────────────────┐  │
│  │ 🤖  AI Route Advisor    [Groq AI]  │  │  ← new
│  │                                    │  │
│  │  Shimmer skeleton while loading... │  │
│  │                                    │  │
│  │  → Advice text appears here        │  │
│  │                                    │  │
│  │  💡 Tip: one practical sentence    │  │
│  └────────────────────────────────────┘  │
└──────────────────────────────────────────┘
```

---

## Critical Rules

- `GROQ_API_KEY` is server-side only — never `NEXT_PUBLIC_` prefix (same rule as `ORS_API_KEY`)
- Client calls `/api/advisor` — never `api.groq.com` directly
- No red colors — use `#f59e0b` amber for tip, `var(--eco-green)` for header
- Minimum font size: 11px
- `npm run typecheck` must pass 0 errors before commit
- Skeleton must show instantly (no layout shift when advice loads)

---

## Step 1 — Environment

### 1a — `.env.local`

Add this line alongside `ORS_API_KEY`:

```bash
# Groq API — Smart Route Advisor
# Get your key at: https://console.groq.com → API Keys
# Server-side only. Never add NEXT_PUBLIC_ prefix.
GROQ_API_KEY=gsk_your_key_here
```

### 1b — `.env.example`

Add the same entry (without the real key) so future contributors know it exists:

```bash
# Groq API — Smart Route Advisor (server-side only)
GROQ_API_KEY=your_groq_key_here
```

### 1c — `CLAUDE.md`

Add one line to the **Key files** section:

```markdown
- app/api/advisor/route.ts  → Groq proxy (server-side, GROQ_API_KEY lives here ONLY)
```

And one line to **Critical rules**:

```markdown
- GROQ_API_KEY stays server-side ONLY — never add NEXT_PUBLIC_ prefix
```

---

## Step 2 — Create `app/api/advisor/route.ts`

This is a new Next.js API route. It receives the route summary from the client,
calls Groq server-side (key never leaves the server), and returns `{ advice, tip }`.

```typescript
// app/api/advisor/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { RouteResult } from '@/types';

const GROQ_API_KEY = process.env.GROQ_API_KEY ?? '';
const GROQ_MODEL   = 'llama-3.3-70b-versatile';
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

interface AdvisorRequest {
  routes:      RouteResult[];
  origin:      string;
  destination: string;
}

interface AdvisorResponse {
  advice: string;
  tip:    string;
}

export async function POST(req: NextRequest) {
  if (!GROQ_API_KEY) {
    return NextResponse.json(
      { error: 'GROQ_API_KEY not configured' },
      { status: 500 }
    );
  }

  let body: AdvisorRequest;
  try {
    body = await req.json() as AdvisorRequest;
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const { routes, origin, destination } = body;

  if (!routes?.length) {
    return NextResponse.json({ error: 'No routes provided' }, { status: 400 });
  }

  // Build a compact, human-readable route summary for the prompt
  const routeSummary = routes
    .map(r => {
      const distKm  = (r.distanceMeters / 1000).toFixed(2);
      const durMin  = (r.durationSeconds / 60).toFixed(0);
      return `${r.mode}: ${distKm} km, ${durMin} min, ${r.co2Kg} kg CO₂, Grade ${r.ecoGrade}`;
    })
    .join('\n');

  const prompt = `You are a friendly eco-travel advisor for EcoRoute, a green navigation app.

The user is travelling from "${origin}" to "${destination}".

Here are the calculated route options:
${routeSummary}

Write a response in exactly this JSON format:
{
  "advice": "2-3 sentences. Explain which route is greenest and why, using the actual numbers. Express the CO₂ difference in a relatable way (e.g. equivalent to charging a phone 40 times, or 3% of a daily footprint). Keep it warm and encouraging.",
  "tip": "One short practical tip starting with an action verb. Maximum 20 words. Make it specific to this journey — the distance, mode, or conditions."
}

Return only valid JSON. No markdown fences, no backticks, no extra text outside the JSON object.`;

  try {
    const groqRes = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type':  'application/json',
        'Authorization': `Bearer ${GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model:       GROQ_MODEL,
        messages:    [{ role: 'user', content: prompt }],
        max_tokens:  220,
        temperature: 0.6,
      }),
    });

    if (!groqRes.ok) {
      const errText = await groqRes.text();
      console.error('Groq API error:', groqRes.status, errText);
      return NextResponse.json(
        { error: `Groq responded with ${groqRes.status}` },
        { status: 502 }
      );
    }

    const groqData = await groqRes.json() as {
      choices: Array<{ message: { content: string } }>;
    };

    const content = groqData.choices?.[0]?.message?.content?.trim() ?? '';
    if (!content) {
      return NextResponse.json({ error: 'Empty response from Groq' }, { status: 502 });
    }

    // Strip any accidental markdown fences before parsing
    const clean = content.replace(/```json|```/g, '').trim();

    let parsed: AdvisorResponse;
    try {
      parsed = JSON.parse(clean) as AdvisorResponse;
    } catch {
      console.error('Failed to parse Groq JSON:', clean);
      return NextResponse.json({ error: 'Groq returned malformed JSON' }, { status: 502 });
    }

    if (!parsed.advice || !parsed.tip) {
      return NextResponse.json({ error: 'Incomplete response from Groq' }, { status: 502 });
    }

    return NextResponse.json(parsed);

  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('Advisor proxy error:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
```

---

## Step 3 — Create `components/widgets/RouteAdvisor.tsx`

A self-contained client component. It watches for `routes` to arrive,
fires the proxy call, and manages its own loading/advice/error states.

```typescript
// components/widgets/RouteAdvisor.tsx
'use client';

import { useEffect, useRef, useState } from 'react';
import { RouteResult } from '@/types';

interface Props {
  routes:      RouteResult[];
  origin:      string;
  destination: string;
}

type AdvisorState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; advice: string; tip: string }
  | { status: 'error';   message: string };

export default function RouteAdvisor({ routes, origin, destination }: Props) {
  const [advisor, setAdvisor] = useState<AdvisorState>({ status: 'idle' });

  // Track the last request so stale responses from slow fetches are discarded
  const requestIdRef = useRef(0);

  useEffect(() => {
    if (!routes.length || !origin || !destination) {
      setAdvisor({ status: 'idle' });
      return;
    }

    const thisRequestId = ++requestIdRef.current;
    setAdvisor({ status: 'loading' });

    (async () => {
      try {
        const res = await fetch('/api/advisor', {
          method:  'POST',
          headers: { 'Content-Type': 'application/json' },
          body:    JSON.stringify({ routes, origin, destination }),
        });

        // Discard if a newer request has already started
        if (requestIdRef.current !== thisRequestId) return;

        if (!res.ok) {
          const err = await res.json() as { error?: string };
          setAdvisor({ status: 'error', message: err.error ?? `Error ${res.status}` });
          return;
        }

        const data = await res.json() as { advice: string; tip: string };
        setAdvisor({ status: 'success', advice: data.advice, tip: data.tip });

      } catch (err: unknown) {
        if (requestIdRef.current !== thisRequestId) return;
        const message = err instanceof Error ? err.message : 'Network error';
        setAdvisor({ status: 'error', message });
      }
    })();
  }, [routes, origin, destination]);

  // Don't render anything until routes exist
  if (advisor.status === 'idle') return null;

  return (
    <div style={{
      marginTop: '16px',
      background: 'var(--eco-surface)',
      border: '1px solid var(--eco-border)',
      borderRadius: '14px',
      overflow: 'hidden',
    }}>
      {/* Header */}
      <div style={{
        display:        'flex',
        alignItems:     'center',
        gap:            '10px',
        padding:        '13px 16px',
        borderBottom:   '1px solid var(--eco-border)',
      }}>
        <div style={{
          width:          '26px',
          height:         '26px',
          background:     'linear-gradient(135deg, var(--eco-green), #15803d)',
          borderRadius:   '7px',
          display:        'flex',
          alignItems:     'center',
          justifyContent: 'center',
          fontSize:       '13px',
          flexShrink:     0,
        }}>
          🤖
        </div>
        <span style={{
          color:      'var(--eco-green)',
          fontWeight: 700,
          fontSize:   '13px',
          flex:       1,
        }}>
          AI Route Advisor
        </span>
        <span style={{
          background:   'rgba(82,183,136,0.12)',
          border:       '1px solid rgba(82,183,136,0.3)',
          color:        'var(--eco-green)',
          fontSize:     '10px',
          fontWeight:   700,
          padding:      '2px 7px',
          borderRadius: '10px',
          letterSpacing: '0.04em',
          textTransform: 'uppercase' as const,
        }}>
          Groq AI
        </span>
      </div>

      {/* Body */}
      <div style={{ padding: '14px 16px 16px' }}>

        {/* Loading — shimmer skeleton */}
        {advisor.status === 'loading' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {[90, 75, 85, 55].map((w, i) => (
              <div
                key={i}
                style={{
                  height:           '11px',
                  width:            `${w}%`,
                  borderRadius:     '6px',
                  background:       'var(--eco-border)',
                  animation:        'advisorShimmer 1.4s ease-in-out infinite',
                  animationDelay:   `${i * 0.1}s`,
                }}
              />
            ))}
          </div>
        )}

        {/* Success */}
        {advisor.status === 'success' && (
          <>
            <p style={{
              color:      'var(--eco-text-muted)',
              fontSize:   '13px',
              lineHeight: 1.7,
              margin:     0,
            }}>
              {advisor.advice}
            </p>

            <div style={{
              marginTop:    '12px',
              padding:      '10px 12px',
              background:   'rgba(245,158,11,0.08)',
              border:       '1px solid rgba(245,158,11,0.25)',
              borderRadius: '8px',
              color:        '#f59e0b',
              fontSize:     '12px',
              lineHeight:   1.6,
            }}>
              💡 {advisor.tip}
            </div>
          </>
        )}

        {/* Error */}
        {advisor.status === 'error' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <p style={{
              color:    '#f59e0b',
              fontSize: '12px',
              margin:   0,
            }}>
              ⚠️ Could not load advice — {advisor.message}
            </p>
            <button
              onClick={() => setAdvisor({ status: 'idle' })}
              style={{
                alignSelf:    'flex-start',
                background:   'transparent',
                border:       '1px solid var(--eco-border)',
                color:        'var(--eco-text-muted)',
                fontSize:     '11px',
                padding:      '5px 12px',
                borderRadius: '6px',
                cursor:       'pointer',
                fontFamily:   'inherit',
              }}
            >
              ↺ Retry
            </button>
          </div>
        )}
      </div>

      {/* Shimmer keyframes — injected once via a style tag */}
      <style>{`
        @keyframes advisorShimmer {
          0%, 100% { opacity: 0.4; }
          50%       { opacity: 0.9; }
        }
      `}</style>
    </div>
  );
}
```

---

## Step 4 — Wire into `components/panel/JourneyPlanner.tsx`

### 4a — Import at the top

```typescript
import RouteAdvisor from '@/components/widgets/RouteAdvisor';
```

### 4b — Render after route cards

Find the section where `<RouteOptions>` (or `<RouteCard>` list) is rendered.
Add `<RouteAdvisor>` directly after it, passing values already available
in the component's state:

```tsx
{/* Existing route cards */}
<RouteOptions
  routes={state.routes}
  selectedMode={state.selectedMode}
  onSelectMode={handleSelectMode}
  isLoading={state.isLoading}
/>

{/* AI Route Advisor — appears once routes are loaded */}
<RouteAdvisor
  routes={state.routes}
  origin={state.origin}
  destination={state.destination}
/>
```

All three props (`routes`, `origin`, `destination`) are already in `JourneyState`
— no new state, no new hooks, no prop drilling required.

---

## How It Works

```
User clicks "Find Eco Routes"
        ↓
useRoutes() fetches routes → state.routes populated   (existing)
        ↓
<RouteAdvisor> useEffect fires (routes.length > 0)    (new)
        ↓
POST /api/advisor  { routes, origin, destination }    (client → own server)
        ↓
app/api/advisor/route.ts reads GROQ_API_KEY           (server-side only)
        ↓
POST api.groq.com/openai/v1/chat/completions          (server → Groq)
        ↓
Response: { advice: "...", tip: "..." }
        ↓
Client renders advice text + amber tip pill
        ↓
If any step fails → amber error message + Retry button
```

---

## Prompt Design Notes

| Decision | Reason |
|---|---|
| JSON output format | Splits advice and tip cleanly without string parsing |
| `temperature: 0.6` | Natural language tone without hallucinating facts |
| `max_tokens: 220` | Enough for 3 sentences + tip, prevents rambling |
| Relatable CO₂ comparisons | "40 phone charges" lands better than raw kg figures |
| Tip capped at 20 words | Forces specificity — vague tips are useless |
| `llama-3.3-70b-versatile` | Best quality on Groq free tier, fast enough for UX |

---

## Implementation Details

### `app/api/advisor/route.ts`
- Reads `GROQ_API_KEY` from `process.env` — never exposed to client
- Validates request body before calling Groq (400 if malformed)
- Strips markdown fences from Groq response before JSON parse
- Validates parsed response has both `advice` and `tip` fields
- Returns 502 with a clear `error` string on any Groq failure
- Uses `err: unknown` with type guard — no `any` types

### `components/widgets/RouteAdvisor.tsx`
- `requestIdRef` prevents stale responses overwriting newer ones
  (if the user changes location mid-flight, old response is discarded)
- Shimmer uses CSS animation on plain `<div>` elements — no library needed
- Retry button resets state to `idle`, which re-triggers the `useEffect`
- `@keyframes` injected via `<style>` tag inside the component —
  avoids adding to `globals.css` for a self-contained widget
- All colors use existing CSS variables (`--eco-surface`, `--eco-border`,
  `--eco-green`, `--eco-text-muted`) — no new color values introduced

---

## Critical Rules

- `GROQ_API_KEY` in `.env.local` only — same rule as `ORS_API_KEY`
- Client component calls `/api/advisor` — never `api.groq.com` directly
- No `any` types — use `unknown` with `instanceof Error` guards
- `npm run typecheck` must pass 0 errors after each file is added
- No red colors — amber `#f59e0b` for warnings/errors, green for success states
- Minimum font size: 11px — all text in `RouteAdvisor` uses 11px, 12px, or 13px

---

## Verification Checklist

- [ ] `GROQ_API_KEY` added to `.env.local` (not `NEXT_PUBLIC_GROQ_API_KEY`)
- [ ] `.env.example` updated with the new key name and a comment
- [ ] `CLAUDE.md` updated — key file entry + critical rule added
- [ ] `app/api/advisor/route.ts` created — builds without errors
- [ ] `components/widgets/RouteAdvisor.tsx` created — builds without errors
- [ ] `RouteAdvisor` imported and rendered in `JourneyPlanner.tsx`
- [ ] `npm run typecheck` — 0 errors
- [ ] Shimmer skeleton appears immediately when routes load
- [ ] Advice text and amber tip appear after ~0.5–1s
- [ ] Panel is completely absent when no routes are loaded
- [ ] Panel disappears and resets when origin/destination is cleared
- [ ] If `GROQ_API_KEY` is blank → amber error + Retry button shown
- [ ] Retry button correctly re-triggers the fetch
- [ ] Changing origin/destination while advisor is loading → stale
      response is discarded, new request fires correctly
- [ ] DevTools → Network → `/api/advisor` — confirm request goes to
      own server, NOT directly to `api.groq.com`
- [ ] All existing features (route cards, Start button, Carbon Saved
      widget, dashboard link) unaffected

---

## Common Issues & Fixes

**`GROQ_API_KEY` is undefined at runtime**
- Check `.env.local` exists and the key name has no typo
- Restart `npm run dev` after editing `.env.local` — Next.js does not
  hot-reload environment variables

**Groq returns 401 Unauthorized**
- Key is invalid or expired — regenerate at console.groq.com

**Groq returns valid JSON but advice is missing**
- The model ignored the JSON format instruction — rare with `temperature: 0.6`
- The proxy returns a 502 with `error: 'Incomplete response from Groq'`
- Retry usually resolves it; if persistent, lower temperature to 0.4

**Panel flickers on re-render**
- Caused by parent re-rendering with a new `routes` array reference
  on each render even when values haven't changed
- Fix: memoize routes in `useRoutes.ts` with `useMemo`, or wrap
  `RouteAdvisor` in `React.memo`

**TypeScript error: `RouteResult` not found**
- Confirm `import { RouteResult } from '@/types'` is at the top of
  both new files — the type is already defined in `types/index.ts`

---

## Completion Log

- [ ] `.env.local` — `GROQ_API_KEY` added
- [ ] `.env.example` — key documented
- [ ] `CLAUDE.md` — key file + rule updated
- [ ] `app/api/advisor/route.ts` — proxy created
- [ ] `components/widgets/RouteAdvisor.tsx` — component created
- [ ] `JourneyPlanner.tsx` — `<RouteAdvisor>` wired in
- [ ] `npm run typecheck` — 0 errors
- [ ] Tested with 3+ different city pairs
- [ ] Tested error scenario (blank key → error + retry works)
- [ ] Tested stale request scenario (rapid location changes)
- [ ] **FEATURE 003 COMPLETE ✅ — Ready for Feature 004**
