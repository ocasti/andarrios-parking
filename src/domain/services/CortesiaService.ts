/**
 * CortesiaService
 * Evalúa si aplican las horas de cortesía para un ingreso de visitante.
 *
 * Regla: cortesía NO aplica si el vehículo tuvo una salida dentro de las
 * últimas `horasMinRecortesia` horas (reingreso rápido).
 * Con horasMinRecortesia <= 0, siempre aplica.
 */

export interface HistorialSalida {
  salidaAt: string; // ISO string
}

/** @deprecated Use HistorialSalida */
export type HistorialReciente = HistorialSalida;

/**
 * Devuelve `true` si la cortesía aplica para este ingreso.
 * @param historial  Salidas recientes encontradas para la placa (ya filtradas por tiempo)
 * @param horasMinRecortesia  Ventana de tiempo en horas; ≤0 siempre aplica
 */
export function evaluarCortesia(
  historial: HistorialSalida[],
  horasMinRecortesia: number,
): boolean {
  if (horasMinRecortesia <= 0) return true;
  return historial.length === 0;
}

/**
 * Calcula la fecha de inicio de la ventana de cortesía.
 * @param horas  Cantidad de horas hacia atrás
 * @param ahora  Referencia de "ahora" (inyectable para tests)
 */
export function calcularDesde(horas: number, ahora: Date = new Date()): Date {
  return new Date(ahora.getTime() - horas * 3600 * 1000);
}
