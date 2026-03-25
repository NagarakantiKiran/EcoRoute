import dynamic from 'next/dynamic';
import JourneyPlanner from '@/components/panel/JourneyPlanner';

// CRITICAL: MapLibre GL JS requires window — must disable SSR
const EcoMap = dynamic(() => import('@/components/map/EcoMap'), {
  ssr: false,
  loading: () => (
    <div style={{
      width: '100%', height: '100%',
      background: '#0d1f12',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <span style={{ color: '#7a9e7e', fontSize: '14px' }}>Loading map...</span>
    </div>
  ),
});

export default function HomePage() {
  return (
    <div style={{
      display: 'flex',
      height: '100vh',
      overflow: 'hidden',
      background: 'var(--eco-bg)',
    }}>
      {/* Left panel — 40% width on desktop, bottom sheet on mobile */}
      <div style={{
        width: '40%',
        minWidth: '320px',
        maxWidth: '480px',
        height: '100%',
        overflowY: 'auto',
        background: 'var(--eco-bg)',
        borderRight: '1px solid var(--eco-border)',
        zIndex: 10,
        flexShrink: 0,
      }}>
        {/* Header */}
        <div style={{
          padding: '16px 20px',
          borderBottom: '1px solid var(--eco-border)',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
        }}>
          {/* Logo mark placeholder — replaced in Task 006 */}
          <div style={{
            width: '32px', height: '32px',
            borderRadius: '8px',
            background: 'var(--eco-surface)',
            border: '1px solid var(--eco-border)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '16px',
          }}>
            🌿
          </div>
          {/* Wordmark: "eco" regular + "route" bold */}
          <span style={{ color: 'var(--eco-text)', fontSize: '18px' }}>
            <span style={{ fontWeight: 400 }}>eco</span>
            <span style={{ fontWeight: 700 }}>route</span>
          </span>
        </div>

        {/* Journey planner — implemented Task 002 */}
        <JourneyPlanner />
      </div>

      {/* Map panel — 60% width */}
      <div style={{ flex: 1, position: 'relative', height: '100%' }}>
        <EcoMap />
      </div>
    </div>
  );
}
