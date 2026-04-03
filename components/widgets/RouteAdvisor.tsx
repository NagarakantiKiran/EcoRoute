'use client';

import { useEffect, useRef, useState } from 'react';
import { RouteResult } from '@/types';

interface Props {
  routes: RouteResult[];
  origin: string;
  destination: string;
}

type AdvisorState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; advice: string; tip: string }
  | { status: 'error'; message: string };

export default function RouteAdvisor({ routes, origin, destination }: Props) {
  const [advisor, setAdvisor] = useState<AdvisorState>({ status: 'idle' });
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
        const advisorRoutes = routes.map((route) => ({
          id: route.id,
          mode: route.mode,
          strategy: route.strategy,
          distanceMeters: route.distanceMeters,
          durationSeconds: route.durationSeconds,
          co2Kg: route.co2Kg,
          ecoGrade: route.ecoGrade,
          label: route.label,
        }));

        const res = await fetch('/api/advisor', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ routes: advisorRoutes, origin, destination }),
        });

        if (requestIdRef.current !== thisRequestId) return;

        if (!res.ok) {
          const err = (await res.json()) as { error?: string };
          setAdvisor({ status: 'error', message: err.error ?? `Error ${res.status}` });
          return;
        }

        const data = (await res.json()) as { advice: string; tip: string };
        setAdvisor({ status: 'success', advice: data.advice, tip: data.tip });
      } catch (err: unknown) {
        if (requestIdRef.current !== thisRequestId) return;
        const message = err instanceof Error ? err.message : 'Network error';
        setAdvisor({ status: 'error', message });
      }
    })();
  }, [routes, origin, destination]);

  if (advisor.status === 'idle') return null;

  return (
    <div
      style={{
        marginTop: '16px',
        background: 'var(--eco-surface)',
        border: '1px solid var(--eco-border)',
        borderRadius: '14px',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          padding: '13px 16px',
          borderBottom: '1px solid var(--eco-border)',
        }}
      >
        <div
          style={{
            width: '26px',
            height: '26px',
            background: 'linear-gradient(135deg, var(--eco-green), #15803d)',
            borderRadius: '7px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '13px',
            flexShrink: 0,
          }}
        >
          🤖
        </div>
        <span
          style={{
            color: 'var(--eco-green)',
            fontWeight: 700,
            fontSize: '13px',
            flex: 1,
          }}
        >
          AI Route Advisor
        </span>
        <span
          style={{
            background: 'rgba(82, 183, 136, 0.12)',
            border: '1px solid rgba(82, 183, 136, 0.3)',
            color: 'var(--eco-green)',
            fontSize: '11px',
            fontWeight: 700,
            padding: '2px 7px',
            borderRadius: '10px',
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
          }}
        >
          Groq AI
        </span>
      </div>

      <div style={{ padding: '14px 16px 16px' }}>
        {advisor.status === 'loading' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {[90, 75, 85, 55].map((width, idx) => (
              <div
                key={width}
                style={{
                  height: '11px',
                  width: `${width}%`,
                  borderRadius: '6px',
                  background: 'linear-gradient(90deg, #1e4030 25%, #2d5a3d 50%, #1e4030 75%)',
                  backgroundSize: '200% 100%',
                  animation: `advisorShimmer 1.4s ease-in-out infinite`,
                  animationDelay: `${idx * 0.1}s`,
                }}
              />
            ))}
          </div>
        )}

        {advisor.status === 'success' && (
          <>
            <p
              style={{
                color: 'var(--eco-muted)',
                fontSize: '13px',
                lineHeight: 1.7,
                margin: 0,
              }}
            >
              {advisor.advice}
            </p>

            <div
              style={{
                marginTop: '12px',
                padding: '10px 12px',
                background: 'rgba(245, 158, 11, 0.08)',
                border: '1px solid rgba(245, 158, 11, 0.25)',
                borderRadius: '8px',
                color: '#f59e0b',
                fontSize: '12px',
                lineHeight: 1.6,
              }}
            >
              💡 {advisor.tip}
            </div>
          </>
        )}

        {advisor.status === 'error' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <p
              style={{
                color: '#f59e0b',
                fontSize: '12px',
                margin: 0,
              }}
            >
              ⚠️ Could not load advice — {advisor.message}
            </p>
            <button
              type="button"
              onClick={() => setAdvisor({ status: 'idle' })}
              style={{
                alignSelf: 'flex-start',
                background: 'transparent',
                border: '1px solid var(--eco-border)',
                color: 'var(--eco-muted)',
                fontSize: '11px',
                padding: '5px 12px',
                borderRadius: '6px',
                cursor: 'pointer',
                fontFamily: 'inherit',
              }}
            >
              ↺ Retry
            </button>
          </div>
        )}
      </div>

      <style>{`
        @keyframes advisorShimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
    </div>
  );
}
