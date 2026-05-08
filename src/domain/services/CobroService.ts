/**
 * CobroService
 * Calculates the parking visit charge.
 *
 * Rules:
 * - If courtesyApplies=true, the first `freeHours` are free.
 * - If courtesyApplies=false, charging starts from the first hour (freeHours=0).
 * - Charged hours are rounded up (ceil).
 * - total = base (tax is already included in the price; tax is extracted from base).
 */

export interface ChargeParams {
  hours: number;
  hourlyRate: number;
  freeHours: number;
  taxRate: number;
  courtesyApplies: boolean;
}

export interface ChargeResult {
  chargedHours: number;
  freeHours: number;
  base: number;
  iva: number;
  total: number;
}

export function calculateCharge(params: ChargeParams): ChargeResult {
  const { hours, hourlyRate, freeHours: freeHoursParam, taxRate, courtesyApplies } = params;

  const freeHours = courtesyApplies ? freeHoursParam : 0;
  const chargedHours = Math.max(0, Math.ceil(hours - freeHours));
  const base = chargedHours * hourlyRate;
  // Tax extracted from a price that already includes tax: iva = base * pct / (100 + pct)
  const iva = base === 0 ? 0 : Math.round((base * taxRate) / (100 + taxRate));
  const total = base;

  return { chargedHours, freeHours, base, iva, total };
}
