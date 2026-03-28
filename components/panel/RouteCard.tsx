import { RouteResult, EcoGrade } from '@/types';
import { GRADE_COLORS } from '@/lib/ecoGrade';

interface Props {
  route: RouteResult;
  isSelected: boolean;
  onSelect: () => void;
}

const GRADE_LABELS: Record<EcoGrade, string> = {
  A: 'Extremely eco-friendly',
  B: 'Very eco-friendly',
  C: 'Moderately eco-friendly',
  D: 'Less eco-friendly',
};

const STRATEGY_DETAILS: Record<string, { label: string; icon: string }> = {
  fastest: { label: 'Fastest Route', icon: '⚡' },
  eco: { label: 'Eco Route', icon: '🌿' },
  alternative: { label: 'Alternative', icon: '🛣️' },
};

export default function RouteCard({ route, isSelected, onSelect }: Props) {
  const durationMinutes = Math.round(route.durationSeconds / 60);
  const distanceKm = (route.distanceMeters / 1000).toFixed(1);
  const gradeColor = GRADE_COLORS[route.ecoGrade as EcoGrade];
  const strategyDetails = STRATEGY_DETAILS[route.strategy] || {
    label: 'Route',
    icon: '🛣️',
  };

  return (
    <div
      onClick={onSelect}
      style={{
        background: isSelected ? 'var(--eco-bg)' : 'var(--eco-surface)',
        border: `2px solid ${isSelected ? 'var(--eco-green)' : 'var(--eco-border)'}`,
        borderRadius: '12px',
        padding: '16px',
        marginBottom: '12px',
        cursor: 'pointer',
        transition: 'all 0.3s ease-out, box-shadow 0.6s ease-out',
        opacity: isSelected ? 1 : 0.9,
        boxShadow: isSelected ? '0 6px 18px rgba(82, 183, 136, 0.22)' : 'none',
      }}
      className={isSelected ? 'route-card route-card-container active' : 'route-card route-card-container'}
    >
      <div
        className="route-card-header"
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          gap: '8px',
        }}
      >
        <div style={{ fontSize: '26px', color: isSelected ? 'var(--eco-green)' : 'var(--eco-text)' }}>
          {strategyDetails.icon}
        </div>
        <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--eco-text)' }}>
          {strategyDetails.label}
        </div>
        <div className="route-stats" style={{ fontSize: '12px', color: 'var(--eco-muted)' }}>
          {distanceKm} km • {durationMinutes} min
        </div>
        <div style={{ fontSize: '16px', fontWeight: 700, color: gradeColor }}>
          {route.co2Kg.toFixed(2)} kg
        </div>
        <div style={{ fontSize: '11px', color: 'var(--eco-muted)', marginTop: '-2px' }}>
          CO₂
        </div>
        <div
          className="route-grade"
          style={{
            fontSize: '11px',
            color: gradeColor,
            fontWeight: 600,
            textTransform: 'uppercase',
            marginTop: '6px',
          }}
        >
          Grade {route.ecoGrade} — {GRADE_LABELS[route.ecoGrade as EcoGrade]}
        </div>
        {route.co2SavedKg > 0 && (
          <div style={{ fontSize: '11px', color: 'var(--eco-green)', marginTop: '4px', fontWeight: 500 }}>
            Saves {route.co2SavedKg.toFixed(2)} kg
          </div>
        )}
      </div>
    </div>
  );
}
