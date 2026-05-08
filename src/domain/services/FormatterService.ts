/**
 * FormatterService
 * Formatting functions for domain data presentation.
 * Timezone: Colombia (America/Bogota, UTC-5).
 */

import { TIMEZONE } from '../constants';

/**
 * Formats a number as Colombian pesos: '$1.500'
 */
export function formatCOP(n: number): string {
  return '$' + Math.round(n).toLocaleString('es-CO');
}

/**
 * Formats an ISO string as HH:mm in Colombia time.
 */
export function formatTime(iso: string | number | Date): string {
  return new Date(iso).toLocaleTimeString('es-CO', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: TIMEZONE,
    hour12: false,
  });
}

/**
 * Formats an ISO string as dd/mm/yyyy in Colombia.
 */
export function formatDate(iso: string | number | Date): string {
  return new Date(iso).toLocaleDateString('es-CO', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    timeZone: TIMEZONE,
  });
}

/**
 * Returns the date in Colombia as YYYY-MM-DD.
 */
export function colombiaDateStr(d: string | number | Date): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date(d));
}

/**
 * Returns a Date representing midnight (00:00:00) in Colombia
 * for the given date.
 */
export function colombiaStartOfDay(d: string | number | Date): Date {
  const ymd = colombiaDateStr(d);
  // Colombia midnight = ymd + T00:00:00 in America/Bogota
  // America/Bogota is UTC-5, so "2026-05-08T00:00:00-05:00" = "2026-05-08T05:00:00Z"
  return new Date(`${ymd}T00:00:00-05:00`);
}

/**
 * Returns a Date representing the first day of the month of the given date,
 * at midnight in Colombia.
 */
export function colombiaStartOfMonth(d: string | number | Date): Date {
  const ymd = colombiaDateStr(d);         // "YYYY-MM-DD"
  const firstDay = ymd.slice(0, 8) + '01'; // "YYYY-MM-01"
  return new Date(`${firstDay}T00:00:00-05:00`);
}
