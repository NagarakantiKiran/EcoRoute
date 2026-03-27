export type TransportMode = 'walking' | 'cycling' | 'driving' | 'ev';
export type EcoGrade = 'A' | 'B' | 'C' | 'D';
export type RouteStrategy = 'fastest' | 'eco' | 'alternative';

export interface RouteResult {
  id: string;
  mode: TransportMode;
  strategy: RouteStrategy;
  distanceMeters: number;
  durationSeconds: number;
  geometry: GeoJSON.LineString;
  co2Kg: number;
  co2SavedKg: number;
  ecoGrade: EcoGrade;
  label: string;
}

export interface JourneyState {
  origin: string;
  destination: string;
  originCoords: [number, number] | null;
  destinationCoords: [number, number] | null;
  routes: RouteResult[];
  selectedRouteId: string | null;
  isLoading: boolean;
  error: string | null;
}

export interface Trip {
  id: string;
  timestamp: number;
  origin: string;
  destination: string;
  mode: TransportMode;
  strategy?: RouteStrategy;
  distanceKm: number;
  co2Kg: number;
  co2SavedKg: number;
  ecoGrade: EcoGrade;
}

export interface FootprintSummary {
  totalCO2SavedKg: number;
  totalTrips: number;
  tripsByMode: Record<TransportMode, number>;
  lastUpdated: number;
}

export interface UserPreferences {
  ecoModeActive: boolean;
  defaultMode: TransportMode | 'auto';
  homeLocation?: string;
}
