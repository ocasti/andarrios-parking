/**
 * Value Object: Money
 * Monto en pesos colombianos (COP). Siempre entero, sin decimales.
 * Inmutable, se valida en construcción.
 */
export class Money {
  private readonly _amount: number;

  private constructor(amount: number) {
    this._amount = Math.round(amount);
  }

  /**
   * Crea un monto a partir de un número.
   * Lanza Error si el valor es negativo o NaN.
   */
  static of(amount: number): Money {
    if (isNaN(amount)) {
      throw new Error('Money inválido: el monto no puede ser NaN');
    }
    if (amount < 0) {
      throw new Error(`Money inválido: el monto no puede ser negativo (${amount})`);
    }
    return new Money(amount);
  }

  /** Monto de cero pesos. */
  static zero(): Money {
    return new Money(0);
  }

  /** Monto como entero (decimales ya redondeados en construcción). */
  get amount(): number {
    return this._amount;
  }

  /** Suma dos montos y retorna uno nuevo. */
  add(other: Money): Money {
    return new Money(this._amount + other._amount);
  }

  /**
   * Multiplica el monto por un factor.
   * Lanza Error si el factor es negativo.
   */
  multiply(factor: number): Money {
    if (factor < 0) {
      throw new Error(`factor inválido: no puede ser negativo (${factor})`);
    }
    return new Money(Math.round(this._amount * factor));
  }

  /**
   * Resta otro monto.
   * Lanza Error si el resultado sería negativo.
   */
  subtract(other: Money): Money {
    const result = this._amount - other._amount;
    if (result < 0) {
      throw new Error(
        `resultado negativo: no se puede restar ${other._amount} de ${this._amount}`,
      );
    }
    return new Money(result);
  }

  /**
   * Formatea el monto como moneda colombiana, ej: "$1.500".
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
