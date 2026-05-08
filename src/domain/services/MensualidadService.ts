/**
 * MensualidadService
 * Domain logic for resident monthly fees.
 */

import type { VehicleType } from '../entities';
import { TIMEZONE } from '../constants';

export interface MonthlyRateConfig {
  carMonthlyRate: number;
  motorcycleMonthlyRate: number;
}

/**
 * Returns the monthly fee amount based on vehicle type.
 */
export function calculateMonthlyAmount(vehicleType: VehicleType, config: MonthlyRateConfig): number {
  return vehicleType === 'car' ? config.carMonthlyRate : config.motorcycleMonthlyRate;
}

/**
 * Generates the month key in YYYY-MM format for the Colombia timezone.
 */
export function generateMonthKey(fecha: Date = new Date()): string {
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  return formatter.format(fecha).slice(0, 7);
}

/**
 * Compares two monthKeys for strict equality.
 */
export function isSameMonth(a: string, b: string): boolean {
  return a === b;
}
