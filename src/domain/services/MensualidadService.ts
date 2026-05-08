/**
 * MensualidadService
 * Lógica de dominio para mensualidades de residentes.
 */

import type { TipoVehiculo } from '../entities';
import { ZONA_HORARIA } from '../constants';

export interface TarifaMensual {
  carroMes: number;
  motoMes: number;
}

/**
 * Retorna el monto de mensualidad según el tipo de vehículo.
 */
export function calcularMontoMensualidad(tipo: TipoVehiculo, tarifa: TarifaMensual): number {
  return tipo === 'carro' ? tarifa.carroMes : tarifa.motoMes;
}

/**
 * Genera la clave de mes en formato YYYY-MM para la zona horaria Colombia.
 */
export function generarMesKey(fecha: Date = new Date()): string {
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: ZONA_HORARIA,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  return formatter.format(fecha).slice(0, 7);
}

/**
 * Compara dos mesKeys por igualdad estricta.
 */
export function esMismoMes(a: string, b: string): boolean {
  return a === b;
}
