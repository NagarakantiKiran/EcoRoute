import { EMISSION_FACTORS, EmissionMode } from '@/config/emissions';

/**
 * Calculate CO₂ emissions for a given distance and transport mode.
 * @param distanceMeters - Distance in meters
 * @param mode - Transport mode (walking, cycling, driving, ev, transit)
 * @returns CO₂ in kg (NOT grams)
 */
export function calculateCO2(distanceMeters: number, mode: EmissionMode): number {
  const distanceKm = distanceMeters / 1000;
  const emissionFactorGPerKm = EMISSION_FACTORS[mode];
  // Convert: grams/km * km / 1000 = kg
  return (emissionFactorGPerKm * distanceKm) / 1000;
}

/**
 * Calculate CO₂ saved by choosing a greener mode vs. driving as baseline.
 * @param distanceMeters - Distance in meters
 * @param chosenMode - The transport mode chosen by user
 * @returns CO₂ saved in kg (compared to driving baseline)
 */
export function calculateCO2Saved(
  distanceMeters: number,
  chosenMode: EmissionMode
): number {
  const baseline = calculateCO2(distanceMeters, 'driving');
  const actual = calculateCO2(distanceMeters, chosenMode);
  return Math.max(0, baseline - actual); // Never negative
}

/**
 * Get a human-readable equivalent of CO₂ saved (e.g., "trees planted")
 * @param co2SavedKg - CO₂ saved in kg
 * @returns Human-readable string
 */
export function getCO2Equivalent(co2SavedKg: number): string {
  // 1 tree absorbs ~20 kg CO₂ per year (global average)
  const trees = Math.round(co2SavedKg / 20 * 10) / 10;
  if (trees < 0.1) return 'a fraction of a tree';
  if (trees === 1) return '1 tree';
  return `${trees} trees`;
}
