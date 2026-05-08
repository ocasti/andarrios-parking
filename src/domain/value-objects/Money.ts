/**
 * Value Object: Money
 * Amount in Colombian pesos (COP). Always an integer, no decimals.
 * Immutable, validated on construction.
 */
export class Money {
  private readonly _amount: number;

  private constructor(amount: number) {
    this._amount = Math.round(amount);
  }

  /**
   * Creates an amount from a number.
   * Throws Error if the value is negative or NaN.
   */
  static of(amount: number): Money {
    if (isNaN(amount)) {
      throw new Error('invalid Money: amount cannot be NaN');
    }
    if (amount < 0) {
      throw new Error(`invalid Money: amount cannot be negative (${amount})`);
    }
    return new Money(amount);
  }

  /** Zero amount. */
  static zero(): Money {
    return new Money(0);
  }

  /** Amount as an integer (decimals already rounded on construction). */
  get amount(): number {
    return this._amount;
  }

  /** Adds two amounts and returns a new one. */
  add(other: Money): Money {
    return new Money(this._amount + other._amount);
  }

  /**
   * Multiplies the amount by a factor.
   * Throws Error if the factor is negative.
   */
  multiply(factor: number): Money {
    if (factor < 0) {
      throw new Error(`invalid factor: cannot be negative (${factor})`);
    }
    return new Money(Math.round(this._amount * factor));
  }

  /**
   * Subtracts another amount.
   * Throws Error if the result would be negative.
   */
  subtract(other: Money): Money {
    const result = this._amount - other._amount;
    if (result < 0) {
      throw new Error(
        `negative result: cannot subtract ${other._amount} from ${this._amount}`,
      );
    }
    return new Money(result);
  }

  /**
   * Formats the amount as Colombian currency, e.g.: "$1.500".
   */
  format(): string {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(this._amount);
  }

  equals(other: Money): boolean {
    return this._amount === other._amount;
  }

  isZero(): boolean {
    return this._amount === 0;
  }
}
