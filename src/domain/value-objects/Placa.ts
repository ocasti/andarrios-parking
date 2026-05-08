/**
 * Value Object: Placa
 * Representa la placa de un vehículo colombiano.
 * Inmutable, se valida en construcción.
 */
export class Placa {
  readonly value: string;

  private constructor(value: string) {
    this.value = value;
  }

  /**
   * Parsea y normaliza una placa: convierte a mayúsculas y elimina espacios.
   * Lanza Error si la placa resultante está vacía o el input es null/undefined.
   */
  static parse(raw: string): Placa {
    if (raw == null) {
      throw new Error('Placa inválida: el valor no puede ser nulo o indefinido');
    }
    const normalized = String(raw).replace(/\s/g, '').toUpperCase();
    if (normalized.length === 0) {
      throw new Error('Placa inválida: el valor no puede estar vacío');
    }
    return new Placa(normalized);
  }

  equals(other: Placa): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }
}
