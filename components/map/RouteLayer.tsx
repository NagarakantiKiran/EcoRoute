import { useEffect, useRef } from 'react';
import maplibregl from 'maplibre-gl';
import { RouteResult, EcoGrade } from '@/types';
import { GRADE_COLORS } from '@/lib/ecoGrade';

interface Props {
  map: maplibregl.Map | null;
  routes: RouteResult[];
  activeRouteId?: string | null;
}

export default function RouteLayer({ map, routes, activeRouteId }: Props) {
  const layerIdsRef = useRef<string[]>([]);
  const pulseIntervalRef = useRef<number | null>(null);

  const isUsableMap = (instance: maplibregl.Map | null | undefined): instance is maplibregl.Map => {
    return !!instance && typeof instance.getLayer === 'function' && typeof instance.getSource === 'function';
  };

  useEffect(() => {
    if (!isUsableMap(map)) return;
    const mapInstance = map;

    // Remove previous layers and sources
    layerIdsRef.current.forEach((id) => {
      if (mapInstance?.getLayer(id)) mapInstance.removeLayer(id);
      if (mapInstance?.getSource(id)) mapInstance.removeSource(id);
    });
    layerIdsRef.current = [];

    // Add new route layers
    // Sort routes so driving/ev is last (bottom layer) and walking/cycling on top
    const sortedRoutes = [...routes].sort((a, b) => {
      const order: Record<string, number> = { walking: 0, cycling: 1, driving: 2, ev: 2 };
      return (order[a.mode] ?? 3) - (order[b.mode] ?? 3);
    });

    sortedRoutes.forEach((route) => {
      const id = `route-${route.id}`;
      
      // Vary line width to show overlapping routes
      const lineWidths: Record<string, number> = {
        walking: 7,
        cycling: 5,
        driving: 3,
        ev: 3,
      };

      mapInstance.addSource(id, {
        type: 'geojson',
        data: {
          type: 'Feature',
          geometry: route.geometry,
          properties: {},
        },
      });

      mapInstance.addLayer({
        id,
        type: 'line',
        source: id,
        layout: {
          'line-cap': 'round',
          'line-join': 'round',
        },
        paint: {
          'line-color': GRADE_COLORS[route.ecoGrade as EcoGrade] || '#52b788',
          'line-width': lineWidths[route.mode] || 5,
          'line-opacity': 0.6,
          'line-dasharray': [1, 0],
        },
      });
      layerIdsRef.current.push(id);
    });

    return () => {
      if (!isUsableMap(mapInstance)) return;
      layerIdsRef.current.forEach((id) => {
        if (mapInstance.getLayer(id)) mapInstance.removeLayer(id);
        if (mapInstance.getSource(id)) mapInstance.removeSource(id);
      });
      layerIdsRef.current = [];
    };
  }, [map, routes]);

  useEffect(() => {
    if (!isUsableMap(map)) return;

    // Update active/inactive styling and bring active to front
    routes.forEach((route) => {
      const id = `route-${route.id}`;
      if (!map.getLayer(id)) return;

      const isActive = activeRouteId === route.id;
      const baseWidth: Record<string, number> = {
        walking: 7,
        cycling: 5,
        driving: 3,
        ev: 3,
      };

      map.setPaintProperty(id, 'line-width', isActive ? 7 : (baseWidth[route.mode] || 5));
      map.setPaintProperty(id, 'line-opacity', isActive ? 1 : 0.6);
      map.setPaintProperty(id, 'line-dasharray', isActive ? [2, 2] : [1, 0]);

      if (isActive) {
        map.moveLayer(id);
      }
    });

    // Pan/zoom to active route bounds
    if (activeRouteId) {
      const activeRoute = routes.find((route) => route.id === activeRouteId);
      if (activeRoute?.geometry?.coordinates?.length) {
        const bounds = new maplibregl.LngLatBounds();
        activeRoute.geometry.coordinates.forEach((coord) => {
          bounds.extend([coord[0], coord[1]]);
        });
        map.fitBounds(bounds, { padding: 40, animate: true });
      }
    }
  }, [map, routes, activeRouteId]);

  useEffect(() => {
    if (!isUsableMap(map)) return;
    if (!activeRouteId) return;

    const activeLayerId = `route-${activeRouteId}`;
    if (!map.getLayer(activeLayerId)) return;

    let tick = 0;
    if (pulseIntervalRef.current) {
      window.clearInterval(pulseIntervalRef.current);
    }

    pulseIntervalRef.current = window.setInterval(() => {
      const dash = tick % 2 === 0 ? [2, 2] : [1, 3];
      const width = tick % 2 === 0 ? 7 : 5;
      if (map.getLayer(activeLayerId)) {
        map.setPaintProperty(activeLayerId, 'line-dasharray', dash);
        map.setPaintProperty(activeLayerId, 'line-width', width);
      }
      tick += 1;
    }, 650);

    return () => {
      if (pulseIntervalRef.current) {
        window.clearInterval(pulseIntervalRef.current);
        pulseIntervalRef.current = null;
      }
    };
  }, [map, activeRouteId]);

  return null;
}
