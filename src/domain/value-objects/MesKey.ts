/**
 * Value Object: MesKey
 * Clave de mes en formato YYYY-MM, siempre en zona horaria Colombia (America/Bogota).
 * Inmutable, se valida en construcción.
 */
const MES_KEY_REGEX = /^\d{4}-\d{2}$/;
const ZONA_BOGOTA = 'America/Bogota';

/** Extrae YYYY-MM de una fecha en zona horaria Colombia usando Intl. */
function toYearMonth(d: Date): string {
  const fmt = new Intl.DateTimeFormat('en-CA', {
    timeZone: ZONA_BOGOTA,
    year: 'numeric',
    month: '2-digit',
  });
  // en-CA devuelve "YYYY-MM-DD", tomamos los primeros 7 caracteres
  return fmt.format(d).slice(0, 7);
}

export class MesKey {
  readonly value: string;

  private constructor(value: string) {
    this.value = value;
  }

  /**
   * Mes actual en zona Colombia.
   */
  static current(): MesKey {
    return new MesKey(toYearMonth(new Date()));
  }

  /**
   * Mes de una fecha dada en zona Colombia.
   */
  static fromDate(d: Date): MesKey {
    return new MesKey(toYearMonth(d));
  }

  /**
   * Valida y crea desde string YYYY-MM.
   * Lanza Error si el formato no es válido.
   */
  static parse(s: string): MesKey {
    if (s == null || !MES_KEY_REGEX.test(String(s))) {
      throw new Error(`MesKey inválido: "${s}" no cumple el formato YYYY-MM`);
    }
    return new MesKey(s);
  }

  /**
   * Nombre legible del mes en español, ej: "mayo 2026".
   */
  label(): string {
    // Construimos una fecha en el primer día del mes (mediodía UTC)
    const [year, month] = this.value.split('-').map(Number);
    const d = new Date(Date.UTC(year, month - 1, 1, 12));
    return new Intl.DateTimeFormat('es-CO', {
      month: 'long',
      year: 'numeric',
      timeZone: ZONA_BOGOTA,
    }).format(d);
  }

  equals(other: MesKey): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }
}
