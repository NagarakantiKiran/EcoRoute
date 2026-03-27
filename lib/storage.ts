import { Trip, FootprintSummary } from '@/types';

// localStorage keys (all prefixed with 'ecoroute:')
const KEYS = {
  TRIPS: 'ecoroute:trips',
  FOOTPRINT: 'ecoroute:footprint',
  PREFS: 'ecoroute:preferences',
} as const;

const DEFAULT_FOOTPRINT: FootprintSummary = {
  totalCO2SavedKg: 0,
  totalTrips: 0,
  tripsByMode: {
    walking: 0,
    cycling: 0,
    driving: 0,
    ev: 0,
  },
  lastUpdated: Date.now(),
};

/**
 * Save a new trip to localStorage and recalculate footprint
 */
export function saveTrip(trip: Trip): void {
  try {
    const existing = getTrips();
    // Keep only last 100 trips
    const updated = [trip, ...existing].slice(0, 100);
    localStorage.setItem(KEYS.TRIPS, JSON.stringify(updated));
    recalculateFootprint(updated);
  } catch (err) {
    console.error('Failed to save trip:', err);
  }
}

/**
 * Get all trips from localStorage
 */
export function getTrips(): Trip[] {
  try {
    const raw = localStorage.getItem(KEYS.TRIPS);
    return raw ? JSON.parse(raw) : [];
  } catch (err) {
    console.error('Failed to get trips:', err);
    return [];
  }
}

/**
 * Get current footprint summary
 */
export function getFootprint(): FootprintSummary {
  try {
    const raw = localStorage.getItem(KEYS.FOOTPRINT);
    return raw ? JSON.parse(raw) : DEFAULT_FOOTPRINT;
  } catch (err) {
    console.error('Failed to get footprint:', err);
    return DEFAULT_FOOTPRINT;
  }
}

/**
 * Recalculate and save footprint summary based on trips
 */
function recalculateFootprint(trips: Trip[]): void {
  try {
    const summary: FootprintSummary = {
      totalCO2SavedKg: trips.reduce((sum, t) => sum + t.co2SavedKg, 0),
      totalTrips: trips.length,
      tripsByMode: {
        walking: trips.filter((t) => t.mode === 'walking').length,
        cycling: trips.filter((t) => t.mode === 'cycling').length,
        driving: trips.filter((t) => t.mode === 'driving').length,
        ev: trips.filter((t) => t.mode === 'ev').length,
      },
      lastUpdated: Date.now(),
    };
    localStorage.setItem(KEYS.FOOTPRINT, JSON.stringify(summary));
  } catch (err) {
    console.error('Failed to recalculate footprint:', err);
  }
}

/**
 * Clear all trips (debug only)
 */
export function clearAllTrips(): void {
  try {
    localStorage.removeItem(KEYS.TRIPS);
    localStorage.removeItem(KEYS.FOOTPRINT);
  } catch (err) {
    console.error('Failed to clear trips:', err);
  }
}

/**
 * Get trips from a specific time range
 */
export function getTripsInRange(startTime: number, endTime: number): Trip[] {
  try {
    const trips = getTrips();
    return trips.filter((t) => t.timestamp >= startTime && t.timestamp <= endTime);
  } catch (err) {
    console.error('Failed to get trips in range:', err);
    return [];
  }
}

/**
 * Get CO₂ saved in current week
 */
export function getCO2SavedThisWeek(): number {
  const now = Date.now();
  const weekAgo = now - 7 * 24 * 60 * 60 * 1000;
  const weekTrips = getTripsInRange(weekAgo, now);
  return weekTrips.reduce((sum, t) => sum + t.co2SavedKg, 0);
}

/**
 * Get CO₂ saved in current month
 */
export function getCO2SavedThisMonth(): number {
  const now = Date.now();
  const monthAgo = now - 30 * 24 * 60 * 60 * 1000;
  const monthTrips = getTripsInRange(monthAgo, now);
  return monthTrips.reduce((sum, t) => sum + t.co2SavedKg, 0);
}
