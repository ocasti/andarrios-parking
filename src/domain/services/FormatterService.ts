/**
 * FormatterService
 * Funciones de formateo para presentación de datos del dominio.
 * Zona horaria Colombia (America/Bogota, UTC-5).
 */

import { ZONA_HORARIA } from '../constants';

/**
 * Formatea un número como pesos colombianos: '$1.500'
 */
export function formatCOP(n: number): string {
  return '$' + Math.round(n).toLocaleString('es-CO');
}

/**
 * Formatea un ISO string como HH:mm en hora Colombia.
 */
export function formatHora(iso: string | number | Date): string {
  return new Date(iso).toLocaleTimeString('es-CO', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: ZONA_HORARIA,
    hour12: false,
  });
}

/**
 * Formatea un ISO string como dd/mm/yyyy en Colombia.
 */
export function formatFecha(iso: string | number | Date): string {
  return new Date(iso).toLocaleDateString('es-CO', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    timeZone: ZONA_HORARIA,
  });
}

/**
 * Devuelve la fecha en Colombia como YYYY-MM-DD.
 */
export function colDateStr(d: string | number | Date): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: ZONA_HORARIA,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date(d));
}

/**
 * Devuelve un Date que representa medianoche (00:00:00) en Colombia
 * para el día de la fecha dada.
 */
export function colStartOfDay(d: string | number | Date): Date {
  const ymd = colDateStr(d);
  // medianoche Colombia = ymd + T00:00:00 en America/Bogota
  // America/Bogota es UTC-5, así que "2026-05-08T00:00:00-05:00" = "2026-05-08T05:00:00Z"
  return new Date(`${ymd}T00:00:00-05:00`);
}

/**
 * Devuelve un Date que representa el primer día del mes de la fecha dada,
 * a medianoche en Colombia.
 */
export function colStartOfMonth(d: string | number | Date): Date {
  const ymd = colDateStr(d);         // "YYYY-MM-DD"
  const firstDay = ymd.slice(0, 8) + '01'; // "YYYY-MM-01"
  return new Date(`${firstDay}T00:00:00-05:00`);
}
