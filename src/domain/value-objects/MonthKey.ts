/**
 * Value Object: MonthKey
 * Month key in YYYY-MM format, always in the Colombia timezone (America/Bogota).
 * Immutable, validated on construction.
 */
const MES_KEY_REGEX = /^\d{4}-\d{2}$/;
const BOGOTA_TZ = 'America/Bogota';

/** Extracts YYYY-MM from a date in the Colombia timezone using Intl. */
function toYearMonth(d: Date): string {
  const fmt = new Intl.DateTimeFormat('en-CA', {
    timeZone: BOGOTA_TZ,
    year: 'numeric',
    month: '2-digit',
  });
  // en-CA returns "YYYY-MM-DD", we take the first 7 characters
  return fmt.format(d).slice(0, 7);
}

export class MonthKey {
  readonly value: string;

  private constructor(value: string) {
    this.value = value;
  }

  /**
   * Current month in the Colombia timezone.
   */
  static current(): MonthKey {
    return new MonthKey(toYearMonth(new Date()));
  }

  /**
   * Month of a given date in the Colombia timezone.
   */
  static fromDate(d: Date): MonthKey {
    return new MonthKey(toYearMonth(d));
  }

  /**
   * Validates and creates from a YYYY-MM string.
   * Throws Error if the format is invalid.
   */
  static parse(s: string): MonthKey {
    if (s == null || !MES_KEY_REGEX.test(String(s))) {
      throw new Error(`invalid MonthKey: "${s}" does not match format YYYY-MM`);
    }
    return new MonthKey(s);
  }

  /**
   * Human-readable month label in Spanish, e.g.: "mayo 2026".
   */
  label(): string {
    // Build a date on the first day of the month (midday UTC)
    const [year, month] = this.value.split('-').map(Number);
    const d = new Date(Date.UTC(year, month - 1, 1, 12));
    return new Intl.DateTimeFormat('es-CO', {
      month: 'long',
      year: 'numeric',
      timeZone: BOGOTA_TZ,
    }).format(d);
  }

  equals(other: MonthKey): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }
}
