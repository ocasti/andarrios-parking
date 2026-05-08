/**
 * CortesiaService
 * Evaluates whether courtesy hours apply for a visitor check-in.
 *
 * Rule: courtesy does NOT apply if the vehicle had a check-out within the last
 * `minHoursForCourtesy` hours (quick re-entry).
 * With minHoursForCourtesy <= 0, courtesy always applies.
 */

export interface ExitHistory {
  checkedOutAt: string; // ISO string
}

/**
 * Returns `true` if courtesy applies for this check-in.
 * @param history  Recent exits found for the plate (already filtered by time)
 * @param minHoursForCourtesy  Time window in hours; <=0 always applies
 */
export function evaluateCourtesy(
  history: ExitHistory[],
  minHoursForCourtesy: number,
): boolean {
  if (minHoursForCourtesy <= 0) return true;
  return history.length === 0;
}

/**
 * Calculates the start date of the courtesy window.
 * @param hours  Number of hours to look back
 * @param now  Reference for "now" (injectable for tests)
 */
export function calculateSince(hours: number, now: Date = new Date()): Date {
  return new Date(now.getTime() - hours * 3600 * 1000);
}
