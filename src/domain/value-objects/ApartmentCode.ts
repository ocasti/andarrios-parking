/**
 * Value Object: ApartmentCode
 * Apartment code with format T01-101 (Tower-FloorUnit).
 * Immutable, validated on construction.
 */
const APTO_COD_REGEX = /^T\d{2}-\d{3}$/;

export class ApartmentCode {
  readonly value: string;

  private constructor(value: string) {
    this.value = value;
  }

  /**
   * Parses and validates the T01-101 format.
   * Throws Error if the format is invalid.
   */
  static parse(cod: string): ApartmentCode {
    if (cod == null || !APTO_COD_REGEX.test(String(cod))) {
      throw new Error(`invalid ApartmentCode: "${cod}" does not match format T##-###`);
    }
    return new ApartmentCode(cod);
  }

  /**
   * Builds an ApartmentCode from its numeric parts.
   * Logic: T${tower.padStart(2,'0')}-${floor}0${unit}
   */
  static fromParts(tower: number, floor: number, unit: number): ApartmentCode {
    const cod = `T${String(tower).padStart(2, '0')}-${floor}0${unit}`;
    return ApartmentCode.parse(cod);
  }

  /** Tower number (e.g. "T05" → 5) */
  get tower(): number {
    return parseInt(this.value.slice(1, 3), 10);
  }

  /** Floor number (first digit of the part after the hyphen) */
  get floor(): number {
    return parseInt(this.value[4], 10);
  }

  /** Unit number (last digit of the part after the hyphen) */
  get unit(): number {
    return parseInt(this.value[6], 10);
  }

  equals(other: ApartmentCode): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }
}
