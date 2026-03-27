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

const MODE_ICONS: Record<string, string> = {
  walking: '🚶',
  cycling: '🚴',
  driving: '🚗',
};

const STRATEGY_LABELS: Record<string, string> = {
  fastest: '⚡ Fastest',
  eco: '🌿 Eco',
  alternative: '🛣️ Alt',
};

const STRATEGY_COLORS: Record<string, string> = {
  fastest: '#3b82f6',
  eco: '#10b981',
  alternative: '#f59e0b',
};

export default function RouteCard({ route, isSelected, onSelect }: Props) {
  const durationMinutes = Math.round(route.durationSeconds / 60);
  const distanceKm = (route.distanceMeters / 1000).toFixed(1);
  const gradeColor = GRADE_COLORS[route.ecoGrade as EcoGrade];
  const strategyColor = STRATEGY_COLORS[route.strategy] || '#52b788';

  return (
    <div
      onClick={onSelect}
      style={{
        background: isSelected ? 'var(--eco-surface)' : 'var(--eco-bg)',
        border: `2px solid ${isSelected ? strategyColor : 'var(--eco-border)'}`,
        borderRadius: '12px',
        padding: '16px',
        marginBottom: '12px',
        cursor: 'pointer',
        transition: 'all 0.3s ease-out, box-shadow 0.6s ease-out',
        opacity: isSelected ? 1 : 0.7,
        ...(isSelected && {
          boxShadow: `0 4px 12px ${strategyColor}40, 0 0 20px ${strategyColor}20`,
        }),
      }}
      className={isSelected ? 'route-card-container active' : 'route-card-container'}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ display: 'flex', gap: '12px', flex: 1 }}>
          {/* Icon */}
          <div style={{ fontSize: '28px' }}>
            {MODE_ICONS[route.mode]}
          </div>

          {/* Main info */}
          <div style={{ flex: 1 }}>
            <div
              style={{
                fontSize: '14px',
                fontWeight: 600,
                color: 'var(--eco-text)',
                marginBottom: '4px',
                display: 'flex',
                gap: '8px',
                alignItems: 'center',
              }}
            >
              {route.mode.charAt(0).toUpperCase() + route.mode.slice(1)}
              {/* Strategy badge */}
              <span
                style={{
                  fontSize: '10px',
                  padding: '3px 8px',
                  borderRadius: '4px',
                  background: `${strategyColor}20`,
                  color: strategyColor,
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                }}
              >
                {STRATEGY_LABELS[route.strategy]}
              </span>
            </div>

            <div style={{ fontSize: '12px', color: 'var(--eco-muted)', marginBottom: '8px' }}>
              {distanceKm} km • {durationMinutes} min
            </div>

            {/* Grade label */}
            <div
              style={{
                fontSize: '11px',
                color: gradeColor,
                fontWeight: 600,
                textTransform: 'uppercase',
              }}
            >
              Grade {route.ecoGrade} — {GRADE_LABELS[route.ecoGrade as EcoGrade]}
            </div>
          </div>
        </div>

        {/* CO₂ value */}
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '18px', fontWeight: 700, color: gradeColor }}>
            {route.co2Kg.toFixed(2)} kg
          </div>
          <div style={{ fontSize: '11px', color: 'var(--eco-muted)', marginTop: '2px' }}>
            CO₂
          </div>
          {route.co2SavedKg > 0 && (
            <div
              style={{
                fontSize: '11px',
                color: 'var(--eco-green)',
                marginTop: '4px',
                fontWeight: 500,
              }}
            >
              Saves {route.co2SavedKg.toFixed(2)} kg
            </div>
          )}
        </div>
      </div>

      {/* Progress bar — eco score relative to worst route */}
      <div
        style={{
          height: '3px',
          background: 'var(--eco-border)',
          borderRadius: '2px',
          marginTop: '12px',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            height: '100%',
            background: gradeColor,
            width: `${Math.max(20, 100 - route.co2Kg * 10)}%`,
            transition: 'width 0.3s',
          }}
        />
      </div>
    </div>
  );
}
