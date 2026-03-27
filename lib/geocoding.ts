const NOMINATIM_BASE = 'https://nominatim.openstreetmap.org';
const USER_AGENT = 'EcoRoute/1.0 (ecoroute.app)';

export async function geocode(query: string): Promise<[number, number] | null> {
  if (!query.trim()) return null;

  try {
    const url = new URL(`${NOMINATIM_BASE}/search`);
    url.searchParams.set('q', query);
    url.searchParams.set('format', 'json');
    url.searchParams.set('limit', '1');

    const res = await fetch(url.toString(), {
      headers: { 'User-Agent': USER_AGENT },
    });

    if (!res.ok) throw new Error(`Nominatim ${res.status}`);

    const data: Array<{ lon: string; lat: string }> = await res.json();
    if (!data.length) return null;

    const { lon, lat } = data[0];
    return [parseFloat(lon), parseFloat(lat)];
  } catch (error) {
    console.error('Geocoding failed:', error);
    return null;
  }
}

// Session storage cache
const CACHE_KEY = 'ecoroute:geocoding-cache';
const CACHE_TTL_MS = 3600000; // 1 hour

function getCachedResult(query: string): [number, number] | null {
  if (typeof window === 'undefined') return null;

  try {
    const raw = sessionStorage.getItem(CACHE_KEY);
    if (!raw) return null;

    type CacheEntry = { coords: [number, number]; timestamp: number };
    const cache = JSON.parse(raw) as Record<string, CacheEntry>;
    const entry = cache[query];

    if (!entry) return null;
    if (Date.now() - entry.timestamp > CACHE_TTL_MS) {
      delete cache[query];
      sessionStorage.setItem(CACHE_KEY, JSON.stringify(cache));
      return null;
    }

    return entry.coords;
  } catch {
    return null;
  }
}

function setCachedResult(query: string, coords: [number, number]): void {
  if (typeof window === 'undefined') return;

  try {
    let cache: Record<string, { coords: [number, number]; timestamp: number }> = {};
    const raw = sessionStorage.getItem(CACHE_KEY);
    if (raw) cache = JSON.parse(raw);

    cache[query] = { coords, timestamp: Date.now() };
    sessionStorage.setItem(CACHE_KEY, JSON.stringify(cache));
  } catch {
    // Fail silently on quota exceeded
  }
}

export async function geocodeWithCache(query: string): Promise<[number, number] | null> {
  const cached = getCachedResult(query);
  if (cached) return cached;

  const result = await geocode(query);
  if (result) setCachedResult(query, result);

  return result;
}
