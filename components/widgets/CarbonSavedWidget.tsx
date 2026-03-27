"use client";

import { useEffect, useState } from 'react';
import { getFootprint } from '@/lib/storage';
import { getCO2Equivalent } from '@/lib/co2';

interface Props {
  refreshTrigger?: number; // Increment this to force refresh
}

export default function CarbonSavedWidget({ refreshTrigger }: Props) {
  const [co2Saved, setCO2Saved] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const footprint = getFootprint();
    const saved = footprint.totalCO2SavedKg;
    setCO2Saved(saved);
    setIsVisible(saved > 0);
  }, [refreshTrigger]);

  if (!isVisible) return null;

  const equivalent = getCO2Equivalent(co2Saved);

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '40px',
        right: '40px',
        background: 'var(--eco-surface)',
        border: '2px solid var(--eco-green)',
        borderRadius: '16px',
        padding: '16px 20px',
        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.3)',
        zIndex: 20,
        animation: 'slideInUp 0.3s ease-out',
        maxWidth: '240px',
      }}
    >
      <div
        style={{
          fontSize: '12px',
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          color: 'var(--eco-muted)',
          marginBottom: '8px',
          fontWeight: 600,
        }}
      >
        CO₂ Saved Today
      </div>
      <div
        style={{
          fontSize: '28px',
          fontWeight: 700,
          color: 'var(--eco-green)',
          marginBottom: '4px',
        }}
      >
        {co2Saved.toFixed(2)} kg
      </div>
      <div
        style={{
          fontSize: '12px',
          color: 'var(--eco-muted)',
        }}
      >
        Equivalent to {equivalent}
      </div>

      <style>{`
        @keyframes slideInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
