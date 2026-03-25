/* eslint-disable @typescript-eslint/no-unused-vars */
import { EcoGrade } from '@/types';

export function getEcoGrade(co2PerKm: number): EcoGrade {
  // Task 003
  return 'A';
}

export const GRADE_COLORS: Record<EcoGrade, string> = {
  A: '#52b788',
  B: '#a8c5a0',
  C: '#f4a261',
  D: '#e07c3a',
};
