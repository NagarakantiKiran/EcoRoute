import { RouteResult } from '@/types';
import { calculateCO2, calculateCO2Saved } from '@/lib/co2';
import { getEcoGrade } from '@/lib/ecoGrade';
import { EMISSION_FACTORS } from '@/config/emissions';
import type * as GeoJSON from 'geojson';

// Map our modes to ORS profiles
const PROFILE_MAP: Record<string, string> = {
  walking: 'foot-walking',
  cycling: 'cycling-regular',
  driving: 'driving-car',
};

// OSRM profiles (fallback when ORS rate limits)
const OSRM_PROFILE_MAP: Record<string, string> = {
  walking: 'foot',
  cycling: 'bike',
  driving: 'car',
};

/**
 * Fetch route from ORS via server-side proxy.
 * If ORS rate-limits (429), retry with OSRM as fallback.
 */
interface ORSRouteResponse {
  features: Array<{
    geometry: GeoJSON.LineString;
    properties: {
      summary: {
        distance: number;
        duration: number;
      };
    };
  }>;
}

interface OSRMRoute {
  geometry: GeoJSON.LineString;
  distance: number;
  duration: number;
}

interface OSRMRouteResponse {
  routes?: OSRMRoute[];
}

async function fetchRouteWithFallback(
  origin: [number, number],
  destination: [number, number],
  mode: 'walking' | 'cycling' | 'driving'
): Promise<ORSRouteResponse> {
  try {
    // Try ORS first — request alternatives for multiple route variants
    const res = await fetch('/api/route/route', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        origin,
        destination,
        profile: PROFILE_MAP[mode],
        alternatives: true, // Request alternative routes
      }),
    });

    // Handle rate limit — fall back to OSRM
    if (res.status === 429) {
      console.warn(`ORS rate limited for ${mode}, trying OSRM fallback...`);
      return fetchOSRMRoute(origin, destination, mode);
    }

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(errorData.error || `HTTP ${res.status}`);
    }

    return await res.json();
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    console.error(`ORS fetch failed for ${mode}:`, errorMsg);
    // Try OSRM as ultimate fallback
    return fetchOSRMRoute(origin, destination, mode);
  }
}

/**
 * Fallback: Fetch route from OSRM (open source, no API key)
 */
async function fetchOSRMRoute(
  origin: [number, number],
  destination: [number, number],
  mode: 'walking' | 'cycling' | 'driving'
): Promise<ORSRouteResponse> {
  const profile = OSRM_PROFILE_MAP[mode];
  const url = `https://router.project-osrm.org/route/v1/${profile}/${origin[0]},${origin[1]};${destination[0]},${destination[1]}?geometries=geojson&overview=full&alternatives=true`;

  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`OSRM failed for ${mode}: HTTP ${res.status}`);
  }

  const data: OSRMRouteResponse = await res.json();
  if (!data.routes || !data.routes[0]) {
    throw new Error(`No route found via OSRM for ${mode}`);
  }

  // Convert OSRM response to ORS-like format (supports multiple routes)
  const routes = data.routes || [];
  return {
    features: routes.map((route) => ({
      geometry: route.geometry,
      properties: {
        summary: {
          distance: route.distance, // meters
          duration: route.duration, // seconds
        },
      },
    })),
  };
}

export async function fetchRoutes(
  origin: [number, number],
  destination: [number, number]
): Promise<RouteResult[]> {
  // Fetch all 3 modes in parallel
  const modes: Array<'walking' | 'cycling' | 'driving'> = ['walking', 'cycling', 'driving'];

  const results = await Promise.all(
    modes.flatMap((mode) =>
      (async () => {
        try {
          let data = await fetchRouteWithFallback(origin, destination, mode);

          // Extract all route alternatives
          let features = data.features || [];
          if (features.length < 2) {
            try {
              console.warn(`ORS returned limited alternatives for ${mode}, trying OSRM...`);
              data = await fetchOSRMRoute(origin, destination, mode);
              features = data.features || [];
            } catch (fallbackErr) {
              console.warn(`OSRM fallback failed for ${mode}, using ORS result.`, fallbackErr);
            }
          }
          if (features.length === 0) {
            throw new Error(`No route geometry found for ${mode}`);
          }

          // Build route objects from alternatives
          // We want: fastest (1st/primary), eco (shortest by distance), alternative (2nd if exists)
          const routesByStrategy = features.map((feature, idx) => {
            const distanceMeters = feature.properties.summary.distance;
            const durationSeconds = feature.properties.summary.duration;
            const geometry = feature.geometry;

            return {
              distanceMeters,
              durationSeconds,
              geometry,
              idx,
            };
          });

          // Sort by distance to identify eco (shortest) route
          const routesByDistance = [...routesByStrategy].sort(
            (a, b) => a.distanceMeters - b.distanceMeters
          );

          // Strategy 1: Fastest = primary route (index 0)
          const fastest = routesByStrategy[0];

          // Strategy 2: Eco = shortest by distance
          const eco = routesByDistance[0];

          // Strategy 3: Alternative = second route if available, else primary
          const alternative = routesByStrategy[1] || routesByStrategy[0];

          const strategies = [
            { raw: fastest, type: 'fastest' as const },
            { raw: eco, type: 'eco' as const },
            { raw: alternative, type: 'alternative' as const },
          ];

          return strategies.map((strat) => {
            const id = `${mode}-${strat.type}`;
            const distanceMeters = strat.raw.distanceMeters;
            const durationSeconds = strat.raw.durationSeconds;
            const geometry = strat.raw.geometry;

            // Calculate CO₂ in kg
            const co2Kg = calculateCO2(distanceMeters, mode);

            // Calculate CO₂ saved vs driving baseline
            const co2SavedKg = calculateCO2Saved(distanceMeters, mode);

            // Calculate CO₂ per km in grams for grade assignment
            const emissionFactorGPerKm = EMISSION_FACTORS[mode];
            const co2PerKmGrams = emissionFactorGPerKm || 0;

            // Assign eco grade
            const ecoGrade = getEcoGrade(co2PerKmGrams);

            return {
              id,
              mode,
              strategy: strat.type,
              distanceMeters,
              durationSeconds,
              geometry,
              co2Kg,
              co2SavedKg,
              ecoGrade,
              label: `${mode.charAt(0).toUpperCase() + mode.slice(1)} (${strat.type})`,
            } as RouteResult;
          });
        } catch (err) {
          console.error(`Failed to fetch ${mode} routes:`, err);
          return [];
        }
      })()
    )
  );

  return results.flat();
}
