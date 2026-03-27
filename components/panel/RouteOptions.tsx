import { RouteResult } from '@/types';
import RouteCard from './RouteCard';

interface Props {
  routes: RouteResult[];
  selectedRouteId: string | null;
  onSelectRoute: (routeId: string) => void;
  isLoading?: boolean;
}

export default function RouteOptions({ routes, selectedRouteId, onSelectRoute, isLoading }: Props) {
  if (isLoading) {
    return (
      <div
        style={{
          padding: '20px',
          textAlign: 'center',
          color: 'var(--eco-muted)',
          fontSize: '14px',
        }}
      >
        Finding best routes...
      </div>
    );
  }

  if (!routes || routes.length === 0) {
    return null;
  }

  const modeOrder: Array<RouteResult['mode']> = ['walking', 'cycling', 'driving'];
  const strategyOrder: Record<RouteResult['strategy'], number> = {
    fastest: 0,
    eco: 1,
    alternative: 2,
  };

  return (
    <div style={{ padding: '20px' }}>
      <div
        style={{
          fontSize: '10px',
          textTransform: 'uppercase',
          letterSpacing: '0.12em',
          color: 'var(--eco-muted)',
          marginBottom: '16px',
          fontWeight: 600,
        }}
      >
        Route Options
      </div>

      <div>
        {modeOrder.map((mode) => {
          const modeRoutes = routes
            .filter((route) => route.mode === mode)
            .sort((a, b) => strategyOrder[a.strategy] - strategyOrder[b.strategy]);

          if (modeRoutes.length === 0) return null;

          return (
            <div key={mode} style={{ marginBottom: '12px' }}>
              <div
                style={{
                  fontSize: '11px',
                  color: 'var(--eco-muted)',
                  marginBottom: '8px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                }}
              >
                {mode.charAt(0).toUpperCase() + mode.slice(1)}
              </div>
              {modeRoutes.map((route) => (
                <RouteCard
                  key={route.id}
                  route={route}
                  isSelected={selectedRouteId === route.id}
                  onSelect={() => onSelectRoute(route.id)}
                />
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}
