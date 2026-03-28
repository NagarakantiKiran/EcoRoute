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

  const strategyOrder: Record<RouteResult['strategy'], number> = {
    fastest: 0,
    eco: 1,
    alternative: 2,
  };

  const orderedRoutes = [...routes].sort(
    (a, b) => strategyOrder[a.strategy] - strategyOrder[b.strategy]
  );

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
        {orderedRoutes.map((route) => (
          <RouteCard
            key={route.id}
            route={route}
            isSelected={selectedRouteId === route.id}
            onSelect={() => onSelectRoute(route.id)}
          />
        ))}
      </div>
    </div>
  );
}
