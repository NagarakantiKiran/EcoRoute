import { EcoGrade } from '@/types';

/**
 * Assign an eco grade (A/B/C/D) based on CO₂ emissions per km.
 * @param co2PerKmGrams - CO₂ emissions in grams per kilometer
 * @returns Eco grade: 'A' (greenest) to 'D' (least green)
 */
export function getEcoGrade(co2PerKmGrams: number): EcoGrade {
  if (co2PerKmGrams <= 20) return 'A';   // Walk, cycle, EV short trip
  if (co2PerKmGrams <= 60) return 'B';   // EV, shared transport
  if (co2PerKmGrams <= 120) return 'C';  // Average petrol car
  return 'D';                             // SUV, heavy traffic, long drive
}

/**
 * Color coding for eco grades
 * A: green, B: muted green, C: amber, D: orange
 */
export const GRADE_COLORS: Record<EcoGrade, string> = {
  A: '#52b788',  // Accent green
  B: '#a8c5a0',  // Muted green
  C: '#f4a261',  // Amber (no red)
  D: '#e07c3a',  // Orange
} as const;
