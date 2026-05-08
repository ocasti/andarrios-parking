/**
 * CobroService
 * Calcula el cobro de una visita de parqueadero.
 *
 * Reglas:
 * - Si cortesiaAplica=true, las primeras `horasGratis` son gratuitas.
 * - Si cortesiaAplica=false, se cobra desde la primera hora (horasGratis=0).
 * - Las horas cobradas se redondean hacia arriba (ceil).
 * - total = base (IVA ya incluido en precio; iva se extrae de la base).
 */

export interface ParametrosCobro {
  horas: number;
  tarifaHora: number;
  horasGratis: number;
  porcentajeIva: number;
  cortesiaAplica: boolean;
}

/** @deprecated Use ParametrosCobro */
export type CalcularCobroParams = ParametrosCobro;

export interface ResultadoCobro {
  horasCobradas: number;
  horasGratis: number;
  base: number;
  iva: number;
  total: number;
}

/** @deprecated Use ResultadoCobro */
export type CalcularCobroResult = ResultadoCobro;

export function calcularCobro(params: ParametrosCobro): ResultadoCobro {
  const { horas, tarifaHora, horasGratis: horasGratisParam, porcentajeIva, cortesiaAplica } = params as ParametrosCobro;

  const horasGratis = cortesiaAplica ? horasGratisParam : 0;
  const horasCobradas = Math.max(0, Math.ceil(horas - horasGratis));
  const base = horasCobradas * tarifaHora;
  // IVA extraído de un precio que ya incluye IVA: iva = base * pct / (100 + pct)
  const iva = base === 0 ? 0 : Math.round((base * porcentajeIva) / (100 + porcentajeIva));
  const total = base;

  return { horasCobradas, horasGratis, base, iva, total };
}
