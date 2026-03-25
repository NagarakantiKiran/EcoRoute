/* eslint-disable @typescript-eslint/no-unused-vars */
import { Trip, FootprintSummary, UserPreferences } from '@/types';

export function saveTrip(trip: Trip): void {
  // Task 004
}

export function getTrips(): Trip[] {
  // Task 004
  return [];
}

export function getFootprint(): FootprintSummary {
  // Task 005
  return { totalCO2SavedKg: 0, totalTrips: 0, tripsByMode: { walking: 0, cycling: 0, driving: 0, ev: 0 }, lastUpdated: 0 };
}
