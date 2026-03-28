import { Trip, FootprintSummary, TransportMode } from '@/types';

const TRIPS_KEY = 'ecoroute:trips';
const MAX_TRIPS = 100;

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

// ---- Save a trip ----
export function saveTrip(trip: Trip): void {
  if (typeof window === 'undefined') return;
  try {
    const trips = getTrips();
    trips.unshift(trip);
    const trimmed = trips.slice(0, MAX_TRIPS);
    localStorage.setItem(TRIPS_KEY, JSON.stringify(trimmed));
  } catch (err) {
    console.error('Failed to save trip:', err);
  }
}

// ---- Get all trips ----
export function getTrips(): Trip[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(TRIPS_KEY);
    return raw ? (JSON.parse(raw) as Trip[]) : [];
  } catch (err) {
    console.error('Failed to get trips:', err);
    return [];
  }
}

// ---- Clear all trips ----
export function clearTrips(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(TRIPS_KEY);
  } catch (err) {
    console.error('Failed to clear trips:', err);
  }
}

// ---- Calculate footprint summary from trips ----
export function getFootprint(): FootprintSummary {
  const trips = getTrips();

  const tripsByMode: Record<TransportMode, number> = {
    walking: 0,
    cycling: 0,
    driving: 0,
    ev: 0,
  };

  let totalCO2SavedKg = 0;

  trips.forEach((trip) => {
    tripsByMode[trip.mode] = (tripsByMode[trip.mode] || 0) + 1;
    totalCO2SavedKg += trip.co2SavedKg;
  });

  if (trips.length === 0) {
    return {
      ...DEFAULT_FOOTPRINT,
      lastUpdated: Date.now(),
    };
  }

  return {
    totalCO2SavedKg: parseFloat(totalCO2SavedKg.toFixed(3)),
    totalTrips: trips.length,
    tripsByMode,
    lastUpdated: Date.now(),
  };
}

// ---- CO2 saved per mode (for bar chart) ----
export function getCO2SavedByMode(): Record<TransportMode, number> {
  const trips = getTrips();
  const result: Record<TransportMode, number> = {
    walking: 0,
    cycling: 0,
    driving: 0,
    ev: 0,
  };

  trips.forEach((trip) => {
    result[trip.mode] = parseFloat(((result[trip.mode] || 0) + trip.co2SavedKg).toFixed(3));
  });

  return result;
}

// Backward-compatible alias used in older code
export function clearAllTrips(): void {
  clearTrips();
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
