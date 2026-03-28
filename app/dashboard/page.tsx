'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { FootprintSummary } from '@/types';
import { getFootprint } from '@/lib/storage';
import FootprintChart from '@/components/dashboard/FootprintChart';
import TripHistory from '@/components/dashboard/TripHistory';

function StatCard({ label, value, unit, icon }: { label: string; value: string; unit: string; icon: string }) {
  return (
    <div
      style={{
        background: '#1a3a2a',
        border: '1px solid #2d5a3d',
        borderRadius: '16px',
        padding: '20px',
        textAlign: 'center',
        flex: 1,
      }}
    >
      <div style={{ fontSize: '1.8em', marginBottom: '8px' }}>{icon}</div>
      <div style={{ color: '#4ade80', fontSize: '1.8em', fontWeight: 800, lineHeight: 1 }}>
        {value}
      </div>
      <div
        style={{
          color: '#6b9e7a',
          fontSize: '11px',
          marginTop: '4px',
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
        }}
      >
        {unit}
      </div>
      <div style={{ color: '#a3c4a8', fontSize: '12px', marginTop: '6px' }}>{label}</div>
    </div>
  );
}

export default function DashboardPage() {
  const [footprint, setFootprint] = useState<FootprintSummary | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const loadFootprint = () => {
    setFootprint(getFootprint());
    setRefreshKey((prev) => prev + 1);
  };

  useEffect(() => {
    loadFootprint();
  }, []);

  const treesOffset = footprint ? (footprint.totalCO2SavedKg / 21).toFixed(2) : '0';

  return (
    <main
      style={{
        background: '#0d1f12',
        minHeight: '100vh',
        color: '#f0f4f0',
        fontFamily: 'var(--font-geist-sans), system-ui, sans-serif',
      }}
    >
      <div
        style={{
          borderBottom: '1px solid rgba(82,183,136,0.15)',
          padding: '16px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'sticky',
          top: 0,
          background: '#0d1f12',
          zIndex: 10,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '20px' }}>🌿</span>
          <span style={{ fontSize: '17px' }}>
            <span style={{ fontWeight: 400 }}>eco</span>
            <span style={{ fontWeight: 700 }}>route</span>
          </span>
        </div>
        <Link
          href="/"
          style={{
            color: '#4ade80',
            textDecoration: 'none',
            fontSize: '13px',
            fontWeight: 600,
            border: '1px solid #2d5a3d',
            padding: '8px 14px',
            borderRadius: '8px',
            transition: 'all 0.2s',
            display: 'inline-flex',
            alignItems: 'center',
            minHeight: '44px',
          }}
        >
          ← Back to Map
        </Link>
      </div>

      <div style={{ maxWidth: '680px', margin: '0 auto', padding: '24px 20px 60px' }}>
        <div style={{ marginBottom: '28px' }}>
          <div
            style={{
              fontSize: '11px',
              textTransform: 'uppercase',
              letterSpacing: '0.12em',
              color: '#6b9e7a',
              marginBottom: '8px',
              fontWeight: 600,
            }}
          >
            Your Eco Impact
          </div>
          <h1 style={{ fontSize: '1.8em', fontWeight: 800, color: '#f0f4f0', margin: 0 }}>
            Carbon Footprint
          </h1>
        </div>

        <div style={{ display: 'flex', gap: '12px', marginBottom: '32px', flexWrap: 'wrap' }}>
          <StatCard
            icon="💨"
            value={footprint?.totalCO2SavedKg.toFixed(1) ?? '0'}
            unit="kg CO₂"
            label="Total Saved"
          />
          <StatCard icon="🗺️" value={String(footprint?.totalTrips ?? 0)} unit="trips" label="Logged" />
          <StatCard icon="🌳" value={treesOffset} unit="trees" label="Equivalent Offset" />
        </div>

        <div
          style={{
            background: '#122b1c',
            border: '1px solid #2d5a3d',
            borderRadius: '16px',
            padding: '22px',
            marginBottom: '24px',
          }}
        >
          <div
            style={{
              fontSize: '11px',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              color: '#6b9e7a',
              fontWeight: 600,
              marginBottom: '18px',
            }}
          >
            CO₂ Saved by Mode
          </div>
          <FootprintChart refreshKey={refreshKey} />
        </div>

        <div
          style={{
            background: '#122b1c',
            border: '1px solid #2d5a3d',
            borderRadius: '16px',
            padding: '22px',
          }}
        >
          <div
            style={{
              fontSize: '11px',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              color: '#6b9e7a',
              fontWeight: 600,
              marginBottom: '18px',
            }}
          >
            Trip History
          </div>
          <TripHistory onClear={loadFootprint} />
        </div>
      </div>
    </main>
  );
}
