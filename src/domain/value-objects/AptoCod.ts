/**
 * Value Object: AptoCod
 * Código de apartamento con formato T01-101 (Torre-PisoApto).
 * Inmutable, se valida en construcción.
 */
const APTO_COD_REGEX = /^T\d{2}-\d{3}$/;

export class AptoCod {
  readonly value: string;

  private constructor(value: string) {
    this.value = value;
  }

  /**
   * Parsea y valida el formato T01-101.
   * Lanza Error si el formato es inválido.
   */
  static parse(cod: string): AptoCod {
    if (cod == null || !APTO_COD_REGEX.test(String(cod))) {
      throw new Error(`AptoCod inválido: "${cod}" no cumple el formato T##-###`);
    }
    return new AptoCod(cod);
  }

  /**
   * Construye un AptoCod desde sus partes numéricas.
   * Lógica: T${torre.padStart(2,'0')}-${piso}0${apto}
   */
  static fromParts(torre: number, piso: number, apto: number): AptoCod {
    const cod = `T${String(torre).padStart(2, '0')}-${piso}0${apto}`;
    return AptoCod.parse(cod);
  }

  /** Número de torre (e.g. "T05" → 5) */
  get torre(): number {
    return parseInt(this.value.slice(1, 3), 10);
  }

  /** Número de piso (primer dígito de la parte tras el guión) */
  get piso(): number {
    return parseInt(this.value[4], 10);
  }

  /** Número de apartamento (último dígito de la parte tras el guión) */
  get apto(): number {
    return parseInt(this.value[6], 10);
  }

  equals(other: AptoCod): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }
}
