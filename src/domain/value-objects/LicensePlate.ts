/**
 * Value Object: LicensePlate
 * Represents a Colombian vehicle license plate.
 * Immutable, validated on construction.
 */
export class LicensePlate {
  readonly value: string;

  private constructor(value: string) {
    this.value = value;
  }

  /**
   * Parses and normalizes a plate: converts to uppercase and removes spaces.
   * Throws Error if the resulting plate is empty or input is null/undefined.
   */
  static parse(raw: string): LicensePlate {
    if (raw == null) {
      throw new Error('invalid LicensePlate: value cannot be null or undefined');
    }
    const normalized = String(raw).replace(/\s/g, '').toUpperCase();
    if (normalized.length === 0) {
      throw new Error('invalid LicensePlate: value cannot be empty');
    }
    return new LicensePlate(normalized);
  }

  equals(other: LicensePlate): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }
}
