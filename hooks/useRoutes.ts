import { JourneyState } from '@/types';

export function useRoutes() {
  // Task 002 + 003
  const state: JourneyState = {
    origin: '', destination: '',
    originCoords: null, destinationCoords: null,
    routes: [], selectedMode: null,
    isLoading: false, error: null,
  };
  return { state };
}
